import tokenService from './service.js';
import ApiResponse from '../../core/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const createToken = asyncHandler(async (req, res) => {
  const token = await tokenService.createToken(
    req.user.id,
    req.body.branchId,
    req.body.queueId
  );

  new ApiResponse(201, 'Token created successfully', token).send(res);
});

export const getMyTokens = asyncHandler(async (req, res) => {
  const tokens = await tokenService.getMyTokens(req.user.id);
  new ApiResponse(200, 'Tokens fetched', tokens).send(res);
});

export const updateTokenStatus = asyncHandler(async (req, res) => {
  const token = await tokenService.updateTokenStatus(
    req.params.id,
    req.body.status
  );

  new ApiResponse(200, 'Token status updated', token).send(res);
});
