import { baseApi } from '../baseApi';
import type { IUser } from '@/types/auth';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<IUser, void>({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation<IUser, Partial<IUser>>({
      query: (body) => ({ url: '/users/me', method: 'PATCH', body }),
      invalidatesTags: ['User'],
    }),
    // Example of a protected endpoint that will automatically use token refresh
    getUserById: builder.query<IUser, string>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
  }),
});

export const { useGetMeQuery, useUpdateProfileMutation, useGetUserByIdQuery } = userApi;
