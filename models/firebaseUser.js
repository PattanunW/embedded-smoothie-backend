import { db } from "../config/firebaseAdmin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const User = {
  // Create a new user
  create: async ({ name, tel, email, password, role = "user" }) => {
    const snapshot = await db.ref("users").orderByChild("email").equalTo(email).once("value");
    if (snapshot.exists()) throw new Error("This email is already registered");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUserRef = db.ref("users").push();
    const user = {
      id: newUserRef.key,
      name,
      tel,
      email,
      password: hashedPassword,
      role,
      totalPayment: 0,
      totalPaymentThisYear: 0,
      redeemCouponStatus: [false, false, false, false],
      createdAt: new Date().toISOString(),
    };

    await newUserRef.set(user);
    return { ...user, password: undefined }; // do not return password
  },

  // Get user by email
  findOne: async (query) => {
    if (query.email) {
      const snapshot = await db.ref("users").orderByChild("email").equalTo(query.email).once("value");
      if (!snapshot.exists()) return null;
      const data = snapshot.val();
      const key = Object.keys(data)[0];
      return { _id: key, ...data[key], password: data[key].password };
    }
    return null;
  },

  // Get user by ID
  findById: async (id) => {
    const snapshot = await db.ref(`users/${id}`).once("value");
    return snapshot.exists() ? { _id: id, ...snapshot.val() } : null;
  },

  // Update user by ID
  findByIdAndUpdate: async (id, fieldsToUpdate, options = { new: true }) => {
    const userRef = db.ref(`users/${id}`);
    const snapshot = await userRef.once("value");
    if (!snapshot.exists()) throw new Error("User not found");

    if (fieldsToUpdate.password) {
      const salt = await bcrypt.genSalt(10);
      fieldsToUpdate.password = await bcrypt.hash(fieldsToUpdate.password, salt);
    }

    await userRef.update(fieldsToUpdate);
    if (options.new) {
      const updatedSnapshot = await userRef.once("value");
      const updatedUser = updatedSnapshot.val();
      return { _id: id, ...updatedUser, password: undefined };
    }
    return null;
  },

  // Compare password
  matchPassword: async (enteredPassword, hashedPassword) => {
    return await bcrypt.compare(enteredPassword, hashedPassword);
  },

  // Generate JWT token
  getSignedJwtToken: (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  },
};

export default User;
