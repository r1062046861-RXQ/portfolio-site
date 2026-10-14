import {clothingTemplate} from './home-system.js?v=home-v10';
const images=new Map(),composites=new Map(),pending=new Map();
function warm(files){navigator.serviceWorker?.controller?.postMessage({type:'warm-home',files});}
const load=src=>{
  if(!images.has(src))images.set(src,new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>{images.delete(src);reject(Error('服饰暂时未加载，恢复连接后会重试。'));};img.src=src;}));
  return images.get(src);
};
export async function outfitURL(who,pose,outfit,prop=null){
  const key=`${who}-${pose}-${outfit.top}-${outfit.bottom}-${outfit.accessory}-${prop||''}`;
  if(composites.has(key))return composites.get(key);
  const prefix=`assets/home/rig-v9/${who}-${pose}`;
  const home=clothingTemplate('top',outfit.top)===3;
  const body=home?'home-body':'body';
  const bottom=home?'home-bottom':'bottom';
  const front=home?'home-front':outfit.accessory===3?'apron-front':'front';
  const files=[`${prefix}-${body}.webp`,`${prefix}-${bottom}-${outfit.bottom}.webp`,`${prefix}-top-${outfit.top}.webp`,`${prefix}-${front}.webp`,`${prefix}-accessory-${outfit.accessory}.webp`];
  if(prop==='book')files.push(`${prefix}-book.webp`);
  warm(files);
  const promise=(async()=>{
    const parts=await Promise.all(files.map(load));
    const canvas=document.createElement('canvas');canvas.width=parts[0].naturalWidth;canvas.height=parts[0].naturalHeight;
    const context=canvas.getContext('2d');
    [0,1,2,...(outfit.accessory===3?[4,3]:[3,4]),...(prop==='book'?[5]:[])].forEach(i=>context.drawImage(parts[i],0,0));
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if(!blob)throw Error('换装预览生成失败。');return URL.createObjectURL(blob);
  })();
  composites.set(key,promise);try{const url=await promise;if(composites.size>96){const oldest=composites.keys().next().value;composites.get(oldest).then(URL.revokeObjectURL);composites.delete(oldest);}return url;}catch(e){composites.delete(key);throw e;}
}
export async function paintOutfit(img,who,pose,outfit,prop=null){
  for(const old of pending.keys())if(!old.isConnected)pending.delete(old);
  const token=Symbol();img.outfitToken=token;img.dataset.outfitLoading='true';
  try{const url=await outfitURL(who,pose,outfit,prop);if(img.outfitToken===token){img.src=url;await img.decode();pending.delete(img);delete img.dataset.outfitFallback;}}
  catch(error){if(img.outfitToken===token){
    pending.set(img,{who,pose,outfit:{...outfit},prop});
    // Keep the character visible while its layered outfit is unavailable.
    if(!img.naturalWidth){
      try{const fallback=await load(`assets/home/${who}-stand.webp`);if(img.outfitToken===token){img.src=fallback.src;await img.decode();img.dataset.outfitFallback='true';}}catch{}
    }
    throw error;
  }}
  finally{if(img.outfitToken===token)delete img.dataset.outfitLoading;}
}
window.addEventListener('online',()=>{
  for(const [img,{who,pose,outfit,prop}] of pending){pending.delete(img);if(img.isConnected)paintOutfit(img,who,pose,outfit,prop).catch(()=>{});}
});
