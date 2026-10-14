import * as G from './engine.js?v=home-v10';
import * as H from './home-system.js?v=home-v10';
import {paintOutfit} from './outfits.js?v=1.0.3-textiles21';

const $=id=>document.getElementById(id), icon=name=>`<i data-lucide="${name}"></i>`;
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const glyph=(name,work=false)=>`<span class="symbol-glyph ${work?'symbol-work':'symbol-life'}" data-symbol="${name}">${icon(name)}</span>`;
const REQUEST_SYMBOLS={'shop-help':'store',community:'newspaper',market:'package',studio:'handshake'};
const CHAPTER_SYMBOLS={settle:'key-round',grow:'graduation-cap',home:'house',dream:'sparkles'};
const WISH_SYMBOLS={first:'scale',learn:'book-open',side:'package',home:'house'};
const REQUIREMENT_SYMBOLS={shifts:'briefcase-business',courses:'book-open',furniture:'armchair',jobs:'briefcase-business',skills:'graduation-cap',commissions:'mail',balancedWeeks:'scale',sideOrders:'package',cash:'coins',wishes:'heart',shop:'store',office:'clipboard-list',advanced:'briefcase-business',course:'book-open',side:'package',rest:'coffee',mood:'smile',sunday:'footprints'};
const stat=(symbol,value,label)=>`<span class="symbol-stat" title="${escape(label)}" aria-label="${escape(label)} ${escape(value)}">${icon(symbol)}<span>${escape(value)}</span></span>`;
const reward=amount=>`<b class="symbol-reward">${stat('coins',`+${amount}`,'生活币奖励')}</b>`;
const heading=(symbol,title,work=false)=>`<div class="symbol-identity">${glyph(symbol,work)}<h3>${escape(title)}</h3></div>`;
function actionEffects(action){
  const effects={rest:[['zap','+30','精力'],['smile','+6','心情']],admin:[['graduation-cap','+3','事务经验'],['coins','−40','学费'],['zap','−15','精力'],['smile','−5','心情']],creative:[['graduation-cap','+3','创作经验'],['coins','−40','学费'],['zap','−15','精力'],['smile','−5','心情']],second:[['coins','+50','净收入'],['zap','−15','精力'],['smile','−4','心情']],prep:[['coins','−40','备货成本'],['zap','−15','精力'],['smile','−4','心情']],sell:[['coins','+140','回款'],['zap','−15','精力'],['smile','−4','心情']]};
  return `<span class="symbol-effects">${effects[action].map(args=>stat(...args)).join('')}</span>`;
}
const PLAYER_KEY='today-who-works-save-v1',PLAYER_PREF='today-who-works-preferences-v1',ADMIN_KEY='today-who-works-admin-test-v1',ADMIN_SESSION='today-who-works-admin-mode';
let adminMode=false;
try{adminMode=sessionStorage.getItem(ADMIN_SESSION)==='true';}catch{}
H.setAdminMode(adminMode);
let KEY=adminMode?ADMIN_KEY:PLAYER_KEY,PREF=adminMode?ADMIN_KEY+'-preferences':PLAYER_PREF;
const DEFAULT_VOLUME=.35;
const MEMORIES={
  first:{name:'第一张好日程',caption:'一周的班轮着上，星期天的桥一起走。',alt:'阿闲和阿忙在红色小桥上并肩散步，身旁是小镇与河水。'},
  learn:{name:'新本事',caption:'课后的桌上，多了两件自己做的小作品。',alt:'阿闲举起自己的纸版画，阿忙在窗边的手作课桌上拼出小房子。'},
  side:{name:'第一次小生意',caption:'收摊时数一数，开心比硬币还多。',alt:'阿闲在街角小摊数硬币，阿忙开心地举起卖空的托盘。'},
  home:{name:'我们的家',caption:'一点点添置，一点点把出租屋住成家。',alt:'阿闲摆好一盆绿植，阿忙蹲下来安置家里的新边桌。'},
  balance:{name:'忙闲刚刚好',caption:'这一周，认真上班，也认真一起发呆。',alt:'阿闲和阿忙坐在夜晚的露台上读书、喝茶，远处亮起小镇的灯。'}
};
let state=adminMode?H.createAdminSave(G.fresh()):G.fresh(), tab=null, scene='home', busy=false, sound=true, volume=DEFAULT_VOLUME, fast=false, toastTimer, modalKind='', pendingReloadNotice='',storageOK=true,lastSavedRaw=null,hasSavedGame=false,menuOpen=true;
let contentPage=0, photoView=false, modalPage=0, modalPages=[],decorating=null;
let homeView=null,homeLoading=null,homeFilter='all',homeFocus='living',wardrobePerson=0,wardrobePart='top',wardrobePose='stand',wardrobeDraft=null,wardrobePage=0,reduceMotion=false;
let tutorialStep=null,tutorialDone=false;
const TUTORIAL=[
  {title:'认识两位室友',text:'阿闲和阿忙共享一个班位：一人上班，一人自由安排。点场景里的人物，查看精力、心情与技能。',hint:'阿闲是蓝色，阿忙是暖色；周日一起放假。',alt:'两位室友，蓝框标出阿闲、暖色框标出阿忙。',route:'people',look:'阿闲'},
  {title:'今天，去上什么班？',text:'点「找班」，再点未开工的日期卡片，查看岗位、地点与工资，抢班或换当班人。',hint:'技能不够就短训；每周还有一次岗位盲盒。',alt:'找班界面，框选岗位日期卡片和短训按钮。',route:'jobs',look:'找班'},
  {title:'把空档留给自己',text:'点「排班」里的空档格，安排休息、进修或副业。点工作格，可以查看岗位与换班。',hint:'图中框选了阿闲的休息格；第一周已有示范安排。',alt:'排班表中框选阿闲的一个休息格，可点击修改空档安排。',route:'plan',look:'排班'},
  {title:'安排好，就开工！',text:'收起窗口，点底部开工按钮，完成一天后查看工资、技能与奖励收获。',hint:'只有开工才推进一天；去看看不会直接开工。',alt:'主场景底部，蓝框标出播放形状的开工按钮。',route:'run',look:'开工按钮'},
  {title:'给生活一点小盼头',text:'点「目标」，看看每周计划，也可以接一份街坊委托。',hint:'本周心愿和委托奖励自动到账；成长奖励记得手动领取。',alt:'目标窗口中的每周计划、进度与奖励。',route:'goals',look:'目标'},
  {title:'把每个房间住成家',text:'从小家选择房间，目标达成后免费开放。添置家具后进入布置，拖到地面上；红色落点会退回原位。',hint:'可以收纳、搬到其他房间，也能用方向按钮微调。点家具，两位室友就会使用它。',alt:'家具在客厅地面上拖动，绿色落点可以放置。',route:'home',look:'小家',visual:'home'},
  {title:'穿上自己的小奖励',text:'点底部的衣橱，分别搭配上衣、下装和配饰。选中先预览，确认才保存。',hint:'完成上班、休息、短训和周日出游解锁衣服；服装和家具演出没有额外加成。',alt:'衣橱分为上衣、下装和配饰三个部位。',route:'wardrobe',look:'衣橱',visual:'wardrobe'}
];
const MUSIC_TRACKS=Array.from({length:4},(_,i)=>`assets/music/music-${String(i+1).padStart(2,'0')}.mp3`);
let musicTrack=0;
const music=new Audio();music.preload='none';music.src=MUSIC_TRACKS[0];music.hidden=true;music.id='background-music';document.body.append(music);
music.addEventListener('ended',()=>{musicTrack=(musicTrack+1)%MUSIC_TRACKS.length;music.src=MUSIC_TRACKS[musicTrack];playMusic();});
let prefs={};
try{prefs=JSON.parse(localStorage.getItem(PREF)||'{}');fast=!!prefs?.fast;if(typeof prefs?.sound==='boolean')sound=prefs.sound;if(typeof prefs?.volume==='number'&&Number.isFinite(prefs.volume))volume=Math.max(0,Math.min(1,prefs.volume));}catch{}
music.volume=volume;
reduceMotion=prefs?.reduceMotion===true;
tutorialDone=prefs?.tutorialDone===true;
try {
  const raw=localStorage.getItem(KEY);
  if(raw){state=readModeSave(raw,KEY,adminMode);hasSavedGame=true;}
}catch{
  try{const backup=JSON.parse(localStorage.getItem(KEY+'-backup')||'null');if(G.validateSave(backup)){state=G.migrateSave(backup);hasSavedGame=true;pendingReloadNotice='已从上一份备份恢复进度。';}else{const raw=localStorage.getItem(KEY);if(raw)localStorage.setItem(KEY+'-unreadable',raw);pendingReloadNotice='旧存档无法读取，已保留原始数据，可以开始新生活。';}}
  catch{storageOK=false;pendingReloadNotice='浏览器禁止保存，退出前可以导出存档。';}
}
function colorCharacterNames(root=document.body){
  root.querySelectorAll('.character-name').forEach(el=>{if(!el.closest('.diary-log'))el.textContent=state.chars[el.classList.contains('name-xian')?0:1].name;});
  const names=['阿闲','阿忙','小满','小夏',...state.chars.map(c=>c.name)].sort((a,b)=>b.length-a.length),pattern=new RegExp('('+[...new Set(names)].map(n=>n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')','g');
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];
  while(walker.nextNode())if(names.some(n=>walker.currentNode.textContent.includes(n))&&!walker.currentNode.parentElement.closest('.character-name,script,style,textarea,title,input'))nodes.push(walker.currentNode);
  for(const node of nodes){
    const fragment=document.createDocumentFragment();
    for(const text of node.textContent.split(pattern)){
      if(names.includes(text)){const custom=state.chars.findIndex(c=>c.name===text),index=custom>=0?custom:['阿闲','小满'].includes(text)?0:1,name=document.createElement('em');name.className=`character-name ${index===0?'name-xian':'name-mang'}`;name.textContent=node.parentElement.closest('.diary-log')?text:state.chars[index].name;fragment.append(name);}
      else fragment.append(document.createTextNode(text));
    }
    node.replaceWith(fragment);
  }
}
function icons(){
  document.querySelectorAll('.top-dock .person,.actor>span,.bottom-dock .tabs button,#goals-button,#settings').forEach(el=>{
    if(el.querySelector('.panel-cue'))return;
    const cue=document.createElement('span');cue.className='panel-cue';cue.setAttribute('aria-hidden','true');cue.innerHTML=icon('chevron-right');el.append(cue);
  });
  window.lucide?.createIcons({attrs:{'aria-hidden':'true','stroke-width':1.8}});colorCharacterNames();
}
function toast(text){clearTimeout(toastTimer);$('toast').textContent=text;colorCharacterNames($('toast'));$('toast').classList.add('visible');toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3200);}
function save(backup=true){
  hasSavedGame=true;
  try {
    const previous=localStorage.getItem(KEY);
    const raw=JSON.stringify(state);
    let previousVersion;try{previousVersion=JSON.parse(previous)?.version;}catch{}
    if(backup&&previousVersion===1&&!localStorage.getItem(KEY+'-pre-v2'))localStorage.setItem(KEY+'-pre-v2',previous);
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
  $('menu-storage').textContent=adminMode?'管理员测试存档 · 与玩家进度分开保存':storageOK?'你的进度，只保存在这台设备的浏览器里。':'此浏览器无法保存，请在游戏设置里导出备份。';
}
function enterGame({newGame=false}={}){
  if(newGame){sound=true;volume=DEFAULT_VOLUME;music.volume=volume;tutorialDone=false;persistPrefs();}
  closeModal();menuOpen=false;$('main-menu').hidden=true;$('main-menu').inert=true;
  $('game-shell').hidden=false;$('game-shell').inert=false;tab=null;scene='home';contentPage=0;render();
  let previousVersion;try{previousVersion=JSON.parse(lastSavedRaw)?.version;}catch{}
  if(!newGame&&previousVersion===1)save();
  playMusic();
  $('run').focus({preventScroll:true});
  if(newGame)startTutorial();
}
function refreshMenuSave(){
  try{
    const raw=localStorage.getItem(KEY);
    if(raw){state=G.migrateSave(JSON.parse(raw));lastSavedRaw=raw;hasSavedGame=true;}
    else if(storageOK){hasSavedGame=false;lastSavedRaw=null;}
  }catch{}
  renderMenu();
}
function showMenu(){
  homeView?.stop();$('wardrobe-window')?.close();$('home-dialog').close();
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
  try{commit(adminMode?H.createAdminSave(G.fresh()):G.fresh(),{backup:false});enterGame({newGame:true});}catch(e){toast(e.message);}
}
function commit(next,{backup=true}={}){
  if(!G.validateSave(next))throw Error('存档状态异常，本次改动没有保存。');
  let latest;
  try{latest=localStorage.getItem(KEY);}catch{storageOK=false;}
  if(latest&&latest!==lastSavedRaw){
    try{state=G.migrateSave(JSON.parse(latest));lastSavedRaw=latest;render();}catch{}
    throw Error('另一个页面更新了进度，已经同步，请重新安排。');
  }
  homeView?.stop();state=next;save(backup);render();
}
function perform(fn){try{commit(fn());return true;}catch(e){toast(e.message);return false;}}
function openModal(title,html,eyebrow='',kind='') {
  homeView?.stop();
  if($('modal').open)$('modal').close();
  modalKind=kind;const legacy=['free-time','sunday','preset','course','draw','event','reward','report','tutorial','buy','import','ad'].includes(kind);$('modal').classList.toggle('legacy-window',legacy);$('modal').classList.toggle('has-close-marker',['course','event','reward','buy','import'].includes(kind));$('modal').dataset.art=legacy||['settings','goals','xian','mang','new-game','shift'].includes(kind)?kind:'';
  $('modal').classList.toggle('symbol-window',['goals','shift','free-time','course','sunday','draw','preset','event','reward'].includes(kind));
  $('modal-title').textContent=title;$('modal-eyebrow').textContent=eyebrow;$('modal-body').innerHTML=html;
  $('modal-tools').replaceChildren();const tools=$('modal-body').querySelector('.goal-nav,.settings-nav,.shift-tools,.tutorial-tools');if(tools)$('modal-tools').append(tools);$('modal-tools').hidden=!tools;
  $('modal').showModal();icons();paginateModal();
}
function pager(page,total,attribute){
  return `<button class="icon-button" ${attribute}="${page-1}" ${page===0?'disabled':''} title="上一页" aria-label="上一页">${icon('chevron-left')}</button><span>${page+1} / ${total}</span><button class="icon-button" ${attribute}="${page+1}" ${page===total-1?'disabled':''} title="下一页" aria-label="下一页">${icon('chevron-right')}</button>`;
}
function contentPager(items){
  const total=Math.max(1,Math.ceil(items.length/(tab==='diary'?2:tab==='home'?4:3)));contentPage=Math.min(contentPage,total-1);
  return `<nav class="pager" aria-label="列表分页">${pager(contentPage,total,'data-content-page')}</nav>`;
}
function viewMemory(id){
  homeView?.stop();
  const memory=MEMORIES[id];if(!memory||!state.memories.includes(id))return;
  $('memory-title').textContent=memory.name;$('memory-caption').textContent=memory.caption;
  $('memory-image').src=`assets/memories/${id}-v1.webp`;$('memory-image').alt=memory.alt;
  $('memory-viewer').showModal();icons();
}
function paginateModal(){
  $('modal').style.height='';
  const body=$('modal-body');
  if(['xian','mang','tutorial'].includes($('modal').dataset.art)){modalPages=[[...body.children]];modalPage=0;$('modal-pager').hidden=true;return;}
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
  openModal('新手教程',`<div class="tutorial-card"><h3>${t.title}</h3><figure class="tutorial-picture"><img src="assets/${t.route==='goals'?'tutorial/step-5-weekly':t.visual?'home/room-living':'tutorial/step-'+(tutorialStep+1)}.webp" alt="${escape(t.alt)}" decoding="async"></figure><p>${t.text}</p><p class="tutorial-hint">${t.hint}</p><button class="text-button tutorial-look" data-tutorial-look="${t.route}">${icon('mouse-pointer-2')}去看看${t.look}${icon('chevron-right')}</button></div><div class="tutorial-tools"><nav class="tutorial-steps" aria-label="教程进度">${TUTORIAL.map((_,i)=>`<span class="${i===tutorialStep?'current':''}" ${i===tutorialStep?'aria-current="step"':''}>${i+1}</span>`).join('')}</nav><div class="tutorial-actions"><button class="text-button" data-tutorial-back ${tutorialStep===0?'disabled':''}>上一步</button><button class="primary-button" data-tutorial-next>${tutorialStep===TUTORIAL.length-1?'开始生活':'下一步'}</button><button class="text-button" data-tutorial-skip>跳过</button></div></div>`,`第 ${tutorialStep+1} / ${TUTORIAL.length} 步`,'tutorial');
if(t.visual){const picture=$('modal-body').querySelector('.tutorial-picture');picture.classList.add('tutorial-new-picture');picture.innerHTML=t.visual==='home'?`<img src="assets/home/room-living.webp" alt="${escape(t.alt)}"><img class="tutorial-sofa" src="assets/home/sofa.webp" alt="沙发"><span class="tutorial-drag">${icon('move')}<b>拖到绿色落点</b></span><span class="tutorial-room-path">卧室 ← 客厅 → 厨房 → 书房 → 阳台</span>`:`<div class="tutorial-parts">${[['top','上衣'],['bottom','下装'],['accessory','配饰']].map(([part,name])=>`<div><img src="assets/home/cat-${part}-${part==='accessory'?1:0}.webp" alt="${name}"><b>${name}</b></div>`).join('')}</div>`;icons();}
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
  const atHome=scene==='home';$('scene').classList.toggle('home-mode',atHome);
  if(atHome&&!menuOpen)ensureHome();
  homeView?.update({visible:atHome&&!menuOpen,editing:decorating!==null,selected:decorating});
  $('scene').classList.toggle('weekend',state.day===7);
  $('scene').classList.toggle('town',scene==='town');$('scene-bg').src=`assets/${scene==='town'?'town':'apartment'}.webp`;
  $('scene-bg').alt=scene==='town'?'小店、共享办公室和街边的小摊':'阳光照进两个人的合租房';
  document.querySelectorAll('[data-scene]').forEach(b=>{b.classList.toggle('active',b.dataset.scene===scene);b.setAttribute('aria-pressed',b.dataset.scene===scene);});
  $('props').replaceChildren();
  if(!atHome)for(let i=0;i<2;i++){const img=$(i?'actor-b':'actor-a');paintOutfit(img,i?'fox':'cat','stand',state.chars[i].clothes).catch(e=>toast(e.message));img.alt=state.chars[i].name;}
  document.querySelectorAll('#scene>.actor').forEach((el,i)=>{el.setAttribute('aria-label',state.chars[i].name+'的档案');el.title=state.chars[i].name+'的档案';});
}
function ensureHome(){
  if(homeView||homeLoading)return;
  homeLoading=import('./home-view.js?v=1.0.3-staticgrab31').then(m=>m.createHomeView({getState:()=>state,commitMove:(id,p)=>perform(()=>G.moveHomeFurniture(state,id,p)),commitActor:(index,p)=>perform(()=>H.moveHomeActor(state,index,p)),onSelect:id=>{decorating=id;renderDecorator();},onRoom:room=>switchHomeRoom(room),icons,notice:toast,isActive:()=>!menuOpen&&!busy&&tab===null&&!$('modal').open&&!$('memory-viewer').open&&!$('wardrobe-window').open&&!$('home-dialog').open,isReduced:()=>reduceMotion||matchMedia('(prefers-reduced-motion: reduce)').matches})).then(view=>{homeView=view;homeLoading=null;renderScene();icons();}).catch(e=>{homeLoading=null;toast(e.message);});
}
function switchHomeRoom(room){
  if(!state.home.unlocked.includes(room)){const r=G.roomProgress(state).find(r=>r.id===room);toast(`${r.name}尚未开放 · ${r.key==='shifts'?'上班':r.key==='courses'?'短训':'平衡周'} ${r.value}/${r.target}${r.previous?'':' · 先开放前一间'}`);return;}
  if(perform(()=>G.setRoom(state,room))){homeFocus=room;scene='home';render();}
}
function homeContent(){
  const rooms=G.roomProgress(state),focus=rooms.find(r=>r.id===homeFocus)||rooms[0];
  const appliances=['tv','radio','record','fridge','washer','microwave','oven','kettle','toaster','coffee','sewing','computer','printer','exercise'];
  const items=G.FURNITURE.filter(f=>H.itemOf(f.id).room===homeFocus&&(homeFilter==='owned'?state.furniture.includes(f.id):homeFilter==='appliances'?appliances.includes(f.id):homeFilter==='furniture'?!appliances.includes(f.id):true)),navigation=contentPager(items);
  const goal=focus.earned?'已开放':`${focus.key==='shifts'?'上班':focus.key==='courses'?'短训':'平衡周'} ${focus.value}/${focus.target}${!focus.previous?' · 先开放前一间':''}`;
return `<div class="section-heading"><h3>小家</h3></div><div class="home-content-body"><nav class="home-room-list" aria-label="房间">${rooms.map(r=>`<button data-home-focus="${r.id}" class="${r.id===homeFocus?'selected':''}" title="${r.name} ${r.earned?'已开放':r.value+'/'+r.target}">${icon(r.icon)}<span>${r.name}</span></button>`).join('')}</nav><nav class="home-shop-tools" aria-label="家具分类">${[['furniture','家具'],['appliances','家电'],['owned','已拥有']].map(([id,name])=>`<button data-home-filter="${id}" aria-pressed="${homeFilter===id}">${name}</button>`).join('')}<button class="icon-button" data-room-info="${homeFocus}" title="房间地图" aria-label="房间地图">${icon('house')}</button></nav><small class="home-room-progress">${goal}</small><div class="home-catalog">${items.slice(contentPage*4,contentPage*4+4).map(f=>{const owned=state.furniture.includes(f.id),p=state.home.positions[f.id];return `<article class="home-catalog-item"><img src="assets/home/${H.itemOf(f.id).asset}.webp" alt="${f.name}" loading="lazy"><b>${f.name}</b><small>${owned?(H.ROOMS.find(r=>r.id===p.room)?.name||'收纳中'):f.cost+' 生活币'}</small><button class="text-button" ${owned?'data-arrange':'data-buy'}="${f.id}" ${busy||(!owned&&(state.day===7||state.cash<f.cost))?'disabled':''}>${icon(owned?'move':'shopping-bag')}<span>${owned?'摆放':'添置'}</span></button></article>`;}).join('')||'<p class="empty-state">这一格，留给下一件喜欢的物品。</p>'}</div></div>${navigation}<button class="home-gold-button home-decor-entry" data-home-decorate>${icon('move')}进入布置</button>`;
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
    $('content').innerHTML=homeContent();
  }
  if(tab==='jobs') {
    const days=[0,1,2,3,4,5],navigation=contentPager(days);
    $('content').innerHTML=`<div class="section-heading"><h3>抢班课表</h3><span>一天一人一个班</span></div><div class="shift-toolbar"><button class="text-button" data-draw ${busy||state.day>=6||state.drawUsed?'disabled':''}>${icon('package-open')}${state.drawWeek===state.week?'我的盲盒':'抽岗位盲盒'}</button><button class="text-button" data-course>${icon('book-open')}一周短训</button></div><div class="shift-list">${days.slice(contentPage*3,contentPage*3+3).map(d=>{const j=G.jobDetail(state,d),worker=state.chars[state.plan[d].indexOf('work')];return `<button class="shift-row" data-shift="${d}" ${busy||d<state.day?'disabled':''} title="${j.place} · ${state.shiftSources?.[d]==='draw'?'盲盒分配':state.shiftSources?.[d]==='claim'?'已抢到':'原班可保留'}"><span class="shift-date">${G.DAYS[d]}<small>${escape(worker.name)}</small></span>${glyph(j.icon,true)}<span class="shift-copy"><b>${j.name}</b><small>${j.place}</small></span><span class="shift-wage">${j.wage}<small>币/班</small></span>${icon(d<state.day?'check':'chevron-right')}</button>`;}).join('')}</div><p class="shift-note">进修一下，就能试试新岗位</p>${navigation}`;
  }
  if(tab==='diary') {
    const items=photoView?state.memories:state.log,navigation=contentPager(items),visible=items.slice(contentPage*2,contentPage*2+2);
    $('content').innerHTML=`<div class="section-heading"><h3>${photoView?'生活照片':'生活日记'}</h3><button class="text-button photo-toggle" data-photo-view title="${photoView?'查看日记':'查看照片'}" aria-label="${photoView?'查看日记':'查看照片'}">${icon(photoView?'notebook-pen':'images')}<span>${photoView?'日记':'照片'}</span></button></div>${photoView?`<div class="memory-strip">${visible.length?visible.map(id=>`<button class="memory" data-memory="${id}" title="查看${MEMORIES[id].name}大图" aria-label="查看${MEMORIES[id].name}大图"><img src="assets/memories/${id}-v1.webp" width="960" height="640" alt="${MEMORIES[id].alt}" decoding="async"><span>${MEMORIES[id].name}</span></button>`).join(''):'<p class="empty-state">过好今天，慢慢收集生活照片。</p>'}</div>`:`<ul class="diary-log">${visible.length?visible.map(l=>`<li><span class="diary-date">第${l.week}周 · ${G.DAYS[Math.min(l.day,6)]}</span><span>${escape(l.text)}</span></li>`).join(''):`<li class="empty-state"><span>日记的第一页，留给今天。</span></li>`}</ul>`}<div class="diary-actions"><button class="text-button diary-goals" data-goals>${icon('flag')}目标与奖励</button>${state.reports.length?`<button class="text-button report-button" data-last-report>${icon('receipt-text')}上周账本</button>`:''}</div>${navigation}`;
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
  $('game-shell').classList.toggle('admin-mode',adminMode);
  if(tab!==null||busy||menuOpen)homeView?.stop();
  document.querySelectorAll('.schedule-labels .label-a,.schedule-labels .label-b').forEach((el,i)=>{el.innerHTML=`<img src="assets/ui-v10/portrait-${i?'fox':'cat'}.webp" alt="">`;el.append(document.createTextNode(state.chars[i].name));});
  $('cash').textContent=state.cash>=100000000?`${(state.cash/100000000).toFixed(1).replace(/\.0$/,'')}亿`:state.cash>=10000?`${(state.cash/10000).toFixed(1).replace(/\.0$/,'')}万`:state.cash;$('wallet').title=`生活账户：${state.cash}币`;$('wallet')?.classList.toggle('low',state.cash<100);
  const chapter=G.chapterProgress(state);
  $('goals-button').innerHTML=`${icon(chapter?.done?'gift':'flag')}<span>${chapter?.done?'可领奖':'目标'}</span>`;
  renderSound();renderPeople();renderSchedule();renderScene();renderContent();renderTutorialResume();if(decorating)renderDecorator();icons();
}
function alignProfileActions() {
  const card=$('modal-body').querySelector('.profile-card'),axis=$('profile-title-axis');
  if(!$('modal').open||!card||!axis)return;
  const title=axis.getBoundingClientRect(),body=card.getBoundingClientRect(),frame=$('modal').getBoundingClientRect();
  card.style.setProperty('--profile-axis-offset',`${title.x+title.width/2-body.x-body.width/2}px`);
  card.style.setProperty('--profile-axis-room',`${Math.min(title.x+title.width/2-frame.left,frame.right-title.x-title.width/2)-12}px`);
}
function personModal(i) {
  homeView?.selectPerson(i);
  const c=state.chars[i];
  openModal(`${c.name}的档案`,`<div class="profile-card"><img class="profile-portrait" src="assets/ui-v12/portrait-${i?'mang':'xian'}.webp" alt="${escape(c.name)}"><p class="profile-quote">${i?'“有班上，也想把生活过好。”':'“不上班的日子，也不是在浪费。”'}</p><div class="profile-status">${[['精力',c.energy,'zap'],['心情',c.mood,'smile']].map(([name,value,symbol])=>`<div class="profile-stat">${icon(symbol)}<span>${name}</span><b>${value}</b><progress value="${value}" max="100" aria-label="${name}"></progress></div>`).join('')}</div><div class="profile-skills">${c.xp.map((v,k)=>{const p=G.progress(v);return `<div class="skill-row"><div class="skill-label"><b>${k?'创作':'事务'}技能</b><span>Lv.${p.level}</span></div><progress value="${p.percent}" max="100" aria-label="${k?'创作':'事务'}技能进度"></progress><small>${p.level===3?'已熟练':`${p.current} / ${p.need}`}</small></div>`;}).join('')}</div><div class="profile-ledger"><span>本周出勤 <b>${state.ledger.shifts[i]}天</b></span><span>本周工资 <b>${state.ledger.salary[i]}币</b></span></div></div>`,'每个人，都有自己的成长',i?'mang':'xian');
  $('modal-body').querySelector('.profile-card').insertAdjacentHTML('beforeend',`<div class="profile-actions"><button data-open-wardrobe="${i}">${icon('shirt')}<span>衣橱</span></button><button data-rename-person="${i}">${icon('pencil')}<span>改名</span></button></div>`);
  $('modal-title').innerHTML=`${escape(c.name)}<span id="profile-title-axis">的</span>档案`;
  paintOutfit($('modal-body').querySelector('.profile-portrait'),i?'fox':'cat','stand',c.clothes).catch(e=>toast(e.message));icons();alignProfileActions();
  document.fonts.ready.then(alignProfileActions);
}
function wardrobeModal(index=0){
  if(busy)return;stopDecorating();homeView?.stop();closeModal();$('home-dialog').close();
  wardrobePerson=index;wardrobePart='top';wardrobePose='stand';wardrobeDraft={...state.chars[index].clothes};
  wardrobePage=Math.floor(wardrobeDraft.top/6);
  renderWardrobe();$('wardrobe-window').showModal();
}
function renderWardrobe(){
  const who=wardrobePerson?'fox':'cat',c=state.chars[wardrobePerson];
  navigator.serviceWorker?.controller?.postMessage({type:'warm-home',files:Object.keys(G.CLOTHES).flatMap(part=>G.CLOTHES[part].map((_,i)=>`assets/home/${who}-${part}-${i}.webp`).filter((_,i)=>wardrobePerson!==0||part!=='accessory'||i!==0))});
  $('wardrobe-title').textContent=c.name+'的衣橱';
  $('wardrobe-people').innerHTML=state.chars.map((person,i)=>`<button data-wardrobe-person="${i}" class="${i===wardrobePerson?'selected':''} name-${i?'mang':'xian'}">${escape(person.name)}</button>`).join('');
  $('wardrobe-parts').innerHTML=[['top','shirt','上衣'],['bottom','columns-2','下装'],['accessory','glasses','配饰']].map(([part,symbol,name])=>`<button data-wardrobe-part="${part}" aria-pressed="${part===wardrobePart}">${icon(symbol)}<span>${name}</span></button>`).join('');
  $('wardrobe-outfit').textContent=Object.keys(G.CLOTHES).map(part=>wardrobePerson===0&&part==='accessory'&&wardrobeDraft[part]===0?'不加配饰':G.CLOTHES[part][wardrobeDraft[part]][0]).join(' / ');
  const pages=Math.ceil(G.CLOTHES[wardrobePart].length/6);wardrobePage=Math.max(0,Math.min(pages-1,wardrobePage));
  $('wardrobe-clothes').innerHTML=G.CLOTHES[wardrobePart].slice(wardrobePage*6,wardrobePage*6+6).map(([name,symbol,count,target],offset)=>{
    const i=wardrobePage*6+offset;
    const noAccessory=wardrobePerson===0&&wardrobePart==='accessory'&&i===0;if(noAccessory)name='不加配饰';
    const unlocked=G.garmentUnlocked(c,wardrobePart,i),selected=wardrobeDraft[wardrobePart]===i;
    return `<button class="wardrobe-garment ${selected?'selected':''} ${unlocked?'':'locked'}" data-garment="${i}" ${unlocked?'':'disabled'} aria-pressed="${selected}">${noAccessory?`<span class="wardrobe-empty-accessory">${icon('circle-slash')}</span>`:`<img src="assets/home/${who}-${wardrobePart}-${i}.webp" alt="${name}">`}<b>${name}</b><small>${unlocked?'已拥有':`${G.COUNT_LABELS[count]} ${target}次`}</small><small>${unlocked?(selected?'已选':''):c.counts[count]+' / '+target}</small><span class="garment-mark">${selected||!unlocked?icon(selected?'check':'lock-keyhole'):''}</span></button>`;
  }).join('');
  $('wardrobe-pages').innerHTML=`<button data-wardrobe-page="-1" title="上一页" aria-label="上一页" ${wardrobePage===0?'disabled':''}>${icon('chevron-left')}</button><span aria-live="polite">${wardrobePage+1} / ${pages}</span><button data-wardrobe-page="1" title="下一页" aria-label="下一页" ${wardrobePage===pages-1?'disabled':''}>${icon('chevron-right')}</button>`;
  $('wardrobe-history').textContent=state.home.legacyStats?`旧档统计：上班取保留的周报，休息、短训与出游从第${state.home.fromWeek}周可确证记录累计。`:'';
  document.querySelectorAll('[data-wardrobe-pose]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.wardrobePose===wardrobePose)));
  paintOutfit($('wardrobe-preview'),who,wardrobePose,wardrobeDraft).catch(e=>toast(e.message));icons();
}
function renameModal(index){
  const c=state.chars[index];
  openModal('给室友起个名字',`<form id="rename-form"><label for="character-name">${escape(c.name)}的新名字</label><input id="character-name" name="name" value="${escape(c.name)}" maxlength="120" autocomplete="off" required><p>1–6个可见字符</p><button class="primary-button" type="submit">${icon('check')}确认</button></form>`,'蓝色与暖色跟随角色身份','rename');
  $('rename-form').onsubmit=event=>{event.preventDefault();if(perform(()=>G.renameCharacter(state,index,new FormData(event.currentTarget).get('name')))){personModal(index);}};
}
function shiftModal(d){
  if(d<state.day||d>5||busy)return;
  const worker=state.plan[d].indexOf('work'),c=state.chars[worker],current=G.jobDetail(state,d);
  openModal(`${G.DAYS[d]} · ${c.name}上什么班`,
    `<div class="shift-tools"><div class="shift-summary"><small>今天已排</small><b>${current.name} · ${current.wage}币</b><p>${current.place}：${current.task}</p></div><div class="shift-shortcuts"><button class="text-button swap-button" data-shift-swap="${d}">${icon('arrow-left-right')}换成${escape(state.chars[1-worker].name)}上班</button><button class="text-button" data-course>${icon('book-open')}短期进修</button></div></div>`+
    G.shiftOffers(state,d).map(job=>{
      const qualified=G.qualifies(c,job),selected=current.id===job.id,detail=G.JOB_DETAILS[job.id];
      return `<button class="action-option symbol-option ${selected?'active':''}" data-claim-day="${d}" data-claim-job="${job.id}" ${!qualified||selected?'disabled':''}>${glyph(job.icon,true)}<span class="symbol-copy"><b>${job.name}</b><small>${detail.place} · ${job.level?`${job.skill?'创作':'事务'}${job.level}级`:'无需技能'}</small><span class="symbol-effects">${stat('coins',`${job.wage}/班`,'工资')}<span class="symbol-state">${selected?'已排':qualified?'可抢班':'待进修'}</span></span></span><span class="symbol-status" aria-label="${selected?'已排':qualified?'可进入':'未达资格'}">${icon(selected?'check':qualified?'chevron-right':'lock-keyhole')}</span></button>`;
    }).join(''),
    '按日期抢班，空档留给自己','shift');
}
function drawModal(){
  if(state.drawWeek!==state.week&&!perform(()=>G.draw(state)))return;
  const job=G.JOBS.find(j=>j.id===state.drawJob);if(!job)return;
  openModal('盲盒里的新班',`<div class="draw-reveal">${heading(job.icon,job.name,true)}<p>${G.JOB_DETAILS[job.id].place} · ${job.wage}币/班</p><small>${job.line}</small></div><p class="modal-caption">选一天，安排${job.name}。每周免费抽一次，选定前仍可保留原班。</p>`+Array.from({length:6},(_,d)=>{
    const c=state.chars[state.plan[d].indexOf('work')],ok=G.qualifies(c,job);
    return `<button class="action-option" data-draw-day="${d}" ${d<state.day||!ok||state.drawUsed?'disabled':''}><span><b>${G.DAYS[d]} · ${escape(c.name)}</b><small>${d<state.day?'这一天已完成':!ok?`${job.skill?'创作':'事务'}${job.level}级后可上岗`:state.drawUsed?'本周盲盒已经分配':'将原班换成这个岗位'}</small></span>${icon('calendar-check')}</button>`;
  }).join(''),'先看看，再决定哪天上','draw');
}
function courseModal(){
  openModal('学会，就能上岗',[0,1].map(skill=>`<section class="symbol-course">${heading(skill?'pencil-ruler':'book-open',`${skill?'创作':'事务'}短训`)}<div class="symbol-course-nodes" aria-label="三节课，每节40币、经验加3">${[1,2,3].map(n=>`<span class="symbol-course-node"><b>${n}</b><span>第${n}课</span><small>40币 · +3经验</small></span>`).join('')}</div><p class="symbol-course-outcome">从零到2级 · 可尝试${skill?'活动、图文':'登记、归档、排版'}</p><div class="symbol-learners">${state.chars.map(c=>`<div><span>${escape(c.name)} · ${c.xp[skill]}经验 · Lv.${G.level(c.xp[skill])}</span><progress value="${Math.min(c.xp[skill],9)}" max="9" aria-label="${escape(c.name)}${skill?'创作':'事务'}技能距离2级的经验"></progress></div>`).join('')}</div><button class="text-button symbol-command" data-plan-course="${skill}" ${state.day>=6?'disabled':''}>安排${skill?'创作':'事务'}课${icon('chevron-right')}</button></section>`).join('')+`<p class="option-note">安排两人的剩余空档，每人交替上班时最多三节。只排课，不预扣学费；经验也能从上班与小事获得。</p>`,'白天轮流上班，空档各学一点','course');
}
function startDecorating(id){
  if(busy)return;
  if(id&&state.home.positions[id]?.room!==state.home.room&&!bringFurniture(id))return;
  id=id||state.furniture.find(id=>state.home.positions[id].room===state.home.room)||state.furniture[0];
  if(!id){tab='home';homeFilter='all';contentPage=0;render();return;}
  closeModal();tab=null;scene='home';decorating=id;
  $('game-shell').classList.add('decoration-mode');render();renderDecorator();
}
function bringFurniture(id){
  const p=H.findSlot(id,state.home.room,state.home.positions);
  if(!p){toast('这个房间暂时没有空位，先收纳一件家具。');return false;}
  return perform(()=>G.moveHomeFurniture(state,id,p));
}
function renderDecorator(){
  const box=$('decorator');box.hidden=!decorating;if(!decorating){box.innerHTML='';return;}
  const f=G.FURNITURE.find(f=>f.id===decorating),p=state.home.positions[f.id];
  box.innerHTML=`<div class="home-edit-title"><img src="assets/home/${H.itemOf(f.id).asset}.webp" alt=""><label class="decor-furniture-label"><select id="decor-furniture" aria-label="选择家具">${state.furniture.map(id=>`<option value="${id}" ${id===decorating?'selected':''}>${G.FURNITURE.find(f=>f.id===id).name}${state.home.positions[id].room?'':' · 收纳'}</option>`).join('')}</select>${icon('chevron-down')}</label><span class="decor-room-name">${icon('house')}<span>${H.ROOMS.find(r=>r.id===state.home.room).name}</span></span><button class="decor-done" data-decor-done>${icon('check')}<span>完成</span></button></div><div class="home-edit-tools">${[['left','arrow-left','向左'],['up','arrow-up','向后'],['down','arrow-down','向前'],['right','arrow-right','向右']].map(([dir,symbol,name])=>`<button class="icon-button decor-direction" data-home-nudge="${dir}" title="${name}" aria-label="${name}" ${p.room===state.home.room?'':'disabled'}>${icon(symbol)}</button>`).join('')}<button class="icon-button decor-storage" data-home-bring title="搬入房间" aria-label="搬入房间" ${p.room===state.home.room?'disabled':''}>${icon('package-open')}</button><button class="icon-button decor-storage" data-home-store title="收纳" aria-label="收纳" ${p.room===null?'disabled':''}>${icon('archive')}</button></div>`;icons();
}
function stopDecorating(){
  homeView?.stop();
  decorating=null;$('game-shell').classList.remove('decoration-mode');renderDecorator();
}
function scheduleModal(d,i) {
  if(busy||d<state.day)return;
  const worker=state.plan[d].indexOf('work'),free=1-worker,c=state.chars[free];
  const notes={rest:'免费',admin:'事务技能',creative:'创作技能',second:`成本30 / 回款80 · 本周 ${state.second}/2单`,prep:`创作1级 · 库存 ${state.inventory}/1批`,sell:`创作1级 · ${state.inventory?'已有库存':'先备货再摆摊'}`};
  openModal(`${G.DAYS[d]} · ${c.name}空档`,`<button class="text-button swap-button" data-swap="${d}" data-worker="${free}">${icon('arrow-left-right')}<span>换班：让${escape(c.name)}上班，${escape(state.chars[worker].name)}空闲</span></button><div class="action-options">${Object.entries(G.ACTIONS).filter(([k])=>k!=='work').map(([k,a])=>`<button class="action-option symbol-option ${state.plan[d][free]===k?'active':''}" data-action="${k}" data-action-day="${d}" data-action-person="${free}">${glyph(a.icon)}<span class="symbol-copy"><b>${a.name}</b><small>${notes[k]}</small>${actionEffects(k)}</span><span class="symbol-status">${icon(state.plan[d][free]===k?'check':'chevron-right')}</span></button>`).join('')}</div>`,'一天一个行动，工资先到账','free-time');
}
function sundayModal(){
  if(state.day>6||busy)return;
  const options=[['walk','footprints','一起散步',40,12,0],['home','house','在家慢慢过',50,8,0],['picnic','sandwich','带便当去野餐',40,20,60]];
  openModal('周日，一起放假',`<div class="action-options">${options.map(([id,ic,name,energy,mood,cost])=>`<button class="action-option symbol-option ${state.sunday===id?'active':''}" data-sunday-choice="${id}">${glyph(ic)}<span class="symbol-copy"><b>${name}</b><small>两人一起 · ${cost?`${cost}币`:'免费'}</small><span class="symbol-effects">${stat('zap',`+${energy}`,'两人精力')}${stat('smile',`+${mood}`,'两人心情')}</span></span><span class="symbol-status">${icon(state.sunday===id?'check':'chevron-right')}</span></button>`).join('')}</div>`,'不用打卡的一天','sunday');
}
function objectiveRows(rows,{symbols=true}={}){return rows.map(r=>`<div class="symbol-objective ${r.done?'complete':''}" data-value="${r.value}" data-target="${r.target}"><span class="symbol-objective-label">${symbols?icon(REQUIREMENT_SYMBOLS[r.key]||'circle'):''}<span>${escape(r.label)}</span></span><b>${r.value} / ${r.target}</b>${r.target<=7?`<span class="symbol-segments" role="progressbar" aria-label="${escape(r.label)}" aria-valuenow="${Math.min(r.value,r.target)}" aria-valuemin="0" aria-valuemax="${r.target}">${Array.from({length:r.target},(_,i)=>`<i class="${i<r.value?'filled':''}"></i>`).join('')}</span>`:`<progress value="${Math.min(r.value,r.target)}" max="${r.target}" aria-label="${escape(r.label)}"></progress>`}</div>`).join('');}
function wishRows(g){
  const rows=g.id==='first'?[...state.chars.map((c,i)=>({key:'shifts',label:`${c.name}上班`,value:state.ledger.shifts[i],target:3,done:state.ledger.shifts[i]===3})),{key:'sunday',label:'周日一起散步',value:state.day===7&&state.sunday==='walk'?1:0,target:1}]:g.id==='learn'?[{key:'courses',label:'本周进修',value:state.ledger.courses,target:2}]:g.id==='side'?[{key:'side',label:'副业毛收入',value:state.ledger.side,target:140}]:[{key:'furniture',label:'拥有家具',value:state.furniture.length,target:1}];
  if(['first','home'].includes(g.id))rows.push(...state.chars.map(c=>({key:'mood',label:`${c.name}心情`,value:c.mood,target:50})));
  return objectiveRows(rows.map(r=>({...r,done:r.done??r.value>=r.target})));
}
function goalsModal(view='journey'){
  if(view!=='requests')view='journey';
  const j=G.journeyOf(state),g=G.goalFor(state),c=G.chapterProgress(state),r=G.requestProgress(state);
  let body=`<nav class="goal-nav" aria-label="目标分类">${[['journey','每周计划'],['requests','街坊委托']].map(([id,title])=>`<button class="text-button ${view===id?'selected':''}" data-goal-view="${id}">${title}</button>`).join('')}</nav>`;
  if(view==='requests'){
    if(r)body+=`<section class="symbol-section"><small>本周已接委托 · ${r.paid?'已交付':'进行中'}</small>${heading(REQUEST_SYMBOLS[r.id],r.title)}<p>${r.story}</p>${objectiveRows(r.rows,{symbols:false})}<div class="symbol-reward-line">${reward(r.reward)}<span>${r.paid?'已到账':'完成自动到账'}</span></div></section><button class="text-button" data-goal-route="jobs">${icon('briefcase-business')}去找班与进修</button><button class="text-button" data-goal-route="plan">${icon('calendar-days')}去排班与安排副业</button>`;
    else body+=`<p class="option-note">每周自选一份，按已完成的行动计算进度，达标自动领奖。</p>`+G.REQUESTS.map(q=>{const p=G.requestProgress(state,q.id);return `<section class="symbol-section" data-request="${q.id}">${heading(REQUEST_SYMBOLS[q.id],q.title)}<p>${q.story}</p>${objectiveRows(p.rows,{symbols:false})}<div class="symbol-reward-line">${reward(q.reward)}<button class="text-button symbol-command" data-accept-request="${q.id}" ${p.locked||state.day>=6?'disabled':''}>${p.locked?`${icon('lock-keyhole')}前两章解锁`:state.day>=6?'下周可接':`接下委托${icon('chevron-right')}`}</button></div></section>`;}).join('');
  }else{
    body+=`<section class="symbol-section"><small>第 ${state.week} 周 · 本周心愿</small>${heading(WISH_SYMBOLS[g.id],g.title)}<p>${g.description}</p></section>${wishRows(g)}<div class="symbol-reward-line">${reward(80)}<span>${state.day===7?(state.reports.at(-1)?.wishReward===80?'已到账 · 照片已收藏':state.reports.at(-1)?.goalMet?'旧版已完成':'本周未完成'):'周日结算 · 完成后解锁生活照片'}</span></div>`;
    body+=`<section class="symbol-section"><small>生活印章 · ${j.claimed.length} / ${G.CHAPTERS.length}</small>${heading(CHAPTER_SYMBOLS[c?.id]||'sparkles',c?c.title:'我们的理想生活，达成了！')}<p>${c?c.story:'所有章节已完成。你们获得「小镇生活家」印章，可以继续接委托、换班与布置小家。'}</p>${c?`<div class="symbol-reward-line">${reward(c.reward)}<span>${c.stamp}</span></div>`:'<p>完整成长目标已通关</p>'}</section>`;
    if(c)body+=objectiveRows(c.rows)+`<button class="primary-button" data-claim-chapter ${c.done?'':'disabled'}>${icon('gift')}${c.done?'领取章节奖励':'完成以上目标即可领取'}</button>`;
    body+=`<div class="symbol-chapters" aria-label="四章成长路线">${G.CHAPTERS.map((q,i)=>`<div class="${j.claimed.includes(q.id)?'earned':i===j.claimed.length?'current':''}">${glyph(CHAPTER_SYMBOLS[q.id])}<span>${['站稳脚跟','新本事','小家','理想生活'][i]}</span><small>${j.claimed.includes(q.id)?'已完成':i===j.claimed.length?'进行中':'未解锁'}</small></div>`).join('')}</div><button class="text-button" data-goal-route="home">${icon('armchair')}去小家添置家具</button>`;
  }
  openModal('生活目标',body,'小步向前，也有大大的盼头','goals');
}
function wishModal(){goalsModal();}
function presetModal(){
  openModal('一周计划签',`<div class="action-options"><button class="action-option symbol-option" data-preset="rest">${glyph('coffee')}<span class="symbol-copy"><b>忙闲刚刚好</b><small>交替上班，空档好好休息。</small></span><span class="symbol-status">${icon('chevron-right')}</span></button><button class="action-option symbol-option" data-preset="learn">${glyph('book-open')}<span class="symbol-copy"><b>这周学点东西</b><small>优先给两人补事务课，其他空档休息。</small></span><span class="symbol-status">${icon('chevron-right')}</span></button><button class="action-option symbol-option" data-preset="side">${glyph('package')}<span class="symbol-copy"><b>攒一点生活钱</b><small>安排剩余二手订单，有条件再备货摆摊。</small></span><span class="symbol-status">${icon('chevron-right')}</span></button></div>`,'已完成的日程会保留','preset');
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
  const symbol=['clock','sun','folder-search','citrus'][G.EVENTS.indexOf(e)],effects={none:[],meeting:[['graduation-cap','+1','当班人事务经验'],['smile','−3','当班人心情']],sun:[['smile','+4','两人心情']],photo:[['coins','+20','生活币']],sort:[['graduation-cap','+1','当班人事务经验'],['zap','−3','当班人精力']],fruit:[['zap','+8','两人精力']]};
  openModal(e.title,`<section class="symbol-event">${glyph(symbol)}<p>${e.line}</p></section><div class="action-options">${e.options.map((o,i)=>`<button class="action-option symbol-event-option" data-event-choice="${i}"><span class="symbol-copy"><b>${o.name}</b><small>${o.hint}</small><span class="symbol-effects">${effects[o.type].map(args=>stat(...args)).join('')||'<span>照常过今天</span>'}</span></span><span class="symbol-status">${icon('chevron-right')}</span></button>`).join('')}</div>`,'今天有件小事','event');
}
function settingsModal(view='audio'){
  const nav=`<nav class="settings-nav" aria-label="设置分类">${[['audio','声音与节奏'],['save','存档与帮助']].map(([id,title])=>`<button class="text-button ${view===id?'selected':''}" data-settings-view="${id}">${title}</button>`).join('')}</nav>`;
  const body=view==='audio'?`<div class="settings-audio"><label class="toggle-row"><span>背景音乐</span><input id="sound-toggle" type="checkbox" ${sound?'checked':''}></label><label class="volume-control"><span>音量 <output id="volume-value" for="volume-slider">${Math.round(volume*100)}%</output></span><input id="volume-slider" type="range" min="0" max="100" step="1" value="${Math.round(volume*100)}" aria-label="游戏音量"></label><label class="toggle-row"><span>快速过一天</span><input id="fast-toggle" type="checkbox" ${fast?'checked':''}></label><div class="settings-shortcuts"><button class="text-button" data-tutorial-start>重看教程</button><button class="text-button" data-main-menu>返回主菜单</button></div></div>`:`<div class="settings-buttons"><button class="text-button" data-export>${icon('download')}导出存档</button><button class="text-button" data-import>${icon('upload')}导入存档</button><button class="text-button danger-button" data-reset>${icon('rotate-ccw')}重新开始</button></div><p class="option-note">${storageOK?'进度保存在此浏览器。':'此浏览器无法自动保存。'}换设备前可导出存档。</p><div class="ledger-row"><span>放松体验券</span><b>精力 +20</b></div><p class="option-note">每游戏周可用一次模拟广告；不播放商业广告，不产生真实收益。</p><button class="text-button" data-ad ${state.adWeek===state.week||state.day===7?'disabled':''}>${icon('clapperboard')}${state.adWeek===state.week?'本周已用':'体验模拟激励广告'}</button>`;
  openModal('生活设置',nav+body,'今天谁上班 · 1.0.3','settings');
  if(view==='audio'){$('modal-body').querySelector('.settings-shortcuts').insertAdjacentHTML('beforebegin',`<label class="toggle-row"><span>减少动态</span><input id="reduce-motion" type="checkbox" ${reduceMotion?'checked':''}></label>`);paginateModal();}
  $('modal-body').insertAdjacentHTML('beforeend',`<button class="admin-entry" data-admin-window>${icon('key-round')}<span>${adminMode?'管理员 · 返回玩家进度':'管理员入口'}</span>${icon('chevron-right')}</button>`);icons();paginateModal();
}
function homeDialog(title,html,kind){
  stopDecorating();homeView?.stop();closeModal();
  if($('home-dialog').open)$('home-dialog').close();
  $('home-dialog').dataset.kind=kind;$('home-dialog-title').textContent=title;$('home-dialog-body').innerHTML=html;
  $('home-dialog').showModal();icons();
}
function roomModal(focus=state.home.room){
  homeFocus=focus;const rooms=G.roomProgress(state),r=rooms.find(r=>r.id===focus)||rooms[0];
  const condition=r.key==='shifts'?'上班':r.key==='courses'?'短训':'平衡周';
  homeDialog('我们的小家',`<nav class="home-room-map" aria-label="相连的五个房间">${['bedroom','living','kitchen','study','balcony'].map(id=>{const entry=rooms.find(r=>r.id===id);return `<button data-room-preview="${id}" class="map-${id} ${id===focus?'selected':''}" aria-pressed="${id===focus}" aria-label="${entry.name}，${entry.earned?'已开放':conditionFor(entry)}，预览房间"><span class="map-room-content">${icon(entry.icon)}<b>${entry.name}</b><small>${entry.earned?'已开放':conditionFor(entry)}</small></span>${entry.earned?'':`<span class="room-lock">${icon('lock-keyhole')}</span>`}</button>`;}).join('')}</nav><figure class="room-map-preview"><img src="assets/home/room-${r.id}.webp" alt="${r.name}"><figcaption>${r.earned?r.name+' · 已开放':`${condition} ${r.value}/${r.target}${r.previous?'':' · 先开放前一间'}`}</figcaption></figure><button class="home-gold-button" data-close-home-dialog><span>收起地图</span></button>`,'rooms');
  function conditionFor(r){return `${r.key==='shifts'?'上班':r.key==='courses'?'短训':'平衡'}${r.value}/${r.target}${r.key==='balancedWeeks'?'周':''}`;}
  navigator.serviceWorker?.controller?.postMessage({type:'warm-home',files:[`assets/home/room-${r.id}.webp`]});
}
function adminModal(){
  homeDialog('管理员',`<span class="admin-paper-label">测试存档</span><p class="admin-caption">与玩家进度分开保存</p><div class="admin-availability">${[['armchair','家具'],['shirt','服饰'],['house','房间']].map(([symbol,name])=>`<div>${icon(symbol)}<b>${name}</b><span>全部可用</span></div>`).join('')}</div><button class="home-gold-button" data-enter-admin>${icon('key-round')}<span>${adminMode?'继续测试':'进入测试'}</span></button><button class="home-blue-button" data-leave-admin>${icon('arrow-left')}<span>返回玩家进度</span></button>`,'admin');
}
function changeSaveMode(test){
  if(busy)return;
  let candidate,raw;
  const nextKey=test?ADMIN_KEY:PLAYER_KEY;
  H.setAdminMode(test);
  try{raw=localStorage.getItem(nextKey);candidate=raw?readModeSave(raw,nextKey,test):test?H.createAdminSave(G.fresh()):G.fresh();if(raw)raw=localStorage.getItem(nextKey);}
  catch(error){H.setAdminMode(adminMode);toast('无法读取这份存档，当前进度保留。');return;}
  try{sessionStorage.setItem(ADMIN_SESSION,String(test));}catch{H.setAdminMode(adminMode);toast('浏览器无法保存测试模式，本次没有切换。');return;}
  homeView?.stop();$('wardrobe-window').close();$('home-dialog').close();closeModal();stopDecorating();
  adminMode=test;KEY=nextKey;PREF=test?ADMIN_KEY+'-preferences':PLAYER_PREF;state=candidate;lastSavedRaw=raw;hasSavedGame=Boolean(raw);
  let p={};try{p=JSON.parse(localStorage.getItem(PREF)||'{}');}catch{}
  sound=p.sound!==false;volume=typeof p.volume==='number'?Math.max(0,Math.min(1,p.volume)):DEFAULT_VOLUME;music.volume=volume;fast=Boolean(p.fast);reduceMotion=p.reduceMotion===true;tutorialDone=p.tutorialDone===true;tutorialStep=null;
  if(test&&!raw)save(false);
  tab=null;scene='home';homeFocus=state.home.room;homeFilter='all';contentPage=0;
  if(test||raw)enterGame();else showMenu();render();renderMenu();if(!test)toast('已返回玩家进度。');
}
function readModeSave(raw,key,test){
  const candidate=G.migrateSave(JSON.parse(raw));
  if(test&&!candidate.home.storageDefault){
    for(const p of Object.values(candidate.home.positions))p.room=null;
    candidate.home.storageDefault=1;
    if(!G.validateSave(candidate))throw Error('管理员存档无法升级。');
    const backup=key+'-before-storage-v10';
    if(!localStorage.getItem(backup))localStorage.setItem(backup,raw);
    localStorage.setItem(key,JSON.stringify(candidate));
  }
  return candidate;
}
function renderSound(){$('sound').innerHTML=icon(sound&&volume>0?'volume-2':'volume-x');$('sound').title=sound?'关闭声音':'开启声音';$('sound').setAttribute('aria-label',$('sound').title);$('sound').setAttribute('aria-pressed',String(sound));}
function playMusic(){if(sound&&volume>0&&!menuOpen&&!document.hidden)music.play().catch(()=>{});else music.pause();}
function setSound(value){sound=value;persistPrefs();renderSound();if($('sound-toggle'))$('sound-toggle').checked=sound;playMusic();icons();}
function persistPrefs(){try{localStorage.setItem(PREF,JSON.stringify({fast,sound,volume,tutorialDone,reduceMotion}));}catch{}}
function exportSave(){
  const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`今天谁上班_第${state.week}周存档.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);toast('存档已导出。');
}
async function runDay(){
  stopDecorating();homeView?.stop();
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
    const bonus=state.ledger.bonus-previous.ledger.bonus,request=G.requestProgress(state),c=G.chapterProgress(state);
    const levelUps=state.chars.flatMap((ch,i)=>ch.xp.map((xp,k)=>G.level(xp)>G.level(previous.chars[i].xp[k])?`${ch.name}的${k?'创作':'事务'}技能升到${G.level(xp)}级`:null)).filter(Boolean);
    openModal(`${G.DAYS[previousDay]} · 今日收获`,`<section class="symbol-section"><small>${workedJob.place}</small>${heading(workedJob.icon,`${workedJob.name}完成！`,true)}<p>${workedJob.task}</p><div class="symbol-effects">${stat('coins',`+${state.ledger.salary[worker]-previous.ledger.salary[worker]}`,'今日工资')}${bonus?stat('gift',`+${bonus}`,'额外奖励'):''}</div></section>${request?.paid&&!G.requestProgress(previous)?.paid?`<p class="milestone-note">${icon(REQUEST_SYMBOLS[request.id])}<span>街坊委托交付：${request.title}</span></p>`:''}${levelUps.map(text=>`<p class="milestone-note">${icon('graduation-cap')}<span>${escape(text)}，可以试试新岗位了。</span></p>`).join('')}${c?.done?`<button class="primary-button" data-goal-view="journey">${icon('gift')}成长奖励可以领取了</button>`:''}<button class="text-button" data-goal-view="journey">${icon('flag')}看看每周计划</button><button class="primary-button" data-close-reward>继续生活</button>`,'今天的小努力，也有回响','reward');
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
  if(b.hasAttribute('data-close-home-dialog')){$('home-dialog').close();return;}
  if(b.hasAttribute('data-admin-window')){adminModal();return;}
  if(b.id==='menu-admin'){changeSaveMode(true);return;}
  if(b.hasAttribute('data-enter-admin')){changeSaveMode(true);return;}
  if(b.hasAttribute('data-leave-admin')){changeSaveMode(false);return;}
  if(b.hasAttribute('data-room-preview')){roomModal(b.dataset.roomPreview);return;}
  if(b.hasAttribute('data-home-focus')){homeFocus=b.dataset.homeFocus;contentPage=0;renderContent();icons();return;}
  if(b.hasAttribute('data-home-filter')){homeFilter=b.dataset.homeFilter;contentPage=0;renderContent();icons();return;}
  if(b.hasAttribute('data-close-wardrobe')){$('wardrobe-window').close();return;}
  if(b.hasAttribute('data-open-wardrobe')){wardrobeModal(Number(b.dataset.openWardrobe)||0);return;}
  if(b.hasAttribute('data-wardrobe-person')){wardrobePerson=Number(b.dataset.wardrobePerson);wardrobeDraft={...state.chars[wardrobePerson].clothes};wardrobePage=Math.floor(wardrobeDraft[wardrobePart]/6);renderWardrobe();return;}
  if(b.hasAttribute('data-wardrobe-part')){wardrobePart=b.dataset.wardrobePart;wardrobePage=Math.floor(wardrobeDraft[wardrobePart]/6);renderWardrobe();return;}
  if(b.hasAttribute('data-wardrobe-page')){wardrobePage+=Number(b.dataset.wardrobePage);renderWardrobe();return;}
  if(b.hasAttribute('data-wardrobe-pose')){wardrobePose=b.dataset.wardrobePose;renderWardrobe();return;}
  if(b.hasAttribute('data-garment')){const index=Number(b.dataset.garment);if(G.garmentUnlocked(state.chars[wardrobePerson],wardrobePart,index)){wardrobeDraft[wardrobePart]=index;renderWardrobe();}return;}
  if(b.hasAttribute('data-confirm-outfit')){if(perform(()=>G.equipClothes(state,wardrobePerson,wardrobeDraft))){$('wardrobe-window').close();toast('新搭配已保存。');}return;}
  if(b.hasAttribute('data-rename-person')){renameModal(Number(b.dataset.renamePerson));return;}
  if(b.hasAttribute('data-home-decorate')){startDecorating();return;}
  if(b.hasAttribute('data-room-info')){roomModal(b.dataset.roomInfo);return;}
  if(b.hasAttribute('data-home-nudge')){const p={...state.home.positions[decorating]},dir=b.dataset.homeNudge;p.x+=dir==='left'?-.015:dir==='right'?.015:0;p.y+=dir==='up'?-.012:dir==='down'?.012:0;perform(()=>G.moveHomeFurniture(state,decorating,p));return;}
  if(b.hasAttribute('data-home-bring')){bringFurniture(decorating);return;}
  if(b.hasAttribute('data-home-store')){perform(()=>G.storeHomeFurniture(state,decorating));return;}
  if(b.id==='close-modal'){closeModal();return;}
  if(b.id==='close-memory'){$('memory-viewer').close();return;}
  if(b.hasAttribute('data-memory')){viewMemory(b.dataset.memory);return;}
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
  if(b.hasAttribute('data-tutorial-look')){closeModal();const route=b.dataset.tutorialLook;if(route==='goals')goalsModal();else if(route==='people')personModal(0);else if(route==='wardrobe')wardrobeModal(0);else{tab=route==='run'?null:route;contentPage=0;scene=route==='jobs'?'town':route==='home'?'home':scene;render();if(route==='run')$('run').focus({preventScroll:true});}return;}
  if(b.id==='goals-button'||b.hasAttribute('data-goals')){goalsModal();return;}
  if(b.hasAttribute('data-goal-view')){goalsModal(b.dataset.goalView);return;}
  if(b.hasAttribute('data-close-reward')){closeModal();return;}
  if(b.hasAttribute('data-accept-request')){if(perform(()=>G.acceptRequest(state,b.dataset.acceptRequest)))goalsModal('requests');return;}
  if(b.hasAttribute('data-claim-chapter')){const c=G.chapterProgress(state);if(perform(()=>G.claimChapter(state))){goalsModal('journey');toast(`获得「${c.stamp}」 · +${c.reward}币`);}return;}
  if(b.hasAttribute('data-goal-route')){closeModal();tab=b.dataset.goalRoute;contentPage=0;scene=tab==='home'?'home':tab==='jobs'?'town':scene;render();return;}
  if(b.hasAttribute('data-decor-done')){stopDecorating();render();return;}
  if(b.dataset.arrange){startDecorating(b.dataset.arrange);return;}
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
  if(b.dataset.buy){const f=G.FURNITURE.find(f=>f.id===b.dataset.buy);openModal(f.name,`<div class="report-hero"><img src="assets/home/${H.itemOf(f.id).asset}.webp" alt="${f.name}"><div><h3>${f.cost} 生活币</h3><p>${f.desc}</p><p class="hint-price">${f.benefit}</p></div></div><div class="modal-actions"><button class="primary-button" data-confirm-buy="${f.id}">${icon('shopping-bag')}搬回家</button></div>`,'给家添点新东西','buy');}
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
  if(event.target.id==='home-filter'){homeFilter=event.target.value;contentPage=0;renderContent();icons();}
  if(event.target.id==='decor-furniture'){decorating=event.target.value;render();}
  if(event.target.id==='reduce-motion'){reduceMotion=event.target.checked;persistPrefs();render();}
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
    const original=await file.text(),candidate=G.migrateSave(JSON.parse(original));
    openModal(`恢复到第${candidate.week}周？`,`<p class="modal-caption">生活账户 ${candidate.cash}币，当前${candidate.day===7?'周末结算':G.DAYS[candidate.day]}。恢复前会把当前进度导出。</p><button class="primary-button" id="confirm-import">${icon('upload')}恢复这份存档</button>`,'把生活接回来','import');
    $('confirm-import').addEventListener('click',()=>{try{if(JSON.parse(original).version===1)localStorage.setItem(KEY+'-import-before-v2',original);}catch{toast('无法保留原始存档，导入没有覆盖当前进度。');return;}exportSave();if(perform(()=>candidate)){closeModal();tab=null;scene='home';stopDecorating();render();toast('进度恢复好了。');}},{once:true});
  }catch(e){toast(e.message);}event.target.value='';
});
$('modal').addEventListener('click',event=>{if(event.target===$('modal')){const r=$('modal').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeModal();}});
$('modal').addEventListener('cancel',()=>{modalKind='';});
window.addEventListener('resize',()=>{if($('modal').open)paginateModal();fitPanelActors();alignProfileActions();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('modal').open&&!$('memory-viewer').open){tab=null;renderContent();icons();}});
document.addEventListener('visibilitychange',playMusic);
window.addEventListener('storage',event=>{if(event.key===KEY){if(!event.newValue){if(menuOpen){hasSavedGame=false;lastSavedRaw=null;renderMenu();}return;}try{const candidate=G.migrateSave(JSON.parse(event.newValue));if(busy){toast('另一个页面修改了存档，正在同步进度。');}else{homeView?.stop();$('wardrobe-window').close();stopDecorating();state=candidate;hasSavedGame=true;lastSavedRaw=event.newValue;closeModal();render();renderMenu();toast('已同步另一个页面的进度。');}}catch{}}});
try{lastSavedRaw=localStorage.getItem(KEY);}catch{storageOK=false;}
render();renderMenu();icons();if(pendingReloadNotice)toast(pendingReloadNotice);
if('serviceWorker' in navigator&&window.isSecureContext){
  const register=()=>navigator.serviceWorker.register('./sw.js?v=1.0.3-navalign32').catch(()=>{});
  // Finish the visible menu before downloading the offline copy of the full game.
  if(document.readyState==='complete')register();
  else window.addEventListener('load',register,{once:true});
}
