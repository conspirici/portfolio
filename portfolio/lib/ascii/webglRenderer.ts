import { VERTEX_SHADER, FRAGMENT_SHADER } from './shaders';
import { createGlyphAtlas, getGlyphUV, AtlasInfo } from './glyphAtlas';
import { createAnimationEngine, AnimationEngine } from './animationEngine';
import { HeroData, DebugParams, GlyphRendererAPI, defaultDebugParams, RendererStats } from './types';

function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Failed to create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compilation error: ${info}`);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram {
  const program = gl.createProgram();
  if (!program) throw new Error("Failed to create program");
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program linking error: ${info}`);
  }
  return program;
}

export function createRenderer(): GlyphRendererAPI {
  let gl: WebGL2RenderingContext;
  let canvas: HTMLCanvasElement;
  let atlas: AtlasInfo;
  let program: WebGLProgram;
  let animEngine: AnimationEngine;
  
  let glyphCount = 0;
  
  let positionBufData: Float32Array;
  let sizeBufData: Float32Array;
  let uvRectBufData: Float32Array;
  let colorBufData: Float32Array;
  let animStateBufData: Float32Array;
  
  let positionBuffer: WebGLBuffer;
  let sizeBuffer: WebGLBuffer;
  let uvRectBuffer: WebGLBuffer;
  let colorBuffer: WebGLBuffer;
  let animStateBuffer: WebGLBuffer;
  
  let debugParams = defaultDebugParams();
  let stats: RendererStats = { fps: 0, frameTime: 0, glyphCount: 0, drawCalls: 0 };
  
  let mouseX = -1;
  let mouseY = -1;
  let rafId = 0;
  let lastTime = 0;
  let destroyed = false;
  let sourceW = 0;
  let sourceH = 0;
  
  let uResolutionLoc: WebGLUniformLocation | null;
  let uImageResolutionLoc: WebGLUniformLocation | null;
  let uCellSizeMultiplierLoc: WebGLUniformLocation | null;
  let uBrightnessLoc: WebGLUniformLocation | null;
  let uContrastLoc: WebGLUniformLocation | null;
  let uGammaLoc: WebGLUniformLocation | null;
  let uBloomRadiusLoc: WebGLUniformLocation | null;
  let uGlobalOpacityLoc: WebGLUniformLocation | null;
  let uAtlasSizeLoc: WebGLUniformLocation | null;

  async function init(c: HTMLCanvasElement, heroData: HeroData): Promise<void> {
    canvas = c;
    const context = canvas.getContext('webgl2', { antialias: false, alpha: true, premultipliedAlpha: true });
    if (!context) throw new Error("WebGL2 not supported");
    gl = context;

    atlas = createGlyphAtlas(gl);
    glyphCount = heroData.glyphCount;
    stats.glyphCount = glyphCount;
    sourceW = heroData.sourceWidth;
    sourceH = heroData.sourceHeight;

    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    program = createProgram(gl, vs, fs);
    gl.useProgram(program);

    uResolutionLoc = gl.getUniformLocation(program, "u_resolution");
    uImageResolutionLoc = gl.getUniformLocation(program, "u_imageResolution");
    uCellSizeMultiplierLoc = gl.getUniformLocation(program, "u_cellSizeMultiplier");
    uBrightnessLoc = gl.getUniformLocation(program, "u_brightness");
    uContrastLoc = gl.getUniformLocation(program, "u_contrast");
    uGammaLoc = gl.getUniformLocation(program, "u_gamma");
    uBloomRadiusLoc = gl.getUniformLocation(program, "u_bloomRadius");
    uGlobalOpacityLoc = gl.getUniformLocation(program, "u_globalOpacity");
    uAtlasSizeLoc = gl.getUniformLocation(program, "u_atlasSize");
    
    const quadVerts = new Float32Array([0,0, 1,0, 0,1, 1,1]);
    const quadIndices = new Uint16Array([0,1,2, 2,1,3]);
    
    const quadVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVbo);
    gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);
    
    const quadIbo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadIbo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, quadIndices, gl.STATIC_DRAW);

    positionBufData = new Float32Array(glyphCount * 2);
    sizeBufData = new Float32Array(glyphCount * 2);
    uvRectBufData = new Float32Array(glyphCount * 4);
    colorBufData = new Float32Array(glyphCount * 4);
    animStateBufData = new Float32Array(glyphCount * 4);

    for (let i = 0; i < glyphCount; i++) {
      const g = heroData.glyphs[i];
      positionBufData[i*2 + 0] = g.x / heroData.sourceWidth;
      positionBufData[i*2 + 1] = g.y / heroData.sourceHeight;
      sizeBufData[i*2 + 0] = g.cellW / heroData.sourceWidth;
      sizeBufData[i*2 + 1] = g.cellH / heroData.sourceHeight;
      
      const uv = getGlyphUV(atlas, g.glyphIndex);
      uvRectBufData[i*4 + 0] = uv[0];
      uvRectBufData[i*4 + 1] = uv[1];
      uvRectBufData[i*4 + 2] = uv[2];
      uvRectBufData[i*4 + 3] = uv[3];
      
      colorBufData[i*4 + 0] = g.r / 255.0;
      colorBufData[i*4 + 1] = g.g / 255.0;
      colorBufData[i*4 + 2] = g.b / 255.0;
      colorBufData[i*4 + 3] = g.alpha / 255.0;
      
      animStateBufData[i*4 + 0] = 0;
      animStateBufData[i*4 + 1] = 0;
      animStateBufData[i*4 + 2] = 0;
      animStateBufData[i*4 + 3] = 0;
    }

    const aQuadVertex = gl.getAttribLocation(program, "a_quadVertex");
    const aPosition = gl.getAttribLocation(program, "a_position");
    const aSize = gl.getAttribLocation(program, "a_size");
    const aUvRect = gl.getAttribLocation(program, "a_uvRect");
    const aColor = gl.getAttribLocation(program, "a_color");
    const aAnimState = gl.getAttribLocation(program, "a_animState");

    gl.bindBuffer(gl.ARRAY_BUFFER, quadVbo);
    gl.enableVertexAttribArray(aQuadVertex);
    gl.vertexAttribPointer(aQuadVertex, 2, gl.FLOAT, false, 0, 0);

    positionBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positionBufData, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(aPosition, 1);

    sizeBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizeBufData, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aSize);
    gl.vertexAttribPointer(aSize, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(aSize, 1);

    uvRectBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, uvRectBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uvRectBufData, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(aUvRect);
    gl.vertexAttribPointer(aUvRect, 4, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(aUvRect, 1);

    colorBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colorBufData, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(aColor);
    gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(aColor, 1);

    animStateBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, animStateBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, animStateBufData, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(aAnimState);
    gl.vertexAttribPointer(aAnimState, 4, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(aAnimState, 1);

    animEngine = createAnimationEngine(heroData);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); 

    resize();
    lastTime = performance.now();
    rafId = requestAnimationFrame(render);
  }

  function resize(): void {
    if (!canvas || !gl) return;
    const width = canvas.clientWidth * window.devicePixelRatio;
    const height = canvas.clientHeight * window.devicePixelRatio;
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
    if (program && uResolutionLoc && uImageResolutionLoc) {
      gl.useProgram(program);
      gl.uniform2f(uResolutionLoc, width, height);
      gl.uniform2f(uImageResolutionLoc, sourceW, sourceH);
    }
  }

  function setMouse(x: number, y: number): void {
    mouseX = x;
    mouseY = y;
  }

  function clearMouse(): void {
    mouseX = -1;
    mouseY = -1;
  }

  function getDebugParams(): DebugParams {
    return debugParams;
  }

  function setDebugParam<K extends keyof DebugParams>(key: K, value: DebugParams[K]): void {
    debugParams[key] = value;
  }

  function getStats(): RendererStats {
    return stats;
  }

  function destroy(): void {
    destroyed = true;
    cancelAnimationFrame(rafId);
    if (gl) {
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(sizeBuffer);
      gl.deleteBuffer(uvRectBuffer);
      gl.deleteBuffer(colorBuffer);
      gl.deleteBuffer(animStateBuffer);
      gl.deleteProgram(program);
      gl.deleteTexture(atlas.texture);
    }
  }

  function render(time: number): void {
    if (destroyed) return;
    rafId = requestAnimationFrame(render);
    
    const dt = Math.min((time - lastTime) / 1000.0, 0.1);
    lastTime = time;
    
    if (!debugParams.paused) {
      animEngine.update(
        dt, 
        time / 1000.0, 
        debugParams, 
        mouseX, 
        mouseY, 
        uvRectBufData, 
        colorBufData, 
        animStateBufData,
        atlas
      );
      
      gl.bindBuffer(gl.ARRAY_BUFFER, uvRectBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, uvRectBufData);
      
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, colorBufData);
      
      gl.bindBuffer(gl.ARRAY_BUFFER, animStateBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, animStateBufData);
    }
    
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.useProgram(program);
    
    gl.uniform1f(uCellSizeMultiplierLoc, debugParams.cellSizeMultiplier);
    gl.uniform1f(uBrightnessLoc, debugParams.brightness);
    gl.uniform1f(uContrastLoc, debugParams.contrast);
    gl.uniform1f(uGammaLoc, debugParams.gamma);
    gl.uniform1f(uBloomRadiusLoc, debugParams.bloomRadius);
    gl.uniform1f(uGlobalOpacityLoc, debugParams.globalOpacity);
    gl.uniform2f(uAtlasSizeLoc, atlas.atlasWidth, atlas.atlasHeight);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, atlas.texture);
    gl.uniform1i(gl.getUniformLocation(program, "u_atlas"), 0);
    
    gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, glyphCount);
    
    stats.drawCalls = 1;
    stats.fps = 1.0 / dt;
    stats.frameTime = dt * 1000.0;
  }

  return {
    init,
    resize,
    setMouse,
    clearMouse,
    getDebugParams,
    setDebugParam,
    getStats,
    destroy
  };
}
