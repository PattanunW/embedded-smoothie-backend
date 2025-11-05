const express = require('express');
const {getAuditLogs, getAuditLog} = require('../controllers/auditLogController');
const {protect, authorize} = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, authorize('admin'), getAuditLogs);
router.route('/:id').get(protect, authorize('admin'), getAuditLog);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: AuditLogs
 *   description: Audit Log Management (Admin Only)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AuditLog:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId of the audit log
 *           example: 662b8c3fb3d2d2454f0eeb6b
 *         action:
 *           type: string
 *           description: Action that was performed
 *           example: Login
 *         user_id:
 *           type: string
 *           description: ID of the user who performed the action
 *           example: 662b8c3fb3d2d2454f0eeb6c
 *         target:
 *           type: string
 *           description: Target entity of the action
 *           example: users
 *         target_id:
 *           type: string
 *           description: ID of the target entity
 *           example: 662b8c3fb3d2d2454f0eeb6d
 *         timeStamp:
 *           type: string
 *           format: date-time
 *           description: Time when the action was logged
 *           example: "2025-04-26T14:32:45.123Z"
 *         description:
 *           type: string
 *           description: Detailed description of the action
 *           example: User id 662b8c3fb3d2d2454f0eeb6c logged in as admin
 */

/**
 * @swagger
 * /api/v1/auditlogs:
 *   get:
 *     summary: Get all audit logs (Admin only)
 *     tags: [AuditLogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved audit logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AuditLog'
 */

/**
 * @swagger
 * /api/v1/auditlogs/{id}:
 *   get:
 *     summary: Get a specific audit log by ID (Admin only)
 *     tags: [AuditLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the audit log
 *     responses:
 *       200:
 *         description: Successfully retrieved the audit log
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AuditLog'
 *       404:
 *         description: Audit log not found
 */
