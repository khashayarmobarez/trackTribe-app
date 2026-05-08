import { cookies } from 'next/headers';

/**
 * Server-side only.
 * Checks if the access token cookie exists.
 * Does not validate the token — that is the backend's responsibility.
 */
export async function getIsAuthenticatedFromCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.has('access_token');
}
