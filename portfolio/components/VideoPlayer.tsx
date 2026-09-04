export default function VideoPlayer({ url, title, duration }: { url: string; title: string; duration?: string }) {
  // Extract YouTube ID
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYoutubeId(url);

  if (!videoId) {
    return (
      <div className="w-full aspect-video bg-forest-900 flex items-center justify-center text-sage-white">
        Invalid Video URL
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative w-full aspect-video">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {(title || duration) && (
        <div className="mt-2 flex justify-between text-sm text-forest-800/80">
          <span className="font-medium">{title}</span>
          {duration && <span className="font-mono">{duration}</span>}
        </div>
      )}
    </div>
  );
}
