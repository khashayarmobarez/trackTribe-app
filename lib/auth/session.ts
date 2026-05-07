/**
 * Session management utilities for authentication
 * Handles cookie-based session operations
 */

import type { SessionData } from '@/types/auth';

/**
 * Key for storing session data in localStorage (for non-sensitive data only)
 */
const SESSION_STORAGE_KEY = 'auth_session';

/**
 * Get session data from localStorage (non-sensitive data only)
 * Note: Tokens are stored as httpOnly cookies, not in localStorage
 */
export function getSessionFromStorage(): SessionData | null {
  if (typeof window === 'undefined') return null;

  try {
    const sessionStr = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionStr) return null;

    const session = JSON.parse(sessionStr) as SessionData;

    // Check if session is expired
    if (new Date(session.expires) < new Date()) {
      clearSessionFromStorage();
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error reading session from storage:', error);
    clearSessionFromStorage();
    return null;
  }
}

/**
 * Save session data to localStorage (non-sensitive data only)
 * Note: Tokens are stored as httpOnly cookies by the server
 */
export function saveSessionToStorage(session: SessionData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Error saving session to storage:', error);
  }
}

/**
 * Clear session data from localStorage
 */
export function clearSessionFromStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing session from storage:', error);
  }
}

/**
 * Check if a session exists and is valid
 */
export function hasValidSession(): boolean {
  const session = getSessionFromStorage();
  return session !== null;
}

/**
 * Extract user data from session
 */
export function getUserFromSession(): SessionData['user'] | null {
  const session = getSessionFromStorage();
  return session?.user || null;
}
