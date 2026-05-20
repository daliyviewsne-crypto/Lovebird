import { Router, Response } from 'express';
import User from '../models/User';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { calculateDistance } from '../utils/helpers';

const router = Router();

// Get current user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, bio, profession, interests, datingIntentions, preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        firstName,
        lastName,
        bio,
        profession,
        interests,
        datingIntentions,
        preferences
      },
      { new: true }
    );

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update location
router.put('/location', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { latitude, longitude, address } = req.body;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        location: {
          type: 'Point',
          coordinates: [longitude, latitude],
          address
        },
        'stats.lastActive': new Date()
      },
      { new: true }
    );

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get users for swiping (Discovery)
router.get('/discover', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { maxDistance = 50, limit = 10 } = req.query;

    // Build match criteria
    const matchCriteria: any = {
      _id: { $ne: req.userId },
      blockedUsers: { $nin: [req.userId] },
      age: {
        $gte: currentUser.preferences.ageRange.min,
        $lte: currentUser.preferences.ageRange.max
      }
    };

    // Filter by interested in gender
    if (currentUser.interestedIn.length > 0) {
      if (!currentUser.interestedIn.includes('everyone')) {
        matchCriteria.gender = { $in: currentUser.interestedIn };
      }
    }

    // Geospatial query
    const users = await User.find({
      ...matchCriteria,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: currentUser.location.coordinates
          },
          $maxDistance: (maxDistance as number) * 1000 // Convert km to meters
        }
      }
    })
      .limit(parseInt(limit as string) || 10)
      .select('-passwordHash -blockedUsers -reportedUsers');

    res.json(users);
  } catch (error: any) {
    console.error('Discover error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:userId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.userId).select('-passwordHash -blockedUsers -reportedUsers');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentUser = await User.findById(req.userId);
    if (currentUser?.location.coordinates) {
      const distance = calculateDistance(
        currentUser.location.coordinates[1],
        currentUser.location.coordinates[0],
        user.location.coordinates[1],
        user.location.coordinates[0]
      );
      (user as any).distance = distance;
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Upload photos
router.post('/photos', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { url, isVideo = false } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Max 6 photos
    if (user.photos.length >= 6) {
      return res.status(400).json({ error: 'Maximum 6 photos allowed' });
    }

    const newPhoto = {
      url,
      order: user.photos.length,
      isVideo,
      successRate: 0,
      createdAt: new Date()
    };

    user.photos.push(newPhoto);
    await user.save();

    res.status(201).json({ message: 'Photo uploaded', photo: newPhoto });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete photo
router.delete('/photos/:photoIndex', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { photoIndex } = req.params;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.photos.splice(parseInt(photoIndex), 1);
    // Re-order remaining photos
    user.photos.forEach((photo, index) => {
      photo.order = index;
    });

    await user.save();
    res.json({ message: 'Photo deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Block user
router.post('/block/:userId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.blockedUsers.includes(req.params.userId)) {
      user.blockedUsers.push(req.params.userId);
      await user.save();
    }

    res.json({ message: 'User blocked' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Unblock user
router.post('/unblock/:userId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== req.params.userId);
    await user.save();

    res.json({ message: 'User unblocked' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
