module.exports = (connection) => () => {
  const message = require('./message')(connection);

  message.send({ a: 's', b: { c: { 'sdk.js.4-9-1': 1 } } });
  message.send({ a: 'q', p: '/marketStats' });
  message.send({ a: 'q', p: '/contractStats' });

  // get ids of current contracts and ask for orderbooks
  // message.subscribe(id)
};
