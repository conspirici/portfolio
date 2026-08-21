import Image from 'next/image';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PrintedPhotoFrameProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  size?: 'small' | 'medium' | 'full';
  priority?: boolean;
  className?: string;
}

export function PrintedPhotoFrame({
  src,
  alt,
  width,
  height,
  size = 'full',
  priority = false,
  className,
  children,
}: PrintedPhotoFrameProps & { children?: React.ReactNode }) {
  const sizeClasses = {
    small: 'max-w-xs',
    medium: 'max-w-md',
    full: 'w-full',
  };

  const noiseSvg = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E`;

  return (
    <div
      className={cn(
        'relative bg-sage-white p-2 shadow-sm',
        sizeClasses[size],
        className
      )}
    >
      <div className="relative w-full overflow-hidden bg-warm-gray-200">
        {/* Validate source before passing to next/image to prevent crashing */}
        {src && !src.startsWith('None/') && !src.startsWith('null/') ? (
          width && height ? (
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              priority={priority}
              className="w-full h-auto object-cover"
            />
          ) : (
            <Image
              src={src}
              alt={alt}
              fill
              priority={priority}
              className="object-cover"
            />
          )
        ) : (
          <div className="w-full h-full min-h-[200px] flex items-center justify-center bg-warm-gray-200">
            <span className="text-sm font-mono text-charcoal-green/40 uppercase tracking-widest">Image Error</span>
          </div>
        )}
        <div 
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.08]"
          style={{ backgroundImage: `url("${noiseSvg}")` }}
        />
        {children}
      </div>
    </div>
  );
}
