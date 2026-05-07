/**
 * Authentication middleware helpers for Next.js
 * These utilities help with route protection and authentication state management
 */

import { redirect } from 'next/navigation';
import { getSessionFromStorage } from './session';

/**
 * Check if user is authenticated (client-side)
 * Uses session storage to determine authentication state
 */
export function isAuthenticated(): boolean {
  return getSessionFromStorage() !== null;
}

/**
 * Get current user from session (client-side)
 */
export function getCurrentUser() {
  const session = getSessionFromStorage();
  return session?.user || null;
}

/**
 * Protect a route - redirect to login if not authenticated
 * For use in client components or custom middleware
 */
export function protectRoute(redirectPath: string = '/login'): void {
  if (!isAuthenticated()) {
    redirect(redirectPath);
  }
}

/**
 * Redirect authenticated users away from auth pages (login, register)
 * For use in client components or custom middleware
 */
export function redirectIfAuthenticated(redirectPath: string = '/dashboard'): void {
  if (isAuthenticated()) {
    redirect(redirectPath);
  }
}

/**
 * Check if user has required role
 */
export function hasRole(requiredRole: string): boolean {
  const user = getCurrentUser();
  return user?.role === requiredRole;
}

/**
 * Check if user has any of the required roles
 */
export function hasAnyRole(requiredRoles: string[]): boolean {
  const user = getCurrentUser();
  return requiredRoles.some((role) => user?.role === role);
}

/**
 * Route protection configuration
 */
export interface RouteProtectionConfig {
  requireAuth?: boolean;
  requiredRoles?: string[];
  redirectTo?: string;
}

/**
 * Validate route access based on protection config
 */
export function validateRouteAccess(config: RouteProtectionConfig): boolean {
  const { requireAuth = false, requiredRoles = [] } = config;

  // Check authentication
  if (requireAuth && !isAuthenticated()) {
    return false;
  }

  // Check roles if required
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return false;
  }

  return true;
}
