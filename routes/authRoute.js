const express = require("express");
const {
  register,
  login,
  getMe,
  logout,
  updateDetails,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
// console.log('Auth routes loaded');

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/updatedetails", protect, updateDetails);

module.exports = router;
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId of the user
 *           example: 662b8c3fb3d2d2454f0eeb6b
 *         name:
 *           type: string
 *           description: Name of the user
 *           example: John Doe
 *         tel:
 *           type: string
 *           description: Telephone number of the user
 *           example: "0812345678"
 *         email:
 *           type: string
 *           description: Email address of the user
 *           example: johndoe@example.com
 *         role:
 *           type: string
 *           enum:
 *             - user
 *             - admin
 *           description: Role of the user
 *           example: user
 *         totalPayment:
 *           type: number
 *           description: Total payment made by the user
 *           example: 25000
 *         totalPaymentThisYear:
 *           type: number
 *           description: Total payment made by the user this year
 *           example: 15000
 *         redeemCouponStatus:
 *           type: array
 *           description: Status of redeemed coupons
 *           items:
 *             type: boolean
 *           example: [true, false, false, true]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the user was created
 *           example: "2025-04-26T14:32:45.123Z"
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and profile management
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - tel
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               tel:
 *                 type: string
 *                 example: "0812345678"
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 example: user
 *     responses:
 *       201:
 *         description: User registered successfully
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user and return JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: User logged in successfully
 */

/**
 * @swagger
 * /api/v1/auth/logout:
 *   get:
 *     summary: Logout user (clear JWT cookie)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully
 */

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 */

/**
 * @swagger
 * /api/v1/auth/updatedetails:
 *   put:
 *     summary: Update user coupon status
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: New Name
 *               tel:
 *                 type: string
 *                 example: "0898765432"
 *               redeemCouponStatus:
 *                 type: array
 *                 items:
 *                   type: boolean
 *                 example: [true, false, false, false]
 *     responses:
 *       200:
 *         description: User details updated successfully
 */

