'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface PhotoGalleryProps {
  urls: string[];
  placeName: string;
}

export function PhotoGallery({ urls, placeName }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (urls.length === 0) return null;

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prev = () => setLightboxIndex((i) => (i === null ? 0 : (i - 1 + urls.length) % urls.length));
  const next = () => setLightboxIndex((i) => (i === null ? 0 : (i + 1) % urls.length));

  return (
    <>
      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
        role="list"
        aria-label={`Accessibility photos of ${placeName}`}
      >
        {urls.map((url, i) => (
          <div
            key={url}
            role="listitem"
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-slate-200"
            onClick={() => openLightbox(i)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Accessibility photo ${i + 1} of ${placeName}`}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
              <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
            </div>
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo ${lightboxIndex + 1} of ${urls.length}`}
          onClick={closeLightbox}
        >
          <button
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            onClick={closeLightbox}
            aria-label="Close photo viewer"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>

          {urls.length > 1 && (
            <>
              <button
                className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden="true" />
              </button>
              <button
                className="absolute right-16 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Next photo"
              >
                <ChevronRight className="h-6 w-6" aria-hidden="true" />
              </button>
            </>
          )}

          <div onClick={(e) => e.stopPropagation()} className="max-h-full max-w-4xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={urls[lightboxIndex]}
              alt={`Accessibility photo ${lightboxIndex + 1} of ${placeName}`}
              className="max-h-[80vh] max-w-full rounded-lg object-contain"
            />
            <p className="mt-3 text-center text-sm text-slate-400">
              {lightboxIndex + 1} / {urls.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
