import ApiError from '../../core/apiError.js';
import User from '../../database/models/User.js';
import Branch from '../../database/models/Branch.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { ROLES } from '../../core/constants.js';

const ROLE_VALUES = Object.values(ROLES);
const safeUserSelect = '-password -refreshToken';

const getActor = async (actorId) => {
  const actor = await User.findById(actorId).select('role branch isActive');
  if (!actor || !actor.isActive) throw new ApiError(401, 'User not found or inactive');
  return actor;
};

const assertSingleManagerPerBranch = async (branchId, excludeUserId = null) => {
  if (!branchId) return; 

  const q = { role: ROLES.MANAGER, branch: branchId };
  if (excludeUserId) q._id = { $ne: excludeUserId };

  const exists = await User.exists(q);
  if (exists) throw new ApiError(409, 'This branch already has a manager');
};

export const listUsers = async ({ role, isActive, branchId } = {}, actorCtx) => {
  const filter = {};

  const actorRole = actorCtx?.role;
  if (!actorRole) throw new ApiError(403, 'User role not found');

  if (actorRole === ROLES.MANAGER) {
    const actor = await getActor(actorCtx.id);
    if (!actor.branch) throw new ApiError(400, 'Manager is not assigned to a branch');

    filter.branch = actor.branch;

    const allowed = [ROLES.STAFF];
    if (role) {
      if (!allowed.includes(role)) {
        throw new ApiError(403, 'Managers can only view STAFF');
      }
      filter.role = role;
    } else {
      filter.role = { $in: allowed };
    }
  }
  
  if (actorRole === ROLES.ADMIN) {
    if (role) filter.role = role;
    if (branchId) filter.branch = branchId;
  }

  if (typeof isActive === 'boolean') filter.isActive = isActive;

  const users = await User.find(filter).select(safeUserSelect).populate('branch');
  return users;
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId).select(safeUserSelect).populate('branch');
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

export const getOwnProfile = async (userId) => {
  const user = await User.findById(userId).select(safeUserSelect).populate('branch');
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

export const createUser = async (
  { name, email, password, telephone, role = ROLES.STAFF, branch },
  actorCtx,
  ) => {
  if (!ROLE_VALUES.includes(role)) throw new ApiError(400, 'Invalid role');

  const actorRole = actorCtx?.role;
  if (!actorRole) throw new ApiError(403, 'User role not found');

  
  if (actorRole === ROLES.MANAGER) {
    const actor = await getActor(actorCtx.id);
    if (!actor.branch) throw new ApiError(400, 'Manager is not assigned to a branch');

    if (role !== ROLES.STAFF) {
      throw new ApiError(403, 'Manager can only create STAFF users');
    }

    branch = actor.branch.toString(); 
  }

  
  if (actorRole === ROLES.ADMIN) {
    if (role === ROLES.MANAGER && branch) {
      await assertSingleManagerPerBranch(branch);
    }
  }

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Email is already in use');

  
  if (branch) {
    const branchExists = await Branch.exists({ _id: branch });
    if (!branchExists) throw new ApiError(400, 'Branch not found');
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
    if (updates[key] !== undefined) updateData[key] = updates[key];
  }

  if (updateData.role && !ROLE_VALUES.includes(updateData.role)) {
    throw new ApiError(400, 'Invalid role');
  }

  if (updateData.branch) {
    const branchExists = await Branch.exists({ _id: updateData.branch });
    if (!branchExists) throw new ApiError(400, 'Branch not found');
  }

  if (updateData.email) {
    const existingUser = await User.findOne({
      email: updateData.email,
      _id: { $ne: userId },
    });
    if (existingUser) throw new ApiError(409, 'Email is already in use');
  }

 
  if (updateData.role === ROLES.MANAGER && updateData.branch) {
    await assertSingleManagerPerBranch(updateData.branch, userId);
  }

  if (updateData.branch) {
    const existingUser = await User.findById(userId).select('role');
    if (existingUser?.role === ROLES.MANAGER) {
      await assertSingleManagerPerBranch(updateData.branch, userId);
    }
  }

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  })
    .select(safeUserSelect)
    .populate('branch');

  if (!user) throw new ApiError(404, 'User not found');

  return user;
};

export const updateOwnProfile = async (userId, updates) => {
  const allowedFields = ['name', 'email', 'telephone'];

  const updateData = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) updateData[key] = updates[key];
  }

  if (updateData.email) {
    const existingUser = await User.findOne({
      email: updateData.email,
      _id: { $ne: userId },
    });
    if (existingUser) throw new ApiError(409, 'Email is already in use');
  }

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  })
    .select(safeUserSelect)
    .populate('branch');

  if (!user) throw new ApiError(404, 'User not found');

  return user;
};

export const setUserStatus = async (userId, isActive) => {
  const user = await User.findByIdAndUpdate(userId, { isActive }, { new: true })
    .select(safeUserSelect)
    .populate('branch');

  if (!user) throw new ApiError(404, 'User not found');

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
  ).select(safeUserSelect);

  if (!user) throw new ApiError(404, 'User not found');

  return true;
};

export const changeOwnPassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  const ok = await comparePassword(currentPassword, user.password);
  if (!ok) throw new ApiError(400, 'Current password is incorrect');

  user.password = await hashPassword(newPassword);
  await user.save();

  return true;
};

export const deleteUserHard = async (targetUserId, actorCtx) => {
  const actorRole = actorCtx?.role;
  if (!actorRole) throw new ApiError(403, 'User role not found');

  if (actorCtx.id === targetUserId) {
    throw new ApiError(403, 'You cannot delete your own account');
  }

  const target = await User.findById(targetUserId).select('role branch');
  if (!target) throw new ApiError(404, 'User not found');

  if (actorRole === ROLES.ADMIN) {
    await User.deleteOne({ _id: targetUserId });
    return true;
  }

  if (actorRole === ROLES.MANAGER) {
    const actor = await getActor(actorCtx.id);
    if (!actor.branch) throw new ApiError(400, 'Manager is not assigned to a branch');

    if (target.role === ROLES.MANAGER || target.role === ROLES.ADMIN) {
      throw new ApiError(403, 'Manager cannot delete managers/admins');
    }

    
    const sameBranch =
      actor.branch?.toString() &&
      target.branch?.toString() &&
      actor.branch.toString() === target.branch.toString();

    if (!sameBranch) {
      throw new ApiError(403, 'You can only delete users in your own branch');
    }

    await User.deleteOne({ _id: targetUserId });
    return true;
  }

  throw new ApiError(403, 'You do not have permission to delete users');
};
