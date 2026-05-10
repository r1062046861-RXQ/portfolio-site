const { createBrowser, preparePage } = require('./steps/browser');

async function runExport(profile) {
  const name = profile.name || 'unnamed';
  console.log(`[${name}] 启动导出流水线...`);

  const browser = await createBrowser(profile.browserOptions);
  let page;

  try {
    page = await preparePage(browser, profile);

    const steps = profile.steps || [];
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      console.log(`[${name}] 步骤 ${i + 1}/${steps.length}`);
      await step(page, profile);
    }

    if (!profile.renderer) {
      throw new Error(`[${name}] 未配置 renderer，无法输出文件。`);
    }

    await profile.renderer(page, profile);
    console.log(`[${name}] 导出成功！`);
  } catch (err) {
    console.error(`[${name}] 导出失败:`, err);
    throw err;
  } finally {
    await browser.close();
  }
}

module.exports = { runExport };
