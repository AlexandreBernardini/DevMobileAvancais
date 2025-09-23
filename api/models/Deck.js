const mongoose = require("mongoose");

const DeckSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },
        description: {
            type: String,
            maxlength: 200,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        cards: [
            {
                character: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Character",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                    max: 3, // Maximum 3 copies d'une même carte
                },
            },
        ],
        totalCards: {
            type: Number,
            required: true,
            min: 30,
            max: 60, // Deck de 30 à 60 cartes
        },
        format: {
            type: String,
            enum: ["Standard", "Classic", "Limited", "Custom"],
            default: "Standard",
        },
        mainElement: {
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
                "Mixed",
            ],
            required: true,
        },
        strategy: {
            type: String,
            enum: ["Aggro", "Control", "Midrange", "Combo", "Tempo"],
            required: true,
        },
        isPublic: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        wins: {
            type: Number,
            default: 0,
            min: 0,
        },
        losses: {
            type: Number,
            default: 0,
            min: 0,
        },
        winRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        lastUsed: {
            type: Date,
            default: null,
        },
        tags: [
            {
                type: String,
                trim: true,
            },
        ],
        likes: {
            type: Number,
            default: 0,
            min: 0,
        },
        likedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        copies: {
            type: Number,
            default: 0,
            min: 0,
        },
        version: {
            type: Number,
            default: 1,
            min: 1,
        },
    },
    {
        timestamps: true,
    }
);

// Index pour améliorer les performances
DeckSchema.index({ owner: 1 });
DeckSchema.index({ mainElement: 1 });
DeckSchema.index({ strategy: 1 });
DeckSchema.index({ isPublic: 1, likes: -1 });
DeckSchema.index({ format: 1 });

// Méthode pour calculer le taux de victoire
DeckSchema.methods.calculateWinRate = function () {
    const totalGames = this.wins + this.losses;
    if (totalGames === 0) return 0;
    return Math.round((this.wins / totalGames) * 100);
};

// Méthode pour valider si le deck est légal
DeckSchema.methods.isValidDeck = function () {
    // Vérifier le nombre total de cartes
    if (this.totalCards < 30 || this.totalCards > 60) {
        return {
            valid: false,
            reason: "Deck must contain between 30 and 60 cards",
        };
    }

    // Vérifier que chaque carte n'est pas présente plus de 3 fois
    for (let card of this.cards) {
        if (card.quantity > 3) {
            return {
                valid: false,
                reason: "Maximum 3 copies of any card allowed",
            };
        }
    }

    // Calculer le total de cartes
    const calculatedTotal = this.cards.reduce(
        (sum, card) => sum + card.quantity,
        0
    );
    if (calculatedTotal !== this.totalCards) {
        return { valid: false, reason: "Card count mismatch" };
    }

    return { valid: true };
};

// Middleware pour mettre à jour le taux de victoire et le total de cartes
DeckSchema.pre("save", function (next) {
    this.winRate = this.calculateWinRate();
    this.totalCards = this.cards.reduce((sum, card) => sum + card.quantity, 0);
    next();
});

module.exports = mongoose.model("Deck", DeckSchema);
