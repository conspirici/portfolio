import { GLYPH_CHARS, ATLAS_COLS, ATLAS_ROWS } from './types';

export interface AtlasInfo {
  texture: WebGLTexture;
  cellWidth: number;
  cellHeight: number;
  atlasWidth: number;
  atlasHeight: number;
  cols: number;
  rows: number;
}

export function createGlyphAtlas(gl: WebGL2RenderingContext): AtlasInfo {
  const fontSize = 40;
  let canvas: HTMLCanvasElement | OffscreenCanvas;
  let ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  if (typeof OffscreenCanvas !== 'undefined') {
    canvas = new OffscreenCanvas(1, 1);
    ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
  } else {
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  }

  const fontFamily = "'JetBrains Mono', Consolas, Menlo, 'Courier New', monospace";
  ctx.font = `${fontSize}px ${fontFamily}`;
  
  const measuredWidth = Math.ceil(ctx.measureText('M').width);
  const cellWidth = measuredWidth;
  const cellHeight = Math.ceil(fontSize * 1.2);
  
  const width = cellWidth * ATLAS_COLS;
  const height = cellHeight * ATLAS_ROWS;
  
  const atlasWidth = Math.pow(2, Math.ceil(Math.log2(width)));
  const atlasHeight = Math.pow(2, Math.ceil(Math.log2(height)));
  
  canvas.width = atlasWidth;
  canvas.height = atlasHeight;
  
  // Re-apply font after resize
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  
  ctx.clearRect(0, 0, atlasWidth, atlasHeight);
  ctx.fillStyle = '#FFFFFF';
  
  for (let i = 0; i < GLYPH_CHARS.length; i++) {
    const char = GLYPH_CHARS[i];
    const col = i % ATLAS_COLS;
    const row = Math.floor(i / ATLAS_COLS);
    
    const x = col * cellWidth + cellWidth / 2;
    const y = row * cellHeight + cellHeight / 2;
    
    ctx.fillText(char, x, y);
  }
  
  const texture = gl.createTexture();
  if (!texture) throw new Error("Failed to create WebGL texture");
  
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas as any);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  
  return {
    texture,
    cellWidth,
    cellHeight,
    atlasWidth,
    atlasHeight,
    cols: ATLAS_COLS,
    rows: ATLAS_ROWS
  };
}

/**
 * Returns normalized UV coordinates for a given glyph index.
 * @param atlas The atlas info object.
 * @param glyphIndex The index of the glyph.
 * @returns A tuple of [u, v, uWidth, vHeight].
 */
export function getGlyphUV(atlas: AtlasInfo, glyphIndex: number): [number, number, number, number] {
  const col = glyphIndex % atlas.cols;
  const row = Math.floor(glyphIndex / atlas.cols);
  
  const uOffset = (col * atlas.cellWidth) / atlas.atlasWidth;
  const vOffset = (row * atlas.cellHeight) / atlas.atlasHeight;
  const uWidth = atlas.cellWidth / atlas.atlasWidth;
  const vHeight = atlas.cellHeight / atlas.atlasHeight;
  
  return [uOffset, vOffset, uWidth, vHeight];
}
