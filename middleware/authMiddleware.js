import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.js';
import User from '../models/userModel.js';

/**
 * Middleware to protect user routes.
 * Verifies JWT from Authorization header, then fetches user from DB.
 */
 const protectUser = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.userId).select('-password');
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

const protectAdmin = async (req, res, next) => {
    let token;

    // 1. Get token from header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Find admin by email from payload
        // The python code uses 'admin-email', so we should stick to that convention in the payload
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
const authorizeMainAdmin = (req, res, next) => {
    if (req.admin && req.admin['Admin-Role'] === 'main-admin-001') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as a main admin' });
    }
};

export { protectAdmin, authorizeMainAdmin, protectUser };
