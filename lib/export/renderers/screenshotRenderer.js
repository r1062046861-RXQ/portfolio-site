async function renderScreenshot(page, profile) {
  const options = {
    fullPage: true,
    ...profile.screenshotOptions,
  };

  if (profile.outputPath) {
    options.path = profile.outputPath;
  }

  console.log('正在生成全网页高清长图...');
  await page.screenshot(options);
  console.log(`截图已保存至: ${profile.outputPath}`);
}

module.exports = { renderScreenshot };
