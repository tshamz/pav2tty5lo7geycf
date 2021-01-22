const firebase = require('@services/firebase');

module.exports = async (data, context) => {
  try {
    if (!data.UserHasOwnership) {
      const update = { [data.MarketId]: null };

      await firebase.db.set(`marketPositions`, update);

      return { update };
    }

    const update = {
      totalInvestment: data.UserInvestment,
      maxPayout: data.UserMaxPayout,
      _timestamp: Date.now(),
      _updatedAt: new Date().toUTCString(),
    };

    await firebase.db.set(`marketPositions/${data.MarketId}`, update);

    return { update };
  } catch (error) {
    console.error(error);
    return { error };
  }
};
