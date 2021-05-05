const wait = require('wait');

const firebase = require('@services/firebase');

module.exports = (connection) => async () => {
  const message = require('./message')(connection);

  message.send({ a: 's', b: { c: { 'sdks.js.4-9-1': 1 } } });
  message.send({ a: 'q', p: '/marketStats' });
  message.send({ a: 'q', p: '/contractStats' });

  const ids = [];

  await firebase.contracts
    .ref()
    .once('value')
    .then((snapshot) => {
      snapshot.forEach((child) => ids.push(child.key) && false);
    });

  ids.reduce(async (subscription, id) => {
    await subscription;
    await wait(3000);

    firebase.logger.info(`Subscribing to contract: ${id}`);

    message.subscribe(id);
  }, 0);
};
