import { Router } from "express";
import statusRoute from "./status.route.js";
import authRoutes from '../modules/auth/routes.js';
import userRoutes from '../modules/user/routes.js';
import branchRoutes from '../modules/branch/routes.js';
import counterRoutes from '../modules/counter/routes.js';
import queueRoutes from '../modules/queue/routes.js';
import tokenRoutes from '../modules/token/routes.js';
import ratingRoutes from '../modules/rating/routes.js';
import analyticsRoutes from '../modules/analytics/routes.js';

const router = Router();

router.use("/status", statusRoute);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/branches', branchRoutes);
router.use('/counters', counterRoutes);
router.use('/queues', queueRoutes);
router.use('/tokens', tokenRoutes);
router.use('/ratings', ratingRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
