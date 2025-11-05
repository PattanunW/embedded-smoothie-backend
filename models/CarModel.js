const mongoose = require("mongoose");

const CarSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    vin_plate: {
      type: String,
      required: true,
      unique: true,
    },
    provider_info: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },
    picture: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    pricePerDay: {
      type: Number,
      required: true,
    },
    averageRating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

CarSchema.virtual("Provider", {
  ref: "ProviderModel",
  localField: "provider_id",
  foreignField: "_id",
  justOne: false,
});

module.exports = mongoose.model("Car", CarSchema);
