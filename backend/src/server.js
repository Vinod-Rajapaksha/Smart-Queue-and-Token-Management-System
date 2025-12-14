import http from "http";
import app from "./app.js";
import config from "./config/env.js";
import connectDB, { closeDB } from "./config/db.js";
import logger from "./config/logger.js";
import { startQueueCleanupJob } from "./jobs/queueCleanup.js";

let server;
let cleanupJob;

const startServer = async () => {
  try {
    // Connect DB first
    await connectDB();

    // Create server
    server = http.createServer(app);

    // Start background jobs
    cleanupJob = startQueueCleanupJob();

    // Start server
    server.listen(config.PORT, () => {
      logger.info(
        `Server running on port ${config.PORT} in ${config.NODE_ENV} mode`
      );
    });
  } catch (err) {
    logger.error("Failed to start server");
    logger.error(err);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown helper
const shutdown = async (reason, err, exitCode = 0) => {
  logger.error(`${reason} Shutting down...`);
  if (err) logger.error(err);

  try {
    cleanupJob?.stop?.();
  } catch (e) {
    logger.error("Failed to stop cleanup job");
    logger.error(e);
  }

  try {
    await closeDB();
  } catch (e) {
    logger.error("Failed to close database connection");
    logger.error(e);
  }

  if (!server) return process.exit(exitCode);

  server.close(() => {
    process.exit(exitCode);
  });
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  shutdown("UNHANDLED REJECTION", err, 1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  shutdown("UNCAUGHT EXCEPTION", err, 1);
});

// Handle container/platform shutdown signals
process.on("SIGTERM", () => shutdown("SIGTERM", null, 0));
process.on("SIGINT", () => shutdown("SIGINT", null, 0));
