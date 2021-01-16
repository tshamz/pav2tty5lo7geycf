const WebSocket = require('ws');

const log = require('services/logger');
const utils = require('services/utils');
const ReconnectingWs = require('reconnecting-websocket');

exports.isOpen = (connection) => {
  return connection.readyState == connection.OPEN;
};

exports.send = (connection) => (msg) => {
  log.silly(`Sending message`);
  connection.send(msg);
};

exports.open = (connection) => {
  log.debug(`Opening connection`, { status: 'connecting' });

  if (connection.readyState !== connection.OPEN) {
    connection.reconnect(1000);
  }
};

exports.close = (connection) => {
  log.debug(`Closing connection`, { status: 'connecting' });

  if (connection.readyState !== connection.CLOSED) {
    connection.close(1000);
  }
};

exports.restart = (connection) => {
  log.debug(`Restarting connection`, { status: 'connecting' });
  connection.close(1000);
  utils.pause(2500).then(connection.reconnect);
};

exports.connect = (url, options = {}) => {
  const connection = new ReconnectingWs(url, [], {
    WebSocket,
    maxRetries: options.maxRetries || 3,
    startClosed: options.startClosed || true,
    minUptime: options.minUptime || 10000,
    maxReconnectionDelay: options.maxReconnectionDelay,
    minReconnectionDelay: options.minReconnectionDelay,
  });

  connection.addEventListener('open', () => {
    log.debug(`Connection opened`, { status: 'open' });
  });

  connection.addEventListener('close', ({ code }) => {
    log.debug(`Connection closed`, { code, status: 'closed' });
  });

  connection.addEventListener('message', (message) => {
    log.silly(`Message recieved`, { data: message });
  });

  connection.addEventListener('error', (error) => {
    log.error(`Connection error`, { error, status: 'closed' });
  });

  const heartbeat = () => {
    const status = connection.readyState == connection.OPEN ? 'open' : 'closed';
    const icon = status === 'open' ? '✅' : '🚫';
    log.debug(icon, { status });
  };

  setInterval(heartbeat, 30000);

  return connection;
};
