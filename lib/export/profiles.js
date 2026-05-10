const path = require('path');
const { SITE_URL, LOCAL_URL, CSS_SNIPPETS } = require('./config');
const { scrollToBottom, waitForImages, backToTop } = require('./steps/warmup');
const { forceOpacity, revealHoverText, compressImages, injectPrintStyles } = require('./steps/domPatches');
const { renderPdf } = require('./renderers/pdfRenderer');
const { renderWord } = require('./renderers/wordRenderer');
const { renderScreenshot } = require('./renderers/screenshotRenderer');

const ROOT = path.resolve(__dirname, '..', '..');

function resolvePath(relative) {
  return path.resolve(ROOT, relative);
}

const FINAL_PRINT_CSS = `
  @media print {
    ${CSS_SNIPPETS.printReset}
    nav {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      display: flex !important;
      mix-blend-mode: normal !important;
    }
    nav .hidden.md\\:flex, nav a[href="#contact"] {
      display: none !important;
    }
    footer { display: none !important; }
    ${CSS_SNIPPETS.fixMotionOpacity}
    ${CSS_SNIPPETS.hideBlurEffects}
    ${CSS_SNIPPETS.gradientFix}
    ${CSS_SNIPPETS.kill3DPerspective}
    ${CSS_SNIPPETS.sectionPageBreak}
    ${CSS_SNIPPETS.worksCompact}
    ${CSS_SNIPPETS.avoidBreakInside}
    ${CSS_SNIPPETS.printBody}
  }
`;

const OPTIMIZED_PRINT_CSS = `
  @media print {
    ${CSS_SNIPPETS.hideNavFooter}
    ${CSS_SNIPPETS.hideBlurEffects}
    ${CSS_SNIPPETS.kill3DPerspective}
    ${CSS_SNIPPETS.avoidBreakInside}
    section {
      page-break-inside: auto !important;
      break-inside: auto !important;
      padding-top: 40px !important;
      padding-bottom: 40px !important;
    }
    ${CSS_SNIPPETS.printBody}
  }
`;

const PDF_169_PRINT_CSS = `
  @media print {
    nav { display: none !important; }
    ${CSS_SNIPPETS.avoidBreakInside}
    section { break-inside: auto !important; }
    ${CSS_SNIPPETS.printBody}
  }
`;

const profiles = {
  pdfFinal: {
    name: 'pdfFinal',
    viewport: { width: 1920, height: 1080 },
    url: SITE_URL,
    steps: [
      async (page) => { await scrollToBottom(page, { distance: 200, interval: 100 }); },
      async (page) => { await waitForImages(page, 3000); },
      async (page) => { await backToTop(page, 1000); },
      forceOpacity,
      revealHoverText,
      async (page) => { await compressImages(page, { maxWidth: 800, quality: 0.4 }); },
      async (page) => { await injectPrintStyles(page, FINAL_PRINT_CSS); },
    ],
    renderer: renderPdf,
    pdfOptions: {
      path: resolvePath('../液态像素工作室_完美排版版.pdf'),
      width: '16in',
      height: '9in',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    },
  },

  pdfOptimized: {
    name: 'pdfOptimized',
    viewport: { width: 1440, height: 900 },
    url: SITE_URL,
    steps: [
      async (page) => { await scrollToBottom(page, { distance: 150, interval: 100 }); },
      async (page) => { await backToTop(page, 1000); },
      revealHoverText,
      async (page) => { await injectPrintStyles(page, OPTIMIZED_PRINT_CSS); },
    ],
    renderer: renderPdf,
    pdfOptions: {
      path: resolvePath('../液态像素工作室_最终优化版.pdf'),
      format: 'A3',
      landscape: true,
      printBackground: true,
      margin: { top: '40px', bottom: '40px', left: '40px', right: '40px' },
    },
  },

  pdf169: {
    name: 'pdf169',
    viewport: { width: 1920, height: 1080 },
    url: SITE_URL,
    steps: [
      async (page) => { await scrollToBottom(page, { distance: 150, interval: 100 }); },
      async (page) => { await backToTop(page, 1000); },
      revealHoverText,
      async (page) => { await injectPrintStyles(page, PDF_169_PRINT_CSS); },
    ],
    renderer: renderPdf,
    pdfOptions: {
      path: resolvePath('../液态像素工作室_16_9演示版.pdf'),
      width: '1920px',
      height: '1080px',
      printBackground: true,
      margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' },
    },
  },

  pdfBasic: {
    name: 'pdfBasic',
    viewport: { width: 1440, height: 900 },
    url: SITE_URL,
    steps: [
      async (page) => { await scrollToBottom(page, { distance: 150, interval: 100 }); },
      async (page) => { await backToTop(page, 1000); },
    ],
    renderer: async (page, profile) => {
      console.log('正在计算页面总高度...');
      const bodyHandle = await page.$('body');
      const boundingBox = await bodyHandle.boundingBox();
      await page.pdf({
        path: profile.pdfOptions.path,
        width: boundingBox.width,
        height: boundingBox.height + 50,
        printBackground: true,
      });
    },
    pdfOptions: {
      path: resolvePath('../液态像素工作室_作品集.pdf'),
    },
  },

  word: {
    name: 'word',
    viewport: { width: 1920, height: 1080 },
    url: SITE_URL,
    steps: [
      async (page) => { await scrollToBottom(page, { distance: 300, interval: 100 }); },
      async (page) => { await waitForImages(page, 3000); },
    ],
    renderer: renderWord,
    outputPath: resolvePath('../液态像素工作室_作品集.docx'),
  },

  screenshot: {
    name: 'screenshot',
    viewport: { width: 1920, height: 1080, deviceScaleFactor: 2 },
    url: LOCAL_URL,
    steps: [
      async (page) => { await scrollToBottom(page, { distance: 100, interval: 100, settleMs: 2000 }); },
      async (page) => { await backToTop(page, 500); },
    ],
    renderer: renderScreenshot,
    screenshotOptions: {
      fullPage: true,
    },
    outputPath: resolvePath('website_full_screenshot.png'),
  },
};

module.exports = { profiles };
