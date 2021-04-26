const camelcase = require('camelcase');
const admin = require('firebase-admin');

const connections = {};

const getConnection = (name = '') => {
  const id = camelcase(name);

  if (!name) {
    return admin.database();
  }

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

const getRef = (database) => (path) => {
  return getConnection(database).ref(path);
};

const getSnapshot = (database) => (path) => {
  return getConnection(database).ref(path).once('value');
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

  return getConnection(database).ref(path).update(update);
};

const pushPath = (database) => (...args) => {
  const path = args.length === 1 ? undefined : args[0];
  const update = args.length === 1 ? args[0] : args[1];

  return getConnection(database).ref(path).push(update);
};

module.exports = {
  db: {
    ref: getRef(),
    get: getPath(),
    set: setPath(),
    push: setPath(),
    snapshot: getSnapshot(),
  },
  timespans: {
    ref: getRef('timespans'),
    get: getPath('timespans'),
    set: setPath('timespans'),
    push: pushPath('timespans'),
    snapshot: getSnapshot('timespans'),
  },
};
