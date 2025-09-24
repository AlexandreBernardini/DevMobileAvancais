const express = require("express");
const router = express.Router();
const charactersController = require("../controllers/charactersController");
const { authenticate, authorize } = require("../middleware/auth");
const { validate, createCharacterSchema } = require("../middleware/validation");

/**
 * @swagger
 * components:
 *   schemas:
 *     Character:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - rarity
 *         - element
 *         - characterClass
 *         - health
 *         - attack
 *         - defense
 *         - speed
 *         - manaCost
 *         - cardImage
 *         - cardNumber
 *         - setId
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         rarity:
 *           type: string
 *           enum: [Common, Uncommon, Rare, Epic, Legendary, Mythic]
 *         element:
 *           type: string
 *           enum: [Fire, Water, Earth, Air, Lightning, Dark, Light, Neutral]
 *         characterClass:
 *           type: string
 *           enum: [Warrior, Mage, Archer, Assassin, Healer, Tank, Support]
 *         health:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *         attack:
 *           type: integer
 *           minimum: 1
 *           maximum: 150
 *         defense:
 *           type: integer
 *           minimum: 0
 *           maximum: 150
 *         speed:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *         manaCost:
 *           type: integer
 *           minimum: 0
 *           maximum: 10
 *         cardImage:
 *           type: string
 *           format: uri
 *         fullArtwork:
 *           type: string
 *           format: uri
 *         lore:
 *           type: string
 *         cardNumber:
 *           type: string
 *         isEvolution:
 *           type: boolean
 *         evolutionLevel:
 *           type: integer
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         setId:
 *           type: string
 *         addToMyCollection:
 *           type: boolean
 *           description: Optional - if true, the character will be added to the authenticated user's collection
 *         obtainedFrom:
 *           type: string
 *           enum: [Booster, Trade, Reward, Purchase, Event, Starter, Admin]
 *           description: How the card was obtained (used when addToMyCollection is true)
 *         abilities:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Ability'
 *     Ability:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         damage:
 *           type: integer
 *         type:
 *           type: string
 *           enum: [Attack, Defense, Heal, Buff, Debuff, Special]
 */

/**
 * @swagger
 * /characters:
 *   get:
 *     summary: Get all characters with filters and pagination
 *     tags: [Characters]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: rarity
 *         schema:
 *           type: string
 *           enum: [Common, Uncommon, Rare, Epic, Legendary, Mythic]
 *       - in: query
 *         name: element
 *         schema:
 *           type: string
 *           enum: [Fire, Water, Earth, Air, Lightning, Dark, Light, Neutral]
 *       - in: query
 *         name: characterClass
 *         schema:
 *           type: string
 *           enum: [Warrior, Mage, Archer, Assassin, Healer, Tank, Support]
 *       - in: query
 *         name: setId
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, rarity, element, attack, health, releaseDate]
 *           default: name
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *     responses:
 *       200:
 *         description: Characters retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Character'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get("/", charactersController.getCharacters);

/**
 * @swagger
 * /characters/{id}:
 *   get:
 *     summary: Get character by ID
 *     tags: [Characters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Character retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Character'
 *       404:
 *         description: Character not found
 */
router.get("/:id", charactersController.getCharacterById);

/**
 * @swagger
 * /characters:
 *   post:
 *     summary: Create a new character (Admin only)
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Character'
 *     responses:
 *       201:
 *         description: Character created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post(
    "/",
    authenticate,
    authorize("admin"),
    validate(createCharacterSchema),
    charactersController.createCharacter
);

/**
 * @swagger
 * /characters/{id}:
 *   put:
 *     summary: Update character (Admin only)
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Character'
 *     responses:
 *       200:
 *         description: Character updated successfully
 *       404:
 *         description: Character not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.put(
    "/:id",
    authenticate,
    authorize("admin"),
    charactersController.updateCharacter
);

/**
 * @swagger
 * /characters/{id}:
 *   delete:
 *     summary: Delete character (Admin only)
 *     tags: [Characters]
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
 *         description: Character deleted successfully
 *       404:
 *         description: Character not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    charactersController.deleteCharacter
);

/**
 * @swagger
 * /characters/stats:
 *   get:
 *     summary: Get character statistics
 *     tags: [Characters]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get("/stats", charactersController.getCharacterStats);

module.exports = router;
