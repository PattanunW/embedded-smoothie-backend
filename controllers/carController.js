const Car = require("../models/CarModel");
const Provider = require("../models/ProviderModel");
const Rent = require("../models/RentModel");
const AuditLog = require("../models/AuditLogModel");

// @desc    Get all cars
// @route   GET /api/v1/cars
// @access  Public
exports.getCars = async (req, res, next) => {
  try {
    let query;
    let queryStr = JSON.stringify(req.query);
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );
    query = Car.find(JSON.parse(queryStr)).populate({
      path: "provider_info",
      select: "name address tel email openTime closeTime picture",
    });

    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    }

    const cars = await query;
    res.status(200).json({ success: true, data: cars });
  } catch (err) {
    res.status(400).json({ success: false, message: "Cannot get cars" });
    console.log(err);
  }
};

// @desc    Get a single car
// @route   GET /api/v1/cars/:id
// @access  Public
exports.getCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id).populate({
      path: "provider_info",
      select: "name address tel email openTime closeTime picture",
    });
    if (!car) {
      return res.status(404).json({
        success: false,
        message: `Car with the id ${req.params.id} does not exist`,
      });
    }
    res.status(200).json({ success: true, data: car });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Cannot get a car" });
  }
};

// @desc    Create a car
// @route   POST /api/v1/cars
// @access  Provider
exports.createCar = async (req, res, next) => {
  try {
    req.body.picture = req.body.picture.replace(/&amp;/g, "&");
    const {
      name,
      vin_plate,
      provider_info,
      capacity,
      description,
      pricePerDay,
    } = req.body;
    //Check if duplicate email address exists
    const existedCar = await Car.findOne({ vin_plate });
    if (existedCar) {
      return res.status(400).json({
        success: false,
        message: `Cannot add! This car with VIN ${req.body.vin_plate} is already registered`,
      });
    }
    const provider = await Provider.findById(provider_info);
    if (!provider) {
      return res.status(400).json({
        success: false,
        message: `Cannot add! The provider with the id ${provider_info} does not exist`,
      });
    }
    const car = await Car.create(req.body);
    await AuditLog.create({
      action: "Create",
      user_id: req.user._id,
      target: "cars",
      target_id: car._id,
      description: `Created car id ${car._id}.`,
    });
    res.status(201).json({ success: true, data: car });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Cannot create a car. Check if provider id exists in database.",
    });
  }
};

// @desc    Update a car
// @route   PUT /api/v1/cars/:id
// @access  Provider
exports.updateCar = async (req, res, next) => {
  try {
    // Check if a car with the provided VIN plate already exists
    const {
      name,
      picture,
      vin_plate,
      provider_info,
      capacity,
      description,
      pricePerDay,
    } = req.body;
    if (picture) {
      req.body.picture = req.body.picture.replace(/&amp;/g, "&");
    }
    if (vin_plate) {
      const existedCar = await Car.findOne({ vin_plate });
      if (existedCar) {
        if (existedCar._id != req.params.id) {
          return res.status(400).json({
            success: false,
            message: `Cannot update! This car with VIN ${vin_plate} is already registered`,
          });
        }
      }
    }

    // Check if the provider exists
    if (provider_info) {
      const provider = await Provider.findById(provider_info);
      if (!provider) {
        return res.status(400).json({
          success: false,
          message: `Cannot update! The provider with the id ${provider_info} does not exist`,
        });
      }
    }

    const car = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!car) {
      return res.status(404).json({
        success: false,
        message: `Car with the id ${req.params.id} does not exist`,
      });
    }
    await AuditLog.create({
      action: "Update",
      user_id: req.user._id,
      target: "cars",
      target_id: car._id,
      description: `Updated car id ${car._id}.`,
    });
    res.status(200).json({ success: true, data: car });
  } catch (err) {
    res.status(400).json({ success: false, message: "Cannot update a car" });
  }
};

// @desc    Delete a car
// @route   DELETE /api/v1/cars/:id
// @access  Provider
exports.deleteCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: `Car with the id ${req.params.id} does not exist`,
      });
    }
    await Rent.deleteMany({ car_info: req.params.id });
    const carId = req.params.id;
    await Car.findByIdAndDelete(req.params.id);
    await AuditLog.create({
      action: "Delete",
      user_id: req.user._id,
      target: "cars",
      target_id: carId,
      description: `Delete car id ${carId}, as well as related rentings.`,
    });
    res.status(200).json({
      success: true,
      data: {},
      message: `Car with the id of ${req.params.id}, as well as related rentings has been deleted successfully`,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Cannot delete a car" });
  }
};
