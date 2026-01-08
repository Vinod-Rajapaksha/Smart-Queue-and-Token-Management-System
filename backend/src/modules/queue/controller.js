import ApiResponse from '../../core/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

import {
  openQueue,
  closeQueue,
  getActiveQueue,
  callNextToken,
  markServing,
  markSkipped,
  markCancelled,
  markCompleted,
  listQueues,
} from './service.js';

export const open = asyncHandler(async (req, res) => {
  const queue = await openQueue({ counterId: req.body.counterId, userId: req.user?.id });
  return new ApiResponse(201, 'Queue opened', queue).send(res);
});

export const close = asyncHandler(async (req, res) => {
  const queue = await closeQueue({ counterId: req.body.counterId, userId: req.user?.id });
  return new ApiResponse(200, 'Queue closed', queue).send(res);
});

export const active = asyncHandler(async (req, res) => {
  const queue = await getActiveQueue(req.params.counterId);
  return new ApiResponse(200, 'Active queue', queue).send(res);
});

export const next = asyncHandler(async (req, res) => {
  const token = await callNextToken({
    counterId: req.body.counterId,
    userId: req.user?.id,
  });
  return new ApiResponse(200, 'Next token called', token).send(res);
});

export const serving = asyncHandler(async (req, res) => {
  const token = await markServing({ tokenId: req.params.tokenId, userId: req.user?.id });
  return new ApiResponse(200, 'Token marked serving', token).send(res);
});

export const skipped = asyncHandler(async (req, res) => {
  const token = await markSkipped({ tokenId: req.params.tokenId, userId: req.user?.id });
  return new ApiResponse(200, 'Token marked skipped', token).send(res);
});

export const cancelled = asyncHandler(async (req, res) => {
  const token = await markCancelled({ tokenId: req.params.tokenId, userId: req.user?.id });
  return new ApiResponse(200, 'Token marked cancelled', token).send(res);
});

export const completed = asyncHandler(async (req, res) => {
  const token = await markCompleted({ tokenId: req.params.tokenId, userId: req.user?.id });
  return new ApiResponse(200, 'Token marked completed', token).send(res);
});

export const list = asyncHandler(async (req, res) => {
  const data = await listQueues({
    branchId: req.query.branchId,
    counterId: req.query.counterId,
    status: req.query.status,
    page: req.query.page,
    limit: req.query.limit,
  });
  return new ApiResponse(200, 'Queues list', data).send(res);
});
