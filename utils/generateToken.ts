import jwt from 'jsonwebtoken';
import type { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import type { Response } from 'express';

/**
 * Creates a JWT access token.
 * @param {object} payload - The payload to sign.
 * @param {string} expiresIn - The token expiration time (e.g., '1d', '24h').
 * @returns {string} The signed JWT.
 */
const createAccessToken = (payload: object, expiresIn: string | number = '24h'): string => {
    const secret: Secret = (process.env.JWT_SECRET || process.env.SECRET_KEY) as Secret;
    // `SignOptions.expiresIn` accepts number | string-like values; cast to any to satisfy types
    const options: SignOptions = { expiresIn: expiresIn as any };
    return jwt.sign(payload as any, secret, options as SignOptions);
};

/**
 * Verifies a JWT.
 * @param {string} token - The JWT to verify.
 * @returns {object|null} The decoded payload if the token is valid, otherwise null.
 */
const verifyUserToken = (token: string): JwtPayload | null => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        return decoded;
    } catch (error: any) {
        console.error('Invalid token:', error.message);
        return null;
    }
};

/**
 * Creates a token and sets it as an HTTP-only cookie.
 * @param {object} res - The Express response object.
 * @param {string} userId - The user ID to include in the token payload.
 */
const setTokenCookie = (res: Response, userId: string) => {
    const token = createAccessToken({ userId }, '1d');

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
        sameSite: 'strict', // Prevent CSRF attacks
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
};

export { createAccessToken, verifyUserToken, setTokenCookie };