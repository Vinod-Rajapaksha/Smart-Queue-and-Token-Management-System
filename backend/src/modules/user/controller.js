import ApiResponse from '../../core/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import * as userService from './service.js';

export const getUsers = asyncHandler(async (req, res) => {
  const { role, isActive, branchId } = req.query;

  const filters = {
    role: role || undefined,
    branchId: branchId || undefined,
  };

  if (isActive !== undefined) {
    filters.isActive = isActive === 'true';
  }

  const users = await userService.listUsers(filters);

  return new ApiResponse(200, 'Users fetched successfully', users).send(res);
});

export const getStaff = asyncHandler(async (req, res) => {
  const staff = await userService.listStaff();

  return new ApiResponse(200, 'Staff fetched successfully', staff).send(res);
});

export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await userService.getUserById(id);

  return new ApiResponse(200, 'User fetched successfully', user).send(res);
});

export const getMe = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await userService.getOwnProfile(userId);

  return new ApiResponse(200, 'Profile fetched successfully', user).send(res);
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, telephone, role, branch } = req.body;

  const user = await userService.createUser({
    name,
    email,
    password,
    telephone,
    role,
    branch,
  });

  return new ApiResponse(201, 'User created successfully', user).send(res);
});

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const user = await userService.updateUser(id, updates);

  return new ApiResponse(200, 'User updated successfully', user).send(res);
});

export const updateMe = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updates = req.body;

  const user = await userService.updateOwnProfile(userId, updates);

  return new ApiResponse(200, 'Profile updated successfully', user).send(res);
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const user = await userService.setUserStatus(id, isActive);

  return new ApiResponse(200, 'User status updated successfully', user).send(res);
});

export const resetUserPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  await userService.resetUserPassword(id, password);

  return new ApiResponse(200, 'Password reset successfully', null).send(res);
});
