// src/features/postsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk to create a post
export const createPost = createAsyncThunk(
  "posts/createPost",
  async ({ postTitle, invited_ids }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token"); // Assuming you store token here
      const response = await axios.post(
        `http://localhost:8000/createPost`,
        { postTitle, invited_ids },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      // Return error message for rejected action
      return rejectWithValue(err.response?.data?.detail || err.message);
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
        state.error = null;
        state.success = false;
      })
      .addCase(createPost.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.success = true;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create post";
        state.success = false;
      });
  },
});

export const { resetState } = postsSlice.actions;
export default postsSlice.reducer;
