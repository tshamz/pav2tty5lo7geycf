const chrono = require('chrono-node');

const was = (datelike) => {
  const date = new Date(datelike);

  if (!date) return false;

  const over = (timeframe) => chrono.parseDate(timeframe) > date;
  const under = (timeframe) => chrono.parseDate(timeframe) < date;

  return { over, under };
};

module.exports = {
  was,
};
