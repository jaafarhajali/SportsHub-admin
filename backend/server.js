const app = require("./app");
const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

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
