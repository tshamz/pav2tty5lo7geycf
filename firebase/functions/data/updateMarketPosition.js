const admin = require('services/firebase');

module.exports = async (data, context) => {
  try {
    if (!data.UserHasOwnership) {
      const update = { [data.MarketId]: null };

      await admin.database().ref(`marketPositions`).update(update);

      return { update };
    }

    const update = {
      totalInvestment: data.UserInvestment,
      maxPayout: data.UserMaxPayout,
      _timestamp: Date.now(),
      _updatedAt: new Date().toUTCString(),
    };

    await admin
      .database()
      .ref(`marketPositions/${data.MarketId}`)
      .update(update);

    return { update };
  } catch (error) {
    console.error(error);
    return { error };
  }
};
