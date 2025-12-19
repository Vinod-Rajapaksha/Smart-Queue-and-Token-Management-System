import ApiError from '../../core/apiError.js';
import User from '../../database/models/User.js';
import Branch from '../../database/models/Branch.js';
import { hashPassword } from '../../utils/password.js';
import { ROLES } from '../../core/constants.js';

const ROLE_VALUES = Object.values(ROLES);

export const listUsers = async ({ role, isActive, branchId } = {}) => {
  const filter = {};

  if (role) {
    filter.role = role;
  }

  if (typeof isActive === 'boolean') {
    filter.isActive = isActive;
  }

  if (branchId) {
    filter.branch = branchId;
  }

  const users = await User.find(filter)
    .select('-password -refreshToken')
    .populate('branch');

  return users;
};

export const listStaff = async () => {
  const staff = await User.find({ role: ROLES.STAFF })
    .select('-password -refreshToken')
    .populate('branch');

  return staff;
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId)
    .select('-password -refreshToken')
    .populate('branch');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

export const getOwnProfile = async (userId) => {
  const user = await User.findById(userId)
    .select('-password -refreshToken')
    .populate('branch');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

export const createUser = async ({
  name,
  email,
  password,
  telephone,
  role = ROLES.STAFF,
  branch,
}) => {
  
  if (!ROLE_VALUES.includes(role)) {
    throw new ApiError(400, 'Invalid role');
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'Email is already in use');
  }

  if (branch) {
    const branchExists = await Branch.exists({ _id: branch });
    if (!branchExists) {
      throw new ApiError(400, 'Branch not found');
    }
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    telephone,
    role,
    branch: branch || null,
  });

  const userData = user.toObject();
  delete userData.password;
  delete userData.refreshToken;

  return userData;
};

export const updateUser = async (userId, updates) => {
  const allowedFields = ['name', 'email', 'telephone', 'role', 'branch', 'isActive'];

  const updateData = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      updateData[key] = updates[key];
    }
  }

  if (updateData.role && !ROLE_VALUES.includes(updateData.role)) {
    throw new ApiError(400, 'Invalid role');
  }

  if (updateData.branch) {
    const branchExists = await Branch.exists({ _id: updateData.branch });
    if (!branchExists) {
      throw new ApiError(400, 'Branch not found');
    }
  }

  if (updateData.email) {
    const existingUser = await User.findOne({
      email: updateData.email,
      _id: { $ne: userId },
    });
    if (existingUser) {
      throw new ApiError(409, 'Email is already in use');
    }
  }

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  })
    .select('-password -refreshToken')
    .populate('branch');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

export const updateOwnProfile = async (userId, updates) => {
  const allowedFields = ['name', 'email', 'telephone',];

  const updateData = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      updateData[key] = updates[key];
    }
  }

  if (updateData.email) {
    const existingUser = await User.findOne({
      email: updateData.email,
      _id: { $ne: userId },
    });
    if (existingUser) {
      throw new ApiError(409, 'Email is already in use');
    }
  }

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  })
    .select('-password -refreshToken')
    .populate('branch');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

export const setUserStatus = async (userId, isActive) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive },
    { new: true },
  )
    .select('-password -refreshToken')
    .populate('branch');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

export const resetUserPassword = async (userId, newPassword) => {
  if (!newPassword || newPassword.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  const hashedPassword = await hashPassword(newPassword);

  const user = await User.findByIdAndUpdate(
    userId,
    { password: hashedPassword },
    { new: true },
  ).select('-password -refreshToken');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return true;
};
