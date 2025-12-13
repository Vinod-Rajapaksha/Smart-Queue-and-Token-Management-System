import analyticsService from './service.js';
import ApiResponse from '../../core/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const getOverview = asyncHandler(async (req, res) => {
  const data = await analyticsService.overview(req.query);
  new ApiResponse(200, 'Analytics overview fetched', data).send(res);
});

export const getVolume = asyncHandler(async (req, res) => {
  const data = await analyticsService.volume(req.query);
  new ApiResponse(200, 'Analytics volume fetched', data).send(res);
});

export const getRatings = asyncHandler(async (req, res) => {
  const data = await analyticsService.ratings(req.query);
  new ApiResponse(200, 'Analytics ratings fetched', data).send(res);
});
