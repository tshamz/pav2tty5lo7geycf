const admin = require('@local/services/firebase');

module.exports = async (snapshot, context) => {
  try {
    const isSame = snapshot.before.val() === snapshot.after.val();
    const wasDeleted = snapshot.after.val() === null;

    if (isSame || wasDeleted) {
      return;
    }

    await admin
      .database(admin.priceHistory)
      .ref(context.params.contract)
      .update({
        [Date.now()]: snapshot.after.val(),
      });

    return;
  } catch (error) {
    console.error(error);
    return { error };
  }
};
