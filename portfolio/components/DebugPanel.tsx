'use client';

import React, { useEffect, useState } from 'react';
import { DebugParams, RendererStats } from '../lib/ascii/types';

interface DebugPanelProps {
  getParams: () => DebugParams;
  setParam: <K extends keyof DebugParams>(key: K, value: DebugParams[K]) => void;
  getStats: () => RendererStats;
}

export default function DebugPanel({ getParams, setParam, getStats }: DebugPanelProps) {
  const [params, setParams] = useState<DebugParams>(getParams());
  const [stats, setStats] = useState<RendererStats>({ fps: 0, frameTime: 0, glyphCount: 0, drawCalls: 0 });

  useEffect(() => {
    // Initial stats
    setStats(getStats());
    
    const timer = setInterval(() => {
      setStats(getStats());
      setParams({ ...getParams() });
    }, 500);
    return () => clearInterval(timer);
  }, [getStats, getParams]);

  const handleChange = <K extends keyof DebugParams>(key: K, value: DebugParams[K]) => {
    setParam(key, value);
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const renderSlider = (key: keyof DebugParams, label: string, min: number, max: number, step: number) => {
    const value = params[key] as number;
    return (
      <div style={styles.controlRow} key={key}>
        <div style={styles.labelRow}>
          <span>{label}</span>
          <span>{value.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => handleChange(key, parseFloat(e.target.value) as any)}
          style={styles.slider}
        />
      </div>
    );
  };

  const renderCheckbox = (key: keyof DebugParams, label: string) => {
    const value = params[key] as boolean;
    return (
      <div style={styles.controlRow} key={key}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handleChange(key, e.target.checked as any)}
            style={styles.checkbox}
          />
          {label}
        </label>
      </div>
    );
  };

  return (
    <div style={styles.panel}>
      <div style={styles.header}>Debug / Stats</div>
      <div style={styles.statsGrid}>
        <div>FPS: {Math.round(stats.fps)}</div>
        <div>Time: {stats.frameTime.toFixed(1)}ms</div>
        <div>Glyphs: {stats.glyphCount}</div>
        <div>Draws: {stats.drawCalls}</div>
      </div>
      <div style={styles.controls}>
        {renderSlider('animationDensity', 'Anim Density', 0, 1, 0.01)}
        {renderSlider('ambientRate', 'Ambient Rate', 0, 1, 0.01)}
        {renderSlider('organicRate', 'Organic Rate', 0, 0.2, 0.001)}
        {renderSlider('eventFrequency', 'Event Freq', 0, 0.5, 0.01)}
        {renderSlider('glowIntensity', 'Glow Intensity', 0, 1, 0.01)}
        {renderSlider('brightness', 'Brightness', 0.5, 2.0, 0.05)}
        {renderSlider('contrast', 'Contrast', 0.5, 2.0, 0.05)}
        {renderSlider('gamma', 'Gamma', 0.5, 3.0, 0.05)}
        {renderSlider('cellSizeMultiplier', 'Cell Size', 0.5, 2.0, 0.05)}
        {renderSlider('animationSpeed', 'Anim Speed', 0, 3.0, 0.05)}
        {renderSlider('noiseScale', 'Noise Scale', 0.1, 5.0, 0.1)}
        {renderSlider('bloomRadius', 'Bloom Radius', 0, 10, 0.1)}
        {renderSlider('globalOpacity', 'Opacity', 0, 1, 0.01)}
        {renderCheckbox('paused', 'Paused')}
        {renderCheckbox('wireframe', 'Wireframe')}
        {renderCheckbox('heatmap', 'Heatmap')}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: 'fixed',
    top: '16px',
    right: '16px',
    width: '320px',
    maxHeight: 'calc(100vh - 32px)',
    backgroundColor: 'rgba(13, 15, 20, 0.92)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '16px',
    color: '#e2e8f0',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    zIndex: 9999,
    overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.25)',
  },
  header: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#ffffff',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: '8px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: '8px',
    borderRadius: '6px',
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  controlRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#94a3b8',
  },
  slider: {
    width: '100%',
    cursor: 'pointer',
    accentColor: '#3b82f6',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    color: '#94a3b8',
  },
  checkbox: {
    cursor: 'pointer',
    accentColor: '#3b82f6',
  }
};
