const express = require("express");
const router = express.Router();
const tournamentsController = require("../controllers/tournamentsController");
const { authenticate, authorize } = require("../middleware/auth");
const {
    validate,
    createTournamentSchema,
} = require("../middleware/validation");

/**
 * @swagger
 * /tournaments:
 *   post:
 *     summary: Create a new tournament
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Tournament created successfully
 */
router.post(
    "/",
    authenticate,
    authorize("admin", "moderator"),
    validate(createTournamentSchema),
    tournamentsController.createTournament
);

/**
 * @swagger
 * /tournaments:
 *   get:
 *     summary: Get all tournaments
 *     tags: [Tournaments]
 *     responses:
 *       200:
 *         description: Tournaments retrieved successfully
 */
router.get("/", tournamentsController.getTournaments);

/**
 * @swagger
 * /tournaments/{id}:
 *   get:
 *     summary: Get tournament by ID
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tournament retrieved successfully
 */
router.get("/:id", tournamentsController.getTournamentById);

/**
 * @swagger
 * /tournaments/{id}/join:
 *   post:
 *     summary: Join tournament
 *     tags: [Tournaments]
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
 *         description: Joined tournament successfully
 */
router.post("/:id/join", authenticate, tournamentsController.joinTournament);

module.exports = router;
