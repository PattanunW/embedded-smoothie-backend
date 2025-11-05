const mongoose = require("mongoose");

const CouponTemplateSchema = new mongoose.Schema(
  {
    percentage: {
      type: Number,
      required: true,
    },
    // date will be YYYY-MM-DD format, time will default in 00:00:00
    name: {
      type: String,
      required: true,
    },
    maxDiscount: {
      type: Number,
      required: true,
    },
    minSpend: {
      type: Number,
      required: true,
    },
    spent: {
      type: Number,
      required: true,
    },
    valid: {
      type: Number,
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("CouponTemplate", CouponTemplateSchema);
