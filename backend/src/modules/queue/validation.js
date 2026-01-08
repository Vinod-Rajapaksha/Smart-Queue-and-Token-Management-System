import ApiError from '../../core/apiError.js';

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id || ''));

export const validateOpenQueue = (req, _res, next) => {
  const { counterId } = req.body;
  if (!isValidObjectId(counterId)) return next(new ApiError(400, 'Valid counterId is required'));
  next();
};

export const validateCloseQueue = (req, _res, next) => {
  const { counterId } = req.body;
  if (!isValidObjectId(counterId)) return next(new ApiError(400, 'Valid counterId is required'));
  next();
};

export const validateGetActiveQueue = (req, _res, next) => {
  const { counterId } = req.params;
  if (!isValidObjectId(counterId)) return next(new ApiError(400, 'Valid counterId is required'));
  next();
};

export const validateCallNext = (req, _res, next) => {
  const { counterId } = req.body;
  if (!isValidObjectId(counterId)) return next(new ApiError(400, 'Valid counterId is required'));
  next();
};

export const validateTokenAction = (req, _res, next) => {
  const { tokenId } = req.params;
  if (!isValidObjectId(tokenId)) return next(new ApiError(400, 'Valid tokenId is required'));
  next();
};
