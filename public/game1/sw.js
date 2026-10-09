const SCOPE=new URL('./',self.location.href);
const PREFIX=`who-works-${SCOPE.pathname}-`;
const CACHE=PREFIX+'v5-6';
const FILES=['./','index.html','app.js','engine.js','style.css','portrait.css','art-direction.css','fixed-stage.css','floating-ui.css','manifest.webmanifest','vendor/lucide.min.js','assets/paper.png','assets/apartment.webp','assets/town.webp','assets/characters-0.webp','assets/characters-1.webp','assets/characters-2.webp','assets/characters-3.webp','assets/furniture-0.webp','assets/furniture-1.webp','assets/furniture-2.webp','assets/furniture-3.webp','assets/furniture-4.webp','assets/furniture-5.webp','assets/icon-192.png','assets/icon-512.png','assets/music.wav','assets/day.wav','assets/ui/window.webp','assets/ui/button.webp','assets/ui/label.webp','assets/ui/tool.webp','assets/ui/selected.webp','assets/ui/tile.webp'];
FILES.push('assets/ui/title-lettering.webp');
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==SCOPE.origin||!url.pathname.startsWith(SCOPE.pathname))return;
  event.respondWith(fetch(event.request).then(response=>{if(response.ok){const clone=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,clone)));}return response;}).catch(async()=>{
    const cache=await caches.open(CACHE);
    return await cache.match(event.request)||(event.request.mode==='navigate'&&await cache.match(new URL('index.html',SCOPE).href))||new Response('Offline resource unavailable',{status:503});
  }));
});
