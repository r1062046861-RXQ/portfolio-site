import {tintFabricPixels} from './paperdoll-core.mjs?v=paperdoll-v1-20261108-43';

const images = new Map();
const safeAsset = src => typeof src === 'string' && /^assets\/[a-zA-Z0-9/_-]+\.(webp|png)$/.test(src) && !src.split('/').includes('..');
async function load(src, assetBase) {
  if (!safeAsset(src)) throw Error('角色素材路径无效。');
  const url = new URL(src, new URL(assetBase, location.href)).href;
  if (!images.has(url)) {
    images.set(url, (async () => {const img = new Image(); img.src = url; await img.decode(); return img;})().catch(() => {images.delete(url); throw Error('角色素材加载失败：' + src);}));
    if (images.size > 256) images.delete(images.keys().next().value);
  }
  return images.get(url);
}
function raster(image, width, height) {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const context = canvas.getContext('2d', {willReadFrequently: true}); context.drawImage(image, 0, 0);
  return {canvas, context, pixels: context.getImageData(0, 0, width, height)};
}
function marker(ctx, x, y, label, color) {
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.moveTo(x - 13, y); ctx.lineTo(x + 13, y); ctx.moveTo(x, y - 13); ctx.lineTo(x, y + 13); ctx.stroke();
  ctx.font = '20px system-ui'; ctx.fillText(label, x + 14, y - 12); ctx.restore();
}

// Reusable renderer: no UI, storage, rules, or scheduling. The caller supplies a validated plan.
export function createPaperdollRenderer({canvas, assetBase = new URL('../', import.meta.url).href, loadImage = src => load(src, assetBase)}) {
  if (!canvas || typeof canvas.getContext !== 'function') throw Error('纸娃娃渲染需要画布。');
  let revision = 0;
  return Object.freeze({
    cancel() {revision++;},
    async render(plan, {hidden = [], anchors = false, grabbed = false, coordinateSpace = 'stage', tints = {}} = {}) {
      const ticket = ++revision;
      if (!plan || !['legacy-composite', 'semantic'].includes(plan.mode) || !plan.layers?.length || !['stage', 'native'].includes(coordinateSpace)) throw Error('纸娃娃绘制计划无效。');
      if (plan.mode === 'semantic' && plan.layers.some(layer => !Array.isArray(layer.matrix) || layer.matrix.length !== 6 || !layer.matrix.every(Number.isFinite))) throw Error('缺少有效的语义层变换矩阵。');
      if (plan.mode === 'legacy-composite' && Object.keys(tints).length) throw Error('原复合图层禁止自动换色。');
      for (const slot of Object.keys(tints)) if (!plan.layers.some(layer => layer.slot === slot && layer.tintMask && ['top', 'bottom', 'neckwear'].includes(slot))) throw Error('换色需要明确的衣料槽和蒙版。');
      const width = plan.canvas.width, height = plan.canvas.height;
      const sized = async src => {const image = await loadImage(src); if ((image.naturalWidth ?? image.width) !== width || (image.naturalHeight ?? image.height) !== height) throw Error('所有角色图层和蒙版必须保持同一完整画布。'); return image;};
      const parts = await Promise.all(plan.layers.map(async layer => {
        const image = await sized(layer.src), tint = tints[layer.slot];
        if (!tint) return image;
        const protectedSrc = tint.protectedSrc ?? layer.tintMask.protectedSrc;
        if (!Array.isArray(tint.color) || !safeAsset(layer.tintMask.src) || !safeAsset(protectedSrc)) throw Error('换色需要当前帧衣料蒙版、保护蒙版和明确RGB。');
        const [mask, protection] = await Promise.all([sized(layer.tintMask.src), sized(protectedSrc)]);
        const source = raster(image, width, height);
        source.pixels.data.set(tintFabricPixels({width, height, sourceRGBA: source.pixels.data, maskRGBA: raster(mask, width, height).pixels.data, protectedRGBA: raster(protection, width, height).pixels.data, color: tint.color}));
        source.context.putImageData(source.pixels, 0, 0); return source.canvas;
      }));
      if (ticket !== revision) return {committed: false};
      const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height);
      const native = coordinateSpace === 'native';
      const scale = native ? 1 : canvas.height * (plan.scale ?? .30) * 2 / height;
      const floor = canvas.height * 371 / 420 - (grabbed ? canvas.height / 21 : 0);
      const left = native ? 0 : canvas.width / 2 - width * scale * plan.anchors.feet[0];
      const top = native ? 0 : floor - height * scale * plan.anchors.feet[1];
      if (!native) {ctx.save(); ctx.strokeStyle = '#a4b1a0'; ctx.lineWidth = 1; ctx.setLineDash([8, 7]); ctx.beginPath(); ctx.moveTo(24, canvas.height * 371 / 420); ctx.lineTo(canvas.width - 24, canvas.height * 371 / 420); ctx.stroke(); ctx.restore();}
      for (let i = 0; i < parts.length; i++) {
        const layer = plan.layers[i]; if (hidden.includes(layer.role ?? layer.slot)) continue;
        ctx.save(); ctx.translate(left, top); ctx.scale(scale, scale);
        if (plan.mode === 'semantic') {
          ctx.transform(...layer.matrix);
        }
        // Always draw the entire source canvas, at its original coordinate origin.
        ctx.drawImage(parts[i], 0, 0); ctx.restore();
      }
      if (anchors && !native) {
        ctx.save(); ctx.strokeStyle = '#80998c'; ctx.lineWidth = 1; ctx.setLineDash([5, 6]); ctx.strokeRect(left, top, width * scale, height * scale); ctx.restore();
        for (const [key, label, color] of [['feet', '脚底', '#a65a3e'], ['neck', '领口', '#2b7380'], ...(['sit', 'read', 'sip', 'craft', 'sew', 'type', 'rest', 'exercise'].includes(plan.pose) ? [['seat', '座位', '#8868a3']] : []), ...(plan.anchors.waterSpout ? [['waterSpout', '壶嘴', '#2b7380']] : [])]) {
          const p = plan.anchors[key]; if (p) marker(ctx, left + p[0] * width * scale, top + p[1] * height * scale, label, color);
        }
      }
      return {committed: true, width, height, layerCount: parts.length};
    }
  });
}
