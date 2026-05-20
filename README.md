# Love Birds - High-End Dating Application

A full-featured, real-time dating application that perfectly replicates Tinder's UI, animations, gestures, and premium subscription model.

## 🚀 Features

### Core Functionality
- **Real-time Swipe Cards** with fluid physics-based animations
- **Location-based Discovery** using geospatial indexing (2km - 160km radius)
- **Instant Matches** with real-time notifications
- **Live Chat** with read receipts, typing indicators, and voice notes
- **Photo Management** with smart success-rate tracking

### Premium Tiers

#### Love Birds Plus ($9.99/month)
- Unlimited Likes
- Rewind Feature (undo last swipe)
- Passport Mode (change GPS location globally)

#### Love Birds Gold ($19.99/month)
- All Plus features
- See Who Likes You (unblurred profiles)
- 5 Daily Super Likes
- 1 Monthly Profile Boost

#### Love Birds Platinum ($29.99/month)
- All Gold features
- Priority Likes (push to front of others' decks)
- Message Before Matching (attach note to Super Like)
- Advanced Filters

### UI/UX Design
- **Cherry Red to Sunburst Orange** gradient branding
- **Minimalist aesthetic** with clean typography (Inter/Gilroy/SF Pro)
- **Fluid animations** and haptic feedback
- **Responsive design** for mobile and tablet
- **Accessibility** optimized for all users

## 📁 Project Structure

```
love-birds/
├── server/                 # Node.js/Express backend
│   ├── src/
│   │   ├── index.ts       # Main server entry point
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # Auth, error handling, logging
│   │   └── utils/         # Helpers, Stripe, password hashing
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── client/                 # React frontend
│   ├── src/
│   │   ├── screens/       # Full-screen views
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React Context (Auth, Matches)
│   │   ├── App.tsx        # Main app router
│   │   └── index.tsx      # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
│
└── README.md
```

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js (ES2020+)
- **Framework**: Express.js
- **Database**: MongoDB with geospatial indexing
- **Real-time**: Socket.IO for WebSocket communication
- **Authentication**: JWT (Access + Refresh tokens)
- **Payment**: Stripe integration
- **Security**: Helmet, bcryptjs password hashing
- **File Storage**: AWS S3
- **Face Verification**: AWS Rekognition

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **State Management**: React Context API
- **Animations**: CSS transitions + react-swipeable
- **Build Tool**: Vite
- **Real-time**: Socket.IO client
- **HTTP**: Fetch API

## 📦 Installation

### Prerequisites
- Node.js 18+
- MongoDB 5.0+
- Stripe Account
- AWS Account (S3, Rekognition)

### Backend Setup

```bash
cd server
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd client
npm install

# Configure environment variables
cp .env.example .env

# Start development server
npm run dev
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/location` - Update location
- `GET /api/users/discover` - Get discovery users
- `GET /api/users/:userId` - Get user details
- `POST /api/users/photos` - Upload photo
- `DELETE /api/users/photos/:photoIndex` - Delete photo
- `POST /api/users/block/:userId` - Block user
- `POST /api/users/unblock/:userId` - Unblock user

### Matches & Swipes
- `POST /api/matches/swipe` - Record swipe (like/nope/superlike)
- `GET /api/matches/matches` - Get all matches
- `GET /api/matches/likes` - Get likes received
- `GET /api/matches/:matchId` - Get match details
- `DELETE /api/matches/:matchId` - Unmatch

### Messages
- `GET /api/messages/:matchId` - Get chat history
- `POST /api/messages` - Send message
- `PUT /api/messages/:messageId/read` - Mark as read
- `DELETE /api/messages/:messageId` - Delete message

### Subscriptions
- `GET /api/subscriptions/tiers` - Get pricing tiers
- `GET /api/subscriptions/current` - Get current subscription
- `POST /api/subscriptions/create` - Create subscription
- `POST /api/subscriptions/cancel` - Cancel subscription

## 🔐 Security Features

- **JWT Authentication** with refresh token rotation
- **Password Hashing** using bcryptjs (10 rounds)
- **CORS** properly configured
- **Helmet** for HTTP headers
- **Rate Limiting** (recommended: express-rate-limit)
- **Input Validation** with Mongoose schemas
- **Geospatial Security** - GPS spoofing prevention
- **Photo Verification** - AWS Rekognition face detection
- **Blocked User Lists** - Contact privacy

## 📊 Database Schema

### User
- Personal info (name, email, phone, DOB)
- Location (geospatial point)
- Photos with success metrics
- Interests & dating intentions
- Subscription tier & billing
- Stats (swipes, matches, last active)

### Match
- Two users with like status
- Matched timestamp
- Active/inactive state
- Message history references

### Message
- Sender/recipient IDs
- Content & media URLs
- Read/delivered receipts
- Timestamps

### Swipe
- Swiper/swiped user IDs
- Direction (like/nope/superlike)
- Timestamp for analytics

### Subscription
- Tier (plus/gold/platinum)
- Stripe customer & subscription IDs
- Feature flags
- Billing cycle & renewal dates

## 🎯 Socket.IO Events

### Client → Server
- `join_match` - Join match chat room
- `typing` - User is typing
- `stop_typing` - User stopped typing
- `send_message` - Send message

### Server → Client
- `new_match` - Match notification
- `receive_message` - New message
- `user_typing` - Other user typing
- `message_read` - Message read receipt
- `match_notification` - Match update

## 🚀 Deployment

### Heroku (Server)
```bash
heroku create love-birds-api
heroku config:set MONGO_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
# ... set other env vars
git push heroku main
```

### Vercel (Frontend)
```bash
npm install -g vercel
vercel
```

## 📱 Mobile App (Future)
- React Native implementation
- iOS App Store distribution
- Google Play Store distribution
- Push notifications (Firebase Cloud Messaging)
- Offline support with Redux Persist

## 💰 Monetization

- **Subscription Tiers** - Recurring revenue
- **In-app Purchases** - Boosts, Super Likes
- **Premium Features** - Paywall integration
- **Analytics** - Track conversion funnel

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## 📝 License

MIT License - See LICENSE file for details

## 👨‍💻 Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

## 📞 Support

For issues and questions:
- GitHub Issues: https://github.com/daliyviewsne-crypto/Lovebird/issues
- Email: support@lovebirds.app

---

**Built with ❤️ by Your Team**
