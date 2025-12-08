import jwt from 'jsonwebtoken';

/**
 * Creates a JWT access token.
 * @param {object} payload - The payload to sign.
 * @param {string} expiresIn - The token expiration time (e.g., '1d', '24h').
 * @returns {string} The signed JWT.
 */
const createAccessToken = (payload, expiresIn = '24h') => {
    return jwt.sign(payload, process.env.SECRET_KEY, {
        expiresIn,
    });
};

/**
 * Verifies a JWT.
 * @param {string} token - The JWT to verify.
 * @returns {object|null} The decoded payload if the token is valid, otherwise null.
 */
const verifyUserToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        console.error('Invalid token:', error.message);
        return null;
    }
};

/**
 * Creates a token and sets it as an HTTP-only cookie.
 * @param {object} res - The Express response object.
 * @param {string} userId - The user ID to include in the token payload.
 */
const setTokenCookie = (res, userId) => {
    const token = createAccessToken({ userId }, '1d');

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
        sameSite: 'strict', // Prevent CSRF attacks
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
};

export { createAccessToken, verifyUserToken, setTokenCookie };
