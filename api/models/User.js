const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 20,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        profile: {
            displayName: {
                type: String,
                trim: true,
                maxlength: 30,
            },
            avatar: {
                type: String,
                default: null,
            },
            level: {
                type: Number,
                default: 1,
                min: 1,
            },
            experience: {
                type: Number,
                default: 0,
                min: 0,
            },
            title: {
                type: String,
                default: "Novice Collector",
            },
            bio: {
                type: String,
                maxlength: 200,
            },
        },
        gameStats: {
            totalGamesPlayed: {
                type: Number,
                default: 0,
            },
            wins: {
                type: Number,
                default: 0,
            },
            losses: {
                type: Number,
                default: 0,
            },
            winRate: {
                type: Number,
                default: 0,
                min: 0,
                max: 100,
            },
            currentStreak: {
                type: Number,
                default: 0,
            },
            bestStreak: {
                type: Number,
                default: 0,
            },
            ranking: {
                type: Number,
                default: 1000,
            },
            league: {
                type: String,
                enum: [
                    "Bronze",
                    "Silver",
                    "Gold",
                    "Platinum",
                    "Diamond",
                    "Master",
                    "Grandmaster",
                ],
                default: "Bronze",
            },
        },
        collection: {
            totalCards: {
                type: Number,
                default: 0,
            },
            uniqueCards: {
                type: Number,
                default: 0,
            },
            completedSets: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Set",
                },
            ],
            favoriteCharacters: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Character",
                },
            ],
        },
        currency: {
            coins: {
                type: Number,
                default: 100,
                min: 0,
            },
            gems: {
                type: Number,
                default: 10,
                min: 0,
            },
            dust: {
                type: Number,
                default: 0,
                min: 0,
            },
        },
        settings: {
            notifications: {
                gameInvites: {
                    type: Boolean,
                    default: true,
                },
                dailyRewards: {
                    type: Boolean,
                    default: true,
                },
                setReleases: {
                    type: Boolean,
                    default: true,
                },
            },
            privacy: {
                showProfile: {
                    type: Boolean,
                    default: true,
                },
                showCollection: {
                    type: Boolean,
                    default: true,
                },
                allowFriendRequests: {
                    type: Boolean,
                    default: true,
                },
            },
        },
        friends: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                status: {
                    type: String,
                    enum: ["pending", "accepted", "blocked"],
                    default: "pending",
                },
                addedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        lastLogin: {
            type: Date,
            default: Date.now,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            enum: ["user", "moderator", "admin"],
            default: "user",
        },
    },
    {
        timestamps: true,
    }
);

// Index pour améliorer les performances
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ "gameStats.ranking": 1 });
UserSchema.index({ "gameStats.league": 1 });

// Méthode pour calculer le taux de victoire
UserSchema.methods.calculateWinRate = function () {
    if (this.gameStats.totalGamesPlayed === 0) return 0;
    return Math.round(
        (this.gameStats.wins / this.gameStats.totalGamesPlayed) * 100
    );
};

// Middleware pour mettre à jour le taux de victoire avant la sauvegarde
UserSchema.pre("save", function (next) {
    this.gameStats.winRate = this.calculateWinRate();
    next();
});

module.exports = mongoose.model("User", UserSchema);
