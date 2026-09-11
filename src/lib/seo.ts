import type { Metadata } from 'next';

export const SITE_NAME = 'AccessLens';
export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_APP_URL || 'https://www.accesslens.ca'
);

export const SITE_DESCRIPTION =
  'Find accessible places in Victoria and Vancouver, BC. Compare entrance, washroom, parking, sensory, and mobility details from community reviews, photos, and accessibility checklists.';

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

export function buildPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const socialTitle = `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: socialTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: 'en_CA',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: socialTitle,
      description,
    },
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
