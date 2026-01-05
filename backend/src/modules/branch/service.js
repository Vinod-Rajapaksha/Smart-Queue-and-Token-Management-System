import Branch from '../../database/models/Branch.js';
import ApiError from '../../core/apiError.js';

export const createBranchService = async (payload) => {
  const { name, code, address, city, contactNumber } = payload;

  const existing = await Branch.findOne({ code: code.toUpperCase() });
  if (existing) {
    throw new ApiError(409, 'Branch code already exists');
  }

  const branch = await Branch.create({
    name,
    code,
    address,
    city,
    contactNumber,
  });

  return branch;
};

export const getBranchesService = async (filters = {}) => {
  const query = {};

  if (filters.isActive === 'true') query.isActive = true;
  if (filters.isActive === 'false') query.isActive = false;

  const branches = await Branch.find(query).sort({ createdAt: -1 });
  return branches;
};

export const getBranchByIdService = async (id) => {
  const branch = await Branch.findById(id);
  if (!branch) {
    throw new ApiError(404, 'Branch not found');
  }
  return branch;
};

export const updateBranchService = async (id, updateData) => {
  if (updateData.code) {
    const existing = await Branch.findOne({
      _id: { $ne: id },
      code: updateData.code.toUpperCase(),
    });

    if (existing) {
      throw new ApiError(409, 'Branch code already exists');
    }
  }

  const branch = await Branch.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!branch) {
    throw new ApiError(404, 'Branch not found');
  }

  return branch;
};

export const deactivateBranchService = async (id) => {
  const branch = await Branch.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!branch) {
    throw new ApiError(404, 'Branch not found');
  }

  return branch;
};

export const activateBranchService = async (id) => {
  const branch = await Branch.findByIdAndUpdate(
    id,
    { isActive: true },
    { new: true }
  );

  if (!branch) {
    throw new ApiError(404, 'Branch not found');
  }

  return branch;
};
