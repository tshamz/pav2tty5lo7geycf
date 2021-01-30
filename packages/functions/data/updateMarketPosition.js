const firebase = require('@services/firebase');

module.exports = async (data, context) => {
  try {
    const isDelete = !data.UserHasOwnership;

    const path = isDelete
      ? `marketPositions`
      : `marketPositions/${data.MarketId}`;

    const update = !data.UserHasOwnership
      ? {
          [data.MarketId]: null,
        }
      : {
          totalInvestment: data.UserInvestment,
          maxPayout: data.UserMaxPayout,
        };

    await firebase.db.set(path, update);
  } catch (error) {
    firebase.logger.error(error);
  } finally {
    return null;
  }
};
