const Coupon = require("../models/CouponModel");

// @desc    Create a coupon
// @route   POST /api/v1/coupons
// @access  Private
exports.createCoupon = async (req, res, next) => {
  try {
    // Validate the request body
    const { percentage, name, maxDiscount, minSpend, expirationDate } =
      req.body;

    if (!percentage || !name || !maxDiscount || !minSpend || !expirationDate) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: percentage, name, maxDiscount, minSpend, expirationDate",
      });
    }

    const coupon = await Coupon.create({
      user_info: req.user._id,
      percentage,
      name,
      maxDiscount,
      minSpend,
      expirationDate,
    });

    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot create coupon" });
  }
};