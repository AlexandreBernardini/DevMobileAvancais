const mongoose = require("mongoose");

const TournamentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        format: {
            type: String,
            enum: ["Standard", "Classic", "Limited", "Custom"],
            required: true,
        },
        tournamentType: {
            type: String,
            enum: [
                "single_elimination",
                "double_elimination",
                "round_robin",
                "swiss",
            ],
            required: true,
        },
        maxParticipants: {
            type: Number,
            required: true,
            min: 4,
            max: 256,
        },
        entryFee: {
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
        prizes: [
            {
                position: {
                    type: Number,
                    required: true,
                },
                reward: {
                    coins: {
                        type: Number,
                        default: 0,
                    },
                    gems: {
                        type: Number,
                        default: 0,
                    },
                    packs: {
                        type: Number,
                        default: 0,
                    },
                    cards: [
                        {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "Character",
                        },
                    ],
                    title: {
                        type: String,
                    },
                },
            },
        ],
        participants: [
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
                registrationTime: {
                    type: Date,
                    default: Date.now,
                },
                seed: {
                    type: Number,
                },
                isActive: {
                    type: Boolean,
                    default: true,
                },
            },
        ],
        matches: [
            {
                round: {
                    type: Number,
                    required: true,
                },
                matchNumber: {
                    type: Number,
                    required: true,
                },
                player1: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                player2: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                winner: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                game: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Game",
                },
                status: {
                    type: String,
                    enum: ["pending", "in_progress", "completed", "walkover"],
                    default: "pending",
                },
                scheduledTime: {
                    type: Date,
                },
            },
        ],
        status: {
            type: String,
            enum: ["registration", "in_progress", "completed", "cancelled"],
            default: "registration",
        },
        registrationStart: {
            type: Date,
            required: true,
        },
        registrationEnd: {
            type: Date,
            required: true,
        },
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
        },
        currentRound: {
            type: Number,
            default: 0,
        },
        totalRounds: {
            type: Number,
        },
        rules: [
            {
                type: String,
            },
        ],
        banner: {
            type: String,
        },
        isPublic: {
            type: Boolean,
            default: true,
        },
        allowSpectators: {
            type: Boolean,
            default: true,
        },
        streamUrl: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Index pour améliorer les performances
TournamentSchema.index({ status: 1 });
TournamentSchema.index({ registrationStart: 1, registrationEnd: 1 });
TournamentSchema.index({ startTime: 1 });
TournamentSchema.index({ organizer: 1 });
TournamentSchema.index({ format: 1 });
TournamentSchema.index({ "participants.user": 1 });

// Méthode pour vérifier si les inscriptions sont ouvertes
TournamentSchema.methods.isRegistrationOpen = function () {
    const now = new Date();
    return (
        this.status === "registration" &&
        now >= this.registrationStart &&
        now <= this.registrationEnd &&
        this.participants.length < this.maxParticipants
    );
};

// Méthode pour calculer le nombre de rounds nécessaires
TournamentSchema.methods.calculateTotalRounds = function () {
    const participantCount = this.participants.length;

    switch (this.tournamentType) {
        case "single_elimination":
            return Math.ceil(Math.log2(participantCount));
        case "double_elimination":
            return (
                Math.ceil(Math.log2(participantCount)) +
                Math.ceil(Math.log2(participantCount)) -
                1
            );
        case "round_robin":
            return participantCount - 1;
        case "swiss":
            return Math.ceil(Math.log2(participantCount));
        default:
            return 1;
    }
};

// Méthode pour générer les matchs du premier round
TournamentSchema.methods.generateFirstRound = function () {
    const participants = [...this.participants];

    // Mélanger les participants si pas déjà fait
    if (!participants[0].seed) {
        for (let i = participants.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [participants[i], participants[j]] = [
                participants[j],
                participants[i],
            ];
        }

        // Assigner les seeds
        participants.forEach((participant, index) => {
            participant.seed = index + 1;
        });
    }

    // Créer les matchs
    const matches = [];
    for (let i = 0; i < participants.length; i += 2) {
        if (i + 1 < participants.length) {
            matches.push({
                round: 1,
                matchNumber: Math.floor(i / 2) + 1,
                player1: participants[i].user,
                player2: participants[i + 1].user,
                status: "pending",
            });
        }
    }

    this.matches = matches;
    this.currentRound = 1;
    this.totalRounds = this.calculateTotalRounds();
    this.status = "in_progress";
};

module.exports = mongoose.model("Tournament", TournamentSchema);
