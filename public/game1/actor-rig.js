import {clothingTemplate} from './home-system.js?v=1.0.3-life39';

// These are the verified rig-v9 silhouettes. Keep their canvas/anchors stable.
export const POSES=['stand','sit','read','sip','craft','cook','fold','stretch','rest','water','exercise','type','sew','standing-read','standing-sip','groom'];
const SEATED=new Set(['sit','read','sip','craft','sew','type','rest','exercise']);
export const ACTION_POSES={read:'standing-read',sit:'sit',light:'stand',cup:'sip',tea:'sip',watch:'sit',music:'stretch',fold:'fold',groom:'groom',cook:'cook',wash:'fold',heat:'cook',toast:'cook',craft:'craft',sew:'sew',type:'type',print:'standing-read',rest:'rest',water:'water',care:'water',exercise:'exercise'};

export function poseRig(who,pose,meta){
  if(!['cat','fox'].includes(who)||!POSES.includes(pose))throw Error('未知角色动作。');
  const image=meta[`${who}-${pose}`];
  if(!image)throw Error('角色动作资料缺失。');
  return {
    width:image.width,height:image.height,ratio:image.ratio,
    scale:(who==='cat'?.28:.35)*(SEATED.has(pose)?.88:pose==='stretch'?1.18:1),
    anchors:{feet:[.5,1],neck:image.neck,
      seat:[who==='cat'?(['sit','read'].includes(pose)?.60:.50):.44,pose==='exercise'?.60:who==='cat'?.72:.70],
      waterSpout:image.waterSpout}
  };
}

// One ordered recipe for the game, wardrobe and regression matrix.
// Legacy body/front files group tail/hands/held props; never recolour these masks.
export function outfitLayers(who,pose,outfit,prop=null){
  if(!['cat','fox'].includes(who)||!POSES.includes(pose))throw Error('未知角色动作。');
  const accessory=outfit.accessory===2?0:outfit.accessory;
  const prefix=`assets/home/rig-v9/${who}-${pose}`;
  const home=clothingTemplate('top',outfit.top)===3;
  const layer=(role,name)=>({role,src:`${prefix}-${name}.webp`});
  const front=layer('front-hands-and-props',home?'home-front':accessory===3?'apron-front':'front');
  const extra=layer('accessory',`accessory-${accessory}`);
  return [layer('body-and-tail',home?'home-body':'body'),
    layer('bottom',`${home?'home-bottom':'bottom'}-${outfit.bottom}`),
    layer('top',`top-${outfit.top}`),
    ...(accessory===3?[extra,front]:[front,extra]),
    ...(prop==='book'?[layer('held-book','book')]:prop==='paper'&&who==='cat'?[layer('held-paper','paper')]:[])];
}
