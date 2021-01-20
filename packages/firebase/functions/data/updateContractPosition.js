const firebase = require('@services/firebase');

module.exports = async (data, context) => {
  try {
    if (data.UserPrediction === -1) {
      const update = { [data.ContractId]: null };

      await firebase.db.set(`contractPositions`, update);

      return { update };
    }

    const update = {
      market: await firebase.db.get(`contracts/${data.ContractId}/market`),
      prediction: data.UserPrediction,
      quantity: data.UserQuantity,
      openBuyOrders: data.UserOpenOrdersBuyQuantity,
      openSellOrders: data.UserOpenOrdersSellQuantity,
      averagePrice: data.UserAveragePricePerShare,
      _timestamp: Date.now(),
      _updatedAt: new Date().toUTCString(),
    };

    await firebase.db.set(`contractPositions/${data.ContractId}`, update);

    return { update };
  } catch (error) {
    console.error(error);
    return { error };
  }
};
