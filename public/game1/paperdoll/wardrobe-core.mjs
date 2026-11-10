import {createLegacyPlan} from './paperdoll-core.mjs?v=paperdoll-wardrobe-20261110-152';

export const WARDROBE_SLOTS = Object.freeze(['onepiece', 'top', 'bottom', 'outerwear', 'neckwear', 'suspenders', 'brooch', 'earwear', 'waistwear', 'shoes']);
export const WARDROBE_LABELS = Object.freeze({onepiece: '连衣裙 / 背带裤', top: '上衣', bottom: '裤装 / 半裙', outerwear: '外套', neckwear: '领饰', suspenders: '背带', brooch: '胸针', earwear: '耳饰', waistwear: '腰饰', shoes: '鞋履'});
const freeze = value => {if (value && typeof value === 'object') {Object.values(value).forEach(freeze); Object.freeze(value);} return value;};
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function validateWardrobeCatalog(source, meta) {
  if (!plain(source) || source.schema !== 'paperdoll-fitted-wardrobe-v1' || !Array.isArray(source.items) || source.items.length !== source.count || !source.count || JSON.stringify(source.availablePoses) !== '["stand"]') throw Error('适配服饰清单无效。');
  const ids = new Set();
  for (const item of source.items) {
    if (!plain(item) || !/^[A-Z]{1,2}\d{2}$/.test(item.id) || ids.has(item.id) || item.approved !== true || item.approvalContinuation !== 151 || !WARDROBE_SLOTS.includes(item.slot) || JSON.stringify(item.poses) !== '["stand"]' || typeof item.name !== 'string' || !item.name.trim()) throw Error('款式须编号唯一、已批准并明确站姿槽位。');
    ids.add(item.id);
    if (item.thumbnail !== `assets/wardrobe-v1/${item.id}-thumb.png`) throw Error('服饰缩略图路径无效。');
    for (const who of ['cat', 'fox']) {
      const asset = item.actors?.[who], rig = meta[`${who}-stand`];
      if (!asset || !rig || asset.src !== `assets/wardrobe-v1/${who}-stand-${item.id}.png` || JSON.stringify(asset.canvas) !== JSON.stringify([rig.width, rig.height]) || !/^[a-f0-9]{64}$/.test(asset.sha256)) throw Error('服饰必须提供双人完整原生画布。');
      if (asset.bodySrc !== undefined && asset.bodySrc !== `assets/wardrobe-v1/${who}-stand-body-${item.id}.png`) throw Error('露肤适配层路径无效。');
      if (asset.frontSrc !== undefined && asset.frontSrc !== `assets/wardrobe-v1/${who}-stand-front-${item.id}.png`) throw Error('袖口前手适配层路径无效。');
      if (asset.underlayClipSrc !== undefined && (item.kind !== 'outerwear' || asset.underlayClipSrc !== `assets/wardrobe-v1/${who}-stand-underlay-${item.id}.png`)) throw Error('外套遮挡层路径无效。');
    }
  }
  return freeze(structuredClone(source));
}

export function normalizeWardrobe(catalog, selection = {}) {
  if (!plain(selection) || Object.keys(selection).some(slot => !WARDROBE_SLOTS.includes(slot))) throw Error('穿戴槽位无效。');
  const result = Object.fromEntries(WARDROBE_SLOTS.map(slot => [slot, selection[slot] ?? null]));
  for (const [slot, id] of Object.entries(result)) {
    if (id === null) continue;
    if (typeof id !== 'string' || !catalog.items.some(item => item.id === id && item.slot === slot)) throw Error('款式不属于所选穿戴部位。');
  }
  if (result.onepiece?.startsWith('WD') && (result.top || result.bottom)) throw Error('连衣裙替代上衣和下装；可另配外套。');
  if (result.onepiece === 'A06' && result.bottom) throw Error('背带裤替代下装；可另配内搭。');
  return freeze(result);
}

export function equipWardrobeItem(catalog, selection, id) {
  const result = {...normalizeWardrobe(catalog, selection)};
  const item = catalog.items.find(item => item.id === id);
  if (!item) throw Error('该款式尚未制作。');
  result[item.slot] = id;
  if (item.slot === 'onepiece') {result.bottom = null; if (item.kind === 'dress') result.top = null;}
  if (item.slot === 'bottom' || (item.slot === 'top' && result.onepiece?.startsWith('WD'))) result.onepiece = null;
  return normalizeWardrobe(catalog, result);
}

export function createWardrobePlan({who, selection, catalog, meta, pose = 'stand'}) {
  if (pose !== 'stand') throw Error('本批服饰仅完成站姿，其他动作需逐帧适配。');
  const outfit = normalizeWardrobe(catalog, selection);
  // The owning actor-rig recipe still defines canvas, anchors, scale and the
  // sequence body -> bottom -> top -> front -> accessory. Replace complete
  // canvases within those existing roles; never add a second rig or CSS fitting.
  const legacy = createLegacyPlan({who, pose, outfit: {top: 3, bottom: 0, accessory: 0}, meta});
  const items = new Map(catalog.items.map(item => [item.id, item]));
  const layer = (id, role) => ({role, item: id, name: items.get(id).name, src: items.get(id).actors[who].src});
  const dress = outfit.onepiece && items.get(outfit.onepiece).kind === 'dress';
  const base = suffix => ({src: `assets/wardrobe-v1/${who}-stand-${suffix}.png`});
  const dominant = outfit.outerwear || outfit.onepiece || outfit.top;
  const bodySrc = dominant && items.get(dominant).actors[who].bodySrc;
  const frontSrc = dominant && items.get(dominant).actors[who].frontSrc;
  const replacements = {
    'body-and-tail': [bodySrc ? {src: bodySrc} : base('body')],
    bottom: outfit.onepiece ? [] : outfit.bottom ? [layer(outfit.bottom, 'bottom')] : null,
    top: [
      ...(dress ? [] : outfit.top ? [layer(outfit.top, 'top')] : [legacy.layers.find(l => l.role === 'top')]),
      ...(outfit.onepiece ? [layer(outfit.onepiece, 'top')] : []),
      ...(outfit.outerwear ? [layer(outfit.outerwear, 'top')] : [])
    ],
    'front-hands-and-props': [frontSrc ? {src: frontSrc} : base('front')],
    accessory: [
      ...(!outfit.shoes ? [{...base('feet'), name: '原角色鞋履'}] : []),
      ...['neckwear', 'suspenders', 'brooch', 'waistwear', 'earwear', 'shoes'].flatMap(slot => outfit[slot] ? [layer(outfit[slot], 'accessory')] : [])
    ]
  };
  const underlayClip = outfit.outerwear && items.get(outfit.outerwear).actors[who].underlayClipSrc;
  const layers = legacy.layers.flatMap(original => (replacements[original.role] ?? [original]).map(part => ({...original, ...part,
    ...(underlayClip && original.role === 'top' && part.item !== outfit.outerwear ? {clipSrc: underlayClip} : {})})))
    .map((part, order) => ({...part, order, role: part.item ? `${part.role}:${part.item}` : part.role, recolorable: false}));
  return freeze({...legacy, outfit, wardrobe: true, layers, limits: ['站姿试衣；新服饰动作帧待制作', '原生完整画布；主体配方、比例与锚点沿用actor-rig', '不提供自动换色、其他方向或静默姿态回退']});
}
