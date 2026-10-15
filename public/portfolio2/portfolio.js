'use strict';

const works = JSON.parse(document.getElementById('portfolio-data').textContent);
const hero = document.getElementById('hero');
const sceneMotion = document.getElementById('motion-control');
const autoPlay = document.getElementById('auto-play');
const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const contentViews = document.getElementById('content-views');
const stage = document.getElementById('stage');
const viewTabs = Array.from(document.querySelectorAll('.dock [data-view]'));
const panels = Array.from(document.querySelectorAll('.content-section'));
const workItems = Array.from(document.querySelectorAll('.work-item'));
const workChoices = Array.from(document.querySelectorAll('.work-thumbnails [data-work-index]'));
const recordGroups = Array.from(document.querySelectorAll('.record-group'));
const recordTabs = Array.from(document.querySelectorAll('[data-record-group]'));
const compactRecords = window.matchMedia('(max-width: 700px), (max-height: 700px)');
let workIndex = 0;
let workPlaying = !mediaQuery.matches;
let recordGroup = 0;
let recordPage = 0;
let currentView;
let userPaused = false;
let viewAnimations = [];
let autoPlaying = false;
let autoTimer;

function scheduleAutoPlay() {
  clearTimeout(autoTimer);
  const playing = autoPlaying && !userPaused;
  autoPlay.setAttribute('aria-pressed', String(playing));
  autoPlay.setAttribute('aria-label', playing ? '停止自动轮播' : '开始自动轮播');
  autoPlay.title = autoPlay.getAttribute('aria-label');
  setIcon(autoPlay, playing ? 'pause' : 'play');
  autoPlay.querySelector('svg').classList.add('ico');
  if (!playing || document.hidden) return;
  autoTimer = setTimeout(() => {
    const index = viewTabs.findIndex((tab) => tab.dataset.view === currentView);
    setView(viewTabs[(index + 1) % viewTabs.length].dataset.view, false);
    history.replaceState(null, '', '#' + currentView);
  }, 6500);
}

function finishViewSlide() {
  viewAnimations.forEach((animation) => animation.cancel());
  viewAnimations = [];
  document.body.classList.remove('view-sliding');
  panels.forEach((panel) => { panel.hidden = panel.id !== currentView; });
  contentViews.hidden = currentView === 'hero';
}

function selectTab(tabs, selected) {
  tabs.forEach((tab, index) => {
    tab.setAttribute('aria-selected', String(index === selected));
    tab.tabIndex = index === selected ? 0 : -1;
  });
}

function setView(view, updateHistory = true) {
  const selected = viewTabs.findIndex((tab) => tab.dataset.view === view);
  const index = selected < 0 ? 0 : selected;
  const next = viewTabs[index].dataset.view;
  if (next === currentView) return;
  finishViewSlide();
  const previous = currentView;
  const previousIndex = viewTabs.findIndex((tab) => tab.dataset.view === previous);
  const outgoing = previous === 'hero' ? stage : document.getElementById(previous);
  const incoming = next === 'hero' ? stage : document.getElementById(next);
  currentView = next;
  window.__rxqViewIndex = index;
  document.body.dataset.view = next;
  selectTab(viewTabs, index);
  viewTabs.forEach((tab, i) => tab.classList.toggle('is-active', i === index));
  panels.forEach((panel) => {
    panel.hidden = panel.id !== next;
    panel.inert = panel.id !== next;
    panel.setAttribute('aria-hidden', String(panel.id !== next));
  });
  contentViews.hidden = next === 'hero';
  stage.inert = next !== 'hero';
  stage.setAttribute('aria-hidden', String(next !== 'hero'));
  document.body.classList.toggle('view-open', next !== 'hero');
  if (previous && !mediaQuery.matches) {
    const direction = index > previousIndex ? -1 : 1;
    const options = { duration: 760, easing: 'cubic-bezier(.33, 1, .68, 1)', fill: 'both' };
    document.body.classList.add('view-sliding');
    contentViews.hidden = false;
    outgoing.hidden = false;
    viewAnimations = [
      outgoing.animate([{ transform: 'translateX(0)', opacity: 1 }, { transform: `translateX(${direction * 100}vw)`, opacity: 0 }], options),
      incoming.animate([{ transform: `translateX(${-direction * 100}vw)`, opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }], options),
    ];
    const activeAnimations = viewAnimations;
    Promise.all(activeAnimations.map((animation) => animation.finished)).then(() => {
      if (viewAnimations === activeAnimations) finishViewSlide();
    }).catch(() => {});
  }
  renderWorkMedia();
  scheduleAutoPlay();
  if (updateHistory) {
    history.pushState(null, '', '#' + next);
    viewTabs[index].focus({ preventScroll: true });
  }
}

function showWork(index) {
  workIndex = (index + works.length) % works.length;
  workPlaying = !mediaQuery.matches;
  workItems.forEach((item, i) => { item.hidden = i !== workIndex; });
  workChoices.forEach((button, i) => button.setAttribute('aria-pressed', String(i === workIndex)));
  document.getElementById('works-counter').textContent = String(workIndex + 1).padStart(2, '0') + ' / ' + String(works.length).padStart(2, '0');
  renderWorkMedia();
}

function renderWorkMedia() {
  workItems.forEach((item, index) => {
    const work = works[index];
    const playing = currentView === 'art' && index === workIndex && workPlaying && !document.hidden && Boolean(work.gif);
    const image = item.querySelector('.work-image img');
    const source = playing ? work.gif : (work.poster || work.image);
    if (image.getAttribute('src') !== source) image.src = source;
    const button = item.querySelector('[data-work-motion]');
    button.setAttribute('aria-label', `${playing ? '暂停' : '播放'}《${work.title}》影像`);
    button.title = button.getAttribute('aria-label');
    setIcon(button, playing ? 'pause' : 'play');
  });
}

function renderRecords() {
  const size = compactRecords.matches ? 1 : 3;
  const rows = Array.from(recordGroups[recordGroup].querySelectorAll('li'));
  const lastPage = Math.ceil(rows.length / size) - 1;
  recordPage = Math.min(Math.max(0, recordPage), lastPage);
  selectTab(recordTabs, recordGroup);
  recordGroups.forEach((group, i) => { group.hidden = i !== recordGroup; });
  rows.forEach((row, i) => { row.hidden = i < recordPage * size || i >= (recordPage + 1) * size; });
  document.getElementById('records-counter').textContent = `${recordPage * size + 1}${size > 1 ? ' – ' + Math.min((recordPage + 1) * size, rows.length) : ''} / ${rows.length}`;
  document.getElementById('records-prev').disabled = recordPage === 0;
  document.getElementById('records-next').disabled = recordPage === lastPage;
}

setView(location.hash.slice(1), false);
showWork(0);
renderRecords();
compactRecords.addEventListener('change', () => { recordPage = 0; renderRecords(); });
window.addEventListener('popstate', () => setView(location.hash.slice(1), false));
window.addEventListener('hashchange', () => setView(location.hash.slice(1), false));
window.addEventListener('resize', finishViewSlide);

function setIcon(button, name) {
  button.replaceChildren(document.getElementById('icon-' + name).content.cloneNode(true));
}

function syncSceneMotion() {
  const paused = userPaused || mediaQuery.matches;
  window.__rxqMotionPaused = paused;
  document.body.classList.toggle('motion-paused', paused);
  sceneMotion.setAttribute('aria-pressed', String(paused));
  sceneMotion.setAttribute('aria-label', autoPlaying ? (userPaused ? '继续自动轮播与场景动画' : '暂停自动轮播与场景动画') : (paused ? '继续场景动画' : '暂停场景动画'));
  sceneMotion.title = sceneMotion.getAttribute('aria-label');
  sceneMotion.disabled = mediaQuery.matches && !autoPlaying;
  setIcon(sceneMotion, (autoPlaying ? userPaused : paused) ? 'play' : 'pause');
}
syncSceneMotion();
sceneMotion.addEventListener('click', () => { userPaused = !userPaused; syncSceneMotion(); scheduleAutoPlay(); });
autoPlay.addEventListener('click', () => { autoPlaying = !autoPlaying || userPaused; userPaused = false; syncSceneMotion(); scheduleAutoPlay(); if (autoPlaying) sceneMotion.focus({ preventScroll: true }); });
mediaQuery.addEventListener('change', () => { finishViewSlide(); syncSceneMotion(); workPlaying = !mediaQuery.matches; renderWorkMedia(); scheduleAutoPlay(); });
document.addEventListener('visibilitychange', () => { renderWorkMedia(); scheduleAutoPlay(); });
new IntersectionObserver(([entry]) => { window.__rxqSceneActive = entry.isIntersecting; }).observe(hero);

document.addEventListener('click', (event) => {
  const viewTrigger = event.target.closest('[data-view]');
  if (viewTrigger) { event.preventDefault(); setView(viewTrigger.dataset.view); }
  const workChoice = event.target.closest('[data-work-index]');
  if (workChoice) showWork(Number(workChoice.dataset.workIndex));
  const motionTrigger = event.target.closest('[data-work-motion]');
  if (motionTrigger && Number(motionTrigger.dataset.workMotion) === workIndex) { workPlaying = !workPlaying; renderWorkMedia(); }
  const recordChoice = event.target.closest('[data-record-group]');
  if (recordChoice) { recordGroup = Number(recordChoice.dataset.recordGroup); recordPage = 0; renderRecords(); }
  const aboutChoice = event.target.closest('[data-about-page]');
  if (aboutChoice) {
    const tabs = Array.from(document.querySelectorAll('[data-about-page]'));
    const index = Number(aboutChoice.dataset.aboutPage);
    selectTab(tabs, index);
    tabs.forEach((tab, i) => { document.getElementById(tab.getAttribute('aria-controls')).hidden = i !== index; });
  }
});
document.addEventListener('keydown', (event) => {
  const tab = event.target.closest('[role="tab"]');
  if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  const tabs = Array.from(tab.closest('[role="tablist"]').querySelectorAll(':scope > [role="tab"]'));
  const current = tabs.indexOf(tab);
  const index = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
  event.preventDefault();
  tabs[index].focus({ preventScroll: true });
  tabs[index].click();
});
document.getElementById('works-prev').addEventListener('click', () => showWork(workIndex - 1));
document.getElementById('works-next').addEventListener('click', () => showWork(workIndex + 1));
document.getElementById('records-prev').addEventListener('click', () => { recordPage--; renderRecords(); });
document.getElementById('records-next').addEventListener('click', () => { recordPage++; renderRecords(); });
document.getElementById('copy-wechat').addEventListener('click', async () => {
  const status = document.getElementById('copy-status');
  try { await navigator.clipboard.writeText('r1062046861'); status.textContent = '微信号已复制'; }
  catch { status.textContent = '微信号：r1062046861'; }
});
