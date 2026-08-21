import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TagPillProps {
  label: string;
  type?: 'tech' | 'category' | 'topic';
  className?: string;
}

export function TagPill({ label, type = 'tech', className }: TagPillProps) {
  const typeClasses = {
    tech: 'border-forest-700 text-forest-700',
    topic: 'border-teal-700 text-teal-700',
    category: 'border-[#8b958f] text-[#8b958f]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center border px-2.5 py-0.5',
        'font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.04em] bg-transparent whitespace-nowrap',
        typeClasses[type],
        className
      )}
    >
      {label}
    </span>
  );
}
