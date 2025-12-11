import ApiError from '../../core/apiError.js';

export const validateCreateBranch = (req, res, next) => {
  const { name, code, address, city } = req.body;

  if (!name || !code || !address || !city) {
    return next(
      new ApiError(400, 'name, code, address and city are required')
    );
  }

  if (typeof name !== 'string' || name.trim().length < 2) {
    return next(new ApiError(400, 'Invalid branch name'));
  }

  if (typeof code !== 'string' || code.trim().length < 2) {
    return next(new ApiError(400, 'Invalid branch code'));
  }

  next();
};

export const validateUpdateBranch = (req, res, next) => {
  const allowedFields = [
    'name',
    'code',
    'address',
    'city',
    'contactNumber',
    'isActive',
  ];

  const updateKeys = Object.keys(req.body);

  if (updateKeys.length === 0) {
    return next(new ApiError(400, 'At least one field is required to update'));
  }

  const invalidField = updateKeys.find((key) => !allowedFields.includes(key));
  if (invalidField) {
    return next(new ApiError(400, `Invalid field: ${invalidField}`));
  }

  next();
};
