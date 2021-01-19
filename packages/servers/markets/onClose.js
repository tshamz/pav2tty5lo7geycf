const firebase = require('@services/firebase');

module.exports = () => async (event) => {
  const { wasClean, code } = event;

  if (!wasClean && code === 1006) {
    await firebase.functions().httpsCallable('browser-createSession')();
  }
};
