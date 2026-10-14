import {ROOMS,HOME_ITEMS,itemOf,scaleAt,floorFootprint,validPlacement,validActorPoint} from './home-system.js?v=home-v10';
import {paintOutfit} from './outfits.js?v=1.0.3-textiles21';
export async function createHomeView({getState,commitMove,commitActor,onSelect,onRoom,icons,notice,isActive,isReduced}){
  const meta=await fetch('assets/home/meta.json').then(r=>{if(!r.ok)throw Error('小家素材暂时无法读取，请重试。');return r.json();});
  const stage=document.createElement('div');stage.id='home-stage';
  stage.innerHTML='<img class="home-background" alt=""><div class="home-objects"></div><div class="home-actors"></div><div class="home-fronts"></div><button class="home-door home-west" aria-label="西侧房间"></button><button class="home-door home-east" aria-label="东侧房间"></button>';
  document.getElementById('scene').append(stage);
  const objects=stage.querySelector('.home-objects'),actors=stage.querySelector('.home-actors'),fronts=stage.querySelector('.home-fronts');
  let editing=false,selected=null,person=0,drag=null,enabled=false,autoTimer,expiryTimer,renderId=0,press=null,grab=null,suppressClickUntil=0;
  const performances=new Map();
  const actions={read:'standing-read',sit:'sit',light:'stand',cup:'sip',tea:'sip',watch:'sit',music:'stretch',fold:'fold',groom:'groom',cook:'cook',wash:'fold',heat:'cook',toast:'cook',craft:'craft',sew:'sew',type:'type',print:'standing-read',rest:'rest',water:'water',care:'water',exercise:'exercise'};
  const phrases={read:'这页真有趣。',sit:'坐一会儿。',light:'灯光刚刚好。',cup:'慢慢喝一杯。',tea:'这杯刚刚好。',watch:'再看一小会。',music:'跟着节拍晃一晃。',fold:'收整齐啦。',groom:'今天也挺精神。',cook:'香气出来啦。',wash:'衣服转起来啦。',heat:'热乎乎的。',toast:'早餐要趁热。',craft:'添一笔颜色。',sew:'这一针缝好了。',type:'把想法记下来。',print:'这张印得不错。',rest:'风吹得正好。',water:'慢慢长大呀。',care:'叶子精神多啦。',exercise:'再轻轻骑两圈。'};
  const state=()=>getState(),positions=()=>state().home.positions,room=()=>state().home.room;
  const dims=(item,p)=>({width:item.w*scaleAt(p.y),height:item.w*scaleAt(p.y)*meta[item.asset].ratio*2/3});
  const box=(x,y,width,z)=>`left:${x*100}%;top:${y*100}%;width:${width*100}%;z-index:${z}`;
  function actorWidth(who,pose,y){
    const seated=['sit','read','sip','craft','sew','type','rest','exercise'].includes(pose);
    const size=(who==='cat'?.28:.35)*(seated?.88:pose==='stretch'?1.18:1)*scaleAt(y);
    return size/(meta[`${who}-${pose}`].ratio*2/3);
  }
  function idlePoint(who){
    const saved=state().home.actorPositions?.[room()]?.[who==='cat'?0:1];
    if(saved&&validActorPoint(state(),who==='cat'?0:1,saved))return saved;
    const xs=who==='cat'?[.20,.30,.44,.62,.80,.18,.82]:[.80,.70,.56,.38,.20,.82,.18];
    const other=who==='fox'&&!performances.has(0)?idlePoint('cat'):null;
    for(const y of [.85,.81,.74,.70,.65,.62])for(const x of xs){
      const blocked=((x<.24||x>.76)&&y<.70)||HOME_ITEMS.some(item=>{
        const p=positions()[item.id];if(p?.room!==room())return false;const f=floorFootprint(item.id,p);
        return Math.abs(x-f.x)<f.w/2+.075&&y>f.y-f.depth-.045&&y<f.y+.045;
      })||[...performances.keys()].some(index=>{const b=actorBox(index);return Math.abs(x-b.x)<(actorWidth(who,'stand',y)+b.width)/2+.025&&Math.abs(y-b.y)<.22;})||(other&&Math.abs(x-other.x)<.24&&Math.abs(y-other.y)<.20);
      if(!blocked)return{x,y};
    }
    return{x:xs[0],y:.85};
  }
  function actorBox(index){
    const who=index?'fox':'cat',perf=performances.get(index);
    if(grab?.index===index)return{who,pose:'stand',x:grab.display.x,y:grab.display.y,width:grab.width,z:1000};
    if(!perf){const p=idlePoint(who);return{...p,who,pose:'stand',width:actorWidth(who,'stand',p.y),z:Math.round(p.y*500)+3};}
    const item=itemOf(perf.id),p=positions()[item.id],dim=dims(item,p),pose=perf.pose;
    const width=actorWidth(who,pose,p.y);
    const height=width*meta[`${who}-${pose}`].ratio*2/3;
    if(item.seats){
      const [sx,sy]=item.seats[perf.seat],original=pose==='sit'||pose==='read';
      const hipX=who==='cat'?(original?.60:.50):.44,hipY=pose==='exercise'?.60:who==='cat'?.72:.70;
      return{who,pose,x:p.x-dim.width/2+dim.width*sx+(.5-hipX)*width,y:p.y-dim.height+dim.height*sy+(1-hipY)*height,width,z:Math.round(p.y*500)+1};
    }
    if(['water','care'].includes(perf.action)){
      const [tx,ty]=meta[item.asset].waterTarget,[sx,sy]=meta[`${who}-water`].waterSpout;
      const targetX=p.x+(tx-.5)*dim.width,targetY=p.y-(1-ty)*dim.height;
      const facing=targetX+(1-sx)*width>.98?-1:1;
      const x=targetX+(.5-(facing===1?sx:1-sx))*width;
      // A raised planter fixes the feet on the floor behind its footprint.
      const y=item.id==='potting'?p.y-floorFootprint(item.id,p).depth-.01:targetY+(1-sy-.18)*height;
      const waterLength=(targetY-(y-(1-sy)*height))/height;
      return{who,pose,x,y,width,facing,waterLength,z:Math.round(y*500)+3};
    }
    const y=Math.min(.85,p.y+.04);return{who,pose,x:Math.max(.18,Math.min(.82,p.x+(p.x>.6?-.17:.17))),y,width,z:Math.round(y*500)+3};
  }
  function renderActors(){
    actors.innerHTML=[0,1].map(index=>{const b=actorBox(index),perf=performances.get(index),spout=b.pose==='water'?meta[`${b.who}-water`].waterSpout:null;return `<button class="home-actor ${grab?.index===index?'grabbed':perf?'acting pose-'+perf.pose:''}" data-person="${index}" style="${box(b.x,b.y,b.width,b.z)};--water-facing:${b.facing||1}"><img alt="">${spout?`<span class="actor-water" aria-hidden="true"><span class="water-drops" style="left:${spout[0]*100}%;top:${spout[1]*100}%;height:${b.waterLength*100}%"><i></i><i></i><i></i></span></span>`:''}${perf?`<small class="home-speech">${phrases[perf.action]}</small>`:''}</button>`;}).join('');
    for(const el of actors.children){const index=Number(el.dataset.person),b=actorBox(index),prop=performances.get(index)?.action==='read'?'book':null;el.dataset.prop=prop||'';el.setAttribute('aria-label',state().chars[index].name+'的档案');paintOutfit(el.querySelector('img'),b.who,b.pose,state().chars[index].clothes,prop).catch(e=>notice(e.message));}
    fronts.innerHTML=[...performances.values()].filter((p,i,list)=>itemOf(p.id)?.seats&&list.findIndex(p2=>p2.id===p.id)===i).map(perf=>{const item=itemOf(perf.id),p=positions()[item.id],dim=dims(item,p);return `<img src="assets/home/${item.asset}-front.webp" alt="" style="${box(p.x,p.y,dim.width,Math.round(p.y*500)+2)}">`;}).join('');
    updateEffects();
  }
  function updateEffects(){
    objects.querySelectorAll('[data-home-item]').forEach(el=>{
      const item=itemOf(el.dataset.homeItem),perf=[...performances.values()].find(p=>p.source===item.id||p.id===item.id||p.litLamp===item.id);
      el.querySelector('img').src=`assets/home/${item.asset}${perf&&item.variant?'-on':''}.webp`;
      el.querySelector('.effect-layer')?.remove();el.classList.toggle('running',Boolean(perf));if(!perf)return;
      let fx='';const screen=meta[item.asset].screen,style=screen?`left:${screen.x*100}%;top:${screen.y*100}%;width:${screen.w*100}%;height:${screen.h*100}%`:'';
      if(item.id==='tv')fx=`<div class="tv-screen" style="${style}"><img src="assets/memories/balance-v1.webp" alt=""></div>`;
      else if(item.id==='computer')fx=`<div class="computer-screen" style="${style}"><b></b><b></b><b></b><i></i></div>`;
      else if(item.id==='washer')fx='<div class="wash-drum"><b></b><b></b><b></b></div>';
      else if(item.id==='record')fx='<div class="record-disc"><i data-lucide="disc-3"></i></div>';
      else if(item.id==='printer')fx='<div class="print-paper"><b></b></div>';
      else if(item.id==='sewing')fx='<i class="sewing-needle"></i>';
      else if(item.id==='exercise')fx='<div class="pedal-wheel"><i data-lucide="circle-dot"></i></div>';
      if(perf.action==='music'&&item.id!=='tv')fx+='<div class="music-note"><i data-lucide="music-2"></i></div>';
      if(['cook','heat','tea','cup','toast'].includes(perf.action)&&item.id!=='fridge')fx+='<div class="steam"><i data-lucide="waves"></i></div>';
      if(item.id===perf.litLamp||perf.action==='light')fx+='<div class="lamp-beam"></div>';
      if(perf.action==='groom')fx+='<div class="mirror-shine"><i data-lucide="sparkles"></i></div>';
      el.insertAdjacentHTML('beforeend',`<span class="effect-layer" aria-hidden="true">${fx}</span>`);
    });icons();
  }
  function cancelGrab(){clearTimeout(press?.timer);press=null;const old=grab;grab=null;stage.querySelector('.grab-landing')?.remove();stage.classList.remove('is-grabbing');if(old){suppressClickUntil=performance.now()+650;if(stage.hasPointerCapture(old.pointer))stage.releasePointerCapture(old.pointer);}}
  function stop(){cancelGrab();performances.clear();const cancelled=drag;drag=null;clearTimeout(expiryTimer);if(enabled){if(cancelled)render();else renderActors();}}
  function use(id,index=person){
    if(!enabled||editing||grab||press||!isActive()||document.hidden)return;
    const source=itemOf(id);if(!source||positions()[id]?.room!==room()||![0,1].includes(index))return;
    const action=source.interaction;
    if(!source.seats&&[...performances.entries()].some(([i,p])=>i!==index&&(p.source||p.id)===id)){notice('这里有人啦');return;}
    let item=source;
    if(['watch','music','tea','cup'].includes(action))item=HOME_ITEMS.find(i=>positions()[i.id]?.room===room()&&i.seats&&(['watch','music'].includes(action)?['sofa','armchair'].includes(i.id):['table','balcony','armchair','sofa'].includes(i.id)))||source;
    const occupied=[...performances.entries()].filter(([i,p])=>i!==index&&p.id===item.id).map(([,p])=>p.seat),seat=item.seats?item.seats.findIndex((_,i)=>!occupied.includes(i)):0;
    if(seat<0){notice('这里有人啦');return;}
    let pose=actions[action];if(action==='read')pose=item.seats?'read':'standing-read';if(action==='music'&&item.seats)pose='sit';
    if(!item.seats&&['sit','read','sip','craft','sew','type','rest','exercise'].includes(pose))pose=['cup','tea'].includes(action)?'standing-sip':'stand';
    const litLamp=action==='read'?HOME_ITEMS.find(i=>['lamp','nightstand'].includes(i.id)&&positions()[i.id]?.room===room())?.id:null;
    performances.set(index,{id:item.id,source:id,seat,action,pose,litLamp,until:Date.now()+12000});renderActors();
    clearTimeout(expiryTimer);expiryTimer=setTimeout(expire,12000);
  }
  function expire(){if(grab||press){expiryTimer=setTimeout(expire,1000);return;}for(const [who,p] of performances)if(Date.now()>=p.until)performances.delete(who);renderActors();if(performances.size)expiryTimer=setTimeout(expire,1000);}
  function render(){
    if(!enabled)return;
    const current=ROOMS.find(r=>r.id===room());stage.classList.toggle('is-editing',editing);stage.classList.toggle('reduce-motion',isReduced());
    const bg=stage.querySelector('.home-background');bg.src=`assets/home/room-${room()}-full.webp`;bg.alt=current.name;
    const localItems=HOME_ITEMS.filter(i=>positions()[i.id]?.room===room()),poses=new Set(['stand','sit',...localItems.map(i=>actions[i.interaction]),...(localItems.some(i=>i.interaction==='read')?['read','standing-read']:[]),...(localItems.some(i=>['tea','cup'].includes(i.interaction))?['sip','standing-sip']:[])]);
    const files=[bg.getAttribute('src'),...localItems.flatMap(i=>[`assets/home/${i.asset}.webp`,...(i.variant?[`assets/home/${i.asset}-on.webp`]:[]),...(i.seats?[`assets/home/${i.asset}-front.webp`]:[])]),...[...poses].flatMap(p=>state().chars.flatMap((c,i)=>{const prefix=`assets/home/rig-v9/${i?'fox':'cat'}-${p}`;return [`${prefix}-body.webp`,`${prefix}-front.webp`,...Object.keys(c.clothes).map(part=>`${prefix}-${part}-${c.clothes[part]}.webp`)];}))];
    navigator.serviceWorker?.controller?.postMessage({type:'warm-home',files});
    if(localItems.some(i=>i.interaction==='read'))navigator.serviceWorker?.controller?.postMessage({type:'warm-home',files:['cat','fox'].flatMap(who=>['read','standing-read'].map(pose=>`assets/home/rig-v9/${who}-${pose}-book.webp`))});
    const doors={living:{west:[[.035,.23],[.085,.255],[.085,.52],[.035,.55]],east:[[.918,.255],[.968,.23],[.968,.55],[.918,.52]]},bedroom:{east:[[.91,.235],[.96,.215],[.96,.535],[.91,.505]]},kitchen:{west:[[.035,.215],[.084,.236],[.084,.515],[.035,.55]],east:[[.918,.233],[.969,.21],[.969,.55],[.918,.515]]},study:{west:[[.035,.23],[.09,.259],[.09,.53],[.035,.566]],east:[[.92,.258],[.976,.225],[.976,.569],[.92,.53]]},balcony:{west:[[.035,.208],[.087,.232],[.087,.509],[.035,.55]]}};
    for(const side of ['west','east']){const el=stage.querySelector('.home-'+side),next=current[side],name=ROOMS.find(r=>r.id===next)?.name||'',locked=next&&!state().home.unlocked.includes(next);el.hidden=!next;el.dataset.homeRoom=next||'';el.classList.toggle('locked',Boolean(locked));el.setAttribute('aria-label',name+(locked?' · 尚未开放':''));el.title=el.getAttribute('aria-label');el.style.clipPath=next?'polygon('+doors[room()][side].map(([x,y])=>`${x*100}% ${y*100}%`).join(',')+')':'';}
    objects.innerHTML=HOME_ITEMS.filter(i=>positions()[i.id]?.room===room()).map(item=>{const p=positions()[item.id],dim=dims(item,p);return `<button class="home-furniture ${editing&&selected===item.id?'selected':''}" data-home-item="${item.id}" aria-label="${item.name}" style="${box(p.x,p.y,dim.width,Math.round(p.y*500))}"><img src="assets/home/${item.asset}.webp" alt="${item.name}"></button>`;}).join('');
    renderActors();renderId++;icons();
  }
  function grabPoint(event){
    const r=stage.getBoundingClientRect();
    return{x:grab.start.x+(event.clientX-grab.clientX)/r.width,y:grab.start.y+(event.clientY-grab.clientY)/r.height};
  }
  function validDrop(p){
    if(!validActorPoint(state(),grab.index,p))return false;
    const other=actorBox(1-grab.index);
    return Math.abs(p.x-other.x)>=.12||Math.abs(p.y-other.y)>=.08;
  }
  function showGrabPoint(p){
    grab.draft=p;grab.valid=validDrop(p);
    const height=grab.width*meta[`${grab.index?'fox':'cat'}-stand`].ratio*2/3;
    grab.display={x:Math.max(grab.width/2+.02,Math.min(1-grab.width/2-.02,p.x)),y:Math.max(height+.035,Math.min(.95,p.y-.07))};
    const target=actors.querySelector(`[data-person="${grab.index}"]`);
    target.style.cssText=box(grab.display.x,grab.display.y,grab.width,1000);
    const marker=stage.querySelector('.grab-landing');
    marker.style.left=`${Math.max(.05,Math.min(.95,p.x))*100}%`;marker.style.top=`${Math.max(.05,Math.min(.95,p.y))*100}%`;
    marker.classList.toggle('invalid',!grab.valid);
  }
  function beginGrab(p){
    if(press!==p||!enabled||editing||!isActive()||document.hidden)return;
    press=null;performances.delete(p.index);
    grab={...p,start:{x:p.b.x,y:p.b.y},draft:{x:p.b.x,y:p.b.y},display:{x:p.b.x,y:p.b.y-.07},width:actorWidth(p.index?'fox':'cat','stand',p.b.y)};
    try{stage.setPointerCapture(p.pointer);}catch{cancelGrab();renderActors();return;}
    stage.classList.add('is-grabbing');renderActors();
    const marker=document.createElement('span');marker.className='grab-landing';marker.setAttribute('aria-hidden','true');stage.append(marker);
    showGrabPoint(grab.draft);
  }
  actors.addEventListener('pointerdown',event=>{
    const target=event.target.closest('.home-actor');
    if(!target||!enabled||editing||grab||press||!isActive()||document.hidden||!event.isPrimary||event.button!==0)return;
    const index=Number(target.dataset.person);
    press={index,pointer:event.pointerId,clientX:event.clientX,clientY:event.clientY,b:actorBox(index)};
    const p=press;p.timer=setTimeout(()=>beginGrab(p),200);
  });
  actors.addEventListener('contextmenu',event=>{if(event.target.closest('.home-actor'))event.preventDefault();});
  stage.addEventListener('pointerleave',()=>{if(press){clearTimeout(press.timer);press=null;}});
  stage.addEventListener('pointermove',event=>{
    if(press?.pointer===event.pointerId&&Math.hypot(event.clientX-press.clientX,event.clientY-press.clientY)>10){clearTimeout(press.timer);press=null;suppressClickUntil=performance.now()+650;}
    if(!grab||grab.pointer!==event.pointerId)return;
    event.preventDefault();event.stopPropagation();showGrabPoint(grabPoint(event));
  });
  function finishGrab(event,cancel=false){
    if(press?.pointer===event.pointerId){clearTimeout(press.timer);press=null;return;}
    if(!grab||grab.pointer!==event.pointerId)return;
    if(!cancel)showGrabPoint(grabPoint(event));
    const saved=grab;cancelGrab();event.preventDefault();event.stopPropagation();
    if(!cancel&&saved.valid)commitActor(saved.index,saved.draft);
    else if(!cancel)notice('这里站不下，已放回原位置。');
    renderActors();
  }
  stage.addEventListener('pointerup',event=>finishGrab(event));
  stage.addEventListener('pointercancel',event=>finishGrab(event,true));
  stage.addEventListener('lostpointercapture',event=>{if(grab?.pointer===event.pointerId)finishGrab(event,true);});
  stage.addEventListener('click',event=>{if(performance.now()<suppressClickUntil&&(event.target.closest('.home-actor')||event.target===stage)){event.preventDefault();event.stopImmediatePropagation();}},true);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&(grab||press)){cancelGrab();renderActors();}});
  window.addEventListener('blur',()=>{if(grab||press){cancelGrab();renderActors();}});
  objects.addEventListener('pointerdown',event=>{
    const target=event.target.closest('[data-home-item]');if(!editing||!target||!isActive())return;
    event.preventDefault();event.stopPropagation();selected=target.dataset.homeItem;performances.clear();renderActors();onSelect(selected);
    const r=stage.getBoundingClientRect(),p=positions()[selected];
    drag={id:selected,target,pointer:event.pointerId,draft:{...p},dx:(event.clientX-r.left)/r.width-p.x,dy:(event.clientY-r.top)/r.height-p.y};target.setPointerCapture(event.pointerId);target.classList.add('selected');
  });
  objects.addEventListener('pointermove',event=>{
    if(!drag||drag.pointer!==event.pointerId)return;const r=stage.getBoundingClientRect();
    const p={room:room(),x:(event.clientX-r.left)/r.width-drag.dx,y:(event.clientY-r.top)/r.height-drag.dy};drag.draft=p;
    drag.target.style.cssText=box(p.x,p.y,dims(itemOf(drag.id),p).width,800);drag.target.classList.toggle('invalid',!validPlacement(drag.id,p,positions()));
  });
  function endDrag(event,cancel=false){if(!drag||drag.pointer!==event.pointerId)return;const d=drag;drag=null;
    if(!cancel&&validPlacement(d.id,d.draft,positions()))commitMove(d.id,d.draft);else if(!cancel)notice('这里放不下，已返回原位置。');render();
  }
  objects.addEventListener('pointerup',event=>endDrag(event));objects.addEventListener('pointercancel',event=>endDrag(event,true));
  objects.addEventListener('click',event=>{const el=event.target.closest('[data-home-item]');if(!el)return;event.stopPropagation();if(editing){selected=el.dataset.homeItem;onSelect(selected);}else{use(el.dataset.homeItem,person);person=1-person;}});
  stage.querySelectorAll('.home-door').forEach(el=>el.addEventListener('click',event=>{event.stopPropagation();if(enabled&&isActive()&&!document.hidden)onRoom(el.dataset.homeRoom);}));
  function auto(){clearTimeout(autoTimer);autoTimer=setTimeout(()=>{if(enabled&&!editing&&!grab&&!press&&isActive()&&!document.hidden){const items=HOME_ITEMS.filter(i=>positions()[i.id]?.room===room());if(items.length)use(items[Math.floor(Math.random()*items.length)].id,Math.random()<.5?0:1);}auto();},20000+Math.random()*20000);}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else auto();});window.addEventListener('pagehide',()=>{stop();clearTimeout(autoTimer);});window.addEventListener('pageshow',auto);auto();
  return {update({visible,editing:edit,selected:id}){if(!visible||editing!==edit||selected!==id||room()!==stage.dataset.room)stop();enabled=visible;editing=edit;selected=id;stage.hidden=!visible;stage.dataset.room=room();render();},stop,use,selectPerson(index){person=index;},getPerformances:()=>[...performances],getStage:()=>stage};
}
