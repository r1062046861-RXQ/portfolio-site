const puppeteer = require('puppeteer');

(async () => {
  console.log('启动浏览器...');
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // 设置 1920x1080 视口保证布局正确
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('正在访问网站 https://renxuanqi.top ...');
    await page.goto('https://renxuanqi.top', { waitUntil: 'networkidle0', timeout: 60000 });

    console.log('模拟平滑滚动，触发所有的入场动画和图片懒加载...');
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 200;
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

    console.log('等待图片完全加载...');
    await new Promise(resolve => setTimeout(resolve, 3000)); // 给充足时间加载网络图片
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

    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('强制显示所有卡片的悬浮文字内容并进行【极致图片压缩】...');
    await page.evaluate(async () => {
      // 0. 强制显示所有由于 framer-motion 初始化隐藏的元素（例如气泡）
      document.querySelectorAll('*').forEach(el => {
        if (el.style.opacity === '0' || parseFloat(el.style.opacity) < 1) {
          el.style.setProperty('opacity', '1', 'important');
        }
        // 移除气泡可能残留的 scale/translate 隐藏状态
        if (el.classList.contains('rounded-full') && el.classList.contains('border')) {
           el.style.setProperty('transform', 'none', 'important');
           el.style.setProperty('opacity', '1', 'important');
        }
      });

      // 1. 强制悬浮效果，确保案例文字显示
      document.querySelectorAll('.group').forEach(el => {
        const p = el.querySelector('p');
        if (p) p.style.setProperty('opacity', '1', 'important');
        
        const z20 = el.querySelector('.z-20');
        if (z20) z20.style.setProperty('transform', 'translateY(0)', 'important');
        
        const img = el.querySelector('img');
        if (img) {
          img.style.setProperty('opacity', '0.7', 'important');
          img.style.setProperty('transform', 'scale(1.05)', 'important');
        }
      });

      // 2. 将所有高分辨率 PNG/JPG 转换为极低分辨率的 JPEG (解决 3M 大小限制和 PDF 翻页卡顿)
      const imgs = Array.from(document.querySelectorAll('img'));
      for (let img of imgs) {
        try {
          if (!img.src || img.src.startsWith('data:')) continue;
          const canvas = document.createElement('canvas');
          
          // 限制最大宽度为 800px（对于 PDF 完全够用），极大压缩体积
          const MAX_WIDTH = 800;
          let w = img.naturalWidth || img.width || 800;
          let h = img.naturalHeight || img.height || 600;
          
          if (w > MAX_WIDTH) {
            h = Math.floor(h * (MAX_WIDTH / w));
            w = MAX_WIDTH;
          }
          
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          
          // 填充黑色背景，防止 PNG 透明通道转 JPEG 变黑块异常
          ctx.fillStyle = 'black';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          
          // 转成 40% 质量的 JPEG
          const dataURL = canvas.toDataURL('image/jpeg', 0.4); 
          
          // 替换原本的超大图片
          img.src = dataURL;
          img.removeAttribute('srcset');
          img.removeAttribute('sizes');
        } catch(e) {
          console.log('某张图片压缩失败，跳过...');
        }
      }
    });

    console.log('注入终极排版样式 (修复二维码、单页压缩、首页 Logo)...');
    await page.addStyleTag({ content: `
      @media print {
        /* 处理导航栏，只在第一页显示左上角 Logo */
        nav { 
          position: absolute !important; 
          top: 0 !important; 
          left: 0 !important; 
          display: flex !important; 
          mix-blend-mode: normal !important;
        }
        nav .hidden.md\\:flex, nav a[href="#contact"] { 
          display: none !important; /* 隐藏中间链接和右侧按钮 */
        }
        footer { display: none !important; }
        
        /* 极致性能优化，去除 backdrop-filter 防止 Chrome 打印 PDF 时元素消失 */
        * { box-shadow: none !important; text-shadow: none !important; animation: none !important; transition: none !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
        
        /* 强制覆盖 framer-motion 在气泡和容器上的初始隐藏状态 */
        .mb-8, .rounded-full {
            opacity: 1 !important;
            transform: none !important;
            visibility: visible !important;
        }

        /* 修复二维码消失的问题：去掉了 .mix-blend-screen 的隐藏规则，二维码的混色就能正常显示了 */
        .blur-\\[120px\\], .animate-pulse, .bg-grid-pattern { display: none !important; }
        .from-black\\/95, .bg-gradient-to-br, .bg-gradient-to-t, .bg-gradient-to-b { background: none !important; background-color: rgba(0,0,0,0.8) !important; }
        
        /* 去除 3D 透视导致的问题 */
        .h-full { transform: none !important; perspective: none !important; }
        
        /* 核心分页逻辑：每一个大模块 (section) 强制换新页 */
        section { 
          page-break-before: always !important; 
          break-before: page !important; 
          page-break-inside: auto !important;
          break-inside: auto !important;
          min-height: 100vh !important; 
          padding: 60px 40px !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
        }
        
        /* 第一个首屏不需要前置换页 */
        section:first-of-type { 
          page-break-before: avoid !important; 
          break-before: auto !important; 
        }

        /* --- 针对案例展示(#works)模块的极致压缩排版：强行压到一页 --- */
        #works {
          padding: 20px 40px !important; /* 减小外边距 */
          max-height: 100vh !important;
          overflow: hidden !important;
        }
        #works h2 {
          margin-bottom: 20px !important; /* 减小标题下边距 */
        }
        #works .grid {
          gap: 12px !important; /* 缩小网格间距 */
        }
        #works .group {
          height: 270px !important; /* 稍微增加一点高度 */
          padding: 24px !important; /* 增加卡片内边距，让文字不贴边 */
          justify-content: center !important; /* 让内容在卡片内垂直居中偏下，而不是死死贴着底部 */
        }
        #works .group h3 {
          font-size: 16px !important;
          margin-bottom: 6px !important;
        }
        #works .group p {
          font-size: 12px !important; /* 字稍微放大一点点 */
          line-height: 1.4 !important;
          margin-top: 6px !important;
        }
        #works .group .text-xs {
          font-size: 12px !important;
          margin-bottom: 6px !important;
        }
        /* ------------------------------------------- */

        /* 防止其他网格卡片从中间断开 */
        .grid > div { 
          page-break-inside: avoid !important; 
          break-inside: avoid !important; 
        }
        
        body { background-color: black !important; -webkit-print-color-adjust: exact; color-adjust: exact; }
      }
    `});

    console.log('正在生成终极演示版 16:9 PDF...');
    await page.pdf({
      path: '../液态像素工作室_完美排版版.pdf',
      width: '16in',  // 严格 16:9 比例 (约 1536px)
      height: '9in',  // (约 864px)
      printBackground: true, 
      margin: { top: '0', bottom: '0', left: '0', right: '0' }
    });

    console.log('🎉 完美排版版 PDF 导出成功！体积已极限压缩，文件已保存在桌面的 RXQ WEB 文件夹下。');
  } catch (err) {
    console.error('导出失败:', err);
  } finally {
    await browser.close();
  }
})();