const SCOPE=new URL('./',self.location.href);
const PREFIX=`who-works-${SCOPE.pathname}-`;
const CACHE=PREFIX+'v1.0.0';
const FILES=['./','index.html','app.js?v=1.0.0','engine.js?v=1.0.0','style.css','portrait.css','art-direction.css','fixed-stage.css','floating-ui.css','manifest.webmanifest','vendor/lucide.min.js','assets/paper.png','assets/apartment.webp','assets/town.webp','assets/characters-0.webp','assets/characters-1.webp','assets/characters-2.webp','assets/characters-3.webp','assets/furniture-0.webp','assets/furniture-1.webp','assets/furniture-2.webp','assets/furniture-3.webp','assets/furniture-4.webp','assets/furniture-5.webp','assets/icon-192.png','assets/icon-512.png','assets/music.wav','assets/day.wav','assets/ui/window.webp','assets/ui/button.webp','assets/ui/label.webp','assets/ui/tool.webp','assets/ui/selected.webp','assets/ui/tile.webp'];
FILES.push('legacy-windows.css?v=1.0.0','assets/ui-v15/free-time-frame.webp','menu-shift.css?v=1.0.0','assets/ui-v13/menu-frame.webp','modal-art.css?v=1.0.0','assets/ui-v12/portrait-xian.webp','assets/ui-v12/portrait-mang.webp','panels.css?v=1.0.0','hud.css?v=1.0.0','assets/fonts/ZCOOLKuaiLe-ui.woff2?v=1.0.0','assets/ui-v10/portrait-cat.webp','assets/ui-v10/portrait-fox.webp','assets/ui-v10/nav-plan.webp','assets/ui-v10/nav-home.webp','assets/ui-v10/nav-jobs.webp','assets/ui-v10/nav-diary.webp','assets/ui-v10/paper-ticket.webp','assets/ui-v10/paper-title.webp','assets/ui-v10/run-disc.webp','assets/ui/title-lettering.webp','menu.css?v=1.0.0','gameplay.css?v=1.0.0','assets/menu-cover.webp','assets/ui/menu-title.webp');
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(file=>new Request(new URL(file,SCOPE),{cache:'reload'})))).then(()=>self.skipWaiting()));});
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
