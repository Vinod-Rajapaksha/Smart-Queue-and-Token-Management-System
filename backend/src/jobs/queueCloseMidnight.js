import Queue from "../database/models/Queue.js";
import logger from "../config/logger.js";

const getNextMidnight = () => {
  const now = new Date();
  const next = new Date(now);
  next.setDate(now.getDate() + 1);
  next.setHours(0, 0, 0, 0);
  return next;
};

export const closeAllOpenQueuesOnce = async () => {
  const startedAt = Date.now();

  const now = new Date();

  const result = await Queue.updateMany(
    { status: "OPEN" },
    {
      $set: {
        status: "CLOSED",
        closedAt: now,
        closedBy: null,
      },
    }
  );

  const ms = Date.now() - startedAt;

  logger.info(
    `[queueMidnightClose] closed=${result.modifiedCount} took=${ms}ms at=${now.toISOString()}`
  );

  return { closed: result.modifiedCount, tookMs: ms };
};

export const startQueueMidnightCloseJob = () => {
  const enabled = String(process.env.JOBS_ENABLED || "true") === "true";

  const dailyMs = 24 * 60 * 60 * 1000;

  if (!enabled) {
    logger.info("[queueMidnightClose] JOBS_ENABLED=false -> job not started");
    return { stop: () => {} };
  }

  let timeout = null;
  let interval = null;

  const scheduleNext = () => {
    const nextMidnight = getNextMidnight();
    const delay = nextMidnight.getTime() - Date.now();

    logger.info(
      `[queueMidnightClose] next run at ${nextMidnight.toISOString()} (in ${Math.round(
        delay / 1000
      )}s)`
    );

    timeout = setTimeout(async () => {
      try {
        await closeAllOpenQueuesOnce();
      } catch (err) {
        logger.error(
          `[queueMidnightClose] run failed: ${err?.message || err}`
        );
      }

      interval = setInterval(() => {
        closeAllOpenQueuesOnce().catch((err) => {
          logger.error(
            `[queueMidnightClose] run failed: ${err?.message || err}`
          );
        });
      }, dailyMs);

      interval.unref?.();
    }, delay);

    timeout.unref?.();
  };

  scheduleNext();

  return {
    stop: () => {
      if (timeout) clearTimeout(timeout);
      if (interval) clearInterval(interval);
      logger.info("[queueMidnightClose] stopped");
    },
  };
};
