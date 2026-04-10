'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, Film } from 'lucide-react';
import { clsx } from 'clsx';

type BaseProps = {
  context?: string;
  maxFiles?: number;
};

type ImagesVariantProps = BaseProps & {
  variant?: 'images';
  onUpload: (urls: string[]) => void;
  existingUrls?: string[];
};

type MediaVariantProps = BaseProps & {
  variant: 'media';
  onUpload: (payload: { photoUrls: string[]; videoUrls: string[] }) => void;
  existingPhotoUrls?: string[];
  existingVideoUrls?: string[];
};

export type PhotoUploadProps = ImagesVariantProps | MediaVariantProps;

type PendingPhoto = { file: File; preview: string };
type PendingVideo = { file: File; preview: string };

export function PhotoUpload(props: PhotoUploadProps) {
  const isMedia = props.variant === 'media';
  const context = props.context ?? 'general';
  const maxFiles = props.maxFiles ?? 5;

  const [previews, setPreviews] = useState<{ file: File; preview: string }[]>([]);
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [pendingVideos, setPendingVideos] = useState<PendingVideo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<string[]>(!isMedia ? props.existingUrls ?? [] : []);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>(
    isMedia ? props.existingPhotoUrls ?? [] : []
  );
  const [uploadedVideos, setUploadedVideos] = useState<string[]>(
    isMedia ? props.existingVideoUrls ?? [] : []
  );
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragPhoto, setDragPhoto] = useState(false);
  const [dragVideo, setDragVideo] = useState(false);
  const [dragSingle, setDragSingle] = useState(false);

  const pendingCount = isMedia ? pendingPhotos.length + pendingVideos.length : previews.length;
  const totalCount = isMedia
    ? uploadedPhotos.length + uploadedVideos.length + pendingPhotos.length + pendingVideos.length
    : uploaded.length + previews.length;

  const emitMedia = useCallback(
    (photos: string[], videos: string[]) => {
      if (isMedia) {
        (props as MediaVariantProps).onUpload({ photoUrls: photos, videoUrls: videos });
      }
    },
    [isMedia, props]
  );

  const addImageFiles = useCallback(
    (files: FileList | File[]) => {
      setError(null);
      const arr = Array.from(files).filter((f) => f.type.startsWith('image/'));
      if (arr.length === 0) {
        setError('Add image files (JPEG, PNG, or WebP).');
        return;
      }
      const remaining = maxFiles - totalCount;
      if (arr.length > remaining) {
        setError(`You can only upload ${maxFiles} files total.`);
        return;
      }
      const newPreviews = arr.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setPendingPhotos((p) => [...p, ...newPreviews]);
    },
    [maxFiles, totalCount]
  );

  const addVideoFiles = useCallback(
    (files: FileList | File[]) => {
      setError(null);
      const arr = Array.from(files).filter((f) => f.type.startsWith('video/'));
      if (arr.length === 0) {
        setError('Add video files (MP4, WebM, MOV, etc.).');
        return;
      }
      const remaining = maxFiles - totalCount;
      if (arr.length > remaining) {
        setError(`You can only upload ${maxFiles} files total.`);
        return;
      }
      const newPreviews = arr.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setPendingVideos((p) => [...p, ...newPreviews]);
    },
    [maxFiles, totalCount]
  );

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      setError(null);
      const arr = Array.from(files);
      const remaining = maxFiles - totalCount;
      if (arr.length > remaining) {
        setError(`You can only upload ${maxFiles} files total.`);
        return;
      }
      for (const file of arr) {
        if (!file.type.startsWith('image/')) {
          setError('Only image files are allowed.');
          return;
        }
      }
      const newPreviews = arr.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setPreviews((p) => [...p, ...newPreviews]);
    },
    [maxFiles, totalCount]
  );

  const removePendingPhoto = (index: number) => {
    setPendingPhotos((p) => {
      URL.revokeObjectURL(p[index].preview);
      return p.filter((_, i) => i !== index);
    });
  };

  const removePendingVideo = (index: number) => {
    setPendingVideos((p) => {
      URL.revokeObjectURL(p[index].preview);
      return p.filter((_, i) => i !== index);
    });
  };

  const removePreview = (index: number) => {
    setPreviews((p) => {
      URL.revokeObjectURL(p[index].preview);
      return p.filter((_, i) => i !== index);
    });
  };

  const removeUploaded = (url: string) => {
    if (isMedia) {
      if (uploadedPhotos.includes(url)) {
        const next = uploadedPhotos.filter((u) => u !== url);
        setUploadedPhotos(next);
        emitMedia(next, uploadedVideos);
      } else {
        const next = uploadedVideos.filter((u) => u !== url);
        setUploadedVideos(next);
        emitMedia(uploadedPhotos, next);
      }
    } else {
      const newUploaded = uploaded.filter((u) => u !== url);
      setUploaded(newUploaded);
      (props as ImagesVariantProps).onUpload(newUploaded);
    }
  };

  const handleUpload = async () => {
    if (isMedia) {
      if (pendingPhotos.length === 0 && pendingVideos.length === 0) return;
    } else if (previews.length === 0) {
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    if (isMedia) {
      pendingPhotos.forEach(({ file }) => formData.append('files', file));
      pendingVideos.forEach(({ file }) => formData.append('files', file));
    } else {
      previews.forEach(({ file }) => formData.append('files', file));
    }
    formData.append('context', context);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Upload failed');
        return;
      }

      const urls: string[] = data.urls || [];
      const kinds: ('image' | 'video')[] = Array.isArray(data.kinds)
        ? data.kinds
        : urls.map(() => 'image' as const);

      if (isMedia) {
        const newPhotos: string[] = [];
        const newVideos: string[] = [];
        urls.forEach((url, i) => {
          if (kinds[i] === 'video') newVideos.push(url);
          else newPhotos.push(url);
        });
        const nextPhotos = [...uploadedPhotos, ...newPhotos];
        const nextVideos = [...uploadedVideos, ...newVideos];
        setUploadedPhotos(nextPhotos);
        setUploadedVideos(nextVideos);
        emitMedia(nextPhotos, nextVideos);
        pendingPhotos.forEach(({ preview }) => URL.revokeObjectURL(preview));
        pendingVideos.forEach(({ preview }) => URL.revokeObjectURL(preview));
        setPendingPhotos([]);
        setPendingVideos([]);
      } else {
        const newUrls = [...uploaded, ...urls];
        setUploaded(newUrls);
        (props as ImagesVariantProps).onUpload(newUrls);
        previews.forEach(({ preview }) => URL.revokeObjectURL(preview));
        setPreviews([]);
      }
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const acceptImagesOnly = 'image/jpeg,image/jpg,image/png,image/webp';
  const acceptVideosOnly = 'video/mp4,video/webm,video/quicktime,video/x-m4v,video/ogg';

  if (isMedia) {
    const hasPending = pendingPhotos.length > 0 || pendingVideos.length > 0;
    const hasUploaded = uploadedPhotos.length > 0 || uploadedVideos.length > 0;

    return (
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Photos drop zone */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload photos. Click or drag image files here."
            onKeyDown={(e) => e.key === 'Enter' && photoInputRef.current?.click()}
            onClick={() => photoInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragPhoto(true);
            }}
            onDragLeave={() => setDragPhoto(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragPhoto(false);
              addImageFiles(e.dataTransfer.files);
            }}
            className={clsx(
              'flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-5 text-center transition-colors',
              dragPhoto
                ? 'border-primary-400 bg-primary-50'
                : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
            )}
          >
            <ImageIcon className="h-7 w-7 text-slate-400" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-slate-800">Photos</p>
              <p className="text-xs text-slate-500">JPEG, PNG, WebP · max 10MB each</p>
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept={acceptImagesOnly}
              multiple
              className="sr-only"
              aria-hidden="true"
              onChange={(e) => e.target.files && addImageFiles(e.target.files)}
            />
          </div>

          {/* Videos drop zone */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload videos. Click or drag video files here."
            onKeyDown={(e) => e.key === 'Enter' && videoInputRef.current?.click()}
            onClick={() => videoInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragVideo(true);
            }}
            onDragLeave={() => setDragVideo(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragVideo(false);
              addVideoFiles(e.dataTransfer.files);
            }}
            className={clsx(
              'flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-5 text-center transition-colors',
              dragVideo
                ? 'border-primary-400 bg-primary-50'
                : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
            )}
          >
            <Film className="h-7 w-7 text-slate-400" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-slate-800">Videos</p>
              <p className="text-xs text-slate-500">MP4, WebM, MOV · max 50MB each</p>
            </div>
            <input
              ref={videoInputRef}
              type="file"
              accept={acceptVideosOnly}
              multiple
              className="sr-only"
              aria-hidden="true"
              onChange={(e) => e.target.files && addVideoFiles(e.target.files)}
            />
          </div>
        </div>

        {error && (
          <div
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        {hasPending && (
          <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-800">Ready to upload</p>
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="link-cta-primary gap-2 px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                {uploading ? 'Uploading…' : `Upload${pendingCount > 1 ? ' all' : ''} (${pendingCount})`}
              </button>
            </div>

            {pendingPhotos.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Photos ({pendingPhotos.length})
                </p>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {pendingPhotos.map((item, i) => (
                    <div
                      key={item.preview}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-white"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.preview}
                        alt={`Photo preview ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePendingPhoto(i);
                        }}
                        aria-label={`Remove photo ${i + 1}`}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingVideos.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Videos ({pendingVideos.length})
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {pendingVideos.map((item, i) => (
                    <div
                      key={item.preview}
                      className="group relative aspect-video overflow-hidden rounded-lg border border-slate-200 bg-black"
                    >
                      <video
                        src={item.preview}
                        muted
                        playsInline
                        className="h-full w-full object-contain"
                        aria-label={`Video preview ${i + 1}`}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePendingVideo(i);
                        }}
                        aria-label={`Remove video ${i + 1}`}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {hasUploaded && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-800">Uploaded</p>
            {uploadedPhotos.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Photos ({uploadedPhotos.length})
                </p>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {uploadedPhotos.map((url) => (
                    <div
                      key={url}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt="Uploaded accessibility photo"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeUploaded(url)}
                        aria-label="Remove uploaded photo"
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {uploadedVideos.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Videos ({uploadedVideos.length})
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {uploadedVideos.map((url) => (
                    <div
                      key={url}
                      className="group relative aspect-video overflow-hidden rounded-lg border border-slate-200 bg-black"
                    >
                      <video
                        src={url}
                        muted
                        playsInline
                        className="h-full w-full object-contain"
                        aria-label="Uploaded accessibility video"
                      />
                      <button
                        type="button"
                        onClick={() => removeUploaded(url)}
                        aria-label="Remove uploaded video"
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!hasPending && !hasUploaded && (
          <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
            <Upload className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Add photos and videos above — up to {maxFiles} files total. Short clips of entrances,
              ramps, and washrooms are especially helpful.
            </span>
          </div>
        )}

        <p className="text-xs text-slate-400">Up to {maxFiles} files total (photos + videos).</p>
      </div>
    );
  }

  /* ——— images-only variant (unchanged behavior, single zone) ——— */
  const helpText = `JPEG, PNG or WebP · Max 10MB each · Up to ${maxFiles} photos`;

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload photos. Click or drag and drop image files here."
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragSingle(true);
        }}
        onDragLeave={() => setDragSingle(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragSingle(false);
          addFiles(e.dataTransfer.files);
        }}
        className={clsx(
          'flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors',
          dragSingle
            ? 'border-primary-400 bg-primary-50'
            : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
        )}
      >
        <Upload className="h-8 w-8 text-slate-400" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
          <p className="text-xs text-slate-500">{helpText}</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptImagesOnly}
          multiple
          className="sr-only"
          aria-hidden="true"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {error && (
        <div
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {previews.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">Ready to upload ({previews.length})</p>
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="link-cta-primary gap-2 px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : 'Upload Photos'}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {previews.map(({ preview }, i) => (
              <div
                key={preview}
                className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt={`Preview ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePreview(i);
                  }}
                  aria-label={`Remove photo ${i + 1}`}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {uploaded.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Uploaded photos ({uploaded.length})</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {uploaded.map((url) => (
              <div
                key={url}
                className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt="Uploaded accessibility photo"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeUploaded(url)}
                  aria-label="Remove uploaded photo"
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {previews.length === 0 && uploaded.length === 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
          <ImageIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>No photos yet. Photos of entrances, ramps, washrooms, and doors are most helpful.</span>
        </div>
      )}
    </div>
  );
}
