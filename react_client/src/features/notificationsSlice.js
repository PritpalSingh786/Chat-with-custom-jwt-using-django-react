import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  count: 0,
  notifications: [],
  page: 1,
  perPage: 5,
  total: 0,
  loading: false,
  error: null,
  unreadCount: 0,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async ({ page = 1, perPage = 5 }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return thunkAPI.rejectWithValue("No auth token found");
      }

      const response = await axios.get(`http://localhost:8000/notifications`, {
        params: { page, perPage },
        headers: { Authorization: `Bearer ${token}` },
      });

      return {
        notifications: response.data.notifications,
        total: response.data.total,
        page: response.data.page,
        perPage: response.data.perPage,
        unreadCount: response.data.notifications.filter(n => !n.read).length
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch notifications"
      );
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return thunkAPI.rejectWithValue("No auth token found");
      }

      await axios.patch(
        `http://localhost:8000/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return notificationId;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to mark as read"
      );
    }
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.total += 1;
      state.unreadCount += 1;
    },
    clearNotifications: (state) => {
      return { ...initialState };
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.perPage = action.payload.perPage;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

export const { addNotification, clearNotifications, setPage } = notificationsSlice.actions;
export default notificationsSlice.reducer;