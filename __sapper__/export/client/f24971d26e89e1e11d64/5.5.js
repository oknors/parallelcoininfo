(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{60:function(e,t){!function(e,t){"use strict";var i,a,r,s,n,o,d,l,u,m,p,v,c,f,g;s=[],e.addEventListener("impress:init",(function(e){i=e.target,a=e.detail.api,r=a.lib.gc,o(),r.pushCallback(g)}),!1),g=function(){var e,t;for(d(),t=0;t<s.length;t+=1)(e=s[t]).node.removeAttribute(e.attr);s=[]},f=function(e,t){var i,a,r,s;for(i="data-media-"+e,r=0;r<t.length;r+=1)if((s=t[r]).hasAttribute(i))return""===(a=s.getAttribute(i))||"true"===a},p=function(t){var i=t.target.nodeName.toLowerCase();e.body.classList.add("impress-media-"+i+"-playing"),e.body.classList.remove("impress-media-"+i+"-paused")},v=function(t){var i=t.target.nodeName.toLowerCase();e.body.classList.add("impress-media-"+i+"-paused"),e.body.classList.remove("impress-media-"+i+"-playing")},c=function(t){var i=t.target.nodeName.toLowerCase();e.body.classList.remove("impress-media-"+i+"-playing"),e.body.classList.remove("impress-media-"+i+"-paused")},d=function(){var t,i;for(t in i=["video","audio"])e.body.classList.remove("impress-media-"+i[t]+"-playing"),e.body.classList.remove("impress-media-"+i[t]+"-paused")},n=function(){var e,t,a,n;for(t=i.querySelectorAll("audio, video"),e=0;e<t.length;e+=1)n=t[e].nodeName.toLowerCase(),null==(a=t[e]).getAttribute("id")&&(a.setAttribute("id","media-"+n+"-"+e),s.push({node:a,attr:"id"})),r.addEventListener(a,"play",p),r.addEventListener(a,"playing",p),r.addEventListener(a,"pause",v),r.addEventListener(a,"ended",c)},o=function(){var t,i,a;for(n(),t=e.getElementsByClassName("step"),a=0;a<t.length;a+=1)i=t[a],r.addEventListener(i,"impress:stepenter",u),r.addEventListener(i,"impress:stepleave",m)},l=function(){return{preview:null!==t.frameElement&&"preView"===t.frameElement.id,slideView:null!==t.frameElement&&"slideView"===t.frameElement.id}},u=function(e){var t,a,r,s,n;if(e&&e.target)for(t=e.target,d(),a=t.querySelectorAll("audio, video"),s=0;s<a.length;s+=1)r=a[s],n=l(),f("autoplay",[r,t,i])&&!n.preview&&(n.slideView&&(r.muted=!0),r.play())},m=function(e){var t,a,r,s,n,o,l;if(e&&e.target){for(t=e.target,a=e.target.querySelectorAll("audio, video"),r=0;r<a.length;r+=1)s=a[r],n=f("autoplay",[s,t,i]),o=f("autopause",[s,t,i]),void 0===(l=f("autostop",[s,t,i]))&&void 0===o&&(l=n),(o||l)&&(s.pause(),l&&(s.currentTime=0));d()}}}(document,window)}}]);