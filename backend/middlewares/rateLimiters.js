const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

/**
 * AI endpoints are expensive (each call costs real tokens).
 * Tight limit per user / IP to prevent runaway cost.
 */
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // 15 requests per minute per key
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // Prefer authenticated user id so different users behind the same IP
    // don't share a quota; fall back to IPv6-safe IP key for unauthenticated requests.
    const userId = req.user && (req.user.id || req.user._id);
    if (userId) return String(userId);
    return ipKeyGenerator(req, res);
  },
  message: {
    error: "Too many AI requests. Please wait a moment and try again.",
    code: "AI_RATE_LIMIT",
  },
});

/**
 * Auth endpoints — protect login / register / forgot-password from brute force.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many attempts. Please try again later.",
    code: "AUTH_RATE_LIMIT",
  },
});

module.exports = { aiLimiter, authLimiter };
