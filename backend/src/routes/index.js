import { Router } from "express";
import statusRoute from "./status.route.js";
import authRoutes from '../modules/auth/routes.js';
import branchRoutes from '../modules/branch/routes.js';
import counterRoutes from '../modules/counter/routes.js';
import queueRoutes from '../modules/queue/routes.js';
import tokenRoutes from '../modules/token/routes.js';

const router = Router();

router.use("/status", statusRoute);
router.use('/auth', authRoutes);
router.use('/branches', branchRoutes);
router.use('/counters', counterRoutes);
router.use('/queues', queueRoutes);
router.use('/tokens', tokenRoutes);

export default router;
