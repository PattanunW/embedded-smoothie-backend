import { db } from "../config/firebaseAdmin.js";

/**
 * Create a new audit log
 * @param {Object} logData
 * @param {string} logData.action - Action performed
 * @param {string} logData.user_id - ID of the user performing the action
 * @param {string} logData.target - Target entity
 * @param {string} logData.target_id - ID of the target entity
 * @param {string} [logData.description] - Description of the action
 * @returns {Object} Newly created audit log
 */
export const createAuditLog = async ({
  action,
  user_id,
  target,
  target_id,
  description = "",
}) => {
  const newLogRef = db.ref("auditLogs").push();
  const log = {
    id: newLogRef.key,
    action,
    user_id,
    target,
    target_id,
    description,
    timeStamp: new Date().toISOString(),
  };
  await newLogRef.set(log);
  return log;
};

/**
 * Get all audit logs
 * @returns {Array} Array of audit logs
 */
export const getAuditLogs = async () => {
  const snapshot = await db.ref("auditLogs").once("value");
  const data = snapshot.val() || {};
  return Object.keys(data).map((key) => ({ id: key, ...data[key] }));
};

/**
 * Get a single audit log by ID
 * @param {string} id - Audit log ID
 * @returns {Object|null} Audit log or null if not found
 */
export const getAuditLogById = async (id) => {
  const snapshot = await db.ref(`auditLogs/${id}`).once("value");
  return snapshot.exists() ? { id, ...snapshot.val() } : null;
};

/**
 * Delete an audit log by ID
 * @param {string} id - Audit log ID
 * @returns {boolean} True if deleted
 */
export const deleteAuditLog = async (id) => {
  const logRef = db.ref(`auditLogs/${id}`);
  const snapshot = await logRef.once("value");
  if (!snapshot.exists()) throw new Error("Audit log not found");

  await logRef.remove();
  return true;
};
