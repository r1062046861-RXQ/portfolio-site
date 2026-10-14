import {ROOMS,ITEMS,canPlace,scaleAt,footprint} from './home-space.js';
export {scaleAt,ROOMS};
export const HOME_ITEMS=ITEMS.map(item=>({...item,asset:item.id,id:item.id==='bistro'?'balcony':item.id}));
export const itemOf=id=>HOME_ITEMS.find(item=>item.id===id);
const assetId=id=>itemOf(id)?.asset||id;
const translated=positions=>Object.fromEntries(Object.entries(positions).map(([id,p])=>[assetId(id),p]));
export const validPlacement=(id,p,positions)=>canPlace(assetId(id),p,translated(positions));
export const floorFootprint=(id,p)=>footprint(assetId(id),p);
export const DEFAULT_CLOTHES=()=>({top:0,bottom:0,accessory:0});
export const EMPTY_COUNTS=()=>({work:0,rest:0,course:0,outing:0});
export const CLOTHES={
  top:[['原外套','shirt',null,0],['便装','shirt',null,0],['西服上衣','briefcase-business','work',12],['居家上衣','coffee','rest',6],['运动上衣','footprints','outing',4],['海盐条纹','coffee','rest',6,3],['小格日常','coffee','rest',6,3],['软软针织','coffee','rest',6,3],['叶子便装','shirt',null,0,1],['棉麻便装','shirt',null,0,1],['细纹西服','briefcase-business','work',12,2]],
  bottom:[['基础下装','shirt',null,0],['西裤','briefcase-business','work',12],['运动下装','footprints','outing',4],['靛蓝牛仔','shirt',null,0,0],['暖绒长裤','shirt',null,0,0],['棉麻长裤','footprints','outing',4,2],['人字纹西裤','briefcase-business','work',12,1]],
  accessory:[['原配饰','glasses',null,0],['领结','briefcase-business','work',12],['运动帽','footprints','outing',4],['手作围裙','scissors','course',4]]
};
export const clothingTemplate=(part,index)=>CLOTHES[part]?.[index]?.[4]??index;
export const COUNT_LABELS={work:'上班',rest:'好好休息',course:'短训',outing:'周日散步或野餐'};
let adminMode=false;
export const setAdminMode=value=>{adminMode=value===true;};
export const isAdminSave=s=>adminMode&&s.home?.test===true;
export const garmentUnlocked=(c,part,index)=>{const g=CLOTHES[part]?.[index];return !!g&&(adminMode||!g[2]||c.counts[g[2]]>=g[3]);};
export const ROOM_RULES=[
  {id:'living',name:'客厅',icon:'armchair',key:null,target:0},
  {id:'bedroom',name:'卧室',icon:'bed-double',key:'shifts',target:6},
  {id:'kitchen',name:'厨房',icon:'cooking-pot',key:'shifts',target:12},
  {id:'study',name:'书房',icon:'book-open',key:'courses',target:6},
  {id:'balcony',name:'阳台',icon:'sun',key:'balancedWeeks',target:2}
];
export function roomProgress(s){
  let previous=true;
  return ROOM_RULES.map(r=>{
    const value=r.key?s.journey?.[r.key]||0:0,earned=isAdminSave(s)||(previous&&value>=r.target);
    const result={...r,value,earned,previous};previous=earned;return result;
  });
}
export function refreshRooms(s){
  s.home.unlocked=roomProgress(s).filter(r=>r.earned).map(r=>r.id);
  if(!s.home.unlocked.includes(s.home.room))s.home.room='living';return s;
}
export function findSlot(id,room,positions,preferred={x:.5,y:.74}){
  const candidates=[preferred];
  for(let y=.54;y<=.93;y+=.025)for(let x=.10;x<=.91;x+=.025)candidates.push({x,y});
  candidates.sort((a,b)=>(a.x-preferred.x)**2+(a.y-preferred.y)**2-((b.x-preferred.x)**2+(b.y-preferred.y)**2));
  return candidates.map(p=>({...p,room})).find(p=>validPlacement(id,p,positions))||null;
}
export function migrateHome(s,spots,choices){
  for(let i=0;i<2;i++){
    const c=s.chars[i];if(c.name===['阿闲','阿忙'][i])c.name=['小满','小夏'][i];
    c.counts=EMPTY_COUNTS();c.clothes=DEFAULT_CLOTHES();
  }
  const seen=new Set();
  for(const r of s.reports){
    if(r.week>=s.week||seen.has(r.week))continue;seen.add(r.week);
    for(let i=0;i<2;i++)s.chars[i].counts.work+=r.ledger.shifts[i];
  }
  for(let i=0;i<2;i++){
    const c=s.chars[i];c.counts.work+=s.ledger.shifts[i];
    for(let d=0;d<Math.min(s.day,6);d++){
      const a=s.plan[d][i];if(a==='rest')c.counts.rest++;
      if(['admin','creative'].includes(a))c.counts.course++;
    }
    if(s.day===7&&s.sunday!=='home')c.counts.outing++;
  }
  s.home={room:'living',unlocked:['living'],positions:{},actorPositions:{},legacyStats:true,fromWeek:Math.min(s.week,...seen)};
  for(const id of s.furniture){
    const spot=spots[s.placements?.[id]||choices[id]?.[0]];
    const preferred=spot?{x:(spot.x+spot.width/2)/100,y:1-spot.bottom/100}:{x:.5,y:.74};
    s.home.positions[id]=findSlot(id,'living',s.home.positions,preferred)||{room:null,...preferred};
  }
  return refreshRooms(s);
}
const segments=new Intl.Segmenter('zh',{granularity:'grapheme'});
export const visibleLength=name=>[...segments.segment(name)].length;
export function renameCharacter(s,index,name){
  if(![0,1].includes(index)||typeof name!=='string'||/[\s\p{Cc}\p{Cf}]/u.test(name.replace(/\u200d/g,''))||visibleLength(name)<1||visibleLength(name)>6)throw Error('名字请用1–6个可见字符，不包含空白。');
  if(s.chars[1-index].name===name)throw Error('两位室友需要不同的名字。');
  const n=structuredClone(s);n.chars[index].name=name;return n;
}
export function equipClothes(s,index,outfit){
  if(![0,1].includes(index)||!outfit||Object.keys(outfit).length!==3||!Object.keys(CLOTHES).every(p=>Number.isInteger(outfit[p])&&garmentUnlocked(s.chars[index],p,outfit[p])))throw Error('还有未解锁的服饰，请换成已拥有的搭配。');
  const n=structuredClone(s);n.chars[index].clothes={...outfit};return n;
}
export function setRoom(s,room){
  if(!s.home.unlocked.includes(room))throw Error('完成小家的目标后，这间屋子会免费开放。');
  const n=structuredClone(s);n.home.room=room;return n;
}
export function moveHomeFurniture(s,id,p){
  if(!s.furniture.includes(id)||!p||!s.home.unlocked.includes(p.room)||!validPlacement(id,p,s.home.positions))throw Error('这里放不下，留出门口与家具之间的空隙。');
  const n=structuredClone(s);n.home.positions[id]={room:p.room,x:p.x,y:p.y};return n;
}
export function storeHomeFurniture(s,id){
  if(!s.furniture.includes(id))throw Error('请先拥有这件家具。');
  const n=structuredClone(s);n.home.positions[id].room=null;return n;
}
export function actorPointInBounds(index,p){
  if(![0,1].includes(index)||!p||![p.x,p.y].every(Number.isFinite)||p.y<.50||p.y>.97)return false;
  const width=(index===1?.35:.28)*scaleAt(p.y)/((453/(index===1?227:294))*2/3);
  return p.x>=width*(index===1?.49:.43)+.01&&p.x<=.99-width*(index===1?.50:.48);
}
export function validActorPoint(s,index,p){
  if(!actorPointInBounds(index,p))return false;
  if(HOME_ITEMS.some(item=>{const spot=s.home.positions[item.id];if(spot?.room!==s.home.room)return false;const f=floorFootprint(item.id,spot);return Math.abs(p.x-f.x)<f.w/2+.035&&p.y>f.y-f.depth-.015&&p.y<f.y+.015;}))return false;
  const other=s.home.actorPositions?.[s.home.room]?.[1-index];
  return !other||Math.abs(p.x-other.x)>=.12||Math.abs(p.y-other.y)>=.08;
}
export function moveHomeActor(s,index,p){
  if(!validActorPoint(s,index,p))throw Error('这里站不下，已放回原位置。');
  const n=structuredClone(s);n.home.actorPositions??={};n.home.actorPositions[n.home.room]??=[null,null];
  n.home.actorPositions[n.home.room][index]={x:p.x,y:p.y};return n;
}
export function validateHome(s){
  const h=s.home,integer=n=>Number.isInteger(n)&&n>=0&&n<=1e6;
  if(h&&Object.hasOwn(h,'test')&&!isAdminSave(s))return false;
  if(!h||!ROOMS.some(r=>r.id===h.room)||!Array.isArray(h.unlocked)||JSON.stringify(h.unlocked)!==JSON.stringify(roomProgress(s).filter(r=>r.earned).map(r=>r.id))||!h.unlocked.includes(h.room)||typeof h.legacyStats!=='boolean'||!integer(h.fromWeek)||h.fromWeek<1||h.fromWeek>s.week)return false;
  if(h.actorPositions!==undefined){
    if(!h.actorPositions||Array.isArray(h.actorPositions)||typeof h.actorPositions!=='object')return false;
    if(!Object.entries(h.actorPositions).every(([room,points])=>h.unlocked.includes(room)&&Array.isArray(points)&&points.length===2&&points.every((p,index)=>p===null||(p&&Object.keys(p).length===2&&actorPointInBounds(index,p)))))return false;
  }
  if(!h.positions||Array.isArray(h.positions)||Object.keys(h.positions).length!==s.furniture.length||!s.furniture.every(id=>{
    const p=h.positions[id];return p&&Object.keys(p).length===3&&[p.x,p.y].every(Number.isFinite)&&p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1&&(p.room===null||(h.unlocked.includes(p.room)&&validPlacement(id,p,h.positions)));
  }))return false;
  return s.chars.every(c=>c.counts&&Object.keys(c.counts).length===4&&['work','rest','course','outing'].every(k=>integer(c.counts[k]))&&c.clothes&&Object.keys(c.clothes).length===3&&Object.keys(CLOTHES).every(part=>Number.isInteger(c.clothes[part])&&garmentUnlocked(c,part,c.clothes[part])));
}
export function createAdminSave(source){
  const s=structuredClone(source);s.home.test=true;s.home.room='living';
  s.furniture=HOME_ITEMS.map(item=>item.id);s.placements={};s.home.positions={};
  refreshRooms(s);
  for(const item of HOME_ITEMS){
    s.home.positions[item.id]={room:null,x:.5,y:.76};
  }
  s.home.storageDefault=1;
  return s;
}
