// src/features/postsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const createPost = createAsyncThunk(
  "posts/createPost",
  async ({ postTitle, invitedPostUsers }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:8000/createPost",
        {
          postTitle,
          invitedPostUsers, // ✅ MATCHES SERIALIZER
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Post create failed");
    }
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState: {
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPost.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPost.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetState } = postsSlice.actions;
export default postsSlice.reducer;
