const prisma = require("../config/database");
const {
    hashPassword,
    comparePassword,
    generateTokenPair,
    verifyRefreshToken,
} = require("../utils/auth");

/**
 * Register a new user
 */
const register = async (req, res, next) => {
    try {
        const { username, email, password, displayName } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                error:
                    existingUser.email === email
                        ? "Email already registered"
                        : "Username already taken",
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                displayName: displayName || username,
                // Default starting resources
                coins: parseInt(process.env.DEFAULT_STARTING_COINS) || 100,
                gems: parseInt(process.env.DEFAULT_STARTING_GEMS) || 10,
            },
            select: {
                id: true,
                username: true,
                email: true,
                displayName: true,
                avatar: true,
                level: true,
                experience: true,
                coins: true,
                gems: true,
                dust: true,
                role: true,
                createdAt: true,
            },
        });

        // Generate tokens
        const tokens = generateTokenPair(user);

        // Store refresh token in database
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: tokens.refreshToken },
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user,
                ...tokens,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login user
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                _count: {
                    select: {
                        userCards: true,
                        decks: true,
                        friends: true,
                    },
                },
            },
        });

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                error: "Invalid credentials",
            });
        }

        // Verify password
        const isValidPassword = await comparePassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: "Invalid credentials",
            });
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        // Generate tokens
        const tokens = generateTokenPair(user);

        // Store refresh token
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: tokens.refreshToken },
        });

        // Remove sensitive data
        const { password: _, refreshToken: __, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: "Login successful",
            data: {
                user: userWithoutPassword,
                ...tokens,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Refresh access token
 */
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Find user and verify refresh token
        const user = await prisma.user.findUnique({
            where: {
                id: decoded.userId,
                refreshToken,
                isActive: true,
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
            },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: "Invalid refresh token",
            });
        }

        // Generate new token pair
        const tokens = generateTokenPair(user);

        // Update refresh token in database
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: tokens.refreshToken },
        });

        res.json({
            success: true,
            message: "Token refreshed successfully",
            data: tokens,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Logout user
 */
const logout = async (req, res, next) => {
    try {
        // Clear refresh token from database
        await prisma.user.update({
            where: { id: req.user.id },
            data: { refreshToken: null },
        });

        res.json({
            success: true,
            message: "Logout successful",
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                username: true,
                email: true,
                displayName: true,
                avatar: true,
                level: true,
                experience: true,
                title: true,
                bio: true,
                totalGamesPlayed: true,
                wins: true,
                losses: true,
                winRate: true,
                currentStreak: true,
                bestStreak: true,
                ranking: true,
                league: true,
                totalCards: true,
                uniqueCards: true,
                coins: true,
                gems: true,
                dust: true,
                showProfile: true,
                showCollection: true,
                allowFriendRequests: true,
                notificationsEnabled: true,
                lastLogin: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        userCards: true,
                        decks: true,
                        friends: true,
                        completedSets: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    refreshToken,
    logout,
    getProfile,
};
