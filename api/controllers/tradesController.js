const prisma = require("../config/database");

/**
 * Create a new trade offer
 */
const createTrade = async (req, res, next) => {
    try {
        const { receiverId, offeredCards, requestedCards, message } = req.body;
        const senderId = req.user.id;

        if (receiverId === senderId) {
            return res.status(400).json({
                success: false,
                error: "Cannot trade with yourself",
            });
        }

        // Check if both users exist
        const [sender, receiver] = await Promise.all([
            prisma.user.findUnique({ where: { id: senderId } }),
            prisma.user.findUnique({ where: { id: receiverId } }),
        ]);

        if (!receiver) {
            return res.status(404).json({
                success: false,
                error: "Receiver not found",
            });
        }

        // Verify sender owns all offered cards
        const senderCards = await prisma.userCard.findMany({
            where: {
                id: { in: offeredCards },
                userId: senderId,
            },
        });

        if (senderCards.length !== offeredCards.length) {
            return res.status(400).json({
                success: false,
                error: "You do not own all offered cards",
            });
        }

        // Verify receiver owns all requested cards (if any)
        if (requestedCards && requestedCards.length > 0) {
            const receiverCards = await prisma.userCard.findMany({
                where: {
                    id: { in: requestedCards },
                    userId: receiverId,
                },
            });

            if (receiverCards.length !== requestedCards.length) {
                return res.status(400).json({
                    success: false,
                    error: "Receiver does not own all requested cards",
                });
            }
        }

        const trade = await prisma.$transaction(async (tx) => {
            const newTrade = await tx.trade.create({
                data: {
                    senderId,
                    receiverId,
                    message,
                    status: "pending",
                },
            });

            // Create trade cards
            const tradeCardsData = [
                ...offeredCards.map((cardId) => ({
                    tradeId: newTrade.id,
                    userCardId: cardId,
                    isOffered: true,
                })),
                ...(requestedCards || []).map((cardId) => ({
                    tradeId: newTrade.id,
                    userCardId: cardId,
                    isOffered: false,
                })),
            ];

            await tx.tradeCard.createMany({
                data: tradeCardsData,
            });

            return tx.trade.findUnique({
                where: { id: newTrade.id },
                include: {
                    sender: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            avatar: true,
                        },
                    },
                    receiver: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            avatar: true,
                        },
                    },
                    tradeCards: {
                        include: {
                            userCard: {
                                include: {
                                    character: {
                                        select: {
                                            id: true,
                                            name: true,
                                            imageUrl: true,
                                            rarity: true,
                                            element: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
        });

        res.status(201).json({
            success: true,
            message: "Trade offer created successfully",
            data: trade,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user's trades
 */
const getUserTrades = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            type = "all", // 'sent', 'received', 'all'
        } = req.query;

        const userId = req.user.id;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let where = {};

        if (type === "sent") {
            where.senderId = userId;
        } else if (type === "received") {
            where.receiverId = userId;
        } else {
            where.OR = [{ senderId: userId }, { receiverId: userId }];
        }

        if (status) {
            where.status = status;
        }

        const [trades, total] = await Promise.all([
            prisma.trade.findMany({
                where,
                include: {
                    sender: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            avatar: true,
                        },
                    },
                    receiver: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            avatar: true,
                        },
                    },
                    tradeCards: {
                        include: {
                            userCard: {
                                include: {
                                    character: {
                                        select: {
                                            id: true,
                                            name: true,
                                            imageUrl: true,
                                            rarity: true,
                                            element: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: offset,
                take: parseInt(limit),
            }),
            prisma.trade.count({ where }),
        ]);

        res.json({
            success: true,
            data: trades,
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
 * Get trade by ID
 */
const getTradeById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const trade = await prisma.trade.findUnique({
            where: { id },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatar: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatar: true,
                    },
                },
                tradeCards: {
                    include: {
                        userCard: {
                            include: {
                                character: {
                                    select: {
                                        id: true,
                                        name: true,
                                        imageUrl: true,
                                        rarity: true,
                                        element: true,
                                        stats: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!trade) {
            return res.status(404).json({
                success: false,
                error: "Trade not found",
            });
        }

        // Check if user is part of this trade
        if (trade.senderId !== userId && trade.receiverId !== userId) {
            return res.status(403).json({
                success: false,
                error: "You can only view your own trades",
            });
        }

        res.json({
            success: true,
            data: trade,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Accept trade
 */
const acceptTrade = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const trade = await prisma.trade.findUnique({
            where: { id },
            include: {
                tradeCards: {
                    include: {
                        userCard: true,
                    },
                },
            },
        });

        if (!trade) {
            return res.status(404).json({
                success: false,
                error: "Trade not found",
            });
        }

        // Only receiver can accept
        if (trade.receiverId !== userId) {
            return res.status(403).json({
                success: false,
                error: "Only the receiver can accept this trade",
            });
        }

        if (trade.status !== "pending") {
            return res.status(400).json({
                success: false,
                error: "Trade is no longer pending",
            });
        }

        // Execute trade
        const updatedTrade = await prisma.$transaction(async (tx) => {
            // Get offered and requested cards
            const offeredCards = trade.tradeCards.filter((tc) => tc.isOffered);
            const requestedCards = trade.tradeCards.filter(
                (tc) => !tc.isOffered
            );

            // Transfer offered cards to receiver
            for (const tradeCard of offeredCards) {
                await tx.userCard.update({
                    where: { id: tradeCard.userCardId },
                    data: { userId: trade.receiverId },
                });
            }

            // Transfer requested cards to sender
            for (const tradeCard of requestedCards) {
                await tx.userCard.update({
                    where: { id: tradeCard.userCardId },
                    data: { userId: trade.senderId },
                });
            }

            // Update trade status
            const updatedTrade = await tx.trade.update({
                where: { id },
                data: {
                    status: "completed",
                    completedAt: new Date(),
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                        },
                    },
                    receiver: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                        },
                    },
                    tradeCards: {
                        include: {
                            userCard: {
                                include: {
                                    character: {
                                        select: {
                                            id: true,
                                            name: true,
                                            imageUrl: true,
                                            rarity: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            // Update users' trade statistics
            await tx.user.update({
                where: { id: trade.senderId },
                data: { tradesCompleted: { increment: 1 } },
            });

            await tx.user.update({
                where: { id: trade.receiverId },
                data: { tradesCompleted: { increment: 1 } },
            });

            return updatedTrade;
        });

        res.json({
            success: true,
            message: "Trade completed successfully",
            data: updatedTrade,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Decline trade
 */
const declineTrade = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const trade = await prisma.trade.findUnique({
            where: { id },
        });

        if (!trade) {
            return res.status(404).json({
                success: false,
                error: "Trade not found",
            });
        }

        // Only receiver can decline
        if (trade.receiverId !== userId) {
            return res.status(403).json({
                success: false,
                error: "Only the receiver can decline this trade",
            });
        }

        if (trade.status !== "pending") {
            return res.status(400).json({
                success: false,
                error: "Trade is no longer pending",
            });
        }

        const updatedTrade = await prisma.trade.update({
            where: { id },
            data: {
                status: "declined",
                completedAt: new Date(),
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                    },
                },
            },
        });

        res.json({
            success: true,
            message: "Trade declined",
            data: updatedTrade,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Cancel trade (by sender)
 */
const cancelTrade = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const trade = await prisma.trade.findUnique({
            where: { id },
        });

        if (!trade) {
            return res.status(404).json({
                success: false,
                error: "Trade not found",
            });
        }

        // Only sender can cancel
        if (trade.senderId !== userId) {
            return res.status(403).json({
                success: false,
                error: "Only the sender can cancel this trade",
            });
        }

        if (trade.status !== "pending") {
            return res.status(400).json({
                success: false,
                error: "Trade is no longer pending",
            });
        }

        const updatedTrade = await prisma.trade.update({
            where: { id },
            data: {
                status: "cancelled",
                completedAt: new Date(),
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                    },
                },
            },
        });

        res.json({
            success: true,
            message: "Trade cancelled",
            data: updatedTrade,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTrade,
    getUserTrades,
    getTradeById,
    acceptTrade,
    declineTrade,
    cancelTrade,
};
