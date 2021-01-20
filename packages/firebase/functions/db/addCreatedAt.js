const firebase = require('@services/firebase');

module.exports = async (snapshot, context) => {
  try {
    const path = snapshot._path.slice(1);
    const update = {
      _createdAt: new Date().toUTCString(),
      _updatedAt: new Date().toUTCString(),
    };

    await firebase.db.set(path, update);

    return;
  } catch (error) {
    console.error(error);
    return { error };
  }
};
