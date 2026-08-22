/** Validate launch configuration without printing secret values or connecting to services. */
const errors: string[] = [];
const warnings: string[] = [];

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) errors.push(`${name} is required.`);
  return value ?? '';
}

const mongoUri = required('MONGODB_URI');
required('MONGODB_DB');
const authSecret = process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim() || '';
if (authSecret.length < 32) errors.push('AUTH_SECRET must be at least 32 characters.');
const businessSecret = process.env.BUSINESS_SESSION_SECRET?.trim() || process.env.SESSION_SECRET?.trim() || '';
if (businessSecret.length < 32) errors.push('BUSINESS_SESSION_SECRET must be at least 32 characters.');

if (mongoUri) {
  try {
    const url = new URL(mongoUri);
    if (url.protocol !== 'mongodb:' && url.protocol !== 'mongodb+srv:') errors.push('MONGODB_URI must use mongodb:// or mongodb+srv://.');
  } catch {
    errors.push('MONGODB_URI is not a valid MongoDB URL.');
  }
}

if (process.env.NODE_ENV === 'production') {
  for (const name of ['AUTH_URL', 'NEXT_PUBLIC_APP_URL']) {
    const value = required(name);
    if (value) {
      try {
        if (new URL(value).protocol !== 'https:') errors.push(`${name} must use HTTPS in production.`);
      } catch {
        errors.push(`${name} must be a valid absolute URL.`);
      }
    }
  }
  if (process.env.AUTH_TRUST_HOST !== 'false') warnings.push('AUTH_TRUST_HOST trusts the reverse-proxy Host header; confirm the proxy overwrites untrusted Host values.');
  warnings.push('Mount persistent storage at /app/public/uploads or replace local uploads before deployment.');
}

if (Boolean(process.env.GOOGLE_CLIENT_ID) !== Boolean(process.env.GOOGLE_CLIENT_SECRET)) errors.push('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set together.');
if (process.env.RESEND_API_KEY && !process.env.RESEND_FROM_EMAIL) errors.push('RESEND_FROM_EMAIL is required when RESEND_API_KEY is set.');

warnings.forEach((warning) => console.warn(`WARNING: ${warning}`));
if (errors.length) {
  errors.forEach((error) => console.error(`ERROR: ${error}`));
  process.exitCode = 1;
} else {
  console.log('Environment shape is valid. Service connectivity still requires readiness and manual auth/upload checks.');
}
