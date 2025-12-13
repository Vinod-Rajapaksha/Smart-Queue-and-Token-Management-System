import ApiError from '../../core/apiError.js';

export const validateCreateRating = (req, res, next) => {
  const { tokenId, rating, comment } = req.body;

  if (!tokenId) return next(new ApiError(400, 'tokenId is required'));
  if (rating === undefined) return next(new ApiError(400, 'rating is required'));

  const numericRating = Number(rating);
  if (Number.isNaN(numericRating)) return next(new ApiError(400, 'rating must be a number'));
  if (numericRating < 1 || numericRating > 5)
    return next(new ApiError(400, 'rating must be between 1 and 5'));

  if (comment && String(comment).length > 500)
    return next(new ApiError(400, 'comment max length is 500'));

  return next();
};
