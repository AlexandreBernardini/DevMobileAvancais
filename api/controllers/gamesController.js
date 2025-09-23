const prisma = require("../config/database");
const { v4: uuidv4 } = require("uuid");

/**
 * Create a new game
 */
const createGame = async (req, res, next) => {
    try {
        const {
            player2Id,
            player1DeckId,
            player2DeckId,
            gameMode,
            format,
            tournamentId,
        } = req.body;
        const player1Id = req.user.id;

        if (player1Id === player2Id) {
            return res.status(400).json({
                success: false,
                error: "Cannot play against yourself",
            });
        }

        // Verify both players exist and are active
        const [player1, player2] = await Promise.all([
            prisma.user.findUnique({
                where: { id: player1Id, isActive: true },
            }),
            prisma.user.findUnique({
                where: { id: player2Id, isActive: true },
            }),
        ]);

        if (!player1 || !player2) {
            return res.status(404).json({
                success: false,
                error: "One or both players not found",
            });
        }

        // Verify both decks exist and belong to respective players
        const [player1Deck, player2Deck] = await Promise.all([
            prisma.deck.findUnique({
                where: { id: player1DeckId },
                include: { cards: true },
            }),
            prisma.deck.findUnique({
                where: { id: player2DeckId },
                include: { cards: true },
            }),
        ]);

        if (!player1Deck || player1Deck.ownerId !== player1Id) {
            return res.status(400).json({
                success: false,
                error: "Invalid deck for player 1",
            });
        }

        if (!player2Deck || player2Deck.ownerId !== player2Id) {
            return res.status(400).json({
                success: false,
                error: "Invalid deck for player 2",
            });
        }

        // Validate deck formats match
        if (
            player1Deck.format !== player2Deck.format ||
            player1Deck.format !== format
        ) {
            return res.status(400).json({
                success: false,
                error: "Deck formats must match",
            });
        }

        const gameId = `game_${uuidv4()}`;

        const game = await prisma.game.create({
            data: {
                gameId,
                player1Id,
                player2Id,
                player1DeckId,
                player2DeckId,
                gameMode,
                format,
                tournamentId,
                isRanked: gameMode === "ranked",
            },
            include: {
                player1: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatar: true,
                        level: true,
                    },
                },
                player2: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatar: true,
                        level: true,
                    },
                },
                player1Deck: {
                    select: {
                        id: true,
                        name: true,
                        format: true,
                        mainElement: true,
                    },
                },
                player2Deck: {
                    select: {
                        id: true,
                        name: true,
                        format: true,
                        mainElement: true,
                    },
                },
            },
        });

        res.status(201).json({
            success: true,
            message: "Game created successfully",
            data: game,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get game by ID
 */
const getGameById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const game = await prisma.game.findUnique({
            where: { id },
            include: {
                player1: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatar: true,
                        level: true,
                    },
                },
                player2: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatar: true,
                        level: true,
                    },
                },
                player1Deck: {
                    include: {
                        cards: {
                            include: {
                                character: {
                                    include: {
                                        abilities: true,
                                    },
                                },
                            },
                        },
                    },
                },
                player2Deck: {
                    include: {
                        cards: {
                            include: {
                                character: {
                                    include: {
                                        abilities: true,
                                    },
                                },
                            },
                        },
                    },
                },
                actions: {
                    orderBy: { timestamp: "asc" },
                },
                winner: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                    },
                },
            },
        });

        if (!game) {
            return res.status(404).json({
                success: false,
                error: "Game not found",
            });
        }

        // Check if user is a participant or if game allows spectators
        const isParticipant =
            game.player1Id === userId || game.player2Id === userId;
        const isSpectatorAllowed = game.gameMode !== "friendly"; // Allow spectating for non-friendly games

        if (
            !isParticipant &&
            !isSpectatorAllowed &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                error: "Access denied to this game",
            });
        }

        res.json({
            success: true,
            data: game,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Perform game action
 */
const performAction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { actionType, details } = req.body;
        const userId = req.user.id;

        const game = await prisma.game.findUnique({
            where: { id },
        });

        if (!game) {
            return res.status(404).json({
                success: false,
                error: "Game not found",
            });
        }

        // Check if user is a participant
        if (game.player1Id !== userId && game.player2Id !== userId) {
            return res.status(403).json({
                success: false,
                error: "You are not a participant in this game",
            });
        }

        // Check if game is still active
        if (game.gameState === "finished" || game.gameState === "abandoned") {
            return res.status(400).json({
                success: false,
                error: "Game is no longer active",
            });
        }

        // Determine player number
        const playerNumber = game.player1Id === userId ? 1 : 2;

        // Check if it's the player's turn (for most actions)
        if (actionType !== "surrender" && game.currentPlayer !== playerNumber) {
            return res.status(400).json({
                success: false,
                error: "It is not your turn",
            });
        }

        // Create action record
        const action = await prisma.gameAction.create({
            data: {
                gameId: id,
                player: playerNumber,
                turn: game.turnCount,
                actionType,
                details: details || {},
            },
        });

        // Handle different action types
        let gameUpdate = {};

        switch (actionType) {
            case "end_turn":
                gameUpdate = {
                    currentPlayer: game.currentPlayer === 1 ? 2 : 1,
                    currentTurn: game.currentTurn + 1,
                };
                if (game.currentPlayer === 2) {
                    gameUpdate.turnCount = game.turnCount + 1;
                }
                break;

            case "surrender":
                const winnerId =
                    game.player1Id === userId ? game.player2Id : game.player1Id;
                gameUpdate = {
                    gameState: "finished",
                    winnerId,
                    winCondition: "surrender",
                    endTime: new Date(),
                    duration: Math.floor((new Date() - game.startTime) / 1000),
                };

                // Update player statistics
                await prisma.$transaction([
                    // Update winner stats
                    prisma.user.update({
                        where: { id: winnerId },
                        data: {
                            wins: { increment: 1 },
                            totalGamesPlayed: { increment: 1 },
                            currentStreak: { increment: 1 },
                        },
                    }),
                    // Update loser stats
                    prisma.user.update({
                        where: { id: userId },
                        data: {
                            losses: { increment: 1 },
                            totalGamesPlayed: { increment: 1 },
                            currentStreak: 0,
                        },
                    }),
                ]);
                break;

            case "play_card":
            case "attack":
            case "use_ability":
                // These would require more complex game logic
                // For now, just record the action
                break;
        }

        // Update game if needed
        if (Object.keys(gameUpdate).length > 0) {
            await prisma.game.update({
                where: { id },
                data: gameUpdate,
            });
        }

        res.json({
            success: true,
            message: "Action performed successfully",
            data: {
                action,
                gameUpdate,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user's game history
 */
const getUserGames = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20, gameMode, status } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const where = {
            OR: [{ player1Id: userId }, { player2Id: userId }],
        };

        if (gameMode) where.gameMode = gameMode;
        if (status) where.gameState = status;

        const [games, total] = await Promise.all([
            prisma.game.findMany({
                where,
                include: {
                    player1: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            avatar: true,
                        },
                    },
                    player2: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            avatar: true,
                        },
                    },
                    winner: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                        },
                    },
                },
                orderBy: { startTime: "desc" },
                skip: offset,
                take: parseInt(limit),
            }),
            prisma.game.count({ where }),
        ]);

        res.json({
            success: true,
            data: games,
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

module.exports = {
    createGame,
    getGameById,
    performAction,
    getUserGames,
};
