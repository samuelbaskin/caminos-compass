const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret_in_production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

/**
 * Hash a plain-text password.
 * @param {string} plain
 * @returns {Promise<string>}
 */
async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * Compare a plain-text password against a stored hash.
 * @param {string} plain
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

/**
 * Sign a JWT containing userId and role.
 * @param {{ userId: string, role: string }} payload
 * @returns {string}
 */
function signToken({ userId, role }) {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT.
 * @param {string} token
 * @returns {{ userId: string, role: string }}
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { hashPassword, verifyPassword, signToken, verifyToken };
