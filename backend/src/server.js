import http from "http";
import app from "./app.js";
import config from "./config/env.js";
import connectDB from "./config/db.js";
import logger from "./config/logger.js";

// Connect DB
connectDB();

// Create server
const server = http.createServer(app);

// Start server
server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
});

// Handle unhandled errors
process.on("unhandledRejection", (err) => {
  logger.error("UNHANDLED REJECTION Shutting down...");
  logger.error(err);
  server.close(() => process.exit(1));
});
