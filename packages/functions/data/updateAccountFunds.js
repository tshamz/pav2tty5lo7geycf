const firebase = require('@services/firebase');

module.exports = async (data, context) => {
  try {
    const path = 'funds';

    const update = {
      cash: data.AccountBalanceDecimal,
      invested: data.PortfolioBalanceDecimal,
      profitablePredictions: data.ProfitablePredictions,
      _timestamp: Date.now(),
      _updatedAt: new Date().toLocaleString(),
    };

    await firebase.db.set(path, update);
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    return null;
  }
};
