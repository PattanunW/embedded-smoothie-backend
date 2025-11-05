function getTotalDays(start, end) {
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    return diffMs / (1000 * 60 * 60 * 24) + 1;
}
module.exports = { getTotalDays };