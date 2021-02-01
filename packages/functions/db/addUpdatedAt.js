const firebase = require('@services/firebase');

module.exports = async (change, context) => {
  try {
    if (change.before._data._updatedAt !== change.after._data._updatedAt) {
      return null;
    }

    const path = change.after._path.slice(1);

    const update = {
      _updatedAt: Date.now(),
    };

    await firebase.db.set(path, update);
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    return null;
  }
};
