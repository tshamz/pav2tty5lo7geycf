const express = require('express');
const log = require('@local/services/logger');

exports.create = () => {
  const app = express();

  log.middleware().then((middleware) => app.use(middleware));

  app.get('/', (req, res) => {
    res.sendStatus(200);
  });

  app.get('/kill', (req, res) => {
    res.sendStatus(503);
    process.exit(1);
  });

  return app;
};
