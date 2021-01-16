const admin = require('services/firebase');

module.exports = async (snapshot, context) => {
  try {
    const update = {
      _createdAt: new Date().toUTCString(),
      _updatedAt: new Date().toUTCString(),
    };

    await admin.database().ref(snapshot._path.slice(1)).update(update);

    return;
  } catch (error) {
    console.error(error);
    return { error };
  }
};
