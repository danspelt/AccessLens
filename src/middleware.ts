import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname === '/login' || pathname.startsWith('/login/')) {
    const url = req.nextUrl.clone();
    url.pathname = '/signin';
    return NextResponse.redirect(url, 308);
  }

  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/signin') ||
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
    const signInUrl = new URL('/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return Response.redirect(signInUrl);
  }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
