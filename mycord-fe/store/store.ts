import { configureStore } from "@reduxjs/toolkit";
import { appState } from "./state";
import { authService } from "./services/authService";
import { setupListeners } from "@reduxjs/toolkit/query";
import { appService } from "./services/appService";

export const store = configureStore({
  reducer: {
    app: appState.reducer,
    [authService.reducerPath]: authService.reducer,
    [appService.reducerPath]: appService.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authService.middleware,
      appService.middleware
    ),
});

setupListeners(store.dispatch);

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
