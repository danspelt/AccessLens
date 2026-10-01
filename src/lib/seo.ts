import type { Metadata } from 'next';

export const SITE_NAME = 'AccessLens';
export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_APP_URL || 'https://www.accesslens.ca'
);

export const SITE_DESCRIPTION =
  'Find accessible places in Victoria and Vancouver, BC. Compare entrance, washroom, parking, sensory, and mobility details from community reviews, photos, and accessibility checklists.';

export const SHARE_IMAGE = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'AccessLens: accessible places in Victoria and Vancouver, BC',
};

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
      images: [SHARE_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: [SHARE_IMAGE.url],
    },
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
