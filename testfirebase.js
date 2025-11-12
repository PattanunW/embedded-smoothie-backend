import { db } from "./config/firebaseAdmin.js";

async function testFirebase() {
  try {
    // 1️⃣ Write a test value
    await db.ref("test").set({
      message: "Firebase Admin is working!",
      timestamp: new Date().toISOString(),
    });

    console.log("Data written successfully!");

    // 2️⃣ Read the value back
    const snapshot = await db.ref("test").once("value");
    console.log("Data read from Firebase:", snapshot.val());
  } catch (error) {
    console.error("Firebase Admin test failed:", error);
  }
}

testFirebase();
