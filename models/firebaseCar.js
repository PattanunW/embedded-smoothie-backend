import { db } from "../config/firebaseAdmin.js";

// Create a new car
export const createCar = async ({
  name,
  vin_plate,
  provider_info,
  picture,
  capacity,
  description,
  pricePerDay,
  averageRating = null,
}) => {
  // Check for duplicate VIN plate
  const snapshot = await db.ref("cars").orderByChild("vin_plate").equalTo(vin_plate).once("value");
  if (snapshot.exists()) {
    throw new Error("This VIN plate is already registered");
  }

  // Create new car
  const newCarRef = db.ref("cars").push();
  const car = {
    id: newCarRef.key,
    name,
    vin_plate,
    provider_info,
    picture,
    capacity,
    description,
    pricePerDay,
    averageRating,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await newCarRef.set(car);
  return car;
};

// Get all cars
export const getCars = async () => {
  const snapshot = await db.ref("cars").once("value");
  const data = snapshot.val() || {};
  return Object.keys(data).map((key) => ({ id: key, ...data[key] }));
};

// Get a car by ID
export const getCarById = async (id) => {
  const snapshot = await db.ref(`cars/${id}`).once("value");
  return snapshot.exists() ? { id, ...snapshot.val() } : null;
};

// Update a car by ID
export const updateCar = async (id, fieldsToUpdate) => {
  const carRef = db.ref(`cars/${id}`);
  const snapshot = await carRef.once("value");
  if (!snapshot.exists()) throw new Error("Car not found");

  fieldsToUpdate.updatedAt = new Date().toISOString();
  await carRef.update(fieldsToUpdate);

  const updatedSnapshot = await carRef.once("value");
  return { id, ...updatedSnapshot.val() };
};

// Delete a car by ID
export const deleteCar = async (id) => {
  const carRef = db.ref(`cars/${id}`);
  const snapshot = await carRef.once("value");
  if (!snapshot.exists()) throw new Error("Car not found");

  await carRef.remove();
  return true;
};
