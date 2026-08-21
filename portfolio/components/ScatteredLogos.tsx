"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

// 25 predefined positions, evenly distributed across 5 safe zones.
//
// EXCLUSION ZONES (no logos allowed):
//   - Text block: left 0–44%, top 0–54%  (headline, paragraph, button)
//   - Portrait:   left 28–68%, top 15–100% (center image)
//
// SAFE ZONES (5 logos each):
//   A: Top-right strip  — left 48–96%, top 2–13%   (above portrait, right of text)
//   B: Right upper       — left 72–96%, top 18–42%  (right of portrait)
//   C: Right lower       — left 72–96%, top 50–92%  (right of portrait)
//   D: Bottom-left       — left 2–24%,  top 58–95%  (below button, left of portrait)
//   E: Gaps & edges      — scattered in remaining crevices

// 25 predefined positions.
// We interleave the zones so that if the user only has 5-10 logos, they are spread 
// across the entire screen rather than clumping in just the first zone defined in the array.
// Priority: Bottom-Left -> Bottom-Right -> Mid-Left -> Right-Upper -> Top-Right (filled last)

const PREDEFINED_POSITIONS = [
  // --- Spread 1 ---
  { top: '64%', left: '4%',   rotate: 9,   delay: 0.9,  dur: 12 }, // Bottom-left
  { top: '82%', left: '86%',  rotate: 10,  delay: 1.4,  dur: 9  }, // Bottom-right
  { top: '48%', left: '3%',   rotate: -15, delay: 2.0,  dur: 10 }, // Mid-left
  { top: '34%', left: '76%',  rotate: 10,  delay: 0.5,  dur: 11 }, // Right-upper
  
  // --- Spread 2 ---
  { top: '82%', left: '20%',  rotate: -12, delay: 3.3,  dur: 11 }, // Bottom-left
  { top: '62%', left: '88%',  rotate: 11,  delay: 0.7,  dur: 11 }, // Bottom-right
  { top: '92%', left: '72%',  rotate: 8,   delay: 3.6,  dur: 15 }, // Mid-gap
  { top: '18%', left: '74%',  rotate: 12,  delay: 1.1,  dur: 9  }, // Right-upper
  
  // --- Spread 3 ---
  { top: '74%', left: '6%',   rotate: 7,   delay: 1.5,  dur: 14 }, // Bottom-left
  { top: '52%', left: '76%',  rotate: -8,  delay: 2.2,  dur: 14 }, // Bottom-right
  { top: '48%', left: '92%',  rotate: -9,  delay: 1.3,  dur: 11 }, // Mid-gap
  { top: '26%', left: '86%',  rotate: -6,  delay: 2.4,  dur: 12 }, // Right-upper
  
  // --- Spread 4 ---
  { top: '92%', left: '10%',  rotate: 14,  delay: 0.4,  dur: 13 }, // Bottom-left
  { top: '92%', left: '80%',  rotate: -5,  delay: 4.0,  dur: 12 }, // Bottom-right
  { top: '14%', left: '52%',  rotate: 6,   delay: 2.8,  dur: 12 }, // Mid-gap
  { top: '40%', left: '90%',  rotate: 5,   delay: 1.6,  dur: 10 }, // Right-upper
  
  // --- Spread 5 ---
  { top: '66%', left: '18%',  rotate: -10, delay: 2.7,  dur: 10 }, // Bottom-left
  { top: '72%', left: '78%',  rotate: -13, delay: 3.1,  dur: 13 }, // Bottom-right
  { top: '14%', left: '90%',  rotate: -7,  delay: 0.6,  dur: 14 }, // Mid-gap
  { top: '22%', left: '94%',  rotate: -14, delay: 3.7,  dur: 13 }, // Right-upper
  
  // --- Spread 6 (Top-Right Strip - filled absolutely last as requested) ---
  { top: '4%',  left: '48%',  rotate: -5,  delay: 0.3,  dur: 11 },
  { top: '5%',  left: '72%',  rotate: -11, delay: 2.5,  dur: 10 },
  { top: '3%',  left: '83%',  rotate: 7,   delay: 0.9,  dur: 14 },
  { top: '3%',  left: '60%',  rotate: 9,   delay: 1.8,  dur: 13 },
  { top: '4%',  left: '94%',  rotate: -8,  delay: 3.2,  dur: 12 },
];

export default function ScatteredLogos({ logos }: { logos: string[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !logos || logos.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes float-sway {
          0%, 100% { 
            transform: translate(0px, 0px) rotate(0deg); 
          }
          33% { 
            transform: translate(12px, -15px) rotate(5deg); 
          }
          66% { 
            transform: translate(-10px, 12px) rotate(-3deg); 
          }
        }
        .animate-sway {
          animation: float-sway var(--anim-dur) ease-in-out var(--anim-delay) infinite;
        }
        
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>

      {/* MOBILE MARQUEE */}
      <div className="md:hidden absolute top-48 left-0 w-full overflow-hidden z-10 pointer-events-none opacity-50">
        <div className="flex w-max animate-marquee items-center gap-6 pr-6">
          {[...logos, ...logos, ...logos].map((logo, i) => (
            <div key={i} className="relative flex-shrink-0 w-16 h-16 bg-white rounded-xl shadow-sm border border-charcoal-green/10 p-3 flex items-center justify-center overflow-hidden">
              <Image src={logo} alt="Marquee Logo" fill className="object-contain p-3 select-none-img" sizes="64px" />
            </div>
          ))}
        </div>
      </div>
      
      <div className="md:hidden absolute bottom-48 left-0 w-full overflow-hidden z-10 pointer-events-none opacity-50" style={{ transform: 'rotate(180deg)' }}>
        <div className="flex w-max animate-marquee items-center gap-6 pr-6" style={{ animationDirection: 'reverse' }}>
          {[...logos, ...logos, ...logos].reverse().map((logo, i) => (
            <div key={i} className="relative flex-shrink-0 w-14 h-14 bg-white rounded-xl shadow-sm border border-charcoal-green/10 p-2.5 flex items-center justify-center overflow-hidden" style={{ transform: 'rotate(180deg)' }}>
              <Image src={logo} alt="Marquee Logo" fill className="object-contain p-2.5 select-none-img" sizes="56px" />
            </div>
          ))}
        </div>
      </div>

      {/* DESKTOP SCATTER (FIXED POSITIONS) */}
      <div className="hidden md:block absolute inset-0 z-10 pointer-events-none">
        {logos.map((logo, i) => {
          // Loop through the 25 predefined spots if there are more than 25 logos
          const pos = PREDEFINED_POSITIONS[i % PREDEFINED_POSITIONS.length];
          
          return (
            <div
              key={i}
              className="absolute flex items-center justify-center animate-in fade-in duration-1000"
              style={{
                left: pos.left,
                top: pos.top,
                transform: `rotate(${pos.rotate}deg)`,
                width: 'clamp(40px, 4vw, 55px)',
                height: 'clamp(40px, 4vw, 55px)',
              }}
            >
              <div
                className="relative w-full h-full bg-white rounded-xl p-2 shadow-sm border border-charcoal-green/5 animate-sway flex items-center justify-center overflow-hidden"
                style={{
                  '--anim-dur': `${pos.dur}s`,
                  '--anim-delay': `-${pos.delay}s`,
                } as React.CSSProperties}
              >
                <Image src={logo} alt="Scattered Logo" fill className="object-contain p-2 select-none-img" sizes="60px" />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
