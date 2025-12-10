import { Router } from "express";
import statusRoute from "./status.route.js";

const router = Router();

router.use("/status", statusRoute);

export default router;
