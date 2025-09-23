const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const JWT_REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

/**
 * Generate JWT access token
 */
const generateAccessToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        issuer: "tcg-mobile-api",
    });
};

/**
 * Generate JWT refresh token
 */
const generateRefreshToken = (payload) => {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
        issuer: "tcg-mobile-api",
    });
};

/**
 * Verify JWT access token
 */
const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error("Invalid or expired token");
    }
};

/**
 * Verify JWT refresh token
 */
const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (error) {
        throw new Error("Invalid or expired refresh token");
    }
};

/**
 * Hash password
 */
const hashPassword = async (password) => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 */
const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

/**
 * Generate token pair (access + refresh)
 */
const generateTokenPair = (user) => {
    const payload = {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ userId: user.id });

    return {
        accessToken,
        refreshToken,
        expiresIn: JWT_EXPIRES_IN,
    };
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    hashPassword,
    comparePassword,
    generateTokenPair,
};
