const path = require('path');

async function renderPdf(page, profile) {
  const options = {
    printBackground: true,
    ...profile.pdfOptions,
  };

  if (profile.outputPath) {
    options.path = profile.outputPath;
  }

  console.log(`正在生成 PDF (${profile.name || 'unnamed'})...`);
  await page.pdf(options);
  console.log(`PDF 生成完成`);
}

module.exports = { renderPdf };
