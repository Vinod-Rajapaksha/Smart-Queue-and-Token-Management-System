import { ROLES } from '../../core/constants.js';

const VALID_ROLES = Object.values(ROLES);

const isEmail = (value) =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isStrongPassword = (value) =>
  typeof value === 'string' &&
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?]).{8,}$/.test(
    value,
  );

const isValidTelephone = (value) =>
  typeof value === 'string' && /^\d{9,15}$/.test(value);

const isValidName = (value) =>
  typeof value === 'string' && /^[A-Za-z ]{2,50}$/.test(value.trim());

export const validateCreateUser = (req, res, next) => {
  const { name, email, password, telephone, role, branch } = req.body;

  if (!isValidName(name)) {
    return res.status(400).json({
      success: false,
      message:
        'Name is required and should be 2–50 characters (letters and spaces only)',
    });
  }

  if (!email || !isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'A valid email address is required',
    });
  }

  if (!password || !isStrongPassword(password)) {
    return res.status(400).json({
      success: false,
      message:
        'Password must be at least 8 chars and include uppercase, lowercase, number, and special character',
    });
  }

  if (!telephone || !isValidTelephone(telephone)) {
    return res.status(400).json({
      success: false,
      message: 'Telephone is required and must have 9–15 digits',
    });
  }

  if (role && !VALID_ROLES.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `Role must be one of: ${VALID_ROLES.join(', ')}`,
    });
  }

  if (branch !== undefined && branch !== null && typeof branch !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Branch must be a valid ID string',
    });
  }

  next();
};

export const validateUpdateUser = (req, res, next) => {
  const { name, email, password, telephone, role, branch, isActive } = req.body;

  if (name !== undefined && !isValidName(name)) {
    return res.status(400).json({
      success: false,
      message:
        'If provided, name should be 2–50 characters (letters and spaces only)',
    });
  }

  if (email !== undefined && !isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'If provided, email must be valid',
    });
  }

  if (password !== undefined && !isStrongPassword(password)) {
    return res.status(400).json({
      success: false,
      message:
        'If provided, password must be at least 8 chars and include uppercase, lowercase, number, and special character',
    });
  }

  if (telephone !== undefined && !isValidTelephone(telephone)) {
    return res.status(400).json({
      success: false,
      message:
        'If provided, telephone must have 9–15 digits (numbers only)',
    });
  }

  if (role !== undefined && !VALID_ROLES.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `If provided, role must be one of: ${VALID_ROLES.join(', ')}`,
    });
  }

  if (branch !== undefined && branch !== null && typeof branch !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'If provided, branch must be a valid ID string',
    });
  }

  if (isActive !== undefined && typeof isActive !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'If provided, isActive must be a boolean',
    });
  }

  next();
};

export const validateUpdateOwnProfile = (req, res, next) => {
  const { name, email, telephone } = req.body;

  if (name !== undefined && !isValidName(name)) {
    return res.status(400).json({
      success: false,
      message:
        'If provided, name should be 2–50 characters (letters and spaces only)',
    });
  }

  if (email !== undefined && !isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'If provided, email must be valid',
    });
  }

  if (telephone !== undefined && !isValidTelephone(telephone)) {
    return res.status(400).json({
      success: false,
      message:
        'If provided, telephone must have 9–15 digits (numbers only)',
    });
  }

  next();
};

export const validateStatusUpdate = (req, res, next) => {
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isActive is required and must be a boolean',
    });
  }

  next();
};

export const validateResetPassword = (req, res, next) => {
  const { password } = req.body;

  if (!password || !isStrongPassword(password)) {
    return res.status(400).json({
      success: false,
      message:
        'Password must be at least 8 chars and include uppercase, lowercase, number, and special character',
    });
  }

  next();
};

export const validateChangeOwnPassword = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || typeof currentPassword !== "string") {
    return res.status(400).json({ success: false, message: "Current password is required" });
  }

  if (!newPassword || !isStrongPassword(newPassword)) {
    return res.status(400).json({
      success: false,
      message:
        "New password must be at least 8 chars and include uppercase, lowercase, number, and special character",
    });
  }

  next();
};
