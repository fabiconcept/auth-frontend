import { createApi, fetchBaseQuery, BaseQueryFn } from "@reduxjs/toolkit/query/react"
import type { RootState } from "./index"
import { setCredentials, clearCredentials } from "./authSlice"

// Types
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: {
    id: string
    email: string
    name: string
  }
}

export interface GetProfileResponse {
  id: string
  email: string
  name: string
}

export interface AccessTokenResponse {
  accessToken: string
}

export interface User {
  id: string
  email: string
  name: string
}

// Environment configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5222"

// Original base query
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken
    if (token) {
      headers.set("authorization", `Bearer ${token}`)
    }
    return headers
  },
})

// Base query with automatic re-authentication
const baseQueryWithReauth: BaseQueryFn = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  const requestUrl = typeof args === 'string' ? args : args.url;

  if (result.error && result.error.status === 401) {
    // Do not retry for refresh token endpoint to avoid infinite loop
    if (requestUrl === '/auth/refresh') {
        api.dispatch(clearCredentials())
        return result
    }

    const refreshResult = await baseQuery({ url: "/auth/refresh", method: "POST" }, api, extraOptions)

    if (refreshResult.data) {
      const { accessToken } = refreshResult.data as AccessTokenResponse
      api.dispatch(setCredentials({ accessToken }))

      // Retry the original request with the new token
      result = await baseQuery(args, api, extraOptions)
    } else {
      console.log('[Auth] Token refresh failed. Logging out.');
      api.dispatch(clearCredentials())
    }
  }

  return result
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    refresh: builder.mutation<AccessTokenResponse, void>({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
        credentials: "include",
      }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled
          dispatch(clearCredentials())
        } catch (error) {
          console.error("[Auth] Logout failed:", error)
          // Even if logout fails on the server, clear credentials on the client
          dispatch(clearCredentials())
        }
      },
    }),
    getProfile: builder.query<GetProfileResponse, void>({
      query: () => {
        return "/api/profile";
      },
      providesTags: ["User"],
    }),
  }),
})

export const { useLoginMutation, useRefreshMutation, useLogoutMutation, useGetProfileQuery } = authApi
