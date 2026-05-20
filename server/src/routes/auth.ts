import { Router, Response } from 'express';
import User from '../models/User';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken } from '../utils/auth';
import { isAdult, calculateAge } from '../utils/helpers';
import { createStripeCustomer } from '../utils/stripe';

const router = Router();

// Register
router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, dateOfBirth, gender, interestedIn } = req.body;

    // Validate age
    if (!isAdult(new Date(dateOfBirth))) {
      return res.status(400).json({ error: 'Must be 18 or older' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) {
      return res.status(409).json({ error: 'Email or phone number already registered' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create Stripe customer
    const stripeCustomer = await createStripeCustomer(email, firstName);

    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      phoneNumber,
      passwordHash,
      dateOfBirth: new Date(dateOfBirth),
      age: calculateAge(new Date(dateOfBirth)),
      gender,
      interestedIn,
      location: {
        type: 'Point',
        coordinates: [0, 0] // Default, will be updated with GPS
      },
      photos: [],
      interests: [],
      subscription: {
        tier: 'free',
        startDate: new Date()
      }
    });

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    res.status(201).json({
      message: 'User registered successfully',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        email: user.email,
        subscription: user.subscription
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last active
    user.stats.lastActive = new Date();
    await user.save();

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        email: user.email,
        subscription: user.subscription
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Refresh token
router.post('/refresh', async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = require('../utils/auth').verifyToken(refreshToken, true) as any;
    const accessToken = generateAccessToken(decoded.userId);

    res.json({ accessToken });
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Logout
router.post('/logout', authenticateToken, (req: AuthRequest, res: Response) => {
  // Token invalidation could be handled via a blacklist in Redis
  res.json({ message: 'Logout successful' });
});

export default router;
