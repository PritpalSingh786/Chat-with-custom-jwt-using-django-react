import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearAuthError } from "../features/authSlice";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const [formData, setFormData] = useState({
    userId: "",
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, successMessage } = useSelector(
    (state) => state.auth
  );

  // ✅ Clear old errors when page loads
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // frontend safety check
    if (
      !formData.userId.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      return;
    }

    dispatch(registerUser(formData));
  };

  // ✅ Redirect after success
  useEffect(() => {
    if (successMessage && !error) {
      const timer = setTimeout(() => {
        navigate("/login");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [successMessage, error, navigate]);

  return (
    <div className="register-container">
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        {/* User ID */}
        <input
          type="text"
          name="userId"
          placeholder="User ID"
          value={formData.userId}
          onChange={handleChange}
        />
        {error?.userId && (
          <small className="error">{error.userId[0]}</small>
        )}

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        {error?.email && (
          <small className="error">{error.email[0]}</small>
        )}

        {/* Password */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
        {error?.password && (
          <small className="error">{error.password[0]}</small>
        )}

        {/* Non-field errors (if any) */}
        {error?.non_field_errors && (
          <small className="error">{error.non_field_errors[0]}</small>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      {/* Success message */}
      {successMessage && !error && (
        <p className="success">{successMessage}</p>
      )}
    </div>
  );
}

export default Register;
