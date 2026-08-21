"use client";

import { PrintedPhotoFrame } from '@/components/ui/PrintedPhotoFrame';

interface ImageCarouselProps {
  images: { src: string; alt: string; }[];
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  if (!images || images.length === 0) return null;

  return (
    <div className="my-10 flex overflow-x-auto gap-6 pb-6 pt-2 px-2 snap-x snap-mandatory hide-scrollbar">
      {images.map((img, i) => (
        <div key={i} className="snap-center shrink-0 w-[85%] md:w-[65%]">
          <PrintedPhotoFrame src={img.src} alt={img.alt} />
        </div>
      ))}
    </div>
  );
}
