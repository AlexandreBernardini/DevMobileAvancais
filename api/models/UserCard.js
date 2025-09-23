const mongoose = require("mongoose");

const UserCardSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        character: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Character",
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
        },
        condition: {
            type: String,
            enum: ["Mint", "Near Mint", "Excellent", "Good", "Played", "Poor"],
            default: "Mint",
        },
        foil: {
            type: Boolean,
            default: false,
        },
        level: {
            type: Number,
            default: 1,
            min: 1,
            max: 100,
        },
        experience: {
            type: Number,
            default: 0,
            min: 0,
        },
        isLocked: {
            type: Boolean,
            default: false,
        },
        isFavorite: {
            type: Boolean,
            default: false,
        },
        obtainedFrom: {
            type: String,
            enum: [
                "Booster",
                "Trade",
                "Reward",
                "Purchase",
                "Event",
                "Starter",
            ],
            required: true,
        },
        obtainedAt: {
            type: Date,
            default: Date.now,
        },
        lastUsed: {
            type: Date,
            default: null,
        },
        timesUsed: {
            type: Number,
            default: 0,
            min: 0,
        },
        tradeable: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index composé pour optimiser les requêtes
UserCardSchema.index({ user: 1, character: 1 });
UserCardSchema.index({ user: 1, isFavorite: 1 });
UserCardSchema.index({ user: 1, level: -1 });
UserCardSchema.index({ user: 1, obtainedAt: -1 });

// Méthode pour calculer l'expérience nécessaire pour le niveau suivant
UserCardSchema.methods.getExpForNextLevel = function () {
    return this.level * 100; // Formule simple, peut être ajustée
};

// Méthode pour augmenter le niveau si assez d'expérience
UserCardSchema.methods.checkLevelUp = function () {
    const expNeeded = this.getExpForNextLevel();
    if (this.experience >= expNeeded && this.level < 100) {
        this.level += 1;
        this.experience -= expNeeded;
        return true;
    }
    return false;
};

module.exports = mongoose.model("UserCard", UserCardSchema);
