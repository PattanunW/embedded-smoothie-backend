import express from "express";
import {
  getPlants,
  getPlant,
  createPlant,
  deletePlant,
  updatePlant,
} from "../controllers/plantController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Plant:
 *       type: object
 *       required:
 *         - name
 *         - species
 *         - date
 *         - temperature
 *         - humidity
 *         - soil
 *         - sunlight
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the plant
 *         species:
 *           type: string
 *           description: Species of the plant
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date of the plant
 *         temperature:
 *           type: number
 *           description: Temperature in Celsius
 *         humidity:
 *           type: number
 *           description: Percentage of humidity
 *         soil:
 *           type: string
 *           description: Soil type
 *         sunlight:
 *           type: number
 *           description: Percentage of sunlight
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/plants:
 *   get:
 *     summary: Get all plants
 *     tags: [Plants]
 *     responses:
 *       200:
 *         description: List of all plants
 *   post:
 *     summary: Create a new plant (Admin only)
 *     tags: [Plants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Plant'
 *     responses:
 *       201:
 *         description: Plant created successfully
 */

/**
 * @swagger
 * /api/v1/plants/{id}:
 *   get:
 *     summary: Get a single plant by ID
 *     tags: [Plants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plant retrieved successfully
 *       404:
 *         description: Plant not found
 *   put:
 *     summary: Update a plant by ID (Admin only)
 *     tags: [Plants]
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
 *             $ref: '#/components/schemas/Plant'
 *     responses:
 *       200:
 *         description: Plant updated successfully
 *   delete:
 *     summary: Delete a plant by ID (Admin only)
 *     tags: [Plants]
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
 *         description: Plant deleted successfully
 */


router.route("/").get(getPlants).post(protect, createPlant);
router
  .route("/:id")
  .get(getPlant)
  .put(protect, updatePlant)
  .delete(protect, deletePlant);

export default router;
