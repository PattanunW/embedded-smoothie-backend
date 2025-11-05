const { createRent } = require('../functions_to_be_tested/createRent');
const Rent = require('../models/RentModel');
const Car = require('../models/CarModel');
const User = require('../models/UserModel');
const AuditLog = require('../models/AuditLogModel');

jest.mock('../models/RentModel');
jest.mock('../models/CarModel');
jest.mock('../models/UserModel');
jest.mock('../models/AuditLogModel');

describe('createRent controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        user_info: 'user123',
        discount: 10,
        iDate: '2025-01-01',
        startDate: '2025-01-10',
        endDate: '2025-01-15'
      },
      params: {
        carId: 'car123'
      },
      user: {
        id: 'user123',
        _id: 'user123',
        role: 'user',
        name: 'Test User'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  test('should return 400 if startDate is after endDate', async () => {
    req.body.startDate = '2025-01-20';
    req.body.endDate = '2025-01-10';

    await createRent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'End date must be after start date'
    });
  });

  test('should return 400 if car is already rented during the period', async () => {
    Rent.findOne.mockResolvedValue({ _id: 'someRentId' });

    await createRent(req, res);

    expect(Rent.findOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'This car is already rented during the requested period'
    });
  });

  test('should return 404 if car not found', async () => {
    Rent.findOne.mockResolvedValue(null);
    Car.findById.mockResolvedValue(null);

    await createRent(req, res);

    expect(Car.findById).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: `No car with the id of ${req.params.carId}`
    });
  });

  test('should return 400 if user already rented 3 cars', async () => {
    Rent.findOne.mockResolvedValue(null);
    Car.findById.mockResolvedValue({ _id: 'car123', pricePerDay: 100 });
    Rent.find.mockResolvedValue([{}, {}, {}]);

    await createRent(req, res);

    expect(Rent.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: `User Test User has already rented 3 cars.`
    });
  });

  test('should create rent successfully', async () => {
    Rent.findOne.mockResolvedValue(null);
    Car.findById.mockResolvedValue({ _id: 'car123', pricePerDay: 100 });
    Rent.find.mockResolvedValue([]);
    User.findById.mockResolvedValue({
      _id: 'user123',
      totalPayment: 1000,
      totalPaymentThisYear: 500
    });
    User.updateOne.mockResolvedValue({});
    Rent.create.mockResolvedValue({ _id: 'rent123', ...req.body });
    AuditLog.create.mockResolvedValue({});

    await createRent(req, res);

    expect(Rent.findOne).toHaveBeenCalled();
    expect(Car.findById).toHaveBeenCalled();
    expect(Rent.find).toHaveBeenCalled();
    expect(User.findById).toHaveBeenCalled();      // ✅
    expect(User.updateOne).toHaveBeenCalled();     // ✅
    expect(Rent.create).toHaveBeenCalled();        // ✅
    expect(AuditLog.create).toHaveBeenCalled();    // ✅
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: expect.objectContaining({
        _id: 'rent123'
      })
    });
  });

  test('should return 500 if any error happens', async () => {
    Rent.findOne.mockRejectedValue(new Error('Database error'));

    await createRent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Cannot create Rent'
    });
  });
});
