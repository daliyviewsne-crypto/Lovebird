import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId: string) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    { expiresIn: '30d' }
  );
};

export const verifyToken = (token: string, isRefresh: boolean = false) => {
  const secret = isRefresh
    ? process.env.JWT_REFRESH_SECRET || 'your-refresh-secret'
    : process.env.JWT_SECRET || 'your-secret-key';

  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};
