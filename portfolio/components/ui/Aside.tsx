import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AsideProps {
  children: React.ReactNode;
  className?: string;
}

export function Aside({ children, className }: AsideProps) {
  return (
    <aside className={cn('font-display italic text-[19px] py-8 text-forest-700 leading-relaxed', className)}>
      {children}
    </aside>
  );
}
