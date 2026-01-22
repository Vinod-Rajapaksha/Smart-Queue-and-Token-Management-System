import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../core/apiResponse.js';
import { createRating, listRatings, getRatingSummary } from './service.js';

export const createRatingController = asyncHandler(async (req, res) => {
  const { tokenId, rating, comment } = req.body;

  const userId = req.user.id || null;
  const doc = await createRating({ tokenId, rating, comment, userId });

  return new ApiResponse(201, 'Rating submitted', doc).send(res);
});

export const listRatingsController = asyncHandler(async (req, res) => {
  const { branchId, queueId, page, limit } = req.query;

  const data = await listRatings({ branchId, queueId, page, limit });
  return new ApiResponse(200, 'Ratings fetched', data).send(res);
});

export const ratingSummaryController = asyncHandler(async (req, res) => {
  const { branchId, queueId } = req.query;

  const data = await getRatingSummary({ branchId, queueId });
  return new ApiResponse(200, 'Rating summary fetched', data).send(res);
});
