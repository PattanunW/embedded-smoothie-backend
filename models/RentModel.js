const mongoose = require("mongoose");

const RentSchema = new mongoose.Schema(
  {
    car_info: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    user_info: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    //rent date will be YYYY-MM-DD format, time will default in 00:00:00
    iDate: {
      type: Date,
      match: [
        /^\d{4}-\d{2}-\d{2}$/,
        "Please provide a valid date in yyyy-mm-dd format",
      ],
      default: Date.now,
    },
    startDate: {
      type: Date,
      match: [
        /^\d{4}-\d{2}-\d{2}$/,
        "Please provide a valid date in yyyy-mm-dd format",
      ],
      required: true,
    },
    endDate: {
      type: Date,
      match: [
        /^\d{4}-\d{2}-\d{2}$/,
        "Please provide a valid date in yyyy-mm-dd format",
      ],
      required: true,
    },
    totalDays: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    couponName: {
      type: String,
      required: true,
      default: "No coupon applied",
    },
    discount: {
      type: Number,
      required: true,
      default: 0,
    },
    maxDiscount: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Confirmed", "Finished"],
      default: "Confirmed",
    },
    inclusionForCalculation: {
      type: String,
      enum: ["Included", "Excluded"],
      default: "Included",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// if the rent after the end date, then it will be finished
RentSchema.pre("save", function (next) {
  const currentDate = new Date();
  if (this.endDate < currentDate) {
    this.status = "Finished";
  }
  next();
});

module.exports = mongoose.model("Rent", RentSchema);
