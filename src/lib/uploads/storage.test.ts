import { afterEach, describe, expect, it, vi } from 'vitest';
import { join, resolve } from 'path';
import { getUploadDirectory, getUploadRoot, getUploadUrl, UPLOAD_ROOT_ENV } from './storage';

describe('upload storage', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses public/uploads as the safe local default', () => {
    vi.stubEnv(UPLOAD_ROOT_ENV, '');
    expect(getUploadRoot()).toBe(join(process.cwd(), 'public', 'uploads'));
  });

  it('uses an absolute configured upload root', () => {
    const root = resolve(process.cwd(), 'mounted-uploads');
    vi.stubEnv(UPLOAD_ROOT_ENV, root);
    expect(getUploadDirectory('places')).toBe(join(root, 'places'));
  });

  it('resolves a relative configured upload root from the app directory', () => {
    vi.stubEnv(UPLOAD_ROOT_ENV, 'data/uploads');
    expect(getUploadRoot()).toBe(resolve(process.cwd(), 'data/uploads'));
  });

  it('keeps public URLs under /uploads regardless of the storage root', () => {
    vi.stubEnv(UPLOAD_ROOT_ENV, resolve(process.cwd(), 'mounted-uploads'));
    expect(getUploadUrl('submissions', 'photo.webp')).toBe('/uploads/submissions/photo.webp');
  });
});
