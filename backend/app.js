const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const todoRoutes = require("./routes/todoRoutes");
const authRoutes = require("./routes/authRoutes");
const connectDB = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());


//connect DB
connectDB();

//use routes
app.use("/api/todos", todoRoutes); 
//Login auth
app.use("/api/auth", authRoutes);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});