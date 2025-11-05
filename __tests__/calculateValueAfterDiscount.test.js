const { calculateValueAfterDiscount } = require('../functions_to_be_tested/calculateValueAfterDiscount'); // same file

describe('calculateValueAfterDiscount function', () => {
  test('should cap reduction at 100 for 10%', () => {
    expect(calculateValueAfterDiscount(2000, 10)).toBe(1900); // 2000 - 100 (max capped)
    expect(calculateValueAfterDiscount(500, 10)).toBe(450);   // normal calculation
  });

  test('should cap reduction at 200 for 15%', () => {
    expect(calculateValueAfterDiscount(2000, 15)).toBe(1800); // 2000 - 200 (max capped)
    expect(calculateValueAfterDiscount(1000, 15)).toBe(850);  // normal calculation
  });

  test('should cap reduction at 300 for 20%', () => {
    expect(calculateValueAfterDiscount(2000, 20)).toBe(1700); // 2000 - 300 (max capped)
    expect(calculateValueAfterDiscount(1000, 20)).toBe(800);  // normal calculation
  });

  test('should cap reduction at 400 for 25%', () => {
    expect(calculateValueAfterDiscount(2000, 25)).toBe(1600); // 2000 - 400 (max capped)
    expect(calculateValueAfterDiscount(1000, 25)).toBe(750);  // normal calculation
  });

  test('should not cap if discount is other value', () => {
    expect(calculateValueAfterDiscount(1000, 5)).toBe(950); // 5% discount normally
  });
});
