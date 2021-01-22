const chrono = require('chrono-node');

const log = require('@services/logger');

const was = (datelike) => {
  const date = new Date(datelike);

  if (!date) return false;

  const over = (timeframe) => chrono.parseDate(timeframe) > date;
  const under = (timeframe) => chrono.parseDate(timeframe) < date;

  return { over, under };
};

const now = (options) => {
  const date = new Date();
  const timezone = 'America/Los_Angeles';

  return date.toLocaleString({ timezone, ...options });
};

const raise = (error, options = {}) => {
  if (options.log) {
    log.error(error);
  }

  throw error;
};

module.exports = {
  now,
  was,
  raise,
};
