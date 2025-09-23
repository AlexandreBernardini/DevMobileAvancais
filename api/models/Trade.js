const mongoose = require("mongoose");

const TradeSchema = new mongoose.Schema(
    {
        tradeId: {
            type: String,
            required: true,
            unique: true,
        },
        initiator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        initiatorOffer: {
            cards: [
                {
                    userCard: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "UserCard",
                        required: true,
                    },
                    quantity: {
                        type: Number,
                        required: true,
                        min: 1,
                    },
                },
            ],
            coins: {
                type: Number,
                default: 0,
                min: 0,
            },
            gems: {
                type: Number,
                default: 0,
                min: 0,
            },
        },
        recipientOffer: {
            cards: [
                {
                    userCard: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "UserCard",
                        required: true,
                    },
                    quantity: {
                        type: Number,
                        required: true,
                        min: 1,
                    },
                },
            ],
            coins: {
                type: Number,
                default: 0,
                min: 0,
            },
            gems: {
                type: Number,
                default: 0,
                min: 0,
            },
        },
        status: {
            type: String,
            enum: [
                "pending",
                "accepted",
                "declined",
                "cancelled",
                "completed",
                "expired",
            ],
            default: "pending",
        },
        message: {
            type: String,
            maxlength: 200,
        },
        responseMessage: {
            type: String,
            maxlength: 200,
        },
        expirationDate: {
            type: Date,
            required: true,
            default: function () {
                return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours
            },
        },
        completedAt: {
            type: Date,
        },
        tradeType: {
            type: String,
            enum: ["direct", "public", "auction"],
            default: "direct",
        },
        isPublic: {
            type: Boolean,
            default: false,
        },
        viewCount: {
            type: Number,
            default: 0,
        },
        interestedUsers: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                offer: {
                    cards: [
                        {
                            userCard: {
                                type: mongoose.Schema.Types.ObjectId,
                                ref: "UserCard",
                            },
                            quantity: Number,
                        },
                    ],
                    coins: {
                        type: Number,
                        default: 0,
                    },
                    gems: {
                        type: Number,
                        default: 0,
                    },
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Index pour améliorer les performances
TradeSchema.index({ tradeId: 1 });
TradeSchema.index({ initiator: 1 });
TradeSchema.index({ recipient: 1 });
TradeSchema.index({ status: 1 });
TradeSchema.index({ expirationDate: 1 });
TradeSchema.index({ isPublic: 1, status: 1 });

// Méthode pour vérifier si l'échange a expiré
TradeSchema.methods.isExpired = function () {
    return new Date() > this.expirationDate && this.status === "pending";
};

// Méthode pour calculer la valeur totale d'une offre
TradeSchema.methods.calculateOfferValue = function (offer) {
    // Cette méthode pourrait être étendue pour calculer la valeur réelle des cartes
    let totalValue = offer.coins + offer.gems * 10; // 1 gem = 10 coins par exemple

    // Ajouter la valeur des cartes (nécessiterait une logique plus complexe)
    // totalValue += offer.cards.reduce((sum, card) => sum + card.estimatedValue * card.quantity, 0);

    return totalValue;
};

// Méthode pour valider si l'échange peut être complété
TradeSchema.methods.canComplete = function () {
    if (this.status !== "accepted") {
        return { valid: false, reason: "Trade not accepted" };
    }

    if (this.isExpired()) {
        return { valid: false, reason: "Trade expired" };
    }

    // Ici on pourrait ajouter d'autres validations :
    // - Vérifier que les cartes sont toujours possédées
    // - Vérifier que les utilisateurs ont assez de devises
    // - Vérifier que les cartes ne sont pas verrouillées

    return { valid: true };
};

// Middleware pour marquer les échanges expirés
TradeSchema.pre("find", function () {
    // Marquer automatiquement les échanges expirés
    this.updateMany(
        {
            status: "pending",
            expirationDate: { $lt: new Date() },
        },
        {
            status: "expired",
        }
    );
});

module.exports = mongoose.model("Trade", TradeSchema);
