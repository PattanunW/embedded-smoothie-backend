const Rent = require("../models/RentModel");
const Car = require("../models/CarModel");
const User = require("../models/UserModel");
const AuditLog = require("../models/AuditLogModel");

function getTotalDays(start, end) {
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  return diffMs / (1000 * 60 * 60 * 24) + 1;
}

function calculateValueAfterDiscount(val, percentage) {
  let reduced = (val * percentage) / 100;
  if (percentage == 10) {
    reduced = Math.min(100, reduced);
  } else if (percentage == 15) {
    reduced = reduced = Math.min(200, reduced);
  } else if (percentage == 20) {
    reduced = reduced = Math.min(300, reduced);
  } else if (percentage == 25) {
    reduced = reduced = Math.min(400, reduced);
  }
  return val - reduced;
}

// @desc   Get all rents
// @route  GET /api/v1/rents
// @access Private
exports.getRents = async (req, res, next) => {
  let query;
  if (req.user.role !== "admin") {
    if (req.params.carId) {
      query = Rent.find({ car_info: req.params.carId })
        .populate({
          path: "car_info",
          select: "name vin_plate pricePerDay",
        })
        .populate({
          path: "user_info",
          select: "name",
        });
    } else {
      query = Rent.find({ user_info: req.user.id })
        .populate({
          path: "car_info",
          select: "name vin_plate pricePerDay",
        })
        .populate({
          path: "user_info",
          select: "name",
        });
    }
  } else {
    if (req.params.carId) {
      query = Rent.find({ car_info: req.params.carId })
        .populate({
          path: "car_info",
          select: "name vin_plate pricePerDay",
        })
        .populate({
          path: "user_info",
          select: "name",
        });
    } else {
      query = Rent.find()
        .populate({
          path: "car_info",
          select: "name vin_plate pricePerDay",
        })
        .populate({
          path: "user_info",
          select: "name",
        });
    }
  }

  try {
    // if current date is greater than endDate, update status to finished
    const currentDate = new Date();
    await Rent.updateMany(
      { endDate: { $lt: currentDate }, status: "Confirmed" },
      { status: "Finished" }
    );

    const rents = await query;
    res.status(200).json({ success: true, count: rents.length, data: rents });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Rent" });
  }
};

// @desc   Get single rent
// @route  GET /api/v1/rents/:id
// @access Private
exports.getRent = async (req, res, next) => {
  try {
    const rent = await Rent.findById(req.params.id)
      .populate({
        path: "car_info",
        select: "name vin_plate pricePerDay",
      })
      .populate({
        path: "user_info",
        select: "name",
      });
    if (!rent) {
      return res.status(404).json({
        success: false,
        message: `No rent with the id of ${req.params.id}`,
      });
    }
    if (
      req.user.role !== "admin" &&
      rent.user_info._id.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to view this rent" });
    }

    res.status(200).json({ success: true, data: rent });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Rent" });
  }
};

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

//@desc  Update rent
//@route  PUT /api/v1/rents/:id
//@access Private
exports.updateRent = async (req, res, next) => {
  try {
    let rent = await Rent.findById(req.params.id);
    if (!rent) {
      return res.status(404).json({
        success: false,
        message: `No rent with the id of ${req.params.id}`,
      });
    }
    // Make sure user is the rent owner
    if (
      rent.user_info.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.name} is not authorized to update this rent`,
      });
    }
    const oldRentTotalPrice = rent.totalPrice;
    const { car_info, user_info, iDate, startDate, endDate, status } = req.body;
    // if(status){
    //     if(req.user.role === 'admin'){
    //         return res.status(400).json({success:false,message:'User does not have the right to edit renting status'});
    //     }
    //     else{
    //         return res.status(400).json({success:false,message:`Please redirect http://localhost:5000/api/v1/rents/finish/${req.params.id} in order to update this renting`});
    //     }
    // }
    const start = startDate ? new Date(startDate) : rent.startDate;
    const end = endDate ? new Date(endDate) : rent.endDate;

    if (start > end) {
      return res
        .status(400)
        .json({ success: false, message: "End date must be after start date" });
    }

    let carUpdated = false;
    // If the car is changed
    if (car_info && car_info !== rent.car_info) {
      const newCarStartDate = startDate ? new Date(startDate) : rent.startDate;
      const newCarEndDate = endDate ? new Date(endDate) : rent.endDate;
      // Check if the new car has any overlapping rentals
      const overlappingCarRents = await Rent.find({
        _id: { $ne: rent._id }, // Exclude the current rent being updated
        car_info: car_info, // Check for the new car
        $or: [
          {
            startDate: { $lte: newCarEndDate },
            endDate: { $gte: newCarStartDate },
          }, // Check time overlapping
        ],
      });
      if (overlappingCarRents.length > 0) {
        return res.status(400).json({
          success: false,
          message:
            "The selected rental period overlaps with an existing rental for the new car",
        });
      }
      // If no overlap, update the car_info
      req.body.car_info = car_info;
      carUpdated = true;
    }
    // If startDate or endDate is changed
    if ((startDate || endDate) && !carUpdated) {
      const newStartDate = startDate ? new Date(startDate) : rent.startDate;
      const newEndDate = endDate ? new Date(endDate) : rent.endDate;
      //Check time overlapping
      const overlappingCarRents = await Rent.find({
        _id: { $ne: rent._id }, // Exclude the current rent being updated
        car_info: rent.car_info,
        $or: [
          { startDate: { $lte: newEndDate }, endDate: { $gte: newStartDate } }, // Check time overlapping
        ],
      });
      if (overlappingCarRents.length > 0) {
        return res.status(400).json({
          success: false,
          message:
            "The selected rental period overlaps with an existing rental for this car",
        });
      }
    }
    // Update rent
    const carID = car_info ? car_info : rent.car_info;
    const car = await Car.findById(carID);
    const user = await User.findById(rent.user_info);
    const oldUserTotalPayment = user.totalPayment;
    const oldUserTotalPaymentThisYear = user.totalPaymentThisYear;
    console.log(user.name);

    if (rent.inclusionForCalculation == "Included") {
      req.body.totalDays = getTotalDays(start, end);
      req.body.totalPrice = calculateValueAfterDiscount(
        req.body.totalDays * car.pricePerDay,
        rent.discount
      );
      await User.updateOne(
        { _id: rent.user_info },
        {
          totalPayment:
            oldUserTotalPayment - oldRentTotalPrice + req.body.totalPrice,
          totalPaymentThisYear:
            oldUserTotalPaymentThisYear -
            oldRentTotalPrice +
            req.body.totalPrice,
        }
      );
      console.log(
        oldUserTotalPayment +
          "," +
          oldRentTotalPrice +
          "," +
          req.body.totalPrice
      );
    }

    rent = await Rent.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    await AuditLog.create({
      action: "Update",
      user_id: req.user._id,
      target: "rents",
      target_id: rent._id,
      description: `Update renting id ${rent._id}.`,
    });
    res.status(200).json({ success: true, data: rent });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot update Rent" });
  }
};

// @desc  Delete rent
// @route  DELETE /api/v1/rents/:id
// @access Private
exports.deleteRent = async (req, res, next) => {
  try {
    const rent = await Rent.findById(req.params.id);
    if (!rent) {
      return res.status(404).json({
        success: false,
        message: `No rent with the id of ${req.params.id}`,
      });
    }
    // User can delete their own rent, admin can delete any rent
    if (
      rent.user_info.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this rent`,
      });
    }

    const rentId = req.params.id;
    const isInThisYear = rent.inclusionForCalculation == "Included";
    const user = await User.findById(rent.user_info);
    const oldUserTotalPayment = user.totalPayment;
    const oldUserTotalPriceThisYear = user.totalPaymentThisYear;
    await User.updateOne(
      { _id: user._id },
      {
        totalPayment: oldUserTotalPayment - rent.totalPrice,
        totalPaymentThisYear:
          oldUserTotalPriceThisYear - (isInThisYear ? rent.totalPrice : 0),
      }
    );

    await Rent.findByIdAndDelete(req.params.id);
    await AuditLog.create({
      action: "Delete",
      user_id: req.user._id,
      target: "rents",
      target_id: rentId,
      description: `Delete renting id ${rentId}.`,
    });
    res.status(200).json({
      success: true,
      data: {},
      message: `Renting with the id of ${req.params.id} has been deleted successfully`,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot delete rent" });
  }
};

// @desc  Update rent status from confirmed to finished
// @route  PUT /api/v1/rents/finish/:id
// @access Private
exports.finishRent = async (req, res, next) => {
  try {
    let rent = await Rent.findById(req.params.id);
    if (!rent) {
      return res.status(404).json({
        success: false,
        message: `No rent with the id of ${req.params.id}`,
      });
    }
    rent = await Rent.findByIdAndUpdate(
      req.params.id,
      { status: "Finished" },
      { new: true, runValidators: true }
    );
    await AuditLog.create({
      action: "Update",
      user_id: req.user._id,
      target: "rents",
      target_id: rent._id,
      description: `Changed the status of renting id ${rent._id} to finished.`,
    });
    res.status(200).json({ success: true, data: rent });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot update rent status" });
  }
};
