const admin = require('@local/services/firebase');

module.exports = async (snapshot, context) => {
  try {
    const update = {
      _createdAt: new Date().toUTCString(),
      _updatedAt: new Date().toUTCString(),
    };

    await admin.setPath(snapshot._path.slice(1))(update);

    return;
  } catch (error) {
    console.error(error);
    return { error };
  }
};
