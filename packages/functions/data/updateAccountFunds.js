const firebase = require('@services/firebase');

module.exports = async (data) => {
  try {
    const path = 'funds';

    const update = {
      cash: data.AccountBalanceDecimal,
      invested: data.PortfolioBalanceDecimal,
      profitablePredictions: data.ProfitablePredictions,
    };

    await firebase.db.set(path, update);
  } catch (error) {
    firebase.logger.error(error.message);
  }
};
