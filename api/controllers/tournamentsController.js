const prisma = require("../config/database");

/**
 * Create a new tournament
 */
const createTournament = async (req, res, next) => {
    try {
        const tournamentData = req.body;
        const organizerId = req.user.id;

        const tournament = await prisma.$transaction(async (tx) => {
            const newTournament = await tx.tournament.create({
                data: {
                    ...tournamentData,
                    organizerId,
                },
            });

            // Create prizes if provided
            if (tournamentData.prizes && tournamentData.prizes.length > 0) {
                await tx.tournamentPrize.createMany({
                    data: tournamentData.prizes.map((prize) => ({
                        ...prize,
                        tournamentId: newTournament.id,
                    })),
                });
            }

            return tx.tournament.findUnique({
                where: { id: newTournament.id },
                include: {
                    organizer: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                        },
                    },
                    prizes: true,
                    _count: {
                        select: {
                            participants: true,
                        },
                    },
                },
            });
        });

        res.status(201).json({
            success: true,
            message: "Tournament created successfully",
            data: tournament,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all tournaments
 */
const getTournaments = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, format, type } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const where = { isPublic: true };

        if (status) where.status = status;
        if (format) where.format = format;
        if (type) where.tournamentType = type;

        const [tournaments, total] = await Promise.all([
            prisma.tournament.findMany({
                where,
                include: {
                    organizer: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                        },
                    },
                    prizes: true,
                    _count: {
                        select: {
                            participants: true,
                        },
                    },
                },
                orderBy: { startTime: "asc" },
                skip: offset,
                take: parseInt(limit),
            }),
            prisma.tournament.count({ where }),
        ]);

        res.json({
            success: true,
            data: tournaments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get tournament by ID
 */
const getTournamentById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const tournament = await prisma.tournament.findUnique({
            where: { id },
            include: {
                organizer: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatar: true,
                    },
                },
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                displayName: true,
                                avatar: true,
                                level: true,
                                league: true,
                            },
                        },
                        deck: {
                            select: {
                                id: true,
                                name: true,
                                format: true,
                                mainElement: true,
                            },
                        },
                    },
                    orderBy: { registrationTime: "asc" },
                },
                matches: {
                    include: {
                        game: {
                            select: {
                                id: true,
                                gameState: true,
                                winner: {
                                    select: {
                                        id: true,
                                        username: true,
                                        displayName: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: [{ round: "asc" }, { matchNumber: "asc" }],
                },
                prizes: {
                    orderBy: { position: "asc" },
                },
            },
        });

        if (!tournament) {
            return res.status(404).json({
                success: false,
                error: "Tournament not found",
            });
        }

        res.json({
            success: true,
            data: tournament,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Join tournament
 */
const joinTournament = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { deckId } = req.body;
        const userId = req.user.id;

        const tournament = await prisma.tournament.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        participants: true,
                    },
                },
            },
        });

        if (!tournament) {
            return res.status(404).json({
                success: false,
                error: "Tournament not found",
            });
        }

        // Check if registration is open
        const now = new Date();
        if (tournament.status !== "registration") {
            return res.status(400).json({
                success: false,
                error: "Tournament registration is not open",
            });
        }

        if (
            now < tournament.registrationStart ||
            now > tournament.registrationEnd
        ) {
            return res.status(400).json({
                success: false,
                error: "Tournament registration period has ended",
            });
        }

        if (tournament._count.participants >= tournament.maxParticipants) {
            return res.status(400).json({
                success: false,
                error: "Tournament is full",
            });
        }

        // Check if user already joined
        const existingParticipant =
            await prisma.tournamentParticipant.findUnique({
                where: {
                    tournamentId_userId: {
                        tournamentId: id,
                        userId,
                    },
                },
            });

        if (existingParticipant) {
            return res.status(409).json({
                success: false,
                error: "You are already registered for this tournament",
            });
        }

        // Verify deck belongs to user and matches format
        const deck = await prisma.deck.findUnique({
            where: { id: deckId },
        });

        if (!deck || deck.ownerId !== userId) {
            return res.status(400).json({
                success: false,
                error: "Invalid deck",
            });
        }

        if (deck.format !== tournament.format) {
            return res.status(400).json({
                success: false,
                error: `Deck format must be ${tournament.format}`,
            });
        }

        // Check if user has enough currency for entry fee
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { coins: true, gems: true },
        });

        if (
            user.coins < tournament.entryFeeCoins ||
            user.gems < tournament.entryFeeGems
        ) {
            return res.status(400).json({
                success: false,
                error: "Insufficient currency for entry fee",
            });
        }

        // Join tournament with transaction
        const result = await prisma.$transaction(async (tx) => {
            // Deduct entry fee
            await tx.user.update({
                where: { id: userId },
                data: {
                    coins: { decrement: tournament.entryFeeCoins },
                    gems: { decrement: tournament.entryFeeGems },
                },
            });

            // Add participant
            const participant = await tx.tournamentParticipant.create({
                data: {
                    tournamentId: id,
                    userId,
                    deckId,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            avatar: true,
                        },
                    },
                    deck: {
                        select: {
                            id: true,
                            name: true,
                            format: true,
                        },
                    },
                },
            });

            return participant;
        });

        res.json({
            success: true,
            message: "Successfully joined tournament",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Start tournament (Organizer/Admin only)
 */
const startTournament = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const tournament = await prisma.tournament.findUnique({
            where: { id },
            include: {
                participants: true,
            },
        });

        if (!tournament) {
            return res.status(404).json({
                success: false,
                error: "Tournament not found",
            });
        }

        // Check permissions
        if (tournament.organizerId !== userId && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                error: "Only the organizer or admin can start the tournament",
            });
        }

        if (tournament.status !== "registration") {
            return res.status(400).json({
                success: false,
                error: "Tournament cannot be started",
            });
        }

        if (tournament.participants.length < 4) {
            return res.status(400).json({
                success: false,
                error: "Tournament needs at least 4 participants",
            });
        }

        // Generate first round matches
        const updatedTournament = await prisma.$transaction(async (tx) => {
            // Update tournament status
            await tx.tournament.update({
                where: { id },
                data: {
                    status: "in_progress",
                    currentRound: 1,
                },
            });

            // Generate first round matches based on tournament type
            const participants = tournament.participants;
            const matches = [];

            // Simple single elimination bracket generation
            for (let i = 0; i < participants.length; i += 2) {
                if (i + 1 < participants.length) {
                    matches.push({
                        tournamentId: id,
                        round: 1,
                        matchNumber: Math.floor(i / 2) + 1,
                        status: "pending",
                    });
                }
            }

            await tx.tournamentMatch.createMany({
                data: matches,
            });

            return tx.tournament.findUnique({
                where: { id },
                include: {
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                    displayName: true,
                                },
                            },
                        },
                    },
                    matches: true,
                },
            });
        });

        res.json({
            success: true,
            message: "Tournament started successfully",
            data: updatedTournament,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTournament,
    getTournaments,
    getTournamentById,
    joinTournament,
    startTournament,
};
