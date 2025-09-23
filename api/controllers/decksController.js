const prisma = require("../config/database");
const { v4: uuidv4 } = require("uuid");

/**
 * Create a new deck
 */
const createDeck = async (req, res, next) => {
    try {
        const { cards, ...deckData } = req.body;
        const userId = req.user.id;

        // Validate deck
        const totalCards = cards.reduce((sum, card) => sum + card.quantity, 0);

        if (totalCards < 30 || totalCards > 60) {
            return res.status(400).json({
                success: false,
                error: "Deck must contain between 30 and 60 cards",
            });
        }

        // Check if user owns all the cards
        const characterIds = cards.map((card) => card.characterId);
        const userCards = await prisma.userCard.findMany({
            where: {
                userId,
                characterId: { in: characterIds },
            },
        });

        for (const card of cards) {
            const userCard = userCards.find(
                (uc) => uc.characterId === card.characterId
            );
            if (!userCard || userCard.quantity < card.quantity) {
                return res.status(400).json({
                    success: false,
                    error: `Insufficient quantity of card: ${card.characterId}`,
                });
            }
        }

        // Create deck with transaction
        const deck = await prisma.$transaction(async (tx) => {
            const newDeck = await tx.deck.create({
                data: {
                    ...deckData,
                    ownerId: userId,
                },
            });

            // Add cards to deck
            const deckCards = cards.map((card) => ({
                deckId: newDeck.id,
                characterId: card.characterId,
                quantity: card.quantity,
            }));

            await tx.deckCard.createMany({
                data: deckCards,
            });

            return tx.deck.findUnique({
                where: { id: newDeck.id },
                include: {
                    cards: {
                        include: {
                            character: {
                                select: {
                                    id: true,
                                    name: true,
                                    rarity: true,
                                    element: true,
                                    cardImage: true,
                                    manaCost: true,
                                },
                            },
                        },
                    },
                    owner: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                        },
                    },
                },
            });
        });

        res.status(201).json({
            success: true,
            message: "Deck created successfully",
            data: deck,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get deck by ID
 */
const getDeckById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const deck = await prisma.deck.findUnique({
            where: { id },
            include: {
                cards: {
                    include: {
                        character: {
                            include: {
                                abilities: true,
                                set: {
                                    select: { name: true, code: true },
                                },
                            },
                        },
                    },
                },
                owner: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatar: true,
                    },
                },
            },
        });

        if (!deck) {
            return res.status(404).json({
                success: false,
                error: "Deck not found",
            });
        }

        // Check if deck is public or owned by current user
        if (!deck.isPublic && req.user?.id !== deck.ownerId) {
            return res.status(403).json({
                success: false,
                error: "This deck is private",
            });
        }

        res.json({
            success: true,
            data: deck,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update deck
 */
const updateDeck = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { cards, ...deckData } = req.body;
        const userId = req.user.id;

        // Check if deck exists and is owned by user
        const existingDeck = await prisma.deck.findUnique({
            where: { id },
        });

        if (!existingDeck) {
            return res.status(404).json({
                success: false,
                error: "Deck not found",
            });
        }

        if (existingDeck.ownerId !== userId) {
            return res.status(403).json({
                success: false,
                error: "You can only update your own decks",
            });
        }

        let deck;

        if (cards) {
            // Validate new deck composition
            const totalCards = cards.reduce(
                (sum, card) => sum + card.quantity,
                0
            );

            if (totalCards < 30 || totalCards > 60) {
                return res.status(400).json({
                    success: false,
                    error: "Deck must contain between 30 and 60 cards",
                });
            }

            // Check if user owns all the cards
            const characterIds = cards.map((card) => card.characterId);
            const userCards = await prisma.userCard.findMany({
                where: {
                    userId,
                    characterId: { in: characterIds },
                },
            });

            for (const card of cards) {
                const userCard = userCards.find(
                    (uc) => uc.characterId === card.characterId
                );
                if (!userCard || userCard.quantity < card.quantity) {
                    return res.status(400).json({
                        success: false,
                        error: `Insufficient quantity of card: ${card.characterId}`,
                    });
                }
            }

            // Update deck with cards using transaction
            deck = await prisma.$transaction(async (tx) => {
                // Delete existing cards
                await tx.deckCard.deleteMany({
                    where: { deckId: id },
                });

                // Update deck data
                const updatedDeck = await tx.deck.update({
                    where: { id },
                    data: {
                        ...deckData,
                        version: { increment: 1 },
                    },
                });

                // Add new cards
                const deckCards = cards.map((card) => ({
                    deckId: id,
                    characterId: card.characterId,
                    quantity: card.quantity,
                }));

                await tx.deckCard.createMany({
                    data: deckCards,
                });

                return tx.deck.findUnique({
                    where: { id },
                    include: {
                        cards: {
                            include: {
                                character: {
                                    select: {
                                        id: true,
                                        name: true,
                                        rarity: true,
                                        element: true,
                                        cardImage: true,
                                        manaCost: true,
                                    },
                                },
                            },
                        },
                    },
                });
            });
        } else {
            // Update only deck metadata
            deck = await prisma.deck.update({
                where: { id },
                data: deckData,
                include: {
                    cards: {
                        include: {
                            character: {
                                select: {
                                    id: true,
                                    name: true,
                                    rarity: true,
                                    element: true,
                                    cardImage: true,
                                    manaCost: true,
                                },
                            },
                        },
                    },
                },
            });
        }

        res.json({
            success: true,
            message: "Deck updated successfully",
            data: deck,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete deck
 */
const deleteDeck = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if deck exists and is owned by user
        const deck = await prisma.deck.findUnique({
            where: { id },
        });

        if (!deck) {
            return res.status(404).json({
                success: false,
                error: "Deck not found",
            });
        }

        if (deck.ownerId !== userId && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                error: "You can only delete your own decks",
            });
        }

        // Delete deck (cards will be deleted by cascade)
        await prisma.deck.delete({
            where: { id },
        });

        res.json({
            success: true,
            message: "Deck deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get public decks
 */
const getPublicDecks = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            format,
            mainElement,
            strategy,
            sortBy = "likes",
            sortOrder = "desc",
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause
        const where = {
            isPublic: true,
            isActive: true,
        };

        if (format) where.format = format;
        if (mainElement) where.mainElement = mainElement;
        if (strategy) where.strategy = strategy;

        // Build orderBy clause
        const orderBy = {};
        orderBy[sortBy] = sortOrder;

        const [decks, total] = await Promise.all([
            prisma.deck.findMany({
                where,
                include: {
                    owner: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            avatar: true,
                        },
                    },
                    _count: {
                        select: {
                            cards: true,
                        },
                    },
                },
                orderBy,
                skip: offset,
                take: parseInt(limit),
            }),
            prisma.deck.count({ where }),
        ]);

        res.json({
            success: true,
            data: decks,
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

module.exports = {
    createDeck,
    getDeckById,
    updateDeck,
    deleteDeck,
    getPublicDecks,
};
