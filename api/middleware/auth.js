const { verifyAccessToken } = require("../utils/auth");
const prisma = require("../config/database");

/**
 * Middleware to authenticate requests using JWT
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Access denied. No token provided or invalid format.",
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify the token
        const decoded = verifyAccessToken(token);

        // Check if user still exists and is active
        const user = await prisma.user.findUnique({
            where: {
                id: decoded.userId,
                isActive: true,
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                isActive: true,
            },
        });

        if (!user) {
            return res.status(401).json({
                error: "Invalid token. User not found or inactive.",
            });
        }

        // Add user info to request object
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            error: "Invalid token.",
            details: error.message,
        });
    }
};

/**
 * Middleware to check if user has required role
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: "Authentication required.",
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: "Insufficient permissions.",
            });
        }

        next();
    };
};

/**
 * Middleware to check if user owns the resource or is admin
 */
const authorizeOwnerOrAdmin = (userIdField = "userId") => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: "Authentication required.",
            });
        }

        const resourceUserId = req.params[userIdField] || req.body[userIdField];

        if (req.user.role === "admin" || req.user.id === resourceUserId) {
            next();
        } else {
            return res.status(403).json({
                error: "Access denied. You can only access your own resources.",
            });
        }
    };
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.substring(7);
            const decoded = verifyAccessToken(token);

            const user = await prisma.user.findUnique({
                where: {
                    id: decoded.userId,
                    isActive: true,
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                },
            });

            if (user) {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        // If token is invalid, continue without user
        next();
    }
};

module.exports = {
    authenticate,
    authorize,
    authorizeOwnerOrAdmin,
    optionalAuth,
};
