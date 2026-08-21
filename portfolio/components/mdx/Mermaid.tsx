"use client";

import React, { useEffect, useState } from "react";
import mermaid from "mermaid";

let initialized = false;
let idCounter = 0;

function normalizeSvg(svgString: string): string {
  // Parse the SVG and strip hardcoded width/height so it scales naturally
  // Replace width="Npx" and height="Npx" on the root <svg> element only
  return svgString
    .replace(/<svg([^>]*)>/, (match, attrs) => {
      // Remove any explicit width/height that Mermaid bakes in
      const cleaned = attrs
        .replace(/\s+width="[^"]*"/g, '')
        .replace(/\s+height="[^"]*"/g, '')
        // Ensure there's a viewBox (Mermaid usually adds one)
        // Add preserveAspectRatio so scaling looks right
        + ' width="100%" height="100%" style="max-width:100%;"';
      return `<svg${cleaned}>`;
    });
}

export function Mermaid({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string>('');
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (!initialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        securityLevel: 'loose',
        themeVariables: {
          primaryColor: '#ffffff',
          primaryTextColor: '#1B231F',
          primaryBorderColor: '#1B231F',
          lineColor: '#1B231F',
          secondaryColor: '#E4E7E2',
          tertiaryColor: '#ffffff',
          clusterBkg: '#F5F7F4',
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          fontSize: '14px',
        },
      });
      initialized = true;
    }

    if (chart) {
      const renderChart = async () => {
        try {
          const id = `mermaid-chart-${idCounter++}`;
          const { svg: rawSvg } = await mermaid.render(id, chart);
          setSvg(normalizeSvg(rawSvg));
        } catch (e) {
          console.error('Mermaid render error', e);
        }
      };
      renderChart();
    }
  }, [chart]);

  if (!svg) {
    return (
      <pre className="my-10 text-xs text-charcoal-green/50 p-4 border border-mist-100 overflow-x-auto">
        {chart}
      </pre>
    );
  }

  return (
    <>
      {/* Inline preview — no extra wrapper background, just a subtle card */}
      <div
        className="not-prose my-10 border border-warm-gray-200 bg-white p-6 cursor-zoom-in hover:border-teal-700/30 transition-colors"
        onClick={() => setIsZoomed(true)}
        title="Click to zoom"
      >
        {/* The SVG fills this div naturally with width=100% */}
        <div dangerouslySetInnerHTML={{ __html: svg }} />
        <p className="text-center mt-3 font-mono text-[10px] tracking-wider text-charcoal-green/30 uppercase select-none">
          Click to expand
        </p>
      </div>

      {/* Lightbox overlay */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center cursor-zoom-out"
          style={{ backgroundColor: 'rgba(245,247,244,0.85)', backdropFilter: 'blur(12px)' }}
          onClick={() => setIsZoomed(false)}
        >
          {/* Card sized to a comfortable portion of the screen */}
          <div
            className="bg-white shadow-2xl p-8"
            style={{ width: 'min(90vw, 900px)', height: 'min(90vh, 800px)', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* SVG fills the card */}
            <div
              dangerouslySetInnerHTML={{ __html: svg }}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
            />
            <p className="text-center mt-4 font-mono text-[10px] tracking-wider text-charcoal-green/30 uppercase select-none">
              Click outside to close
            </p>
          </div>
        </div>
      )}
    </>
  );
}
