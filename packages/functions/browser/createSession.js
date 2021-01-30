const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const puppeteer = require('puppeteer-extra').use(stealthPlugin());

const utils = require('@services/utils');
const firebase = require('@services/firebase');

const config = firebase.config('predictit');

const checkLastRan = async () => {
  try {
    const code = 'resource-exhausted';
    const message = 'createSession run less than 5 minutes ago';
    const lastRan = new Date(await firebase.db.get('session/lastRan'));
    const timeSince = Date.now() - lastRan.getTime();
    const timeLeft = (5 * 60 * 1000 - timeSince) / 1000 + ` seconds`;

    if (utils.was(lastRan).under('5 minutes ago')) {
      throw new firebase.HttpsError(code, message, { timeLeft, lastRan });
    }

    await firebase.db.set('session', { lastRan: utils.now() });
  } catch (error) {
    throw error;
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
    throw error;
  }
};

const parseSession = async (session) => {
  const wssHostKey = 'firebase:host:predictit-f497e.firebaseio.com';
  const wssHost = JSON.parse(session[wssHostKey] || null);

  delete session[wssHostKey];

  return {
    ...session,
    wssHost,
    username: config.username,
    token: JSON.parse(session.token || null),
    refreshToken: JSON.parse(session.refreshToken || null),
    tokenExpires: JSON.parse(session.tokenExpires || null),
    browseHeaders: JSON.parse(session.browseHeaders || null),
    eng_mt: JSON.parse(session.eng_mt || null),
    _updatedAt: now(),
    _timestamp: Date.now(),
  };
};

module.exports = async (data, res) => {
  try {
    const update = await checkLastRan()
      .then(createNewSession)
      .then(parseSession);

    firebase.db.set('session', update);
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    if (res && res.sendStatus) {
      res.sendStatus(200);
    }

    return null;
  }
};
