const express = require("express");
const {
  getAllRatings,
  getRatingsForCar,
  getRatingsForProvider,
  getMyRatings,
  createRating,
  updateRating,
  deleteRating,
} = require("../controllers/ratingController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });


/**
 * @swagger
 * components:
 *   schemas:
 *     Rating:
 *       type: object
 *       required:
 *         - rent_info
 *         - car_rating
 *         - review
 *       properties:
 *         rent_info:
 *           type: string
 *           description: Rent ID
 *         car_info:
 *           type: string
 *           description: Car ID
 *         provider_info:
 *           type: string
 *           description: Provider ID
 *         user_info:
 *           type: string
 *           description: User ID
 *         car_rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           example: 4
 *         provider_rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           example: 5
 *         review:
 *           type: string
 *           maxLength: 500
 *           example: "Great car and friendly service"
 *         isEdited:
 *           type: boolean
 *           default: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/ratings/all:
 *   get:
 *     summary: Get all ratings (Admin only)
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all ratings
 *   post:
 *     summary: Create a new rating (User only)
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Rating'
 *     responses:
 *       201:
 *         description: Rating created successfully
 */

/**
 * @swagger
 * /api/v1/ratings/me:
 *   get:
 *     summary: Get my ratings
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of ratings by the logged-in user
 */

/**
 * @swagger
 * /api/v1/cars/{carId}/ratings:
 *   get:
 *     summary: Get ratings for a specific car
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: carId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the car
 *     responses:
 *       200:
 *         description: List of ratings for the car
 */


/**
 * @swagger
 * /api/v1/ratings/{id}:
 *   put:
 *     summary: Update a rating
 *     tags: [Ratings]
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
 *             type: object
 *             properties:
 *               car_rating:
 *                 type: integer
 *                 example: 4
 *               provider_rating:
 *                 type: integer
 *                 example: 5
 *               review:
 *                 type: string
 *                 example: "Updated review"
 *     responses:
 *       200:
 *         description: Rating updated successfully
 *   delete:
 *     summary: Delete a rating
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the rating
 *     responses:
 *       200:
 *         description: Rating deleted successfully
 */


router
  .route("/")
  .get((req, res, next) => {
    if (req.params.carId) return getRatingsForCar(req, res, next);
    if (req.params.providerId) return getRatingsForProvider(req, res, next);
  })
  .post(protect, authorize("user", "admin"), createRating);

router.route("/all").get(protect, authorize("admin"), getAllRatings);

router
  .route("/:id")
  .put(protect, authorize("user", "admin"), updateRating)
  .delete(protect, authorize("user", "admin"), deleteRating);

router.route("/me").get(protect, authorize("user", "admin"), getMyRatings);

module.exports = router;



