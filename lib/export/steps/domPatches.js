const { SELECTORS } = require('../config');

const EXISTS = {};
function warnOnce(sel) {
  if (EXISTS[sel] !== undefined) return EXISTS[sel];
  EXISTS[sel] = true;
  console.warn(`[domPatches] 未匹配到选择器 "${sel}"，请检查页面结构是否变更。`);
}

async function forceOpacity(page) {
  console.log('强制显示所有 framer-motion 初始隐藏的元素...');
  await page.evaluate(({ roundedFull, allElements }) => {
    document.querySelectorAll(allElements).forEach(el => {
      if (el.style.opacity === '0' || parseFloat(el.style.opacity) < 1) {
        el.style.setProperty('opacity', '1', 'important');
      }
      if (el.classList.contains('rounded-full') && el.classList.contains('border')) {
        el.style.setProperty('transform', 'none', 'important');
        el.style.setProperty('opacity', '1', 'important');
      }
    });
  }, SELECTORS);
}

async function revealHoverText(page) {
  console.log('强制显示所有卡片的悬浮文字内容...');
  await page.evaluate(({ group, hoverText, hoverTransform, hoverImg, hoverGradient }) => {
    const cards = document.querySelectorAll(group);
    if (cards.length === 0) {
      window.__domPatchWarning = `未匹配到 "${group}"`;
      return;
    }

    cards.forEach(el => {
      const p = el.querySelector('p');
      if (p) p.style.setProperty('opacity', '1', 'important');

      const z20 = el.querySelector('.z-20');
      if (z20) z20.style.setProperty('transform', 'translateY(0)', 'important');

      const img = el.querySelector('img');
      if (img) {
        img.style.setProperty('opacity', '0.7', 'important');
        img.style.setProperty('transform', 'scale(1.05)', 'important');
      }

      const gradient = el.querySelector('.from-black\\/95');
      if (gradient) {
        gradient.style.setProperty('background', 'linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0.7), transparent)', 'important');
      }
    });
  }, SELECTORS);

  const warning = await page.evaluate(() => window.__domPatchWarning);
  if (warning) console.warn(`[domPatches] ${warning}`);
}

async function compressImages(page, { maxWidth = 800, quality = 0.4 } = {}) {
  console.log('极致图片压缩...');
  await page.evaluate(async (mw, q) => {
    const imgs = Array.from(document.querySelectorAll('img'));
    for (const img of imgs) {
      try {
        if (!img.src || img.src.startsWith('data:')) continue;
        const canvas = document.createElement('canvas');
        let w = img.naturalWidth || img.width || 800;
        let h = img.naturalHeight || img.height || 600;

        if (w > mw) {
          h = Math.floor(h * (mw / w));
          w = mw;
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        img.src = canvas.toDataURL('image/jpeg', q);
        img.removeAttribute('srcset');
        img.removeAttribute('sizes');
      } catch (e) {
        console.log('某张图片压缩失败，跳过...');
      }
    }
  }, maxWidth, quality);
}

async function injectPrintStyles(page, css) {
  console.log('注入打印样式...');
  await page.addStyleTag({ content: css });
}

module.exports = { forceOpacity, revealHoverText, compressImages, injectPrintStyles };
