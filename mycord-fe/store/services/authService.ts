import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryInterceptor } from "../baseQuery";
import { Login, LoginResponse, Register, User } from "@/interfaces/auth";

export const authService = createApi({
  reducerPath: "authService",
  baseQuery: baseQueryInterceptor(),
  endpoints: (builder) => ({
    currentUser: builder.query<User, void>({
      query: () => "/auth",
    }),
    login: builder.mutation<LoginResponse, Login>({
      query: (body) => ({
        method: "POST",
        url: "/auth/login",
        body,
      }),
    }),
    register: builder.mutation<boolean, Register>({
      query: (body) => ({
        method: "POST",
        url: "/auth/register",
        body,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: (body) => ({
        method: "DELETE",
        url: "/auth/logout",
        body,
      }),
    }),
  }),
});

export const {
  useLogoutMutation,
  useLoginMutation,
  useRegisterMutation,
  useCurrentUserQuery,
} = authService;
