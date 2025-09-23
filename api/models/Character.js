const mongoose = require("mongoose");

const CharacterSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        title: {
            type: String,
            required: false,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        rarity: {
            type: String,
            required: true,
            enum: ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic"],
        },
        element: {
            type: String,
            required: true,
            enum: [
                "Fire",
                "Water",
                "Earth",
                "Air",
                "Lightning",
                "Dark",
                "Light",
                "Neutral",
            ],
        },
        characterClass: {
            type: String,
            required: true,
            enum: [
                "Warrior",
                "Mage",
                "Archer",
                "Assassin",
                "Healer",
                "Tank",
                "Support",
            ],
        },
        stats: {
            health: {
                type: Number,
                required: true,
                min: 1,
                max: 1000,
            },
            attack: {
                type: Number,
                required: true,
                min: 1,
                max: 150,
            },
            defense: {
                type: Number,
                required: true,
                min: 0,
                max: 150,
            },
            speed: {
                type: Number,
                required: true,
                min: 1,
                max: 10,
            },
            manaCost: {
                type: Number,
                required: true,
                min: 0,
                max: 10,
            },
        },
        abilities: [
            {
                name: {
                    type: String,
                    required: true,
                },
                description: {
                    type: String,
                    required: true,
                },
                damage: {
                    type: Number,
                    default: 0,
                },
                type: {
                    type: String,
                    enum: [
                        "Attack",
                        "Defense",
                        "Heal",
                        "Buff",
                        "Debuff",
                        "Special",
                    ],
                    required: true,
                },
            },
        ],
        artwork: {
            cardImage: {
                type: String,
                required: true,
            },
            fullArtwork: {
                type: String,
                required: false,
            },
        },
        lore: {
            type: String,
            required: false,
        },
        set: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Set",
            required: true,
        },
        cardNumber: {
            type: String,
            required: true,
        },
        isEvolution: {
            type: Boolean,
            default: false,
        },
        evolutionFrom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Character",
            required: false,
        },
        evolutionRequirements: {
            level: {
                type: Number,
                default: 1,
            },
            materials: [
                {
                    item: {
                        type: String,
                        required: true,
                    },
                    quantity: {
                        type: Number,
                        required: true,
                        min: 1,
                    },
                },
            ],
        },
        tags: [
            {
                type: String,
                trim: true,
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
        releaseDate: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Index pour améliorer les performances de recherche
CharacterSchema.index({ name: 1 });
CharacterSchema.index({ rarity: 1 });
CharacterSchema.index({ element: 1 });
CharacterSchema.index({ characterClass: 1 });
CharacterSchema.index({ set: 1 });
CharacterSchema.index({ tags: 1 });

module.exports = mongoose.model("Character", CharacterSchema);
