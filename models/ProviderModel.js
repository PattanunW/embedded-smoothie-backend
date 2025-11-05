const mongoose = require("mongoose");

//schema : _id, name, address, tel, email
const ProviderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    tel: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please add a valid email",
      ],
    },
    picture: {
      type: String,
      required: true,
    },
    openTime: {
      type: String,
      required: true,
      match: [
        /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
        "Time must be in HH:MM:SS format",
      ],
    },
    closeTime: {
      type: String,
      required: true,
      match: [
        /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
        "Time must be in HH:MM:SS format",
      ],
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

module.exports = mongoose.model("Provider", ProviderSchema);
