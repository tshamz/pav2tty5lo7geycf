const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const puppeteer = require('puppeteer-extra').use(stealthPlugin());

const log = require('@services/logger');
const { was } = require('@services/utils');
const firebase = require('@services/firebase');

const config = firebase.config('predictit');

const throwBackoffError = (message, data) => {
  log.debug(message);
  throw new firebase.HttpsError('resource-exhausted', message, data);
};

const checkLastRan = ({ _lastRan }) => {
  const lastRan = new Date(_lastRan);

  if (was(lastRan).under('5 minutes ago')) {
    const timeSince = Date.now() - lastRan.getTime();
    const timeLeft = (5 * 60 * 1000 - timeSince) / 1000 + ` seconds`;
    const times = `(timeLeft: ${timeLeft} lastRan: ${lastRan.toLocaleTimeString()})`;
    const warning = `createSession run less than 5 minutes ago`;
    const message = `${warning} ${times}`;
    const data = { timeLeft, lastRan };

    throwBackoffError(message, data);
  }
};

const checkForWssHost = ({ wssHost }) => {
  const hasWssHost = !!wssHost;

  if (!hasWssHost) {
    const message = `already has wssHost`;
    const data = { wssHost };

    throwBackoffError(message, data);
  }
};

const checkIfTokenExpired = ({ tokenExpires }) => {
  const expiresAt = JSON.parse(tokenExpires)?.value;
  const isExpired = new Date(expiresAt) < new Date();

  if (!isExpired) {
    const message = `token isn't expired`;
    const data = { expiresAt };

    throwBackoffError(message, data);
  }
};

const createNewBrowser = async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    headless: true,
  });

  return browser;
};

const createNewSession = async (browser = createNewBrowser(), attempt = 0) => {
  browser = await browser;
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
    await page.waitForTimeout(10000);

    const localStorage = await page.evaluate(() => ({
      ...window.localStorage,
    }));

    return { browser, page, localStorage };
  } catch (error) {
    await page.close();
    await browser.close();
    throw error;
  }
};

const parseSession = async ({ browser, page, localStorage }) => {
  const wssHostKey = 'firebase:host:predictit-f497e.firebaseio.com';
  const wssHost = JSON.parse(localStorage[wssHostKey] || null);

  if (!wssHost) {
    console.log('crash and burn!');
    return localStorage;
  } else {
    delete localStorage[wssHostKey];

    // may want to do something with these later...
    await page.close();
    await browser.close();

    return {
      wssHost,
      username: config.username,
      token: JSON.parse(localStorage.token || null),
      tokenExpires: localStorage.tokenExpires,
      refreshToken: localStorage.refreshToken,
    };
  }
};

module.exports = async (data, res) => {
  try {
    const session = await firebase.db.get('session');

    if (session) {
      checkLastRan(session);
      checkForWssHost(session);
      checkIfTokenExpired(session);
    }

    await firebase.db.set('session', { _lastRan: Date.now() });

    const update = await createNewSession().then(parseSession);

    firebase.db.set('session', update);

    return update;
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    if (res && res.sendStatus) {
      res.sendStatus(200);
    }
  }
};
