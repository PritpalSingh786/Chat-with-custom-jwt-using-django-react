// src/features/usersSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk to fetch users with pagination and Bearer token
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async ({ page, perPage }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token"); // Get token
      const res = await axios.get(
        `http://localhost:8000/users?page=${page}&perPage=${perPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send token
          },
        }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Error fetching users"
      );
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState: {
    list: [],
    total: 0,
    page: 1,
    perPage: 10,
    hasNext: false,
    hasPrev: false,
    loading: false,
    error: null,
    currentChatUser: null, // Selected chat user
  },
  reducers: {
    setCurrentChatUser: (state, action) => {
      state.currentChatUser = action.payload;
    },
    clearCurrentChatUser: (state) => {
      state.currentChatUser = null; // Clear chat
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.users || [];
        state.total = action.payload.total || 0;
        state.page = action.payload.page || 1;
        state.perPage = action.payload.perPage || 10;
        state.hasNext =
          action.payload.page * action.payload.perPage <
          action.payload.total;
        state.hasPrev = action.payload.page > 1;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch users";
      });
  },
});

export const { setCurrentChatUser, clearCurrentChatUser } = usersSlice.actions;
export default usersSlice.reducer;
