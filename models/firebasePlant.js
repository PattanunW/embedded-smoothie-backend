import { db } from "../config/firebaseAdmin.js";

// Create a new car
export const createPlant = async ({
  name,
  date,
  species,
  soil,
  humidity,
  temperature,
  sunlight,

}) => {
  // Check for duplicate VIN plate
  const snapshot = await db.ref("plants").orderByChild("vin_plate").equalTo(vin_plate).once("value");
  if (snapshot.exists()) {
    throw new Error("This plant is already registered");
  }

  // Create new car
  const newPlantRef = db.ref("plants").push();
  const plant = {
    id: newPlantRef.key,
    name,
    date,
    species,
    soil,
    humidity,
    temperature,
    sunlight,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await newPlantRef.set(plant);
  return plant;
};

// Get all plants
export const getPlants = async () => {
  const snapshot = await db.ref("plants").once("value");
  const data = snapshot.val() || {};
  return Object.keys(data).map((key) => ({ id: key, ...data[key] }));
};

// Get a plant by ID
export const getPlantById = async (id) => {
  const snapshot = await db.ref(`plant/${id}`).once("value");
  return snapshot.exists() ? { id, ...snapshot.val() } : null;
};

// Update a plant by ID
export const updatePlant = async (id, fieldsToUpdate) => {
  const plantRef = db.ref(`plants/${id}`);
  const snapshot = await plantRef.once("value");
  if (!snapshot.exists()) throw new Error("Plant not found");

  fieldsToUpdate.updatedAt = new Date().toISOString();
  await plantRef.update(fieldsToUpdate);

  const updatedSnapshot = await plantRef.once("value");
  return { id, ...updatedSnapshot.val() };
};

// Delete a plant by ID
export const deletePlant = async (id) => {
  const plantRef = db.ref(`plants/${id}`);
  const snapshot = await plantRef.once("value");
  if (!snapshot.exists()) throw new Error("Car not found");

  await plantRef.remove();
  return true;
};
