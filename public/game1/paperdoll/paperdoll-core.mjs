import {POSES, poseRig, outfitLayers} from '../actor-rig.js?v=1.0.3-tutorialassetcache44';
import {CLOTHES} from '../home-system.js?v=1.0.3-tutorialassetcache44';

// No DOM, storage, player economy, or animation scheduling lives in this module.
export const CAPABILITIES = Object.freeze({
  mode: 'legacy-composite', directions: Object.freeze(['native']),
  poses: Object.freeze([...POSES]), independentSemanticLayers: false,
  interpolatedFrames: false, holdToGrabMs: 200
});
export const SEMANTIC_SLOTS = Object.freeze([
  'tail-back', 'hair-back', 'arm-back', 'hand-back', 'legs', 'shoes',
  'body', 'bottom', 'top', 'neckwear', 'head', 'face', 'hair-front',
  'eyewear', 'headwear', 'arm-front', 'held-prop'
]);
export const SEMANTIC_DIRECTIONS = Object.freeze(['front', 'front-right', 'right', 'back-right', 'back', 'back-left', 'left', 'front-left']);
const whoIs = who => { if (!['cat', 'fox'].includes(who)) throw Error('未知角色。'); return who; };
const finite = (n, label) => { if (!Number.isFinite(n)) throw Error(`${label}必须是有限数。`); return n; };
const point = p => Array.isArray(p) && p.length === 2 && p.every(n => Number.isFinite(n) && n >= 0 && n <= 1);
const plain = o => o !== null && typeof o === 'object' && !Array.isArray(o);
const safePath = p => typeof p === 'string' && /^assets\/[a-zA-Z0-9/_-]+\.(webp|png)$/.test(p) && !p.split('/').includes('..');
const safeFrame = f => typeof f === 'string' ? safePath(f) : plain(f) && safePath(f.src) && point(f.pivot) && Number.isFinite(f.rotationDeg) && Math.abs(f.rotationDeg) <= 360;
const validateTintMask = (mask, slot, canvas) => {
  if (!['top', 'bottom', 'neckwear'].includes(slot) || !plain(mask) || mask.kind !== 'fabric-only' || mask.width !== canvas.width || mask.height !== canvas.height || !safePath(mask.src) || !Array.isArray(mask.protect) || !['fur', 'skin', 'hands', 'shoes', 'props'].every(key => mask.protect.includes(key)) || (mask.protectedSrc !== undefined && !safePath(mask.protectedSrc))) throw Error('换色只接受完整画布、明确保护区域和安全路径的衣料蒙版。');
};
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
const propIs = (prop, who = null, pose = null) => {
  if (![null, 'book', 'paper'].includes(prop)) throw Error('道具没有可用资产。');
  if (prop === 'paper' && who === 'fox') throw Error('小夏没有独立纸张资产，不能静默替换。');
  if (prop === 'book' && pose !== null && !['read', 'standing-read'].includes(pose)) throw Error('只有阅读姿态提供独立书本层。');
  if (prop === 'paper' && pose !== null && pose !== 'standing-read') throw Error('独立纸张只提供小满站立阅读姿态。');
  return prop;
};

export function normalizeOutfit(who, outfit = {top: 0, bottom: 0, accessory: 0}) {
  whoIs(who);
  if (!plain(outfit) || Object.keys(outfit).length !== 3 || !['top', 'bottom', 'accessory'].every(key => Object.hasOwn(outfit, key))) throw Error('服饰必须包含且仅包含top、bottom、accessory。');
  const result = {};
  for (const part of ['top', 'bottom', 'accessory']) {
    const index = outfit[part];
    if (!Number.isInteger(index) || index < 0 || index >= CLOTHES[part].length) throw Error('服饰索引无效。');
    result[part] = part === 'accessory' && index === 2 ? 0 : index;
  }
  return freeze(result);
}

export function createLegacyPlan({who, pose = 'stand', outfit, prop = null, meta, direction = 'native'}) {
  whoIs(who);
  if (direction !== 'native') throw Error('当前素材只提供原生视角，所选方向尚未制作。');
  const clothes = normalizeOutfit(who, outfit);
  propIs(prop, who, pose);
  if (!plain(meta)) throw Error('缺少角色画布元数据。');
  const rig = poseRig(who, pose, meta);
  if (![rig.width, rig.height].every(n => Number.isInteger(n) && n > 0) || !Number.isFinite(rig.ratio) || Math.abs(rig.ratio - rig.height / rig.width) > 1e-6) throw Error('角色画布元数据无效。');
  for (const [key, value] of Object.entries(rig.anchors)) if (value !== undefined && !point(value)) throw Error(`角色${key}锚点无效。`);
  return freeze({
    mode: 'legacy-composite', who, pose, prop, direction, outfit: clothes,
    identity: {intrinsicGlasses: who === 'cat', glassesBakedIntoBody: who === 'cat'},
    canvas: {width: rig.width, height: rig.height, ratio: rig.ratio},
    scale: rig.scale, anchors: structuredClone(rig.anchors),
    layers: outfitLayers(who, pose, clothes, prop).map((layer, index) => ({...layer, order: index, width: rig.width, height: rig.height, recolorable: false})),
    limits: ['身体、尾巴、手与部分道具仍为复合层', '只切换已批准的完整姿态，不插造中间帧', '旧配饰2归零；小满眼镜属于身体固有像素']
  });
}

// Validates metadata only. Decode images and run validateFabricMask before applying a tint.
export function validateSemanticManifest(manifest) {
  if (!plain(manifest) || manifest.schema !== 'paperdoll-semantic-v1') throw Error('纸娃娃语义清单版本不支持。');
  whoIs(manifest.who);
  const {canvas, anchors, directions, clips, layers} = manifest;
  if (!plain(canvas) || ![canvas.width, canvas.height].every(n => Number.isInteger(n) && n > 0 && n <= 4096)) throw Error('语义清单完整画布无效。');
  if (!plain(anchors) || !['feet', 'neck', 'seat'].every(key => point(anchors[key])) || (anchors.waterSpout !== undefined && !point(anchors.waterSpout))) throw Error('语义清单需要明确的脚底、领口、座位锚点。');
  if (!Array.isArray(directions) || !directions.length || new Set(directions).size !== directions.length || directions.some(d => !SEMANTIC_DIRECTIONS.includes(d))) throw Error('方向清单无效。');
  if (!Array.isArray(layers) || !layers.length || layers.length > SEMANTIC_SLOTS.length || new Set(layers.map(l => l.slot)).size !== layers.length) throw Error('语义槽必须唯一。');
  if (!plain(clips) || !Object.keys(clips).length) throw Error('缺少动作帧清单。');
  for (const [id, clip] of Object.entries(clips)) {
    if (!/^[a-z][a-z0-9-]{0,63}$/.test(id) || !plain(clip) || !Array.isArray(clip.framesMs) || !clip.framesMs.length || clip.framesMs.length > 240 || clip.framesMs.some(ms => !Number.isFinite(ms) || ms <= 0 || ms > 60000)) throw Error('动作帧时长无效。');
  }
  if (manifest.who === 'cat' && !layers.some(l => l.slot === 'eyewear' && l.intrinsic === true)) throw Error('小满需要不可卸下的固有眼镜槽。');
  for (const layer of layers) {
    if (!plain(layer) || !SEMANTIC_SLOTS.includes(layer.slot) || layer.width !== canvas.width || layer.height !== canvas.height) throw Error('所有语义层必须保持相同完整画布。');
    if (!plain(layer.frames)) throw Error('缺少语义层帧。');
    if (layer.slot === 'headwear' && layer.item === 'removed-sports-cap') throw Error('已移除的运动帽不得恢复。');
    if (manifest.who === 'fox' && layer.item === 'removed-shoulder-bag') throw Error('已移除的小夏挎包不得恢复。');
    if (layer.tintMask !== undefined) validateTintMask(layer.tintMask, layer.slot, canvas);
    const allFrames = [];
    for (const direction of directions) {
      if (!plain(layer.frames[direction])) throw Error(`语义层缺少${direction}方向。`);
      for (const [id, clip] of Object.entries(clips)) {
        const frames = layer.frames[direction][id];
        if (!Array.isArray(frames) || frames.length !== clip.framesMs.length || frames.some(f => !safeFrame(f))) throw Error('每层、每方向的帧必须齐全且路径安全，不能回退到别的方向。');
        for (const frame of frames) {
          if (typeof frame !== 'string' && frame.tintMask !== undefined) validateTintMask(frame.tintMask, layer.slot, canvas);
          allFrames.push(frame);
        }
      }
    }
    const hasFrameMask = allFrames.some(frame => typeof frame !== 'string' && frame.tintMask !== undefined);
    if (allFrames.length > 1 && (layer.tintMask !== undefined || hasFrameMask) && allFrames.some(frame => typeof frame === 'string' || frame.tintMask === undefined)) throw Error('多方向或多动作帧的衣料层必须逐帧声明蒙版，不能复用全局静态蒙版。');
  }
  return freeze(structuredClone(manifest));
}

export function sampleSemanticPlan(manifest, {direction, clip, elapsedMs = 0, loop = true}) {
  const checked = validateSemanticManifest(manifest);
  if (!checked.directions.includes(direction)) throw Error('该方向没有制作，不能自动镜像。');
  if (!Object.hasOwn(checked.clips, clip)) throw Error('该动作没有制作。');
  if (finite(elapsedMs, '播放时间') < 0) throw Error('播放时间不可为负。');
  const times = checked.clips[clip].framesMs, durationMs = times.reduce((a, b) => a + b, 0);
  let cursor = loop ? elapsedMs % durationMs : Math.min(elapsedMs, durationMs), frame = times.length - 1;
  for (let index = 0; index < times.length; index++) { if (cursor < times[index]) { frame = index; break; } cursor -= times[index]; }
  return freeze({mode: 'semantic', who: checked.who, direction, clip, frame, durationMs,
    canvas: checked.canvas, anchors: checked.anchors,
    layers: checked.layers.map(layer => {
      const source = layer.frames[direction][clip][frame];
      const transform = typeof source === 'string' ? {pivot: [0, 0], rotationDeg: 0} : {pivot: source.pivot, rotationDeg: source.rotationDeg};
      const tintMask = typeof source !== 'string' && source.tintMask !== undefined ? source.tintMask : layer.tintMask;
      return {...layer, src: typeof source === 'string' ? source : source.src, tintMask, transform, matrix: semanticRotationMatrix(checked.canvas, transform)};
    })});
}

// CanvasRenderingContext2D.setTransform(...matrix), then draw the whole layer at 0,0.
// This rotates a new semantic layer around its declared pivot without stretching/cropping it.
export function semanticRotationMatrix(canvas, {pivot, rotationDeg}) {
  if (!plain(canvas) || ![canvas.width, canvas.height].every(n => Number.isInteger(n) && n > 0) || !point(pivot) || !Number.isFinite(rotationDeg) || Math.abs(rotationDeg) > 360) throw Error('语义层旋转参数无效。');
  const angle = rotationDeg * Math.PI / 180, c = Math.cos(angle), s = Math.sin(angle);
  const [x, y] = [pivot[0] * canvas.width, pivot[1] * canvas.height];
  return Object.freeze([c, s, -s, c, x - c * x + s * y, y - s * x - c * y]);
}

export function validateFabricMask({width, height, sourceRGBA, maskRGBA, protectedRGBA}) {
  const length = width * height * 4;
  if (![width, height].every(n => Number.isInteger(n) && n > 0 && n <= 4096) || ![sourceRGBA, maskRGBA, protectedRGBA].every(p => ArrayBuffer.isView(p) && p.BYTES_PER_ELEMENT === 1 && p.length === length)) throw Error('蒙版像素缓冲与完整画布不一致。');
  let paintedPixels = 0;
  for (let alpha = 3; alpha < length; alpha += 4) {
    if (maskRGBA[alpha] === 0) continue;
    if (maskRGBA[alpha] > sourceRGBA[alpha]) throw Error('衣料蒙版超出实体图层。');
    if (protectedRGBA[alpha] > 0) throw Error('衣料蒙版覆盖了手、皮毛、鞋或道具保护区。');
    paintedPixels++;
  }
  if (!paintedPixels) throw Error('衣料蒙版没有可换色像素。');
  return Object.freeze({ok: true, paintedPixels});
}

export function tintFabricPixels({width, height, sourceRGBA, maskRGBA, protectedRGBA, color}) {
  validateFabricMask({width, height, sourceRGBA, maskRGBA, protectedRGBA});
  if (!Array.isArray(color) || color.length !== 3 || color.some(n => !Number.isInteger(n) || n < 0 || n > 255)) throw Error('衣料颜色须为三个0–255整数。');
  const result = new Uint8ClampedArray(sourceRGBA);
  for (let alpha = 3; alpha < sourceRGBA.length; alpha += 4) {
    if (!maskRGBA[alpha]) continue;
    const coverage = maskRGBA[alpha] / sourceRGBA[alpha];
    const luminance = (.2126 * sourceRGBA[alpha - 3] + .7152 * sourceRGBA[alpha - 2] + .0722 * sourceRGBA[alpha - 1]) / 255;
    for (let c = 0; c < 3; c++) result[alpha - 3 + c] = Math.round(sourceRGBA[alpha - 3 + c] * (1 - coverage) + color[c] * luminance * coverage);
  }
  return result;
}

export function compileTimeline(source) {
  if (!plain(source) || typeof source.id !== 'string' || !/^[a-z][a-z0-9-]{0,63}$/.test(source.id) || typeof source.loop !== 'boolean' || !Array.isArray(source.segments) || !source.segments.length || source.segments.length > 512) throw Error('动作时间线定义无效。');
  let at = 0;
  const segments = source.segments.map((segment, index) => {
    if (!plain(segment) || !POSES.includes(segment.pose) || !Number.isFinite(segment.durationMs) || segment.durationMs <= 0 || segment.durationMs > 600000) throw Error('动作段必须使用已存在姿态和有效时长。');
    if (segment.direction !== undefined && segment.direction !== 'native') throw Error('现有动作段只支持原生视角。');
    const prop = propIs(segment.prop ?? null, null, segment.pose);
    const entry = {id: segment.id ?? `${source.id}-${index}`, pose: segment.pose, prop, direction: 'native', durationMs: segment.durationMs, startMs: at};
    if (typeof entry.id !== 'string' || !/^[a-z][a-z0-9-]{0,63}$/.test(entry.id)) throw Error('动作段标识无效。');
    at += segment.durationMs;
    return entry;
  });
  if (at > 3600000) throw Error('动作时间线总长超过一小时。');
  if (new Set(segments.map(s => s.id)).size !== segments.length) throw Error('动作段标识重复。');
  return freeze({id: source.id, loop: source.loop, durationMs: at, segments});
}

export function createTimelinePlayer(source) {
  const timeline = compileTimeline(source);
  let status = 'idle', elapsedMs = 0, lastNow = null, grab = null;
  const stamp = now => {
    finite(now, '时钟');
    if (now < 0 || (lastNow !== null && now < lastNow)) throw Error('请提供单调递增的非负时钟。');
    if (status === 'playing' && lastNow !== null) elapsedMs += now - lastNow;
    lastNow = now;
    if (status === 'playing' && !timeline.loop && elapsedMs >= timeline.durationMs) { elapsedMs = timeline.durationMs; status = 'completed'; }
    if (status === 'grab-pending' && now - grab.startedAt >= CAPABILITIES.holdToGrabMs) status = 'grabbed';
  };
  const snapshot = () => {
    const localMs = timeline.loop ? elapsedMs % timeline.durationMs : Math.min(elapsedMs, timeline.durationMs);
    const index = localMs === timeline.durationMs ? timeline.segments.length - 1 : timeline.segments.findIndex(s => localMs >= s.startMs && localMs < s.startMs + s.durationMs);
    const segment = timeline.segments[index];
    return freeze({status, elapsedMs, localMs, durationMs: timeline.durationMs, segmentIndex: index, segmentId: segment.id,
      pose: status === 'grabbed' ? 'stand' : segment.pose,
      prop: status === 'grabbed' ? null : segment.prop, direction: 'native',
      segmentProgress: Math.min(1, Math.max(0, (localMs - segment.startMs) / segment.durationMs)),
      progress: localMs / timeline.durationMs, staticGrab: status === 'grabbed'});
  };
  const noGrab = () => { if (grab) throw Error('抓取期间请先释放角色。'); };
  return Object.freeze({
    timeline, snapshot,
    play(now = lastNow ?? 0) { stamp(now); grab = null; elapsedMs = 0; status = 'playing'; return snapshot(); },
    update(now) { stamp(now); return snapshot(); },
    pause(now) { stamp(now); noGrab(); if (status === 'playing') status = 'paused'; return snapshot(); },
    resume(now) { stamp(now); noGrab(); if (status === 'paused') status = 'playing'; return snapshot(); },
    seek(ms, now) { finite(ms, '跳转时间'); if (ms < 0 || ms > timeline.durationMs) throw Error('跳转时间超出时间线。'); stamp(now); noGrab(); elapsedMs = ms; if (!timeline.loop && ms === timeline.durationMs) status = 'completed'; else if (status !== 'playing') status = 'paused'; return snapshot(); },
    cancel() { status = 'cancelled'; grab = null; elapsedMs = 0; return snapshot(); },
    beginGrab(now) { stamp(now); if (grab) return snapshot(); grab = {startedAt: now, previousStatus: status}; status = 'grab-pending'; return snapshot(); },
    releaseGrab(now, {resume = true} = {}) { stamp(now); if (!grab) return snapshot(); status = grab.previousStatus === 'playing' ? (resume ? 'playing' : 'paused') : grab.previousStatus; grab = null; return snapshot(); }
  });
}
