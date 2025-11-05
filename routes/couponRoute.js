const express = require("express");
const {
  getAllCoupons,
  getOneCoupon,
  getMyCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  deleteExpiredCoupons,
} = require("../controllers/couponController");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });
/**
 * @swagger
 * components:
 *   schemas:
 *     Coupon:
 *       type: object
 *       required:
 *         - user_info
 *         - percentage
 *         - name
 *         - maxDiscount
 *         - minSpend
 *         - expirationDate
 *       properties:
 *         user_info:
 *           type: string
 *           description: MongoDB ObjectId of the user
 *           example: "60f6a9b0d5a4f3093c1c4f2b"
 *         percentage:
 *           type: number
 *           example: 20
 *         name:
 *           type: string
 *           example: "SPRING20"
 *         maxDiscount:
 *           type: number
 *           example: 50
 *         minSpend:
 *           type: number
 *           example: 100
 *         expirationDate:
 *           type: string
 *           format: date
 *           example: "2025-05-01"
 *         status:
 *           type: string
 *           enum: [Available, Used, Expired]
 *           example: "Available"
 */

router
  .route("/")
  .get(protect, authorize("admin"), getAllCoupons)
  .post(protect, authorize("admin", "user"), createCoupon);

router.route("/user").get(protect, getMyCoupons);
router
  .route("/expired")
  .delete(protect, authorize("admin"), deleteExpiredCoupons);

router
  .route("/:id")
  .get(protect, authorize("admin"), getOneCoupon)
  .put(protect, authorize("admin", "user"), updateCoupon)
  .delete(protect, authorize("admin", "user"), deleteCoupon);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login to receive JWT token
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
 *                 example: user5@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login success with token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */

/**
 * @swagger
 * /api/v1/coupons:
 *   get:
 *     summary: Get all coupons (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of coupons
 *
 *   post:
 *     summary: Redeem a new coupon (User)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/models/Coupondel.js'
 *     responses:
 *       201:
 *         description: Coupon created
 */
/**
 * @swagger
 * /api/v1/coupons/user:
 *   get:
 *     summary: Get coupons for the logged-in user
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's coupons
 */
/**
 * @swagger
 * /api/v1/coupons/expired:
 *   delete:
 *     summary: Delete all expired coupons (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expired coupons deleted
 */
/**
 * @swagger
 * /api/v1/coupons/{id}:
 *   get:
 *     summary: Get a single coupon by ID (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coupon ID
 *     responses:
 *       200:
 *         description: Coupon details

 *   delete:
 *     summary: Delete a coupon by ID (Admin, User)
 *     tags: [Coupons]
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
 *         description: Coupon deleted
 */

module.exports = router;
