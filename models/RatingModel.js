const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema(
  {
    rent_info: {
      type: mongoose.Schema.ObjectId,
      ref: "Rent",
      required: true,
    },
    car_info: {
      type: mongoose.Schema.ObjectId,
      ref: "Car",
      required: true,
    },
    provider_info: {
      type: mongoose.Schema.ObjectId,
      ref: "Provider",
      required: true,
    },
    user_info: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
      unique: false,
    },
    car_rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    provider_rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      maxlength: 500,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rating", RatingSchema);
