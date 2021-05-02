const wait = require('wait');

const firebase = require('@services/firebase');
const predictit = require('@services/predictit');

module.exports = (connection) => async () => {
  const message = require('./message')(connection);

  message.send({ a: 's', b: { c: { 'sdks.js.4-9-1': 1 } } });
  message.send({ a: 'q', p: '/marketStats' });
  message.send({ a: 'q', p: '/contractStats' });

  // const markets = await predictit.fetchAllMarkets();
  // markets
  //   .flatMap(({ contracts }) => contracts)
  //   .map(({ id }) => id)
  //   .slice(0, 2)
  //   .forEach(message.subscribe);

  const ids = [];

  await firebase.contracts
    .ref()
    .once('value')
    .then((snapshot) => {
      snapshot.forEach((child) => ids.push(child.key) && false);
    });

  ids.reduce(async (subscription, id) => {
    await subscription;
    await wait(10000);

    console.log(`subscribing to id: ${id}`);
    message.subscribe(id);
  }, 0);
};
