import { SimplexNoise } from './simplexNoise';
import type { HeroData, DebugParams } from './types';
import type { AtlasInfo } from './glyphAtlas';
import { getGlyphUV } from './glyphAtlas';
import { getRandomSwap, getAdjacentSwap } from './glyphDensity';

export interface AnimationEngine {
  update(
    dt: number,
    time: number,
    params: DebugParams,
    mouseX: number,
    mouseY: number,
    uvRectBuf: Float32Array,
    colorBuf: Float32Array,
    animStateBuf: Float32Array,
    atlas: AtlasInfo
  ): void;
}

// ============= Event Types =============
const EVENT_NONE = -1;
const EVENT_GLITCH_RIPPLE = 0;
const EVENT_IRIS_SHIMMER = 1;
const EVENT_FLOWER_BLOOM = 2;
const EVENT_LIGHT_WAVE = 3;

interface ActiveEvent {
  type: number;
  progress: number;    // 0-1
  duration: number;    // seconds
  centerX: number;     // normalized 0-1
  centerY: number;
  angle: number;       // for light wave direction
}

export function createAnimationEngine(heroData: HeroData): AnimationEngine {
  const N = heroData.glyphCount;

  // ====== Per-glyph state (allocated once) ======
  const personality    = new Uint8Array(N);
  const phase          = new Float32Array(N);
  const timer          = new Float32Array(N);
  const currentGlyph   = new Uint8Array(N);
  const baseGlyph      = new Uint8Array(N);
  const targetGlyph    = new Uint8Array(N);
  const baseDensity    = new Uint8Array(N);
  const morphProgress  = new Float32Array(N);
  const opacityOff     = new Float32Array(N);
  const brightnessOff  = new Float32Array(N);
  const glowAmt        = new Float32Array(N);
  const blurAmt        = new Float32Array(N);
  const baseColor      = new Float32Array(N * 4);
  const xNorms         = new Float32Array(N);
  const yNorms         = new Float32Array(N);
  const baseSaturation = new Uint8Array(N);

  const noise = new SimplexNoise(42);

  // ====== Pre-compute normalized positions and initialize state ======
  const sw = heroData.sourceWidth;
  const sh = heroData.sourceHeight;
  const centerX = 0.5;
  const centerY = 0.5;

  for (let i = 0; i < N; i++) {
    const g = heroData.glyphs[i];
    const xn = g.x / sw;
    const yn = g.y / sh;
    xNorms[i] = xn;
    yNorms[i] = yn;

    baseGlyph[i]     = g.glyphIndex;
    currentGlyph[i]  = g.glyphIndex;
    targetGlyph[i]   = g.glyphIndex;
    baseDensity[i]   = g.densityGroup;
    baseSaturation[i] = g.saturation;

    baseColor[i*4]     = g.r / 255;
    baseColor[i*4 + 1] = g.g / 255;
    baseColor[i*4 + 2] = g.b / 255;
    baseColor[i*4 + 3] = g.alpha / 255;

    phase[i] = Math.random() * Math.PI * 2;
    timer[i] = Math.random() * 15 + 5; // 5-20s initial stagger

    // Assign personality
    const dx = xn - centerX;
    const dy = yn - centerY;
    const dist = Math.sqrt(dx*dx + dy*dy);

    if (g.saturation > 140 || (dist < 0.18 && g.brightness > 30)) {
      personality[i] = 1; // organic (flowers + iris area)
    } else {
      personality[i] = 0; // ambient
    }
  }

  // ====== Global event state ======
  let globalEventTimer = Math.random() * 4 + 3;
  let activeEvent: ActiveEvent = { type: EVENT_NONE, progress: 0, duration: 0, centerX: 0.5, centerY: 0.5, angle: 0 };

  // ====== Easing helpers ======
  function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
  }

  function smoothPulse(t: number): number {
    // 0 → 1 → 0 over t: 0..0.5..1
    return Math.sin(t * Math.PI);
  }

  // ====== lerp with clamped dt ======
  function lerpTo(current: number, target: number, dt: number, speed: number): number {
    return current + (target - current) * Math.min(dt * speed, 1);
  }

  function update(
    dt: number,
    time: number,
    params: DebugParams,
    mouseX: number,
    mouseY: number,
    uvRectBuf: Float32Array,
    colorBuf: Float32Array,
    animStateBuf: Float32Array,
    atlas: AtlasInfo
  ): void {
    const t = time * params.animationSpeed;
    const animDensity = params.animationDensity;
    const nScale = params.noiseScale;

    // ====== Global Event Logic ======
    globalEventTimer -= dt * params.animationSpeed;

    if (activeEvent.type !== EVENT_NONE) {
      activeEvent.progress += dt / activeEvent.duration;
      if (activeEvent.progress >= 1) {
        activeEvent.type = EVENT_NONE;
        activeEvent.progress = 0;
      }
    }

    if (globalEventTimer <= 0 && activeEvent.type === EVENT_NONE && params.eventFrequency > 0.001) {
      // Fire a new event
      const evType = Math.floor(Math.random() * 4);
      const durations = [0.15, 0.25, 0.2, 0.3];
      activeEvent = {
        type: evType,
        progress: 0,
        duration: durations[evType],
        centerX: 0.3 + Math.random() * 0.4,
        centerY: 0.3 + Math.random() * 0.4,
        angle: Math.random() * Math.PI * 2,
      };
      globalEventTimer = (1.0 / Math.max(params.eventFrequency, 0.01)) * (0.5 + Math.random());
    }

    // ====== Per-Glyph Update ======
    for (let i = 0; i < N; i++) {
      const xn = xNorms[i];
      const yn = yNorms[i];
      const p = personality[i];
      const ph = phase[i];

      timer[i] -= dt * params.animationSpeed;

      // Target values (we'll lerp toward these)
      let oTarget = 0;
      let bTarget = 0;
      let gTarget = 0;
      let blTarget = 0;

      // ====== Personality: AMBIENT (95%) ======
      if (p === 0) {
        const noiseVal = noise.noise3D(xn * nScale * 3, yn * nScale * 3, t * 0.08);
        const isActive = noiseVal > (1.0 - animDensity * 2);

        if (isActive) {
          // Tiny opacity wobble
          oTarget = Math.sin(t * 0.25 + ph) * 0.02 * params.ambientRate;
          // Subtle brightness shift via noise
          bTarget = noise.noise2D(xn * 8 + t * 0.3, yn * 8) * 0.03 * params.ambientRate;

          // Glyph mutation
          if (timer[i] <= 0) {
            targetGlyph[i] = getRandomSwap(baseDensity[i], currentGlyph[i]);
            morphProgress[i] = 0;
            timer[i] = 8 + Math.random() * 12; // 8-20s
          }
        }
      }
      // ====== Personality: ORGANIC (3%) ======
      else if (p === 1) {
        // Continuous gentle brightness wave
        bTarget = Math.sin(t * 0.4 + ph * 2) * 0.05 * params.organicRate * 10;

        // Occasional shimmer (brief brightness spike)
        if (timer[i] <= 0) {
          bTarget += 0.12;
          gTarget = 0.15;
          blTarget = 0.2;
          timer[i] = 3 + Math.random() * 5;
        }

        // Slower glyph mutation for organic glyphs
        const morphNoise = noise.noise3D(xn * 5, yn * 5, t * 0.05);
        if (morphNoise > 0.7 && morphProgress[i] >= 1.0) {
          targetGlyph[i] = getAdjacentSwap(baseDensity[i], currentGlyph[i]);
          morphProgress[i] = 0;
        }
      }

      // ====== Event Effects ======
      if (activeEvent.type !== EVENT_NONE) {
        const ep = activeEvent.progress;
        const pulse = smoothPulse(ep);
        const edx = xn - activeEvent.centerX;
        const edy = yn - activeEvent.centerY;
        const edist = Math.sqrt(edx*edx + edy*edy);

        switch (activeEvent.type) {
          case EVENT_GLITCH_RIPPLE: {
            // Horizontal band of glyphs near centerY
            if (Math.abs(yn - activeEvent.centerY) < 0.03 && Math.abs(xn - activeEvent.centerX) < 0.15) {
              bTarget += 0.15 * pulse;
              gTarget = Math.max(gTarget, 0.3 * pulse);
              if (ep < 0.5 && morphProgress[i] >= 1.0) {
                targetGlyph[i] = getRandomSwap(baseDensity[i], currentGlyph[i]);
                morphProgress[i] = 0;
              }
            }
            break;
          }
          case EVENT_IRIS_SHIMMER: {
            // Concentric ring around center
            const ringDist = Math.abs(edist - 0.08 - ep * 0.12);
            if (ringDist < 0.025) {
              const ringStrength = (1 - ringDist / 0.025) * pulse;
              bTarget += 0.2 * ringStrength;
              gTarget = Math.max(gTarget, 0.25 * ringStrength);
            }
            break;
          }
          case EVENT_FLOWER_BLOOM: {
            // Only affects high-saturation glyphs near event center
            if (baseSaturation[i] > 100 && edist < 0.2) {
              const strength = (1 - edist / 0.2) * pulse;
              bTarget += 0.15 * strength;
              gTarget = Math.max(gTarget, 0.2 * strength);
            }
            break;
          }
          case EVENT_LIGHT_WAVE: {
            // Diagonal gradient sweep
            const proj = Math.cos(activeEvent.angle) * xn + Math.sin(activeEvent.angle) * yn;
            const waveFront = ep * 1.5 - 0.25;
            const wDist = Math.abs(proj - waveFront);
            if (wDist < 0.08) {
              const strength = (1 - wDist / 0.08) * pulse * 0.5;
              bTarget += 0.1 * strength;
              gTarget = Math.max(gTarget, 0.1 * strength);
            }
            break;
          }
        }
      }

      // ====== Mouse Proximity ======
      if (mouseX >= 0 && mouseY >= 0) {
        const mdx = xn - mouseX;
        const mdy = yn - mouseY;
        const mDistSq = mdx*mdx + mdy*mdy;
        if (mDistSq < 0.015) {
          const proximity = 1 - mDistSq / 0.015;
          bTarget += 0.08 * proximity;
          gTarget = Math.max(gTarget, 0.15 * proximity);
        }
      }

      // ====== Morph Progress ======
      if (targetGlyph[i] !== currentGlyph[i] && morphProgress[i] < 1.0) {
        morphProgress[i] += dt * 6.66; // ~150ms transition
        if (morphProgress[i] >= 0.5 && currentGlyph[i] !== targetGlyph[i]) {
          // Swap glyph at midpoint (crossfade illusion)
          currentGlyph[i] = targetGlyph[i];
          const uv = getGlyphUV(atlas, currentGlyph[i]);
          uvRectBuf[i*4]     = uv[0];
          uvRectBuf[i*4 + 1] = uv[1];
          uvRectBuf[i*4 + 2] = uv[2];
          uvRectBuf[i*4 + 3] = uv[3];
        }
        if (morphProgress[i] >= 1.0) {
          morphProgress[i] = 1.0;
        }
      }
      // Restore base glyph slowly for organic glyphs
      if (p === 1 && morphProgress[i] >= 1.0 && currentGlyph[i] !== baseGlyph[i]) {
        const restoreNoise = noise.noise2D(xn * 3 + t * 0.02, yn * 3);
        if (restoreNoise > 0.6) {
          targetGlyph[i] = baseGlyph[i];
          morphProgress[i] = 0;
        }
      }

      // ====== Smooth Interpolation (temporal coherence) ======
      const lerpSpeed = 4.0;
      opacityOff[i]    = lerpTo(opacityOff[i], oTarget, dt, lerpSpeed);
      brightnessOff[i] = lerpTo(brightnessOff[i], bTarget, dt, lerpSpeed);
      glowAmt[i]       = lerpTo(glowAmt[i], gTarget, dt, lerpSpeed);
      blurAmt[i]       = lerpTo(blurAmt[i], blTarget, dt, lerpSpeed);

      // ====== Write to Buffers ======
      const idx4 = i * 4;
      const bR = baseColor[idx4];
      const bG = baseColor[idx4 + 1];
      const bB = baseColor[idx4 + 2];
      const bOff = brightnessOff[i];

      colorBuf[idx4]     = Math.min(Math.max(bR + bOff, 0), 1);
      colorBuf[idx4 + 1] = Math.min(Math.max(bG + bOff, 0), 1);
      colorBuf[idx4 + 2] = Math.min(Math.max(bB + bOff, 0), 1);
      // alpha stays as base — opacity modulation happens via animState

      animStateBuf[idx4]     = opacityOff[i];
      animStateBuf[idx4 + 1] = glowAmt[i];
      animStateBuf[idx4 + 2] = blurAmt[i];
      animStateBuf[idx4 + 3] = morphProgress[i] < 1.0 ? easeInOutCubic(morphProgress[i]) : 0;
    }
  }

  return { update };
}
