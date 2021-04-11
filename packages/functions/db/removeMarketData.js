const firebase = require('@services/firebase');

module.exports = async (snapshot, context) => {
  try {
  } catch (error) {
    firebase.logger.error(error.message);
  }
};
