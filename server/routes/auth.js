const express = require("express");
const User = require("../models/User");
const { hashPassword, verifyPassword, signToken } = require("../utils/auth");

const router = express.Router();

// ---------------------------------------------------------------------------
// POST /api/auth/signup
// ---------------------------------------------------------------------------
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Only teachers and coaches can self-register
    if (!["teacher", "coach"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Role must be either 'teacher' or 'coach'." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check for duplicate email
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res
        .status(409)
        .json({ message: "An account with that email already exists." });
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      passwordHash,
      role,
    });

    return res.status(201).json({ user: user.toPublic() });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Email, password, and role are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid email, password, or role." });
    }

    const passwordOk = await verifyPassword(password, user.passwordHash);
    if (!passwordOk) {
      return res
        .status(401)
        .json({ message: "Invalid email, password, or role." });
    }

    if (user.role !== role) {
      return res
        .status(401)
        .json({ message: "Invalid email, password, or role." });
    }

    const token = signToken({ userId: user._id.toString(), role: user.role });

    return res.status(200).json({ token, user: user.toPublic() });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
