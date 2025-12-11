import * as authService from './service.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role, branch } = req.body;

    const user = await authService.register({
      name,
      email,
      password,
      role,
      branch,
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user,
    });
  } catch (error) {
    console.error('Register error:', error);

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || 'Failed to register user',
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    console.error('Login error:', error);

    return res.status(error.statusCode || 401).json({
      success: false,
      message: error.message || 'Failed to login',
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const tokens = await authService.refreshToken({ refreshToken });

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: tokens,
    });
  } catch (error) {
    console.error('Refresh token error:', error);

    return res.status(error.statusCode || 401).json({
      success: false,
      message: error.message || 'Failed to refresh token',
    });
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.user.id;

    await authService.logout(userId);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || 'Failed to logout',
    });
  }
};
