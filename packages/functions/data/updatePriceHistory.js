const firebase = require('@services/firebase');

module.exports = async (snapshot, context) => {
  try {
    const isSame = snapshot.before.val() === snapshot.after.val();
    const wasDeleted = snapshot.after.val() === null;

    if (isSame || wasDeleted) return;

    const path = context.params.contract;

    const update = {
      [Date.now()]: snapshot.after.val(),
    };

    await firebase.priceHistory.set(path, update);
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    return null;
  }
};
