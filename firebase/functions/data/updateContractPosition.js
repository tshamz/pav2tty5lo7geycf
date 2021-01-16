const admin = require('services/firebase');

module.exports = async (data, context) => {
  try {
    if (data.UserPrediction === -1) {
      const update = {
        [data.ContractId]: null,
      };

      await admin.database().ref(`contractPositions`).update(update);

      return { update };
    }

    const path = `contracts/${data.ContractId}/market`;
    const update = {
      market: await admin.getPath({ path }),
      prediction: data.UserPrediction,
      quantity: data.UserQuantity,
      openBuyOrders: data.UserOpenOrdersBuyQuantity,
      openSellOrders: data.UserOpenOrdersSellQuantity,
      averagePrice: data.UserAveragePricePerShare,
      _timestamp: Date.now(),
      _updatedAt: new Date().toUTCString(),
    };

    await admin
      .database()
      .ref(`contractPositions/${data.ContractId}`)
      .update(update);

    return { update };
  } catch (error) {
    console.error(error);
    return { error };
  }
};
