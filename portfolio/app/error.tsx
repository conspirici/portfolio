"use client";

import { useEffect } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 min-h-[70vh] text-center">
      <h1 className="font-display text-4xl md:text-5xl text-red-800 mb-4">Something went wrong</h1>
      <p className="font-sans text-charcoal-green/60 mb-10 max-w-md mx-auto">
        We encountered an unexpected error while trying to load this page. The server might be temporarily unavailable.
      </p>
      
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 bg-charcoal-green text-sage-white font-mono uppercase tracking-wider text-sm px-6 py-3 rounded hover:bg-forest-900 transition-all group"
        >
          Try Again
          <RotateCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500" />
        </button>
        <a
          href="/"
          className="inline-flex items-center gap-2 border border-charcoal-green text-charcoal-green font-mono uppercase tracking-wider text-sm px-6 py-3 rounded hover:bg-charcoal-green hover:text-sage-white transition-all group"
        >
          Go Home
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </div>
  );
}
