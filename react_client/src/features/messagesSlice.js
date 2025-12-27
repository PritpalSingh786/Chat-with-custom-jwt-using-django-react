import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch old messages
export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async ({ senderId, receiverId, token }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/messages`,
        {
          params: { senderId, receiverId },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch messages");
    }
  }
);

const messagesSlice = createSlice({
  name: "messages",
  initialState: {
    list: [],
    loading: false,
    error: null
  },
  reducers: {
    addMessage: (state, action) => {
      state.list.push(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.map(msg => ({
          text: msg.message,
          from: String(msg.senderId) === String(action.meta.arg.senderId) ? "me" : "other",
          time: new Date(msg.createdAt),
          senderId: msg.senderId
        }));
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { addMessage } = messagesSlice.actions;
export default messagesSlice.reducer;
