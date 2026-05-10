const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log('启动浏览器内核...');
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // 设置一个比较宽的桌面视口
    await page.setViewport({ width: 1440, height: 900 });

    console.log('正在访问网站 https://renxuanqi.top ...');
    await page.goto('https://renxuanqi.top', { waitUntil: 'networkidle0', timeout: 60000 });

    console.log('模拟平滑滚动，触发所有的入场动画和图片懒加载...');
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 150;
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

    // 稍微等待最后一点动画结束
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 滚回顶部，确保截取的位置正常
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('正在计算页面总高度...');
    const bodyHandle = await page.$('body');
    const boundingBox = await bodyHandle.boundingBox();

    console.log('正在生成长页 PDF (保留所有样式和深色背景)...');
    await page.pdf({
      path: '../液态像素工作室_作品集.pdf',
      width: boundingBox.width,
      height: boundingBox.height + 50, // 增加一点底部边距
      printBackground: true, // 必须开启，否则背景是白的
    });

    console.log('🎉 PDF 导出成功！文件已保存在桌面的 RXQ WEB 文件夹下。');
  } catch (err) {
    console.error('导出失败:', err);
  } finally {
    await browser.close();
  }
})();