import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index.js";
import errorHandler from "./middleware/error.js";
import requestLogger from "./middleware/requestLogger.js";

const app = express();

// Body parser
app.use(express.json());

// CORS
app.use(cors());

// Request Logger
app.use(requestLogger);

// Morgan logger
app.use(morgan("dev"));

// Health check
app.get("/health", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.status(200).send("ok");
});

// Register Routes
app.use("/api", routes);

// Global Error Handler
app.use(errorHandler);

export default app;
