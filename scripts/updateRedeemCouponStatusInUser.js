const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/UserModel");
require("dotenv").config({ path: "../config/config.env" });

async function updateRedeemCouponStatusInUser() {
  try {
    await connectDB();

    // อัปเดตทุก user ให้เป็น false
    await User.updateMany(
      {}, // อัปเดตทุกเรคคอร์ด
      { $set: { redeemCouponStatus: [false, false, false, false] } } // เปลี่ยนค่า stausCouponRedeem เป็น [false, false, false, false]
    );
    console.log(
      "All user records have been updated to [false, false, false, false]"
    );

    await mongoose.disconnect();
    console.log("MongoBD disconnected");
  } catch (error) {
    console.error("Error updating user records:", error);
  }
}

updateRedeemCouponStatusInUser();
