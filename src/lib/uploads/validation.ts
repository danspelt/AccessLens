export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
export const ALLOWED_UPLOAD_CONTEXTS = new Set(['general', 'places', 'submissions', 'reviews', 'reports']);

const IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v', 'video/ogg']);

export function classifyUpload(type: string): { kind: 'image' | 'video'; maxSize: number; extension: string } | null {
  if (IMAGE_TYPES.has(type)) {
    return { kind: 'image', maxSize: MAX_IMAGE_SIZE, extension: type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg' };
  }
  if (VIDEO_TYPES.has(type)) {
    const extension = type === 'video/webm' ? 'webm' : type === 'video/ogg' ? 'ogv' : type === 'video/x-m4v' ? 'm4v' : type === 'video/quicktime' ? 'mov' : 'mp4';
    return { kind: 'video', maxSize: MAX_VIDEO_SIZE, extension };
  }
  return null;
}

export function contentMatchesType(bytes: Uint8Array, type: string): boolean {
  if (type === 'image/jpeg' || type === 'image/jpg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === 'image/png') return bytes.slice(0, 8).every((value, index) => value === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index]);
  if (type === 'image/webp') return ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 12) === 'WEBP';
  if (type === 'video/webm') return bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
  if (type === 'video/ogg') return ascii(bytes, 0, 4) === 'OggS';
  if (type === 'video/mp4' || type === 'video/quicktime' || type === 'video/x-m4v') return ascii(bytes, 4, 8) === 'ftyp';
  return false;
}

function ascii(bytes: Uint8Array, start: number, end: number): string {
  return String.fromCharCode(...bytes.slice(start, end));
}
