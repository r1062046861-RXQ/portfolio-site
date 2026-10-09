import * as G from './engine.js?v=0.15';

const $=id=>document.getElementById(id), icon=name=>`<i data-lucide="${name}"></i>`;
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='today-who-works-save-v1', PREF='today-who-works-preferences-v1';
let state=G.fresh(), tab=null, scene='home', busy=false, sound=true, volume=.35, fast=false, toastTimer, modalKind='', pendingReloadNotice='',storageOK=true,lastSavedRaw=null,hasSavedGame=false,menuOpen=true;
let contentPage=0, photoView=false, modalPage=0, modalPages=[],decorating=null;
let tutorialStep=null,tutorialDone=false;
const TUTORIAL=[
  {title:'两个人，一个班',text:'周一到周六，每天一位室友上班，另一位自由安排；周日一起放假。第一周已替你排好示范日程。',hint:'顶部看生活币、精力与心情；底部管理生活。',icon:'users',route:null},
  {title:'先看看上什么班',text:'点底部「找班」，再点日期，能抢当天岗位或换当班人。岗位写明地点、工作内容和工资；技能不够可以进修。',hint:'每周还能抽一次免费岗位盲盒。',icon:'briefcase-business',route:'jobs'},
  {title:'把空档留给自己',text:'点「排班」。工作格查看岗位与换班，另一格可安排休息、进修或副业。当天小目标会提示做什么能多拿25币。',hint:'一节进修 +3经验，三节从零达到2级，无需学历。',icon:'calendar-days',route:'plan'},
  {title:'开工，然后看看收获',text:'安排好后收起窗口，点底部「开始周一」。只有点击开始才会推进一天，工资、技能和目标奖励会显示在收获单。',hint:'每天开工前都能改剩余安排；精力不足先换班或休息。',icon:'play',route:null},
  {title:'小目标，大大的盼头',text:'点顶部「目标」：查看每日奖励、选择每周街坊委托，再逐步完成四章大目标。委托完成自动到账，章节完成手动领奖。',hint:'试试先接「小店的周末准备」，跟着示范日程就能完成。',icon:'flag',route:'goals'},
  {title:'让出租屋一点点变成家',text:'生活币可买家具。点「小家」添置后选位置，已有家具也能挪动。周日结算生活费后进入下一周，继续学本事、接委托。',hint:'进度自动保存在当前浏览器；设置里可重看教程和调节音量。',icon:'armchair',route:'home'}
];
const music=new Audio();music.preload='none';music.src='assets/music.wav';music.loop=true;
let prefs={};
try{prefs=JSON.parse(localStorage.getItem(PREF)||'{}');fast=!!prefs?.fast;if(typeof prefs?.sound==='boolean')sound=prefs.sound;if(typeof prefs?.volume==='number'&&Number.isFinite(prefs.volume))volume=Math.max(0,Math.min(1,prefs.volume));}catch{}
music.volume=volume;
tutorialDone=prefs?.tutorialDone===true;
try {
  const raw=localStorage.getItem(KEY);
  if(raw){const candidate=JSON.parse(raw);if(!G.validateSave(candidate))throw Error('invalid');state=candidate;hasSavedGame=true;}
}catch{
  try{const backup=JSON.parse(localStorage.getItem(KEY+'-backup')||'null');if(G.validateSave(backup)){state=backup;hasSavedGame=true;pendingReloadNotice='已从上一份备份恢复进度。';}else{const raw=localStorage.getItem(KEY);if(raw)localStorage.setItem(KEY+'-unreadable',raw);pendingReloadNotice='旧存档无法读取，已保留原始数据，可以开始新生活。';}}
  catch{storageOK=false;pendingReloadNotice='浏览器禁止保存，退出前可以导出存档。';}
}
function colorCharacterNames(root=document.body){
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];
  while(walker.nextNode())if(/阿闲|阿忙/.test(walker.currentNode.textContent)&&!walker.currentNode.parentElement.closest('.character-name,script,style,textarea,title'))nodes.push(walker.currentNode);
  for(const node of nodes){
    const fragment=document.createDocumentFragment();
    for(const text of node.textContent.split(/(阿闲|阿忙)/)){
      if(text==='阿闲'||text==='阿忙'){const name=document.createElement('em');name.className=`character-name ${text==='阿闲'?'name-xian':'name-mang'}`;name.textContent=text;fragment.append(name);}
      else fragment.append(document.createTextNode(text));
    }
    node.replaceWith(fragment);
  }
}
function icons(){window.lucide?.createIcons({attrs:{'aria-hidden':'true'}});colorCharacterNames();}
function toast(text){clearTimeout(toastTimer);$('toast').textContent=text;colorCharacterNames($('toast'));$('toast').classList.add('visible');toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3200);}
function save(backup=true){
  hasSavedGame=true;
  try {
    const previous=localStorage.getItem(KEY);
    const raw=JSON.stringify(state);
    if(backup&&previous&&previous!==raw){try{if(G.validateSave(JSON.parse(previous)))localStorage.setItem(KEY+'-backup',previous);}catch{}}
    localStorage.setItem(KEY,raw);lastSavedRaw=raw;storageOK=true;
  }catch{storageOK=false;}
  $('save-status').textContent=storageOK?'已保存':'未保存';
  $('save-status').title=storageOK?'进度已保存到此浏览器':'无法自动保存 · 请在设置导出存档';
  $('save-status').setAttribute('aria-label',$('save-status').title);
  $('save-status').classList.toggle('storage-warning',!storageOK);
}
function renderMenu(){
  $('menu-continue').disabled=!hasSavedGame;
  $('menu-save').textContent=hasSavedGame?`第 ${state.week} 周 · ${state.day===7?'周末':G.DAYS[state.day]} · ${state.cash} 生活币`:'从一把钥匙，开始两个人的生活。';
  $('menu-storage').textContent=storageOK?'你的进度，只保存在这台设备的浏览器里。':'此浏览器无法保存，请在游戏设置里导出备份。';
}
function enterGame({newGame=false}={}){
  closeModal();menuOpen=false;$('main-menu').hidden=true;$('main-menu').inert=true;
  $('game-shell').hidden=false;$('game-shell').inert=false;tab=null;scene='home';contentPage=0;render();
  playMusic();
  $('run').focus({preventScroll:true});
  if(newGame&&!tutorialDone)startTutorial();
}
function refreshMenuSave(){
  try{
    const raw=localStorage.getItem(KEY);
    if(raw){const candidate=JSON.parse(raw);if(G.validateSave(candidate)){state=candidate;lastSavedRaw=raw;hasSavedGame=true;}}
    else if(storageOK){hasSavedGame=false;lastSavedRaw=null;}
  }catch{}
  renderMenu();
}
function showMenu(){
  if(busy)return;
  closeModal();tutorialStep=null;renderTutorialResume();stopDecorating();menuOpen=true;music.pause();$('game-shell').hidden=true;$('game-shell').inert=true;
  $('main-menu').hidden=false;$('main-menu').inert=false;renderMenu();icons();$('menu-continue').focus({preventScroll:true});
}
function requestNewGame(){
  refreshMenuSave();
  if(hasSavedGame){
    openModal('重新开始这段生活？','<p class="modal-caption">从第1周、500生活币开始。<br>将<strong>覆盖当前进度</strong>，不会自动备份。</p><div class="modal-actions"><button class="text-button" data-cancel-new>保留现在的进度</button><button class="primary-button" data-confirm-new>开始新游戏</button></div>','开启一段新的生活','new-game');
  }else startNewGame();
}
function startNewGame(){
  try{commit(G.fresh(),{backup:false});enterGame({newGame:true});}catch(e){toast(e.message);}
}
function commit(next,{backup=true}={}){
  if(!G.validateSave(next))throw Error('存档状态异常，本次改动没有保存。');
  let latest;
  try{latest=localStorage.getItem(KEY);}catch{storageOK=false;}
  if(latest&&latest!==lastSavedRaw){
    try{const candidate=JSON.parse(latest);if(G.validateSave(candidate)){state=candidate;lastSavedRaw=latest;render();}}catch{}
    throw Error('另一个页面更新了进度，已经同步，请重新安排。');
  }
  state=next;save(backup);render();
}
function perform(fn){try{commit(fn());return true;}catch(e){toast(e.message);return false;}}
function openModal(title,html,eyebrow='',kind='') {
  if($('modal').open)$('modal').close();
  modalKind=kind;const legacy=['free-time','sunday','preset','course','draw','event','reward','report','tutorial','buy','import','ad'].includes(kind);$('modal').classList.toggle('legacy-window',legacy);$('modal').classList.toggle('has-close-marker',['free-time','course','event','reward','buy','import'].includes(kind));$('modal').dataset.art=legacy||['settings','goals','xian','mang','new-game','shift'].includes(kind)?kind:'';
  $('modal-title').textContent=title;$('modal-eyebrow').textContent=eyebrow;$('modal-body').innerHTML=html;
  $('modal-tools').replaceChildren();const tools=$('modal-body').querySelector('.goal-nav,.settings-nav,.shift-tools,.tutorial-tools');if(tools)$('modal-tools').append(tools);$('modal-tools').hidden=!tools;
  $('modal').showModal();icons();paginateModal();
}
function pager(page,total,attribute){
  return `<button class="icon-button" ${attribute}="${page-1}" ${page===0?'disabled':''} title="上一页" aria-label="上一页">${icon('chevron-left')}</button><span>${page+1} / ${total}</span><button class="icon-button" ${attribute}="${page+1}" ${page===total-1?'disabled':''} title="下一页" aria-label="下一页">${icon('chevron-right')}</button>`;
}
function contentPager(items){
  const total=Math.max(1,Math.ceil(items.length/(tab==='diary'?2:3)));contentPage=Math.min(contentPage,total-1);
  return `<nav class="pager" aria-label="列表分页">${pager(contentPage,total,'data-content-page')}</nav>`;
}
function paginateModal(){
  $('modal').style.height='';
  const body=$('modal-body');
  if(['xian','mang'].includes($('modal').dataset.art)){modalPages=[[...body.children]];modalPage=0;$('modal-pager').hidden=true;return;}
  body.querySelectorAll('.action-options').forEach(group=>group.replaceWith(...group.children));
  const blocks=[...body.children];blocks.forEach(block=>{block.classList.add('modal-block');block.hidden=false;});
  $('modal-pager').hidden=false;
  const bodyCSS=getComputedStyle(body),capacity=body.clientHeight-parseFloat(bodyCSS.paddingTop)-parseFloat(bodyCSS.paddingBottom),heights=new Map();modalPages=[[]];let used=0;
  // Measure real blocks so large action lists and reports remain reachable without scrolling.
  for(const block of blocks){
    const css=getComputedStyle(block),height=block.getBoundingClientRect().height+parseFloat(css.marginTop)+parseFloat(css.marginBottom);
    heights.set(block,height);
    if(used+height>capacity&&modalPages.at(-1).length){modalPages.push([]);used=0;}
    modalPages.at(-1).push(block);used+=height;
  }
  modalPage=0;renderModalPage();
  const tallest=Math.max(0,...modalPages.map(page=>page.reduce((sum,block)=>sum+heights.get(block),0)));
  const spare=body.clientHeight-tallest;
  if(spare>8&&!$('modal').dataset.art)$('modal').style.height=`${$('modal').getBoundingClientRect().height-spare+6}px`;
}
function renderModalPage(){
  modalPages.forEach((blocks,i)=>blocks.forEach(block=>{block.hidden=i!==modalPage;}));
  $('modal-pager').hidden=modalPages.length<2;
  $('modal-pager').innerHTML=pager(modalPage,modalPages.length,'data-modal-page');icons();
}
function closeModal(){$('modal').close();modalKind='';renderTutorialResume();}
function renderTutorialResume(){
  $('tutorial-resume').hidden=tutorialStep===null;
  if(tutorialStep!==null)$('tutorial-resume').textContent=`新手教程 ${tutorialStep+1} / ${TUTORIAL.length} · 返回说明`;
}
function startTutorial(){stopDecorating();tutorialStep=0;tab=null;render();tutorialModal();}
function finishTutorial(){tutorialStep=null;tutorialDone=true;persistPrefs();closeModal();renderTutorialResume();}
function tutorialModal(){
  const t=TUTORIAL[tutorialStep];if(!t)return;
  openModal('新手教程',`<div class="tutorial-card">${icon(t.icon)}<h3>${t.title}</h3><p>${t.text}</p><p class="tutorial-hint">${t.hint}</p></div>${t.route?`<button class="text-button" data-tutorial-look="${t.route}">${icon('mouse-pointer-2')}去看看${{jobs:'找班',plan:'排班',goals:'目标',home:'小家'}[t.route]}</button>`:''}<div class="tutorial-tools"><nav class="tutorial-steps" aria-label="教程进度">${TUTORIAL.map((_,i)=>`<span class="${i===tutorialStep?'current':''}" ${i===tutorialStep?'aria-current="step"':''}>${i+1}</span>`).join('')}</nav><div class="tutorial-actions"><button class="text-button" data-tutorial-back ${tutorialStep===0?'disabled':''}>上一步</button><button class="primary-button" data-tutorial-next>${tutorialStep===TUTORIAL.length-1?'开始生活':'下一步'}</button><button class="text-button" data-tutorial-skip>跳过</button></div></div>`,`第 ${tutorialStep+1} / ${TUTORIAL.length} 步 · 随时可在设置重看`,'tutorial');
  renderTutorialResume();
}
function meter(value,name){return `<span class="meter ${name==='smile'?'mood':''}" title="${name==='smile'?'心情':'精力'} ${value}/100">${icon(name)}<span class="meter-track"><span style="width:${value}%"></span></span><b>${value}</b></span>`;}
function renderPeople(){
  $('people').innerHTML=state.chars.map((c,i)=>{
    const a=state.day<6?state.plan[state.day][i]:state.day===6?'rest':null;
    return `<button class="person person-${i?'b':'a'}" data-person="${i}" title="查看${escape(c.name)}的技能与状态"><img class="person-portrait" src="assets/ui-v10/portrait-${i?'fox':'cat'}.webp" alt=""><div class="person-head"><b>${escape(c.name)}</b><small><span class="status-dot"></span>${a?G.ACTIONS[a].short||G.ACTIONS[a].name:'已收工'}</small></div><div class="meters">${meter(c.energy,'zap')}${meter(c.mood,'smile')}</div></button>`;
  }).join('');
}
function renderSchedule(){
  $('planner-eyebrow').textContent=`第${state.week}周`;
  $('schedule').innerHTML=Array.from({length:7},(_,d)=>{
    const done=d<state.day, current=d===state.day;
    const label=`<span class="day-name ${current?'today':''}" title="${G.DAYS[d]}">${G.DAYS[d].replace('周','')}</span>`;
    const cells=d<6?state.plan[d].map((a,i)=>{
      const ac=G.ACTIONS[a],job=G.jobDetail(state,d),label=a==='work'?job.short:{admin:'事务',creative:'创作',second:'二手',prep:'备货',sell:'摆摊'}[a]||ac.short||ac.name;return `<button class="schedule-action ${ac.color} ${done?'done':''}" data-day="${d}" data-person-action="${i}" ${a==='work'?`data-shift="${d}"`:''} ${done||busy?'disabled':''} title="${escape(state.chars[i].name)} · ${a==='work'?job.name:ac.name}${a==='work'?' · 查看岗位和换班':' · 点击改安排'}" aria-label="${G.DAYS[d]}${escape(state.chars[i].name)}${a==='work'?job.name:ac.name}">${icon(a==='work'?job.icon:ac.icon)}<span>${label}</span></button>`;
    }).join(''):`<button class="schedule-action sunday ${done?'done':''}" data-sunday ${done||busy?'disabled':''} title="周日一起做点什么">${icon(state.sunday==='walk'?'footprints':state.sunday==='home'?'house':'sandwich')}<span>${state.sunday==='walk'?'散步':state.sunday==='home'?'在家':'野餐'}</span>${icon(done?'check':'chevron-down')}</button>`;
    return `<div class="day-row">${label}${cells}</div>`;
  }).join('');
  const f=G.forecast(state);$('forecast').classList.toggle('error',!!f.error);
  $('forecast').innerHTML=f.error?`${icon('circle-alert')}<span>${escape(f.error)}</span>`:`<span>${state.day===7?'本周结余':'预计周末结余'}${f.state.debt?`<br>待缴生活费 ${f.state.debt}币`:''}</span><strong>${f.state.cash}<small> 币</small></strong>`;
  $('run').disabled=busy;
  const runLabel=busy?'进行中':state.day===7?'账本':G.eventFor(state)?'小事':state.day===6?'放假':'开工';
  $('run').setAttribute('aria-label',busy?'过好这一天':state.day===7?'查看这一周':G.eventFor(state)?'今天有件小事':`开始${G.DAYS[state.day]}`);
  $('run').title=$('run').getAttribute('aria-label');
  $('run').innerHTML=`${icon(busy?'loader-circle':state.day===7?'chart-no-axes-combined':G.eventFor(state)?'message-circle':'play')}<span>${runLabel}</span>`;
  const job=G.jobOf(state);$('job-name').textContent=state.day<6?`${G.DAYS[state.day]} · ${job.name}`:'本周抢班课表';$('job-pay').innerHTML=`${job.wage}<small>币 / 班</small>`;$('contract').querySelector('.contract-icon').innerHTML=icon(job.icon);
  $('preset').disabled=busy||state.day===7;
}
function renderScene(){
  $('scene').classList.toggle('weekend',state.day===7);
  $('scene').classList.toggle('town',scene==='town');$('scene-bg').src=`assets/${scene==='town'?'town':'apartment'}.webp`;
  $('scene-bg').alt=scene==='town'?'小店、共享办公室和街边的小摊':'阳光照进两个人的合租房';
  document.querySelectorAll('[data-scene]').forEach(b=>{b.classList.toggle('active',b.dataset.scene===scene);b.setAttribute('aria-pressed',b.dataset.scene===scene);});
  $('scene-caption').innerHTML=`${icon(scene==='town'?'store':'key-round')}<span>${scene==='town'?'小镇的共享岗位':'我们的合租小屋'}</span>`;
  $('props').innerHTML=scene==='home'?state.furniture.map(id=>{const f=G.FURNITURE.find(x=>x.id===id),spot=G.HOME_SPOTS[G.placementOf(state,id)];return `<button class="room-furniture ${decorating===id?'placing':''}" data-arrange="${id}" aria-label="摆放${f.name}，当前${spot.name}" style="left:${spot.x}%;bottom:${spot.bottom}%;width:${spot.width}%"><img src="assets/furniture-${f.sprite}.webp" alt="${f.name}"></button>`;}).join(''):'';
  $('actor-a').src=`assets/characters-${state.day===7?1:0}.webp`;$('actor-b').src=`assets/characters-${state.day===7?3:2}.webp`;
  const lines=[
    '阿忙：二四六我来！周日一起出去玩。',
    '阿闲：今天轮到你，我要认真地不工作。',
    '阿忙：有自己的收入，心里踏实一点。',
    '阿闲：下班以后的时间，终于是自己的了。',
    '阿忙：以后这个家，可以一点点变好。',
    '阿闲：最后一天班！我已经开始想周末了。',
    '阿忙：今天没有谁要打卡，慢慢走吧。',
    '阿闲：这周刚刚好。忙和闲，都分到了。'
  ];
  if(state.day<6){
    const job=G.jobDetail(state),worker=state.chars[state.plan[state.day].indexOf('work')];
    $('speech').innerHTML=`<b>${escape(worker.name)} · ${job.name}</b><span>${job.place} · ${job.task}</span>`;
    $('speech').title=`${job.place} · ${job.task}`;
  }else{$('speech').innerHTML=`<b>阿闲、阿忙${state.day===6?'一起放假':'本周收工'}</b>`;$('speech').title=state.debt?'阿忙：慢慢来，先把这一周过好。':lines[state.day];}
}
function renderContent(){
  document.querySelector('.app-shell').classList.toggle('panel-open',tab!==null);
  document.querySelector('.app-shell').dataset.panel=tab||'';
  $('content').dataset.panel=tab||'';
  $('planner').classList.toggle('mobile-hide',tab!=='plan');$('content').classList.toggle('mobile-hide',tab==='plan'||tab===null);
  document.querySelectorAll('[data-tab]').forEach(b=>{b.classList.toggle('active',b.dataset.tab===tab);b.setAttribute('aria-current',b.dataset.tab===tab?'page':'false');});
  if(tab==='plan'||tab===null) {
    $('content').innerHTML='';
  }
  if(tab==='home') {
    const navigation=contentPager(G.FURNITURE);
    $('content').innerHTML=`<div class="section-heading"><h3>我们的家</h3><span>添置后可选位置</span></div><div class="furniture-grid">${G.FURNITURE.slice(contentPage*3,contentPage*3+3).map(f=>{const owned=state.furniture.includes(f.id);return `<article class="furniture-item"><div class="furniture-image"><img src="assets/furniture-${f.sprite}.webp" alt="${f.name}"></div><div class="furniture-copy"><b>${f.name}</b><p>${owned?G.HOME_SPOTS[G.placementOf(state,f.id)].name:f.benefit}</p><button class="buy-button ${owned?'owned':''}" ${owned?'data-arrange':'data-buy'}="${f.id}" ${busy||(!owned&&state.day===7)?'disabled':''} title="${f.desc}">${icon(owned?'move':'coins')}<span>${owned?'挪个位置':`${f.cost} 币 · 添置`}</span></button></div></article>`;}).join('')}</div>${navigation}`;
  }
  if(tab==='jobs') {
    const days=[0,1,2,3,4,5],navigation=contentPager(days);
    $('content').innerHTML=`<div class="section-heading"><h3>抢班课表</h3><span>一天一人一个班</span></div><div class="shift-toolbar"><button class="text-button" data-draw ${busy||state.day>=6||state.drawUsed?'disabled':''}>${icon('package-open')}${state.drawWeek===state.week?'我的盲盒':'抽岗位盲盒'}</button><button class="text-button" data-course>${icon('book-open')}一周短训</button></div><div class="shift-list">${days.slice(contentPage*3,contentPage*3+3).map(d=>{const j=G.jobDetail(state,d),worker=state.chars[state.plan[d].indexOf('work')];return `<button class="shift-row" data-shift="${d}" ${busy||d<state.day?'disabled':''} title="${j.place} · ${state.shiftSources?.[d]==='draw'?'盲盒分配':state.shiftSources?.[d]==='claim'?'已抢到':'原班可保留'}"><span class="shift-date">${G.DAYS[d]}<small>${worker.name}</small></span><span class="shift-copy"><b>${j.name}</b><small>${j.place}</small></span><span class="shift-wage">${j.wage}<small>币/班</small></span>${icon(d<state.day?'check':'chevron-right')}</button>`;}).join('')}</div><p class="shift-note">进修一下，就能试试新岗位</p>${navigation}`;
  }
  if(tab==='diary') {
    const memoryNames={first:'第一张好日程',learn:'新本事',side:'第一次小生意',home:'我们的家',balance:'忙闲刚刚好'};
    const items=photoView?state.memories:state.log,navigation=contentPager(items),visible=items.slice(contentPage*2,contentPage*2+2);
    $('content').innerHTML=`<div class="section-heading"><h3>${photoView?'生活照片':'生活日记'}</h3><button class="text-button photo-toggle" data-photo-view title="${photoView?'查看日记':'查看照片'}" aria-label="${photoView?'查看日记':'查看照片'}">${icon(photoView?'notebook-pen':'images')}<span>${photoView?'日记':'照片'}</span></button></div>${photoView?`<div class="memory-strip">${visible.length?visible.map(id=>`<div class="memory"><img src="assets/${id==='home'?'apartment':'town'}.webp" alt="${memoryNames[id]}"><p>${memoryNames[id]}</p></div>`).join(''):'<p class="empty-state">过好今天，慢慢收集生活照片。</p>'}</div>`:`<ul class="diary-log">${visible.length?visible.map(l=>`<li><span class="diary-date">第${l.week}周 · ${G.DAYS[Math.min(l.day,6)]}</span><span>${escape(l.text)}</span></li>`).join(''):`<li class="empty-state"><span>日记的第一页，留给今天。</span></li>`}</ul>`}<div class="diary-actions"><button class="text-button diary-goals" data-goals>${icon('flag')}目标与奖励</button>${state.reports.length?`<button class="text-button report-button" data-last-report>${icon('receipt-text')}上周账本</button>`:''}</div>${navigation}`;
  }
  $('content').querySelector('.section-heading')?.insertAdjacentHTML('beforeend',`<button class="icon-button" data-close-panel title="收起窗口" aria-label="收起窗口">${icon('x')}</button>`);
  fitPanelActors();
}
function fitPanelActors(){
  if(tab===null)return;
  const shell=document.querySelector('.app-shell'),panel=tab==='plan'?$('planner'):$('content');
  const edge=panel.getBoundingClientRect().top,top=document.querySelector('.top-dock').getBoundingClientRect().bottom;
  // Heads stay visible above the window; on short screens the lower body sits behind it.
  shell.style.setProperty('--panel-edge',`${shell.getBoundingClientRect().bottom-edge}px`);
  shell.style.setProperty('--actor-space',`${Math.max(12,edge-top-10)}px`);
}
function render(){
  $('cash').textContent=state.cash>=100000000?`${(state.cash/100000000).toFixed(1).replace(/\.0$/,'')}亿`:state.cash>=10000?`${(state.cash/10000).toFixed(1).replace(/\.0$/,'')}万`:state.cash;$('wallet').title=`生活账户：${state.cash}币`;$('wallet')?.classList.toggle('low',state.cash<100);
  $('week').textContent=`第 ${state.week} 周`;$('day').textContent=state.day===7?'周末结算':G.DAYS[state.day];
  const chapter=G.chapterProgress(state);
  $('goals-button').innerHTML=`${icon(chapter?.done?'gift':'flag')}<span>${chapter?.done?'可领奖':'目标'}</span>`;
  renderSound();renderPeople();renderSchedule();renderScene();renderContent();renderTutorialResume();if(decorating)renderDecorator();icons();
}
function personModal(i) {
  const c=state.chars[i];
  openModal(`${c.name}的档案`,`<div class="profile-card"><img class="profile-portrait" src="assets/ui-v12/portrait-${i?'mang':'xian'}.webp" alt="${escape(c.name)}"><p class="profile-quote">${i?'“有班上，也想把生活过好。”':'“不上班的日子，也不是在浪费。”'}</p><div class="profile-status">${[['精力',c.energy,'zap'],['心情',c.mood,'smile']].map(([name,value,symbol])=>`<div class="profile-stat">${icon(symbol)}<span>${name}</span><b>${value}</b><progress value="${value}" max="100" aria-label="${name}"></progress></div>`).join('')}</div><div class="profile-skills">${c.xp.map((v,k)=>{const p=G.progress(v);return `<div class="skill-row"><div class="skill-label"><b>${k?'创作':'事务'}技能</b><span>Lv.${p.level}</span></div><progress value="${p.percent}" max="100" aria-label="${k?'创作':'事务'}技能进度"></progress><small>${p.level===3?'已熟练':`${p.current} / ${p.need}`}</small></div>`;}).join('')}</div><div class="profile-ledger"><span>本周出勤 <b>${state.ledger.shifts[i]}天</b></span><span>本周工资 <b>${state.ledger.salary[i]}币</b></span></div></div>`,'每个人，都有自己的成长',i?'mang':'xian');
}
function shiftModal(d){
  if(d<state.day||d>5||busy)return;
  const worker=state.plan[d].indexOf('work'),c=state.chars[worker],current=G.jobDetail(state,d);
  openModal(`${G.DAYS[d]} · ${c.name}上什么班`,
    `<div class="shift-tools"><div class="shift-summary"><small>今天已排</small><b>${current.name} · ${current.wage}币</b><p>${current.place}：${current.task}</p></div><div class="shift-shortcuts"><button class="text-button swap-button" data-shift-swap="${d}">${icon('arrow-left-right')}换成${state.chars[1-worker].name}上班</button><button class="text-button" data-course>${icon('graduation-cap')}短期进修</button></div></div>`+
    G.shiftOffers(state,d).map(job=>{
      const qualified=G.qualifies(c,job),selected=current.id===job.id,detail=G.JOB_DETAILS[job.id];
      return `<button class="action-option ${selected?'active':''}" data-claim-day="${d}" data-claim-job="${job.id}" ${!qualified||selected?'disabled':''}><span class="offer-icon">${icon(job.icon)}</span><span><b>${job.name} · ${job.wage}币/班</b><small>${detail.place} · ${selected?'已排到这一天':qualified?'1个可选班位':`${job.skill?'创作':'事务'}${job.level}级，进修即可`}</small></span><span class="claim-label">${selected?icon('check'):qualified?'抢这个班':icon('book-open')}</span></button>`;
    }).join(''),
    '按日期抢班，空档留给自己','shift');
}
function drawModal(){
  if(state.drawWeek!==state.week&&!perform(()=>G.draw(state)))return;
  const job=G.JOBS.find(j=>j.id===state.drawJob);if(!job)return;
  openModal('盲盒里的新班',`<div class="draw-reveal">${icon(job.icon)}<h3>${job.name}</h3><p>${G.JOB_DETAILS[job.id].place} · ${job.wage}币/班</p><small>${job.line}</small></div><p class="modal-caption">选一天，安排${job.name}。每周免费抽一次，选定前仍可保留原班。</p>`+Array.from({length:6},(_,d)=>{
    const c=state.chars[state.plan[d].indexOf('work')],ok=G.qualifies(c,job);
    return `<button class="action-option" data-draw-day="${d}" ${d<state.day||!ok||state.drawUsed?'disabled':''}><span><b>${G.DAYS[d]} · ${c.name}</b><small>${d<state.day?'这一天已完成':!ok?`${job.skill?'创作':'事务'}${job.level}级后可上岗`:state.drawUsed?'本周盲盒已经分配':'将原班换成这个岗位'}</small></span>${icon('calendar-check')}</button>`;
  }).join(''),'先看看，再决定哪天上','draw');
}
function courseModal(){
  openModal('学会，就能上岗',`<p class="modal-caption">利用不上班的三天空档进修。每节40币、经验+3，三节从零到2级，一周就能学会新岗位。</p>`+[0,1].map(skill=>`<button class="action-option" data-plan-course="${skill}" ${state.day>=6?'disabled':''}>${icon(skill?'pencil-ruler':'book-open')}<span><b>${skill?'创作':'事务'}一周短训</b><small>${skill?'活动助理、图文助理':'登记、文档整理、排版'} · 自动安排剩下空档</small></span>${icon('calendar-plus')}</button>`).join('')+`<p class="option-note">课表只安排，不预扣钱。可以再改为休息；本周已上过的课不重排。进修后到抢班课表选择新岗位。</p>`,'白天轮流上班，空档各学一点','course');
}
function startDecorating(id){
  if(busy||!state.furniture.includes(id))return;
  closeModal();tab=null;scene='home';decorating=id;
  $('game-shell').classList.add('decoration-mode');render();renderDecorator();
}
function renderDecorator(){
  const box=$('decorator');box.hidden=!decorating;if(!decorating){box.innerHTML='';return;}
  const f=G.FURNITURE.find(f=>f.id===decorating),selected=G.placementOf(state,decorating);
  box.innerHTML=`<div class="decorator-title"><b>${f.name}</b><button class="icon-button" data-decor-done title="完成摆放" aria-label="完成摆放">${icon('check')}<span>完成摆放</span></button></div><p>现在在${G.HOME_SPOTS[selected].name} · 点击位置即保存</p><div class="decorator-spots">${G.HOME_CHOICES[f.id].map(spot=>{const available=G.spotAvailable(state,f.id,spot);return `<button class="text-button ${spot===selected?'chosen':''}" data-place="${spot}" ${!available?'disabled':''}>${icon(spot===selected?'check':'map-pin')}<span>${G.HOME_SPOTS[spot].name}${available?'':' · 已挤满'}</span></button>`;}).join('')}</div><small>轻点房间里的其他家具，也能换位置。</small>`;icons();
}
function stopDecorating(){
  decorating=null;$('game-shell').classList.remove('decoration-mode');renderDecorator();
}
function scheduleModal(d,i) {
  if(busy||d<state.day)return;
  const worker=state.plan[d].indexOf('work'),free=1-worker,c=state.chars[free];
  openModal(`${G.DAYS[d]} · ${c.name}空档`,`<button class="text-button swap-button" data-swap="${d}" data-worker="${free}">${icon('arrow-left-right')}<span>换班：让${escape(c.name)}上班，${escape(state.chars[worker].name)}空闲</span></button><div class="action-options">${Object.entries(G.ACTIONS).filter(([k])=>k!=='work').map(([k,a])=>`<button class="action-option ${state.plan[d][free]===k?'active':''}" data-action="${k}" data-action-day="${d}" data-action-person="${free}">${icon(a.icon)}<span><b>${a.name}</b><small>${a.detail}</small></span>${icon(state.plan[d][free]===k?'check':'chevron-right')}</button>`).join('')}</div>`,'一天一个行动，工资先到账','free-time');
}
function sundayModal(){
  if(state.day>6||busy)return;
  const options=[['walk','footprints','一起散步','免费 · 两人精力 +40，心情 +12'],['home','house','在家慢慢过','免费 · 两人精力 +50，心情 +8'],['picnic','sandwich','带便当去野餐','60币 · 两人精力 +40，心情 +20']];
  openModal('周日，一起放假',`<div class="action-options">${options.map(([id,ic,name,detail])=>`<button class="action-option ${state.sunday===id?'active':''}" data-sunday-choice="${id}">${icon(ic)}<span><b>${name}</b><small>${detail}</small></span>${icon(state.sunday===id?'check':'chevron-right')}</button>`).join('')}</div>`,'不用打卡的一天','sunday');
}
function objectiveRows(rows){return rows.map(r=>`<div class="objective-row"><span>${icon(r.done?'check-circle-2':'circle')} ${r.label}</span><b>${Math.min(r.value,r.target)} / ${r.target}</b><progress value="${Math.min(r.value,r.target)}" max="${r.target}" aria-label="${r.label}"></progress></div>`).join('');}
function goalsModal(view='daily'){
  const j=G.journeyOf(state),g=G.goalFor(state),c=G.chapterProgress(state),r=G.requestProgress(state);
  let body=`<nav class="goal-nav" aria-label="目标分类">${[['daily','小目标'],['requests','街坊委托'],['journey','大目标']].map(([id,title])=>`<button class="text-button ${view===id?'selected':''}" data-goal-view="${id}">${title}</button>`).join('')}</nav>`;
  if(view==='daily'){
    const d=G.dailyGoal(state);
    body+=`<div class="goal-paper"><small>每日收获 · ${state.day>=7?'本周已收工':G.DAYS[state.day]}</small><h3>${state.day===7?'这周的小努力都算数':d.title}</h3><p>${state.day===7?`已完成 ${j.weekly.daily.length} 个每日小目标。`:d.hint}</p><b class="reward-label">${state.day===7?'下一周有新的每日目标':`额外 +${d.reward} 生活币`}</b></div><div class="goal-paper"><small>本周心愿 · 周日自动结算</small><h3>${g.title}</h3><p>${g.description}</p><b class="reward-label">${state.day===7?(state.reports.at(-1)?.wishReward===80?'已领取 +80币与生活照片':state.reports.at(-1)?.goalMet?'旧版心愿已完成 · 新奖励从下一周开始':'这周未完成，下周再来'):'奖励 +80币与生活照片'}</b></div><button class="text-button" data-goal-route="plan">${icon('calendar-days')}去排班，安排今日小目标</button><button class="text-button" data-goal-view="requests">${icon('mail')}选一份本周街坊委托</button>`;
  }else if(view==='requests'){
    if(r)body+=`<div class="goal-paper"><small>本周已接委托 · ${r.paid?'已交付':'进行中'}</small><h3>${r.title}</h3><p>${r.story}</p><b class="reward-label">${r.paid?'已到账':'完成自动到账'} +${r.reward}币</b></div>${objectiveRows(r.rows)}<button class="text-button" data-goal-route="jobs">${icon('briefcase-business')}去找班与进修</button><button class="text-button" data-goal-route="plan">${icon('calendar-days')}去排班与安排副业</button>`;
    else body+=`<p class="option-note">每周自选一份。进度从本周已完成的行动计算，达到条件自动领奖；未完成下周可重新选择。</p>`+G.REQUESTS.map(q=>{const p=G.requestProgress(state,q.id);return `<div class="goal-paper"><h3>${q.title}</h3><p>${q.story}</p><p>${q.needs.map(n=>n[2]).join(' · ')}</p><div class="goal-card-footer"><b class="reward-label">+${q.reward}币</b><button class="text-button" data-accept-request="${q.id}" ${p.locked||state.day>=6?'disabled':''}>${p.locked?'完成前两章解锁':state.day>=6?'下周可接':'接下委托'}</button></div></div>`;}).join('');
  }else{
    body+=`<div class="goal-paper"><small>生活印章 · ${j.claimed.length} / ${G.CHAPTERS.length}</small><h3>${c?c.title:'我们的理想生活，达成了！'}</h3><p>${c?c.story:'所有章节已完成。你们获得「小镇生活家」印章，可以继续接委托、换班与布置小家。'}</p><b class="reward-label">${c?`章节奖励 +${c.reward}币 · ${c.stamp}`:'完整成长目标已通关'}</b></div>`;
    if(c)body+=objectiveRows(c.rows)+`<button class="primary-button" data-claim-chapter ${c.done?'':'disabled'}>${icon('gift')}${c.done?'领取章节奖励':'完成以上目标即可领取'}</button>`;
    body+=`<div class="stamp-list">${G.CHAPTERS.map((q,i)=>`<span class="${j.claimed.includes(q.id)?'earned':''}">${icon(j.claimed.includes(q.id)?'award':'lock-keyhole')}${q.stamp}</span>`).join('')}</div><p class="option-note">四章路线：站稳脚跟 → 新本事与委托 → 舒服的小家 → 六岗位、六家具与生活储蓄。完成第二章解锁联合企划委托。</p><button class="text-button" data-goal-route="home">${icon('armchair')}去小家添置家具</button>`;
  }
  openModal('生活目标',body,'小步向前，也有大大的盼头','goals');
}
function wishModal(){goalsModal();}
function presetModal(){
  openModal('一周计划签',`<div class="action-options"><button class="action-option" data-preset="rest">${icon('coffee')}<span><b>忙闲刚刚好</b><small>交替上班，空档好好休息。</small></span>${icon('chevron-right')}</button><button class="action-option" data-preset="learn">${icon('book-open')}<span><b>这周学点东西</b><small>优先给两人补事务课，其他空档休息。</small></span>${icon('chevron-right')}</button><button class="action-option" data-preset="side">${icon('package')}<span><b>攒一点生活钱</b><small>安排剩余二手订单，有条件再备货摆摊。</small></span>${icon('chevron-right')}</button></div>`,'已完成的日程会保留','preset');
}
function applyPreset(type) {
  const n=structuredClone(state);let seconds=n.second,prep=n.batches,stock=n.inventory,course=0;
  for(let d=n.day;d<6;d++){
    const preferred=d%2,w=G.qualifies(n.chars[preferred],G.jobOf(n,d))?preferred:1-preferred,free=1-w;n.plan[d]=w?['rest','work']:['work','rest'];
    if(type==='learn'&&course<2){n.plan[d][free]='admin';course++;}
    if(type==='side'){
      if(seconds<2){n.plan[d][free]='second';seconds++;}
      else if(G.level(n.chars[free].xp[1])>=1){if(stock){n.plan[d][free]='sell';stock=0;}else if(!prep){n.plan[d][free]='prep';stock=1;prep=1;}}
    }
  }
  if(perform(()=>n)){closeModal();toast('剩下的日程排好了，开工前还能调整。');}
}
function reportModal(report=state.reports.at(-1)) {
  if(!report)return;
  const l=report.ledger,income=l.salary.reduce((a,b)=>a+b,0)+l.side+l.bonus,expenses=l.training+l.stock+l.life+l.furniture+l.recovery;
  const last=report.week===state.week&&state.day===7;
  openModal(`第${report.week}周账本`,`<div class="report-hero"><img src="assets/characters-1.webp" alt="阿闲"><div><h3>${report.balanced&&report.happy?'忙和闲，<br>都刚刚好。':'这周辛苦了，<br>慢慢往前走。'}</h3><p>${report.goalMet?`小心愿完成：${escape(report.goal)}`:'还有没做完的小心愿，下一周继续。'}</p></div><img src="assets/characters-3.webp" alt="阿忙"></div><div class="badge-row">${report.balanced?`<span class="badge">${icon('scale')}每人3天班</span>`:''}${report.happy?`<span class="badge">${icon('smile')}心情都不错</span>`:''}${report.debt?`<span class="badge warning">${icon('receipt')}待缴${report.debt}币</span>`:''}</div><p class="option-note">本周岗位：${(report.jobs||[report.job]).map(id=>G.JOBS.find(j=>j.id===id)?.name||'原班').join('、')}</p><div class="ledger-total"><div><small>本周总收入</small><b class="positive">+${income}</b></div><div><small>本周总支出</small><b class="negative">−${expenses}</b></div></div>${[['阿闲的工资',l.salary[0],true],['阿忙的工资',l.salary[1],true],['副业回款',l.side,true],['奖励与生活小事',l.bonus,true],['进修学费',l.training,false],['副业成本',l.stock,false],['生活开销',l.life,false],['新家具',l.furniture,false],['补缴旧账',l.recovery,false]].filter(([,v])=>v).map(([name,v,plus])=>`<div class="ledger-row"><span>${name}</span><b class="${plus?'positive':'negative'}">${plus?'+':'−'}${v}</b></div>`).join('')}<div class="ledger-row"><span>周末生活账户</span><b>${report.cash} 币</b></div>${report.debt?'<p class="option-note">没缴清的生活费下周补缴，无利息；基础岗位和免费休息一直可用。</p>':''}${last?`<button class="text-button" data-goal-view="journey">${icon('flag')}查看本周成长与章节奖励</button><div class="modal-actions"><button class="primary-button" data-next-week>${icon('arrow-right')}开始第${state.week+1}周</button></div>`:''}`,'六天打卡，一天生活','report');
}
function eventModal(){
  const e=G.eventFor(state);if(!e)return;
  openModal(e.title,`<img class="event-art" src="assets/town.webp" alt="小镇里的生活小事"><p class="modal-caption">${e.line}</p><div class="action-options">${e.options.map((o,i)=>`<button class="action-option" data-event-choice="${i}">${icon(i?'sparkles':'leaf')}<span><b>${o.name}</b><small>${o.hint}</small></span>${icon('chevron-right')}</button>`).join('')}</div>`,'今天有件小事','event');
}
function settingsModal(view='audio'){
  const nav=`<nav class="settings-nav" aria-label="设置分类">${[['audio','声音与节奏'],['save','存档与帮助']].map(([id,title])=>`<button class="text-button ${view===id?'selected':''}" data-settings-view="${id}">${title}</button>`).join('')}</nav>`;
  const body=view==='audio'?`<div class="settings-audio"><label class="toggle-row"><span>背景音乐</span><input id="sound-toggle" type="checkbox" ${sound?'checked':''}></label><label class="volume-control"><span>音量 <output id="volume-value" for="volume-slider">${Math.round(volume*100)}%</output></span><input id="volume-slider" type="range" min="0" max="100" step="1" value="${Math.round(volume*100)}" aria-label="游戏音量"></label><label class="toggle-row"><span>快速过一天</span><input id="fast-toggle" type="checkbox" ${fast?'checked':''}></label><div class="settings-shortcuts"><button class="text-button" data-tutorial-start>重看教程</button><button class="text-button" data-main-menu>返回主菜单</button></div></div>`:`<div class="settings-buttons"><button class="text-button" data-export>${icon('download')}导出存档</button><button class="text-button" data-import>${icon('upload')}导入存档</button><button class="text-button danger-button" data-reset>${icon('rotate-ccw')}重新开始</button></div><p class="option-note">${storageOK?'进度保存在此浏览器。':'此浏览器无法自动保存。'}换设备前可导出存档。</p><div class="ledger-row"><span>放松体验券</span><b>精力 +20</b></div><p class="option-note">每游戏周可用一次模拟广告；不播放商业广告，不产生真实收益。</p><button class="text-button" data-ad ${state.adWeek===state.week||state.day===7?'disabled':''}>${icon('clapperboard')}${state.adWeek===state.week?'本周已用':'体验模拟激励广告'}</button>`;
  openModal('生活设置',nav+body,'今天谁上班 · Demo V0.15','settings');
}
function renderSound(){$('sound').innerHTML=icon(sound&&volume>0?'volume-2':'volume-x');$('sound').title=sound?'关闭声音':'开启声音';$('sound').setAttribute('aria-label',$('sound').title);$('sound').setAttribute('aria-pressed',String(sound));}
function playMusic(){if(sound&&volume>0&&!document.hidden)music.play().catch(()=>{});else music.pause();}
function setSound(value){sound=value;persistPrefs();renderSound();if($('sound-toggle'))$('sound-toggle').checked=sound;playMusic();icons();}
function persistPrefs(){try{localStorage.setItem(PREF,JSON.stringify({fast,sound,volume,tutorialDone}));}catch{}}
function exportSave(){
  const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`今天谁上班_第${state.week}周存档.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);toast('存档已导出。');
}
async function runDay(){
  if(busy)return;
  if(state.day===7){reportModal();return;}
  if(G.eventFor(state)){eventModal();return;}
  let next;try{next=G.executeDay(state,state.week,state.day);}catch(e){toast(e.message);return;}
  const previous=state;busy=true;const previousDay=state.day,worker=previousDay<6?state.plan[previousDay].indexOf('work'):0;
  scene=previousDay===6?'home':'town';tab=null;render();$('scene').classList.add('busy');$('day-overlay').hidden=false;
  const workedJob=previousDay<6?G.jobDetail(state,previousDay):null;
  $('day-overlay-text').textContent=previousDay===6?'今天，两个人一起放假。':`${state.chars[worker].name} · ${workedJob.name}\n${workedJob.place}\n${workedJob.task}`;
  colorCharacterNames($('day-overlay-text'));
  await new Promise(resolve=>setTimeout(resolve,fast?130:1050));
  let committed=false;
  try{commit(next);committed=true;}catch(e){toast(e.message);}
  busy=false;$('scene').classList.remove('busy');$('day-overlay').hidden=true;render();
  if(!committed)return;
  if(sound&&volume>0){const ding=new Audio('assets/day.wav');ding.volume=volume;ding.play().catch(()=>{});}
  if(state.day===7){scene='home';render();reportModal();}
  else{
    const bonus=state.ledger.bonus-previous.ledger.bonus,daily=G.dailyGoal(previous),request=G.requestProgress(state),c=G.chapterProgress(state);
    const levelUps=state.chars.flatMap((ch,i)=>ch.xp.map((xp,k)=>G.level(xp)>G.level(previous.chars[i].xp[k])?`${ch.name}的${k?'创作':'事务'}技能升到${G.level(xp)}级`:null)).filter(Boolean);
    openModal(`${G.DAYS[previousDay]} · 今日收获`,`<div class="goal-paper"><small>${workedJob.place}</small><h3>${workedJob.name}完成！</h3><p>${workedJob.task}</p><b class="reward-label">工资 +${state.ledger.salary[worker]-previous.ledger.salary[worker]}币${bonus?` · 奖励 +${bonus}币`:''}</b></div><p class="modal-caption">${G.journeyOf(state).weekly.daily.includes(previousDay)?`每日小目标完成，额外 +${daily.reward}币。`:`今日小目标还差「${G.ACTIONS[daily.action].name}」，明天可以换个安排。`}</p>${request?.paid&&!G.requestProgress(previous)?.paid?`<p class="milestone-note">${icon('mail-check')}<span>街坊委托交付：${request.title}</span></p>`:''}${levelUps.map(text=>`<p class="milestone-note">${icon('sparkles')}<span>${text}，可以试试新岗位了。</span></p>`).join('')}${c?.done?`<button class="primary-button" data-goal-view="journey">${icon('gift')}本章目标完成，去领奖</button>`:''}<button class="text-button" data-goal-view="daily">${icon('flag')}看看明天的小目标</button><button class="primary-button" data-close-reward>继续生活</button>`,'今天的小努力，也有回响','reward');
  }
}
async function simulatedAd(){
  openModal('放松体验券',`<p class="modal-caption">广告演示，不连接真实广告平台。</p><div class="ad-timer" id="ad-timer">3</div><p class="modal-caption" style="text-align:center">奖励：两人精力 +20</p>`,'模拟激励广告','ad');
  for(let remaining=3;remaining>0;remaining--){if(!$('modal').open||modalKind!=='ad')return;$('ad-timer').textContent=remaining;await new Promise(resolve=>setTimeout(resolve,1000));}
  if(!$('modal').open||modalKind!=='ad')return;
  if(perform(()=>G.adReward(state))){closeModal();toast('体验结束，两人精力 +20。');}
}
document.addEventListener('click',event=>{
  if(event.isTrusted&&!menuOpen&&sound&&music.paused)playMusic();
  const b=event.target.closest('button');
  if(!b){if(!busy&&(event.target.id==='scene-bg'||event.target.id==='scene')){tab=null;renderContent();icons();}return;}
  if(b.id==='close-modal'){closeModal();return;}
  if(b.hasAttribute('data-modal-page')){modalPage=Number(b.dataset.modalPage);renderModalPage();return;}
  if(b.id==='menu-new'){requestNewGame();return;}
  if(b.id==='menu-continue'){refreshMenuSave();if(hasSavedGame)enterGame();return;}
  if(b.hasAttribute('data-main-menu')){showMenu();return;}
  if(b.hasAttribute('data-cancel-new')){closeModal();return;}
  if(b.hasAttribute('data-confirm-new')){startNewGame();return;}
  if(busy){if(b.id==='sound')setSound(!sound);return;}
  if(b.hasAttribute('data-tutorial-start')){startTutorial();return;}
  if(b.id==='tutorial-resume'){tutorialModal();return;}
  if(b.hasAttribute('data-tutorial-skip')){finishTutorial();return;}
  if(b.hasAttribute('data-tutorial-back')){tutorialStep=Math.max(0,tutorialStep-1);tutorialModal();return;}
  if(b.hasAttribute('data-tutorial-next')){if(tutorialStep===TUTORIAL.length-1)finishTutorial();else{tutorialStep++;tutorialModal();}return;}
  if(b.hasAttribute('data-tutorial-look')){closeModal();const route=b.dataset.tutorialLook;if(route==='goals')goalsModal();else{tab=route;contentPage=0;scene=route==='jobs'?'town':route==='home'?'home':scene;render();}return;}
  if(b.id==='goals-button'||b.hasAttribute('data-goals')){goalsModal();return;}
  if(b.hasAttribute('data-goal-view')){goalsModal(b.dataset.goalView);return;}
  if(b.hasAttribute('data-close-reward')){closeModal();return;}
  if(b.hasAttribute('data-accept-request')){if(perform(()=>G.acceptRequest(state,b.dataset.acceptRequest)))goalsModal('requests');return;}
  if(b.hasAttribute('data-claim-chapter')){const c=G.chapterProgress(state);if(perform(()=>G.claimChapter(state))){goalsModal('journey');toast(`获得「${c.stamp}」 · +${c.reward}币`);}return;}
  if(b.hasAttribute('data-goal-route')){closeModal();tab=b.dataset.goalRoute;contentPage=0;scene=tab==='home'?'home':tab==='jobs'?'town':scene;render();return;}
  if(b.hasAttribute('data-decor-done')){stopDecorating();render();return;}
  if(b.dataset.arrange){startDecorating(b.dataset.arrange);return;}
  if(b.dataset.place){if(perform(()=>G.placeFurniture(state,decorating,b.dataset.place)))renderDecorator();return;}
  if(b.hasAttribute('data-shift')){shiftModal(Number(b.dataset.shift));return;}
  if(b.hasAttribute('data-shift-swap')){const d=Number(b.dataset.shiftSwap);if(perform(()=>G.setWorker(state,d,1-state.plan[d].indexOf('work'))))shiftModal(d);return;}
  if(b.hasAttribute('data-claim-day')){if(perform(()=>G.claimShift(state,Number(b.dataset.claimDay),b.dataset.claimJob))){closeModal();toast('班位排好了，日程里可以查看。');}return;}
  if(b.hasAttribute('data-draw-day')){if(perform(()=>G.claimShift(state,Number(b.dataset.drawDay),state.drawJob,{fromDraw:true}))){closeModal();toast('盲盒岗位排到这一天了。');}return;}
  if(b.hasAttribute('data-course')){courseModal();return;}
  if(b.hasAttribute('data-plan-course')){if(perform(()=>G.planCourse(state,Number(b.dataset.planCourse)))){closeModal();tab='plan';render();toast('短训课表排好了，仍可以调整。');}return;}
  if(b.hasAttribute('data-draw')){drawModal();return;}
  if(b.dataset.scene){scene=b.dataset.scene;render();}
  if(b.dataset.tab){tab=tab===b.dataset.tab?null:b.dataset.tab;contentPage=0;if(tab==='home')scene='home';if(tab==='jobs')scene='town';render();}
  if(b.hasAttribute('data-close-panel')){tab=null;renderContent();icons();}
  if(b.hasAttribute('data-content-page')){contentPage=Number(b.dataset.contentPage);renderContent();icons();}
  if(b.hasAttribute('data-photo-view')){photoView=!photoView;contentPage=0;renderContent();icons();}
  if(b.hasAttribute('data-person'))personModal(Number(b.dataset.person));
  if(b.hasAttribute('data-person-action'))scheduleModal(Number(b.dataset.day),Number(b.dataset.personAction));
  if(b.hasAttribute('data-sunday'))sundayModal();
  if(b.dataset.sundayChoice){const n=structuredClone(state);n.sunday=b.dataset.sundayChoice;if(perform(()=>n))closeModal();}
  if(b.dataset.action){if(perform(()=>G.setAction(state,Number(b.dataset.actionDay),Number(b.dataset.actionPerson),b.dataset.action)))closeModal();}
  if(b.hasAttribute('data-swap')){if(perform(()=>G.setWorker(state,Number(b.dataset.swap),Number(b.dataset.worker))))scheduleModal(Number(b.dataset.swap),Number(b.dataset.worker));}
  if(b.id==='run')runDay();
  if(b.id==='preset')presetModal();
  if(b.dataset.preset)applyPreset(b.dataset.preset);
  if(b.id==='contract'){tab='jobs';contentPage=0;scene='town';render();}
  if(b.dataset.job){if(perform(()=>G.selectJob(state,b.dataset.job)))toast(`这周一起做${G.jobOf(state).name}。`);}
  if(b.dataset.buy){const f=G.FURNITURE.find(f=>f.id===b.dataset.buy);openModal(f.name,`<div class="report-hero"><img src="assets/furniture-${f.sprite}.webp" alt="${f.name}"><div><h3>${f.cost} 生活币</h3><p>${f.desc}</p><p class="hint-price">${f.benefit}</p></div></div><div class="modal-actions"><button class="primary-button" data-confirm-buy="${f.id}">${icon('shopping-bag')}搬回家</button></div>`,'给家添点新东西','buy');}
  if(b.dataset.confirmBuy){if(perform(()=>G.buy(state,b.dataset.confirmBuy))){startDecorating(b.dataset.confirmBuy);toast('新家具搬回家了，挑个位置吧。');}}
  if(b.hasAttribute('data-next-week')){if(perform(()=>G.nextWeek(state))){closeModal();tab=null;contentPage=0;scene='home';render();toast(`第${state.week}周，留点时间给自己。`);}}
  if(b.hasAttribute('data-last-report'))reportModal();
  if(b.hasAttribute('data-event-choice')){if(perform(()=>G.resolveEvent(state,Number(b.dataset.eventChoice)))){closeModal();runDay();}}
  if(b.id==='settings')settingsModal();
  if(b.hasAttribute('data-settings-view')){settingsModal(b.dataset.settingsView);return;}
  if(b.id==='sound')setSound(!sound);
  if(b.hasAttribute('data-export'))exportSave();
  if(b.hasAttribute('data-import'))$('import-file').click();
  if(b.hasAttribute('data-reset'))requestNewGame();
  if(b.hasAttribute('data-ad'))simulatedAd();
});
document.addEventListener('change',event=>{
  if(event.target.id==='sound-toggle')setSound(event.target.checked);
  if(event.target.id==='fast-toggle'){fast=event.target.checked;persistPrefs();}
});
document.addEventListener('input',event=>{
  if(event.target.id==='volume-slider'){
    volume=Math.max(0,Math.min(100,Number(event.target.value)))/100;music.volume=volume;
    $('volume-value').textContent=`${Math.round(volume*100)}%`;persistPrefs();renderSound();playMusic();icons();
  }
});
$('import-file').addEventListener('change',async event=>{
  const file=event.target.files[0];if(!file)return;
  try{
    if(file.size>150000)throw Error('文件过大，请选择本游戏导出的JSON存档。');
    const candidate=JSON.parse(await file.text());if(!G.validateSave(candidate))throw Error('存档格式不正确，原进度已经保留。');
    openModal(`恢复到第${candidate.week}周？`,`<p class="modal-caption">生活账户 ${candidate.cash}币，当前${candidate.day===7?'周末结算':G.DAYS[candidate.day]}。恢复前会把当前进度导出。</p><button class="primary-button" id="confirm-import">${icon('upload')}恢复这份存档</button>`,'把生活接回来','import');
    $('confirm-import').addEventListener('click',()=>{exportSave();if(perform(()=>candidate)){closeModal();tab=null;scene='home';render();toast('进度恢复好了。');}},{once:true});
  }catch(e){toast(e.message);}event.target.value='';
});
$('modal').addEventListener('click',event=>{if(event.target===$('modal')){const r=$('modal').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeModal();}});
$('modal').addEventListener('cancel',()=>{modalKind='';});
window.addEventListener('resize',()=>{if($('modal').open)paginateModal();fitPanelActors();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('modal').open){tab=null;renderContent();icons();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden||menuOpen)music.pause();else if(sound)music.play().catch(()=>{});});
window.addEventListener('storage',event=>{if(event.key===KEY){if(!event.newValue){if(menuOpen){hasSavedGame=false;lastSavedRaw=null;renderMenu();}return;}try{const candidate=JSON.parse(event.newValue);if(G.validateSave(candidate)){if(busy){toast('另一个页面修改了存档，正在同步进度。');}else{state=candidate;hasSavedGame=true;lastSavedRaw=event.newValue;closeModal();render();renderMenu();toast('已同步另一个页面的进度。');}}}catch{}}});
try{lastSavedRaw=localStorage.getItem(KEY);}catch{storageOK=false;}
render();renderMenu();icons();if(pendingReloadNotice)toast(pendingReloadNotice);
if('serviceWorker' in navigator&&window.isSecureContext){
  const register=()=>navigator.serviceWorker.register('./sw.js?v=0.15').catch(()=>{});
  // Finish the visible menu before downloading the offline copy of the full game.
  if(document.readyState==='complete')register();
  else window.addEventListener('load',register,{once:true});
}
