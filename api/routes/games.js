const express = require("express");
const router = express.Router();
const gamesController = require("../controllers/gamesController");
const { authenticate } = require("../middleware/auth");
const { validate, createGameSchema } = require("../middleware/validation");

/**
 * @swagger
 * /games:
 *   post:
 *     summary: Create a new game
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Game created successfully
 */
router.post(
    "/",
    authenticate,
    validate(createGameSchema),
    gamesController.createGame
);

/**
 * @swagger
 * /games/{id}:
 *   get:
 *     summary: Get game by ID
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Game retrieved successfully
 */
router.get("/:id", authenticate, gamesController.getGameById);

/**
 * @swagger
 * /games/{id}/actions:
 *   post:
 *     summary: Perform game action
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Action performed successfully
 */
router.post("/:id/actions", authenticate, gamesController.performAction);

module.exports = router;
