import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(
    process.env.SESSION_COOKIE_NAME || 'accesslens_session'
  );

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/explore',
    '/places',
    '/api/health',
    '/api/auth',
  ];

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some((route) => {
    if (route === '/places') {
      return pathname.startsWith('/places');
    }
    if (route === '/api/auth') {
      return pathname.startsWith('/api/auth');
    }
    return pathname === route;
  });

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protected routes require session cookie
  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

