const { verifyToken } = require("../utils/auth");

/**
 * Middleware that validates the Bearer JWT and attaches { userId, role }
 * to req.user. Returns 401 if the token is missing or invalid.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const payload = verifyToken(token);
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

/**
 * Returns middleware that only allows one or more specific roles.
 * Must be used after requireAuth.
 * @param {string|string[]} roles
 */
function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user || !allowed.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden." });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
