import { Router, Response } from 'express';
import Message from '../models/Message';
import Match from '../models/Match';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get messages for a match
router.get('/:matchId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const match = await Match.findById(req.params.matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Verify authorization
    if (match.user1.toString() !== req.userId && match.user2.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const messages = await Message.find({ match: req.params.matchId })
      .sort({ createdAt: -1 })
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string));

    res.json(messages.reverse());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Send message
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { matchId, content, messageType = 'text', mediaUrl } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Determine recipient
    const recipientId = match.user1.toString() === req.userId ? match.user2 : match.user1;

    // Verify authorization
    if (match.user1.toString() !== req.userId && match.user2.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const message = new Message({
      match: matchId,
      sender: req.userId,
      recipient: recipientId,
      messageType,
      content,
      mediaUrl,
      isDelivered: true,
      deliveredAt: new Date()
    });

    await message.save();
    match.lastMessageAt = new Date();
    await match.save();

    // Emit message via Socket.IO
    const io = (req.app as any).get('io');
    if (io) {
      io.to(`match_${matchId}`).emit('receive_message', {
        messageId: message._id,
        matchId,
        sender: req.userId,
        content,
        messageType,
        createdAt: message.createdAt
      });
    }

    res.status(201).json(message);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mark message as read
router.put('/:messageId/read', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.recipient.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    // Emit read receipt via Socket.IO
    const io = (req.app as any).get('io');
    if (io) {
      io.to(`match_${message.match}`).emit('message_read', {
        messageId: message._id,
        readAt: message.readAt
      });
    }

    res.json(message);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete message
router.delete('/:messageId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.sender.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    message.deletedAt = new Date();
    await message.save();

    res.json({ message: 'Message deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
