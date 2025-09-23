const prisma = require("../config/database");

/**
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const updateData = req.body;

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                displayName: true,
                avatar: true,
                bio: true,
                level: true,
                experience: true,
                showProfile: true,
                showCollection: true,
                allowFriendRequests: true,
                notificationsEnabled: true,
                updatedAt: true,
            },
        });

        res.json({
            success: true,
            message: "Profile updated successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user's card collection
 */
const getUserCollection = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const {
            page = 1,
            limit = 20,
            rarity,
            element,
            search,
            sortBy = "character.name",
            sortOrder = "asc",
        } = req.query;

        // Check if user exists and collection is public (or own collection)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { showCollection: true },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        if (!user.showCollection && req.user?.id !== userId) {
            return res.status(403).json({
                success: false,
                error: "This user's collection is private",
            });
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause
        const where = { userId };
        const characterWhere = {};

        if (rarity) characterWhere.rarity = rarity;
        if (element) characterWhere.element = element;
        if (search) {
            characterWhere.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        if (Object.keys(characterWhere).length > 0) {
            where.character = characterWhere;
        }

        const [userCards, total] = await Promise.all([
            prisma.userCard.findMany({
                where,
                include: {
                    character: {
                        include: {
                            set: {
                                select: { name: true, code: true },
                            },
                        },
                    },
                },
                orderBy: {
                    character: {
                        name: sortOrder,
                    },
                },
                skip: offset,
                take: parseInt(limit),
            }),
            prisma.userCard.count({ where }),
        ]);

        res.json({
            success: true,
            data: userCards,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user's decks
 */
const getUserDecks = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Check if decks are public or own decks
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { showProfile: true },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        const where = { ownerId: userId };

        // If not own decks and profile is private, only show public decks
        if (req.user?.id !== userId && !user.showProfile) {
            where.isPublic = true;
        }

        const decks = await prisma.deck.findMany({
            where,
            select: {
                id: true,
                name: true,
                description: true,
                format: true,
                mainElement: true,
                strategy: true,
                isPublic: true,
                wins: true,
                losses: true,
                winRate: true,
                likes: true,
                copies: true,
                lastUsed: true,
                createdAt: true,
                _count: {
                    select: {
                        cards: true,
                    },
                },
            },
            orderBy: { lastUsed: "desc" },
        });

        res.json({
            success: true,
            data: decks,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user statistics
 */
const getUserStats = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                level: true,
                experience: true,
                title: true,
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
                showProfile: true,
                createdAt: true,
                _count: {
                    select: {
                        decks: true,
                        completedSets: true,
                        friends: true,
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

        if (!user.showProfile && req.user?.id !== userId) {
            return res.status(403).json({
                success: false,
                error: "This user's profile is private",
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

/**
 * Get leaderboard
 */
const getLeaderboard = async (req, res, next) => {
    try {
        const { type = "ranking", limit = 50 } = req.query;

        let orderBy = {};
        let select = {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            level: true,
            league: true,
        };

        switch (type) {
            case "ranking":
                orderBy = { ranking: "asc" };
                select.ranking = true;
                break;
            case "wins":
                orderBy = { wins: "desc" };
                select.wins = true;
                select.losses = true;
                select.winRate = true;
                break;
            case "level":
                orderBy = { level: "desc" };
                select.experience = true;
                break;
            default:
                orderBy = { ranking: "asc" };
                select.ranking = true;
        }

        const users = await prisma.user.findMany({
            where: {
                isActive: true,
                showProfile: true,
            },
            select,
            orderBy,
            take: parseInt(limit),
        });

        res.json({
            success: true,
            data: users.map((user, index) => ({
                ...user,
                position: index + 1,
            })),
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Search users
 */
const searchUsers = async (req, res, next) => {
    try {
        const { q, limit = 10 } = req.query;

        if (!q || q.length < 2) {
            return res.status(400).json({
                success: false,
                error: "Search query must be at least 2 characters long",
            });
        }

        const users = await prisma.user.findMany({
            where: {
                isActive: true,
                showProfile: true,
                OR: [
                    { username: { contains: q, mode: "insensitive" } },
                    { displayName: { contains: q, mode: "insensitive" } },
                ],
            },
            select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                level: true,
                league: true,
            },
            take: parseInt(limit),
        });

        res.json({
            success: true,
            data: users,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user friends
 */
const getFriends = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [
                    { userId, status: "accepted" },
                    { friendId: userId, status: "accepted" },
                ],
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatar: true,
                        level: true,
                        lastLogin: true,
                    },
                },
                friend: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatar: true,
                        level: true,
                        lastLogin: true,
                    },
                },
            },
        });

        const friends = friendships.map((friendship) => {
            const friend =
                friendship.userId === userId
                    ? friendship.friend
                    : friendship.user;
            return {
                ...friend,
                friendshipId: friendship.id,
                addedAt: friendship.addedAt,
            };
        });

        res.json({
            success: true,
            data: friends,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Send friend request
 */
const sendFriendRequest = async (req, res, next) => {
    try {
        const { friendId } = req.body;
        const userId = req.user.id;

        if (userId === friendId) {
            return res.status(400).json({
                success: false,
                error: "Cannot send friend request to yourself",
            });
        }

        // Check if friend exists
        const friend = await prisma.user.findUnique({
            where: { id: friendId, isActive: true },
        });

        if (!friend) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        if (!friend.allowFriendRequests) {
            return res.status(403).json({
                success: false,
                error: "This user is not accepting friend requests",
            });
        }

        // Check if friendship already exists
        const existingFriendship = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { userId, friendId },
                    { userId: friendId, friendId: userId },
                ],
            },
        });

        if (existingFriendship) {
            return res.status(409).json({
                success: false,
                error: "Friend request already exists or you are already friends",
            });
        }

        const friendship = await prisma.friendship.create({
            data: {
                userId,
                friendId,
                status: "pending",
            },
        });

        res.json({
            success: true,
            message: "Friend request sent successfully",
            data: friendship,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Accept friend request
 */
const acceptFriendRequest = async (req, res, next) => {
    try {
        const { friendshipId } = req.params;
        const userId = req.user.id;

        const friendship = await prisma.friendship.findUnique({
            where: { id: friendshipId },
        });

        if (!friendship) {
            return res.status(404).json({
                success: false,
                error: "Friend request not found",
            });
        }

        if (friendship.friendId !== userId) {
            return res.status(403).json({
                success: false,
                error: "You can only accept friend requests sent to you",
            });
        }

        if (friendship.status !== "pending") {
            return res.status(400).json({
                success: false,
                error: "Friend request is not pending",
            });
        }

        const updatedFriendship = await prisma.friendship.update({
            where: { id: friendshipId },
            data: { status: "accepted" },
        });

        res.json({
            success: true,
            message: "Friend request accepted",
            data: updatedFriendship,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    updateProfile,
    getUserCollection,
    getUserDecks,
    getUserStats,
    getLeaderboard,
    searchUsers,
    getFriends,
    sendFriendRequest,
    acceptFriendRequest,
};
