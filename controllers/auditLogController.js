import { db } from "../config/firebaseAdmin.js";

const auditLogsRef = db.ref("auditLogs");

// Get all audit logs
export const getAuditLogs = async (req, res) => {
  try {
    const snapshot = await auditLogsRef.once("value");
    const logs = snapshot.val() || {};
    const logsArray = Object.entries(logs).map(([id, log]) => ({ id, ...log }));
    res.status(200).json({ success: true, data: logsArray });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: "Cannot get audit logs" });
  }
};

// Get a single audit log by ID
export const getAuditLog = async (req, res) => {
  try {
    const snapshot = await auditLogsRef.child(req.params.id).once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ success: false, message: `Audit log with ID ${req.params.id} does not exist` });
    }
    res.status(200).json({ success: true, data: { id: req.params.id, ...snapshot.val() } });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: "Cannot get audit log" });
  }
};
