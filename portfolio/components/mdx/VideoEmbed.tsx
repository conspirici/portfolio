export function VideoEmbed({ url }: { url: string }) {
  if (!url) return null;
  
  return (
    <div className="my-10 aspect-video w-full overflow-hidden bg-warm-gray-200 shadow-sm relative border border-warm-gray-300">
      <iframe
        className="absolute inset-0 w-full h-full"
        src={url}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
