import admin from "firebase-admin";
import serviceAccount from "../firebase-admin.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://embedded-group-smoothie-default-rtdb.asia-southeast1.firebasedatabase.app",
});

export const db = admin.database();