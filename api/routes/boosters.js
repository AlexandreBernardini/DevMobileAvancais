const express = require("express");
const router = express.Router();
const boostersController = require("../controllers/boostersController");
const { authenticate } = require("../middleware/auth");

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
