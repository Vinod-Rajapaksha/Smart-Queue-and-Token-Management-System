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

// Register Routes
app.use("/api", routes);

// Global Error Handler
app.use(errorHandler);

export default app;
