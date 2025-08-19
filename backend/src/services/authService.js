const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const authService = {
  async login(username, password) {
    try {
      const user = await User.findByUsername(username);
      if (!user) {
        return { success: false, message: "User not found" };
      }

      const isMatch = await User.comparePassword(password, user.password_hash);
      if (!isMatch) {
        return { success: false, message: "Invalid credentials" };
      }

      // User matched, create JWT payload
      const payload = {
        user: {
          id: user.id,
          username: user.username,
          // Add other user details if needed, but keep payload small
        },
      };

      // Sign the token
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" }); // Token expires in 1 hour

      return { success: true, token, user: { id: user.id, username: user.username } };
    } catch (error) {
      console.error("Error in login service:", error);
      return { success: false, message: "Server error during login" };
    }
  },

  async registerAdmin(username, password, email) {
    // This function is for initial setup or specific admin creation scenarios.
    // In a real app, you might want more controls around admin registration.
    try {
      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        return { success: false, message: "Username already exists" };
      }
      const newUser = await User.createUser(username, password, email);
      return { success: true, user: newUser };
    } catch (error) {
      console.error("Error in registerAdmin service:", error);
      return { success: false, message: "Server error during admin registration" };
    }
  },
};

module.exports = authService;

