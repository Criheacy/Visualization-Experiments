import { configureStore } from "@reduxjs/toolkit";

export const rootReducer = {};

export const store = configureStore({
  reducer: rootReducer,
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
