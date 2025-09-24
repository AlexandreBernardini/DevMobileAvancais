const express = require("express");
const router = express.Router();
const boostersController = require("../controllers/boostersController");
const { authenticate, authorize } = require("../middleware/auth");
const { validate, createBoosterSchema } = require("../middleware/validation");

/**
 * @swagger
 * components:
 *   schemas:
 *     BoosterPack:
 *       type: object
 *       required:
 *         - packId
 *         - priceCoins
 *         - packImage
 *         - setId
 *       properties:
 *         packId:
 *           type: string
 *         packType:
 *           type: string
 *           enum: [Standard, Premium, Legendary, Special]
 *         priceCoins:
 *           type: integer
 *           minimum: 0
 *         priceGems:
 *           type: integer
 *           minimum: 0
 *         cardsCount:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *         foilChance:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *         bonusCardChance:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *         guaranteedElement:
 *           type: string
 *           enum: [Fire, Water, Earth, Air, Lightning, Dark, Light, Neutral]
 *         packImage:
 *           type: string
 *           format: uri
 *         openingAnimation:
 *           type: string
 *           format: uri
 *         isActive:
 *           type: boolean
 *         isLimited:
 *           type: boolean
 *         limitedQuantity:
 *           type: integer
 *           minimum: 1
 *         availableFrom:
 *           type: string
 *           format: date-time
 *         availableUntil:
 *           type: string
 *           format: date-time
 *         setId:
 *           type: string
 *         guaranteedRarities:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               rarity:
 *                 type: string
 *                 enum: [Common, Uncommon, Rare, Epic, Legendary, Mythic]
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 */

/**
 * @swagger
 * /boosters:
 *   post:
 *     summary: Create a new booster pack (Admin only)
 *     tags: [Boosters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BoosterPack'
 *     responses:
 *       201:
 *         description: Booster pack created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post(
    "/",
    authenticate,
    authorize("admin"),
    validate(createBoosterSchema),
    boostersController.createBooster
);

/**
 * @swagger
 * /boosters:
 *   get:
 *     summary: Get available booster packs
 *     tags: [Boosters]
 *     responses:
 *       200:
 *         description: Booster packs retrieved successfully
 */
router.get("/", authenticate, boostersController.getUserBoosters);

/**
 * @swagger
 * /boosters/{id}/purchase:
 *   post:
 *     summary: Purchase booster pack
 *     tags: [Boosters]
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
 *         description: Booster pack purchased successfully
 */
router.post("/:id/purchase", authenticate, boostersController.purchaseBoosters);

module.exports = router;
