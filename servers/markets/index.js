require('dotenv').config();
require('@google-cloud/trace-agent').start();

const debug = require('@google-cloud/debug-agent');

const services = require('@local/services');
console.log('services', services);

const log = require('@local/services/logger');
const express = require('@local/services/express');
const websocket = require('@local/services/websocket');

debug.start({ serviceContext: { enableCanary: true } });

const connection = websocket.connect(require('./url'), {
  maxRetries: 3,
  maxReconnectionDelay: 20000,
  minReconnectionDelay: 20000,
});

connection.addEventListener('open', require('./onOpen')(connection));
connection.addEventListener('close', require('./onClose')(connection));
connection.addEventListener('message', require('./onMessage'));

const app = express.create();
const port = process.env.PORT || 8081;
const message = require('./message')(connection);

app.get('/open', (req, res) => {
  websocket.open(connection);
  res.sendStatus(200);
});

app.get('/close', (req, res) => {
  websocket.close(connection);
  res.sendStatus(503);
});

app.get('/restart', (req, res) => {
  websocket.restart(connection);
  res.sendStatus(200);
});

app.get('/subscribe/:id', (req, res) => {
  message.subscribe(req.params.id);
  res.sendStatus(200);
});

app.get('/unsubscribe/:id', (req, res) => {
  message.unsubscribe(req.params.id);
  res.sendStatus(200);
});

app.get('/health', (req, res) => {
  res.sendStatus(websocket.isOpen(connection) ? 200 : 503);
});

app.get('/status', (req, res) => {
  const isOpen = websocket.isOpen(connection);

  res.json({
    schemaVersion: 1,
    isError: !isOpen,
    label: 'markets',
    color: isOpen ? 'green' : 'red',
    message: isOpen ? 'connected' : 'down',
  });
});

app.listen(port, () => {
  log.debug(`Server started, listening on ${port}`);
  // websocket.open(connection);
});

module.exports = app;
