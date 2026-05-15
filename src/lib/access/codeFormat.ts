/** Client-safe access code formatting (no database). */

export function generateAccessCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function normalizeAccessCode(input: string): string {
  return input.replace(/\D/g, '').slice(0, 6);
}

export function isValidAccessCodeFormat(code: string): boolean {
  return /^\d{6}$/.test(code);
}
