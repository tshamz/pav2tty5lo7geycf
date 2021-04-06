const log = require('@services/logger');
const { was } = require('@services/utils');
const firebase = require('@services/firebase');

exports.get = async () => {
  try {
    let wssHost = await firebase.db.get('session/wssHost');
    // const session = (await firebase.db.get('session')) || {};
    // let { _lastRan, _wssLastTried, wssHost } = session;

    // const lastRan = new Date(_lastRan);
    // console.log('lastRan', lastRan);

    // const runRecently = was(lastRan).under('1 minutes ago');
    // console.log('runRecently', runRecently);

    // const sameWssHost = _wssLastTried === wssHost;
    // console.log('sameWssHost', sameWssHost);

    // const badWssHost = runRecently && sameWssHost;
    // console.log('badWssHost', badWssHost);

    // if (!wssHost || badWssHost) {
    if (!wssHost) {
      // const result = await firebase.db.set('/', { session: null });
      // console.log('result', result);

      const response = await firebase.call.createSession();

      wssHost = response.data.wssHost;
    }

    const url = `wss://${wssHost}/.ws?v=5&ns=predictit-f497e`;

    log.debug(`Trying: ${url}`, { status: 'connecting' });

    await firebase.db.set('session', { _wssLastTried: wssHost });

    return url;
  } catch (error) {
    log.error(error);
    return null;
  }
};
