import { Router, Response } from 'express';
import Subscription from '../models/Subscription';
import User from '../models/User';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { createSubscription, cancelSubscription, createStripeCustomer } from '../utils/stripe';

const router = Router();

// Get subscription tiers pricing
router.get('/tiers', (req: AuthRequest, res: Response) => {
  const tiers = [
    {
      id: 'plus',
      name: 'Love Birds Plus',
      monthlyPrice: 9.99,
      annualPrice: 99.99,
      features: [
        'Unlimited Likes',
        'Rewind Feature',
        'Passport Mode (Change GPS)'
      ]
    },
    {
      id: 'gold',
      name: 'Love Birds Gold',
      monthlyPrice: 19.99,
      annualPrice: 199.99,
      features: [
        'All Plus Features',
        'See Who Likes You',
        '5 Daily Super Likes',
        '1 Monthly Profile Boost'
      ]
    },
    {
      id: 'platinum',
      name: 'Love Birds Platinum',
      monthlyPrice: 29.99,
      annualPrice: 299.99,
      features: [
        'All Gold Features',
        'Priority Likes',
        'Message Before Matching',
        'Advanced Filters'
      ]
    }
  ];

  res.json(tiers);
});

// Get current subscription
router.get('/current', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const subscription = await Subscription.findOne({ user: req.userId });
    res.json(subscription || { tier: 'free' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create subscription
router.post('/create', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { tier, billingCycle, paymentMethodId } = req.body;

    if (!['plus', 'gold', 'platinum'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid subscription tier' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already has active subscription
    const existingSubscription = await Subscription.findOne({ user: req.userId, status: 'active' });
    if (existingSubscription) {
      return res.status(400).json({ error: 'User already has active subscription' });
    }

    // Pricing
    const pricing: any = {
      plus: { monthly: 9.99, annual: 99.99 },
      gold: { monthly: 19.99, annual: 199.99 },
      platinum: { monthly: 29.99, annual: 299.99 }
    };

    const amount = pricing[tier][billingCycle || 'monthly'];
    const duration = billingCycle === 'annual' ? 365 : 30;
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);
    const renewalDate = new Date(endDate);

    // Create/Get Stripe customer
    let customerId = user.subscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await createStripeCustomer(user.email, user.firstName);
      customerId = customer.id;
    }

    // Create Stripe subscription (mock for now)
    // In production, integrate with Stripe API
    const stripeSubscriptionId = `sub_${Date.now()}`;

    // Create subscription in DB
    const subscription = new Subscription({
      user: req.userId,
      tier,
      billingCycle,
      startDate,
      endDate,
      renewalDate,
      stripeCustomerId: customerId,
      stripeSubscriptionId,
      stripePaymentMethodId: paymentMethodId,
      amount,
      status: 'active',
      features: getFeaturesByTier(tier),
      consumerCredits: tier === 'gold' ? 1 : tier === 'platinum' ? 1 : 0
    });

    await subscription.save();

    // Update user subscription tier
    user.subscription.tier = tier as any;
    user.subscription.startDate = startDate;
    user.subscription.endDate = endDate;
    user.subscription.stripeCustomerId = customerId;
    user.subscription.stripeSubscriptionId = stripeSubscriptionId;
    await user.save();

    res.status(201).json({
      message: 'Subscription created successfully',
      subscription
    });
  } catch (error: any) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel subscription
router.post('/cancel', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const subscription = await Subscription.findOne({ user: req.userId, status: 'active' });
    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Cancel Stripe subscription
    // await cancelSubscription(subscription.stripeSubscriptionId);

    subscription.status = 'canceled';
    subscription.canceledAt = new Date();
    await subscription.save();

    // Revert user tier to free
    const user = await User.findById(req.userId);
    if (user) {
      user.subscription.tier = 'free';
      await user.save();
    }

    res.json({ message: 'Subscription canceled' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

function getFeaturesByTier(tier: string) {
  const featureMap: any = {
    plus: {
      unlimitedLikes: true,
      rewind: true,
      passportMode: true,
      seeWhoLikesYou: false,
      dailySuperLikes: 0,
      monthlyBoost: 0,
      priorityLikes: false,
      messageBeforeMatch: false
    },
    gold: {
      unlimitedLikes: true,
      rewind: true,
      passportMode: true,
      seeWhoLikesYou: true,
      dailySuperLikes: 5,
      monthlyBoost: 1,
      priorityLikes: false,
      messageBeforeMatch: false
    },
    platinum: {
      unlimitedLikes: true,
      rewind: true,
      passportMode: true,
      seeWhoLikesYou: true,
      dailySuperLikes: 5,
      monthlyBoost: 1,
      priorityLikes: true,
      messageBeforeMatch: true
    }
  };

  return featureMap[tier];
}

export default router;
