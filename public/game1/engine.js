export const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
export const JOBS = [
  {id:'shop', name:'小店值班员', wage:100, skill:0, level:0, icon:'store', line:'最后一位客人，总在最后一分钟出现。'},
  {id:'register', name:'资料登记员', wage:110, skill:0, level:1, icon:'clipboard-list', line:'今天的任务：把表格里的表格填完。'},
  {id:'event', name:'活动助理', wage:120, skill:1, level:1, icon:'flag', line:'横幅改了三次，活动时间没改。'},
  {id:'archive', name:'文档整理员', wage:130, skill:0, level:2, icon:'folder-open', line:'文件名：最终版_真的最终版。'},
  {id:'layout', name:'排版助理', wage:140, skill:0, level:2, icon:'panels-top-left', line:'要显眼一点，也要低调一点。'},
  {id:'design', name:'图文助理', wage:150, skill:1, level:2, icon:'palette', line:'一句话的文案，开了半天的会。'}
];
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
export function defaultPlan() {return Array.from({length:6},(_,d)=>d%2===0?['work','rest']:['rest','work']);}
export function fresh() {
  const s={version:1, week:1, day:0, cash:500, debt:0, job:'shop', chars:[
    {name:'阿闲', energy:100, mood:70, xp:[3,0]}, {name:'阿忙', energy:100, mood:70, xp:[0,3]}
  ],plan:[['work','admin'],['rest','work'],['work','second'],['creative','work'],['work','rest'],['second','work']],sunday:'walk', inventory:0, batches:0, second:0, furniture:[], ledger:blankLedger(),log:[], reports:[], memories:[], decisions:{}, adWeek:0, drawWeek:0, drawJob:null};
  s.ledger.start=500;
  return s;
}
export const jobOf = s => JOBS.find(j=>j.id===s.job);
export const qualifies = (c,j) => level(c.xp[j.skill])>=j.level;
export function setWorker(s,d,person) {
  if(!Number.isInteger(d)||d<s.day||d>5||![0,1].includes(person))throw Error('已经完成的日程不能改动。');
  const n=copy(s), other=1-person;
  if(n.plan[d][person]!=='work') {
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
  const n=copy(s);n.job=id;return n;
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
    addLog(s,`${c.name}完成${jobOf(s).name}，工资 +${pay}币。`);
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
  const n=copy(s),messages=[];
  if(n.day<6) {
    const row=n.plan[n.day];
    if(row.filter(a=>a==='work').length!==1)throw Error('每个工作日恰好需要一人上班。');
    const worker=row.indexOf('work');
    // 工资先到账，再执行空档行动；整天失败时不提交任何变化。
    action(n,worker,'work');action(n,1-worker,row[1-worker]);
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
  n.day++;
  if(n.day===7) {
    const due=360+n.debt,paid=Math.min(n.cash,due),prior=Math.min(n.debt,Math.max(0,paid-360));
    n.cash-=paid;n.debt=due-paid;n.ledger.life+=Math.min(360,paid);n.ledger.recovery=prior;
    const balanced=n.ledger.shifts.every(x=>x===3),happy=n.chars.every(c=>c.mood>=50);
    const goal=goalFor(n),goalMet=goal.test(n);
    if(goalMet&&!n.memories.includes(goal.id))n.memories.push(goal.id);
    if(balanced&&happy&&!n.memories.includes('balance'))n.memories.push('balance');
    n.reports.push({week:n.week,job:n.job,ledger:copy(n.ledger),cash:n.cash,debt:n.debt,balanced,happy,goalMet,goal:goal.title,chars:copy(n.chars)});
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
  const n=copy(s);n.week++;n.day=0;n.plan=defaultPlan();n.second=0;n.batches=0;n.decisions={};n.ledger=blankLedger();n.ledger.start=n.cash;
  addLog(n,`第${n.week}周开始，一张新日程。`);return n;
}
export function buy(s,id) {
  const f=FURNITURE.find(f=>f.id===id);
  if(!f||s.furniture.includes(id))throw Error('这件家具已经在家里了。');
  if(s.cash<f.cost)throw Error('生活账户还不够，先多攒一点。');
  if(s.day===7)throw Error('先进入新的一周，再添家具。');
  const n=copy(s);n.cash-=f.cost;n.ledger.furniture+=f.cost;n.furniture.push(id);
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
export function draw(s) {
  if(s.drawWeek===s.week)throw Error('这周的岗位信封已经拆过了。');
  const n=copy(s),eligible=JOBS.filter(j=>n.chars.every(c=>qualifies(c,j)));
  n.drawWeek=n.week;n.drawJob=eligible[(n.week*7+n.cash)%eligible.length].id;return n;
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
    if(!Array.isArray(s.chars)||s.chars.length!==2||!s.chars.every(c=>typeof c.name==='string'&&c.name.length<20&&integer(c.energy,0,100)&&integer(c.mood,0,100)&&Array.isArray(c.xp)&&c.xp.length===2&&c.xp.every(x=>integer(x,0,18))))return false;
    if(!Array.isArray(s.plan)||s.plan.length!==6||!s.plan.every(row=>Array.isArray(row)&&row.length===2&&row.every(a=>Object.hasOwn(ACTIONS,a))&&row.filter(a=>a==='work').length===1))return false;
    if(!['walk','home','picnic'].includes(s.sunday)||!integer(s.inventory,0,1)||!integer(s.batches,0,1)||!integer(s.second,0,2))return false;
    if(!Array.isArray(s.furniture)||new Set(s.furniture).size!==s.furniture.length||!s.furniture.every(id=>FURNITURE.some(f=>f.id===id)))return false;
    if(!s.ledger||!Object.keys(blankLedger()).every(k=>['salary','shifts'].includes(k)?Array.isArray(s.ledger[k])&&s.ledger[k].length===2&&s.ledger[k].every(v=>integer(v,0,1e9)):integer(s.ledger[k],0,1e9)))return false;
    if(!Array.isArray(s.reports)||s.reports.length>16||!s.reports.every(r=>integer(r.week,1,s.week)&&integer(r.cash,0,1e9)&&integer(r.debt,0,1e9)&&r.ledger&&['salary','shifts'].every(k=>Array.isArray(r.ledger[k])&&r.ledger[k].length===2&&r.ledger[k].every(v=>integer(v,0,1e9)))&&['side','bonus','training','stock','life','furniture','recovery'].every(k=>integer(r.ledger[k],0,1e9))))return false;
    if(!Array.isArray(s.log)||s.log.length>60||!s.log.every(l=>typeof l.text==='string'&&l.text.length<300&&integer(l.week,1,s.week)&&integer(l.day,0,7)))return false;
    if(!Array.isArray(s.memories)||s.memories.length>10||!s.memories.every(x=>['first','learn','side','home','balance'].includes(x)))return false;
    if(!s.decisions||typeof s.decisions!=='object'||Array.isArray(s.decisions)||Object.keys(s.decisions).length>2||!Object.entries(s.decisions).every(([k,v])=>[`${s.week}-2`,`${s.week}-4`].includes(k)&&['none','meeting','sun','photo','sort','fruit'].includes(v)))return false;
    if(!integer(s.adWeek,0,s.week)||!integer(s.drawWeek,0,s.week)||(s.drawJob!==null&&!JOBS.some(j=>j.id===s.drawJob)))return false;
    return true;
  }catch{return false;}
}
