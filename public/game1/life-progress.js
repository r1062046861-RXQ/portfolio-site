import {ROOMS,HOME_ITEMS,scaleAt} from './home-system.js?v=1.0.3-life39';

export const JOB_IDS=['shop','register','event','archive','layout','design'];
export const STAGES=[1,6,12];
export const WORK_RESULTS={
  shop:['价签贴好了，第一位客人也找到了零钱。','缺货清单记好了，下次补货不用再猜。','杯子换了位置，橱窗看起来清爽多了。','货物和账单对上了，招牌也擦亮了。','面包替邻居留好了，今天的收银顺利结束。','周末盘点完成，关门前又确认了一遍。'],
  register:['新住户的姓名和门牌核对好了。','预约名单理顺了，来访的表格也填好了。','重复的报名找出来了，名单更准确了。','咨询信息送到了对应窗口。','材料编了号，漏填的地方也标出来了。','这一周的登记核对完，资料归好了。'],
  event:['签到桌摆好了，音箱也试过了。','读书会的座位排好了，海报贴上了墙。','讲者接待妥当，流程也核对好了。','材料发到手，下一场的时间也提醒到了。','小展览布置好了，每件作品都有标签。','道具收好了，今天的反馈留了下来。'],
  archive:['旧档案按年份分好了，下次查找更方便。','旧照片扫描好了，也对上了姓名。','电子文件有了统一的名字。','借阅清单理顺了，缺页也查找过了。','最终版和草稿分开了，不会再拿错。','本周目录做好了，备份也留下了。'],
  layout:['社区简报的第一页排好了。','标题调整好了，图片也对齐了。','页码校对好了，装订边也留够了。','活动手册有了清楚的目录。','校样输出好了，细小的文字也检查过了。','印刷文件交付了，源稿好好收了起来。'],
  design:['今日菜单画好了，小店多了一点颜色。','活动照片排成了一页推送。','邻居的小摊有了清楚的价目牌。','通知配好了插图，读起来更明白。','海报改好了，喜欢的颜色留下了。','一周作品整理好了，下次有模板可用。']
};
export const KEEPSAKES=[
  {id:'first',name:'双人相框',kind:'wall',line:'一周轮着上班，留下两个人的合照。'},
  {id:'learn',name:'学习软木板',kind:'wall',line:'把新本事和小作品，钉在每天看得见的地方。'},
  {id:'side',name:'手作桌旗',kind:'table',line:'亲手赚来的小开心，铺在日常的桌面上。'},
  {id:'home',name:'拼布地垫',kind:'floor',line:'一小块柔软，让出租屋更像家。'}
];
export const TABLE_HOSTS={table:{x:.50,y:.43,w:.36},balcony:{x:.50,y:.43,w:.36},desk:{x:.51,y:.40,w:.36},workbench:{x:.64,y:.40,w:.22}};
// Authored wall surfaces avoid the five rooms' windows, doors and fixed cabinets.
export const WALL_AREAS={living:[[.16,.22,.30,.38],[.79,.84,.43,.47]],bedroom:[[.46,.64,.38,.45]],kitchen:[[.22,.39,.33,.36]],study:[[.16,.21,.38,.46],[.76,.84,.43,.48]],balcony:[[.26,.73,.44,.48]]};
export const keepsakeOf=id=>KEEPSAKES.find(k=>k.id===id);
const emptyWork=()=>({counts:Object.fromEntries(JOB_IDS.map(id=>[id,0])),entries:[]});
export const freshLife=()=>({version:1,legacy:false,fromWeek:1,rewardFromWeek:1,work:[emptyWork(),emptyWork()],keepsakes:{}});

export function recordWork(s,person,job,day){
  const w=s.life.work[person],last=w.entries.at(-1);
  if(last&&last.week===s.week&&last.day>=day)return;
  w.counts[job]++;w.entries.push({week:s.week,day,job});w.entries=w.entries.slice(-96);
}
export function migrateLife(s,jobAt){
  if(s.life!==undefined)return s;
  s.life=freshLife();s.life.legacy=true;s.life.fromWeek=s.week;
  // A started week is not a complete week under the new reward rules.
  s.life.rewardFromWeek=s.day===0?s.week:s.week+1;
  const completed=Math.min(s.day,6),workers=[0,0];
  for(let d=0;d<completed;d++)workers[s.plan[d].indexOf('work')]++;
  if(workers.every((v,i)=>v===s.ledger.shifts[i]))for(let d=0;d<completed;d++)recordWork(s,s.plan[d].indexOf('work'),s.journey?.weekly.jobs[d]||jobAt(s,d).id,d);
  return s;
}
export function grantKeepsake(s,id){
  if(s.week<s.life.rewardFromWeek||s.life.keepsakes[id])return null;
  s.life.keepsakes[id]={week:s.week,place:null};return id;
}
export function keepsakePosition(s,id){
  const p=s.life?.keepsakes[id]?.place;
  if(!p)return null;
  if(p.host){const host=s.home.positions[p.host];return host?.room?{...host,host:p.host}:null;}
  return p;
}
export function validKeepsakePlace(s,id,p){
  const k=keepsakeOf(id);
  if(!k||!s.life?.keepsakes[id]||!p||typeof p!=='object'||Array.isArray(p))return false;
  if(k.kind==='table')return Object.keys(p).length===1&&typeof p.host==='string'&&Object.hasOwn(TABLE_HOSTS,p.host)&&s.home.unlocked.includes(s.home.positions[p.host]?.room);
  if(Object.keys(p).length!==3||!s.home.unlocked.includes(p.room)||![p.x,p.y].every(Number.isFinite))return false;
  if(k.kind==='floor')return p.x>=.22&&p.x<=.78&&p.y>=.65&&p.y<=.91;
  if(!WALL_AREAS[p.room]?.some(([x0,x1,y0,y1])=>p.x>=x0&&p.x<=x1&&p.y>=y0&&p.y<=y1))return false;
  return !KEEPSAKES.some(other=>other.id!==id&&other.kind==='wall'&&s.life.keepsakes[other.id]?.place?.room===p.room&&Math.abs(s.life.keepsakes[other.id].place.x-p.x)<.14&&Math.abs(s.life.keepsakes[other.id].place.y-p.y)<.075);
}
export function moveKeepsake(s,id,p){
  if(!validKeepsakePlace(s,id,p))throw Error(keepsakeOf(id)?.kind==='table'?'先在房间里摆一张餐桌、小餐桌、书桌或手作台。':'这里放不下，换一处合适的墙面或地面吧。');
  const n=structuredClone(s);n.life.keepsakes[id].place=structuredClone(p);return n;
}
export function storeKeepsake(s,id){
  if(!s.life?.keepsakes[id])throw Error('完成对应的每周计划后就能收藏。');
  const n=structuredClone(s);n.life.keepsakes[id].place=null;return n;
}
export function keepsakeBox(s,id,meta){
  const p=keepsakePosition(s,id),k=keepsakeOf(id);if(!p)return null;
  if(k.kind==='table'){
    const item=HOME_ITEMS.find(i=>i.id===p.host),surface=TABLE_HOSTS[p.host],w=item.w*scaleAt(p.y),h=w*meta[item.asset].ratio*2/3;
    return {room:p.room,x:p.x+(surface.x-.5)*w,y:p.y-(1-surface.y)*h,width:w*surface.w,z:Math.round(p.y*500)+1};
  }
  return {...p,width:k.kind==='floor'?.39*scaleAt(p.y):.12,z:k.kind==='floor'?0:1};
}
export function defaultKeepsakePlace(s,id,room=s.home.room){
  if(keepsakeOf(id).kind==='table'){
    const host=Object.keys(TABLE_HOSTS).find(id=>s.home.positions[id]?.room===room);return host?{host}:null;
  }
  if(keepsakeOf(id).kind==='wall'){
    for(const [x0,x1,y0,y1] of WALL_AREAS[room]||[])for(const x of [x1-x0<.14?(x0+x1)/2:x0+.005,x1-.005,(x0+x1)/2]){
      const p={room,x,y:(y0+y1)/2};if(validKeepsakePlace(s,id,p))return p;
    }
  }else{const p={room,x:.5,y:.90};if(validKeepsakePlace(s,id,p))return p;}
  return null;
}
export function validateLife(s){
  const l=s.life,integer=(n,min,max)=>Number.isInteger(n)&&n>=min&&n<=max;
  if(!l||l.version!==1||typeof l.legacy!=='boolean'||!integer(l.fromWeek,1,s.week)||!integer(l.rewardFromWeek,1,s.week+1)||!Array.isArray(l.work)||l.work.length!==2||!l.keepsakes||typeof l.keepsakes!=='object'||Array.isArray(l.keepsakes))return false;
  const seen=new Set();
  for(const work of l.work){
    if(!work?.counts||Object.keys(work.counts).length!==6||!JOB_IDS.every(id=>integer(work.counts[id],0,600000))||!Array.isArray(work.entries)||work.entries.length>96)return false;
    let last=0;const counts=Object.fromEntries(JOB_IDS.map(id=>[id,0]));
    for(const e of work.entries){
      if(!e||Object.keys(e).length!==3||!integer(e.week,l.fromWeek,s.week)||!integer(e.day,0,5)||!JOB_IDS.includes(e.job)||(e.week===s.week&&e.day>=s.day))return false;
      const order=(e.week-1)*6+e.day+1;if(order<=last||seen.has(order))return false;last=order;seen.add(order);counts[e.job]++;
    }
    if(!JOB_IDS.every(id=>work.counts[id]>=counts[id])||Object.values(work.counts).reduce((a,b)=>a+b,0)>(s.week-1)*6+Math.min(s.day,6))return false;
  }
  return Object.entries(l.keepsakes).every(([id,k])=>keepsakeOf(id)&&k&&Object.keys(k).length===2&&integer(k.week,l.rewardFromWeek,s.week)&&((k.week-1)%4===KEEPSAKES.findIndex(x=>x.id===id))&&(k.week<s.week||s.day===7)&&(k.place===null||validKeepsakePlace(s,id,k.place)));
}
