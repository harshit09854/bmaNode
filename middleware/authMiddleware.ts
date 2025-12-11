import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.ts';
import User from '../models/userModel.ts';
import type { IAdmin } from '../models/adminModel.ts';
import type { IUser } from '../models/userModel.ts';

// Interface for the JWT payload
interface JwtPayload {
  userId?: string;
  email?: string;
  'admin-email'?: string;
}

// Extend the Express Request interface to include custom properties
export interface CustomRequest extends Request {
  user?: IUser;
  admin?: IAdmin;
}

/**
 * Middleware to protect user routes.
 * Verifies JWT from Authorization header, then fetches user from DB.
 */
export const protectUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.SECRET_KEY as string) as JwtPayload;
      if (decoded.userId) {
        req.user = await User.findById(decoded.userId).select('-password');
      }

      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * Middleware to protect admin routes.
 * Verifies JWT from Authorization header or cookie, then fetches admin from DB.
 */
export const protectAdmin = async (req: CustomRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }


  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY as string) as JwtPayload;
    const adminEmail = decoded.email || decoded['admin-email'];

    if (!adminEmail) {
      return res.status(401).json({ message: 'Not authorized, token is missing email' });
    }

    req.admin = await Admin.findOne({ businessEmail: adminEmail }).select('-password');

    if (!req.admin) {
      return res.status(401).json({ message: 'Not authorized, admin not found' });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

/**
 * Middleware to authorize only the main admin.
 * Must be used after protectAdmin.
 */
export const authorizeMainAdmin = (req: CustomRequest, res: Response, next: NextFunction) => {
  if (req.admin && req.admin['Admin-Role'] === 'main-admin-001') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as a main admin' });
  }
};