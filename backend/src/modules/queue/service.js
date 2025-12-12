import mongoose from 'mongoose';
import ApiError from '../../core/apiError.js';

import Queue from '../../database/models/Queue.js';
import Token from '../../database/models/Token.js';
import Branch from '../../database/models/Branch.js';
import Counter from '../../database/models/Counter.js';

const QUEUE_STATUS = {
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED',
};

const TOKEN_STATUS = {
  WAITING: 'WAITING',
  CALLED: 'CALLED',
  SERVED: 'SERVED',
  NO_SHOW: 'NO_SHOW',
};

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

export const openQueue = async ({ branchId, userId }) => {
  const branch = await Branch.findById(branchId);
  if (!branch) throw new ApiError(404, 'Branch not found');

  // One active queue per day per branch
  const existing = await Queue.findOne({
    branch: branchId,
    status: QUEUE_STATUS.ACTIVE,
    createdAt: { $gte: startOfToday(), $lte: endOfToday() },
  });

  if (existing) return existing;

  const queue = await Queue.create({
    branch: branchId,
    status: QUEUE_STATUS.ACTIVE,
    openedBy: userId,
    openedAt: new Date(),
  });

  return queue;
};

export const closeQueue = async ({ branchId, userId }) => {
  const queue = await Queue.findOne({
    branch: branchId,
    status: QUEUE_STATUS.ACTIVE,
    createdAt: { $gte: startOfToday(), $lte: endOfToday() },
  });

  if (!queue) throw new ApiError(404, 'No active queue found for this branch today');

  queue.status = QUEUE_STATUS.CLOSED;
  queue.closedBy = userId;
  queue.closedAt = new Date();
  await queue.save();

  return queue;
};

export const getActiveQueue = async (branchId) => {
  const queue = await Queue.findOne({
    branch: branchId,
    status: QUEUE_STATUS.ACTIVE,
    createdAt: { $gte: startOfToday(), $lte: endOfToday() },
  }).populate('branch');

  if (!queue) throw new ApiError(404, 'No active queue found');
  return queue;
};

export const callNextToken = async ({ branchId, counterId, userId }) => {
  const counter = await Counter.findById(counterId);
  if (!counter) throw new ApiError(404, 'Counter not found');
  if (String(counter.branch) !== String(branchId)) throw new ApiError(400, 'Counter does not belong to this branch');
  if (counter.isActive === false) throw new ApiError(400, 'Counter is not active');

  const queue = await Queue.findOne({
    branch: branchId,
    status: QUEUE_STATUS.ACTIVE,
    createdAt: { $gte: startOfToday(), $lte: endOfToday() },
  });

  if (!queue) throw new ApiError(404, 'No active queue found for this branch today');

  // Use transaction to reduce race conditions (two counters calling next at same time)
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const token = await Token.findOne({
      branch: branchId,
      queue: queue._id,
      status: TOKEN_STATUS.WAITING,
    })
      .sort({ number: 1, createdAt: 1 })
      .session(session);

    if (!token) throw new ApiError(404, 'No waiting tokens');

    token.status = TOKEN_STATUS.CALLED;
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

export const markServed = async ({ tokenId, userId }) => {
  const token = await Token.findById(tokenId);
  if (!token) throw new ApiError(404, 'Token not found');

  if (![TOKEN_STATUS.CALLED, TOKEN_STATUS.WAITING].includes(token.status)) {
    throw new ApiError(400, `Token cannot be marked served from status: ${token.status}`);
  }

  token.status = TOKEN_STATUS.SERVED;
  token.servedAt = new Date();
  token.servedBy = userId;

  await token.save();
  return token;
};

export const markNoShow = async ({ tokenId, userId }) => {
  const token = await Token.findById(tokenId);
  if (!token) throw new ApiError(404, 'Token not found');

  if (![TOKEN_STATUS.CALLED].includes(token.status)) {
    throw new ApiError(400, `Token cannot be marked no-show from status: ${token.status}`);
  }

  token.status = TOKEN_STATUS.NO_SHOW;
  token.noShowAt = new Date();
  token.noShowBy = userId;

  await token.save();
  return token;
};

export const listQueues = async ({ branchId, status, page = 1, limit = 10 }) => {
  const q = {};
  if (branchId) q.branch = branchId;
  if (status) q.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Queue.find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('branch'),
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
