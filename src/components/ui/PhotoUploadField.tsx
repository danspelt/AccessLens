/* eslint-disable @next/next/no-img-element */
'use client';

import { ChangeEvent, useRef, useState } from 'react';

interface PhotoUploadFieldProps {
  label: string;
  description?: string;
  value: string[];
  onChange: (nextValue: string[]) => void;
  maxFiles?: number;
}

export function PhotoUploadField({
  label,
  description,
  value,
  onChange,
  maxFiles = 6,
}: PhotoUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setError('');
    setIsUploading(true);

    try {
      const nextUrls: string[] = [];

      for (const file of files.slice(0, Math.max(maxFiles - value.length, 0))) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/uploads', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }

        nextUrls.push(data.url);
      }

      onChange([...value, ...nextUrls]);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }

  function removePhoto(url: string) {
    onChange(value.filter((currentUrl) => currentUrl !== url));
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        onChange={handleUpload}
        disabled={isUploading || value.length >= maxFiles}
        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200 disabled:opacity-60"
      />

      {isUploading ? <p className="text-sm text-blue-600">Uploading photos...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {value.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {value.map((url) => (
            <div key={url} className="rounded-lg border border-gray-200 bg-white p-3">
              <img src={url} alt="Uploaded evidence" className="h-40 w-full rounded-md object-cover" />
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="truncate text-xs text-gray-500">{url}</p>
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
