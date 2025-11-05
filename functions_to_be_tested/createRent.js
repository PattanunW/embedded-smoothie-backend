const Rent = require("../models/RentModel");
const Car = require("../models/CarModel");
const User = require("../models/UserModel");
const AuditLog = require("../models/AuditLogModel");
const { getTotalDays } = require("./getTotalDays");
const { calculateValueAfterDiscount } = require("./calculateValueAfterDiscount");

// @desc   Create rent
// @route  POST /api/v1/cars/:carId/rents/
// @access Private
exports.createRent = async (req, res, next) => {
  try {
    const { user_info, discount, iDate, startDate, endDate, status } = req.body;
    req.body.car_info = req.params.carId;
    const car_info = req.body.car_info;
    //req.body.user_info = req.user.id;

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      return res
        .status(400)
        .json({ success: false, message: "End date must be after start date" });
    }

    const overlapRents = await Rent.findOne({
      car_info: car_info,
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }, // Full overlap
        { startDate: { $gte: start, $lte: end } }, // Start inside another rent
        { endDate: { $gte: start, $lte: end } }, // End inside another rent
      ],
    });
    if (overlapRents) {
      return res.status(400).json({
        success: false,
        message: "This car is already rented during the requested period",
      });
    }

    const car = await Car.findById(req.params.carId);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: `No car with the id of ${req.params.carId}`,
      });
    }
    const existingRents = await Rent.find({
      user_info: req.user.id,
      status: "Confirmed", //Count only confirmed renting. Does not count finished.
    });
    if (existingRents.length >= 3 && req.user.role === "user") {
      return res.status(400).json({
        success: false,
        message: `User ${req.user.name} has already rented 3 cars.`,
      });
    }
    req.body.totalDays = getTotalDays(start, end);
    req.body.totalPrice = calculateValueAfterDiscount(
      car.pricePerDay * req.body.totalDays,
      discount
    );
    console.log(req.body.discount);
    console.log(req.body.totalPrice);

    const user = await User.findById(user_info);
    const oldUserTotalPayment = user.totalPayment;
    const oldUserTotalPaymentThisYear = user.totalPaymentThisYear;
    const newTotalPayment = oldUserTotalPayment + req.body.totalPrice;
    const newTotalPaymentThisYear =
      oldUserTotalPaymentThisYear + req.body.totalPrice;
    await User.updateOne(
      { _id: user_info },
      {
        totalPayment: newTotalPayment,
        totalPaymentThisYear: newTotalPaymentThisYear,
      }
    );
    console.log("totalpayment this year = ", user.totalPaymentThisYear);
    const rent = await Rent.create(req.body);

    await AuditLog.create({
      action: "Create",
      user_id: req.user._id,
      target: "rents",
      target_id: rent._id,
      description: `Create renting id ${rent._id}.`,
    });
    res.status(201).json({ success: true, data: rent });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot create Rent" });
  }
};