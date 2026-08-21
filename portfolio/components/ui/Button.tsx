import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

interface ButtonProps {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'text-link';
  accent?: 'forest' | 'teal';
  className?: string;
}

export function Button({
  label,
  href,
  onClick,
  variant = 'primary',
  accent = 'forest',
  className,
}: ButtonProps) {
  const isLink = !!href;
  
  const baseClasses = 'font-mono text-[12px] uppercase tracking-[0.04em] flex items-center transition-colors group';
  
  const variantClasses = {
    primary: {
      forest: 'border border-forest-700 text-forest-700 hover:bg-forest-700 hover:text-sage-white px-5 py-2.5',
      teal: 'border border-teal-700 text-teal-700 hover:bg-teal-700 hover:text-sage-white px-5 py-2.5',
    },
    'text-link': {
      forest: 'text-forest-700 hover:opacity-80 underline underline-offset-4 decoration-forest-700/30 hover:decoration-forest-700',
      teal: 'text-teal-700 hover:opacity-80 underline underline-offset-4 decoration-teal-700/30 hover:decoration-teal-700',
    }
  };

  const classes = cn(baseClasses, variantClasses[variant][accent], className);
  
  const content = (
    <>
      {label}
      <ArrowRight 
        size={14} 
        className={cn(
          "ml-2 transition-transform", 
          variant === 'primary' ? "group-hover:translate-x-1" : "group-hover:translate-x-1"
        )} 
      />
    </>
  );

  if (isLink) {
    // Determine if it's an external link
    const isExternal = href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:');
    
    if (isExternal) {
      return (
        <a href={href} className={classes} target="_blank" rel="noopener noreferrer" onClick={onClick}>
          {content}
        </a>
      );
    }
    
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      {content}
    </button>
  );
}
