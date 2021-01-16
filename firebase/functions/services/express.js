const express = require('express');

const log = require('services/logger');
const websocket = require('services/websocket');

exports.create = async (connection) => {
  try {
    const app = express();
    const isOpen = () => websocket.isOpen(connection);

    app.use(await log.middleware);

    app.get('/', (req, res) => {
      res.sendStatus(200);
    });

    app.get('/kill', (req, res) => {
      res.sendStatus(503);
      process.exit(1);
    });

    app.get('/health', (req, res) => {
      res.sendStatus(isOpen() ? 200 : 503);
    });

    app.get('/status', (req, res) => {
      res.json({
        schemaVersion: 1,
        isError: !isOpen(),
        color: isOpen() ? 'green' : 'red',
        label: process.env.npm_package_name,
        message: isOpen() ? 'connected' : 'down',
      });
    });

    return app;
  } catch (error) {
    log.error(error);
    throw error;
  }
};
