const firebase = require('@services/firebase');

module.exports = async (data) => {
  try {
    await firebase.orderBooks.set(data.id, {
      no: data.noOrders,
      yes: data.yesOrders,
    });

    return;
  } catch (error) {
    firebase.logger.error(error.message);
  }
};
