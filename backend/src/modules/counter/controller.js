import ApiResponse from '../../core/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

import {
  createCounter,
  listCounters,
  getCounterById,
  updateCounter,
  setCounterStatus,
  deleteCounter,
} from './service.js';

import {
  validateCreateCounter,
  validateUpdateCounter,
  validateStatusChange,
} from './validation.js';

export const create = asyncHandler(async (req, res) => {
  validateCreateCounter(req.body);
  const counter = await createCounter(req.body);
  return new ApiResponse(201, 'Counter created', counter).send(res);
});

export const list = asyncHandler(async (req, res) => {
  const result = await listCounters(req.query);
  return new ApiResponse(200, 'Counters fetched', result).send(res);
});

export const getById = asyncHandler(async (req, res) => {
  const counter = await getCounterById(req.params.id);
  return new ApiResponse(200, 'Counter fetched', counter).send(res);
});

export const update = asyncHandler(async (req, res) => {
  validateUpdateCounter(req.body);
  const counter = await updateCounter(req.params.id, req.body);
  return new ApiResponse(200, 'Counter updated', counter).send(res);
});

export const changeStatus = asyncHandler(async (req, res) => {
  validateStatusChange(req.body);
  const counter = await setCounterStatus(req.params.id, req.body.isActive);
  return new ApiResponse(200, 'Counter status updated', counter).send(res);
});

export const remove = asyncHandler(async (req, res) => {
  const counter = await deleteCounter(req.params.id);
  return new ApiResponse(200, 'Counter disabled', counter).send(res);
});
