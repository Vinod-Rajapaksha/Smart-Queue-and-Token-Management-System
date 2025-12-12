import ApiResponse from '../../core/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

import {
  openQueue,
  closeQueue,
  getActiveQueue,
  callNextToken,
  markServed,
  markNoShow,
  listQueues,
} from './service.js';

export const open = asyncHandler(async (req, res) => {
  const queue = await openQueue({ branchId: req.body.branchId, userId: req.user?.id });
  return new ApiResponse(201, 'Queue opened', queue).send(res);
});

export const close = asyncHandler(async (req, res) => {
  const queue = await closeQueue({ branchId: req.body.branchId, userId: req.user?.id });
  return new ApiResponse(200, 'Queue closed', queue).send(res);
});

export const active = asyncHandler(async (req, res) => {
  const queue = await getActiveQueue(req.params.branchId);
  return new ApiResponse(200, 'Active queue', queue).send(res);
});

export const next = asyncHandler(async (req, res) => {
  const token = await callNextToken({
    branchId: req.body.branchId,
    counterId: req.body.counterId,
    userId: req.user?.id,
  });
  return new ApiResponse(200, 'Next token called', token).send(res);
});

export const served = asyncHandler(async (req, res) => {
  const token = await markServed({ tokenId: req.params.tokenId, userId: req.user?.id });
  return new ApiResponse(200, 'Token marked served', token).send(res);
});

export const noShow = asyncHandler(async (req, res) => {
  const token = await markNoShow({ tokenId: req.params.tokenId, userId: req.user?.id });
  return new ApiResponse(200, 'Token marked no-show', token).send(res);
});

export const list = asyncHandler(async (req, res) => {
  const data = await listQueues({
    branchId: req.query.branchId,
    status: req.query.status,
    page: req.query.page,
    limit: req.query.limit,
  });
  return new ApiResponse(200, 'Queues list', data).send(res);
});
