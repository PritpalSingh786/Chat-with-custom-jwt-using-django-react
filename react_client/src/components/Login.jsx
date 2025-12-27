// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser, clearAuthError } from "../features/authSlice";
import "./Login.css";

function Login() {
  const [formData, setFormData] = useState({ userId: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isLoggedIn } = useSelector((state) => state.auth);

  // ✅ Clear previous register errors when opening Login page
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };

  // Redirect to Sidebar after login
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/sidebar");
    }
  }, [isLoggedIn, navigate]);

  // Clear form on logout
  useEffect(() => {
    if (!isLoggedIn) {
      setFormData({ userId: "", password: "" });
    }
  }, [isLoggedIn]);

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="userId"
          placeholder="User ID"
          value={formData.userId}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

export default Login;
