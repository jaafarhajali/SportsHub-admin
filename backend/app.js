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

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "public")));

// Mount all routes
app.use("/api/dashboard", dashboardRoute);
app.use("/api/auth", authRoute);
app.use("/api/roles", roleRoute);
app.use("/api/upload", uploadRoute);

app.use("/api/stadiums", stadiumRoute);
app.use("/api/academies", academyRoute);
app.use("/api/tournaments", tournamentRoute);
app.use("/api/bookings", bookingRoute);
app.use("/api/users", userRoute);
app.use("/api/teams", teamRoute);
app.use("/api/notifications", notificationRoute);


module.exports = app;
