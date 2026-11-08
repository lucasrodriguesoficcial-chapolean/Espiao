/* Radar Shopee: shell offline, catálogo online quando disponível. */
const VERSION="radar-shopee-android-v2";
const SHELL=["./","./index.html","./data.js","./central.js","./central.css","./manifest.webmanifest","./icons/app.svg"];
self.addEventListener("install",event=>event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener("fetch",event=>{
 const req=event.request;
 if(req.method!=="GET"||new URL(req.url).origin!==self.location.origin)return;
 const path=new URL(req.url).pathname;
 if(path.endsWith("/data.js")||path.endsWith("/data/products.json")){
  event.respondWith(fetch(req,{cache:"no-store"}).then(async resp=>{if(resp.ok)(await caches.open(VERSION)).put(req,resp.clone());return resp}).catch(()=>caches.match(req)));
  return;
 }
 if(req.mode==="navigate"){
  event.respondWith(fetch(req).then(async resp=>{if(resp.ok)(await caches.open(VERSION)).put("./index.html",resp.clone());return resp}).catch(()=>caches.match("./index.html")));
  return;
 }
 event.respondWith(caches.match(req).then(cached=>cached||fetch(req)));
});