// proxy.ts
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './lib/i18n/routing';
import { isProtectedRoute, isAuthRoute } from './lib/auth/middleware-helpers';
import { verifyAccessToken } from './lib/auth/jwt';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const token = req.cookies.get('access_token')?.value;

  // fix — always verify if token exists
  let isAuthed = false;
  if (token) {
    try {
      await verifyAccessToken(token);
      isAuthed = true;
    } catch {
      isAuthed = false;
    }
  }

  if (isAuthRoute(pathname) && isAuthed) {
    const locale = pathname.split('/')[1] || 'fa';
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
  }

  if (isProtectedRoute(pathname) && !isAuthed) {
    const locale = pathname.split('/')[1] || 'fa';
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
