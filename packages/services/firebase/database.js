const camelcase = require('camelcase');
const admin = require('firebase-admin');

const connections = {};

const getConnection = (name) => {
  if (!name) {
    return admin.database();
  }

  const id = camelcase(name);

  if (connections[id]) {
    return connections[id];
  }

  const projectId = process.env.GCLOUD_PROJECT;
  const credentials = admin.credential.applicationDefault();
  const databaseURL = `https://pav2tty5lo7geycf-${name}.firebaseio.com`;
  const app = admin.initializeApp({ projectId, credentials, databaseURL }, id);
  const connection = admin.database(app);

  connections[id] = connection;

  return connection;
};

const getPath = (database) => (path) => {
  return getConnection(database)
    .ref(path)
    .once('value')
    .then((snapshot) => snapshot.val());
};

const setPath = (database) => (...args) => {
  const path = args.length === 1 ? undefined : args[0];
  const update = args.length === 1 ? args[0] : args[1];

  // prettier-ignore
  return getConnection(database)
    .ref(path)
    .update(update);
};

const pushPath = (database) => (...args) => {
  const path = args.length === 1 ? undefined : args[0];
  const update = args.length === 1 ? args[0] : args[1];

  // prettier-ignore
  return getConnection(database)
    .ref(path)
    .push(update);
};

module.exports = {
  db: {
    get: getPath(),
    set: setPath(),
    push: setPath(),
  },
  priceOhlc: {
    get: getPath('price-ohlc'),
    set: setPath('price-ohlc'),
    push: pushPath('price-ohlc'),
  },
  priceHistory: {
    get: getPath('price-history'),
    set: setPath('price-history'),
    push: pushPath('price-history'),
  },
  priceInterval: {
    get: getPath('price-interval'),
    set: setPath('price-interval'),
    push: pushPath('price-interval'),
  },
  tradeHistory: {
    get: getPath('trade-history'),
    set: setPath('trade-history'),
    push: pushPath('trade-history'),
  },
};
