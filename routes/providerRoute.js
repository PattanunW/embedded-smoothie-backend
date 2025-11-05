const express = require("express");
const {
  getProviders,
  getProvider,
  createProvider,
  updateProvider,
  deleteProvider,
} = require("../controllers/providerController");
const { protect, authorize } = require("../middleware/auth");

const ratingRouter = require("./ratingRoute");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Provider:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - tel
 *         - email
 *         - picture
 *         - openTime
 *         - closeTime
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the provider
 *         address:
 *           type: string
 *           description: Address of the provider
 *         tel:
 *           type: string
 *           description: Telephone number of the provider
 *         email:
 *           type: string
 *           format: email
 *           description: Email of the provider (must be unique)
 *         picture:
 *           type: string
 *           description: URL of the provider's picture
 *         openTime:
 *           type: string
 *           description: "Opening time (format: HH:MM:SS)"
 *         closeTime:
 *           type: string
 *           description: "Closing time (format: HH:MM:SS)"
 *         averageRating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Average user rating for the provider
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/providers:
 *   get:
 *     summary: Get all providers
 *     tags: [Providers]
 *     responses:
 *       200:
 *         description: List of all providers
 * 
 *   post:
 *     summary: Create a new provider (Admin only)
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Provider'
 *     responses:
 *       201:
 *         description: Provider created successfully
 *       400:
 *         description: Duplicate email or invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not admin)
 */

/**
 * @swagger
 * /api/v1/providers/{id}:
 *   get:
 *     summary: Get a single provider by ID
 *     tags: [Providers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Provider ID
 *     responses:
 *       200:
 *         description: Provider retrieved successfully
 *       404:
 *         description: Provider not found
 * 
 *   put:
 *     summary: Update a provider by ID (Admin only)
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Provider ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Provider'
 *     responses:
 *       200:
 *         description: Provider updated successfully
 *       400:
 *         description: Duplicate email or validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not admin)
 *       404:
 *         description: Provider not found
 * 
 *   delete:
 *     summary: Delete a provider by ID (Admin only)
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Provider ID
 *     responses:
 *       200:
 *         description: Provider and associated cars and rents deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not admin)
 *       404:
 *         description: Provider not found
 */


router.use("/:providerId/ratings", ratingRouter);

router
  .route("/")
  .get(getProviders)
  .post(protect, authorize("admin"), createProvider);
router
  .route("/:id")
  .get(getProvider)
  .put(protect, authorize("admin"), updateProvider)
  .delete(protect, authorize("admin"), deleteProvider);
module.exports = router;
