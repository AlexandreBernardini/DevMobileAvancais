const prisma = require("../config/database");

/**
 * Open a booster pack
 */
const openBooster = async (req, res, next) => {
    try {
        const { boosterPackId } = req.params;
        const userId = req.user.id;

        // Check if user owns the booster pack
        const boosterPack = await prisma.boosterPack.findUnique({
            where: { id: boosterPackId },
            include: {
                set: {
                    include: {
                        characters: {
                            select: {
                                id: true,
                                name: true,
                                rarity: true,
                                element: true,
                                imageUrl: true,
                                stats: true,
                            },
                        },
                    },
                },
            },
        });

        if (!boosterPack) {
            return res.status(404).json({
                success: false,
                error: "Booster pack not found",
            });
        }

        if (boosterPack.ownerId !== userId) {
            return res.status(403).json({
                success: false,
                error: "You do not own this booster pack",
            });
        }

        if (boosterPack.isOpened) {
            return res.status(400).json({
                success: false,
                error: "Booster pack has already been opened",
            });
        }

        // Generate cards based on rarity distribution
        const cardCount = 5; // Standard booster pack size
        const rarityDistribution = {
            common: 0.6,
            uncommon: 0.25,
            rare: 0.12,
            legendary: 0.03,
        };

        const result = await prisma.$transaction(async (tx) => {
            const generatedCards = [];
            const setCharacters = boosterPack.set.characters;

            // Group characters by rarity
            const charactersByRarity = {
                common: setCharacters.filter((c) => c.rarity === "common"),
                uncommon: setCharacters.filter((c) => c.rarity === "uncommon"),
                rare: setCharacters.filter((c) => c.rarity === "rare"),
                legendary: setCharacters.filter(
                    (c) => c.rarity === "legendary"
                ),
            };

            // Generate cards
            for (let i = 0; i < cardCount; i++) {
                let selectedRarity;
                const random = Math.random();

                if (random < rarityDistribution.common) {
                    selectedRarity = "common";
                } else if (
                    random <
                    rarityDistribution.common + rarityDistribution.uncommon
                ) {
                    selectedRarity = "uncommon";
                } else if (
                    random <
                    rarityDistribution.common +
                        rarityDistribution.uncommon +
                        rarityDistribution.rare
                ) {
                    selectedRarity = "rare";
                } else {
                    selectedRarity = "legendary";
                }

                // If no characters of selected rarity, fall back to common
                if (
                    !charactersByRarity[selectedRarity] ||
                    charactersByRarity[selectedRarity].length === 0
                ) {
                    selectedRarity = "common";
                }

                // Select random character of the chosen rarity
                const availableCharacters = charactersByRarity[selectedRarity];
                const randomCharacter =
                    availableCharacters[
                        Math.floor(Math.random() * availableCharacters.length)
                    ];

                // Generate card condition (mostly mint/near_mint for new cards)
                const conditionRandom = Math.random();
                let condition;
                if (conditionRandom < 0.7) {
                    condition = "mint";
                } else if (conditionRandom < 0.95) {
                    condition = "near_mint";
                } else {
                    condition = "excellent";
                }

                // Create user card
                const userCard = await tx.userCard.create({
                    data: {
                        userId,
                        characterId: randomCharacter.id,
                        condition,
                        isHolo:
                            selectedRarity === "rare" ||
                            selectedRarity === "legendary"
                                ? Math.random() < 0.3
                                : false,
                        obtainedFrom: "booster",
                    },
                    include: {
                        character: {
                            select: {
                                id: true,
                                name: true,
                                rarity: true,
                                element: true,
                                imageUrl: true,
                                stats: true,
                            },
                        },
                    },
                });

                generatedCards.push(userCard);
            }

            // Mark booster pack as opened
            await tx.boosterPack.update({
                where: { id: boosterPackId },
                data: {
                    isOpened: true,
                    openedAt: new Date(),
                },
            });

            // Update user stats
            await tx.user.update({
                where: { id: userId },
                data: {
                    boostersOpened: { increment: 1 },
                    cardsCollected: { increment: cardCount },
                },
            });

            return {
                boosterPack,
                cards: generatedCards,
            };
        });

        res.json({
            success: true,
            message: "Booster pack opened successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Purchase booster packs
 */
const purchaseBoosters = async (req, res, next) => {
    try {
        const { setId, quantity = 1, currency = "coins" } = req.body;
        const userId = req.user.id;

        if (quantity <= 0 || quantity > 10) {
            return res.status(400).json({
                success: false,
                error: "Quantity must be between 1 and 10",
            });
        }

        // Get set and pricing info
        const set = await prisma.set.findUnique({
            where: { id: setId },
        });

        if (!set) {
            return res.status(404).json({
                success: false,
                error: "Set not found",
            });
        }

        if (!set.isActive) {
            return res.status(400).json({
                success: false,
                error: "Set is not available for purchase",
            });
        }

        // Calculate cost
        const costPerBooster = currency === "gems" ? 100 : 500; // 100 gems or 500 coins per booster
        const totalCost = costPerBooster * quantity;

        // Check user's currency
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { coins: true, gems: true },
        });

        if (currency === "gems" && user.gems < totalCost) {
            return res.status(400).json({
                success: false,
                error: "Insufficient gems",
            });
        }

        if (currency === "coins" && user.coins < totalCost) {
            return res.status(400).json({
                success: false,
                error: "Insufficient coins",
            });
        }

        // Purchase boosters
        const result = await prisma.$transaction(async (tx) => {
            // Deduct currency
            const updateData = {};
            if (currency === "gems") {
                updateData.gems = { decrement: totalCost };
            } else {
                updateData.coins = { decrement: totalCost };
            }

            await tx.user.update({
                where: { id: userId },
                data: updateData,
            });

            // Create booster packs
            const boosterPacks = [];
            for (let i = 0; i < quantity; i++) {
                const booster = await tx.boosterPack.create({
                    data: {
                        ownerId: userId,
                        setId,
                    },
                    include: {
                        set: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                imageUrl: true,
                            },
                        },
                    },
                });
                boosterPacks.push(booster);
            }

            // Update user stats
            await tx.user.update({
                where: { id: userId },
                data: {
                    boostersPurchased: { increment: quantity },
                },
            });

            return boosterPacks;
        });

        res.status(201).json({
            success: true,
            message: `Successfully purchased ${quantity} booster pack(s)`,
            data: {
                boosterPacks: result,
                cost: totalCost,
                currency,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user's booster packs
 */
const getUserBoosters = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, setId, isOpened } = req.query;

        const userId = req.user.id;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const where = { ownerId: userId };

        if (setId) where.setId = setId;
        if (isOpened !== undefined) where.isOpened = isOpened === "true";

        const [boosterPacks, total] = await Promise.all([
            prisma.boosterPack.findMany({
                where,
                include: {
                    set: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            imageUrl: true,
                            releaseDate: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: offset,
                take: parseInt(limit),
            }),
            prisma.boosterPack.count({ where }),
        ]);

        res.json({
            success: true,
            data: boosterPacks,
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
 * Get available sets for purchase
 */
const getAvailableSets = async (req, res, next) => {
    try {
        const sets = await prisma.set.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                description: true,
                imageUrl: true,
                releaseDate: true,
                _count: {
                    select: {
                        characters: true,
                    },
                },
            },
            orderBy: { releaseDate: "desc" },
        });

        res.json({
            success: true,
            data: sets,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get booster pack contents (for opened packs)
 */
const getBoosterContents = async (req, res, next) => {
    try {
        const { boosterPackId } = req.params;
        const userId = req.user.id;

        const boosterPack = await prisma.boosterPack.findUnique({
            where: { id: boosterPackId },
            include: {
                set: {
                    select: {
                        id: true,
                        name: true,
                        imageUrl: true,
                    },
                },
            },
        });

        if (!boosterPack) {
            return res.status(404).json({
                success: false,
                error: "Booster pack not found",
            });
        }

        if (boosterPack.ownerId !== userId) {
            return res.status(403).json({
                success: false,
                error: "You do not own this booster pack",
            });
        }

        if (!boosterPack.isOpened) {
            return res.status(400).json({
                success: false,
                error: "Booster pack has not been opened yet",
            });
        }

        // Get cards obtained from this booster (based on creation time)
        const cards = await prisma.userCard.findMany({
            where: {
                userId,
                obtainedFrom: "booster",
                createdAt: {
                    gte: boosterPack.openedAt,
                    lte: new Date(boosterPack.openedAt.getTime() + 60000), // Within 1 minute of opening
                },
            },
            include: {
                character: {
                    select: {
                        id: true,
                        name: true,
                        rarity: true,
                        element: true,
                        imageUrl: true,
                        stats: true,
                    },
                },
            },
            take: 5, // Standard booster size
        });

        res.json({
            success: true,
            data: {
                boosterPack,
                cards,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    openBooster,
    purchaseBoosters,
    getUserBoosters,
    getAvailableSets,
    getBoosterContents,
};
