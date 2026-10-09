import * as G from './engine.js';

const $=id=>document.getElementById(id), icon=name=>`<i data-lucide="${name}"></i>`;
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='today-who-works-save-v1', PREF='today-who-works-preferences-v1';
let state=G.fresh(), tab=null, scene='home', busy=false, sound=false, fast=false, toastTimer, modalKind='', pendingReloadNotice='',storageOK=true,lastSavedRaw=null,hasSavedGame=false,menuOpen=true;
let contentPage=0, photoView=false, modalPage=0, modalPages=[];
const music=new Audio();music.preload='none';music.src='assets/music.wav';music.loop=true;music.volume=.18;
let prefs={};
try{prefs=JSON.parse(localStorage.getItem(PREF)||'{}');fast=!!prefs?.fast;}catch{}
try {
  const raw=localStorage.getItem(KEY);
  if(raw){const candidate=JSON.parse(raw);if(!G.validateSave(candidate))throw Error('invalid');state=candidate;hasSavedGame=true;}
}catch{
  try{const backup=JSON.parse(localStorage.getItem(KEY+'-backup')||'null');if(G.validateSave(backup)){state=backup;hasSavedGame=true;pendingReloadNotice='已从上一份备份恢复进度。';}else{const raw=localStorage.getItem(KEY);if(raw)localStorage.setItem(KEY+'-unreadable',raw);pendingReloadNotice='旧存档无法读取，已保留原始数据，可以开始新生活。';}}
  catch{storageOK=false;pendingReloadNotice='浏览器禁止保存，退出前可以导出存档。';}
}
function icons(){window.lucide?.createIcons({attrs:{'aria-hidden':'true'}});}
function toast(text){clearTimeout(toastTimer);$('toast').textContent=text;$('toast').classList.add('visible');toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3200);}
function save(){
  hasSavedGame=true;
  try {
    const previous=localStorage.getItem(KEY);
    const raw=JSON.stringify(state);
    if(previous&&previous!==raw){try{if(G.validateSave(JSON.parse(previous)))localStorage.setItem(KEY+'-backup',previous);}catch{}}
    localStorage.setItem(KEY,raw);lastSavedRaw=raw;storageOK=true;
  }catch{storageOK=false;}
  $('save-status').textContent=storageOK?'进度已保存到此浏览器':'无法自动保存 · 请在设置导出存档';
  $('save-status').classList.toggle('storage-warning',!storageOK);
}
function renderMenu(){
  $('menu-continue').disabled=!hasSavedGame;
  $('menu-save').textContent=hasSavedGame?`第 ${state.week} 周 · ${state.day===7?'周末':G.DAYS[state.day]} · ${state.cash} 生活币`:'从一把钥匙，开始两个人的生活。';
  $('menu-storage').textContent=storageOK?'你的进度，只保存在这台设备的浏览器里。':'此浏览器无法保存，请在游戏设置里导出备份。';
}
function enterGame(){
  closeModal();menuOpen=false;$('main-menu').hidden=true;$('main-menu').inert=true;
  $('game-shell').hidden=false;$('game-shell').inert=false;tab=null;scene='home';contentPage=0;render();
  if(sound)music.play().catch(()=>{});
  $('run').focus({preventScroll:true});
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
  closeModal();menuOpen=true;music.pause();$('game-shell').hidden=true;$('game-shell').inert=true;
  $('main-menu').hidden=false;$('main-menu').inert=false;renderMenu();icons();$('menu-continue').focus({preventScroll:true});
}
function requestNewGame(){
  refreshMenuSave();
  if(hasSavedGame){
    openModal('重新开始这段生活？','<p class="modal-caption">新游戏会从第1周、500生活币开始。现在的进度会保留一份恢复备份，并导出为存档文件。</p><div class="modal-actions"><button class="text-button" data-cancel-new>保留现在的进度</button><button class="primary-button" data-confirm-new>备份并开始新游戏</button></div>','给新的生活，留一把旧钥匙','new-game');
  }else startNewGame();
}
function startNewGame(){
  if(hasSavedGame){
    try{localStorage.setItem(KEY+'-previous-game',JSON.stringify(state));}
    catch{if(storageOK){toast('旧进度备份未能保存，请先导出存档。');return;}}
    exportSave();
  }
  if(perform(()=>G.fresh()))enterGame();
}
function commit(next){
  if(!G.validateSave(next))throw Error('存档状态异常，本次改动没有保存。');
  let latest;
  try{latest=localStorage.getItem(KEY);}catch{storageOK=false;}
  if(latest&&latest!==lastSavedRaw){
    try{const candidate=JSON.parse(latest);if(G.validateSave(candidate)){state=candidate;lastSavedRaw=latest;render();}}catch{}
    throw Error('另一个页面更新了进度，已经同步，请重新安排。');
  }
  state=next;save();render();
}
function perform(fn){try{commit(fn());return true;}catch(e){toast(e.message);return false;}}
function openModal(title,html,eyebrow='',kind='') {
  if($('modal').open)$('modal').close();
  modalKind=kind;$('modal-title').textContent=title;$('modal-eyebrow').textContent=eyebrow;$('modal-body').innerHTML=html;$('modal').showModal();icons();paginateModal();
}
function pager(page,total,attribute){
  return `<button class="icon-button" ${attribute}="${page-1}" ${page===0?'disabled':''} title="上一页" aria-label="上一页">${icon('chevron-left')}</button><span>${page+1} / ${total}</span><button class="icon-button" ${attribute}="${page+1}" ${page===total-1?'disabled':''} title="下一页" aria-label="下一页">${icon('chevron-right')}</button>`;
}
function contentPager(items){
  const total=Math.max(1,Math.ceil(items.length/(tab==='diary'?2:3)));contentPage=Math.min(contentPage,total-1);
  return `<nav class="pager" aria-label="列表分页">${pager(contentPage,total,'data-content-page')}</nav>`;
}
function paginateModal(){
  const body=$('modal-body');
  body.querySelectorAll('.action-options').forEach(group=>group.replaceWith(...group.children));
  const blocks=[...body.children];blocks.forEach(block=>{block.classList.add('modal-block');block.hidden=false;});
  $('modal-pager').hidden=false;
  const capacity=body.clientHeight;modalPages=[[]];let used=0;
  // Measure real blocks so large action lists and reports remain reachable without scrolling.
  for(const block of blocks){
    const css=getComputedStyle(block),height=block.getBoundingClientRect().height+parseFloat(css.marginTop)+parseFloat(css.marginBottom);
    if(used+height>capacity&&modalPages.at(-1).length){modalPages.push([]);used=0;}
    modalPages.at(-1).push(block);used+=height;
  }
  modalPage=0;renderModalPage();
}
function renderModalPage(){
  modalPages.forEach((blocks,i)=>blocks.forEach(block=>{block.hidden=i!==modalPage;}));
  $('modal-pager').hidden=modalPages.length<2;
  $('modal-pager').innerHTML=pager(modalPage,modalPages.length,'data-modal-page');icons();
}
function closeModal(){$('modal').close();modalKind='';}
function meter(value,name){return `<span class="meter ${name==='smile'?'mood':''}" title="${name==='smile'?'心情':'精力'} ${value}/100">${icon(name)}<span class="meter-track"><span style="width:${value}%"></span></span><b>${value}</b></span>`;}
function renderPeople(){
  $('people').innerHTML=state.chars.map((c,i)=>{
    const a=state.day<6?state.plan[state.day][i]:state.day===6?'rest':null;
    return `<button class="person person-${i?'b':'a'}" data-person="${i}" title="查看${escape(c.name)}的技能与状态"><div class="person-head"><b>${escape(c.name)}</b><small><span class="status-dot"></span>${a?G.ACTIONS[a].short||G.ACTIONS[a].name:'已收工'}</small></div><div class="meters">${meter(c.energy,'zap')}${meter(c.mood,'smile')}</div></button>`;
  }).join('');
}
function renderSchedule(){
  $('schedule').innerHTML=Array.from({length:7},(_,d)=>{
    const done=d<state.day, current=d===state.day;
    const label=`<span class="day-name ${current?'today':''}">${G.DAYS[d]}</span>`;
    const cells=d<6?state.plan[d].map((a,i)=>{
      const ac=G.ACTIONS[a],label={admin:'事务',creative:'创作',second:'二手',prep:'备货',sell:'摆摊'}[a]||ac.short||ac.name;return `<button class="schedule-action ${ac.color} ${done?'done':''}" data-day="${d}" data-person-action="${i}" ${done||busy?'disabled':''} title="${escape(state.chars[i].name)} · ${ac.name}${a==='work'?' · 点击换班':' · 点击改安排'}" aria-label="${G.DAYS[d]}${escape(state.chars[i].name)}${ac.name}${a==='work'?'，换班':'，改安排'}">${icon(ac.icon)}<span>${label}</span></button>`;
    }).join(''):`<button class="schedule-action sunday ${done?'done':''}" data-sunday ${done||busy?'disabled':''} title="周日一起做点什么">${icon(state.sunday==='walk'?'footprints':state.sunday==='home'?'house':'sandwich')}<span>${state.sunday==='walk'?'散步':state.sunday==='home'?'在家':'野餐'}</span>${icon(done?'check':'chevron-down')}</button>`;
    return `<div class="day-row">${label}${cells}</div>`;
  }).join('');
  const f=G.forecast(state);$('forecast').classList.toggle('error',!!f.error);
  $('forecast').innerHTML=f.error?`${icon('circle-alert')}<span>${escape(f.error)}</span>`:`<span>${state.day===7?'本周结余':'预计周末结余'}${f.state.debt?`<br>待缴生活费 ${f.state.debt}币`:''}</span><strong>${f.state.cash}<small> 币</small></strong>`;
  $('run').disabled=busy;
  $('run').innerHTML=`${icon(busy?'loader-circle':state.day===7?'chart-no-axes-combined':G.eventFor(state)?'message-circle':'play')}<span>${busy?'过好这一天…':state.day===7?'查看这一周':G.eventFor(state)?'今天有件小事':`开始${G.DAYS[state.day]}`}</span>`;
  const job=G.jobOf(state);$('job-name').textContent=job.name;$('job-pay').innerHTML=`${job.wage}<small>币 / 班</small>`;$('contract').querySelector('.contract-icon').innerHTML=icon(job.icon);
  $('preset').disabled=busy||state.day===7;
}
function renderScene(){
  $('scene').classList.toggle('weekend',state.day===7);
  $('scene').classList.toggle('town',scene==='town');$('scene-bg').src=`assets/${scene==='town'?'town':'apartment'}.webp`;
  $('scene-bg').alt=scene==='town'?'小店、共享办公室和街边的小摊':'阳光照进两个人的合租房';
  document.querySelectorAll('[data-scene]').forEach(b=>{b.classList.toggle('active',b.dataset.scene===scene);b.setAttribute('aria-pressed',b.dataset.scene===scene);});
  $('scene-caption').innerHTML=`${icon(scene==='town'?'store':'key-round')}<span>${scene==='town'?'小镇的共享岗位':'我们的合租小屋'}</span>`;
  $('props').innerHTML=scene==='home'?state.furniture.map(id=>{const f=G.FURNITURE.find(x=>x.id===id);return `<img class="prop prop-${id}" src="assets/furniture-${f.sprite}.webp" alt="${f.name}">`;}).join(''):'';
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
  $('speech').textContent=state.debt?'阿忙：慢慢来，先把这一周过好。':lines[state.day];
}
function renderContent(){
  document.querySelector('.app-shell').classList.toggle('panel-open',tab!==null);
  $('planner').classList.toggle('mobile-hide',tab!=='plan');$('content').classList.toggle('mobile-hide',tab==='plan'||tab===null);
  document.querySelectorAll('[data-tab]').forEach(b=>{b.classList.toggle('active',b.dataset.tab===tab);b.setAttribute('aria-current',b.dataset.tab===tab?'page':'false');});
  if(tab==='plan'||tab===null) {
    $('content').innerHTML='';
  }
  if(tab==='home') {
    const navigation=contentPager(G.FURNITURE);
    $('content').innerHTML=`<div class="section-heading"><h3>我们的家</h3><span>${state.furniture.length} / 6 件新家具</span></div><div class="furniture-grid">${G.FURNITURE.slice(contentPage*3,contentPage*3+3).map(f=>{const owned=state.furniture.includes(f.id);return `<article class="furniture-item"><div class="furniture-image"><img src="assets/furniture-${f.sprite}.webp" alt="${f.name}"></div><div class="furniture-copy"><b>${f.name}</b><p>${f.benefit}</p><button class="buy-button ${owned?'owned':''}" data-buy="${f.id}" ${owned||busy||state.day===7?'disabled':''} title="${f.desc}">${icon(owned?'check':'coins')}<span>${owned?'已经在家':`${f.cost} 币 · 添置`}</span></button></div></article>`;}).join('')}</div>${navigation}`;
  }
  if(tab==='jobs') {
    const navigation=contentPager(G.JOBS);
    $('content').innerHTML=`<div class="section-heading"><h3>小镇招工栏</h3><span>${state.day===0?'本周可以换合同':'下周接新合同'}</span></div><div class="board-action"><p>岗位信封</p><button class="text-button" data-draw ${busy||state.drawWeek===state.week?'disabled':''}>${icon('mail-open')}<span>${state.drawWeek===state.week?'已经拆过':'免费拆开'}</span></button></div><div class="job-list">${G.JOBS.slice(contentPage*3,contentPage*3+3).map(j=>{const qualified=state.chars.every(c=>G.qualifies(c,j)),current=state.job===j.id;return `<article class="job-item ${qualified?'':'locked'}"><span class="job-symbol">${icon(j.icon)}</span><div class="job-copy"><b>${j.name}</b><p>${j.level?`${j.skill?'创作':'事务'} ${j.level}级 · 两人都需达标`:'无门槛 · 两人都能接'}</p></div><div class="job-wage">${j.wage}<small>币 / 班</small></div><button class="text-button" data-job="${j.id}" ${busy||!qualified||current||state.day!==0?'disabled':''}>${icon(current?'check':qualified?'arrow-right':'lock-keyhole')}<span>${current?'在做':'接班'}</span></button></article>`;}).join('')}</div>${navigation}`;
  }
  if(tab==='diary') {
    const memoryNames={first:'第一张好日程',learn:'新本事',side:'第一次小生意',home:'我们的家',balance:'忙闲刚刚好'};
    const items=photoView?state.memories:state.log,navigation=contentPager(items),visible=items.slice(contentPage*2,contentPage*2+2);
    $('content').innerHTML=`<div class="section-heading"><h3>${photoView?'生活照片':'生活日记'}</h3><button class="icon-button" data-photo-view title="${photoView?'查看日记':'查看照片'}" aria-label="${photoView?'查看日记':'查看照片'}">${icon(photoView?'notebook-pen':'images')}</button></div>${state.reports.length?`<button class="text-button report-button" data-last-report>${icon('receipt-text')}上周账本</button>`:''}${photoView?`<div class="memory-strip">${visible.map(id=>`<div class="memory"><img src="assets/${id==='home'?'apartment':'town'}.webp" alt="${memoryNames[id]}"><p>${memoryNames[id]}</p></div>`).join('')}</div>`:`<ul class="diary-log">${visible.length?visible.map(l=>`<li><span class="diary-date">第${l.week}周<br>${G.DAYS[Math.min(l.day,6)]}</span><span>${escape(l.text)}</span></li>`).join(''):`<li class="empty-state">${icon('notebook-pen')}<span>日记的第一页，留给今天。</span></li>`}</ul>`}${navigation}`;
  }
  $('content').querySelector('.section-heading')?.insertAdjacentHTML('beforeend',`<button class="icon-button" data-close-panel title="收起窗口" aria-label="收起窗口">${icon('x')}</button>`);
}
function render(){
  $('cash').textContent=state.cash;$('wallet')?.classList.toggle('low',state.cash<100);
  $('week').textContent=`第 ${state.week} 周`;$('day').textContent=state.day===7?'周末结算':G.DAYS[state.day];
  $('wish-title').textContent=G.goalFor(state).title;renderPeople();renderSchedule();renderScene();renderContent();icons();
}
function personModal(i) {
  const c=state.chars[i];
  openModal(`${c.name}的小本子`,`<div class="skill-person"><img src="assets/characters-${i?3:1}.webp" alt="${escape(c.name)}"><div><p>${i?'“有班上，也想把生活过好。”':'“不上班的日子，也不是在浪费。”'}</p><div class="meters">${meter(c.energy,'zap')}${meter(c.mood,'smile')}</div></div></div>${c.xp.map((v,k)=>{const p=G.progress(v);return `<div class="skill-row"><div class="skill-label"><b>${k?'创作':'事务'}技能</b><span>Lv.${p.level}</span></div><div class="meter-track"><span style="width:${p.percent}%"></span></div><small>${p.level===3?'已经很熟练了':`本级经验 ${p.current} / ${p.need} · 进修每次 +3`}</small></div>`;}).join('')}<div class="ledger-row"><span>本周出勤</span><b>${state.ledger.shifts[i]} 天</b></div><div class="ledger-row"><span>本周工资</span><b class="positive">${state.ledger.salary[i]} 币</b></div>`,'每个人，都有自己的成长');
}
function scheduleModal(d,i) {
  if(busy||d<state.day)return;
  const worker=state.plan[d].indexOf('work'),free=1-worker,c=state.chars[free];
  openModal(`${G.DAYS[d]} · ${c.name}的空档`,`<button class="text-button swap-button" data-swap="${d}" data-worker="${free}">${icon('arrow-left-right')}<span>换班：让${escape(c.name)}上班，${escape(state.chars[worker].name)}空闲</span></button><div class="action-options">${Object.entries(G.ACTIONS).filter(([k])=>k!=='work').map(([k,a])=>`<button class="action-option ${state.plan[d][free]===k?'active':''}" data-action="${k}" data-action-day="${d}" data-action-person="${free}">${icon(a.icon)}<span><b>${a.name}</b><small>${a.detail}</small></span>${icon(state.plan[d][free]===k?'check':'chevron-right')}</button>`).join('')}</div>`,'一天一个行动，工资先到账');
}
function sundayModal(){
  if(state.day>6||busy)return;
  const options=[['walk','footprints','一起散步','免费 · 两人精力 +40，心情 +12'],['home','house','在家慢慢过','免费 · 两人精力 +50，心情 +8'],['picnic','sandwich','带便当去野餐','60币 · 两人精力 +40，心情 +20']];
  openModal('周日，今天属于我们',`<div class="action-options">${options.map(([id,ic,name,detail])=>`<button class="action-option ${state.sunday===id?'active':''}" data-sunday-choice="${id}">${icon(ic)}<span><b>${name}</b><small>${detail}</small></span>${icon(state.sunday===id?'check':'chevron-right')}</button>`).join('')}</div>`,'不用打卡的一天');
}
function wishModal(){const g=G.goalFor(state);openModal(g.title,`<img class="event-art" src="assets/${g.id==='home'?'apartment':'town'}.webp" alt="本周的生活心愿"><p class="modal-caption">${g.description}</p><div class="badge">${icon('image')}完成后留下一张生活照片</div>`,'第'+state.week+'周的小心愿');}
function presetModal(){
  openModal('把剩下的日子排一排',`<div class="action-options"><button class="action-option" data-preset="rest">${icon('coffee')}<span><b>忙闲刚刚好</b><small>交替上班，空档好好休息。</small></span>${icon('chevron-right')}</button><button class="action-option" data-preset="learn">${icon('book-open')}<span><b>这周学点东西</b><small>优先给两人补事务课，其他空档休息。</small></span>${icon('chevron-right')}</button><button class="action-option" data-preset="side">${icon('package')}<span><b>攒一点生活钱</b><small>安排剩余二手订单，有条件再备货摆摊。</small></span>${icon('chevron-right')}</button></div>`,'已完成的日程会保留');
}
function applyPreset(type) {
  const n=structuredClone(state);let seconds=n.second,prep=n.batches,stock=n.inventory,course=0;
  for(let d=n.day;d<6;d++){
    const w=d%2,free=1-w;n.plan[d]=w?['rest','work']:['work','rest'];
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
  openModal(`第 ${report.week} 周 · 生活账本`,`<div class="report-hero"><img src="assets/characters-1.webp" alt="阿闲"><div><h3>${report.balanced&&report.happy?'忙和闲，<br>都刚刚好。':'这周辛苦了，<br>慢慢往前走。'}</h3><p>${report.goalMet?`小心愿完成：${escape(report.goal)}`:'还有没做完的小心愿，下一周继续。'}</p></div><img src="assets/characters-3.webp" alt="阿忙"></div><div class="badge-row">${report.balanced?`<span class="badge">${icon('scale')}每人3天班</span>`:''}${report.happy?`<span class="badge">${icon('smile')}心情都不错</span>`:''}${report.debt?`<span class="badge warning">${icon('receipt')}待缴${report.debt}币</span>`:''}</div><div class="ledger-total"><div><small>本周总收入</small><b class="positive">+${income}</b></div><div><small>本周总支出</small><b class="negative">−${expenses}</b></div></div>${[['阿闲的工资',l.salary[0],true],['阿忙的工资',l.salary[1],true],['副业回款',l.side,true],['生活小事',l.bonus,true],['进修学费',l.training,false],['副业成本',l.stock,false],['生活开销',l.life,false],['新家具',l.furniture,false],['补缴旧账',l.recovery,false]].filter(([,v])=>v).map(([name,v,plus])=>`<div class="ledger-row"><span>${name}</span><b class="${plus?'positive':'negative'}">${plus?'+':'−'}${v}</b></div>`).join('')}<div class="ledger-row"><span>周末生活账户</span><b>${report.cash} 币</b></div>${report.debt?'<p class="option-note">没缴清的生活费下周补缴，无利息；基础岗位和免费休息一直可用。</p>':''}${last?`<div class="modal-actions"><button class="primary-button" data-next-week>${icon('arrow-right')}开始第${state.week+1}周</button></div>`:''}`,'六天打卡，一天生活','report');
}
function eventModal(){
  const e=G.eventFor(state);if(!e)return;
  openModal(e.title,`<img class="event-art" src="assets/town.webp" alt="小镇里的生活小事"><p class="modal-caption">${e.line}</p><div class="action-options">${e.options.map((o,i)=>`<button class="action-option" data-event-choice="${i}">${icon(i?'sparkles':'leaf')}<span><b>${o.name}</b><small>${o.hint}</small></span>${icon('chevron-right')}</button>`).join('')}</div>`,'今天有件小事','event');
}
function settingsModal(){
  openModal('生活的小设置',`<label class="toggle-row"><span>轻快的背景音乐</span><input id="sound-toggle" type="checkbox" ${sound?'checked':''}></label><label class="toggle-row"><span>快速过一天</span><input id="fast-toggle" type="checkbox" ${fast?'checked':''}></label><button class="text-button" data-main-menu>${icon('house')}返回主菜单</button><div class="settings-buttons"><button class="text-button" data-export>${icon('download')}导出存档</button><button class="text-button" data-import>${icon('upload')}导入存档</button><button class="text-button danger-button" data-reset>${icon('rotate-ccw')}重新开始</button></div><p class="option-note">${storageOK?'进度保存在当前浏览器。':'当前浏览器无法自动保存。'}换手机前，请带上存档。存档只包含游戏进度。</p><div class="ledger-row"><span>放松体验券</span><b>精力 +20</b></div><p class="option-note">广告演示 · 每游戏周一次，不播放商业广告，不产生真实收益。</p><button class="text-button" data-ad ${state.adWeek===state.week||state.day===7?'disabled':''}>${icon('clapperboard')}${state.adWeek===state.week?'本周已用':'体验一次模拟激励广告'}</button>`,'今天谁上班 · Demo V0.6.1','settings');
}
function setSound(value){sound=value;$('sound').innerHTML=icon(sound?'volume-2':'volume-x');$('sound').title=sound?'关闭声音':'开启声音';$('sound').setAttribute('aria-label',$('sound').title);if(sound)music.play().catch(()=>{sound=false;toast('浏览器暂未允许播放声音。');});else music.pause();icons();}
function persistPrefs(){try{localStorage.setItem(PREF,JSON.stringify({fast}));}catch{}}
function exportSave(){
  const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`今天谁上班_第${state.week}周存档.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);toast('存档已导出。');
}
async function runDay(){
  if(busy)return;
  if(state.day===7){reportModal();return;}
  if(G.eventFor(state)){eventModal();return;}
  let next;try{next=G.executeDay(state,state.week,state.day);}catch(e){toast(e.message);return;}
  busy=true;const previousDay=state.day,worker=previousDay<6?state.plan[previousDay].indexOf('work'):0;
  scene=previousDay===6?'home':'town';tab=null;render();$('scene').classList.add('busy');$('day-overlay').hidden=false;
  $('day-overlay-text').textContent=previousDay===6?'今天，两个人一起放假。':`${state.chars[worker].name}去上班啦！`;
  await new Promise(resolve=>setTimeout(resolve,fast?130:1050));
  let committed=false;
  try{commit(next);committed=true;}catch(e){toast(e.message);}
  busy=false;$('scene').classList.remove('busy');$('day-overlay').hidden=true;render();
  if(!committed)return;
  if(sound){const ding=new Audio('assets/day.wav');ding.volume=.25;ding.play().catch(()=>{});}
  if(state.day===7){scene='home';render();reportModal();}
  else toast(`${G.DAYS[previousDay]}完成，${state.chars[worker].name}${previousDay<6?`的工资已到账`:'也休息好了'}。`);
}
async function simulatedAd(){
  openModal('放松体验券',`<p class="modal-caption">广告演示，不连接真实广告平台。</p><div class="ad-timer" id="ad-timer">3</div><p class="modal-caption" style="text-align:center">奖励：两人精力 +20</p>`,'模拟激励广告','ad');
  for(let remaining=3;remaining>0;remaining--){if(!$('modal').open||modalKind!=='ad')return;$('ad-timer').textContent=remaining;await new Promise(resolve=>setTimeout(resolve,1000));}
  if(!$('modal').open||modalKind!=='ad')return;
  if(perform(()=>G.adReward(state))){closeModal();toast('体验结束，两人精力 +20。');}
}
document.addEventListener('click',event=>{
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
  if(b.dataset.buy){const f=G.FURNITURE.find(f=>f.id===b.dataset.buy);openModal(f.name,`<div class="report-hero"><img src="assets/furniture-${f.sprite}.webp" alt="${f.name}"><div><h3>${f.cost} 生活币</h3><p>${f.desc}</p><p class="hint-price">${f.benefit}</p></div></div><div class="modal-actions"><button class="primary-button" data-confirm-buy="${f.id}">${icon('shopping-bag')}搬回家</button></div>`,'给家添点新东西');}
  if(b.dataset.confirmBuy){if(perform(()=>G.buy(state,b.dataset.confirmBuy))){closeModal();scene='home';render();toast('新家具搬回家了！');}}
  if(b.hasAttribute('data-next-week')){if(perform(()=>G.nextWeek(state))){closeModal();tab=null;contentPage=0;scene='home';render();toast(`第${state.week}周，留点时间给自己。`);}}
  if(b.hasAttribute('data-last-report'))reportModal();
  if(b.hasAttribute('data-event-choice')){if(perform(()=>G.resolveEvent(state,Number(b.dataset.eventChoice)))){closeModal();runDay();}}
  if(b.id==='wish-button')wishModal();
  if(b.id==='settings')settingsModal();
  if(b.id==='sound')setSound(!sound);
  if(b.hasAttribute('data-export'))exportSave();
  if(b.hasAttribute('data-import'))$('import-file').click();
  if(b.hasAttribute('data-reset'))requestNewGame();
  if(b.hasAttribute('data-ad'))simulatedAd();
  if(b.hasAttribute('data-draw')){if(perform(()=>G.draw(state))){const j=G.JOBS.find(j=>j.id===state.drawJob);openModal('信封里，是一个新机会',`<div class="report-hero"><img src="assets/characters-3.webp" alt="阿忙"><div><h3>${j.name}</h3><p>${j.line}</p><p class="hint-price">${j.wage} 币 / 班</p></div></div><div class="modal-actions"><button class="text-button" data-ignore-draw>留着原合同</button><button class="primary-button" data-accept-draw ${state.day!==0?'disabled':''}>${icon('check')}一起接这个班</button></div>${state.day!==0?'<p class="option-note">本周已开工，下周到招工栏接新合同。</p>':''}`,'每周一次免费岗位提案');}}
  if(b.hasAttribute('data-ignore-draw'))closeModal();
  if(b.hasAttribute('data-accept-draw')){if(perform(()=>G.selectJob(state,state.drawJob)))closeModal();}
});
document.addEventListener('change',event=>{
  if(event.target.id==='sound-toggle')setSound(event.target.checked);
  if(event.target.id==='fast-toggle'){fast=event.target.checked;persistPrefs();}
});
$('import-file').addEventListener('change',async event=>{
  const file=event.target.files[0];if(!file)return;
  try{
    if(file.size>150000)throw Error('文件过大，请选择本游戏导出的JSON存档。');
    const candidate=JSON.parse(await file.text());if(!G.validateSave(candidate))throw Error('存档格式不正确，原进度已经保留。');
    openModal(`恢复到第${candidate.week}周？`,`<p class="modal-caption">生活账户 ${candidate.cash}币，当前${candidate.day===7?'周末结算':G.DAYS[candidate.day]}。恢复前会把当前进度导出。</p><button class="primary-button" id="confirm-import">${icon('upload')}恢复这份存档</button>`,'把生活接回来');
    $('confirm-import').addEventListener('click',()=>{exportSave();if(perform(()=>candidate)){closeModal();tab=null;scene='home';render();toast('进度恢复好了。');}},{once:true});
  }catch(e){toast(e.message);}event.target.value='';
});
$('modal').addEventListener('click',event=>{if(event.target===$('modal')){const r=$('modal').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeModal();}});
$('modal').addEventListener('cancel',()=>{modalKind='';});
window.addEventListener('resize',()=>{if($('modal').open)paginateModal();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('modal').open){tab=null;renderContent();icons();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden||menuOpen)music.pause();else if(sound)music.play().catch(()=>{});});
window.addEventListener('storage',event=>{if(event.key===KEY){if(!event.newValue){if(menuOpen){hasSavedGame=false;lastSavedRaw=null;renderMenu();}return;}try{const candidate=JSON.parse(event.newValue);if(G.validateSave(candidate)){if(busy){toast('另一个页面修改了存档，正在同步进度。');}else{state=candidate;hasSavedGame=true;lastSavedRaw=event.newValue;closeModal();render();renderMenu();toast('已同步另一个页面的进度。');}}}catch{}}});
try{lastSavedRaw=localStorage.getItem(KEY);}catch{storageOK=false;}
render();renderMenu();icons();if(pendingReloadNotice)toast(pendingReloadNotice);
if('serviceWorker' in navigator&&window.isSecureContext){
  const register=()=>navigator.serviceWorker.register('./sw.js?v=0.6.1').catch(()=>{});
  // Finish the visible menu before downloading the offline copy of the full game.
  if(document.readyState==='complete')register();
  else window.addEventListener('load',register,{once:true});
}
