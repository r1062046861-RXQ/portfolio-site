const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // 设置一个主流的桌面分辨率
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 2, // 视网膜屏幕，截图更清晰
  });

  console.log('正在访问本地网站 http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  console.log('模拟真实用户向下滚动，触发所有的入场动画...');
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });

  // 等待一下让最后一个动画播完
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 滚回到顶部，保证截图的起点正确
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('正在生成全网页高清长图...');
  await page.screenshot({ 
    path: 'website_full_screenshot.png', 
    fullPage: true 
  });

  console.log('截图成功！保存在: website_full_screenshot.png');
  await browser.close();
})();