const admin = require('firebase-admin');

const app = admin.app();

const getPath = (database) => (path) => {
  return database
    .ref(path)
    .once('value')
    .then((snapshot) => snapshot.val());
};

const setPath = (database) => (...args) => {
  if (args.length === 2) {
    return database.ref(args[0]).update(args[1]);
  }

  if (typeof args[0] === 'object') {
    return database.ref().update(args[0]);
  }

  if (typeof args[0] === 'string') {
    return (update) => database.ref(args[0]).update(update);
  }
};

const getDatabase = function (name) {
  const database = name
    ? app.database(`https://pav2tty5lo7geycf-${name}.firebaseio.com`)
    : admin.database();

  database.get = getPath(database);
  database.set = setPath(database);

  return database;
};

module.exports = {
  db: getDatabase(),
  markets: getDatabase('markets'),
  contracts: getDatabase('contracts'),
  orderBooks: getDatabase('order-books'),
  prices: getDatabase('prices'),
  timespans: getDatabase('timespans'),
};
