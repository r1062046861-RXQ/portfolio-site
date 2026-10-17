import {outfitLayers} from './actor-rig.js?v=1.0.3-life39';
const images=new Map(),composites=new Map(),pending=new Map();
function warm(files){navigator.serviceWorker?.controller?.postMessage({type:'warm-home',files});}
const load=src=>{
  if(!images.has(src))images.set(src,new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>{images.delete(src);reject(Error(['localhost','127.0.0.1','[::1]'].includes(location.hostname)?'服饰资源加载失败，请确认本地服务已启动。':'服饰暂时未加载，恢复连接后会重试。'));};img.src=src;}));
  return images.get(src);
};
export async function outfitURL(who,pose,outfit,prop=null){
  if(outfit.accessory===2)outfit={...outfit,accessory:0};
  const key=`${who}-${pose}-${outfit.top}-${outfit.bottom}-${outfit.accessory}-${prop||''}`;
  if(composites.has(key))return composites.get(key);
  const files=outfitLayers(who,pose,outfit,prop).map(layer=>layer.src);
  warm(files);
  const promise=(async()=>{
    const parts=await Promise.all(files.map(load));
    const canvas=document.createElement('canvas');canvas.width=parts[0].naturalWidth;canvas.height=parts[0].naturalHeight;
    const context=canvas.getContext('2d');
    if(parts.some(part=>part.naturalWidth!==canvas.width||part.naturalHeight!==canvas.height))throw Error('服饰图层画布不一致。');
    parts.forEach(part=>context.drawImage(part,0,0));
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
function retryPending(){
  for(const [img,{who,pose,outfit,prop}] of pending){pending.delete(img);if(img.isConnected)paintOutfit(img,who,pose,outfit,prop).catch(()=>{});}
}
window.addEventListener('online',retryPending);
window.addEventListener('focus',retryPending);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)retryPending();});
