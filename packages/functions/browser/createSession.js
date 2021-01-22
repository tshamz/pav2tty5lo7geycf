const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const puppeteer = require('puppeteer-extra').use(stealthPlugin());

const firebase = require('@services/firebase');
const { was, now, raise } = require('@services/utils');

const config = firebase.config('predictit');

const checkLastRan = async () => {
  try {
    const _updatedAt = now();
    const _timestamp = Date.now();
    const session = await firebase.db.get('session');

    if (!session || !session._updatedAt) return;

    const lastRan = new Date(session._updatedAt);
    const sinceNow = Date.now() - lastRan.getTime();
    const timeLeft = (5 * 60 * 1000 - sinceNow) / 1000;

    if (was(lastRan).under('5 minutes ago')) {
      const code = 'resource-exhausted';
      const details = { timeLeft, lastRan };
      const message = `createSession run less than 5 minutes ago (${timeLeft} seconds left)`;
      log.debug(`time left: ${timeLeft}`);
      log.debug(`last ran: ${lastRan}`);
      throw new firebase.HttpsError(code, message, details);
    }

    await firebase.db.set('session', { _updatedAt, _timestamp });
  } catch (error) {
    raise(error, { log: false });
  }
};

const createNewSession = async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  try {
    await page.goto(`https://predictit.org`);
    await page.waitForSelector('#login');
    await page.click('#login');
    await page.waitForSelector('#username');
    await page.waitForSelector('#password');
    await page.waitForTimeout(500);
    await page.type('#username', config.username);
    await page.type('#password', config.password);
    await page.$('#password').then((input) => input.press('Enter'));
    await page.waitForTimeout(1500);

    return await page.evaluate(() => ({ ...window.localStorage }));
  } catch (error) {
    await page.close();
    await browser.close();
    raise(error, { log: false });
  }
};

const parseSession = async (session) => {
  const wssHostKey = 'firebase:host:predictit-f497e.firebaseio.com';

  delete session[wssHostKey];

  console.log('session', session);

  return {
    ...session,
    username: config.username,
    wssHost: JSON.parse(session[wssHostKey] || null),
    token: JSON.parse(session.token || null),
    refreshToken: JSON.parse(session.refreshToken || null),
    tokenExpires: JSON.parse(session.tokenExpires || null),
    browseHeaders: JSON.parse(session.browseHeaders || null),
    eng_mt: JSON.parse(session.eng_mt || null),
    _updatedAt: now(),
    _timestamp: Date.now(),
  };
};

// onRun((context: EventContext)
// onCall((data: any, context: CallableContext)
module.exports = async (data, res) => {
  try {
    await checkLastRan();

    const session = await createNewSession();
    const update = await parseSession(session);

    await firebase.db.set('session', update);

    return update;
  } catch (error) {
    if (error instanceof firebase.HttpsError) {
      raise(error);
    }

    raise(new firebase.HttpsError('unknown', error.message));
  }
};
