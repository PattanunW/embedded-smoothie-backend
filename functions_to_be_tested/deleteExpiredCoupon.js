const Coupon = require("../models/CouponModel");

// @desc    Delete a expired coupons
// @route   DELETE /api/v1/coupons/expired
// @access  Private
exports.deleteExpiredCoupons = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const result = await Coupon.deleteMany({
      expirationDate: { $lt: currentDate },
    });
    res.status(200).json({
      success: true,
      message: `${result.deletedCount} expired coupons deleted`,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot delete expired coupons" });
  }
};