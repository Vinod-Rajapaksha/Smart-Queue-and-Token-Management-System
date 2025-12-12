import ApiError from '../../core/apiError.js';

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

export const validateCreateCounter = (body = {}) => {
  const { branchId, name, code } = body;

  if (!isNonEmptyString(branchId)) throw new ApiError(400, 'branchId is required');
  if (!isNonEmptyString(name)) throw new ApiError(400, 'name is required');

  if (code !== undefined && code !== null && !isNonEmptyString(code)) {
    throw new ApiError(400, 'code must be a non-empty string if provided');
  }
};

export const validateUpdateCounter = (body = {}) => {
  const allowed = ['name', 'code', 'isActive', 'services'];
  const keys = Object.keys(body);

  if (keys.length === 0) throw new ApiError(400, 'No fields provided to update');

  for (const k of keys) {
    if (!allowed.includes(k)) throw new ApiError(400, `Invalid field: ${k}`);
  }

  if (body.name !== undefined && !isNonEmptyString(body.name)) {
    throw new ApiError(400, 'name must be a non-empty string');
  }
  if (body.code !== undefined && body.code !== null && !isNonEmptyString(body.code)) {
    throw new ApiError(400, 'code must be a non-empty string');
  }
  if (body.isActive !== undefined && typeof body.isActive !== 'boolean') {
    throw new ApiError(400, 'isActive must be boolean');
  }
  if (body.services !== undefined && !Array.isArray(body.services)) {
    throw new ApiError(400, 'services must be an array');
  }
};

export const validateStatusChange = (body = {}) => {
  if (typeof body.isActive !== 'boolean') {
    throw new ApiError(400, 'isActive must be boolean');
  }
};
