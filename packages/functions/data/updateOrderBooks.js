const firebase = require('@services/firebase');
const predictit = require('@services/predictit');

module.exports = async (context, res) => {
  try {
    const orderBooks = await predictit.fetchOrderBooks();

    const update = Object.entries(orderBooks).reduce((updates, [id, data]) => {
      return {
        ...updates,
        [id]: {
          noOrders: data.noOrders,
          yesOrdrs: data.yesOrders,
        },
      };
    }, {});

    await firebase.db.set('orderBooks', update);

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
