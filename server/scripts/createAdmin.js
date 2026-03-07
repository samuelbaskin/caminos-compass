/**
 * One-time script to seed an admin user.
 *
 * Usage:
 *   ADMIN_EMAIL=admin@caminos.edu ADMIN_PASSWORD=YourPassword node scripts/createAdmin.js
 *
 * Or set values in the .env file and run:
 *   node scripts/createAdmin.js
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");
const { hashPassword } = require("../utils/auth");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/caminos-compass";
const ADMIN_FIRST = process.env.ADMIN_FIRST || "Admin";
const ADMIN_LAST = process.env.ADMIN_LAST || "User";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    "Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required."
  );
  process.exit(1);
}

(async () => {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB.");

  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    console.log(`Admin already exists: ${ADMIN_EMAIL}`);
    await mongoose.disconnect();
    process.exit(0);
  }

  const passwordHash = await hashPassword(ADMIN_PASSWORD);
  const admin = await User.create({
    firstName: ADMIN_FIRST,
    lastName: ADMIN_LAST,
    email: ADMIN_EMAIL.toLowerCase(),
    passwordHash,
    role: "admin",
  });

  console.log("Admin created:", admin.toPublic());
  await mongoose.disconnect();
  process.exit(0);
})().catch((err) => {
  console.error("Error creating admin:", err.message);
  process.exit(1);
});
