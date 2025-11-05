const { createCoupon } = require('../functions_to_be_tested/createCoupon');
const Coupon = require('../models/CouponModel');

jest.mock('../models/CouponModel'); // Mock the Coupon model

describe('createCoupon controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      user: { _id: 'mockuserid' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  test('should return 400 if required fields are missing', async () => {
    req.body = { percentage: 10 }; // Missing fields
    await createCoupon(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: expect.stringContaining('Please provide all required fields')
    }));
  });

  test('should create coupon successfully', async () => {
    req.body = {
      percentage: 10,
      name: 'Summer Sale',
      maxDiscount: 100,
      minSpend: 500,
      expirationDate: '2025-12-31'
    };

    const fakeCoupon = { id: 'couponid', ...req.body };
    Coupon.create.mockResolvedValue(fakeCoupon);

    await createCoupon(req, res);

    expect(Coupon.create).toHaveBeenCalledWith(expect.objectContaining({
      user_info: 'mockuserid',
      name: 'Summer Sale'
    }));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: fakeCoupon });
  });

  test('should handle database error and return 500', async () => {
    req.body = {
      percentage: 10,
      name: 'Summer Sale',
      maxDiscount: 100,
      minSpend: 500,
      expirationDate: '2025-12-31'
    };

    Coupon.create.mockRejectedValue(new Error('DB error'));

    await createCoupon(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Cannot create coupon' });
  });
});
