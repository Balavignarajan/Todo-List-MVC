import React, { useState } from "react";
import { apiRegisterUser } from "../services/api.service";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await apiRegisterUser(form);
      localStorage.setItem("token", response.data.token);
      alert("Registration successful!");
      navigate("/login"); // or "/dashboard" or wherever you want

    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" onChange={handleChange} />
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
        />
        <button type="submit">Register</button>
        {error && <p>{error}</p>}
      </form>
    </>
  );
};

export default Register;
