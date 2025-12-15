import User from '../../database/models/User.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt.js';

export const register = async ({ name, email, telephone, password, role, branch }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error('Email is already in use');
    error.statusCode = 409;
    throw error;
  }

  const hashed = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    telephone,
    password: hashed,
    role: role || 'STAFF',
    branch: branch || null,
  });

  const userData = user.toObject();
  delete userData.password;
  delete userData.refreshToken;

  return userData;
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Account is disabled');
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const payload = { id: user._id.toString(), role: user.role };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save();

  const userData = user.toObject();
  delete userData.password;
  delete userData.refreshToken;

  return {
    user: userData,
    accessToken,
    refreshToken,
  };
};

export const refreshToken = async ({ refreshToken }) => {
  let decoded;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    const error = new Error('Invalid refresh token');
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(decoded.id);

  if (!user || !user.isActive) {
    const error = new Error('User not found or inactive');
    error.statusCode = 401;
    throw error;
  }

  if (user.refreshToken !== refreshToken) {
    const error = new Error('Refresh token does not match');
    error.statusCode = 401;
    throw error;
  }

  const payload = { id: user._id.toString(), role: user.role };

  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  user.refreshToken = newRefreshToken;
  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const logout = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  user.refreshToken = null;
  await user.save();

  return true;
};
