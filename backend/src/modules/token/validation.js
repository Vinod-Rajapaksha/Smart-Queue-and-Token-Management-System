import ApiError from '../../core/apiError.js';

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id || ''));

const allowedStatuses = ['WAITING', 'SERVING', 'COMPLETED', 'CANCELLED'];

export const validateCreateToken = (req, _res, next) => {
  const { branchId, queueId } = req.body;

  if (!isValidObjectId(branchId)) {
    return next(new ApiError(400, 'Valid branchId is required'));
  }

  if (!isValidObjectId(queueId)) {
    return next(new ApiError(400, 'Valid queueId is required'));
  }

  next();
};

export const validateGetMyTokens = (_req, _res, next) => {
  next();
};

export const validateUpdateTokenStatus = (req, _res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!isValidObjectId(id)) {
    return next(new ApiError(400, 'Valid token id is required'));
  }

  if (!status) {
    return next(new ApiError(400, 'Status is required'));
  }

  if (!allowedStatuses.includes(status)) {
    return next(
      new ApiError(400, `Invalid status. Allowed: ${allowedStatuses.join(', ')}`)
    );
  }

  next();
};

export const validateTokenIdParam = (req, _res, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return next(new ApiError(400, 'Valid token id is required'));
  }

  next();
};
