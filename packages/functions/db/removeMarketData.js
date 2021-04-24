const firebase = require('@services/firebase');

module.exports = async (snapshot, context) => {
  try {
    const deletedMarket = await snapshot.val();

    if (deletedMarket?.id) {
      await firebase.timespans.set({
        [deletedMarket.id]: null,
      });
    }

    if (deletedMarket?.contracts) {
      const contractUpdate = deletedMarket?.contracts
        .map((id) => `contracts/${id}`)
        .reduce((update, path) => ({ ...update, [path]: null }), {});

      await firebase.db.set(contractUpdate);
    }

    return;
  } catch (error) {
    firebase.logger.error(error.message);
  }
};
