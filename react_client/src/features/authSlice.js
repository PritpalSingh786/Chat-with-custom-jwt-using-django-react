// src/features/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// ------------------- REGISTER USER -------------------
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/createUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        // 🔴 send full error object
        return rejectWithValue(data);
      }

      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ------------------- LOGIN USER -------------------
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.log("Login error data:", errorData);
        return rejectWithValue(errorData.message || "Login failed");
      }

      return await res.json(); // { message, userId, email, id, token }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ------------------- LOGOUT USER -------------------
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token, user } = getState().auth;
      const userId = user.userId; // ✅ get userId from redux state
      const res = await fetch("http://127.0.0.1:8000/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        return rejectWithValue(errorData.message || "Logout failed");
      }

      return await res.json(); // { message, userId, isLogin }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ------------------- INITIAL STATE -------------------
const token = localStorage.getItem("token");
const storedUser = localStorage.getItem("user");

const initialState = {
  isLoggedIn: !!token,
  user: storedUser ? JSON.parse(storedUser) : null,
  loading: false,
  error: null,
  successMessage: null,
  token: token || null,
};

// ------------------- SLICE -------------------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ------------------- REGISTER -------------------
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ------------------- LOGIN -------------------
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = {
          userId: action.payload.userId,
          email: action.payload.email,
          id: action.payload.id,
        };
        state.token = action.payload.token;

        // Save to localStorage
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(state.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ------------------- LOGOUT -------------------
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoggedIn = false;
        state.user = null;
        state.token = null;
        state.error = null;
        state.successMessage = null;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      })
      .addCase(logoutUser.rejected, (state, action) => {
        // Even if API fails, still log out locally
        state.isLoggedIn = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        state.error = action.payload; // Store error message if needed
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
