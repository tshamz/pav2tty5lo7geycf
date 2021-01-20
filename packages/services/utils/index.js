const chrono = require('chrono-node');

const log = require('@services/logger');

const was = (datelike) => {
  const date = new Date(datelike);

  if (!date) return false;

  const over = (timeframe) => chrono.parseDate(timeframe) > date;
  const under = (timeframe) => chrono.parseDate(timeframe) < date;

  return { over, under };
};

const raise = (error) => {
  log.error(error);
  throw error;
};

module.exports = {
  was,
  raise,
};
