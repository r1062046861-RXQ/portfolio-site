import {clothingTemplate} from './home-system.js?v=1.0.3-life39';
export async function grabPuppet(image,who,outfit){
  const w=image.naturalWidth,h=image.naturalHeight,home=clothingTemplate('top',outfit.top)===3;
  const load=part=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('抓取服饰暂时未加载，请重试。'));img.src=`assets/home/rig-v9/${who}-stand-${part}.webp`;});
  const files=[`${home?'home-body':'body'}`,`home-bottom-${outfit.bottom}`,`top-${outfit.top}`,`${home?'home-front':outfit.accessory===3?'apron-front':'front'}`,`accessory-${outfit.accessory}`];
  navigator.serviceWorker?.controller?.postMessage({type:'warm-home',files:files.map(part=>`assets/home/rig-v9/${who}-stand-${part}.webp`)});
  const [skin,pants,shirt,front,accessory]=await Promise.all(files.map(load));
  const canvas=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
  const root=document.createElement('span');root.className='grab-puppet';root.setAttribute('aria-hidden','true');
  const body=canvas(),b=body.getContext('2d');
  // Full trousers beneath the coat supply the hip and thighs exposed by kicking.
  b.drawImage(pants,0,0);b.drawImage(image,0,0);
  const armSource=canvas(),a=armSource.getContext('2d');[shirt,front].forEach(im=>a.drawImage(im,0,0));
  const legSource=canvas(),l=legSource.getContext('2d');l.drawImage(pants,0,0);
  const cat=who==='cat',footY=cat?392:398,footWidth=cat?w:149;
  l.drawImage(skin,0,footY,footWidth,h-footY,0,footY,footWidth,h-footY);
  const split=cat?173:80,legTop=cat?290:252,hipBottom=cat?320:286;
  const arms=cat?[
    ['arm-left',[105,148],[[104,130],[81,145],[68,174],[68,225],[95,246],[122,246],[125,218],[112,180]]],
    ['arm-right',[231,148],[[226,129],[251,149],[273,181],[279,213],[263,246],[231,246],[219,218],[224,179]]]
  ]:[
    ['arm-left',[39,146],[[34,129],[54,138],[53,189],[48,231],[49,271],[25,277],[18,257],[20,202]]],
    ['arm-right',[118,145],[[106,129],[126,140],[137,191],[143,263],[137,279],[114,275],[107,226],[103,179]]]
  ];
  const bodyAlpha=b.getImageData(0,0,w,h),shirtAlpha=canvas().getContext('2d');shirtAlpha.drawImage(shirt,0,0);
  const garment=shirtAlpha.getImageData(0,0,w,h).data,legs=l.getImageData(0,0,w,h).data;
  // Binary ownership avoids repeatedly multiplying translucent garment edges.
  for(let y=hipBottom;y<h;y++)for(let x=0;x<w;x++){const k=(y*w+x)*4;if(legs[k+3]>0&&garment[k+3]===0)bodyAlpha.data[k+3]=0;}
  b.putImageData(bodyAlpha,0,0);
  for(const [name,anchor,left] of [['leg-left',cat?[139,308]:[65,276],true],['leg-right',cat?[204,308]:[96,276],false]]){
    const limb=canvas();limb.className='grab-'+name;const c=limb.getContext('2d');
    c.drawImage(legSource,0,0);c.clearRect(0,0,w,legTop);c.clearRect(left?split:0,0,left?w:split,h);
    limb.style.transformOrigin=`${anchor[0]/w*100}% ${anchor[1]/h*100}%`;root.append(limb);
  }
  // Static hips and coat hems overlap the moving thighs; limbs render behind them.
  root.append(body);
  for(const [name,anchor,points] of arms){
    const mask=canvas(),m=mask.getContext('2d');m.beginPath();points.forEach(([x,y],i)=>i?m.lineTo(x,y):m.moveTo(x,y));m.closePath();m.fill();
    const limb=canvas(),c=limb.getContext('2d');limb.className='grab-'+name;c.drawImage(armSource,0,0);c.globalCompositeOperation='destination-in';c.drawImage(mask,0,0);
    // Preserve the torso and overlapping shoulder roots instead of carving holes.
    const pixels=b.getImageData(0,0,w,h),cut=m.getImageData(0,0,w,h).data,source=a.getImageData(0,0,w,h).data;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const k=(y*w+x)*4,torso=cat?(x>=123&&x<=223&&y>=135)||(x>=104&&x<=246&&y>=165)||(y>=246):(x>=50&&x<=106&&y>=130)||(x>=40&&x<=120&&y>=170)||(x>=32&&x<=129&&y>=190)||(y>=279);
      const shoulder=((x-anchor[0])/23)**2+((y-anchor[1])/31)**2<=1;
      if(cut[k+3]>127&&source[k+3]>0&&!torso&&!shoulder)pixels.data[k+3]=0;
    }
    b.putImageData(pixels,0,0);limb.style.transformOrigin=`${anchor[0]/w*100}% ${anchor[1]/h*100}%`;root.append(limb);
  }
  // Accessories stay attached to the head/torso and never enter a limb mask.
  b.drawImage(accessory,0,0);return root;
}
