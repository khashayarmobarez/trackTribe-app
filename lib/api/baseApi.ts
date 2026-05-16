import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';
import { logout } from '../store/slices/authSlice';

const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  credentials: 'include',
  prepareHeaders: (headers) => {
    // Add any custom headers here if needed (e.g., CSRF token)
    // Example: headers.set('X-CSRF-Token', getCSRFToken());
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  // If error is 401 (Unauthorized), try to refresh token
  if (result.error?.status === 401) {
    // Check if we're not already trying to refresh
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        // Try to refresh the token
        const refreshResult = await baseQuery(
          { url: '/auth/refresh', method: 'POST' },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          // Retry the original request with new token
          result = await baseQuery(args, api, extraOptions);
        } else {
          // Refresh failed - logout the user
          api.dispatch(logout());
          // Optional: redirect to login page
          // if (typeof window !== 'undefined') {
          //   window.location.href = `/login`;
          // }
        }
      } finally {
        release();
      }
    } else {
      // Wait for the mutex to unlock (another refresh in progress)
      await mutex.waitForUnlock();
      // Retry the original request
      result = await baseQuery(args, api, extraOptions);
    }
  }

  // Handle other error cases if needed
  if (result.error) {
    // You could add additional error handling here
    // e.g., for network errors, server errors, etc.
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Post'], // Add resource tags for cache invalidation
  endpoints: () => ({}),
});
