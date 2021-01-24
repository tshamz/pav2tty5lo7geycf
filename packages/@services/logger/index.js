const chalk = require('chalk');
const winston = require('winston');
const { LoggingWinston, express } = require('@google-cloud/logging-winston');

const version = process.env.GAE_VERSION;
const service =
  process.env.GAE_SERVICE ||
  (process.env.FUNCTION_TARGET || '').split('.')[1] ||
  (process.env.INIT_CWD || '').split('/').reverse()[0];

const colors = {
  last: 'red',
  closed: 'red',
  connecting: 'yellow',
  open: 'green',
};

const formatOutputForConsole = (info) => {
  const color = info.status ? colors[info.status] : colors.last;
  colors.last = color;
  const label = info.label.length > 18 ? info.label.slice(0, 18) : info.label;
  const spacer = ' '.repeat(20 - label.length);
  return `${spacer}[${chalk[color](label)}] ${info.message}`;
};

const googleTransport = new LoggingWinston({
  format: winston.format.json(),
  labels: { service, version },
  serviceContext: { service, version },
});

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.label({ label: service }),
    winston.format.printf(formatOutputForConsole)
  ),
});

const options = {
  level: 'debug',
  exitOnError: false,
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp()
  ),
  defaultMeta: { service },
};

const logger = winston.createLogger(options);

if (process.env.NODE_ENV === 'production') {
  logger.add(googleTransport);
}

if (process.env.NODE_ENV === 'development') {
  logger.add(consoleTransport);
}

logger.middleware = () => express.makeMiddleware(logger);

module.exports = logger;
