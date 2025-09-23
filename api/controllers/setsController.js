const prisma = require("../config/database");

/**
 * Get all sets
 */
const getSets = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, active } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause
        const where = {};
        if (active !== undefined) {
            where.isActive = active === "true";
        }

        const [sets, total] = await Promise.all([
            prisma.set.findMany({
                where,
                include: {
                    _count: {
                        select: {
                            characters: true,
                            boosterPacks: true,
                        },
                    },
                },
                orderBy: { releaseDate: "desc" },
                skip: offset,
                take: parseInt(limit),
            }),
            prisma.set.count({ where }),
        ]);

        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
            success: true,
            data: sets,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: totalPages,
                hasNext: parseInt(page) < totalPages,
                hasPrev: parseInt(page) > 1,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get set by ID
 */
const getSetById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const set = await prisma.set.findUnique({
            where: { id },
            include: {
                characters: {
                    select: {
                        id: true,
                        name: true,
                        rarity: true,
                        element: true,
                        characterClass: true,
                        cardImage: true,
                        cardNumber: true,
                    },
                    orderBy: { cardNumber: "asc" },
                },
                boosterPacks: {
                    select: {
                        id: true,
                        packId: true,
                        packType: true,
                        priceCoins: true,
                        priceGems: true,
                        cardsCount: true,
                        packImage: true,
                        isActive: true,
                    },
                },
                _count: {
                    select: {
                        characters: true,
                        boosterPacks: true,
                        userCompletedSets: true,
                    },
                },
            },
        });

        if (!set) {
            return res.status(404).json({
                success: false,
                error: "Set not found",
            });
        }

        res.json({
            success: true,
            data: set,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get characters in a set
 */
const getSetCharacters = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            page = 1,
            limit = 20,
            rarity,
            element,
            characterClass,
            sortBy = "cardNumber",
            sortOrder = "asc",
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Check if set exists
        const set = await prisma.set.findUnique({
            where: { id },
            select: { id: true, name: true },
        });

        if (!set) {
            return res.status(404).json({
                success: false,
                error: "Set not found",
            });
        }

        // Build where clause
        const where = {
            setId: id,
            isActive: true,
        };

        if (rarity) where.rarity = rarity;
        if (element) where.element = element;
        if (characterClass) where.characterClass = characterClass;

        // Build orderBy clause
        const orderBy = {};
        orderBy[sortBy] = sortOrder;

        const [characters, total] = await Promise.all([
            prisma.character.findMany({
                where,
                include: {
                    abilities: true,
                    _count: {
                        select: {
                            userCards: true,
                        },
                    },
                },
                orderBy,
                skip: offset,
                take: parseInt(limit),
            }),
            prisma.character.count({ where }),
        ]);

        res.json({
            success: true,
            data: {
                set,
                characters,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new set (Admin only)
 */
const createSet = async (req, res, next) => {
    try {
        const setData = req.body;

        const set = await prisma.set.create({
            data: setData,
            include: {
                _count: {
                    select: {
                        characters: true,
                        boosterPacks: true,
                    },
                },
            },
        });

        res.status(201).json({
            success: true,
            message: "Set created successfully",
            data: set,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update set (Admin only)
 */
const updateSet = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check if set exists
        const existingSet = await prisma.set.findUnique({
            where: { id },
        });

        if (!existingSet) {
            return res.status(404).json({
                success: false,
                error: "Set not found",
            });
        }

        const set = await prisma.set.update({
            where: { id },
            data: updateData,
            include: {
                _count: {
                    select: {
                        characters: true,
                        boosterPacks: true,
                    },
                },
            },
        });

        res.json({
            success: true,
            message: "Set updated successfully",
            data: set,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSets,
    getSetById,
    getSetCharacters,
    createSet,
    updateSet,
};
