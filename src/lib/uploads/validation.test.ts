import { describe, expect, it } from 'vitest';
import { ALLOWED_UPLOAD_CONTEXTS, classifyUpload, contentMatchesType } from './validation';

describe('upload validation', () => {
  it('rejects executable content disguised as an image', () => {
    expect(contentMatchesType(new TextEncoder().encode('MZ executable'), 'image/png')).toBe(false);
  });
  it('recognizes PNG signatures and supported classifications', () => {
    expect(contentMatchesType(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), 'image/png')).toBe(true);
    expect(classifyUpload('image/png')?.extension).toBe('png');
  });
  it('does not permit path-like upload contexts', () => {
    expect(ALLOWED_UPLOAD_CONTEXTS.has('../../outside')).toBe(false);
  });
});
