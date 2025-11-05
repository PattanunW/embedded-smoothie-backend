const { getTotalDays } = require('../functions_to_be_tested/getTotalDays');

describe('getTotalDays function', () => {
  test('should calculate correct number of days between start and end', () => {
    const start = new Date('2025-01-01');
    const end = new Date('2025-01-05');
    expect(getTotalDays(start, end)).toBe(5);
  });

  test('should return 1 if start and end are the same day', () => {
    const start = new Date('2025-01-01');
    const end = new Date('2025-01-01');
    expect(getTotalDays(start, end)).toBe(1);
  });

  test('should handle start before end correctly', () => {
    const start = new Date('2025-12-31');
    const end = new Date('2026-01-01');
    expect(getTotalDays(start, end)).toBe(2);
  });
});
