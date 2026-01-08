import mongoose from 'mongoose';
import ApiError from '../../core/apiError.js';

import Queue from '../../database/models/Queue.js';
import Token from '../../database/models/Token.js';
import Counter from '../../database/models/Counter.js';

import { QUEUE_STATUS, TOKEN_STATUS } from '../../core/constants.js';

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfToday = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
};

export const openQueue = async ({ counterId, userId }) => {
  const counter = await Counter.findById(counterId);
  if (!counter) throw new ApiError(404, 'Counter not found');

  // One active queue per day per counter
  const existing = await Queue.findOne({
    counter: counterId,
    status: QUEUE_STATUS.OPEN,
    createdAt: { $gte: startOfToday(), $lte: endOfToday() },
  });

  if (existing) return existing;

  const queue = await Queue.create({
    branch: counter.branch,
    counter: counterId,
    status: QUEUE_STATUS.OPEN,
    openedBy: userId,
    openedAt: new Date(),
  });

  return queue;
};

export const closeQueue = async ({ counterId, userId }) => {
  const queue = await Queue.findOne({
    counter: counterId,
    status: QUEUE_STATUS.OPEN,
    createdAt: { $gte: startOfToday(), $lte: endOfToday() },
  });

  if (!queue) throw new ApiError(404, 'No open queue found for this counter today');
  queue.status = QUEUE_STATUS.CLOSED;
  queue.closedBy = userId;
  queue.closedAt = new Date();
  await queue.save();

  return queue;
};

export const getActiveQueue = async (counterId) => {
  const queue = await Queue.findOne({
    counter: counterId,
    status: QUEUE_STATUS.OPEN,
    createdAt: { $gte: startOfToday(), $lte: endOfToday() },
  }).populate("counter");

  if (!queue) throw new ApiError(404, 'No open queue found');
  return queue;
};

export const callNextToken = async ({ counterId, userId }) => {
  const counter = await Counter.findById(counterId);
  if (!counter) throw new ApiError(404, 'Counter not found');
  if (counter.isActive === false) throw new ApiError(400, 'Counter is not open');

  const branchId = counter.branch;

  const queue = await Queue.findOne({
    counter: counterId,
    status: QUEUE_STATUS.OPEN,
    createdAt: { $gte: startOfToday(), $lte: endOfToday() },
  });

  if (!queue) throw new ApiError(404, 'No open queue found for this counter today');

  // Use transaction to reduce race conditions (two counters calling next at same time)
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const token = await Token.findOne({
      branch: branchId,
      queue: queue._id,
      status: TOKEN_STATUS.WAITING,
    })
      .sort({ tokenNumber: 1, createdAt: 1 })
      .session(session);

    if (!token) throw new ApiError(404, 'No waiting tokens');

    token.status = TOKEN_STATUS.CALLING;
    token.calledAt = new Date();
    token.calledBy = userId;
    token.counter = counterId;

    await token.save({ session });

    queue.currentToken = token._id;
    queue.lastCalledAt = new Date();
    await queue.save({ session });

    await session.commitTransaction();
    session.endSession();

    return await Token.findById(token._id).populate('counter').populate('branch');
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

export const markServing = async ({ tokenId, userId }) => {
  const token = await Token.findById(tokenId);
  if (!token) throw new ApiError(404, 'Token not found');

  if (![TOKEN_STATUS.CALLING].includes(token.status)) {
    throw new ApiError(400, `Token cannot be marked serving from status: ${token.status}`);
  }

  token.status = TOKEN_STATUS.SERVING;
  token.servedAt = new Date();
  token.servedBy = userId;

  await token.save();
  return token;
};

export const markSkipped = async ({ tokenId, userId }) => {
  const token = await Token.findById(tokenId);
  if (!token) throw new ApiError(404, 'Token not found');

  if (![TOKEN_STATUS.CALLING].includes(token.status)) {
    throw new ApiError(400, `Token cannot be marked skipped from status: ${token.status}`);
  }

  token.status = TOKEN_STATUS.SKIPPED;
  token.skippedAt = new Date();
  token.skippedBy = userId;

  await token.save();
  return token;
};

export const markCancelled = async ({ tokenId, userId }) => {
  const token = await Token.findById(tokenId);
  if (!token) throw new ApiError(404, 'Token not found');

  if (![TOKEN_STATUS.SKIPPED, TOKEN_STATUS.CALLING].includes(token.status)) {
    throw new ApiError(400, `Token cannot be marked cancelled from status: ${token.status}`);
  }

  token.status = TOKEN_STATUS.CANCELLED;
  token.cancelledAt = new Date();
  token.cancelledBy = userId;

  await token.save();
  return token;
};

export const markCompleted = async ({ tokenId, userId }) => {
  const token = await Token.findById(tokenId);
  if (!token) throw new ApiError(404, 'Token not found');

  if (![TOKEN_STATUS.SERVING].includes(token.status)) {
    throw new ApiError(400, `Token cannot be marked completed from status: ${token.status}`);
  }

  token.status = TOKEN_STATUS.COMPLETED;
  token.completedAt = new Date();
  token.completedBy = userId;

  await token.save();
  return token;
};

export const listQueues = async ({ branchId, counterId, status, page = 1, limit = 10 }) => {
  const q = {};

  if (branchId) q.branch = branchId;
  if (counterId) q.counter = counterId;
  if (status) q.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Queue.find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('counter'),
    Queue.countDocuments(q),
  ]);

  return {
    items,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)) || 1,
  };
};
