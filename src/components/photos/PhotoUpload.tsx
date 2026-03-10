'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface PhotoUploadProps {
  onUpload: (urls: string[]) => void;
  context?: string;
  maxFiles?: number;
  existingUrls?: string[];
}

export function PhotoUpload({
  onUpload,
  context = 'general',
  maxFiles = 5,
  existingUrls = [],
}: PhotoUploadProps) {
  const [previews, setPreviews] = useState<{ file: File; preview: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<string[]>(existingUrls);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      setError(null);
      const arr = Array.from(files);
      const remaining = maxFiles - previews.length - uploaded.length;
      if (arr.length > remaining) {
        setError(`You can only upload ${maxFiles} photos total.`);
        return;
      }
      const newPreviews = arr.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setPreviews((p) => [...p, ...newPreviews]);
    },
    [maxFiles, previews.length, uploaded.length]
  );

  const removePreview = (index: number) => {
    setPreviews((p) => {
      URL.revokeObjectURL(p[index].preview);
      return p.filter((_, i) => i !== index);
    });
  };

  const removeUploaded = (url: string) => {
    const newUploaded = uploaded.filter((u) => u !== url);
    setUploaded(newUploaded);
    onUpload(newUploaded);
  };

  const handleUpload = async () => {
    if (previews.length === 0) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    previews.forEach(({ file }) => formData.append('files', file));
    formData.append('context', context);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Upload failed');
        return;
      }

      const newUrls = [...uploaded, ...data.urls];
      setUploaded(newUrls);
      onUpload(newUrls);
      previews.forEach(({ preview }) => URL.revokeObjectURL(preview));
      setPreviews([]);
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload photos. Click or drag and drop image files here."
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={clsx(
          'flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors',
          isDragging
            ? 'border-primary-400 bg-primary-50'
            : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
        )}
      >
        <Upload className="h-8 w-8 text-slate-400" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
          <p className="text-xs text-slate-500">JPEG, PNG or WebP · Max 10MB each · Up to {maxFiles} photos</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          className="sr-only"
          aria-hidden="true"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Previews (not yet uploaded) */}
      {previews.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">Ready to upload ({previews.length})</p>
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              {uploading ? 'Uploading…' : 'Upload Photos'}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {previews.map(({ preview }, i) => (
              <div key={preview} className="group relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt={`Preview ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removePreview(i); }}
                  aria-label={`Remove photo ${i + 1}`}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none transition-opacity"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Already uploaded */}
      {uploaded.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Uploaded photos ({uploaded.length})</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {uploaded.map((url) => (
              <div key={url} className="group relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Uploaded accessibility photo" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeUploaded(url)}
                  aria-label="Remove uploaded photo"
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none transition-opacity"
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
          <ImageIcon className="h-4 w-4" aria-hidden="true" />
          <span>No photos yet. Photos of entrances, ramps, washrooms, and doors are most helpful.</span>
        </div>
      )}
    </div>
  );
}
