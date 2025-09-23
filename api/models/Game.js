const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema(
    {
        gameId: {
            type: String,
            required: true,
            unique: true,
        },
        players: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                deck: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Deck",
                    required: true,
                },
                playerNumber: {
                    type: Number,
                    required: true,
                    enum: [1, 2],
                },
                startingHealth: {
                    type: Number,
                    default: 100,
                },
                currentHealth: {
                    type: Number,
                    default: 100,
                },
                mana: {
                    type: Number,
                    default: 1,
                },
                maxMana: {
                    type: Number,
                    default: 1,
                },
                cardsInHand: [
                    {
                        character: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "Character",
                        },
                        cardInstanceId: String,
                    },
                ],
                cardsInPlay: [
                    {
                        character: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "Character",
                        },
                        cardInstanceId: String,
                        currentHealth: Number,
                        currentAttack: Number,
                        canAttack: {
                            type: Boolean,
                            default: false,
                        },
                        buffs: [
                            {
                                type: String,
                                duration: Number,
                                effect: String,
                            },
                        ],
                        debuffs: [
                            {
                                type: String,
                                duration: Number,
                                effect: String,
                            },
                        ],
                    },
                ],
                graveyard: [
                    {
                        character: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "Character",
                        },
                        cardInstanceId: String,
                        destroyedAt: {
                            type: Date,
                            default: Date.now,
                        },
                    },
                ],
            },
        ],
        gameState: {
            type: String,
            enum: ["waiting", "in_progress", "finished", "abandoned"],
            default: "waiting",
        },
        currentTurn: {
            type: Number,
            default: 1,
        },
        currentPlayer: {
            type: Number,
            default: 1,
            enum: [1, 2],
        },
        turnCount: {
            type: Number,
            default: 1,
        },
        maxTurns: {
            type: Number,
            default: 50, // Partie se termine après 50 tours
        },
        gameMode: {
            type: String,
            enum: ["ranked", "casual", "friendly", "tournament"],
            required: true,
        },
        format: {
            type: String,
            enum: ["Standard", "Classic", "Limited", "Custom"],
            required: true,
        },
        winner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        winCondition: {
            type: String,
            enum: [
                "health_depleted",
                "deck_exhausted",
                "surrender",
                "timeout",
                "max_turns",
            ],
            default: null,
        },
        actions: [
            {
                player: {
                    type: Number,
                    required: true,
                },
                turn: {
                    type: Number,
                    required: true,
                },
                actionType: {
                    type: String,
                    enum: [
                        "play_card",
                        "attack",
                        "use_ability",
                        "end_turn",
                        "surrender",
                    ],
                    required: true,
                },
                details: {
                    type: mongoose.Schema.Types.Mixed, // Stockage flexible pour les détails de l'action
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        startTime: {
            type: Date,
            default: Date.now,
        },
        endTime: {
            type: Date,
            default: null,
        },
        duration: {
            type: Number, // en secondes
            default: null,
        },
        spectators: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        isRanked: {
            type: Boolean,
            default: false,
        },
        tournamentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tournament",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Index pour améliorer les performances
GameSchema.index({ gameId: 1 });
GameSchema.index({ "players.user": 1 });
GameSchema.index({ gameState: 1 });
GameSchema.index({ gameMode: 1 });
GameSchema.index({ startTime: -1 });
GameSchema.index({ tournamentId: 1 });

// Méthode pour obtenir l'adversaire d'un joueur
GameSchema.methods.getOpponent = function (playerId) {
    return this.players.find((p) => !p.user.equals(playerId));
};

// Méthode pour obtenir un joueur par son ID
GameSchema.methods.getPlayer = function (playerId) {
    return this.players.find((p) => p.user.equals(playerId));
};

// Méthode pour changer de joueur actif
GameSchema.methods.switchTurn = function () {
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    if (this.currentPlayer === 1) {
        this.turnCount += 1;
    }
};

// Méthode pour terminer la partie
GameSchema.methods.endGame = function (winnerId, winCondition) {
    this.gameState = "finished";
    this.winner = winnerId;
    this.winCondition = winCondition;
    this.endTime = new Date();
    this.duration = Math.floor((this.endTime - this.startTime) / 1000);
};

module.exports = mongoose.model("Game", GameSchema);
