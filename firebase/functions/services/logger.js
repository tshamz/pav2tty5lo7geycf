const chalk = require('chalk');
const winston = require('winston');
const uuid = require('uuid');
const { LoggingWinston, express } = require('@google-cloud/logging-winston');

const user = process.env.USER;
const service = process.env.npm_package_name;
const version = process.env.npm_package_version;
const lifecycle = process.env.npm_lifecycle_event;
const dev = lifecycle && lifecycle.includes('dev');
const env = dev ? 'development' : 'produciton';
const trace = `projects/kingmaker---firebase/traces/${uuid.v4()}`;

let lastColor = 'red';

const formatOutputForConsole = (info) => {
  const colors = { closed: 'red', connecting: 'yellow', open: 'green' };
  const color = info.status ? colors[info.status] : lastColor;
  lastColor = color;
  const spacer = ' '.repeat(20 - info.label.length);
  return `${spacer}[${chalk[color](info.label)}] ${info.message}`;
};

const googleTransport = new LoggingWinston({
  format: winston.format.json(),
  labels: {
    service,
    version,
    [LoggingWinston.LOGGING_TRACE_KEY]: trace,
  },
  serviceContext: { service, version },
});

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.label({ label: service }),
    winston.format.printf(formatOutputForConsole)
  ),
});

const defaultOptions = {
  level: 'debug',
  exitOnError: false,
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp()
  ),
  defaultMeta: { service, version, user, env },
};

const logger = winston.createLogger(defaultOptions);

if (true || !dev) {
  logger.add(googleTransport);
}

if (dev) {
  logger.add(consoleTransport);
}

const initLogger = (id, options = defaultOptions) => {
  return winston.loggers.has(id)
    ? winston.loggers.get(id)
    : winston.loggers.add(id, options);
};

logger.init = initLogger;
logger.middleware = express.makeMiddleware(logger);

module.exports = logger;
