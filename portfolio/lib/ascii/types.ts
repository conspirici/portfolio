/**
 * Shared types, constants, and utilities for the GPU ASCII glyph renderer.
 *
 * This module is the single source of truth for:
 *  - Glyph character set and density groups
 *  - Binary data format specification
 *  - Debug parameter interface
 *  - Renderer interface contract
 *  - Data parsing utilities
 */

// ============= Glyph Character Set =============
// Characters ordered by approximate visual density (light → heavy).
// Each character's array index is its "glyphIndex" used in binary data and atlas UV lookups.
// Edge-affinity characters (|, /, \, -, =) are placed in density-appropriate positions.

export const GLYPH_CHARS: string[] = [
  ' ',       // 0:  void
  '.',       // 1:  whisper
  ',',       // 2:  whisper
  '\'',      // 3:  whisper
  '`',       // 4:  whisper
  ':',       // 5:  light
  ';',       // 6:  light
  '-',       // 7:  light — horizontal edge affinity
  '~',       // 8:  light
  '!',       // 9:  thin  — vertical edge affinity
  '|',       // 10: thin  — vertical edge affinity
  'l',       // 11: thin
  'i',       // 12: thin
  '/',       // 13: diagonal — up-right edge
  '\\',      // 14: diagonal — up-left edge
  '<',       // 15: diagonal
  '>',       // 16: diagonal
  '(',       // 17: curved
  ')',       // 18: curved
  '=',       // 19: medium — horizontal affinity
  '+',       // 20: medium — cross
  '*',       // 21: medium — radial
  '^',       // 22: medium
  'c',       // 23: medium
  'o',       // 24: medium — round
  'e',       // 25: medium
  'a',       // 26: medium
  's',       // 27: medium
  'n',       // 28: medium
  'x',       // 29: dense — cross
  '%',       // 30: dense
  'z',       // 31: dense
  '0',       // 32: heavy — round
  'O',       // 33: heavy — round
  'Q',       // 34: heavy
  'G',       // 35: heavy
  'C',       // 36: heavy
  'D',       // 37: heavy
  '#',       // 38: block
  '&',       // 39: block
  '8',       // 40: block
  'B',       // 41: block
  'W',       // 42: block
  'M',       // 43: block
  '@',       // 44: solid
];

export const GLYPH_COUNT = GLYPH_CHARS.length; // 45

// Atlas grid layout — must have >= GLYPH_COUNT cells
export const ATLAS_COLS = 8;
export const ATLAS_ROWS = 6; // 8×6 = 48 slots ≥ 45 ✓

// ============= Density Groups =============
// Each group contains glyph indices of similar visual density.
// Glyph mutations only swap within the same or ±1 adjacent group.

export interface DensityGroupDef {
  name: string;
  indices: number[];                // indices into GLYPH_CHARS
  brightnessRange: [number, number]; // maps to this brightness band (0-255)
}

export const DENSITY_GROUPS: DensityGroupDef[] = [
  { name: 'void',     indices: [0],                                    brightnessRange: [0, 8]     },
  { name: 'whisper',  indices: [1, 2, 3, 4],                          brightnessRange: [9, 35]    },
  { name: 'light',    indices: [5, 6, 7, 8],                          brightnessRange: [36, 65]   },
  { name: 'thin',     indices: [9, 10, 11, 12],                       brightnessRange: [66, 95]   },
  { name: 'diagonal', indices: [13, 14, 15, 16, 17, 18],              brightnessRange: [66, 95]   },
  { name: 'medium',   indices: [19, 20, 21, 22, 23, 24, 25, 26, 27, 28], brightnessRange: [96, 150]  },
  { name: 'dense',    indices: [29, 30, 31],                           brightnessRange: [151, 180] },
  { name: 'heavy',    indices: [32, 33, 34, 35, 36, 37],              brightnessRange: [181, 215] },
  { name: 'block',    indices: [38, 39, 40, 41, 42, 43],              brightnessRange: [216, 245] },
  { name: 'solid',    indices: [44],                                   brightnessRange: [246, 255] },
];

// ============= Edge Orientation Constants =============
export const EDGE_NONE = 0;
export const EDGE_HORIZONTAL = 1;   // ~0° or ~180° → prefer '-', '=', '~'
export const EDGE_DIAGONAL_UP = 2;  // ~45°          → prefer '/', '<'
export const EDGE_VERTICAL = 3;     // ~90°          → prefer '|', '!', 'l'
export const EDGE_DIAGONAL_DN = 4;  // ~135°         → prefer '\', '>'

// ============= Animation Personality Tiers =============
export const PERSONALITY_AMBIENT = 0;  // 95% of glyphs — near-invisible micro-changes
export const PERSONALITY_ORGANIC = 1;  // 3% — gentle shimmer on flowers/iris
export const PERSONALITY_EVENT = 2;    // 2% — rare dramatic effects

// ============= Binary Format =============
export const BINARY_MAGIC = 0x474C5950; // 'GLYP' little-endian
export const BINARY_VERSION = 1;
export const HEADER_SIZE = 16;
export const GLYPH_RECORD_SIZE = 16;

// Header layout (16 bytes, all little-endian):
//   [0..3]   u32: magic (0x474C5950)
//   [4..7]   u32: glyphCount
//   [8..9]   u16: sourceWidth (pixels)
//   [10..11] u16: sourceHeight (pixels)
//   [12..13] u16: reserved (0)
//   [14..15] u16: version (1)
//
// Per-glyph record (16 bytes):
//   [0..1]  u16: x position (source image pixels)
//   [2..3]  u16: y position (source image pixels)
//   [4]     u8:  cellW (pixel width of this cell)
//   [5]     u8:  cellH (pixel height of this cell)
//   [6]     u8:  glyphIndex (into GLYPH_CHARS)
//   [7]     u8:  densityGroup (0-9)
//   [8]     u8:  red   (0-255)
//   [9]     u8:  green (0-255)
//   [10]    u8:  blue  (0-255)
//   [11]    u8:  brightness (perceived luminance 0-255)
//   [12]    u8:  alpha (0-255)
//   [13]    u8:  edgeMagnitude (0-255)
//   [14]    u8:  edgeAngle (0-255, maps to 0-180°)
//   [15]    u8:  saturation (0-255)

// ============= Data Interfaces =============

/** Per-glyph data as parsed from the binary file */
export interface GlyphRecord {
  x: number;
  y: number;
  cellW: number;
  cellH: number;
  glyphIndex: number;
  densityGroup: number;
  r: number;
  g: number;
  b: number;
  brightness: number;
  alpha: number;
  edgeMagnitude: number;
  edgeAngle: number;
  saturation: number;
}

/** Complete parsed hero data */
export interface HeroData {
  glyphCount: number;
  sourceWidth: number;
  sourceHeight: number;
  glyphs: GlyphRecord[];
}

// ============= Debug Parameters =============

export interface DebugParams {
  animationDensity: number;   // 0–1      fraction of glyphs animating
  ambientRate: number;        // 0–1      ambient mutation frequency
  organicRate: number;        // 0–0.2    organic shimmer frequency
  eventFrequency: number;     // 0–0.5    rare event frequency
  glowIntensity: number;      // 0–1      glow/bloom brightness
  brightness: number;         // 0.5–2.0  global brightness multiplier
  contrast: number;           // 0.5–2.0  global contrast multiplier
  gamma: number;              // 0.5–3.0  gamma correction
  cellSizeMultiplier: number; // 0.5–2.0  scales all cell sizes
  animationSpeed: number;     // 0–3.0    time multiplier for animations
  noiseScale: number;         // 0.1–5.0  simplex noise frequency
  bloomRadius: number;        // 0–10     bloom blur radius
  globalOpacity: number;      // 0–1      master opacity
  paused: boolean;
  wireframe: boolean;         // show cell boundaries
  heatmap: boolean;           // show detail/density heatmap
}

export function defaultDebugParams(): DebugParams {
  return {
    animationDensity: 0.10,
    ambientRate: 0.08,
    organicRate: 0.03,
    eventFrequency: 0.02,
    glowIntensity: 0.15,
    brightness: 1.0,
    contrast: 1.0,
    gamma: 1.0,
    cellSizeMultiplier: 1.35,
    animationSpeed: 1.0,
    noiseScale: 1.0,
    bloomRadius: 2.0,
    globalOpacity: 1.0,
    paused: false,
    wireframe: false,
    heatmap: false,
  };
}

// ============= Renderer Interface =============

export interface RendererStats {
  fps: number;
  frameTime: number;
  glyphCount: number;
  drawCalls: number;
}

/** Public API surface for the WebGL glyph renderer */
export interface GlyphRendererAPI {
  init(canvas: HTMLCanvasElement, data: HeroData): Promise<void>;
  resize(): void;
  setMouse(x: number, y: number): void;
  clearMouse(): void;
  getDebugParams(): DebugParams;
  setDebugParam<K extends keyof DebugParams>(key: K, value: DebugParams[K]): void;
  getStats(): RendererStats;
  destroy(): void;
}

// ============= Parsing Utility =============

/** Parse a hero-data.bin ArrayBuffer into structured HeroData */
export function parseHeroData(buffer: ArrayBuffer): HeroData {
  const view = new DataView(buffer);

  const magic = view.getUint32(0, true);
  if (magic !== BINARY_MAGIC) {
    throw new Error(
      `Invalid hero data: expected magic 0x${BINARY_MAGIC.toString(16)}, got 0x${magic.toString(16)}`
    );
  }

  const glyphCount = view.getUint32(4, true);
  const sourceWidth = view.getUint16(8, true);
  const sourceHeight = view.getUint16(10, true);

  const glyphs: GlyphRecord[] = new Array(glyphCount);
  for (let i = 0; i < glyphCount; i++) {
    const o = HEADER_SIZE + i * GLYPH_RECORD_SIZE;
    glyphs[i] = {
      x:              view.getUint16(o, true),
      y:              view.getUint16(o + 2, true),
      cellW:          view.getUint8(o + 4),
      cellH:          view.getUint8(o + 5),
      glyphIndex:     view.getUint8(o + 6),
      densityGroup:   view.getUint8(o + 7),
      r:              view.getUint8(o + 8),
      g:              view.getUint8(o + 9),
      b:              view.getUint8(o + 10),
      brightness:     view.getUint8(o + 11),
      alpha:          view.getUint8(o + 12),
      edgeMagnitude:  view.getUint8(o + 13),
      edgeAngle:      view.getUint8(o + 14),
      saturation:     view.getUint8(o + 15),
    };
  }

  return { glyphCount, sourceWidth, sourceHeight, glyphs };
}
