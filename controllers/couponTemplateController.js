const CouponTemplate = require("../models/CouponTemplate");

// GET /api/v1/coupon-templates
// @desc    Get all coupon templates
// @access  Public
exports.getAllCouponTemplates = async (req, res, next) => {
  try {
    const couponTemplates = await CouponTemplate.find().sort({
      percentage: 1,
    });
    res.status(200).json({
      success: true,
      count: couponTemplates.length,
      data: couponTemplates,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot retrieve coupon templates" });
  }
};

// POST /api/v1/coupon-templates
// @desc    Create a new coupon template
// @access  Private
exports.createCouponTemplate = async (req, res, next) => {
  try {
    const { percentage, name, maxDiscount, minSpend, spent, valid } = req.body;

    // ตรวจสอบว่ามีข้อมูลทั้งหมดหรือไม่
    if (!percentage || !name || !maxDiscount || !minSpend || !spent || !valid) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const newCouponTemplate = new CouponTemplate({
      percentage,
      name,
      maxDiscount,
      minSpend,
      spent,
      valid,
    });

    await newCouponTemplate.save();

    res.status(201).json({
      success: true,
      data: newCouponTemplate,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create coupon template",
    });
  }
};

// PUT /api/v1/coupon-templates/:id
// @desc    Update a coupon template by ID
// @access  Private
exports.updateCouponTemplate = async (req, res, next) => {
  try {
    const couponTemplate = await CouponTemplate.findById(req.params.id);

    if (!couponTemplate) {
      return res.status(404).json({
        success: false,
        message: "CouponTemplate not found",
      });
    }

    // อัปเดตข้อมูลใหม่จาก body ที่ส่งมา
    const { percentage, name, maxDiscount, minSpend, spent, valid } = req.body;
    couponTemplate.percentage = percentage || couponTemplate.percentage;
    couponTemplate.name = name || couponTemplate.name;
    couponTemplate.maxDiscount = maxDiscount || couponTemplate.maxDiscount;
    couponTemplate.minSpend = minSpend || couponTemplate.minSpend;
    couponTemplate.spent = spent || couponTemplate.spent;
    couponTemplate.valid = valid || couponTemplate.valid;

    await couponTemplate.save();

    res.status(200).json({
      success: true,
      data: couponTemplate,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update coupon template",
    });
  }
};

// DELETE /api/v1/coupon-templates/:id
// @desc    Delete a coupon template by ID
// @access  Private
exports.deleteCouponTemplate = async (req, res, next) => {
  try {
    const couponTemplate = await CouponTemplate.findById(req.params.id);

    if (!couponTemplate) {
      return res.status(404).json({
        success: false,
        message: "CouponTemplate not found",
      });
    }

    await CouponTemplate.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      data: {},
      message: "CouponTemplate deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete coupon template",
    });
  }
};
