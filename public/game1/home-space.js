import {EXTRA_ITEMS} from './home-extras.js';
export const ROOMS=[
  {id:'bedroom',name:'卧室',west:null,east:'living'},
  {id:'living',name:'客厅',west:'bedroom',east:'kitchen'},
  {id:'kitchen',name:'厨房',west:'living',east:'study'},
  {id:'study',name:'书房',west:'kitchen',east:'balcony'},
  {id:'balcony',name:'阳台',west:'study',east:null}
];
export const ITEMS=[
  {id:'sofa',name:'软沙发',w:.58,depth:.08,room:'living',x:.40,y:.79,seats:[[.32,.66],[.68,.66]],interaction:'sit'},
  {id:'bed',name:'床',w:.50,depth:.11,room:'bedroom',x:.49,y:.84,seats:[[.38,.84],[.66,.84]],interaction:'sit'},
  {id:'shelf',name:'书柜',w:.25,depth:.04,room:'living',x:.75,y:.68,interaction:'read'},
  {id:'desk',name:'书桌',w:.48,depth:.06,room:'study',x:.48,y:.79,seats:[[.50,.42]],interaction:'read'},
  {id:'table',name:'餐桌',w:.48,depth:.07,room:'kitchen',x:.42,y:.79,seats:[[.30,.40],[.69,.40]],interaction:'sit'},
  {id:'lounger',name:'躺椅',w:.40,depth:.09,room:'balcony',x:.37,y:.80,seats:[[.50,.47]],interaction:'sit'},
  {id:'plant',name:'绿植',w:.17,depth:.035,room:'living',x:.77,y:.89,interaction:'care'},
  {id:'lamp',name:'落地灯',w:.14,depth:.035,room:'living',x:.56,y:.91,interaction:'light'},
  {id:'coffee',name:'咖啡机',w:.26,depth:.04,room:'kitchen',x:.76,y:.72,interaction:'cup'},
  {id:'bistro',name:'阳台小餐桌',w:.30,depth:.055,room:'balcony',x:.73,y:.69,seats:[[.50,.41]],interaction:'sit'}
].concat(EXTRA_ITEMS);
export const scaleAt=y=>.76+.28*(y-.5)/.46;
export function initialPositions(){
  const positions=Object.fromEntries(ITEMS.map(item=>[item.id,{room:item.x===undefined?null:item.room,x:item.x??.5,y:item.y??.76}]));
  positions.plant.room=null;
  for(const [id,x,y] of [['tv',.38,.67],['record',.75,.80],['wardrobe',.68,.65],['dresser',.25,.66],['nightstand',.78,.88],['fridge',.70,.65],['microwave',.25,.67],['computer',.68,.67],['printer',.24,.90],['potting',.70,.90],['drying',.70,.79]]){
    const item=ITEMS.find(i=>i.id===id),p={room:item.room,x,y};
    if(canPlace(id,p,positions))positions[id]=p;
  }
  return positions;
}
export function footprint(id,position){
  const item=ITEMS.find(item=>item.id===id),scale=scaleAt(position.y);
  return{x:position.x,y:position.y,w:item.w*scale*.82,depth:item.depth*scale};
}
export function canPlace(id,p,positions){
  const item=ITEMS.find(item=>item.id===id),current=ROOMS.find(room=>room.id===p.room);
  if(!item||!current||![p.x,p.y].every(Number.isFinite))return false;
  const a=footprint(id,p),back=a.y-a.depth;
  const edge=.10-.08*Math.min(1,Math.max(0,(back-.48)/.15));
  const visualHalf=item.w*scaleAt(p.y)/2;
  if(a.x-a.w/2<edge||a.x+a.w/2>1-edge||back<.48||a.y>.94||p.x-visualHalf<.01||p.x+visualHalf>.99)return false;
  if(back<.63&&((current.west&&a.x-a.w/2<.14)||(current.east&&a.x+a.w/2>.86)))return false;
  return !Object.entries(positions).some(([other,bp])=>{
    if(other===id||bp.room!==p.room)return false;
    const b=footprint(other,bp);
    return Math.abs(a.x-b.x)<(a.w+b.w)/2+.007&&a.y-a.depth<b.y+.007&&b.y-b.depth<a.y+.007;
  });
}
export function restorePositions(raw){
  const fallback=initialPositions();
  try{
    const p=JSON.parse(raw);
    if(!p||Object.keys(p).length!==ITEMS.length||!ITEMS.every(item=>{
      const position=p[item.id];
      return position&&[position.x,position.y].every(Number.isFinite)&&(position.room===null||canPlace(item.id,position,p));
    }))return fallback;
    return p;
  }catch{return fallback;}
}
