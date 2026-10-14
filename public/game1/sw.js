const SCOPE=new URL('./',self.location.href);
const PREFIX=`who-works-${SCOPE.pathname}-`;
const CACHE=PREFIX+'1.0.3-navalign32';
const FILES=['./','index.html','app.js?v=1.0.1','engine.js?v=1.0.0','style.css','portrait.css','art-direction.css','fixed-stage.css','floating-ui.css','manifest.webmanifest','vendor/lucide.min.js','assets/paper.png','assets/apartment.webp','assets/town.webp','assets/characters-0.webp','assets/characters-1.webp','assets/characters-2.webp','assets/characters-3.webp','assets/furniture-0.webp','assets/furniture-1.webp','assets/furniture-2.webp','assets/furniture-3.webp','assets/furniture-4.webp','assets/furniture-5.webp','assets/icon-192.png','assets/icon-512.png','assets/day.wav','assets/ui/window.webp','assets/ui/button.webp','assets/ui/label.webp','assets/ui/tool.webp','assets/ui/selected.webp','assets/ui/tile.webp'];
FILES.push('legacy-windows.css?v=1.0.0','assets/ui-v15/free-time-frame.webp','menu-shift.css?v=1.0.0','assets/ui-v13/menu-frame.webp','modal-art.css?v=1.0.0','assets/ui-v12/portrait-xian.webp','assets/ui-v12/portrait-mang.webp','panels.css?v=1.0.0','hud.css?v=1.0.0','assets/fonts/ZCOOLKuaiLe-ui.woff2?v=1.0.0','assets/ui-v10/portrait-cat.webp','assets/ui-v10/portrait-fox.webp','assets/ui-v10/nav-plan.webp','assets/ui-v10/nav-home.webp','assets/ui-v10/nav-jobs.webp','assets/ui-v10/nav-diary.webp','assets/ui-v10/paper-ticket.webp','assets/ui-v10/paper-title.webp','assets/ui-v10/run-disc.webp','assets/ui/title-lettering.webp','menu.css?v=1.0.0','gameplay.css?v=1.0.0','assets/menu-cover.webp','assets/ui/menu-title.webp');
FILES.push('assets/game-icon-v1-180.png','assets/game-icon-v1-192.png','assets/game-icon-v1-512.png');
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll([...new Set(FILES)].map(file=>new Request(new URL(file,SCOPE),{cache:'reload'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==SCOPE.origin||!url.pathname.startsWith(SCOPE.pathname))return;
  event.respondWith(fetch(event.request,event.request.mode==='navigate'?{cache:'no-cache'}:undefined).then(response=>{if(response.ok){const clone=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,clone)));}return response;}).catch(async()=>{
    const cache=await caches.open(CACHE);
    return await cache.match(event.request)||(event.request.mode==='navigate'&&await cache.match(new URL('index.html',SCOPE).href))||new Response('Offline resource unavailable',{status:503});
  }));
});

FILES.push('ratio-layout.css?v=1.0.0','assets/ui-v16/diary-frame.webp','assets/ui-v16/home-frame.webp','assets/ui-v16/jobs-frame.webp','assets/ui-v16/schedule-frame.webp','assets/ui-v16/goals-frame.webp','assets/ui-v16/mang-frame.webp','assets/ui-v16/settings-frame.webp','assets/ui-v16/xian-frame.webp','assets/ui-v16/new-game-frame.webp','assets/ui-v16/shift-frame.webp','assets/ui-v16/ad-frame.webp','assets/ui-v16/buy-frame.webp','assets/ui-v16/course-frame.webp','assets/ui-v16/decorate-frame.webp','assets/ui-v16/draw-frame.webp','assets/ui-v16/event-frame.webp','assets/ui-v16/import-frame.webp','assets/ui-v16/preset-frame.webp','assets/ui-v16/report-frame.webp','assets/ui-v16/reward-frame.webp','assets/ui-v16/sunday-frame.webp','assets/ui-v16/tutorial-frame.webp');

FILES.push('engine.js?v=0.15','assets/fonts/ZCOOLKuaiLe-ui.woff2?v=0.15');
FILES.push(...Array.from({length:6},(_,i)=>`assets/tutorial/step-${i+1}.webp`),...Array.from({length:4},(_,i)=>`assets/music/music-${String(i+1).padStart(2,'0')}.mp3`));
FILES.push(...['first','learn','side','home','balance'].map(id=>`assets/memories/${id}-v1.webp`));
FILES.push('app.js?v=1.0.2','ratio-layout.css?v=1.0.2','symbols.css?v=1.0.2');
FILES.push('engine.js?v=1.0.1',...['menu','gameplay','hud','panels','modal-art','menu-shift','legacy-windows'].map(name=>`${name}.css?v=1.0.1`));
FILES.push('app.js?v=home-v8','engine.js?v=home-v8','home-system.js','home-space.js','home-extras.js','outfits.js','home-view.js','home.css?v=home-v8','home-effects.css?v=home-v8','assets/home/meta.json','assets/home/room-living.webp','assets/home/cat-stand.webp','assets/home/fox-stand.webp','assets/home/wardrobe-frame.webp');
FILES.push('app.js?v=home-v9','engine.js?v=home-v9','home-system.js?v=home-v9','home-view.js?v=home-v9','outfits.js?v=home-v9','home-polish.css?v=home-v9','hud.css?v=home-v9','assets/fonts/ZCOOLKuaiLe-ui.woff2?v=home-v9','assets/home/ui-wardrobe.webp','assets/home/ui-house.webp','assets/home/ui-tools.webp','assets/home/room-living-full.webp');

// Warm only the room/equipment being used, without blocking the menu or core install.
FILES.push('app.js?v=home-v10','engine.js?v=home-v10','home-system.js?v=home-v10','outfits.js?v=home-v10','home-view.js?v=home-v10','home.css?v=home-v10','home-polish.css?v=home-v10');
FILES.push('app.js?v=home-v10.1','outfits.js?v=home-v10.1','home-view.js?v=home-v10.1');
FILES.push('app.js?v=home-v10.2');
FILES.push('app.js?v=home-v10.3','outfits.js?v=home-v10.3','home-view.js?v=home-v10.3');
FILES.push('app.js?v=1.0.3');
FILES.push('app.js?v=1.0.3-ui2','home-view.js?v=1.0.3-ui2','outfits.js?v=1.0.3-ui2','home-polish.css?v=1.0.3-ui2','ratio-layout.css?v=1.0.3-ui2');
FILES.push('app.js?v=1.0.3-fit3','home-view.js?v=1.0.3-fit3','outfits.js?v=1.0.3-fit3');
FILES.push('app.js?v=1.0.3-nav4','hud.css?v=1.0.3-nav4');
FILES.push('app.js?v=1.0.3-read5','home-view.js?v=1.0.3-read5','outfits.js?v=1.0.3-read5');
FILES.push('app.js?v=1.0.3-goals6','assets/tutorial/step-5-weekly.webp');
FILES.push('app.js?v=1.0.3-tools8','home-polish.css?v=1.0.3-tools8','assets/home/ui-tools-approved.webp');
FILES.push('app.js?v=1.0.3-actions10','home-polish.css?v=1.0.3-actions10','hud.css?v=1.0.3-actions10','assets/home/profile-wardrobe-tag.webp','assets/home/profile-rename-tag.webp','assets/ui-v10/nav-wardrobe.webp');
FILES.push('app.js?v=1.0.3-legs11',...[0,1,2].map(i=>`assets/home/fox-bottom-${i}.webp`));
FILES.push('app.js?v=1.0.3-seated12');
FILES.push('app.js?v=1.0.3-roommap13','home-polish.css?v=1.0.3-roommap13',...['bedroom','living','kitchen','balcony','study','close'].map(id=>`assets/home/map-${id}.webp`));
FILES.push('app.js?v=1.0.3-grab14','home-view.js?v=1.0.3-grab14','actor-puppet.js?v=1.0.3-grab14','home-effects.css?v=1.0.3-grab14');
FILES.push('app.js?v=1.0.3-water15','home-view.js?v=1.0.3-water15','home-effects.css?v=1.0.3-water15');
FILES.push('app.js?v=1.0.3-profile16','home-polish.css?v=1.0.3-profile16','assets/home/profile-wardrobe-centered.webp','assets/home/profile-rename-centered.webp');
FILES.push('app.js?v=1.0.3-hip17');
FILES.push('app.js?v=1.0.3-tail18');
FILES.push('app.js?v=1.0.3-hat19');
FILES.push('app.js?v=1.0.3-foxhat20');
FILES.push('app.js?v=1.0.3-textiles21','home-view.js?v=1.0.3-textiles21','outfits.js?v=1.0.3-textiles21','actor-puppet.js?v=1.0.3-textiles21','home-polish.css?v=1.0.3-textiles21');
FILES.push('hud.css?v=1.0.3-textiles21','assets/fonts/ZCOOLKuaiLe-ui.woff2?v=1.0.3-textiles21','assets/ui-v10/wardrobe-shirt-approved.webp');
FILES.push('app.js?v=1.0.3-grabfit22','home-view.js?v=1.0.3-grabfit22','actor-puppet.js?v=1.0.3-grabfit22');
FILES.push('app.js?v=1.0.3-waterground23','home-view.js?v=1.0.3-waterground23');
FILES.push('app.js?v=1.0.3-profileaxis24','home-polish.css?v=1.0.3-profileaxis24');
FILES.push('app.js?v=1.0.3-fixedglasses25','home-polish.css?v=1.0.3-fixedglasses25',...['stand','sit','read','sip','craft','sew','type','rest','exercise','standing-read','standing-sip','stretch','fold','groom','cook','water'].map(pose=>`assets/home/rig-v9/cat-${pose}-accessory-0.webp`));
FILES.push('app.js?v=1.0.3-legs26',...Array.from({length:7},(_,i)=>[`assets/home/rig-v9/fox-stand-bottom-${i}.webp`,`assets/home/rig-v9/fox-stand-home-bottom-${i}.webp`,`assets/home/fox-bottom-${i}.webp`]).flat());
FILES.push('app.js?v=1.0.3-tailroot27',...['body','home-body','front','home-front','apron-front'].map(part=>`assets/home/rig-v9/fox-sit-${part}.webp`));
FILES.push('app.js?v=1.0.3-underarm29','home-view.js?v=1.0.3-underarm29','actor-puppet.js?v=1.0.3-underarm29');
FILES.push('app.js?v=1.0.3-skillspacing30','home-polish.css?v=1.0.3-skillspacing30');
FILES.push('app.js?v=1.0.3-staticgrab31','home-view.js?v=1.0.3-staticgrab31','home-effects.css?v=1.0.3-staticgrab31');
FILES.push('app.js?v=1.0.3-navalign32','hud.css?v=1.0.3-navalign32');
FILES.push('app.js?v=1.0.3-textiles28',...['body','home-body','front','home-front','apron-front'].flatMap(part=>[
  ...['cook','fold','groom','rest','stand','standing-read','standing-sip'].map(pose=>`assets/home/rig-v9/fox-${pose}-${part}.webp`),
  `assets/home/rig-v9/cat-water-${part}.webp`
]));
// Cache the small standing wardrobe at install, including items not yet worn.
FILES.push(...['cat','fox'].flatMap(who=>[
  `assets/home/${who}-stand.webp`,
  ...['body','front','home-body','home-front','apron-front',...Array.from({length:5},(_,i)=>`top-${i}`),...Array.from({length:3},(_,i)=>`bottom-${i}`),...Array.from({length:3},(_,i)=>`home-bottom-${i}`),...Array.from({length:4},(_,i)=>`accessory-${i}`)].map(part=>`assets/home/rig-v9/${who}-stand-${part}.webp`),
  ...[['top',5],['bottom',3],['accessory',4]].flatMap(([part,count])=>Array.from({length:count},(_,i)=>`assets/home/${who}-${part}-${i}.webp`))
]));
self.addEventListener('message',event=>{
  if(event.data?.type!=='warm-home'||!Array.isArray(event.data.files))return;
  const files=event.data.files.filter(file=>typeof file==='string'&&/^assets\/home\/[a-z0-9/.-]+\.(webp|json)$/.test(file)&&!file.includes('..'));
  event.waitUntil(caches.open(CACHE).then(async cache=>{for(const file of files){const request=new Request(new URL(file,SCOPE));if(await cache.match(request))continue;try{const response=await fetch(request);if(response.ok)await cache.put(request,response);}catch{}}}));
});
