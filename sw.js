/* Service worker του Mood Meter: κρατά την εφαρμογή στη συσκευή ώστε να ανοίγει και χωρίς internet.
   Στρατηγική «stale-while-revalidate»: ανοίγει αμέσως από την κρυφή μνήμη και ταυτόχρονα κατεβάζει
   τη νεότερη έκδοση, που εμφανίζεται στο επόμενο άνοιγμα. Δεν αγγίζει ποτέ τα δεδομένα σου (αυτά είναι στο localStorage). */
const V='mood-meter-v1';
const FILES=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png','./icons/apple-touch-icon.png','./icons/favicon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const r=e.request;
 if(r.method!=='GET'||new URL(r.url).origin!==self.location.origin)return;
 e.respondWith((async()=>{
  const c=await caches.open(V),hit=await c.match(r,{ignoreSearch:true});
  const net=fetch(r.url,{cache:'no-cache'}).then(res=>{if(res&&res.ok&&res.type==='basic')c.put(r,res.clone());return res}).catch(()=>null);
  if(hit){e.waitUntil(net);return hit}
  const res=await net;if(res)return res;
  if(r.mode==='navigate'){const f=await c.match('./index.html');if(f)return f}
  return new Response('Χωρίς σύνδεση και χωρίς αποθηκευμένο αντίγραφο.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})
 })())});
