// src/features/messagesSlice.jsx
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async ({ senderId, receiverId, token }, { rejectWithValue }) => {
    try {
      const res = await axios.get("http://localhost:8000/messages", {
        params: { senderId, receiverId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Fetch failed");
    }
  }
);

const messagesSlice = createSlice({
  name: "messages",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    addMessage: (state, action) => {
      const exists = state.list.some(
        (m) =>
          m.senderId === action.payload.senderId &&
          m.text === action.payload.text &&
          m.time === action.payload.time
      );

      if (!exists) {
        state.list.push(action.payload);
      }
    },
    clearMessages: (state) => {
      state.list = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.map((msg) => ({
          text: msg.message,
          senderId: msg.senderId,
          from: "api",
          time: msg.createdAt,
        }));
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addMessage, clearMessages } = messagesSlice.actions;
export default messagesSlice.reducer;
