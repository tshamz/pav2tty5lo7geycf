const firebase = require('@services/firebase');

module.exports = async (change, context) => {
  try {
    const path = change._path.slice(1);

    const update = {
      _createdAt: Date.now(),
    };

    await firebase.db.set(path, update);
  } catch (error) {
    firebase.logger.error(error.message);
  }
};
