const firebase = require('@services/firebase');

module.exports = async (snapshot, context) => {
  try {
    const deletedContract = await snapshot.val();

    if (deletedContract && deletedContract.id) {
      await Promise.all([
        firebase.db.set({
          [`prices/${deletedContract.id}`]: null,
        }),
      ]);
    }

    return;
  } catch (error) {
    firebase.logger.error(error.message);
  }
};
