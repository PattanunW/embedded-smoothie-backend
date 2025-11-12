import db from "../config/firebaseAdmin.js"; // your firebaseAdmin.js
import { ref, push, get, set, update, remove, child } from "firebase-admin/database"; // optional clarity

// Helper reference to the "cars" collection
const carsRef = db.ref("cars");

// @desc    Get all cars
// @route   GET /api/v1/cars
// @access  Public
export const getCars = async (req, res) => {
  try {
    const snapshot = await carsRef.once("value");
    const cars = snapshot.val() || {};

    // Firebase returns an object keyed by ID — convert it to an array
    const carsArray = Object.entries(cars).map(([id, data]) => ({
      id,
      ...data,
    }));

    res.status(200).json({ success: true, data: carsArray });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: "Cannot get cars" });
  }
};

// @desc    Get a single car
// @route   GET /api/v1/cars/:id
// @access  Public
export const getCar = async (req, res) => {
  try {
    const snapshot = await db.ref(`cars/${req.params.id}`).once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({
        success: false,
        message: `Car with ID ${req.params.id} does not exist`,
      });
    }

    const car = snapshot.val();
    res.status(200).json({ success: true, data: { id: req.params.id, ...car } });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: "Cannot get a car" });
  }
};

// @desc    Create a car
// @route   POST /api/v1/cars
// @access  Provider/Admin
export const createCar = async (req, res) => {
  try {
    req.body.picture = req.body.picture?.replace(/&amp;/g, "&") || "";

    // Check for duplicate VIN plate
    const snapshot = await carsRef.once("value");
    const cars = snapshot.val() || {};
    const duplicate = Object.values(cars).find(
      (c) => c.vin_plate === req.body.vin_plate
    );
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: `Car with VIN ${req.body.vin_plate} already exists.`,
      });
    }

    // Create new car
    const newCarRef = carsRef.push();
    const carData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await newCarRef.set(carData);

    // (Optional) Write audit log
    await db.ref("auditLogs").push({
      action: "Create",
      user_id: req.user?._id || null,
      target: "cars",
      target_id: newCarRef.key,
      description: `Created car id ${newCarRef.key}.`,
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
// @access  Provider/Admin
export const updateCar = async (req, res) => {
  try {
    const carRef = db.ref(`cars/${req.params.id}`);
    const snapshot = await carRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({
        success: false,
        message: `Car with ID ${req.params.id} does not exist.`,
      });
    }

    // Check duplicate VIN
    const allCars = (await carsRef.once("value")).val() || {};
    const duplicate = Object.entries(allCars).find(
      ([id, c]) => c.vin_plate === req.body.vin_plate && id !== req.params.id
    );
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: `Cannot update! Car with VIN ${req.body.vin_plate} already exists.`,
      });
    }

    if (req.body.picture) {
      req.body.picture = req.body.picture.replace(/&amp;/g, "&");
    }

    await carRef.update({
      ...req.body,
      updatedAt: new Date().toISOString(),
    });

    await db.ref("auditLogs").push({
      action: "Update",
      user_id: req.user?._id || null,
      target: "cars",
      target_id: req.params.id,
      description: `Updated car id ${req.params.id}.`,
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
// @access  Provider/Admin
export const deleteCar = async (req, res) => {
  try {
    const carRef = db.ref(`cars/${req.params.id}`);
    const snapshot = await carRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({
        success: false,
        message: `Car with ID ${req.params.id} does not exist.`,
      });
    }

    // Delete any related rents (if you store them in "rents" collection)
    const rentRef = db.ref("rents");
    const rentSnapshot = await rentRef.once("value");
    const rents = rentSnapshot.val() || {};

    for (const [id, rent] of Object.entries(rents)) {
      if (rent.car_info === req.params.id) {
        await db.ref(`rents/${id}`).remove();
      }
    }

    // Delete the car itself
    await carRef.remove();

    // Add audit log
    await db.ref("auditLogs").push({
      action: "Delete",
      user_id: req.user?._id || null,
      target: "cars",
      target_id: req.params.id,
      description: `Deleted car id ${req.params.id}.`,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: `Car ${req.params.id} deleted successfully`,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: "Cannot delete a car" });
  }
};
