const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const {
    authenticate,
    authorize,
    authorizeOwnerOrAdmin,
} = require("../middleware/auth");
const { validate, updateProfileSchema } = require("../middleware/validation");

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *                 maxLength: 30
 *               bio:
 *                 type: string
 *                 maxLength: 200
 *               showProfile:
 *                 type: boolean
 *               showCollection:
 *                 type: boolean
 *               allowFriendRequests:
 *                 type: boolean
 *               notificationsEnabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put(
    "/profile",
    authenticate,
    validate(updateProfileSchema),
    usersController.updateProfile
);

/**
 * @swagger
 * /users/{userId}/collection:
 *   get:
 *     summary: Get user's card collection
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
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
 *       - in: query
 *         name: rarity
 *         schema:
 *           type: string
 *       - in: query
 *         name: element
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collection retrieved successfully
 */
router.get("/:userId/collection", usersController.getUserCollection);

/**
 * @swagger
 * /users/{userId}/decks:
 *   get:
 *     summary: Get user's decks
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Decks retrieved successfully
 */
router.get("/:userId/decks", usersController.getUserDecks);

/**
 * @swagger
 * /users/{userId}/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get("/:userId/stats", usersController.getUserStats);

/**
 * @swagger
 * /users/leaderboard:
 *   get:
 *     summary: Get leaderboard
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [ranking, wins, level]
 *           default: ranking
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
 */
router.get("/leaderboard", usersController.getLeaderboard);

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Search users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Users found
 */
router.get("/search", usersController.searchUsers);

/**
 * @swagger
 * /users/{userId}/friends:
 *   get:
 *     summary: Get user friends
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friends retrieved successfully
 */
router.get(
    "/:userId/friends",
    authenticate,
    authorizeOwnerOrAdmin(),
    usersController.getFriends
);

/**
 * @swagger
 * /users/friends/request:
 *   post:
 *     summary: Send friend request
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - friendId
 *             properties:
 *               friendId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Friend request sent
 */
router.post(
    "/friends/request",
    authenticate,
    usersController.sendFriendRequest
);

/**
 * @swagger
 * /users/friends/{friendshipId}/accept:
 *   post:
 *     summary: Accept friend request
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendshipId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friend request accepted
 */
router.post(
    "/friends/:friendshipId/accept",
    authenticate,
    usersController.acceptFriendRequest
);

/**
 * @swagger
 * /users/{userId}/promote:
 *   post:
 *     summary: Promote user to admin (Authenticated users only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to promote
 *     responses:
 *       200:
 *         description: User promoted to admin successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     displayName:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [admin]
 *       400:
 *         description: Bad request (user already admin, inactive user, etc.)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.post(
    "/:userId/promote",
    authenticate,
    usersController.promoteToAdmin
);

/**
 * @swagger
 * /users/{userId}/demote:
 *   post:
 *     summary: Demote admin to user (Authenticated users only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the admin user to demote
 *     responses:
 *       200:
 *         description: Admin demoted to user successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     displayName:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [user]
 *       400:
 *         description: Bad request (user is not admin, etc.)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.post(
    "/:userId/demote",
    authenticate,
    usersController.demoteFromAdmin
);

module.exports = router;
