import React, { useState } from "react";
import { apiLoginUser } from "../services/api.service";
import { useNavigate } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await apiLoginUser(form);
      localStorage.setItem("token", response.data.token);
      alert("Login successful!");
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user)); // 👈 store user object
      navigate("/home"); // or "/dashboard" or wherever you want
      // optionally redirect to dashboard
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.error || "Invalid credentials");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
      />
      <button type="submit">Login</button>
      {error && <p>{error}</p>}
    </form>
  );
}

export default Login;
