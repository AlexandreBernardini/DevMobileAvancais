const express = require("express");
const router = express.Router();
const decksController = require("../controllers/decksController");
const { authenticate, authorizeOwnerOrAdmin } = require("../middleware/auth");
const { validate, createDeckSchema } = require("../middleware/validation");

/**
 * @swagger
 * /decks:
 *   post:
 *     summary: Create a new deck
 *     tags: [Decks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Deck created successfully
 */
router.post(
    "/",
    authenticate,
    validate(createDeckSchema),
    decksController.createDeck
);

/**
 * @swagger
 * /decks/{id}:
 *   get:
 *     summary: Get deck by ID
 *     tags: [Decks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deck retrieved successfully
 */
router.get("/:id", decksController.getDeckById);

/**
 * @swagger
 * /decks/{id}:
 *   put:
 *     summary: Update deck
 *     tags: [Decks]
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
 *         description: Deck updated successfully
 */
router.put("/:id", authenticate, decksController.updateDeck);

/**
 * @swagger
 * /decks/{id}:
 *   delete:
 *     summary: Delete deck
 *     tags: [Decks]
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
 *         description: Deck deleted successfully
 */
router.delete("/:id", authenticate, decksController.deleteDeck);

/**
 * @swagger
 * /decks/public:
 *   get:
 *     summary: Get public decks
 *     tags: [Decks]
 *     responses:
 *       200:
 *         description: Public decks retrieved successfully
 */
router.get("/public", decksController.getPublicDecks);

module.exports = router;
