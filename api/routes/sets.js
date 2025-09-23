const express = require("express");
const router = express.Router();
const setsController = require("../controllers/setsController");
const { authenticate, authorize } = require("../middleware/auth");

/**
 * @swagger
 * components:
 *   schemas:
 *     Set:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         code:
 *           type: string
 *         description:
 *           type: string
 *         theme:
 *           type: string
 *         totalCards:
 *           type: integer
 *         setIcon:
 *           type: string
 *         setSymbol:
 *           type: string
 *         releaseDate:
 *           type: string
 *           format: date-time
 *         isActive:
 *           type: boolean
 *         boosterPrice:
 *           type: integer
 */

/**
 * @swagger
 * /sets:
 *   get:
 *     summary: Get all sets
 *     tags: [Sets]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Sets retrieved successfully
 */
router.get("/", setsController.getSets);

/**
 * @swagger
 * /sets/{id}:
 *   get:
 *     summary: Get set by ID
 *     tags: [Sets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Set retrieved successfully
 *       404:
 *         description: Set not found
 */
router.get("/:id", setsController.getSetById);

/**
 * @swagger
 * /sets/{id}/characters:
 *   get:
 *     summary: Get characters in a set
 *     tags: [Sets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Characters retrieved successfully
 */
router.get("/:id/characters", setsController.getSetCharacters);

/**
 * @swagger
 * /sets:
 *   post:
 *     summary: Create a new set (Admin only)
 *     tags: [Sets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Set created successfully
 */
router.post("/", authenticate, authorize("admin"), setsController.createSet);

/**
 * @swagger
 * /sets/{id}:
 *   put:
 *     summary: Update set (Admin only)
 *     tags: [Sets]
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
 *         description: Set updated successfully
 */
router.put("/:id", authenticate, authorize("admin"), setsController.updateSet);

module.exports = router;
