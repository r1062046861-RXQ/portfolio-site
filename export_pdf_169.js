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
    
    // 设置 1920x1080 (标准 16:9 比例)
    await page.setViewport({ width: 1920, height: 1080 });

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

    console.log('强制显示所有卡片的悬浮文字内容...');
    await page.evaluate(() => {
      // 遍历所有的案例卡片，强制触发 Hover 时的所有样式
      document.querySelectorAll('.group').forEach(el => {
        // 强制显示说明文字
        const p = el.querySelector('p');
        if (p) p.style.setProperty('opacity', '1', 'important');
        
        // 强制文字上移
        const z20 = el.querySelector('.z-20');
        if (z20) z20.style.setProperty('transform', 'translateY(0)', 'important');
        
        // 强制图片放大变亮
        const img = el.querySelector('img');
        if (img) {
          img.style.setProperty('opacity', '1', 'important');
          img.style.setProperty('transform', 'scale(1.05)', 'important');
        }

        // 强制背景渐变变黑，保证文字清晰
        const gradient = el.querySelector('.from-black\\/95');
        if (gradient) {
            gradient.style.setProperty('background', 'linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0.7), transparent)', 'important');
        }
      });
    });

    console.log('注入打印样式，优化 16:9 分页断点...');
    await page.addStyleTag({ content: `
      @media print {
        /* 隐藏悬浮的导航栏，避免每页都出现遮挡内容 */
        nav { display: none !important; }
        
        /* 防止卡片被从中间切断，保证分页完整 */
        .grid > div { break-inside: avoid !important; page-break-inside: avoid !important; }
        section { break-inside: auto !important; }
        h2, h3 { break-after: avoid !important; page-break-after: avoid !important; }
        
        /* 保证页面背景颜色正确导出 */
        body { background-color: black !important; -webkit-print-color-adjust: exact; color-adjust: exact; }
      }
    `});

    console.log('正在生成 16:9 分页 PDF...');
    await page.pdf({
      path: '../液态像素工作室_16_9演示版.pdf',
      width: '1920px',
      height: '1080px', // 严格 16:9 尺寸分页
      printBackground: true, 
      margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' }
    });

    console.log('🎉 16:9 分页 PDF 导出成功！文件已保存在桌面的 RXQ WEB 文件夹下。');
  } catch (err) {
    console.error('导出失败:', err);
  } finally {
    await browser.close();
  }
})();