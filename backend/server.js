const dotenv = require("dotenv");
dotenv.config();

// Sentry must be required and initialized BEFORE anything else so it can
// auto-instrument http / express / mongoose. If SENTRY_DSN is not set we
// still require the module but skip .init() — the app works normally without it.
const Sentry = require("@sentry/node");
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
  });
  console.log("Sentry initialized");
}

const app = require("./app");
const http = require("http");
const dns = require("dns");
const mongoose = require("mongoose");

// Sentry's Express error handler must be registered AFTER all routes.
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// Force public DNS resolvers so MongoDB SRV lookups work behind restrictive local DNS
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const DB = process.env.DATABASE.replace("<DATABASE_PASSWORD>", process.env.DATABASE_PASSWORD);

require('./utils/bookingCleanupJob');

mongoose
  .connect(DB)
  .then(() => console.log("DB connection successful!"))
  .catch((err) => console.error("DB connection error:", err));

// Set port
const PORT = process.env.PORT || 8888;
app.set("port", PORT);

// Create HTTP server
const server = http.createServer(app);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});

// Handle server errors
server.on("error", (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }

  switch (error.code) {
    case "EACCES":
      console.error(`Port ${PORT} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`Port ${PORT} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});
