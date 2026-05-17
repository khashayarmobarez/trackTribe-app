/**
 * Route access rules for proxy.ts.
 * Add paths that require authentication or specific roles here.
 */

export const protectedRoutes = ['/dashboard', '/settings', '/profile'];
export const authRoutes = ['/login', '/register'];

export function isProtectedRoute(pathname: string): boolean {
  // Remove locale prefix for checking
  const withoutLocale = pathname.replace(/^\/(fa|en)/, '') || '/';
  return protectedRoutes.some(
    (route) => withoutLocale === route || withoutLocale.startsWith(route + '/')
  );
}

export function isAuthRoute(pathname: string): boolean {
  const withoutLocale = pathname.replace(/^\/(fa|en)/, '') || '/';
  return authRoutes.some(
    (route) => withoutLocale === route || withoutLocale.startsWith(route + '/')
  );
}
