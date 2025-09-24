// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const JWT_SECRET = "mysecretkey123"; // in production use process.env.JWT_SECRET

const authMiddleware = async (req, res, next) => {
  // 1. Get token from header
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  // 2. Extract token (format: "Bearer token")
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Invalid token format" });
  }

  try {
    // 3. Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 4. Find user by ID from token payload
    const user = await User.findById(decoded.id).select("-password"); // exclude password
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // 5. Attach user to request object
    req.user = user;

    next(); // ✅ continue to controller
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;
