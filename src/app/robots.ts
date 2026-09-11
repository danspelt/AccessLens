import type { MetadataRoute } from 'next';
import { absoluteUrl, SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/dashboard/',
        '/student/',
        '/settings',
        '/favorites',
        '/my-reviews',
        '/my-places',
        '/activities',
        '/add-place',
        '/signin',
        '/signup',
        '/signup/',
        '/update-accessibility',
        '/update-accessibility/',
        '/places/new',
        '/places/*/claim',
        '/places/*/report',
        '/places/*/update-accessibility',
      ],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_URL.origin,
  };
}
