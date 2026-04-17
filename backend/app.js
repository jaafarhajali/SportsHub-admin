require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const dashboardRoute = require("./routes/dashboardRoute");
const authRoute = require("./routes/authRoute");
const roleRoute = require("./routes/roleRoute");
const uploadRoute = require("./routes/uploadRoute");

const stadiumRoute = require("./routes/stadiumRoute");
const academyRoute = require("./routes/academyRoute");
const tournamentRoute = require("./routes/tournamentRoute");
const bookingRoute = require("./routes/bookingRoute");
const userRoute = require("./routes/userRoute");
const teamRoute = require("./routes/teamRoute");
const notificationRoute = require("./routes/notificationRoute");
const aiRoute = require("./routes/aiRoute");
const reviewRoute = require("./routes/reviewRoute");
const { aiLimiter, authLimiter } = require("./middlewares/rateLimiters");
const swaggerUi = require("swagger-ui-express");
const openapiSpec = require("./docs/openapi");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow non-browser requests (mobile apps, curl, Postman) with no Origin header
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);
app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "public")));

// API documentation (Swagger UI).
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec, { explorer: true }));
app.get("/api/docs.json", (req, res) => res.json(openapiSpec));

// Health check — for uptime monitors and deploy probes.
app.get("/api/health", (req, res) => {
  const mongoose = require("mongoose");
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({
    status: "ok",
    db: dbStates[mongoose.connection.readyState] || "unknown",
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Mount all routes
app.use("/api/dashboard", dashboardRoute);
app.use("/api/auth", authLimiter, authRoute);
app.use("/api/roles", roleRoute);
app.use("/api/upload", uploadRoute);

app.use("/api/stadiums", stadiumRoute);
app.use("/api/academies", academyRoute);
app.use("/api/tournaments", tournamentRoute);
app.use("/api/bookings", bookingRoute);
app.use("/api/users", userRoute);
app.use("/api/teams", teamRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/ai", aiLimiter, aiRoute);
app.use("/api/reviews", reviewRoute);


module.exports = app;
