import { Router } from "express";
import statusRoute from "./status.route.js";
import authRoutes from '../modules/auth/routes.js';
import branchRoutes from '../modules/branch/routes.js';
import counterRoutes from '../modules/counter/routes.js';

const router = Router();

router.use("/status", statusRoute);
router.use('/auth', authRoutes);
router.use('/branches', branchRoutes);
router.use('/counters', counterRoutes);

export default router;
