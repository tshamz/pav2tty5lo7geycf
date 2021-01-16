const express = require('express');

const app = express();
const port = process.env.PORT || 8083;

app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.listen(port, () => {
  log.debug(`Server started, listening on ${port}`);
});

module.exports = app;
