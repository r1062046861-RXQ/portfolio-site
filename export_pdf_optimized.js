const puppeteer = require('puppeteer');

(async () => {
  console.log('启动浏览器内核...');
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // 设置适中的桌面视口
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

    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('强制显示所有卡片的悬浮文字内容...');
    await page.evaluate(() => {
      document.querySelectorAll('.group').forEach(el => {
        const p = el.querySelector('p');
        if (p) p.style.setProperty('opacity', '1', 'important');
        
        const z20 = el.querySelector('.z-20');
        if (z20) z20.style.setProperty('transform', 'translateY(0)', 'important');
        
        const img = el.querySelector('img');
        if (img) {
          img.style.setProperty('opacity', '1', 'important');
          img.style.setProperty('transform', 'scale(1.05)', 'important');
        }

        const gradient = el.querySelector('.from-black\\/95');
        if (gradient) {
            gradient.style.setProperty('background', 'linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0.7), transparent)', 'important');
        }
      });
    });

    console.log('注入打印样式，移除导致 PDF 卡顿的复杂特效，并优化自然分页...');
    await page.addStyleTag({ content: `
      @media print {
        /* 隐藏悬浮导航栏 */
        nav, .fixed { display: none !important; }
        
        /* 极其重要：隐藏所有高斯模糊、混合模式（mix-blend-screen）和光晕！这是导致 PDF 文件巨大且打开极其卡顿的元凶 */
        .blur-\\[120px\\], .mix-blend-screen, .animate-pulse, .bg-grid-pattern { display: none !important; }
        
        /* 移除卡片自带的 3D 景深效果导致的渲染重绘 */
        .h-full { transform: none !important; perspective: none !important; }
        
        /* 更好的分页控制：允许页面自然流动，但防止卡片内部被切断 */
        .grid > div { 
          page-break-inside: avoid !important; 
          break-inside: avoid !important; 
          margin-bottom: 20px !important;
        }
        
        section { 
          page-break-inside: auto !important; 
          break-inside: auto !important;
          padding-top: 40px !important;
          padding-bottom: 40px !important;
        }
        
        h2, h3 { break-after: avoid !important; page-break-after: avoid !important; }
        
        /* 保证页面背景颜色正确导出 */
        body { background-color: black !important; -webkit-print-color-adjust: exact; color-adjust: exact; }
      }
    `});

    console.log('正在生成优化版横向 PDF...');
    await page.pdf({
      path: '../液态像素工作室_最终优化版.pdf',
      format: 'A3', // 采用 A3 纸张大小，有足够的宽度容纳横向卡片
      landscape: true, // 横向排版
      printBackground: true, 
      margin: { top: '40px', bottom: '40px', left: '40px', right: '40px' } // 增加边距让呼吸感更好
    });

    console.log('🎉 优化版 PDF 导出成功！文件已保存在桌面的 RXQ WEB 文件夹下。');
  } catch (err) {
    console.error('导出失败:', err);
  } finally {
    await browser.close();
  }
})();