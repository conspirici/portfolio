"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Generates a tileable film-grain noise texture as a data URL.
 * Used for the signature grain overlay on hero sections and dividers.
 */
function makeGrainDataURL(size: number, alpha: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.createImageData(size, size);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const value = Math.floor(Math.random() * 255);
    imageData.data[i] = value;
    imageData.data[i + 1] = value;
    imageData.data[i + 2] = value;
    imageData.data[i + 3] = alpha;
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}

interface HeroProps {
  variant?: "forest" | "teal" | "blended" | "divider";
  children?: React.ReactNode;
  className?: string;
}

const gradientMap: Record<string, string> = {
  forest:
    "radial-gradient(120% 90% at 18% 15%, #B7E5BA 0%, #288760 32%, #1A5140 60%, #123024 100%)",
  teal: "radial-gradient(120% 90% at 82% 12%, #D8ECEC 0%, #075057 35%, #09606D 62%, #0D2B33 100%)",
  blended: [
    "radial-gradient(90% 70% at 50% 8%, #D8ECEC 0%, transparent 45%)",
    "linear-gradient(200deg, #0D2B33 0%, #09606D 22%, #1A5140 55%, #123024 85%)",
  ].join(", "),
  divider: [
    "radial-gradient(80% 140% at 50% -20%, #D8ECEC 0%, transparent 55%)",
    "linear-gradient(100deg, #123024 0%, #09606D 50%, #0D2B33 100%)",
  ].join(", "),
};

const heightMap: Record<string, string> = {
  forest: "min-h-[60vh]",
  teal: "min-h-[60vh]",
  blended: "min-h-[90vh]",
  divider: "h-[22vh]",
};

/**
 * Hero component — the gradient + grain signature moment.
 * Used on Home and as section dividers elsewhere.
 *
 * Gradient recipes from design system doc 01, Section 3.
 * Grain pattern matches gradient-reference.html.
 */
export default function Hero({
  variant = "blended",
  children,
  className = "",
}: HeroProps) {
  const grainRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (grainRef.current) {
      const grainURL = makeGrainDataURL(128, 40);
      grainRef.current.style.backgroundImage = `url(${grainURL})`;
      grainRef.current.style.backgroundSize = "128px 128px";
    }
  }, []);

  return (
    <section
      className={`relative overflow-hidden flex items-end ${heightMap[variant]} ${className}`}
      style={{ background: gradientMap[variant] }}
    >
      {/* Film grain overlay */}
      <div
        ref={grainRef}
        className={`grain-overlay transition-opacity duration-500 ${
          mounted ? "opacity-45" : "opacity-0"
        }`}
      />

      {/* Content */}
      {children && (
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 pb-16 sm:pb-24">
          {children}
        </div>
      )}
    </section>
  );
}
