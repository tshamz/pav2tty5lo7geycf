const firebase = require('@services/firebase');

module.exports = async (snapshot, context) => {
  try {
    const deletedMarket = await snapshot.val();

    if (deletedMarket.id) {
      firebase.timespans.set({
        [deletedMarket.id]: null,
      });
    }

    if (deletedMarket.contracts) {
      deletedMarket.contracts.forEach((id) => {
        firebase.contracts.set({ [id]: null });
      });
    }

    return;
  } catch (error) {
    firebase.logger.error(error.message);
  }
};
