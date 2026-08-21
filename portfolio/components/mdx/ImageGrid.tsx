import { PrintedPhotoFrame } from '@/components/ui/PrintedPhotoFrame';

interface ImageGridProps {
  images: { src: string; alt: string; }[];
}

export function ImageGrid({ images }: ImageGridProps) {
  if (!images || images.length === 0) return null;

  return (
    <div className="my-10 grid grid-cols-1 sm:grid-cols-2 gap-6 items-start px-2 py-2">
      {images.map((img, i) => (
        <PrintedPhotoFrame key={i} src={img.src} alt={img.alt} />
      ))}
    </div>
  );
}
