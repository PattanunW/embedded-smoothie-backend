import admin from "firebase-admin";
import serviceAccount from "../firebase-admin.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // CHANGE THIS LINE BELOW 👇
  databaseURL: "https://smartfarm-aa520-default-rtdb.asia-southeast1.firebasedatabase.app", 
});

export const db = admin.database();
export default admin;