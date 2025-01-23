import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getCookie, setCookie } from "cookies-next";
import { AUTH_KEY } from "../constants";
import { Message, ServerDetail, SocketEvent, User } from "@/interfaces/app";

export interface AppState {
  accessToken: string | null;
  user: User | null;
  isMicDisabled: boolean;
  isHeadphoneDisabled: boolean;
  isVideoDisabled: boolean;
  currentServer: ServerDetail | null;
  rtcUserId: string | null;
  onlineUsers: { id: string; user: User }[];
  socketEventQueue: SocketEvent[];
  socketLatency: number;
  newMessages: Message[];
}

const initialState: AppState = {
  accessToken: getCookie(AUTH_KEY) ?? null,
  user: null,
  isMicDisabled: getCookie("isMicDisabled") === "true",
  isHeadphoneDisabled: getCookie("isHeadphoneDisabled") === "true",
  isVideoDisabled: getCookie("isVideoDisabled") === "true",
  currentServer: null,
  rtcUserId: null,
  onlineUsers: [],
  socketEventQueue: [],
  socketLatency: 0,
  newMessages: [],
};

export const appState = createSlice({
  name: "app",
  initialState,
  reducers: {
    setAuthTokens: (
      state,
      {
        payload,
      }: PayloadAction<{
        token: string;
      }>
    ) => {
      const { token } = payload;
      state.accessToken = token;
    },
    setUser: (state, { payload }: PayloadAction<User>) => {
      state.user = payload;
    },
    setIsMicDisabled: (
      state,
      { payload }: PayloadAction<{ value: boolean }>
    ) => {
      state.isMicDisabled = payload.value;
      setCookie("isMicDisabled", payload.value.toString());
    },
    setIsHeadphoneDisabled: (
      state,
      { payload }: PayloadAction<{ value: boolean }>
    ) => {
      state.isHeadphoneDisabled = payload.value;
      setCookie("isHeadphoneDisabled", payload.value.toString());
    },
    setIsVideoDisabled: (
      state,
      { payload }: PayloadAction<{ value: boolean }>
    ) => {
      state.isVideoDisabled = payload.value;
      setCookie("isVideoDisabled", payload.value.toString());
    },
    setCurrentServer: (state, { payload }: PayloadAction<ServerDetail>) => {
      state.currentServer = payload;
    },
    setUserId: (state, { payload }: PayloadAction<{ id: string | null }>) => {
      state.rtcUserId = payload.id;
    },
    setOnlineUsers: (
      state,
      { payload }: PayloadAction<{ id: string; user: User }[]>
    ) => {
      state.onlineUsers = payload;
    },
    addToSocketEventQueue: (state, { payload }: PayloadAction<SocketEvent>) => {
      state.socketEventQueue?.push(payload);
    },
    removeFromSocketEventQueue: (state, { payload }: PayloadAction<string>) => {
      state.socketEventQueue = state.socketEventQueue?.filter(
        (event) => event.id !== payload
      );
    },
    setSocketLatency: (state, { payload }: PayloadAction<number>) => {
      state.socketLatency = payload;
    },
    addNewMessage: (state, { payload }: PayloadAction<Message>) => {
      state.newMessages.push(payload);
    },
    removeNewMessage: (
      state,
      { payload }: PayloadAction<string | string[]>
    ) => {
      if (Array.isArray(payload)) {
        state.newMessages = state.newMessages.filter(
          (message) => !payload.includes(message.id)
        );
      } else {
        state.newMessages = state.newMessages.filter(
          (message) => message.id !== payload
        );
      }
    },
  },
});

export const {
  setAuthTokens,
  setUser,
  setIsMicDisabled,
  setIsHeadphoneDisabled,
  setIsVideoDisabled,
  setCurrentServer,
  setUserId,
  setOnlineUsers,
  addToSocketEventQueue,
  removeFromSocketEventQueue,
  setSocketLatency,
  addNewMessage,
  removeNewMessage,
} = appState.actions;

export default appState.reducer;
