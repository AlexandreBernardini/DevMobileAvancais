const express = require("express");
const router = express.Router();
const tradesController = require("../controllers/tradesController");
const { authenticate } = require("../middleware/auth");
const { validate, createTradeSchema } = require("../middleware/validation");

/**
 * @swagger
 * /trades:
 *   post:
 *     summary: Create a new trade
 *     tags: [Trades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Trade created successfully
 */
router.post(
    "/",
    authenticate,
    validate(createTradeSchema),
    tradesController.createTrade
);

/**
 * @swagger
 * /trades:
 *   get:
 *     summary: Get user's trades
 *     tags: [Trades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trades retrieved successfully
 */
router.get("/", authenticate, tradesController.getUserTrades);

/**
 * @swagger
 * /trades/{id}/accept:
 *   post:
 *     summary: Accept trade
 *     tags: [Trades]
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
 *         description: Trade accepted successfully
 */
router.post("/:id/accept", authenticate, tradesController.acceptTrade);

module.exports = router;
