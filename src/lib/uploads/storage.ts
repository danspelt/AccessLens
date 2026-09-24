import { isAbsolute, join, resolve } from 'path';

export const UPLOAD_ROOT_ENV = 'UPLOAD_ROOT';

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
