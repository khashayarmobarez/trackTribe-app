/**
 * Route access rules for proxy.ts.
 * Add paths that require authentication or specific roles here.
 */

export const protectedRoutes = ['/dashboard', '/settings', '/profile'];
export const authRoutes = ['/login', '/register'];

export function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname.includes(route));
}

export function isAuthRoute(pathname: string): boolean {
  return authRoutes.some((route) => pathname.includes(route));
}
