async function scrollToBottom(page, { distance = 150, interval = 100, settleMs = 2000 } = {}) {
  console.log('模拟平滑滚动，触发入场动画和图片懒加载...');
  await page.evaluate(async (d, intv) => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, d);
        totalHeight += d;
        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, intv);
    });
  }, distance, interval);

  if (settleMs > 0) {
    await new Promise(resolve => setTimeout(resolve, settleMs));
  }
}

async function waitForImages(page, additionalWaitMs = 3000) {
  console.log('等待图片完全加载...');
  await new Promise(resolve => setTimeout(resolve, additionalWaitMs));
  await page.evaluate(async () => {
    const images = Array.from(document.images);
    await Promise.all(images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));
  });
}

async function backToTop(page, settleMs = 1000) {
  await page.evaluate(() => window.scrollTo(0, 0));
  if (settleMs > 0) {
    await new Promise(resolve => setTimeout(resolve, settleMs));
  }
}

module.exports = { scrollToBottom, waitForImages, backToTop };
