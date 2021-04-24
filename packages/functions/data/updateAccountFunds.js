const firebase = require('@services/firebase');

module.exports = async (data) => {
  try {
    await firebase.db.set('funds', {
      cash: data.AccountBalanceDecimal,
      invested: data.PortfolioBalanceDecimal,
      profitablePredictions: data.ProfitablePredictions,
    });

    return;
  } catch (error) {
    firebase.logger.error(error.message);
  }
};
