'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createRenderer } from '../lib/ascii/webglRenderer';
import { parseHeroData, GlyphRendererAPI } from '../lib/ascii/types';
import DebugPanel from './DebugPanel';

export default function GlyphHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderer, setRenderer] = useState<GlyphRendererAPI | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setShowDebug(urlParams.get('debug') === 'true');
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    let isDestroyed = false;
    let newRenderer: GlyphRendererAPI | null = null;
    
    try {
      newRenderer = createRenderer();
      setRenderer(newRenderer);
    } catch (err) {
      console.error("WebGL Renderer creation failed:", err);
      return;
    }

    fetch('/artwork/hero-data.bin')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.arrayBuffer();
      })
      .then(buffer => {
        if (isDestroyed || !newRenderer) return;
        const heroData = parseHeroData(buffer);
        return newRenderer.init(canvas, heroData);
      })
      .then(() => {
        if (isDestroyed || !newRenderer) return;
        if (prefersReducedMotion) {
          newRenderer.setDebugParam('paused', true);
        }
      })
      .catch(err => {
        console.error("Failed to initialize GlyphRenderer:", err);
      });

    return () => {
      isDestroyed = true;
      if (newRenderer) {
        newRenderer.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!renderer) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      renderer.setMouse(x, y);
    };

    const handleMouseLeave = () => {
      renderer.clearMouse();
    };

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        renderer.resize();
      }, 100);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [renderer]);

  return (
    <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
      {showDebug && renderer && (
        <DebugPanel
          getParams={() => renderer.getDebugParams()}
          setParam={(key, val) => renderer.setDebugParam(key, val)}
          getStats={() => renderer.getStats()}
        />
      )}
    </div>
  );
}
