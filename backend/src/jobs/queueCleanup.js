import Token from '../database/models/Token.js';
import logger from '../config/logger.js';

const toInt = (val, fallback) => {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
};

const minutesAgo = (mins) => new Date(Date.now() - mins * 60 * 1000);
const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

export const runQueueCleanupOnce = async () => {
  const staleMinutes = toInt(process.env.TOKEN_STALE_MINUTES, 240); // 4h default
  const retentionDays = toInt(process.env.TOKEN_RETENTION_DAYS, 30); // keep 30 days
  const enableDeletion = String(process.env.TOKEN_RETENTION_DELETE_ENABLED || 'true') === 'true';

  const staleBefore = minutesAgo(staleMinutes);
  const retentionBefore = daysAgo(retentionDays);

  const startedAt = Date.now();

  // Cancel stale tokens
  // If token is created/waiting for too long
  const staleResult = await Token.updateMany(
    {
      status: { $in: ['CREATED', 'WAITING'] },
      issuedAt: { $lte: staleBefore },
    },
    {
      $set: {
        status: 'CANCELLED',
        completedAt: new Date(),
      },
    }
  );

  // Delete old completed/cancelled tokens
  let deleteResult = { deletedCount: 0 };
  if (enableDeletion) {
    deleteResult = await Token.deleteMany({
      status: { $in: ['COMPLETED', 'CANCELLED'] },
      completedAt: { $exists: true, $lte: retentionBefore },
    });
  }

  const ms = Date.now() - startedAt;

  logger.info(
    `[queueCleanup] done in ${ms}ms | staleCancelled=${staleResult.modifiedCount} | deletedOld=${deleteResult.deletedCount} | staleMinutes=${staleMinutes} | retentionDays=${retentionDays} | deleteEnabled=${enableDeletion}`
  );

  return {
    staleCancelled: staleResult.modifiedCount,
    deletedOld: deleteResult.deletedCount,
    tookMs: ms,
  };
};

export const startQueueCleanupJob = () => {
  const enabled = String(process.env.JOBS_ENABLED || 'true') === 'true';
  const intervalMinutes = toInt(process.env.JOBS_INTERVAL_MINUTES, 10);

  if (!enabled) {
    logger.info('[queueCleanup] JOBS_ENABLED=false -> cleanup job not started');
    return { stop: () => {} };
  }

  const intervalMs = intervalMinutes * 60 * 1000;

  logger.info(`[queueCleanup] starting job (every ${intervalMinutes} min)`);

  // run once at startup (non-blocking)
  runQueueCleanupOnce().catch((err) => {
    logger.error(`[queueCleanup] first run failed: ${err?.message || err}`);
  });

  const timer = setInterval(() => {
    runQueueCleanupOnce().catch((err) => {
      logger.error(`[queueCleanup] run failed: ${err?.message || err}`);
    });
  }, intervalMs);

  // let Node exit naturally
  timer.unref?.();

  return {
    stop: () => {
      clearInterval(timer);
      logger.info('[queueCleanup] stopped');
    },
  };
};
