const prisma = require("../config/database");

/**
 * Get all characters with filters and pagination
 */
const getCharacters = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            rarity,
            element,
            characterClass,
            setId,
            sortBy = "name",
            sortOrder = "asc",
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause
        const where = {
            isActive: true,
        };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { lore: { contains: search, mode: "insensitive" } },
            ];
        }

        if (rarity) where.rarity = rarity;
        if (element) where.element = element;
        if (characterClass) where.characterClass = characterClass;
        if (setId) where.setId = setId;

        // Build orderBy clause
        const orderBy = {};
        orderBy[sortBy] = sortOrder;

        // Get characters with pagination
        const [characters, total] = await Promise.all([
            prisma.character.findMany({
                where,
                include: {
                    set: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    abilities: true,
                    evolutionMaterials: true,
                    evolutionFrom: {
                        select: {
                            id: true,
                            name: true,
                            cardImage: true,
                        },
                    },
                    evolutions: {
                        select: {
                            id: true,
                            name: true,
                            cardImage: true,
                        },
                    },
                },
                orderBy,
                skip: offset,
                take: parseInt(limit),
            }),
            prisma.character.count({ where }),
        ]);

        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
            success: true,
            data: characters,
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
 * Get character by ID
 */
const getCharacterById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const character = await prisma.character.findUnique({
            where: {
                id,
                isActive: true,
            },
            include: {
                set: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        theme: true,
                    },
                },
                abilities: true,
                evolutionMaterials: true,
                evolutionFrom: {
                    select: {
                        id: true,
                        name: true,
                        cardImage: true,
                        rarity: true,
                    },
                },
                evolutions: {
                    select: {
                        id: true,
                        name: true,
                        cardImage: true,
                        rarity: true,
                    },
                },
                _count: {
                    select: {
                        userCards: true,
                        deckCards: true,
                    },
                },
            },
        });

        if (!character) {
            return res.status(404).json({
                success: false,
                error: "Character not found",
            });
        }

        res.json({
            success: true,
            data: character,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new character (Admin only)
 */
const createCharacter = async (req, res, next) => {
    try {
        const {
            abilities = [],
            evolutionMaterials = [],
            ...characterData
        } = req.body;

        const character = await prisma.character.create({
            data: {
                ...characterData,
                abilities: {
                    create: abilities,
                },
                evolutionMaterials: {
                    create: evolutionMaterials,
                },
            },
            include: {
                set: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
                abilities: true,
                evolutionMaterials: true,
            },
        });

        res.status(201).json({
            success: true,
            message: "Character created successfully",
            data: character,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update character (Admin only)
 */
const updateCharacter = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            abilities = [],
            evolutionMaterials = [],
            ...characterData
        } = req.body;

        // Check if character exists
        const existingCharacter = await prisma.character.findUnique({
            where: { id },
        });

        if (!existingCharacter) {
            return res.status(404).json({
                success: false,
                error: "Character not found",
            });
        }

        // Update character with transaction
        const character = await prisma.$transaction(async (tx) => {
            // Delete existing abilities and materials
            await tx.ability.deleteMany({
                where: { characterId: id },
            });

            await tx.evolutionMaterial.deleteMany({
                where: { characterId: id },
            });

            // Update character with new data
            return await tx.character.update({
                where: { id },
                data: {
                    ...characterData,
                    abilities: {
                        create: abilities,
                    },
                    evolutionMaterials: {
                        create: evolutionMaterials,
                    },
                },
                include: {
                    set: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    abilities: true,
                    evolutionMaterials: true,
                },
            });
        });

        res.json({
            success: true,
            message: "Character updated successfully",
            data: character,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete character (Admin only)
 */
const deleteCharacter = async (req, res, next) => {
    try {
        const { id } = req.params;

        const character = await prisma.character.findUnique({
            where: { id },
        });

        if (!character) {
            return res.status(404).json({
                success: false,
                error: "Character not found",
            });
        }

        // Soft delete (set isActive to false)
        await prisma.character.update({
            where: { id },
            data: { isActive: false },
        });

        res.json({
            success: true,
            message: "Character deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get character statistics
 */
const getCharacterStats = async (req, res, next) => {
    try {
        const [
            totalCharacters,
            rarityStats,
            elementStats,
            classStats,
            setStats,
        ] = await Promise.all([
            // Total characters
            prisma.character.count({
                where: { isActive: true },
            }),

            // Rarity distribution
            prisma.character.groupBy({
                by: ["rarity"],
                where: { isActive: true },
                _count: true,
            }),

            // Element distribution
            prisma.character.groupBy({
                by: ["element"],
                where: { isActive: true },
                _count: true,
            }),

            // Class distribution
            prisma.character.groupBy({
                by: ["characterClass"],
                where: { isActive: true },
                _count: true,
            }),

            // Characters per set
            prisma.character.groupBy({
                by: ["setId"],
                where: { isActive: true },
                _count: true,
                take: 10,
            }),
        ]);

        res.json({
            success: true,
            data: {
                totalCharacters,
                distribution: {
                    rarity: rarityStats.map((stat) => ({
                        rarity: stat.rarity,
                        count: stat._count,
                    })),
                    element: elementStats.map((stat) => ({
                        element: stat.element,
                        count: stat._count,
                    })),
                    characterClass: classStats.map((stat) => ({
                        class: stat.characterClass,
                        count: stat._count,
                    })),
                    sets: setStats.map((stat) => ({
                        setId: stat.setId,
                        count: stat._count,
                    })),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCharacters,
    getCharacterById,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    getCharacterStats,
};
