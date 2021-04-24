const firebase = require('@services/firebase');

module.exports = async (snapshot, context) => {
  try {
    const isSame = snapshot.before.val() === snapshot.after.val();
    const wasDeleted = snapshot.after.val() === null;

    if (isSame || wasDeleted) return;

    // todo: use rtdb lists instead
    await firebase.priceHistory.set(context.params.contract, {
      [Date.now()]: snapshot.after.val(),
    });

    return;
  } catch (error) {
    firebase.logger.error(error.message);
  }
};
