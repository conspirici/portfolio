import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />;
}

export function ProjectCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* PrintedPhotoFrame shape skeleton */}
      <div className="bg-sage-white p-2 shadow-sm w-full aspect-video">
        <Skeleton className="w-full h-full" />
      </div>
      
      {/* Tags */}
      <div className="flex gap-2">
        <Skeleton className="w-16 h-5" />
        <Skeleton className="w-20 h-5" />
      </div>

      {/* Text lines */}
      <div className="flex flex-col gap-2">
        <Skeleton className="w-3/4 h-6" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-5/6 h-4" />
      </div>
    </div>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-6 w-full items-start">
      {/* Cover rectangle */}
      <Skeleton className="w-full md:w-48 aspect-[4/3] md:aspect-square shrink-0" />
      
      <div className="flex flex-col gap-3 w-full">
        {/* Date/Tags */}
        <div className="flex gap-2">
          <Skeleton className="w-24 h-4" />
        </div>
        
        {/* Title */}
        <Skeleton className="w-3/4 h-7" />
        
        {/* Teaser */}
        <div className="flex flex-col gap-2 mt-2">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-4/5 h-4" />
        </div>
      </div>
    </div>
  );
}

export function PhotoCardSkeleton() {
  return (
    <div className="bg-sage-white p-2 shadow-sm w-full aspect-square">
      <Skeleton className="w-full h-full" />
    </div>
  );
}
