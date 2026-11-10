import {createTimelinePlayer} from './paperdoll-core.mjs?v=paperdoll-wardrobe-20261110-152';
import {createPaperdollRenderer} from './paperdoll-renderer.mjs?v=paperdoll-wardrobe-20261110-152';
import {WARDROBE_SLOTS, WARDROBE_LABELS, validateWardrobeCatalog, normalizeWardrobe, equipWardrobeItem, createWardrobePlan} from './wardrobe-core.mjs?v=paperdoll-wardrobe-20261110-152';

const $ = id => document.getElementById(id);
const names = {cat: '小满', fox: '小夏'};
const assets = new Map();
async function loadImage(src) {
  if (!/^assets\/[a-zA-Z0-9/_-]+\.(png|webp)$/.test(src) || src.split('/').includes('..')) throw Error('服饰图片路径无效。');
  const url = (src.startsWith('assets/home/') ? '../' : './') + src;
  if (!assets.has(url)) {
    assets.set(url, (async () => {const image = new Image(); image.src = url + '?v=paperdoll-wardrobe-20261110-152'; await image.decode(); return image;})().catch(() => {assets.delete(url); throw Error('服饰载入失败：' + src);}));
    if (assets.size > 240) assets.delete(assets.keys().next().value);
  }
  return assets.get(url);
}
const json = async url => {const response = await fetch(url); if (!response.ok) throw Error('服饰清单载入失败。'); return response.json();};
const [meta, source] = await Promise.all([json('../assets/home/meta.json'), json('./assets/wardrobe-v1/catalog.json?v=paperdoll-wardrobe-20261110-152')]);
const catalog = validateWardrobeCatalog(source, meta);
const recommended = {cat: {onepiece: 'WD01', brooch: 'J04'}, fox: {onepiece: 'WD08', shoes: 'J09', earwear: 'J05'}};
const actors = Object.fromEntries(['cat', 'fox'].map(who => [who, {selection: normalizeWardrobe(catalog, recommended[who]), hidden: new Set(), token: 0, plan: null, renderer: createPaperdollRenderer({canvas: $(who + '-canvas'), loadImage})}]));
const player = createTimelinePlayer({id: 'fitted-stand', loop: true, segments: [{id: 'stand', pose: 'stand', durationMs: 1000}]});
let selected = 'cat', filter = 'all', anchors = false, pointer = null, holding = false, grabFrame = null, grabStarted = 0;
let lastClock = 0;
const now = () => (lastClock = Math.max(lastClock, performance.now()));
const report = error => {$('error').textContent = error instanceof Error ? error.message : String(error); $('error').hidden = false;};
const recover = () => {$('error').hidden = true;};
function outfitText(who) {
  const ids = new Set(Object.values(actors[who].selection).filter(Boolean));
  return catalog.items.filter(item => ids.has(item.id)).map(item => `${item.id} ${item.name}`).join(' / ') || '原居家上衣 / 原基础下装';
}
async function renderActor(who) {
  const state = actors[who], ticket = ++state.token, grabbed = player.snapshot().staticGrab;
  const canvas = $(who + '-canvas'); canvas.dataset.loading = 'true';
  try {
    const plan = createWardrobePlan({who, selection: state.selection, catalog, meta});
    const result = await state.renderer.render(plan, {anchors, grabbed, stageZoom: 1.2, hidden: [...state.hidden]});
    if (!result.committed || ticket !== state.token) return;
    state.plan = plan; canvas.dataset.pose = 'stand'; canvas.dataset.grabbed = String(grabbed); canvas.dataset.rendered = String(ticket);
    canvas.dataset.items = Object.values(state.selection).filter(Boolean).join(',');
    if (grabbed) {canvas.dataset.lastGrabPose = 'stand'; canvas.dataset.lastGrabDelayMs = String(Math.round(now() - grabStarted)); canvas.dataset.staticGrabRenders = String(Number(canvas.dataset.staticGrabRenders || 0) + 1);}
    canvas.setAttribute('aria-label', `${names[who]}，${grabbed ? '静止抓取' : '站姿试衣'}，${outfitText(who)}`);
    $(who + '-costume').textContent = outfitText(who);
    if (who === selected) renderLayers();
  } catch (error) {if (ticket === state.token) report(error);}
  finally {if (ticket === state.token) delete canvas.dataset.loading;}
}
async function renderAll() {
  const snapshot = player.snapshot();
  $('grab').setAttribute('aria-pressed', String(snapshot.staticGrab));
  $('fit-status').textContent = snapshot.staticGrab ? '完整站姿 · 静止悬空' : snapshot.status === 'grab-pending' ? '按住中，200ms后抓取' : '点击款式为当前角色试穿，也可以在右侧分别调整。';
  await Promise.all(['cat', 'fox'].map(renderActor));
}
function renderLayers() {
  const state = actors[selected], plan = state.plan; if (!plan) return;
  $('layers').replaceChildren(...plan.layers.map(layer => {
    const label = document.createElement('label'); label.className = 'layer-row';
    const input = document.createElement('input'); input.type = 'checkbox'; input.checked = !state.hidden.has(layer.role); input.dataset.role = layer.role;
    label.append(input, document.createTextNode(`${layer.order + 1}. ${layer.name || ({'body-and-tail': '身体与尾巴', 'front-hands-and-props': '原头部与前手', top: '原居家上衣', bottom: '原基础下装'}[layer.role] || layer.role)}`)); return label;
  }));
  $('rig-info').replaceChildren();
  for (const [name, value] of [['画布', `${plan.canvas.width} × ${plan.canvas.height}，原完整画布`], ['姿态', '原生站姿'], ['锚点', '沿用 demo/actor-rig.js'], ['眼镜', selected === 'cat' ? '原眼镜固有像素，保持一副' : '未增加眼镜']]) {
    const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = name; dd.textContent = value; $('rig-info').append(dt, dd);
  }
}
function renderEditor() {
  $('editor-name').textContent = names[selected] + '的搭配';
  for (const slot of WARDROBE_SLOTS) $('slot-' + slot).value = actors[selected].selection[slot] || '';
  for (const element of document.querySelectorAll('[data-who]')) element.setAttribute('aria-pressed', String(element.dataset.who === selected));
  for (const element of document.querySelectorAll('[data-actor]')) element.classList.toggle('selected', element.dataset.actor === selected);
  renderLayers(); renderGallery();
}
const categories = [['all', '全部 78'], ['dress', '连衣裙 12'], ['skirt', '半裙 6'], ['top', '上衣 22'], ['outerwear', '外套 6'], ['bottom', '裤装 7'], ['overall', '背带裤 1'], ['accessories', '配饰 24']];
function renderGallery() {
  const search = $('search').value.trim().toLowerCase(), chosen = new Set(Object.values(actors[selected].selection));
  const shown = catalog.items.filter(item => (filter === 'all' || (filter === 'accessories' ? ['accessory', 'footwear-set'].includes(item.kind) : item.kind === filter)) && `${item.id} ${item.name} ${item.groupName}`.toLowerCase().includes(search));
  $('catalog-count').textContent = `共 ${catalog.count} 款 · 当前显示 ${shown.length} 款 · 正在为${names[selected]}选装`;
  $('empty').hidden = shown.length !== 0;
  $('catalog').replaceChildren(...shown.map(item => {
    const button = document.createElement('button'); button.className = 'item-card'; button.dataset.item = item.id; button.setAttribute('aria-pressed', String(chosen.has(item.id))); button.setAttribute('aria-label', `${item.id} ${item.name}，为${names[selected]}试穿`);
    const image = document.createElement('img'); image.src = './' + item.thumbnail + '?v=paperdoll-wardrobe-20261110-152'; image.alt = ''; image.loading = 'lazy'; image.width = 220; image.height = 220;
    const id = document.createElement('span'); id.className = 'item-id'; id.textContent = item.id;
    const name = document.createElement('span'); name.className = 'item-name'; name.textContent = item.name;
    const state = document.createElement('span'); state.className = 'item-state'; state.textContent = chosen.has(item.id) ? '正在穿戴' : '点击试穿';
    button.append(image, id, name, state); return button;
  }));
  for (const button of $('filters').children) button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
}
for (const slot of WARDROBE_SLOTS) {
  const label = document.createElement('label'); label.append(document.createTextNode(WARDROBE_LABELS[slot]));
  const select = document.createElement('select'); select.id = 'slot-' + slot; select.dataset.slot = slot;
  const empty = document.createElement('option'); empty.value = ''; empty.textContent = ['top', 'bottom'].includes(slot) ? '沿用原基础款' : '不穿戴'; select.append(empty);
  for (const item of catalog.items.filter(item => item.slot === slot)) {const option = document.createElement('option'); option.value = item.id; option.textContent = `${item.id} ${item.name}`; select.append(option);}
  label.append(select); $('slots').append(label);
}
for (const [id, label] of categories) {const button = document.createElement('button'); button.dataset.filter = id; button.textContent = label; $('filters').append(button);}
$('slots').addEventListener('change', event => {
  const {slot} = event.target.dataset; if (!slot) return;
  try {const id = event.target.value; actors[selected].selection = id ? equipWardrobeItem(catalog, actors[selected].selection, id) : normalizeWardrobe(catalog, {...actors[selected].selection, [slot]: null}); actors[selected].hidden.clear(); recover(); renderEditor(); renderActor(selected).catch(report);} catch (error) {report(error); renderEditor();}
});
$('catalog').addEventListener('click', event => {const id = event.target.closest('[data-item]')?.dataset.item; if (!id) return; actors[selected].selection = equipWardrobeItem(catalog, actors[selected].selection, id); actors[selected].hidden.clear(); recover(); renderEditor(); renderActor(selected).catch(report);});
$('filters').addEventListener('click', event => {const id = event.target.dataset.filter; if (!id) return; filter = id; renderGallery();});
$('search').addEventListener('input', renderGallery);
for (const button of document.querySelectorAll('[data-who]')) button.addEventListener('click', () => {selected = button.dataset.who; renderEditor();});
for (const [id, selection] of [['clear', () => ({})], ['recommended', () => recommended[selected]]]) $(id).addEventListener('click', () => {actors[selected].selection = normalizeWardrobe(catalog, selection()); actors[selected].hidden.clear(); recover(); renderEditor(); renderActor(selected).catch(report);});
$('layers').addEventListener('change', event => {const {role} = event.target.dataset; if (!role) return; if (event.target.checked) actors[selected].hidden.delete(role); else actors[selected].hidden.add(role); renderActor(selected).catch(report);});
$('anchors').addEventListener('change', () => {anchors = $('anchors').checked; renderAll().catch(report);});
function beginGrab() {
  if (holding) return; holding = true; grabStarted = now(); player.beginGrab(grabStarted); renderAll().catch(report);
  const tick = () => {if (!holding) return; const before = player.snapshot().staticGrab; player.update(now()); if (before !== player.snapshot().staticGrab) renderAll().catch(report); if (!player.snapshot().staticGrab) grabFrame = requestAnimationFrame(tick);};
  grabFrame = requestAnimationFrame(tick);
}
function stopGrab() {
  if (!holding) return; holding = false; cancelAnimationFrame(grabFrame); player.releaseGrab(now(), {resume: false});
  if (pointer !== null && $('grab').hasPointerCapture(pointer)) $('grab').releasePointerCapture(pointer); pointer = null; renderAll().catch(report);
}
$('grab').addEventListener('pointerdown', event => {if (!event.isPrimary || event.button !== 0) return; event.preventDefault(); pointer = event.pointerId; $('grab').setPointerCapture(pointer); beginGrab();});
for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) $('grab').addEventListener(name, stopGrab);
$('grab').addEventListener('keydown', event => {if ([' ', 'Enter'].includes(event.key) && !event.repeat) {event.preventDefault(); beginGrab();}});
$('grab').addEventListener('keyup', event => {if ([' ', 'Enter'].includes(event.key)) {event.preventDefault(); stopGrab();}});
$('grab').addEventListener('contextmenu', event => event.preventDefault());
window.addEventListener('blur', stopGrab); document.addEventListener('visibilitychange', () => {if (document.hidden) stopGrab();});
window.addEventListener('pagehide', () => {stopGrab(); for (const actor of Object.values(actors)) {actor.renderer.cancel(); actor.token++;}});
window.addEventListener('pageshow', event => {if (event.persisted) renderAll().catch(report);});
$('export').addEventListener('click', async () => {
  try {const plan = createWardrobePlan({who: selected, selection: actors[selected].selection, catalog, meta}); const canvas = document.createElement('canvas'); canvas.width = plan.canvas.width; canvas.height = plan.canvas.height; await createPaperdollRenderer({canvas, loadImage}).render(plan, {coordinateSpace: 'native'}); const blob = await new Promise(resolve => canvas.toBlob(resolve)); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${selected}-wardrobe-stand.png`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);} catch (error) {report(error);}
});
renderEditor(); await renderAll();
