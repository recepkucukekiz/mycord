import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryInterceptor } from "../baseQuery";
import { Server, Channel, Message, ServerDetail, Bug } from "@/interfaces/app";

export const appService = createApi({
  reducerPath: "appService",
  baseQuery: baseQueryInterceptor(),
  tagTypes: ["Server", "Channel", "Message", "Bugs"],
  endpoints: (builder) => ({
    getServers: builder.query<Server[], void>({
      query: () => "/server",
      providesTags: ["Server"],
    }),
    getServer: builder.query<ServerDetail, string>({
      query: (id) => `/server/${id}`,
      providesTags: ["Channel"],
    }),
    addServer: builder.mutation<any, Omit<Server, "id">>({
      query: (body) => ({
        method: "POST",
        url: "/server",
        body,
      }),
      invalidatesTags: ["Server"],
    }),
    deleteServer: builder.mutation<any, string>({
      query: (id) => ({
        method: "DELETE",
        url: `/server/${id}`,
      }),
    }),
    getChannels: builder.query<Channel[], void>({
      query: () => `/channel`,
    }),
    getChannel: builder.query<Channel, string>({
      query: (id) => `/channel/${id}`,
    }),
    addChannel: builder.mutation<any, Omit<Channel, "id">>({
      query: (body) => ({
        method: "POST",
        url: "/channel",
        body,
      }),
      invalidatesTags: ["Channel"],
    }),
    deleteChannel: builder.mutation<any, string>({
      query: (id) => ({
        method: "DELETE",
        url: `/channel/${id}`,
      }),
    }),
    getMessagesByChannel: builder.query<Message[], string>({
      query: (id) => `/message/by-channel/${id}`,
    }),
    addMessage: builder.mutation<any, Pick<Message, "content" | "channel_id">>({
      query: (body) => ({
        method: "POST",
        url: "/message",
        body,
      }),
    }),
    deleteMessage: builder.mutation<any, string>({
      query: (id) => ({
        method: "DELETE",
        url: `/message/${id}`,
      }),
    }),
    getBugList: builder.query<Bug[], void>({
      query: () => "/buglist",
      providesTags: ["Bugs"],
    }),
    addBug: builder.mutation<Bug, Pick<Bug, "bug">>({
      query: (body) => ({
        method: "POST",
        url: "/buglist",
        body,
      }),
      invalidatesTags: ["Bugs"],
    }),
  }),
});

export const {
  useGetServersQuery,
  useGetServerQuery,
  useAddServerMutation,
  useDeleteServerMutation,
  useGetChannelsQuery,
  useGetChannelQuery,
  useAddChannelMutation,
  useDeleteChannelMutation,
  useGetMessagesByChannelQuery,
  useAddMessageMutation,
  useDeleteMessageMutation,
  useGetBugListQuery,
  useAddBugMutation,
} = appService;
