const firebase = require('@services/firebase');
const predictit = require('@services/predictit');

module.exports = async (context, res) => {
  try {
    const orderBooks = await predictit.fetchOrderBooks();

    const remapKeys = (entry) => {
      entry.contract = `${entry.contractId}` || null;
      delete entry.contractId;
      return entry;
    };

    const update = Object.entries(orderBooks).reduce((updates, [id, data]) => {
      return {
        ...updates,
        [id]: {
          noOrders: data.noOrders ? data.noOrders.map(remapKeys) : false,
          yesOrdrs: data.yesOrders ? data.yesOrders.map(remapKeys) : false,
        },
      };
    }, {});

    await firebase.orderBooks.set(update);

    firebase.logger.info(`updated order books from predictit`);

    return;
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    if (res && res.sendStatus) {
      res.sendStatus(200);
    }
  }
};
