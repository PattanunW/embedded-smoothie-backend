import { db } from "../config/firebaseAdmin.js";

const plantsRef = db.ref("plants");
const auditLogsRef = db.ref("auditLogs");

// @desc    Get all plants
// @route   GET /api/v1/plants
export const getPlants = async (req, res) => {
  try {
    const snapshot = await plantsRef.once("value");
    const plants = snapshot.val() || {};
    const plantsArray = Object.entries(plants).map(([id, data]) => ({ id, ...data }));
    res.status(200).json({ success: true, data: plantsArray });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: "Cannot get plants" });
  }
};

// @desc    Get a single plant
// @route   GET /api/v1/plants/:id
export const getPlant = async (req, res) => {
  try {
    const snapshot = await plantsRef.child(req.params.id).once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ success: false, message: `Plant with ID ${req.params.id} does not exist` });
    }
    res.status(200).json({ success: true, data: { id: req.params.id, ...snapshot.val() } });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: "Cannot get a car" });
  }
};

// @desc    Create a plant
// @route   POST /api/v1/plants
export const createPlant = async (req, res) => {
  try {
    req.body.picture = req.body.picture?.replace(/&amp;/g, "&") || "";

    const snapshot = await plantsRef.once("value");
    const plant = snapshot.val() || {};
    const duplicate = Object.values(plant).find(c => c.vin_plate === req.body.vin_plate);
    if (duplicate) {
      return res.status(400).json({ success: false, message: `Plant with VIN ${req.body.vin_plate} already exists` });
    }

    const newPlantRef = plantsRef.push();
    const plantData = { ...req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await newPlantRef.set(plantData);

    // Audit log
    await auditLogsRef.push({
      action: "Create",
      user_id: req.user?.id || null,
      target: "plants",
      target_id: newPlantRef.key,
      description: `Created plant id ${newPlantRef.key}`,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({ success: true, id: newCarRef.key, data: carData });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: "Cannot create a plant" });
  }
};

// @desc    Update a plant
// @route   PUT /api/v1/plants/:id
export const updatePlant = async (req, res) => {
  try {
    const plantRef = plantsRef.child(req.params.id);
    const snapshot = await plantRef.once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ success: false, message: `Plant with ID ${req.params.id} does not exist` });
    }

    const allPlantSnapshot = await plantsRef.once("value");
    const allPlants = allPlantSnapshot.val() || {};
    const duplicate = Object.entries(allPlants).find(
      ([id, c]) => c.vin_plate === req.body.vin_plate && id !== req.params.id
    );
    if (duplicate) {
      return res.status(400).json({ success: false, message: `Cannot update! Plant with VIN ${req.body.vin_plate} already exists` });
    }

    if (req.body.picture) req.body.picture = req.body.picture.replace(/&amp;/g, "&");
    await plantRef.update({ ...req.body, updatedAt: new Date().toISOString() });

    // Audit log
    await auditLogsRef.push({
      action: "Update",
      user_id: req.user?.id || null,
      target: "plants",
      target_id: req.params.id,
      description: `Updated plant id ${req.params.id}`,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({ success: true, message: "Plant updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: "Cannot update a plant" });
  }
};

// @desc    Delete a plant
// @route   DELETE /api/v1/plants/:id
export const deletePlant = async (req, res) => {
  try {
    const plantRef = plantsRef.child(req.params.id);
    const snapshot = await plantRef.once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ success: false, message: `Plant with ID ${req.params.id} does not exist` });
    }

    await plantRef.remove();

    // Audit log
    await auditLogsRef.push({
      action: "Delete",
      user_id: req.user?.id || null,
      target: "cars",
      target_id: req.params.id,
      description: `Deleted car id ${req.params.id}`,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({ success: true, message: `Plant ${req.params.id} deleted successfully` });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: "Cannot delete a plant" });
  }
};
