const mongoose = require("mongoose");

const SetSchema = new mongoose.Schema(
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
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            maxlength: 10,
        },
        description: {
            type: String,
            required: true,
        },
        theme: {
            type: String,
            required: true,
        },
        totalCards: {
            type: Number,
            required: true,
            min: 1,
        },
        rarityDistribution: {
            common: { type: Number, default: 0 },
            uncommon: { type: Number, default: 0 },
            rare: { type: Number, default: 0 },
            epic: { type: Number, default: 0 },
            legendary: { type: Number, default: 0 },
            mythic: { type: Number, default: 0 },
        },
        setIcon: {
            type: String,
            required: true,
        },
        setSymbol: {
            type: String,
            required: true,
        },
        backgroundArt: {
            type: String,
            required: false,
        },
        releaseDate: {
            type: Date,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isLimited: {
            type: Boolean,
            default: false,
        },
        endDate: {
            type: Date,
            required: false,
        },
        boosterPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        boosterConfiguration: {
            cardsPerPack: {
                type: Number,
                required: true,
                default: 5,
            },
            guaranteedRarities: [
                {
                    rarity: {
                        type: String,
                        enum: [
                            "Common",
                            "Uncommon",
                            "Rare",
                            "Epic",
                            "Legendary",
                            "Mythic",
                        ],
                    },
                    quantity: {
                        type: Number,
                        min: 1,
                    },
                },
            ],
        },
    },
    {
        timestamps: true,
    }
);

SetSchema.index({ code: 1 });
SetSchema.index({ releaseDate: 1 });
SetSchema.index({ isActive: 1 });

module.exports = mongoose.model("Set", SetSchema);
