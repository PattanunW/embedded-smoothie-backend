const express = require("express");
const {
  getRents,
  getRent,
  createRent,
  updateRent,
  deleteRent,
  finishRent,
} = require("../controllers/rentController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * components:
 *   schemas:
 *     Rent:
 *       type: object
 *       required:
 *         - car_info
 *         - user_info
 *         - startDate
 *         - endDate
 *         - totalDays
 *         - totalPrice
 *       properties:
 *         car_info:
 *           type: string
 *           description: Car ID
 *         user_info:
 *           type: string
 *           description: User ID
 *         iDate:
 *           type: string
 *           format: date
 *           description: "Issue date (YYYY-MM-DD)"
 *         startDate:
 *           type: string
 *           format: date
 *           description: "Rental start date (YYYY-MM-DD)"
 *         endDate:
 *           type: string
 *           format: date
 *           description: "Rental end date (YYYY-MM-DD)"
 *         totalDays:
 *           type: number
 *           description: Total number of rental days
 *         totalPrice:
 *           type: number
 *           description: Total rental price after discount
 *         couponName:
 *           type: string
 *           description: Name of applied coupon
 *         discount:
 *           type: number
 *           description: Discount percentage
 *         maxDiscount:
 *           type: number
 *           description: Maximum discount amount
 *         status:
 *           type: string
 *           enum: [Confirmed, Finished]
 *           description: Status of rent
 *         inclusionForCalculation:
 *           type: string
 *           enum: [Included, Excluded]
 *           description: Whether included in yearly calculations
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/rents:
 *   get:
 *     summary: Get all rents (admin can see all, user sees own)
 *     tags: [Rents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of rents
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/cars/{carId}/rents:
 *   post:
 *     summary: Create a new rent (Admin or User)
 *     tags: [Rents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: carId
 *         required: true
 *         schema:
 *           type: string
 *         description: Car ID to rent
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Rent'
 *     responses:
 *       201:
 *         description: Rent created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/rents/{id}:
 *   get:
 *     summary: Get a single rent (Admin can view all, User can view own)
 *     tags: [Rents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rent ID
 *     responses:
 *       200:
 *         description: Rent retrieved successfully
 *       403:
 *         description: Forbidden (Not owner)
 *       404:
 *         description: Rent not found
 * 
 *   put:
 *     summary: Update rent (Admin or Rent Owner)
 *     tags: [Rents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rent ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Rent'
 *     responses:
 *       200:
 *         description: Rent updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not owner)
 *       404:
 *         description: Rent not found
 * 
 *   delete:
 *     summary: Delete rent (Admin or Rent Owner)
 *     tags: [Rents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rent ID
 *     responses:
 *       200:
 *         description: Rent deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not owner)
 *       404:
 *         description: Rent not found
 */

/**
 * @swagger
 * /api/v1/rents/finish/{id}:
 *   put:
 *     summary: Mark rent as finished (Admin only)
 *     tags: [Rents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rent ID
 *     responses:
 *       200:
 *         description: Rent status updated to finished
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not admin)
 *       404:
 *         description: Rent not found
 */


router
  .route("/")
  .get(protect, getRents)
  .post(protect, authorize("admin", "user"), createRent);

router
  .route("/:id")
  .get(protect, getRent)
  .put(protect, authorize("admin", "user"), updateRent)
  .delete(protect, authorize("admin", "user"), deleteRent);

router.route("/finish/:id").put(protect, authorize("admin"), finishRent);

module.exports = router;
