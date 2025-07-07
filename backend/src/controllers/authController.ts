import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { validate } from 'class-validator';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { generateTokens, verifyRefreshToken, generateAccessToken } from '../utils/jwt';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth';

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password }: RegisterRequest = req.body;

    // Validation
    if (!username || !email || !password) {
      res.status(400).json({ message: 'Username, email, and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);

    // Check if user already exists
    const existingUser = await userRepository.findOne({
      where: [{ email }, { username }]
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      res.status(409).json({ message: `User with this ${field} already exists` });
      return;
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User();
    user.username = username;
    user.email = email;
    user.password_hash = password_hash;

    // Validate user data
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.map(error => ({
          property: error.property,
          constraints: error.constraints
        }))
      });
      return;
    }

    await userRepository.save(user);

    // Generate tokens
    const { token, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
      username: user.username
    });

    logger.info(`User registered successfully: ${user.email}`);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        created_at: user.created_at
      },
      token,
      refreshToken
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { email, is_active: true }
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Generate tokens
    const { token, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
      username: user.username
    });

    logger.info(`User logged in successfully: ${user.email}`);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        created_at: user.created_at
      },
      token,
      refreshToken
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken }: RefreshTokenRequest = req.body;

    if (!refreshToken) {
      res.status(400).json({ message: 'Refresh token is required' });
      return;
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if user still exists and is active
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: decoded.userId, is_active: true }
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }

    // Generate new access token
    const newToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username
    });

    res.json({
      token: newToken
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // In a production environment, you might want to maintain a blacklist of tokens
    // For now, we'll just respond with a success message
    logger.info(`User logged out: ${req.user?.email}`);
    res.json({ message: 'Logout successful' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        avatar_url: req.user.avatar_url,
        created_at: req.user.created_at,
        updated_at: req.user.updated_at
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};