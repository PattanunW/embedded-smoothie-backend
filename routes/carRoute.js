const express = require("express");
const {
  getCars,
  getCar,
  createCar,
  updateCar,
  deleteCar,
} = require("../controllers/carController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Car:
 *       type: object
 *       required:
 *         - name
 *         - vin_plate
 *         - provider_info
 *         - picture
 *         - capacity
 *         - description
 *         - pricePerDay
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the car
 *         vin_plate:
 *           type: string
 *           description: Vehicle identification number or plate number (must be unique)
 *         provider_info:
 *           type: string
 *           description: Provider ID associated with the car
 *         picture:
 *           type: string
 *           description: URL of the car picture
 *         capacity:
 *           type: integer
 *           description: Number of passengers the car can accommodate
 *         description:
 *           type: string
 *           description: Description of the car
 *         pricePerDay:
 *           type: number
 *           description: Rental price per day for the car
 *         averageRating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Average user rating for the car
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/cars:
 *   get:
 *     summary: Get all cars
 *     tags: [Cars]
 *     parameters:
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: Fields to select (e.g., "name,pricePerDay")
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Fields to sort (e.g., "pricePerDay,-name")
 *     responses:
 *       200:
 *         description: List of all cars
 * 
 *   post:
 *     summary: Create a new car (Admin only)
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Car'
 *     responses:
 *       201:
 *         description: Car created successfully
 *       400:
 *         description: Failed to create car (e.g., duplicate VIN plate)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not admin)
 */


/**
 * @swagger
 * /api/v1/cars/{id}:
 *   get:
 *     summary: Get a single car by ID
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Car ID
 *     responses:
 *       200:
 *         description: Car retrieved successfully
 *       404:
 *         description: Car not found
 * 
 *   put:
 *     summary: Update a car by ID (Admin only)
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Car ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Car'
 *     responses:
 *       200:
 *         description: Car updated successfully
 *       400:
 *         description: Error updating car
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not admin)
 *       404:
 *         description: Car not found
 * 
 *   delete:
 *     summary: Delete a car by ID (Admin only)
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Car ID
 *     responses:
 *       200:
 *         description: Car deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not admin)
 *       404:
 *         description: Car not found
 */



router.use("/:carId/rents", rentRouter);
router.use("/:carId/ratings", ratingRouter);

router.route("/").get(getCars).post(protect, authorize("admin"), createCar);
router
  .route("/:id")
  .get(getCar)
  .put(protect, authorize("admin"), updateCar)
  .delete(protect, authorize("admin"), deleteCar);
module.exports = router;
