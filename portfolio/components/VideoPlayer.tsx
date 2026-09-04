"use client";

import { useState } from "react";

interface ProjectVideo {
  id: string;
  youtube_url: string;
  label: string;
}

export function VideoPlayer({ videos }: { videos: ProjectVideo[] }) {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  if (!videos || videos.length === 0) return null;

  const activeVideo = videos[activeVideoIndex];

  // Helper to get youtube embed URL from a standard youtube URL
  const getEmbedUrl = (url: string) => {
    try {
      if (url.includes("embed")) return url;
      const urlObj = new URL(url);
      if (urlObj.hostname.includes("youtube.com") && urlObj.searchParams.has("v")) {
        return `https://www.youtube.com/embed/${urlObj.searchParams.get("v")}`;
      }
      if (urlObj.hostname.includes("youtu.be")) {
        return `https://www.youtube.com/embed${urlObj.pathname}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full mt-12 mb-16">
      <div className="flex-1">
        <h3 className="font-mono text-[11px] tracking-wider text-forest-700 uppercase mb-4">
          Overview Video
        </h3>
        <div className="aspect-video w-full overflow-hidden bg-forest-900 shadow-xl relative border border-forest-800">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={getEmbedUrl(activeVideo.youtube_url)}
            title={activeVideo.label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      {videos.length > 1 && (
        <div className="lg:w-80 shrink-0">
          <h3 className="font-mono text-[11px] tracking-wider text-forest-700 uppercase mb-4">
            Project Videos
          </h3>
          <div className="bg-mist-100/30 border border-mist-100 flex flex-col p-2">
            {videos.map((video, idx) => (
              <button
                key={video.id}
                onClick={() => setActiveVideoIndex(idx)}
                className={`text-left px-4 py-3 flex items-center transition-colors border-l-2 ${
                  idx === activeVideoIndex
                    ? "bg-white border-forest-700 text-forest-900 font-medium shadow-sm"
                    : "border-transparent text-forest-800/80 hover:bg-white/50 hover:text-forest-900"
                }`}
              >
                <svg 
                  className={`w-4 h-4 mr-3 shrink-0 ${idx === activeVideoIndex ? "text-forest-700" : "text-forest-800/40"}`} 
                  viewBox="0 0 24 24" 
                  fill={idx === activeVideoIndex ? "currentColor" : "none"} 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span className="font-sans text-sm truncate">{video.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
