const admin = require('@services/firebase');

module.exports = async (data, context) => {
  try {
    if (data.UserPrediction === -1) {
      const update = {
        [data.ContractId]: null,
      };

      await admin.setPath(`contractPositions`)(update);

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

    await admin.setPath(`contractPositions/${data.ContractId}`)(update);

    return { update };
  } catch (error) {
    console.error(error);
    return { error };
  }
};
