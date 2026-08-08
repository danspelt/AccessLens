/** OAuth / magic-link are optional; credentials (email + password) is always available. */
export function isGoogleAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function isResendAuthConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}
