import{S as x,am as A,an as E,a1 as o,ao as K,i as c,g as O,ag as b,e as w,j as L,ap as M,ab as q,I as B,aq as j,u as U,ar as Y,n as Z}from"./runtime.DExCUZGw.js";function _(n,a=null,v){if(typeof n!="object"||n===null||x in n)return n;const u=q(n);if(u!==A&&u!==E)return n;var s=new Map,g=B(n),h=o(0);g&&s.set("length",o(n.length));var y;return new Proxy(n,{defineProperty(f,e,t){(!("value"in t)||t.configurable===!1||t.enumerable===!1||t.writable===!1)&&K();var r=s.get(e);return r===void 0?(r=o(t.value),s.set(e,r)):c(r,_(t.value,y)),!0},deleteProperty(f,e){var t=s.get(e);if(t===void 0)e in f&&s.set(e,o(b));else{if(g&&typeof e=="string"){var r=s.get("length"),i=Number(e);Number.isInteger(i)&&i<r.v&&c(r,i)}c(t,b),S(h)}return!0},get(f,e,t){var l;if(e===x)return n;var r=s.get(e),i=e in f;if(r===void 0&&(!i||(l=O(f,e))!=null&&l.writable)&&(r=o(_(i?f[e]:b,y)),s.set(e,r)),r!==void 0){var d=w(r);return d===b?void 0:d}return Reflect.get(f,e,t)},getOwnPropertyDescriptor(f,e){var t=Reflect.getOwnPropertyDescriptor(f,e);if(t&&"value"in t){var r=s.get(e);r&&(t.value=w(r))}else if(t===void 0){var i=s.get(e),d=i==null?void 0:i.v;if(i!==void 0&&d!==b)return{enumerable:!0,configurable:!0,value:d,writable:!0}}return t},has(f,e){var d;if(e===x)return!0;var t=s.get(e),r=t!==void 0&&t.v!==b||Reflect.has(f,e);if(t!==void 0||L!==null&&(!r||(d=O(f,e))!=null&&d.writable)){t===void 0&&(t=o(r?_(f[e],y):b),s.set(e,t));var i=w(t);if(i===b)return!1}return r},set(f,e,t,r){var D;var i=s.get(e),d=e in f;if(g&&e==="length")for(var l=t;l<i.v;l+=1){var m=s.get(l+"");m!==void 0?c(m,b):l in f&&(m=o(b),s.set(l+"",m))}i===void 0?(!d||(D=O(f,e))!=null&&D.writable)&&(i=o(void 0),c(i,_(t,y)),s.set(e,i)):(d=i.v!==b,c(i,_(t,y)));var I=Reflect.getOwnPropertyDescriptor(f,e);if(I!=null&&I.set&&I.set.call(r,t),!d){if(g&&typeof e=="string"){var R=s.get("length"),N=Number(e);Number.isInteger(N)&&N>=R.v&&c(R,N+1)}S(h)}return!0},ownKeys(f){w(h);var e=Reflect.ownKeys(f).filter(i=>{var d=s.get(i);return d===void 0||d.v!==b});for(var[t,r]of s)r.v!==b&&!(t in f)&&e.push(t);return e},setPrototypeOf(){M()}})}function S(n,a=1){c(n,n.v+a)}function T(n){return n!==null&&typeof n=="object"&&x in n?n[x]:n}function C(n,a){return Object.is(T(n),T(a))}function k(n,a,v){if(n==null)return a(void 0),j;const u=U(()=>n.subscribe(a,v));return u.unsubscribe?()=>u.unsubscribe():u}let P=!1;function F(n,a,v){const u=v[a]??(v[a]={store:null,source:Z(void 0),unsubscribe:j});if(u.store!==n)if(u.unsubscribe(),u.store=n,n==null)u.source.v=void 0,u.unsubscribe=j;else{var s=!0;u.unsubscribe=k(n,g=>{s?u.source.v=g:c(u.source,g)}),s=!1}return w(u.source)}function G(){const n={};return Y(()=>{for(var a in n)n[a].unsubscribe()}),n}function H(n){var a=P;try{return P=!1,[n(),P]}finally{P=a}}export{F as a,H as c,C as i,_ as p,G as s};
