const Joi = require("joi");

// Auth validation schemas
const registerSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(20).required().messages({
        "string.alphanum": "Username must contain only alphanumeric characters",
        "string.min": "Username must be at least 3 characters long",
        "string.max": "Username cannot exceed 20 characters",
        "any.required": "Username is required",
    }),
    email: Joi.string().email().required().messages({
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required",
    }),
    password: Joi.string().min(6).max(128).required().messages({
        "string.min": "Password must be at least 6 characters long",
        "string.max": "Password cannot exceed 128 characters",
        "any.required": "Password is required",
    }),
    displayName: Joi.string().min(1).max(30).optional(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required().messages({
        "any.required": "Refresh token is required",
    }),
});

// User validation schemas
const updateProfileSchema = Joi.object({
    displayName: Joi.string().min(1).max(30).optional(),
    bio: Joi.string().max(200).optional(),
    showProfile: Joi.boolean().optional(),
    showCollection: Joi.boolean().optional(),
    allowFriendRequests: Joi.boolean().optional(),
    notificationsEnabled: Joi.boolean().optional(),
});

// Character validation schemas
const createCharacterSchema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    title: Joi.string().max(100).optional(),
    description: Joi.string().required(),
    rarity: Joi.string()
        .valid("Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic")
        .required(),
    element: Joi.string()
        .valid(
            "Fire",
            "Water",
            "Earth",
            "Air",
            "Lightning",
            "Dark",
            "Light",
            "Neutral"
        )
        .required(),
    characterClass: Joi.string()
        .valid(
            "Warrior",
            "Mage",
            "Archer",
            "Assassin",
            "Healer",
            "Tank",
            "Support"
        )
        .required(),
    health: Joi.number().integer().min(1).max(1000).required(),
    attack: Joi.number().integer().min(1).max(150).required(),
    defense: Joi.number().integer().min(0).max(150).required(),
    speed: Joi.number().integer().min(1).max(10).required(),
    manaCost: Joi.number().integer().min(0).max(10).required(),
    cardImage: Joi.string().uri().required(),
    fullArtwork: Joi.string().uri().optional(),
    lore: Joi.string().optional(),
    cardNumber: Joi.string().required(),
    setId: Joi.string().required(),
    isEvolution: Joi.boolean().optional(),
    evolutionFromId: Joi.string().optional(),
    evolutionLevel: Joi.number().integer().min(1).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    userId: Joi.string().optional(), // Optional: if provided, add card to this user's collection
    addToMyCollection: Joi.boolean().optional(), // Optional: if true, add card to authenticated user's collection
    obtainedFrom: Joi.string()
        .valid(
            "Booster",
            "Trade",
            "Reward",
            "Purchase",
            "Event",
            "Starter",
            "Admin"
        )
        .optional(), // How the card was obtained
    abilities: Joi.array()
        .items(
            Joi.object({
                name: Joi.string().required(),
                description: Joi.string().required(),
                damage: Joi.number().integer().min(0).default(0),
                type: Joi.string()
                    .valid(
                        "Attack",
                        "Defense",
                        "Heal",
                        "Buff",
                        "Debuff",
                        "Special"
                    )
                    .required(),
            })
        )
        .optional(),
    evolutionMaterials: Joi.array()
        .items(
            Joi.object({
                item: Joi.string().required(),
                quantity: Joi.number().integer().min(1).required(),
            })
        )
        .optional(),
});

// Deck validation schemas
const createDeckSchema = Joi.object({
    name: Joi.string().min(1).max(50).required(),
    description: Joi.string().max(200).optional(),
    format: Joi.string()
        .valid("Standard", "Classic", "Limited", "Custom")
        .default("Standard"),
    mainElement: Joi.string()
        .valid(
            "Fire",
            "Water",
            "Earth",
            "Air",
            "Lightning",
            "Dark",
            "Light",
            "Neutral",
            "Mixed"
        )
        .required(),
    strategy: Joi.string().required(),
    isPublic: Joi.boolean().default(false),
    tags: Joi.array().items(Joi.string()).optional(),
    cards: Joi.array()
        .items(
            Joi.object({
                characterId: Joi.string().required(),
                quantity: Joi.number().integer().min(1).max(3).required(),
            })
        )
        .min(30)
        .max(60)
        .required(),
});

// Game validation schemas
const createGameSchema = Joi.object({
    gameMode: Joi.string()
        .valid("ranked", "casual", "friendly", "tournament")
        .required(),
    format: Joi.string()
        .valid("Standard", "Classic", "Limited", "Custom")
        .required(),
    player2Id: Joi.string().required(),
    player1DeckId: Joi.string().required(),
    player2DeckId: Joi.string().required(),
    tournamentId: Joi.string().optional(),
});

// Tournament validation schemas
const createTournamentSchema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().required(),
    format: Joi.string()
        .valid("Standard", "Classic", "Limited", "Custom")
        .required(),
    tournamentType: Joi.string()
        .valid(
            "single_elimination",
            "double_elimination",
            "round_robin",
            "swiss"
        )
        .required(),
    maxParticipants: Joi.number().integer().min(4).max(256).required(),
    entryFeeCoins: Joi.number().integer().min(0).default(0),
    entryFeeGems: Joi.number().integer().min(0).default(0),
    registrationStart: Joi.date().required(),
    registrationEnd: Joi.date()
        .greater(Joi.ref("registrationStart"))
        .required(),
    startTime: Joi.date().greater(Joi.ref("registrationEnd")).required(),
    isPublic: Joi.boolean().default(true),
    allowSpectators: Joi.boolean().default(true),
    banner: Joi.string().uri().optional(),
    streamUrl: Joi.string().uri().optional(),
    prizes: Joi.array()
        .items(
            Joi.object({
                position: Joi.number().integer().min(1).required(),
                rewardCoins: Joi.number().integer().min(0).default(0),
                rewardGems: Joi.number().integer().min(0).default(0),
                rewardPacks: Joi.number().integer().min(0).default(0),
                title: Joi.string().optional(),
            })
        )
        .optional(),
});

// Trade validation schemas
const createTradeSchema = Joi.object({
    recipientId: Joi.string().required(),
    message: Joi.string().max(200).optional(),
    tradeType: Joi.string()
        .valid("direct", "public", "auction")
        .default("direct"),
    isPublic: Joi.boolean().default(false),
    initiatorOffer: Joi.object({
        cards: Joi.array()
            .items(
                Joi.object({
                    characterId: Joi.string().required(),
                    quantity: Joi.number().integer().min(1).required(),
                })
            )
            .optional(),
        coins: Joi.number().integer().min(0).default(0),
        gems: Joi.number().integer().min(0).default(0),
    }).required(),
    recipientOffer: Joi.object({
        cards: Joi.array()
            .items(
                Joi.object({
                    characterId: Joi.string().required(),
                    quantity: Joi.number().integer().min(1).required(),
                })
            )
            .optional(),
        coins: Joi.number().integer().min(0).default(0),
        gems: Joi.number().integer().min(0).default(0),
    }).required(),
});

/**
 * Validation middleware factory
 */
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path.join("."),
                message: detail.message,
            }));

            return res.status(400).json({
                success: false,
                error: "Validation failed",
                errors,
            });
        }

        req.body = value;
        next();
    };
};

module.exports = {
    validate,
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    updateProfileSchema,
    createCharacterSchema,
    createDeckSchema,
    createGameSchema,
    createTournamentSchema,
    createTradeSchema,
};
