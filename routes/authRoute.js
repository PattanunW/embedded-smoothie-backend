import express from "express";
import {
  register,
  login,
  getMe,
  logout,
  updateDetails,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js"; // ensure this middleware works with Firebase

const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.get("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/updatedetails", protect, updateDetails);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Firebase key of the user
 *           example: abc123xyz
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
