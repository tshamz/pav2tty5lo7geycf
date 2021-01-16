const chrono = require('chrono-node');

const log = require('./logger');

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const random = () => Math.floor(Math.random() * (10 - 1 + 1)) + 1;

const raise = (error) => {
  log.error(error);
  throw error;
};

const was = (datelike) => {
  const date = new Date(datelike);

  if (!date) return false;

  const over = (timeframe) => chrono.parseDate(timeframe) > date;
  const under = (timeframe) => chrono.parseDate(timeframe) < date;

  return { over, under };
};

module.exports = {
  pause,
  random,
  raise,
  was,
};
