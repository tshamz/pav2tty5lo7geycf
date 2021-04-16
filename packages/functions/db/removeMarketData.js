const firebase = require('@services/firebase');

module.exports = async (snapshot, context) => {
  try {
    const deletedMarket = await snapshot.val();

    const contractUpdate = deletedMarket.contracts
      .map((id) => `contracts/${id}`)
      .reduce((update, path) => ({ ...update, [path]: null }), {});

    await Promise.all([
      firebase.db.set(contractUpdate),
      firebase.timespans.set({
        [deletedMarket.id]: null,
      }),
    ]);

    return;
  } catch (error) {
    firebase.logger.error(error.message);
  }
};
