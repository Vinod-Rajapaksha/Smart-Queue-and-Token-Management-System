import { Router } from "express";
import statusRoute from "./status.route.js";
import authRoutes from '../modules/auth/routes.js';

const router = Router();

router.use("/status", statusRoute);
router.use('/auth', authRoutes);

export default router;
