import { Router, Response } from 'express';
import Match from '../models/Match';
import Swipe from '../models/Swipe';
import User from '../models/User';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Record a swipe
router.post('/swipe', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { swipedUserId, direction } = req.body; // direction: 'like', 'nope', 'superlike'

    if (!['like', 'nope', 'superlike'].includes(direction)) {
      return res.status(400).json({ error: 'Invalid direction' });
    }

    // Check if already swiped
    const existingSwipe = await Swipe.findOne({
      swiper: req.userId,
      swiped: swipedUserId
    });

    if (existingSwipe) {
      return res.status(400).json({ error: 'Already swiped this user' });
    }

    // Record swipe
    const swipe = new Swipe({
      swiper: req.userId,
      swiped: swipedUserId,
      direction
    });
    await swipe.save();

    // Update user stats
    const currentUser = await User.findById(req.userId);
    if (currentUser) {
      currentUser.stats.totalSwipes += 1;
      if (direction === 'like' || direction === 'superlike') {
        currentUser.stats.totalLikes += 1;
      }
      await currentUser.save();
    }

    // Check for mutual like (match)
    if (direction === 'like' || direction === 'superlike') {
      const mutualSwipe = await Swipe.findOne({
        swiper: swipedUserId,
        swiped: req.userId,
        direction: { $in: ['like', 'superlike'] }
      });

      if (mutualSwipe) {
        // Create match
        const match = new Match({
          user1: req.userId,
          user2: swipedUserId,
          user1Like: true,
          user2Like: true,
          matchedAt: new Date(),
          isActive: true
        });
        await match.save();

        // Update both users' match stats
        await User.findByIdAndUpdate(req.userId, { $inc: { 'stats.totalMatches': 1 } });
        await User.findByIdAndUpdate(swipedUserId, { $inc: { 'stats.totalMatches': 1 } });

        // Emit match event via Socket.IO
        const io = (req.app as any).get('io');
        if (io) {
          io.to(`user_${swipedUserId}`).emit('new_match', {
            matchId: match._id,
            matchedWith: req.userId,
            matchedAt: match.matchedAt
          });
        }

        return res.status(201).json({
          message: 'Match!',
          match: {
            id: match._id,
            matchedWith: swipedUserId,
            matchedAt: match.matchedAt
          }
        });
      }
    }

    res.json({ message: 'Swipe recorded' });
  } catch (error: any) {
    console.error('Swipe error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all matches for user
router.get('/matches', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const matches = await Match.find({
      $or: [
        { user1: req.userId, user1Like: true, user2Like: true },
        { user2: req.userId, user1Like: true, user2Like: true }
      ],
      isActive: true
    })
      .populate({
        path: 'user1 user2',
        select: '-passwordHash -blockedUsers'
      })
      .sort({ matchedAt: -1 });

    res.json(matches);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get likes received (who likes you)
router.get('/likes', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all users who liked current user
    const swipes = await Swipe.find({
      swiped: req.userId,
      direction: { $in: ['like', 'superlike'] }
    }).populate({
      path: 'swiper',
      select: '-passwordHash -blockedUsers'
    });

    // Filter out mutual matches and blocked users
    const filteredSwipes = await Promise.all(
      swipes.map(async (swipe) => {
        const isMatch = await Match.findOne({
          $or: [
            { user1: req.userId, user2: swipe.swiper._id },
            { user1: swipe.swiper._id, user2: req.userId }
          ],
          isActive: true
        });

        return { ...swipe.toObject(), isMatch: !!isMatch };
      })
    );

    res.json(filteredSwipes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get match details
router.get('/:matchId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const match = await Match.findById(req.params.matchId)
      .populate({
        path: 'user1 user2',
        select: '-passwordHash -blockedUsers'
      })
      .populate({
        path: 'messages',
        options: { limit: 20, sort: { createdAt: -1 } }
      });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Verify user is part of match
    if (match.user1._id.toString() !== req.userId && match.user2._id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(match);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Unmatch
router.delete('/:matchId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const match = await Match.findById(req.params.matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Verify authorization
    if (match.user1.toString() !== req.userId && match.user2.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    match.isActive = false;
    match.unmatchedBy = req.userId;
    match.unmatchedAt = new Date();
    await match.save();

    res.json({ message: 'Unmatched successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
