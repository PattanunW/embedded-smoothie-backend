const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Coupon = require("../models/CouponModel");
require("dotenv").config({ path: "../config/config.env" });

async function updateCouponStatus() {
  try {
    await connectDB();
    console.log("MongoDB connected");

    const curTime = new Date();
    const result = await Coupon.updateMany(
      { expirationDate: { $lt: curTime }, status: { $ne: "Expired" } },
      { $set: { status: "Expired" } }
    );

    console.log(`Updated ${result.modifiedCount} coupon(s) to 'Expired'.`);

  } catch (error) {
    console.error("Error updating coupon records:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

updateCouponStatus();