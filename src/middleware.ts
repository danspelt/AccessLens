import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/explore') ||
    pathname.startsWith('/places') ||
    pathname.startsWith('/cities') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/places') ||
    pathname.startsWith('/api/reports') ||
    pathname.startsWith('/uploads');

  if (isPublicRoute) return;

  if (!req.auth) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
