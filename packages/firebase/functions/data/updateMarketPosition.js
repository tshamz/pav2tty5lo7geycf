const admin = require('@services/firebase');

module.exports = async (data, context) => {
  try {
    if (!data.UserHasOwnership) {
      const update = { [data.MarketId]: null };

      await admin.setPath(`marketPositions`)(update);

      return { update };
    }

    const update = {
      totalInvestment: data.UserInvestment,
      maxPayout: data.UserMaxPayout,
      _timestamp: Date.now(),
      _updatedAt: new Date().toUTCString(),
    };

    await admin.setPath(`marketPositions/${data.MarketId}`)(update);

    return { update };
  } catch (error) {
    console.error(error);
    return { error };
  }
};
