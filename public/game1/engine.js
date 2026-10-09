export const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
export const JOBS = [
  {id:'shop', name:'小店值班员', wage:100, skill:0, level:0, icon:'store', line:'最后一位客人，总在最后一分钟出现。'},
  {id:'register', name:'资料登记员', wage:110, skill:0, level:1, icon:'clipboard-list', line:'今天的任务：把表格里的表格填完。'},
  {id:'event', name:'活动助理', wage:120, skill:1, level:1, icon:'flag', line:'横幅改了三次，活动时间没改。'},
  {id:'archive', name:'文档整理员', wage:130, skill:0, level:2, icon:'folder-open', line:'文件名：最终版_真的最终版。'},
  {id:'layout', name:'排版助理', wage:140, skill:0, level:2, icon:'panels-top-left', line:'要显眼一点，也要低调一点。'},
  {id:'design', name:'图文助理', wage:150, skill:1, level:2, icon:'palette', line:'一句话的文案，开了半天的会。'}
];
export const JOB_DETAILS = {
  shop:{short:'小店班',place:'街角小店',tasks:['理货、贴价签，给第一位客人找零钱','清点库存，把缺货记在小本子上','整理橱窗，把卖不动的杯子换个位置','收货、核对账单，顺手擦亮招牌','替邻居留一袋面包，收银到傍晚','做周末盘点，关门前再检查一遍']},
  register:{short:'登记班',place:'社区服务站',tasks:['给新住户建档，核对姓名和门牌','整理预约名单，帮来访者填表','录入活动报名，找出重复的一页','接听咨询，把信息分给对应窗口','给材料编号，把漏填的地方标出来','核对这一周的登记，归好资料']},
  event:{short:'活动班',place:'社区活动室',tasks:['摆好签到桌，试一遍小音箱','给读书会排座位，把海报贴上墙','接待讲者，核对活动流程','分发材料，提醒大家下一场时间','布置小展览，为作品写标签','收好道具，记录今天的活动反馈']},
  archive:{short:'归档班',place:'小镇资料室',tasks:['按年份给旧档案分类','扫描旧照片，把姓名对上','给电子文件统一命名','整理借阅清单，寻找缺失页','把最终版和草稿分开放','做一份本周目录，下班前备份']},
  layout:{short:'排版班',place:'街角印刷铺',tasks:['给社区简报排第一页','调整标题字号，把图片对齐','校对页码，留出装订边','给活动手册做一个清楚的目录','输出校样，检查容易漏掉的小字','交付印刷文件，把源稿收好']},
  design:{short:'图文班',place:'小镇图文工作室',tasks:['给小店画一张今日菜单','把活动照片做成一页推送','为邻居的小摊做价目牌','配一张插图，让通知容易看懂','修改海报，保留大家最喜欢的颜色','整理一周作品，为下次存个模板']}
};
export const jobDetail = (s,d=Math.min(s.day,5)) => {
  const job=jobOf(s,d),detail=JOB_DETAILS[job.id];
  return {...job,...detail,task:detail.tasks[Math.max(0,Math.min(d,5))]};
};
export const ACTIONS = {
  work:{name:'上班', icon:'briefcase-business', color:'blue', detail:'精力 −20 · 心情 −8 · 按合同领工资'},
  rest:{name:'好好休息', short:'休息', icon:'coffee', color:'green', detail:'精力 +30 · 心情 +6 · 免费'},
  admin:{name:'事务进修', short:'事务课', icon:'book-open', color:'yellow', detail:'40币 · 事务经验 +3 · 精力 −15 · 心情 −5'},
  creative:{name:'创作进修', short:'创作课', icon:'pencil-ruler', color:'yellow', detail:'40币 · 创作经验 +3 · 精力 −15 · 心情 −5'},
  second:{name:'二手小铺', short:'二手单', icon:'package', color:'pink', detail:'成本30 / 回款80 · 净赚50 · 每周2单 · 精力 −15 · 心情 −4'},
  prep:{name:'贴纸备货', short:'备贴纸', icon:'scissors', color:'pink', detail:'40币 · 创作1级 · 精力 −15 · 心情 −4 · 库存上限1批'},
  sell:{name:'贴纸摆摊', short:'摆小摊', icon:'shopping-bag', color:'pink', detail:'回款140币 · 创作1级 · 需要库存 · 精力 −15 · 心情 −4'}
};
export const FURNITURE = [
  {id:'plant', name:'窗边的绿意', cost:150, sprite:0, benefit:'心情随购买 +5', energy:0, mood:0, desc:'一片新叶子，也是新生活。'},
  {id:'lamp', name:'晚读小灯', cost:220, sprite:1, benefit:'每晚心情 +1', energy:0, mood:1, desc:'留一束光给下班后的自己。'},
  {id:'shelf', name:'两个人的书架', cost:280, sprite:2, benefit:'事务、创作经验各 +1', energy:0, mood:0, desc:'工作的书和喜欢的书，各占一半。'},
  {id:'sofa', name:'周末软沙发', cost:360, sprite:3, benefit:'每晚精力 +2', energy:2, mood:0, desc:'今天可以陷在这里，哪里都不去。'},
  {id:'coffee', name:'早安咖啡机', cost:420, sprite:4, benefit:'每晚精力 +2', energy:2, mood:0, desc:'不是为了加班，是为了喜欢早晨。'},
  {id:'balcony', name:'阳台小餐桌', cost:500, sprite:5, benefit:'每晚心情 +1', energy:0, mood:1, desc:'把晚饭搬到晚风里。'}
];
// Authored floor anchors: widths are relative to the room, not viewport height.
export const HOME_SPOTS = {
  green:{name:'蓝门旁',x:3,bottom:36,width:10},
  greenRear:{name:'门边靠后',x:13,bottom:41,width:9},
  reading:{name:'红帘角落',x:75,bottom:37,width:22},
  readingRear:{name:'后墙中央',x:55,bottom:42,width:20},
  lounge:{name:'左侧休息区',x:7,bottom:20,width:38},
  loungeRear:{name:'靠后休息区',x:27,bottom:31,width:36},
  kitchen:{name:'右侧咖啡角',x:77,bottom:20,width:13},
  kitchenLeft:{name:'门旁咖啡角',x:2,bottom:22,width:13},
  dining:{name:'中间用餐区',x:49,bottom:25,width:24},
  diningRear:{name:'靠后用餐区',x:39,bottom:36,width:21},
  light:{name:'右侧晚读角',x:85,bottom:28,width:14},
  lightRear:{name:'后墙晚读角',x:70,bottom:41,width:11}
};
export const HOME_CHOICES = {plant:['green','greenRear'],lamp:['light','lightRear'],shelf:['reading','readingRear'],sofa:['lounge','loungeRear'],coffee:['kitchen','kitchenLeft'],balcony:['dining','diningRear']};
export const placementOf = (s,id) => s.placements?.[id]||HOME_CHOICES[id][0];
const HOME_CONFLICTS=[['readingRear','lightRear'],['loungeRear','diningRear'],['lounge','kitchenLeft'],['green','kitchenLeft']];
export const spotAvailable=(s,id,spot)=>!s.furniture.some(other=>other!==id&&HOME_CONFLICTS.some(pair=>pair.includes(spot)&&pair.includes(placementOf(s,other))));
export function placeFurniture(s,id,spot){
  if(!s.furniture.includes(id)||!HOME_CHOICES[id]?.includes(spot))throw Error('请先添置家具，再选合适的位置。');
  if(!spotAvailable(s,id,spot))throw Error('这个位置会挤到另一件家具，先把它挪开吧。');
  const n=copy(s);n.placements={...n.placements,[id]:spot};return n;
}
export const EVENTS = [
  {title:'又多了一个会', line:'店长说：“五分钟，真的就五分钟。”', options:[{name:'按原计划下班', hint:'没有额外消耗', type:'none'}, {name:'留下来学两招', hint:'当班人事务经验 +1，心情 −3', type:'meeting'}]},
  {title:'路过的小小好天气', line:'阿忙看着窗外：“晚上一起出去走走？”', options:[{name:'一起绕远路回家', hint:'两人心情 +4', type:'sun'}, {name:'先帮小铺拍张照', hint:'生活账户 +20币', type:'photo'}]},
  {title:'最终版去哪儿了', line:'文件夹里有七个最终版，一个都不够最终。', options:[{name:'按普通流程找', hint:'没有额外消耗', type:'none'}, {name:'顺手整理文件夹', hint:'当班人事务经验 +1，精力 −3', type:'sort'}]},
  {title:'邻居送来了橘子', line:'“别总想着工作，吃点新鲜的。”', options:[{name:'坐下来慢慢吃', hint:'两人心情 +4', type:'sun'}, {name:'留给明天的早饭', hint:'两人精力 +8', type:'fruit'}]}
];
export const level = xp => xp >= 18 ? 3 : xp >= 9 ? 2 : xp >= 3 ? 1 : 0;
export const progress = xp => {
  const l=level(xp), starts=[0,3,9,18], ends=[3,9,18,18];
  return {level:l, current:xp-starts[l], need:ends[l]-starts[l], percent:l===3?100:(xp-starts[l])/(ends[l]-starts[l])*100};
};
const clamp = n => Math.max(0,Math.min(100,n));
const copy = s => structuredClone(s);
const blankLedger = () => ({salary:[0,0], shifts:[0,0], side:0, bonus:0, training:0, stock:0, life:0, furniture:0, recovery:0, courses:0, start:0});
const emptyWeek = () => ({jobs:[],actions:[],request:null,paid:false,daily:[]});
export const REQUESTS = [
  {id:'shop-help',title:'小店的周末准备',story:'店主想办一场小义卖，需要人照看店面，也需要新鲜点子。',reward:90,needs:[['shop',2,'上2次小店班'],['course',1,'完成1次进修']]},
  {id:'community',title:'社区的一张新简报',story:'服务站的简报要出刊了，来帮忙登记和打磨内容吧。',reward:120,needs:[['office',2,'上2次登记／活动班'],['course',2,'完成2次进修']]},
  {id:'market',title:'周末交换小集市',story:'街坊想把闲置物件交给喜欢它们的人，忙完记得好好休息。',reward:100,needs:[['side',2,'完成2次副业回款'],['rest',2,'安排2次好好休息']]},
  {id:'studio',title:'小镇联合企划',story:'你们的本事大家都看见了。这次合作需要不同岗位和真正的专业能力。',reward:180,unlock:2,needs:[['jobs',3,'尝试3种不同岗位'],['advanced',2,'上2次归档／排版／图文班']]}
];
export const CHAPTERS = [
  {id:'settle',title:'第一章 · 在小镇站稳脚跟',stamp:'新邻居',reward:120,story:'先把一周过好，再给空空的房间添一抹绿。',needs:[['shifts',6,'完成6次上班'],['courses',2,'累计进修2次'],['furniture',1,'拥有1件家具']]},
  {id:'grow',title:'第二章 · 我们都有新本事',stamp:'可靠搭档',reward:180,story:'换几个班、学一点新东西，邻居开始把重要的事交给你们。',needs:[['jobs',3,'体验3种岗位'],['skills',2,'有2项技能达到2级'],['commissions',2,'完成2份街坊委托']]},
  {id:'home',title:'第三章 · 忙和闲都有位置',stamp:'小家主理人',reward:260,story:'工作不是全部。让家更舒服，也给两个人留下周末。',needs:[['balancedWeeks',2,'过2个忙闲平衡周'],['furniture',4,'拥有4件家具'],['sideOrders',4,'累计完成4次副业回款']]},
  {id:'dream',title:'终章 · 过成喜欢的生活',stamp:'小镇生活家',reward:400,story:'小家布置齐了，新本事也够用了。把余下的日子，过成自己的样子。',needs:[['jobs',6,'体验全部6种岗位'],['furniture',6,'集齐6件家具'],['cash',1200,'留出1200币生活储蓄'],['wishes',4,'完成4次周心愿']]}
];
// Old saves recover only evidence that still exists; older discarded reports are not invented.
export function journeyOf(s){
  if(s.journey)return s.journey;
  const reports=s.reports||[],past=reports.filter(r=>r.week<s.week),jobs=[];
  for(const r of past)for(const id of r.jobs||[r.job])if(!jobs.includes(id))jobs.push(id);
  const weekly=emptyWeek();
  for(let d=0;d<Math.min(s.day,6);d++){
    weekly.jobs.push(jobOf(s,d).id);weekly.actions.push(s.plan[d][1-s.plan[d].indexOf('work')]);
    if(!jobs.includes(jobOf(s,d).id))jobs.push(jobOf(s,d).id);
  }
  return {shifts:past.reduce((n,r)=>n+r.ledger.shifts.reduce((a,b)=>a+b,0),0)+s.ledger.shifts.reduce((a,b)=>a+b,0),courses:past.reduce((n,r)=>n+(r.ledger.courses||0),0)+s.ledger.courses,sideOrders:past.reduce((n,r)=>n+(r.ledger.side?1:0),0)+weekly.actions.filter(a=>['second','sell'].includes(a)).length,balancedWeeks:reports.filter(r=>r.balanced&&r.happy).length,wishes:reports.filter(r=>r.goalMet).length,commissions:0,jobs,claimed:[],weekly};
}
export function dailyGoal(s,d=Math.min(s.day,6)){
  const actions=['admin','rest','second','creative','rest','second'],action=actions[(d+s.week-1)%6];
  return d===6?{title:'把周日留给我们',hint:'一起散步、在家休息或野餐，完成周日即可。',reward:30,action:'sunday'}:{title:`今日小目标 · ${ACTIONS[action].short}`,hint:`上完当天班，给空档的室友安排「${ACTIONS[action].name}」。`,reward:25,action};
}
function requirementRows(needs,value){return needs.map(([key,target,label])=>({key,target,label,value:value(key),done:value(key)>=target}));}
export function requestProgress(s,id=journeyOf(s).weekly.request){
  const request=REQUESTS.find(r=>r.id===id);if(!request)return null;
  const j=journeyOf(s),w=j.weekly,counts=key=>key==='jobs'?new Set(w.jobs).size:key==='shop'?w.jobs.filter(x=>x==='shop').length:key==='office'?w.jobs.filter(x=>['register','event'].includes(x)).length:key==='advanced'?w.jobs.filter(x=>['archive','layout','design'].includes(x)).length:w.actions.filter(x=>key==='course'?['admin','creative'].includes(x):key==='side'?['second','sell'].includes(x):x===key).length;
  const rows=requirementRows(request.needs,counts);return {...request,rows,done:rows.every(r=>r.done),paid:w.paid,locked:j.claimed.length<(request.unlock||0)};
}
export function chapterProgress(s,index=journeyOf(s).claimed.length){
  const chapter=CHAPTERS[index];if(!chapter)return null;
  const j=journeyOf(s),rows=requirementRows(chapter.needs,key=>key==='jobs'?j.jobs.length:key==='skills'?s.chars.flatMap(c=>c.xp).filter(x=>level(x)>=2).length:key==='furniture'?s.furniture.length:key==='cash'?s.cash:j[key]);
  return {...chapter,index,rows,done:rows.every(r=>r.done),claimed:j.claimed.includes(chapter.id),locked:index>j.claimed.length};
}
function grantReward(n,amount,text){
  n.cash+=amount;n.ledger.bonus+=amount;addLog(n,`${text}，奖励 +${amount}币。`);
  if(n.day===7){const r=n.reports.at(-1);if(r?.week===n.week){r.cash=n.cash;r.ledger=copy(n.ledger);}}
}
function settleRequest(n){
  const r=requestProgress(n);if(r?.done&&!r.paid){n.journey.weekly.paid=true;n.journey.commissions++;grantReward(n,r.reward,`交付「${r.title}」`);}
}
export function acceptRequest(s,id){
  const r=requestProgress(s,id);if(!r||r.locked)throw Error('先完成前两章，再接这份合作。');
  if(s.day>=6||journeyOf(s).weekly.request)throw Error('每周只接一份委托，下一周再选新的。');
  const n=copy(s);n.journey=copy(journeyOf(s));n.journey.weekly.request=id;settleRequest(n);addLog(n,`接下街坊委托「${r.title}」。`);return n;
}
export function claimChapter(s){
  const c=chapterProgress(s);if(!c||!c.done)throw Error('完成当前章的所有目标，就能领取纪念奖励。');
  const n=copy(s);n.journey=copy(journeyOf(s));n.journey.claimed.push(c.id);grantReward(n,c.reward,`获得生活印章「${c.stamp}」`);return n;
}
export function defaultPlan() {return Array.from({length:6},(_,d)=>d%2===0?['work','rest']:['rest','work']);}
export function fresh() {
  const s={version:1, week:1, day:0, cash:500, debt:0, job:'shop', chars:[
    {name:'阿闲', energy:100, mood:70, xp:[3,0]}, {name:'阿忙', energy:100, mood:70, xp:[0,3]}
  ],plan:[['work','admin'],['rest','work'],['work','second'],['creative','work'],['work','rest'],['second','work']],sunday:'walk', inventory:0, batches:0, second:0, furniture:[], ledger:blankLedger(),log:[], reports:[], memories:[], decisions:{}, adWeek:0, drawWeek:0, drawJob:null};
  s.ledger.start=500;
  return s;
}
export const jobOf = (s,d=Math.min(s.day,5)) => JOBS.find(j=>j.id===(s.shiftJobs?.[d]||s.job));
export const qualifies = (c,j) => level(c.xp[j.skill])>=j.level;
export function setWorker(s,d,person) {
  if(!Number.isInteger(d)||d<s.day||d>5||![0,1].includes(person))throw Error('已经完成的日程不能改动。');
  const n=copy(s), other=1-person;
  if(n.plan[d][person]!=='work') {
    if(!qualifies(n.chars[person],jobOf(n,d)))throw Error(`${n.chars[person].name}还需进修，暂时不能接${jobOf(n,d).name}。`);
    n.plan[d][other]=n.plan[d][person]; n.plan[d][person]='work';
  }
  return n;
}
export function setAction(s,d,person,action) {
  if(!Number.isInteger(d)||d<s.day||d>5||![0,1].includes(person)||!ACTIONS[action]||action==='work')throw Error('这项安排无法修改。');
  if(s.plan[d][person]==='work')throw Error('先换班，再安排空档。');
  const n=copy(s);n.plan[d][person]=action;return n;
}
export function selectJob(s,id) {
  const j=JOBS.find(j=>j.id===id);
  if(s.day!==0)throw Error('本周已经开工，下周再换合同。');
  if(!j||!s.chars.every(c=>qualifies(c,j)))throw Error('两人都达到技能门槛后才能一起接这个班。');
  const n=copy(s);n.job=id;n.shiftJobs=Array(6).fill(id);n.shiftSources=Array(6).fill('contract');return n;
}
export function shiftOffers(s,d){
  if(!Number.isInteger(d)||d<0||d>5)return [];
  const rotating=JOBS.filter(j=>j.id!=='shop');
  return [JOBS[0],rotating[(s.week+d-1)%5],rotating[(s.week+d+1)%5]];
}
export function claimShift(s,d,id,{fromDraw=false}={}){
  const job=JOBS.find(j=>j.id===id);
  if(!Number.isInteger(d)||d<s.day||d>5||!job)throw Error('这个班已经过去了，请选择剩下的日子。');
  if(fromDraw){
    if(s.drawWeek!==s.week||s.drawJob!==id||s.drawUsed)throw Error('先拆本周岗位盲盒，每份岗位只能分配一次。');
  }else if(!shiftOffers(s,d).some(j=>j.id===id))throw Error('这个岗位今天没有放班。');
  if(!qualifies(s.chars[s.plan[d].indexOf('work')],job))throw Error(`当班人还需${job.skill?'创作':'事务'}进修，达到${job.level}级再来抢这个班。`);
  const n=copy(s);
  n.shiftJobs=n.shiftJobs||Array(6).fill(n.job);n.shiftSources=n.shiftSources||Array(6).fill('contract');
  n.shiftJobs[d]=id;n.shiftSources[d]=fromDraw?'draw':'claim';if(fromDraw)n.drawUsed=true;
  addLog(n,`${DAYS[d]}抢到${job.name}，${n.chars[n.plan[d].indexOf('work')].name}去${JOB_DETAILS[id].place}。`);
  return n;
}
export function planCourse(s,skill){
  if(![0,1].includes(skill)||s.day>=6)throw Error('本周的课程排完了，下周继续。');
  const n=copy(s),action=skill?'creative':'admin';
  for(let d=s.day;d<6;d++){
    const free=1-n.plan[d].indexOf('work');n.plan[d][free]=action;
  }
  addLog(n,`剩下空档安排${skill?'创作':'事务'}短训，每节+3经验，不需要学历。`);return n;
}
function addLog(s,text) {s.log.unshift({week:s.week,day:s.day,text});s.log=s.log.slice(0,60);}
function xp(c,which,amount) {c.xp[which]=Math.min(18,c.xp[which]+amount);}
export function actionError(s,c,action) {
  const j=jobOf(s);
  if(action==='work') {
    if(!qualifies(c,j))return `${c.name}还没有达到岗位门槛。`;
    if(c.energy<25)return `${c.name}精力不足25，需要先休息或换班。`;
    if(c.mood<20)return `${c.name}心情低于20，需要先休息。`;
  }
  if(['admin','creative','prep'].includes(action)&&s.cash<40)return '生活账户不足40币，可以先改成休息。';
  if(action==='second') {
    if(s.cash<30)return '二手订单需要30币成本。';
    if(s.second>=2)return '本周两笔二手订单都完成了。';
  }
  if(['prep','sell'].includes(action)&&level(c.xp[1])<1)return `${c.name}需要创作1级才能做贴纸副业。`;
  if(action==='prep'&&(s.inventory>=1||s.batches>=1))return '已有库存或本周已经备过货，先安排摆摊。';
  if(action==='sell'&&!s.inventory)return '还没有贴纸库存，需要先备货。';
  return null;
}
function action(s,i,a) {
  const c=s.chars[i],error=actionError(s,c,a);if(error)throw Error(error);
  if(a==='work') {
    const pay=Math.floor(jobOf(s).wage*(c.mood<40?.9:1));
    s.cash+=pay;s.ledger.salary[i]+=pay;s.ledger.shifts[i]++;
    c.energy-=20;c.mood-=8;xp(c,jobOf(s).skill,1);
    addLog(s,`${c.name}在${jobDetail(s).place}完成${jobDetail(s).task}，${jobOf(s).name}工资 +${pay}币。`);
  } else if(a==='rest') {
    c.energy=clamp(c.energy+30);c.mood=clamp(c.mood+6);addLog(s,`${c.name}好好休息了一天。`);
  } else if(['admin','creative'].includes(a)) {
    s.cash-=40;s.ledger.training+=40;s.ledger.courses++;xp(c,a==='admin'?0:1,3);c.energy-=15;c.mood-=5;
    addLog(s,`${c.name}上了一节${a==='admin'?'事务':'创作'}课，经验 +3。`);
  } else {
    c.energy-=15;c.mood-=4;
    if(a==='second') {s.cash+=50;s.ledger.side+=80;s.ledger.stock+=30;s.second++;addLog(s,`${c.name}完成二手订单，净收入 +50币。`);}
    if(a==='prep') {s.cash-=40;s.ledger.stock+=40;s.inventory=1;s.batches++;addLog(s,`${c.name}备好一批贴纸，等待摆摊。`);}
    if(a==='sell') {s.cash+=140;s.ledger.side+=140;s.inventory=0;addLog(s,`${c.name}的小摊售罄，回款 +140币。`);}
  }
  c.energy=clamp(c.energy);c.mood=clamp(c.mood);
}
export function eventFor(s) {
  if(s.week===1||![2,4].includes(s.day)||s.decisions[`${s.week}-${s.day}`])return null;
  return EVENTS[((s.week-2)*2+(s.day===4?1:0))%EVENTS.length];
}
export function resolveEvent(s,index) {
  const e=eventFor(s);if(!e||![0,1].includes(index))throw Error('这个事件已经处理过了。');
  const n=copy(s),opt=e.options[index],worker=n.plan[n.day].indexOf('work');
  n.decisions[`${n.week}-${n.day}`]=opt.type;
  if(opt.type==='meeting'){xp(n.chars[worker],0,1);n.chars[worker].mood=clamp(n.chars[worker].mood-3);}
  if(opt.type==='sort'){xp(n.chars[worker],0,1);n.chars[worker].energy=clamp(n.chars[worker].energy-3);}
  if(opt.type==='sun')n.chars.forEach(c=>c.mood=clamp(c.mood+4));
  if(opt.type==='fruit')n.chars.forEach(c=>c.energy=clamp(c.energy+8));
  if(opt.type==='photo'){n.cash+=20;n.ledger.bonus+=20;}
  addLog(n,`${e.title}：${opt.name}。`);return n;
}
export function executeDay(s,expectedWeek=s.week,expectedDay=s.day,{forecast=false}={}) {
  if(s.week!==expectedWeek||s.day!==expectedDay||s.day>=7)throw Error('这一天已经结算，请查看新的日程。');
  if(eventFor(s)&&!forecast)throw Error('先回应今天的小事，再开始一天。');
  const n=copy(s);n.journey=copy(journeyOf(s));
  if(n.day<6) {
    const row=n.plan[n.day];
    if(row.filter(a=>a==='work').length!==1)throw Error('每个工作日恰好需要一人上班。');
    const worker=row.indexOf('work');
    // 工资先到账，再执行空档行动；整天失败时不提交任何变化。
    action(n,worker,'work');action(n,1-worker,row[1-worker]);
    n.journey.shifts++;n.journey.weekly.jobs.push(jobOf(s).id);n.journey.weekly.actions.push(row[1-worker]);
    if(!n.journey.jobs.includes(jobOf(s).id))n.journey.jobs.push(jobOf(s).id);
    if(['admin','creative'].includes(row[1-worker]))n.journey.courses++;
    if(['second','sell'].includes(row[1-worker]))n.journey.sideOrders++;
  } else {
    if(n.sunday==='picnic'&&n.cash<60)throw Error('野餐需要60币，散步和在家休息都免费。');
    if(n.sunday==='picnic'){n.cash-=60;n.ledger.life+=60;}
    const energy=n.sunday==='home'?50:40,mood=n.sunday==='picnic'?20:n.sunday==='home'?8:12;
    n.chars.forEach(c=>{c.energy=clamp(c.energy+energy);c.mood=clamp(c.mood+mood);});
    addLog(n,n.sunday==='home'?'周日，两个人在家慢慢过。':n.sunday==='picnic'?'周日，两人带着便当去野餐。':'周日，两个人一起散了很长的步。');
  }
  const furniture=n.furniture.map(id=>FURNITURE.find(f=>f.id===id));
  const extraEnergy=Math.min(6,furniture.reduce((v,f)=>v+f.energy,0)),extraMood=furniture.reduce((v,f)=>v+f.mood,0);
  n.chars.forEach(c=>{c.energy=clamp(c.energy+10+extraEnergy);c.mood=clamp(c.mood+2+extraMood);});
  const daily=dailyGoal(s);
  if(s.day===6||s.plan[s.day].includes(daily.action)){n.journey.weekly.daily.push(s.day);grantReward(n,daily.reward,`完成「${daily.title}」`);}
  settleRequest(n);
  n.day++;
  if(n.day===7) {
    const due=360+n.debt,paid=Math.min(n.cash,due),prior=Math.min(n.debt,Math.max(0,paid-360));
    n.cash-=paid;n.debt=due-paid;n.ledger.life+=Math.min(360,paid);n.ledger.recovery=prior;
    const balanced=n.ledger.shifts.every(x=>x===3),happy=n.chars.every(c=>c.mood>=50);
    const goal=goalFor(n),goalMet=goal.test(n);
    if(balanced&&happy)n.journey.balancedWeeks++;
    if(goalMet){n.journey.wishes++;grantReward(n,80,`完成周心愿「${goal.title}」`);}
    if(goalMet&&!n.memories.includes(goal.id))n.memories.push(goal.id);
    if(balanced&&happy&&!n.memories.includes('balance'))n.memories.push('balance');
    n.reports.push({week:n.week,job:n.job,jobs:[...new Set(n.shiftJobs||Array(6).fill(n.job))],ledger:copy(n.ledger),cash:n.cash,debt:n.debt,balanced,happy,goalMet,wishReward:goalMet?80:0,goal:goal.title,chars:copy(n.chars)});
    n.reports=n.reports.slice(-16);
    addLog(n,`本周生活费360币${n.debt?`，待缴${n.debt}币`:'已缴清'}。`);
  }
  return n;
}
export function forecast(s) {
  let n=copy(s);try{while(n.day<7)n=executeDay(n,n.week,n.day,{forecast:true});return {state:n,error:null};}
  catch(e){return {state:n,error:`${DAYS[n.day]}：${e.message}`};}
}
export function nextWeek(s) {
  if(s.day!==7)throw Error('先完成这一周。');
  const n=copy(s);n.journey=copy(journeyOf(s));n.journey.weekly=emptyWeek();n.week++;n.day=0;n.plan=defaultPlan();n.shiftJobs=Array(6).fill(n.job);n.shiftSources=Array(6).fill('contract');n.drawUsed=false;n.second=0;n.batches=0;n.decisions={};n.ledger=blankLedger();n.ledger.start=n.cash;
  addLog(n,`第${n.week}周开始，一张新日程。`);return n;
}
export function buy(s,id) {
  const f=FURNITURE.find(f=>f.id===id);
  if(!f||s.furniture.includes(id))throw Error('这件家具已经在家里了。');
  if(s.cash<f.cost)throw Error('生活账户还不够，先多攒一点。');
  if(s.day===7)throw Error('先进入新的一周，再添家具。');
  const spot=HOME_CHOICES[id].find(spot=>spotAvailable(s,id,spot));
  if(!spot)throw Error('家里的两个合适位置都占了，先挪一下其他家具。');
  const n=copy(s);n.cash-=f.cost;n.ledger.furniture+=f.cost;n.furniture.push(id);
  n.placements={...n.placements,[id]:spot};
  if(id==='plant')n.chars.forEach(c=>c.mood=clamp(c.mood+5));
  if(id==='shelf')n.chars.forEach(c=>{xp(c,0,1);xp(c,1,1);});
  addLog(n,`家里添了${f.name}。`);return n;
}
export function goalFor(s) {
  const goals=[
    {id:'first',title:'把一周过得刚刚好',description:'每人上3天班，周日一起散步，心情都达到50。',test:n=>n.ledger.shifts.every(v=>v===3)&&n.sunday==='walk'&&n.chars.every(c=>c.mood>=50)},
    {id:'learn',title:'给自己一点新本事',description:'一周内完成2次进修。',test:n=>n.ledger.courses>=2},
    {id:'side',title:'小生意，大开心',description:'副业毛收入达到140币。',test:n=>n.ledger.side>=140},
    {id:'home',title:'把出租屋过成家',description:'拥有至少1件新家具，两人心情达到50。',test:n=>n.furniture.length>0&&n.chars.every(c=>c.mood>=50)}
  ];return goals[(s.week-1)%4];
}
export function draw(s,random=Math.random()) {
  if(s.drawWeek===s.week)throw Error('这周的岗位信封已经拆过了。');
  if(s.day>=6)throw Error('这周已经没有工作日了，下周再拆盲盒。');
  const n=copy(s),eligible=JOBS.filter(j=>n.plan.slice(n.day).some(row=>qualifies(n.chars[row.indexOf('work')],j)));
  const different=eligible.filter(j=>j.id!==jobOf(n).id),pool=different.length?different:eligible;
  if(!Number.isFinite(random)||random<0||random>=1)throw Error('岗位抽取失败，请重新试试。');
  n.drawWeek=n.week;n.drawUsed=false;n.drawJob=pool[Math.floor(random*pool.length)].id;return n;
}
export function adReward(s) {
  if(s.adWeek===s.week)throw Error('本周体验券已经用过。');
  const n=copy(s);n.adWeek=n.week;n.chars.forEach(c=>c.energy=clamp(c.energy+20));addLog(n,'使用演示体验券，两人精力 +20。');return n;
}
export function validateSave(value) {
  try {
    const s=value;
    const integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
    if(!s||s.version!==1||!integer(s.week,1,100000)||!integer(s.day,0,7)||!integer(s.cash,0,1e9)||!integer(s.debt,0,1e9)||!JOBS.some(j=>j.id===s.job))return false;
    if(s.journey!==undefined){
      const j=s.journey,w=j?.weekly,unique=values=>Array.isArray(values)&&new Set(values).size===values.length;
      if(!j||!['shifts','courses','sideOrders','balancedWeeks','wishes','commissions'].every(k=>integer(j[k],0,1e6)))return false;
      if(!unique(j.jobs)||j.jobs.length>6||!j.jobs.every(id=>JOBS.some(x=>x.id===id)))return false;
      if(!unique(j.claimed)||j.claimed.length>4||!j.claimed.every((id,i)=>id===CHAPTERS[i].id))return false;
      if(!w||!Array.isArray(w.jobs)||w.jobs.length!==Math.min(s.day,6)||!w.jobs.every(id=>JOBS.some(x=>x.id===id))||!Array.isArray(w.actions)||w.actions.length!==w.jobs.length||!w.actions.every(a=>Object.hasOwn(ACTIONS,a)&&a!=='work'))return false;
      if(w.request!==null&&!REQUESTS.some(r=>r.id===w.request&&(r.unlock||0)<=j.claimed.length)||typeof w.paid!=='boolean'||w.paid&&w.request===null)return false;
      if(!unique(w.daily)||w.daily.length>7||!w.daily.every(d=>integer(d,0,6)&&d<s.day))return false;
    }
    if(s.shiftJobs!==undefined&&(!Array.isArray(s.shiftJobs)||s.shiftJobs.length!==6||!s.shiftJobs.every(id=>JOBS.some(j=>j.id===id))))return false;
    if(s.shiftSources!==undefined&&(!Array.isArray(s.shiftSources)||s.shiftSources.length!==6||!s.shiftSources.every(x=>['contract','claim','draw'].includes(x))))return false;
    if(s.drawUsed!==undefined&&typeof s.drawUsed!=='boolean')return false;
    if(s.reports?.some(r=>r.jobs!==undefined&&(!Array.isArray(r.jobs)||r.jobs.length>6||!r.jobs.every(id=>JOBS.some(j=>j.id===id)))))return false;
    if(s.reports?.some(r=>r.wishReward!==undefined&&![0,80].includes(r.wishReward)))return false;
    if(!Array.isArray(s.chars)||s.chars.length!==2||!s.chars.every(c=>typeof c.name==='string'&&c.name.length<20&&integer(c.energy,0,100)&&integer(c.mood,0,100)&&Array.isArray(c.xp)&&c.xp.length===2&&c.xp.every(x=>integer(x,0,18))))return false;
    if(!Array.isArray(s.plan)||s.plan.length!==6||!s.plan.every(row=>Array.isArray(row)&&row.length===2&&row.every(a=>Object.hasOwn(ACTIONS,a))&&row.filter(a=>a==='work').length===1))return false;
    if(!['walk','home','picnic'].includes(s.sunday)||!integer(s.inventory,0,1)||!integer(s.batches,0,1)||!integer(s.second,0,2))return false;
    if(!Array.isArray(s.furniture)||new Set(s.furniture).size!==s.furniture.length||!s.furniture.every(id=>FURNITURE.some(f=>f.id===id)))return false;
    if(s.placements!==undefined&&(!s.placements||typeof s.placements!=='object'||Array.isArray(s.placements)||!Object.entries(s.placements).every(([id,spot])=>s.furniture.includes(id)&&HOME_CHOICES[id]?.includes(spot))))return false;
    if(s.furniture.some(id=>!spotAvailable(s,id,placementOf(s,id))))return false;
    if(!s.ledger||!Object.keys(blankLedger()).every(k=>['salary','shifts'].includes(k)?Array.isArray(s.ledger[k])&&s.ledger[k].length===2&&s.ledger[k].every(v=>integer(v,0,1e9)):integer(s.ledger[k],0,1e9)))return false;
    if(!Array.isArray(s.reports)||s.reports.length>16||!s.reports.every(r=>integer(r.week,1,s.week)&&integer(r.cash,0,1e9)&&integer(r.debt,0,1e9)&&r.ledger&&['salary','shifts'].every(k=>Array.isArray(r.ledger[k])&&r.ledger[k].length===2&&r.ledger[k].every(v=>integer(v,0,1e9)))&&['side','bonus','training','stock','life','furniture','recovery'].every(k=>integer(r.ledger[k],0,1e9))))return false;
    if(!Array.isArray(s.log)||s.log.length>60||!s.log.every(l=>typeof l.text==='string'&&l.text.length<300&&integer(l.week,1,s.week)&&integer(l.day,0,7)))return false;
    if(!Array.isArray(s.memories)||s.memories.length>10||!s.memories.every(x=>['first','learn','side','home','balance'].includes(x)))return false;
    if(!s.decisions||typeof s.decisions!=='object'||Array.isArray(s.decisions)||Object.keys(s.decisions).length>2||!Object.entries(s.decisions).every(([k,v])=>[`${s.week}-2`,`${s.week}-4`].includes(k)&&['none','meeting','sun','photo','sort','fruit'].includes(v)))return false;
    if(!integer(s.adWeek,0,s.week)||!integer(s.drawWeek,0,s.week)||(s.drawJob!==null&&!JOBS.some(j=>j.id===s.drawJob)))return false;
    return true;
  }catch{return false;}
}
