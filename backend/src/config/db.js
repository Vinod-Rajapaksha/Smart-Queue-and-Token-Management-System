import mongoose from "mongoose";
import config from "./env.js";
import logger from "./logger.js";

const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    logger.info("MongoDB Connected Successfully");
  } catch (error) {
    logger.error("MongoDB Connection Failed");
    logger.error(error);
    process.exit(1);
  }

  // Graceful Shutdown
  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed.");
    process.exit(0);
  });
};

export default connectDB;
