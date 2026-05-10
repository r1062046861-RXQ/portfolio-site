const puppeteer = require('puppeteer');
const { DEFAULT_BROWSER_OPTIONS, DEFAULT_GOTO_OPTIONS, DEFAULT_VIEWPORT } = require('../config');

async function createBrowser(options = {}) {
  const opts = { ...DEFAULT_BROWSER_OPTIONS, ...options };
  return puppeteer.launch(opts);
}

async function preparePage(browser, profile) {
  const page = await browser.newPage();
  const viewport = profile.viewport || DEFAULT_VIEWPORT;
  await page.setViewport(viewport);

  const url = profile.url;
  const gotoOpts = { ...DEFAULT_GOTO_OPTIONS, ...(profile.gotoOptions || {}) };
  await page.goto(url, gotoOpts);

  return page;
}

module.exports = { createBrowser, preparePage };
