"use client";

import { useState, useEffect } from 'react';
import { PrintedPhotoFrame } from '@/components/ui/PrintedPhotoFrame';

interface FieldNoteResponse {
  id: string;
  photo_url: string;
  caption?: string;
  location?: string;
}

export function FieldNotesGrid({ notes }: { notes: FieldNoteResponse[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<FieldNoteResponse | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPhoto(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (notes.length === 0) {
    return (
      <div className="w-full py-24 flex items-center justify-center border border-dashed border-sage-white/20 bg-sage-white/5">
        <p className="font-mono text-sm text-sage-white/60 tracking-wider uppercase">
          Field notes will appear when added via CMS
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {notes.map((note) => (
          <div 
            key={note.id} 
            className="group sm:cursor-pointer"
            onClick={() => {
              if (window.innerWidth >= 640) setSelectedPhoto(note);
            }}
          >
            <div className="relative transition-transform group-hover:-translate-y-1">
              <PrintedPhotoFrame 
                src={note.photo_url}
                alt={note.caption || "Field Note"}
                width={600}
                height={600}
              >
                <div className="absolute bottom-4 left-4 right-4 z-10 text-sage-white pointer-events-none">
                  {note.caption && <p className="font-sans text-sm mb-1 drop-shadow-md shadow-black">{note.caption}</p>}
                  {note.location && <p className="font-mono text-[10px] text-sage-white/90 uppercase tracking-wider drop-shadow-md shadow-black">{note.location}</p>}
                </div>
              </PrintedPhotoFrame>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Overlay (only active on sm+ screens) */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-[100] hidden sm:flex items-center justify-center bg-black/80 backdrop-blur-md p-8 cursor-pointer"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="relative shadow-2xl mx-auto cursor-default bg-sage-white p-2 w-fit h-fit max-w-[95vw] max-h-[95vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden bg-warm-gray-200 flex items-center justify-center">
              <img 
                src={selectedPhoto.photo_url} 
                alt={selectedPhoto.caption || "Field Note"}
                className="w-auto h-auto max-w-[90vw] max-h-[85vh]"
              />
              <div 
                className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.08]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
              />
              <div className="absolute bottom-6 left-6 right-6 z-10 text-white pointer-events-none">
                {selectedPhoto.caption && <p className="font-sans text-2xl mb-2 drop-shadow-lg shadow-black">{selectedPhoto.caption}</p>}
                {selectedPhoto.location && <p className="font-mono text-sm text-white/90 uppercase tracking-wider drop-shadow-lg shadow-black">{selectedPhoto.location}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
