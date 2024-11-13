import { RootState } from "./store";
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { deleteCookie } from "cookies-next";
import { AUTH_KEY } from "../constants";
import { toast } from "@/hooks/use-toast";

export const logoutFunc = () => {
  deleteCookie(AUTH_KEY);

  const homePath = `/auth`;

  if (window.location.pathname !== homePath) {
    window.location.href = homePath;
  } else {
    window.location.reload();
  }
};

export const prepareHeaders = async (
  headers: Headers,
  { getState, endpoint }: any
) => {
  const token = (getState() as RootState).app.accessToken;

  if (!["uploadFile", "uploadDocumentFile"].includes(endpoint)) {
    headers.set("Content-Type", "application/json");
  }

  if (token && ![""].includes(endpoint)) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
};

const baseQuery = (baseUrl = '/api') =>
  fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders,
  });

export function baseQueryInterceptor(
  baseUrl?: string
): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> {
  return async (args, api, extraOptions) => {
    const result = await baseQuery(baseUrl)(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
      toast({
        title: "Unauthorized",
        description: "Please login again",
      });
      logoutFunc();
    }

    return result;
  };
}
