import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation error',
      errors: Object.values(err.errors).map((e: any) => e.message)
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      status: 'error',
      statusCode: 409,
      message: `${field} already exists`
    });
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    statusCode: 500,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
};
