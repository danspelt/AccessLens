/** Client-safe access code formatting (no database). */

export function generateAccessCode(): string {
  const buf = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buf);
  return String(100000 + (buf[0] % 900000));
}

export function normalizeAccessCode(input: string): string {
  return input.replace(/\D/g, '').slice(0, 6);
}

export function isValidAccessCodeFormat(code: string): boolean {
  return /^\d{6}$/.test(code);
}
