import { afterEach, describe, expect, it, vi } from 'vitest';
import { join, resolve } from 'path';
import { getUploadDirectory, getUploadRoot, getUploadUrl, resolveUploadFile, UPLOAD_ROOT_ENV } from './storage';

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

  it('resolves served upload URLs inside the configured root', () => {
    const root = resolve(process.cwd(), 'mounted-uploads');
    vi.stubEnv(UPLOAD_ROOT_ENV, root);
    expect(resolveUploadFile(['places', 'a.png'])).toEqual({ path: join(root, 'places', 'a.png'), contentType: 'image/png' });
    expect(resolveUploadFile(['places', 'clip.MP4'])?.contentType).toBe('video/mp4');
  });

  it('rejects traversal, hidden files, and unsupported extensions', () => {
    vi.stubEnv(UPLOAD_ROOT_ENV, resolve(process.cwd(), 'mounted-uploads'));
    expect(resolveUploadFile([])).toBeNull();
    expect(resolveUploadFile(['..', 'secret.png'])).toBeNull();
    expect(resolveUploadFile(['places', 'a/../../x.png'])).toBeNull();
    expect(resolveUploadFile(['places', 'a\\..\\..\\x.png'])).toBeNull();
    expect(resolveUploadFile(['.env'])).toBeNull();
    expect(resolveUploadFile(['places', 'script.html'])).toBeNull();
  });
});
