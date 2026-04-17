/**
 * Minimal structured logger. Zero dependencies.
 *
 * - In production (NODE_ENV=production) verbose logs are suppressed unless
 *   LOG_LEVEL explicitly raises them.
 * - Errors always log, regardless of level.
 * - Swap to Pino/Winston later by replacing this module — callers never change.
 */

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40, silent: 100 };

const envLevel = (process.env.LOG_LEVEL || "").toLowerCase();
const defaultLevel = process.env.NODE_ENV === "production" ? "warn" : "debug";
const currentLevel = LEVELS[envLevel] ?? LEVELS[defaultLevel];

function fmt(level, msg, meta) {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] ${level.toUpperCase()} ${msg}`;
  if (meta !== undefined) return [base, meta];
  return [base];
}

const logger = {
  debug(msg, meta) {
    if (LEVELS.debug >= currentLevel) console.debug(...fmt("debug", msg, meta));
  },
  info(msg, meta) {
    if (LEVELS.info >= currentLevel) console.log(...fmt("info", msg, meta));
  },
  warn(msg, meta) {
    if (LEVELS.warn >= currentLevel) console.warn(...fmt("warn", msg, meta));
  },
  error(msg, meta) {
    if (LEVELS.error >= currentLevel) console.error(...fmt("error", msg, meta));
  },
};

module.exports = logger;
