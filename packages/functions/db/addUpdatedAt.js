const firebase = require('@services/firebase');

module.exports = async (snapshot, context) => {
  try {
    const path = snapshot.after._path.slice(1);
    const timezone = 'America/Los_Angeles';
    const now = new Date().toLocaleString({ timezone });

    const update = {
      _updatedAt: now,
    };

    await firebase.db.set(path, update);
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    return null;
  }
};
