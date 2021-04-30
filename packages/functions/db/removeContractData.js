const firebase = require('@services/firebase');

module.exports = async (snapshot, context) => {
  try {
    const deletedContract = await snapshot.val();

    if (deletedContract.id) {
      firebase.prices.set({
        [deletedContract.id]: null,
      });
    }

    return;
  } catch (error) {
    firebase.logger.error(error.message);
  }
};
