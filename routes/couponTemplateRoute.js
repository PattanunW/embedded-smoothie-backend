const express = require("express");
const {
  getAllCouponTemplates,
  createCouponTemplate,
  updateCouponTemplate,
  deleteCouponTemplate,
} = require("../controllers/couponTemplateController");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(getAllCouponTemplates)
  .post(protect, authorize("admin"), createCouponTemplate);

router
  .route("/:id")
  .put(protect, authorize("admin"), updateCouponTemplate)
  .delete(protect, authorize("admin"), deleteCouponTemplate);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     CouponTemplate:
 *       type: object
 *       required:
 *         - percentage
 *         - name
 *         - maxDiscount
 *         - minSpend
 *         - spent
 *         - valid
 *       properties:
 *         percentage:
 *           type: number
 *           description: Discount percentage
 *         name:
 *           type: string
 *           description: Coupon template name
 *         maxDiscount:
 *           type: number
 *           description: Maximum discount amount
 *         minSpend:
 *           type: number
 *           description: Minimum spending required to use the coupon
 *         spent:
 *           type: number
 *           description: Amount already spent toward qualification
 *         valid:
 *           type: number
 *           description: Validity period in days
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/coupon-templates:
 *   get:
 *     summary: Get all coupon templates
 *     tags: [CouponTemplates]
 *     responses:
 *       200:
 *         description: List of all coupon templates
 *
 *   post:
 *     summary: Create a new coupon template (Admin only)
 *     tags: [CouponTemplates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CouponTemplate'
 *     responses:
 *       201:
 *         description: Coupon template created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not admin)
 */

/**
 * @swagger
 * /api/v1/coupon-templates/{id}:
 *   put:
 *     summary: Update a coupon template by ID (Admin only)
 *     tags: [CouponTemplates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: CouponTemplate ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CouponTemplate'
 *     responses:
 *       200:
 *         description: Coupon template updated successfully
 *       404:
 *         description: Coupon template not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not admin)
 *
 *   delete:
 *     summary: Delete a coupon template by ID (Admin only)
 *     tags: [CouponTemplates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: CouponTemplate ID
 *     responses:
 *       200:
 *         description: Coupon template deleted successfully
 *       404:
 *         description: Coupon template not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not admin)
 */

