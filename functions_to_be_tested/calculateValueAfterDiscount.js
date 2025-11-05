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
module.exports = { calculateValueAfterDiscount };