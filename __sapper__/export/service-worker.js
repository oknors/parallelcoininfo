!function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,function(t){return e[t]}.bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){"use strict";n.r(t);const o=["/client/f24971d26e89e1e11d64/3.3.js","/client/f24971d26e89e1e11d64/4.4.js","/client/f24971d26e89e1e11d64/5.5.js","/client/f24971d26e89e1e11d64/6.6.js","/client/f24971d26e89e1e11d64/index.0.js","/client/f24971d26e89e1e11d64/main.js","/client/f24971d26e89e1e11d64/vendors~index.2.js"].concat(["/service-worker-index.html","/black-square.jpg","/favicon.png","/logo-192.png","/logo-512.png","/logo-contur.svg","/logo.svg","/logo1.svg","/logo2.svg","/logo3.svg","/logo_circle_contur.svg","/manifest.json","/square.png"]).filter(e=>!e.startsWith("/videos")),r=new Set(o);self.addEventListener("install",e=>{e.waitUntil(caches.open("cache1609362663309").then(e=>e.addAll(o)).then(()=>{self.skipWaiting()}))}),self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(async e=>{for(const t of e)"cache1609362663309"!==t&&await caches.delete(t);self.clients.claim()}))}),self.addEventListener("fetch",e=>{if("GET"!==e.request.method||e.request.headers.has("range"))return;const t=new URL(e.request.url),n=t.protocol.startsWith("http"),o=t.hostname===self.location.hostname&&t.port!==self.location.port,c=t.host===self.location.host&&r.has(t.pathname),s="only-if-cached"===e.request.cache&&!c;!n||o||s||e.respondWith((async()=>c&&await caches.match(e.request)||async function(e){const t=await caches.open("offline1609362663309");try{const n=await fetch(e);return t.put(e,n.clone()),n}catch(n){const o=await t.match(e);if(o)return o;throw n}}(e.request))())})}]);