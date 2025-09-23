const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,      // no two users with same email
  },
  password: { type: String, required: true },
}, { timestamps: true }); // automatically adds createdAt & updatedAt

module.exports = mongoose.model("User", userSchema);
