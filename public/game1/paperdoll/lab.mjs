import {CAPABILITIES, createLegacyPlan, createTimelinePlayer} from './paperdoll-core.mjs?v=paperdoll-v1-20261108-43';
import {SCENES, sceneOf, sceneTimeline, POSE_LABELS, LAYER_LABELS} from './scene-catalog.mjs?v=paperdoll-v1-20261108-43';
import {createPaperdollRenderer} from './paperdoll-renderer.mjs?v=paperdoll-v1-20261108-43';
import {CLOTHES} from '../home-system.js?v=1.0.3-tutorialtabsmooth43';

const $ = id => document.getElementById(id);
const names = {cat: '小满', fox: '小夏'};
const meta = await fetch(new URL('../assets/home/meta.json', import.meta.url)).then(r => {if (!r.ok) throw Error('角色元数据加载失败。'); return r.json();});
const actors = Object.fromEntries(['cat', 'fox'].map(who => [who, {outfit: null, pose: 'timeline', prop: 'auto', hidden: new Set(), token: 0, requested: null, plan: null}]));
const renderers = Object.fromEntries(['cat', 'fox'].map(who => [who, createPaperdollRenderer({canvas: $(who + '-canvas')})]));
let scene = SCENES[0], selected = 'cat', player, reduced = false, showAnchors = true, current = null, backgroundResume = false, grabbing = false, grabPointer = null;
let detailsSignature = '', scrubActive = false;
let lastClock = 0;
const clockNow = (value = performance.now()) => (lastClock = Math.max(lastClock, value));

function report(error) {
  const message = error instanceof Error ? error.message : String(error);
  $('error').textContent = message; $('error').hidden = false;
}
function recover() {$('error').hidden = true;}
function sample(who, snapshot) {
  const state = actors[who], grabbed = snapshot.staticGrab;
  const pose = grabbed ? 'stand' : state.pose === 'timeline' ? snapshot.pose : state.pose;
  const prop = grabbed ? null : state.prop === 'none' ? null : state.prop === 'auto' ? (state.pose === 'timeline' ? snapshot.prop : ['read', 'standing-read'].includes(pose) ? 'book' : null) : state.prop;
  return {pose, prop};
}
async function renderActor(who, snapshot, force = false) {
  const state = actors[who], frame = sample(who, snapshot);
  const key = JSON.stringify([frame, state.outfit, [...state.hidden], showAnchors, snapshot.staticGrab]);
  if (!force && state.requested === key) return;
  state.requested = key; const token = ++state.token;
  renderers[who].cancel();
  const canvas = $(who + '-canvas'); canvas.dataset.loading = 'true';
  try {
    const plan = createLegacyPlan({who, ...frame, outfit: state.outfit, meta});
    const result = await renderers[who].render(plan, {hidden: [...state.hidden], anchors: showAnchors, grabbed: snapshot.staticGrab});
    if (!result.committed || token !== state.token) return;
    state.plan = plan; canvas.dataset.pose = frame.pose; canvas.dataset.prop = frame.prop || ''; canvas.dataset.rendered = String(token); canvas.dataset.grabbed = String(snapshot.staticGrab);
    if (snapshot.staticGrab) {canvas.dataset.lastGrabPose = frame.pose; canvas.dataset.lastGrabProp = frame.prop || ''; canvas.dataset.staticGrabRenders = String(Number(canvas.dataset.staticGrabRenders || 0) + 1);}
    canvas.setAttribute('aria-label', names[who] + '，' + POSE_LABELS[frame.pose] + (snapshot.staticGrab ? '，静止抓取' : ''));
    $(who + '-pose').textContent = snapshot.staticGrab ? '静止抓取' : POSE_LABELS[frame.pose];
    $(who + '-costume').textContent = ['top', 'bottom', 'accessory'].map(part => CLOTHES[part][state.outfit[part]][0]).join(' / ');
    if (who === selected) renderDetails();
  } catch (error) {if (token === state.token) report(error);}
  finally {if (token === state.token) delete canvas.dataset.loading;}
}
function renderDetails() {
  const state = actors[selected], plan = state.plan; if (!plan) return;
  const signature = JSON.stringify([selected, plan.pose, plan.prop, plan.outfit, [...state.hidden]]);
  if (signature === detailsSignature) return; detailsSignature = signature;
  $('layers').replaceChildren(...plan.layers.map(layer => {
    const label = document.createElement('label'); label.className = 'layer-row';
    const input = document.createElement('input'); input.type = 'checkbox'; input.checked = !state.hidden.has(layer.role); input.dataset.role = layer.role; input.setAttribute('aria-label', LAYER_LABELS[layer.role] || layer.role);
    label.append(input, document.createTextNode(`${layer.order + 1}. ${LAYER_LABELS[layer.role] || layer.role}`)); return label;
  }));
  $('rig-info').replaceChildren();
  for (const [label, value] of [['画布', `${plan.canvas.width} × ${plan.canvas.height}，完整层`], ['方向', '原生视角；其他方向待制作'], ['配方', 'actor-rig.js（只读调用）'], ['眼镜', selected === 'cat' ? '固有眼镜，已包含在身体层' : '无新增眼镜层']]) {
    const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = label; dd.textContent = value; $('rig-info').append(dt, dd);
  }
}
function renderEditor() {
  const state = actors[selected]; $('editor-name').textContent = names[selected] + '的搭配';
  for (const part of ['top', 'bottom', 'accessory']) $(part).value = state.outfit[part];
  $('pose').value = state.pose; $('prop').value = state.prop;
  for (const button of document.querySelectorAll('[data-who]')) button.setAttribute('aria-pressed', String(button.dataset.who === selected));
  for (const card of document.querySelectorAll('[data-actor]')) card.classList.toggle('selected', card.dataset.actor === selected);
  updatePropOptions(); detailsSignature = ''; renderDetails();
}
function updatePropOptions() {
  const frame = sample(selected, {...current, staticGrab: false});
  const pose = frame.pose, manual = actors[selected].pose !== 'timeline';
  $('prop').querySelector('[value=book]').disabled = !manual || !['read', 'standing-read'].includes(pose);
  $('prop').querySelector('[value=paper]').disabled = !manual || selected !== 'cat' || pose !== 'standing-read';
}
function renderStatus(snapshot) {
  current = snapshot;
  const status = {idle: '已就绪', playing: '正在播放', paused: '已暂停', completed: '已结束', cancelled: '已取消', 'grab-pending': '按住中，200ms后抓取', grabbed: '完整站姿静止悬空'}[snapshot.status];
  $('playback-status').textContent = `${reduced ? '减少动态已开启 · ' : ''}${status} · ${scene.segments[snapshot.segmentIndex].label}`;
  $('playback-status').dataset.status = snapshot.status;
  $('play-toggle').textContent = snapshot.status === 'playing' ? '暂停动作' : '播放动作';
  $('play-toggle').disabled = reduced || grabbing; $('restart').disabled = reduced || grabbing;
  $('scrub').disabled = grabbing;
  if (!scrubActive) $('scrub').value = String(Math.round(snapshot.progress * 1000));
  $('timecode').value = `${(snapshot.localMs / 1000).toFixed(1)}s / ${(snapshot.durationMs / 1000).toFixed(1)}s`;
  for (const button of $('segments').children) button.setAttribute('aria-pressed', String(Number(button.dataset.index) === snapshot.segmentIndex));
  $('grab').setAttribute('aria-pressed', String(snapshot.staticGrab));
  updatePropOptions();
}
async function renderAll(snapshot = player.snapshot(), force = false) {
  renderStatus(snapshot); await Promise.all(['cat', 'fox'].map(who => renderActor(who, snapshot, force)));
}
function stopGrab({cancel = false} = {}) {
  if (!grabbing) return;
  const pointer = grabPointer; grabbing = false; grabPointer = null;
  player.releaseGrab(clockNow(), {resume: false});
  if (pointer !== null && $('grab').hasPointerCapture(pointer)) $('grab').releasePointerCapture(pointer);
  if (cancel) player.cancel();
}
function selectScene(id) {
  stopGrab({cancel: true}); if (player) player.cancel();
  scene = sceneOf(id); player = createTimelinePlayer(sceneTimeline(id)); current = player.snapshot();
  for (const who of ['cat', 'fox']) {const state = actors[who]; state.outfit = {...scene.outfits[who]}; state.pose = 'timeline'; state.prop = 'auto'; state.hidden.clear(); state.requested = null;}
  for (const button of $('scene-tabs').children) button.setAttribute('aria-pressed', String(button.dataset.scene === id));
  $('scene-name').textContent = scene.name; $('scene-subtitle').textContent = scene.subtitle;
  $('new-outfit').textContent = scene.newOutfit; $('new-motion').textContent = scene.newMotion; $('missing').textContent = scene.missing;
  $('segments').replaceChildren(...scene.segments.map((segment, index) => {const button = document.createElement('button'); button.textContent = segment.label; button.dataset.index = index; return button;}));
  recover(); renderEditor(); renderAll().catch(report);
}

for (const item of SCENES) {const button = document.createElement('button'); button.dataset.scene = item.id; button.textContent = item.name; button.setAttribute('aria-pressed', 'false'); $('scene-tabs').append(button);}
for (const part of ['top', 'bottom', 'accessory']) for (const [index, item] of CLOTHES[part].entries()) {
  if (part === 'accessory' && index === 2) continue;
  const option = document.createElement('option'); option.value = index; option.textContent = item[0]; $(part).append(option);
}
for (const pose of CAPABILITIES.poses) {const option = document.createElement('option'); option.value = pose; option.textContent = POSE_LABELS[pose]; $('pose').append(option);}
$('scene-tabs').addEventListener('click', e => {if (e.target.dataset.scene) selectScene(e.target.dataset.scene);});
for (const button of document.querySelectorAll('[data-who]')) button.addEventListener('click', () => {selected = button.dataset.who; renderEditor();});
for (const part of ['top', 'bottom', 'accessory']) $(part).addEventListener('change', () => {actors[selected].outfit[part] = Number($(part).value); recover(); renderAll().catch(report);});
$('pose').addEventListener('change', () => {actors[selected].pose = $('pose').value; actors[selected].prop = 'auto'; $('prop').value = 'auto'; recover(); renderAll().catch(report);});
$('prop').addEventListener('change', () => {actors[selected].prop = $('prop').value; recover(); renderAll().catch(report);});
$('reset-outfit').addEventListener('click', () => {actors[selected].outfit = {...scene.outfits[selected]}; actors[selected].hidden.clear(); recover(); renderEditor(); renderAll().catch(report);});
$('layers').addEventListener('change', e => {const role = e.target.dataset.role; if (!role) return; const hidden = actors[selected].hidden; if (e.target.checked) hidden.delete(role); else hidden.add(role); renderAll().catch(report);});
$('anchors').addEventListener('change', () => {showAnchors = $('anchors').checked; renderAll().catch(report);});
$('play-toggle').addEventListener('click', () => {try {const now = clockNow(), status = player.snapshot().status; if (status === 'playing') player.pause(now); else if (status === 'paused') player.resume(now); else player.play(now); renderAll().catch(report);} catch (e) {report(e);}});
$('restart').addEventListener('click', () => {player.play(clockNow()); recover(); renderAll().catch(report);});
$('stop').addEventListener('click', () => {stopGrab({cancel: true}); player.cancel(); for (const who of ['cat', 'fox']) {actors[who].pose = 'timeline'; actors[who].prop = 'auto';} renderEditor(); renderAll().catch(report);});
$('segments').addEventListener('click', e => {if (e.target.dataset.index === undefined || grabbing) return; const index = Number(e.target.dataset.index); player.pause(clockNow()); player.seek(player.timeline.segments[index].startMs, clockNow()); renderAll().catch(report);});
$('scrub').addEventListener('pointerdown', () => {scrubActive = true;});
$('scrub').addEventListener('input', () => {if (grabbing) return; player.pause(clockNow()); player.seek(Number($('scrub').value) / 1000 * player.timeline.durationMs, clockNow()); renderAll().catch(report);});
$('scrub').addEventListener('change', () => {scrubActive = false;});
$('reduced').addEventListener('change', () => {reduced = $('reduced').checked; stopGrab(); if (reduced) player.pause(clockNow()); renderAll().catch(report);});
$('grab').addEventListener('pointerdown', e => {
  if (!e.isPrimary || e.button !== 0 || grabbing) return;
  e.preventDefault(); grabbing = true; grabPointer = e.pointerId; $('grab').setPointerCapture(e.pointerId);
  player.beginGrab(clockNow()); renderAll().catch(report);
});
for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) $('grab').addEventListener(event, () => {stopGrab(); renderAll().catch(report);});
$('grab').addEventListener('contextmenu', e => e.preventDefault());
$('grab').addEventListener('keydown', e => {if ([' ', 'Enter'].includes(e.key) && !e.repeat && !grabbing) {e.preventDefault(); grabbing = true; player.beginGrab(clockNow()); renderAll().catch(report);}});
$('grab').addEventListener('keyup', e => {if ([' ', 'Enter'].includes(e.key)) {e.preventDefault(); stopGrab(); renderAll().catch(report);}});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {backgroundResume = !reduced && player.snapshot().status === 'playing'; stopGrab(); player.pause(clockNow());}
  else if (backgroundResume) {player.resume(clockNow()); backgroundResume = false;}
  renderAll().catch(report);
});
window.addEventListener('pagehide', () => {stopGrab({cancel: true}); player.cancel(); for (const who of ['cat', 'fox']) {renderers[who].cancel(); actors[who].token++; actors[who].requested = null;}});
window.addEventListener('pageshow', event => {if (event.persisted) renderAll(player.snapshot(), true).catch(report);});
window.addEventListener('blur', () => {if (grabbing) {stopGrab(); renderAll().catch(report);}});
function tick(now) {
  try {const snapshot = player.update(clockNow(now)); if (!document.hidden) renderAll(snapshot).catch(report);} catch (e) {report(e);}
  requestAnimationFrame(tick);
}
selectScene(SCENES[0].id); requestAnimationFrame(tick);
