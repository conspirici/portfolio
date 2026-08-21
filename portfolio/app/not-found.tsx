import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 min-h-[70vh] text-center">
      <h1 className="font-display text-8xl md:text-9xl text-charcoal-green mb-6">404</h1>
      <h2 className="font-sans text-2xl md:text-3xl text-forest-900 mb-6 max-w-md">
        This page seems to have wandered off.
      </h2>
      <p className="font-sans text-charcoal-green/60 mb-10 max-w-sm">
        The link you followed might be broken, or the page may have been removed.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-charcoal-green text-sage-white font-mono uppercase tracking-wider text-sm px-8 py-3.5 rounded hover:bg-forest-900 transition-all group"
      >
        Return Home
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
