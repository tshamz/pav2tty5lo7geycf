const express = require('express');

const log = require('services/logger');

exports.create = (port) => {
  const app = express();

  log.middleware().then((middleware) => app.use(middleware));

  app.get('/', (req, res) => {
    res.sendStatus(200);
  });

  app.get('/kill', (req, res) => {
    res.sendStatus(503);
    process.exit(1);
  });

  app.listen(port, () => {
    log.debug(`Server started, listening on ${port}`);
  });

  return app;
};