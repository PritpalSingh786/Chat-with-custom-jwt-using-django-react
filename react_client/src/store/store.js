import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import usersReducer from "../features/usersSlice";
import messagesReducer from "../features/messagesSlice";
import postsReducer from "../features/postsSlice";
import notificationsReducer from "../features/notificationsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    messages: messagesReducer,
    posts: postsReducer,
    notifications: notificationsReducer,
  },
});
