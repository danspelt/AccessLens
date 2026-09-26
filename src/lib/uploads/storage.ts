import { extname, isAbsolute, join, relative, resolve } from 'path';

export const UPLOAD_ROOT_ENV = 'UPLOAD_ROOT';

export const UPLOAD_CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.m4v': 'video/x-m4v',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
  '.ogv': 'video/ogg',
};

/**
 * Filesystem root for uploaded media. Public URLs remain under `/uploads`.
 * A relative configured path is resolved from the application working directory.
 */
export function getUploadRoot(): string {
  const configuredRoot = process.env[UPLOAD_ROOT_ENV]?.trim();
  if (!configuredRoot) {
    return join(process.cwd(), 'public', 'uploads');
  }

  return isAbsolute(configuredRoot)
    ? configuredRoot
    : resolve(/* turbopackIgnore: true */ process.cwd(), configuredRoot);
}

export function getUploadDirectory(context: string): string {
  return join(/* turbopackIgnore: true */ getUploadRoot(), context);
}

export function getUploadUrl(context: string, filename: string): string {
  return `/uploads/${context}/${filename}`;
}

/**
 * Map `/uploads/...` URL segments to a file inside the upload root.
 * Returns null for traversal attempts, hidden files, or unsupported extensions.
 */
export function resolveUploadFile(segments: string[]): { path: string; contentType: string } | null {
  if (!segments.length || segments.some((s) => !s || s.startsWith('.') || /[\\/\0]/.test(s))) return null;
  const contentType = UPLOAD_CONTENT_TYPES[extname(segments[segments.length - 1]).toLowerCase()];
  if (!contentType) return null;
  const root = getUploadRoot();
  const path = resolve(/* turbopackIgnore: true */ root, ...segments);
  const rel = relative(root, path);
  if (!rel || rel.startsWith('..') || isAbsolute(rel)) return null;
  return { path, contentType };
}
