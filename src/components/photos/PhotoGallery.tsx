'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { useDialogFocus } from '@/hooks/useDialogFocus';

interface PhotoGalleryProps {
  urls: string[];
  placeName: string;
}

export function PhotoGallery({ urls, placeName }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const closeLightbox = () => setLightboxIndex(null);
  const dialogRef = useDialogFocus<HTMLDivElement>(lightboxIndex !== null, closeLightbox);

  if (urls.length === 0) return null;

  const prev = () => setLightboxIndex((i) => (i === null ? 0 : (i - 1 + urls.length) % urls.length));
  const next = () => setLightboxIndex((i) => (i === null ? 0 : (i + 1) % urls.length));

  return (
    <>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label={`Accessibility photos of ${placeName}`}>
        {urls.map((url, i) => (
          <li key={url}>
            <button
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="group relative block aspect-square w-full cursor-pointer overflow-hidden rounded-lg border border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              aria-label={`View accessibility photo ${i + 1} of ${urls.length} for ${placeName}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover transition-transform motion-safe:group-hover:scale-105"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20 group-focus-visible:bg-black/20">
                <ZoomIn className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true" />
              </span>
            </button>
          </li>
        ))}
      </ul>

      {lightboxIndex !== null && (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo ${lightboxIndex + 1} of ${urls.length}, ${placeName}`}
          onClick={closeLightbox}
          onKeyDown={(e) => {
            if (urls.length < 2) return;
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
          }}
        >
          <button
            type="button"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            onClick={closeLightbox}
            aria-label="Close photo viewer"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>

          {urls.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Next photo"
              >
                <ChevronRight className="h-6 w-6" aria-hidden="true" />
              </button>
            </>
          )}

          <figure onClick={(e) => e.stopPropagation()} className="max-h-full max-w-4xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={urls[lightboxIndex]}
              alt={`Accessibility photo ${lightboxIndex + 1} of ${placeName}`}
              className="max-h-[80vh] max-w-full rounded-lg object-contain"
            />
            <figcaption className="mt-3 text-center text-sm text-slate-300" aria-live="polite">
              {lightboxIndex + 1} / {urls.length}
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
