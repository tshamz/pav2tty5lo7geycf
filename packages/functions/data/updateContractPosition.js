const firebase = require('@services/firebase');

module.exports = async (data, context) => {
  try {
    const isDelete = data.UserPrediction === -1;

    const path = isDelete
      ? `contractPositions`
      : `contractPositions/${data.ContractId}`;

    const update = isDelete
      ? {
          [data.ContractId]: null,
        }
      : {
          market: await firebase.db.get(`contracts/${data.ContractId}/market`),
          prediction: data.UserPrediction,
          quantity: data.UserQuantity,
          openBuyOrders: data.UserOpenOrdersBuyQuantity,
          openSellOrders: data.UserOpenOrdersSellQuantity,
          averagePrice: data.UserAveragePricePerShare,
        };

    await firebase.db.set(path, update);
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    return null;
  }
};
