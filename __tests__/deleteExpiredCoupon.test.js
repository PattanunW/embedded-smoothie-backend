const { deleteExpiredCoupons } = require('../functions_to_be_tested/deleteExpiredCoupon');
const Coupon = require('../models/CouponModel');

jest.mock('../models/CouponModel');

describe('deleteExpiredCoupons controller', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  test('should delete expired coupons successfully (some deleted)', async () => {
    const fakeResult = { deletedCount: 5 };
    Coupon.deleteMany.mockResolvedValue(fakeResult);

    await deleteExpiredCoupons(req, res);  // <--- THIS IS IMPORTANT !!!

    expect(Coupon.deleteMany).toHaveBeenCalledWith({
      expirationDate: { $lt: expect.any(Date) }
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: '5 expired coupons deleted'
    });
  });

  test('should handle database error and return 500', async () => {
    Coupon.deleteMany.mockRejectedValue(new Error('DB error'));

    await deleteExpiredCoupons(req, res);  // <--- THIS IS IMPORTANT !!!

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Cannot delete expired coupons'
    });
  });
});
