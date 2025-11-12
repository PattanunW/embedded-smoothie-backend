import { db } from "../config/firebaseAdmin.js";

const carsRef = db.ref("cars");
const auditLogsRef = db.ref("auditLogs");

// @desc    Get all cars
// @route   GET /api/v1/cars
export const getCars = async (req, res) => {
  try {
    const snapshot = await carsRef.once("value");
    const cars = snapshot.val() || {};
    const carsArray = Object.entries(cars).map(([id, data]) => ({ id, ...data }));
    res.status(200).json({ success: true, data: carsArray });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: "Cannot get cars" });
  }
};

// @desc    Get a single car
// @route   GET /api/v1/cars/:id
export const getCar = async (req, res) => {
  try {
    const snapshot = await carsRef.child(req.params.id).once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ success: false, message: `Car with ID ${req.params.id} does not exist` });
    }
    res.status(200).json({ success: true, data: { id: req.params.id, ...snapshot.val() } });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: "Cannot get a car" });
  }
};

// @desc    Create a car
// @route   POST /api/v1/cars
export const createCar = async (req, res) => {
  try {
    req.body.picture = req.body.picture?.replace(/&amp;/g, "&") || "";

    const snapshot = await carsRef.once("value");
    const cars = snapshot.val() || {};
    const duplicate = Object.values(cars).find(c => c.vin_plate === req.body.vin_plate);
    if (duplicate) {
      return res.status(400).json({ success: false, message: `Car with VIN ${req.body.vin_plate} already exists` });
    }

    const newCarRef = carsRef.push();
    const carData = { ...req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await newCarRef.set(carData);

    // Audit log
    await auditLogsRef.push({
      action: "Create",
      user_id: req.user?.id || null,
      target: "cars",
      target_id: newCarRef.key,
      description: `Created car id ${newCarRef.key}`,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({ success: true, id: newCarRef.key, data: carData });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: "Cannot create a car" });
  }
};

// @desc    Update a car
// @route   PUT /api/v1/cars/:id
export const updateCar = async (req, res) => {
  try {
    const carRef = carsRef.child(req.params.id);
    const snapshot = await carRef.once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ success: false, message: `Car with ID ${req.params.id} does not exist` });
    }

    const allCarsSnapshot = await carsRef.once("value");
    const allCars = allCarsSnapshot.val() || {};
    const duplicate = Object.entries(allCars).find(
      ([id, c]) => c.vin_plate === req.body.vin_plate && id !== req.params.id
    );
    if (duplicate) {
      return res.status(400).json({ success: false, message: `Cannot update! Car with VIN ${req.body.vin_plate} already exists` });
    }

    if (req.body.picture) req.body.picture = req.body.picture.replace(/&amp;/g, "&");
    await carRef.update({ ...req.body, updatedAt: new Date().toISOString() });

    // Audit log
    await auditLogsRef.push({
      action: "Update",
      user_id: req.user?.id || null,
      target: "cars",
      target_id: req.params.id,
      description: `Updated car id ${req.params.id}`,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({ success: true, message: "Car updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: "Cannot update a car" });
  }
};

// @desc    Delete a car
// @route   DELETE /api/v1/cars/:id
export const deleteCar = async (req, res) => {
  try {
    const carRef = carsRef.child(req.params.id);
    const snapshot = await carRef.once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ success: false, message: `Car with ID ${req.params.id} does not exist` });
    }

    // Remove any associated rents
    const rentRef = db.ref("rents");
    const rentSnapshot = await rentRef.once("value");
    const rents = rentSnapshot.val() || {};
    for (const [id, rent] of Object.entries(rents)) {
      if (rent.car_info === req.params.id) await rentRef.child(id).remove();
    }

    await carRef.remove();

    // Audit log
    await auditLogsRef.push({
      action: "Delete",
      user_id: req.user?.id || null,
      target: "cars",
      target_id: req.params.id,
      description: `Deleted car id ${req.params.id}`,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({ success: true, message: `Car ${req.params.id} deleted successfully` });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: "Cannot delete a car" });
  }
};
