const firebase = require('@services/firebase');

module.exports = async (snapshot, context) => {
  try {
    const before = snapshot.before.val();
    const after = snapshot.after.val();
    const isSame = before === after;
    const wasDeleted = snapshot.after.val() === null;

    if (isSame || wasDeleted) return;

    const path = context.params.contract;
    const update = { [Date.now()]: after };

    await firebase.priceHistory.set(path, update);

    return;
  } catch (error) {
    console.error(error);
    return { error };
  }
};
