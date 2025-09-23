const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://Bala:Bala2002@cluster0.gjhzkvy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
    console.log("MongoDB Connected");
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = connectDB;
