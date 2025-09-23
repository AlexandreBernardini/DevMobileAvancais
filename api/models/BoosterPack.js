const mongoose = require("mongoose");

const BoosterPackSchema = new mongoose.Schema(
    {
        packId: {
            type: String,
            required: true,
            unique: true,
        },
        set: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Set",
            required: true,
        },
        packType: {
            type: String,
            enum: ["Standard", "Premium", "Elite", "Legendary"],
            default: "Standard",
        },
        price: {
            coins: {
                type: Number,
                required: true,
                min: 0,
            },
            gems: {
                type: Number,
                default: 0,
                min: 0,
            },
        },
        cardsCount: {
            type: Number,
            required: true,
            min: 3,
            max: 15,
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
        rarityDistribution: {
            common: {
                type: Number,
                default: 60,
                min: 0,
                max: 100,
            },
            uncommon: {
                type: Number,
                default: 25,
                min: 0,
                max: 100,
            },
            rare: {
                type: Number,
                default: 10,
                min: 0,
                max: 100,
            },
            epic: {
                type: Number,
                default: 4,
                min: 0,
                max: 100,
            },
            legendary: {
                type: Number,
                default: 1,
                min: 0,
                max: 100,
            },
            mythic: {
                type: Number,
                default: 0.1,
                min: 0,
                max: 100,
            },
        },
        specialFeatures: {
            foilChance: {
                type: Number,
                default: 10, // 10% de chance
                min: 0,
                max: 100,
            },
            bonusCardChance: {
                type: Number,
                default: 5, // 5% de chance d'avoir une carte bonus
                min: 0,
                max: 100,
            },
            guaranteedElement: {
                type: String,
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
                default: null,
            },
        },
        artwork: {
            packImage: {
                type: String,
                required: true,
            },
            openingAnimation: {
                type: String,
            },
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isLimited: {
            type: Boolean,
            default: false,
        },
        limitedQuantity: {
            type: Number,
            default: null,
        },
        soldCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        availableFrom: {
            type: Date,
            default: Date.now,
        },
        availableUntil: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Index pour améliorer les performances
BoosterPackSchema.index({ packId: 1 });
BoosterPackSchema.index({ set: 1 });
BoosterPackSchema.index({ packType: 1 });
BoosterPackSchema.index({ isActive: 1 });
BoosterPackSchema.index({ availableFrom: 1, availableUntil: 1 });

// Méthode pour vérifier si le pack est disponible
BoosterPackSchema.methods.isAvailable = function () {
    const now = new Date();

    if (!this.isActive) {
        return { available: false, reason: "Pack is not active" };
    }

    if (this.availableFrom && now < this.availableFrom) {
        return { available: false, reason: "Pack not yet available" };
    }

    if (this.availableUntil && now > this.availableUntil) {
        return { available: false, reason: "Pack no longer available" };
    }

    if (
        this.isLimited &&
        this.limitedQuantity &&
        this.soldCount >= this.limitedQuantity
    ) {
        return { available: false, reason: "Limited pack sold out" };
    }

    return { available: true };
};

// Méthode pour générer une carte selon les probabilités
BoosterPackSchema.methods.generateCardRarity = function () {
    const rarities = [
        { rarity: "Mythic", chance: this.rarityDistribution.mythic },
        { rarity: "Legendary", chance: this.rarityDistribution.legendary },
        { rarity: "Epic", chance: this.rarityDistribution.epic },
        { rarity: "Rare", chance: this.rarityDistribution.rare },
        { rarity: "Uncommon", chance: this.rarityDistribution.uncommon },
        { rarity: "Common", chance: this.rarityDistribution.common },
    ];

    const random = Math.random() * 100;
    let cumulative = 0;

    for (let rarityInfo of rarities) {
        cumulative += rarityInfo.chance;
        if (random <= cumulative) {
            return rarityInfo.rarity;
        }
    }

    return "Common"; // Fallback
};

// Méthode pour simuler l'ouverture d'un pack
BoosterPackSchema.methods.simulateOpening = function () {
    const cards = [];

    // Ajouter les cartes garanties
    for (let guaranteed of this.guaranteedRarities) {
        for (let i = 0; i < guaranteed.quantity; i++) {
            cards.push({
                rarity: guaranteed.rarity,
                foil: Math.random() * 100 < this.specialFeatures.foilChance,
            });
        }
    }

    // Ajouter les cartes restantes
    const remainingCards = this.cardsCount - cards.length;
    for (let i = 0; i < remainingCards; i++) {
        cards.push({
            rarity: this.generateCardRarity(),
            foil: Math.random() * 100 < this.specialFeatures.foilChance,
        });
    }

    // Chance de carte bonus
    if (Math.random() * 100 < this.specialFeatures.bonusCardChance) {
        cards.push({
            rarity: this.generateCardRarity(),
            foil: Math.random() * 100 < this.specialFeatures.foilChance,
            bonus: true,
        });
    }

    return cards;
};

module.exports = mongoose.model("BoosterPack", BoosterPackSchema);
