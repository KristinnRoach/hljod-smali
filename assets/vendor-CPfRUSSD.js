const Lo=(i,e)=>i===e,Wt=Symbol("solid-proxy"),Js=Symbol("solid-track"),ws={equals:Lo};let Mr=_r;const Mt=1,Ms=2,Er={owned:null,cleanups:null,context:null,owner:null};var O=null;let Ws=null,Fo=null,D=null,ee=null,nt=null,Ls=0;function yi(i,e){const t=D,n=O,s=i.length===0,r=e===void 0?n:e,o=s?Er:{owned:null,cleanups:null,context:r?r.context:null,owner:r},l=s?i:()=>i(()=>it(()=>Di(o)));O=o,D=null;try{return Gt(l,!0)}finally{D=t,O=n}}function Ca(i,e){e=e?Object.assign({},ws,e):ws;const t={value:i,observers:null,observerSlots:null,comparator:e.equals||void 0},n=s=>(typeof s=="function"&&(s=s(t.value)),Pr(t,s));return[Ar.bind(t),n]}function ki(i,e,t){const n=Ia(i,e,!1,Mt);xi(n)}function Sr(i,e,t){Mr=$o;const n=Ia(i,e,!1,Mt);(!t||!t.render)&&(n.user=!0),nt?nt.push(n):xi(n)}function Cn(i,e,t){t=t?Object.assign({},ws,t):ws;const n=Ia(i,e,!0,0);return n.observers=null,n.observerSlots=null,n.comparator=t.equals||void 0,xi(n),Ar.bind(n)}function Bo(i){return Gt(i,!1)}function it(i){if(D===null)return i();const e=D;D=null;try{return i()}finally{D=e}}function uc(i){Sr(()=>it(i))}function ea(i){return O===null||(O.cleanups===null?O.cleanups=[i]:O.cleanups.push(i)),i}function ta(){return D}function Wo(){return O}function Go(i,e){const t=O,n=D;O=i,D=null;try{return Gt(e,!0)}catch(s){xa(s)}finally{O=t,D=n}}function Ar(){if(this.sources&&this.state)if(this.state===Mt)xi(this);else{const i=ee;ee=null,Gt(()=>Ss(this),!1),ee=i}if(D){const i=this.observers;if(!i||i[i.length-1]!==D){const e=i?i.length:0;D.sources?(D.sources.push(this),D.sourceSlots.push(e)):(D.sources=[this],D.sourceSlots=[e]),i?(i.push(D),this.observerSlots.push(D.sources.length-1)):(this.observers=[D],this.observerSlots=[D.sources.length-1])}}return this.value}function Pr(i,e,t){let n=i.value;return(!i.comparator||!i.comparator(n,e))&&(i.value=e,i.observers&&i.observers.length&&Gt(()=>{for(let s=0;s<i.observers.length;s+=1){const r=i.observers[s],o=Ws&&Ws.running;o&&Ws.disposed.has(r),(o?!r.tState:!r.state)&&(r.pure?ee.push(r):nt.push(r),r.observers&&Tr(r)),o||(r.state=Mt)}if(ee.length>1e6)throw ee=[],new Error},!1)),e}function xi(i){if(!i.fn)return;Di(i);const e=Ls;Uo(i,i.value,e)}function Uo(i,e,t){let n;const s=O,r=D;D=O=i;try{n=i.fn(e)}catch(o){return i.pure&&(i.state=Mt,i.owned&&i.owned.forEach(Di),i.owned=null),i.updatedAt=t+1,xa(o)}finally{D=r,O=s}(!i.updatedAt||i.updatedAt<=t)&&(i.updatedAt!=null&&"observers"in i?Pr(i,n):i.value=n,i.updatedAt=t)}function Ia(i,e,t,n=Mt,s){const r={fn:i,state:n,updatedAt:null,owned:null,sources:null,sourceSlots:null,cleanups:null,value:e,owner:O,context:O?O.context:null,pure:t};return O===null||O!==Er&&(O.owned?O.owned.push(r):O.owned=[r]),r}function Es(i){if(i.state===0)return;if(i.state===Ms)return Ss(i);if(i.suspense&&it(i.suspense.inFallback))return i.suspense.effects.push(i);const e=[i];for(;(i=i.owner)&&(!i.updatedAt||i.updatedAt<Ls);)i.state&&e.push(i);for(let t=e.length-1;t>=0;t--)if(i=e[t],i.state===Mt)xi(i);else if(i.state===Ms){const n=ee;ee=null,Gt(()=>Ss(i,e[0]),!1),ee=n}}function Gt(i,e){if(ee)return i();let t=!1;e||(ee=[]),nt?t=!0:nt=[],Ls++;try{const n=i();return zo(t),n}catch(n){t||(nt=null),ee=null,xa(n)}}function zo(i){if(ee&&(_r(ee),ee=null),i)return;const e=nt;nt=null,e.length&&Gt(()=>Mr(e),!1)}function _r(i){for(let e=0;e<i.length;e++)Es(i[e])}function $o(i){let e,t=0;for(e=0;e<i.length;e++){const n=i[e];n.user?i[t++]=n:Es(n)}for(e=0;e<t;e++)Es(i[e])}function Ss(i,e){i.state=0;for(let t=0;t<i.sources.length;t+=1){const n=i.sources[t];if(n.sources){const s=n.state;s===Mt?n!==e&&(!n.updatedAt||n.updatedAt<Ls)&&Es(n):s===Ms&&Ss(n,e)}}}function Tr(i){for(let e=0;e<i.observers.length;e+=1){const t=i.observers[e];t.state||(t.state=Ms,t.pure?ee.push(t):nt.push(t),t.observers&&Tr(t))}}function Di(i){let e;if(i.sources)for(;i.sources.length;){const t=i.sources.pop(),n=i.sourceSlots.pop(),s=t.observers;if(s&&s.length){const r=s.pop(),o=t.observerSlots.pop();n<s.length&&(r.sourceSlots[o]=n,s[n]=r,t.observerSlots[n]=o)}}if(i.tOwned){for(e=i.tOwned.length-1;e>=0;e--)Di(i.tOwned[e]);delete i.tOwned}if(i.owned){for(e=i.owned.length-1;e>=0;e--)Di(i.owned[e]);i.owned=null}if(i.cleanups){for(e=i.cleanups.length-1;e>=0;e--)i.cleanups[e]();i.cleanups=null}i.state=0}function Ho(i){return i instanceof Error?i:new Error(typeof i=="string"?i:"Unknown error",{cause:i})}function xa(i,e=O){throw Ho(i)}const jo=Symbol("fallback");function Wa(i){for(let e=0;e<i.length;e++)i[e]()}function qo(i,e,t={}){let n=[],s=[],r=[],o=0,l=e.length>1?[]:null;return ea(()=>Wa(r)),()=>{let h=i()||[],c=h.length,f,d;return h[Js],it(()=>{let M,E,A,S,P,R,z,ze,zt;if(c===0)o!==0&&(Wa(r),r=[],n=[],s=[],o=0,l&&(l=[])),t.fallback&&(n=[jo],s[0]=yi(Vo=>(r[0]=Vo,t.fallback())),o=1);else if(o===0){for(s=new Array(c),d=0;d<c;d++)n[d]=h[d],s[d]=yi(g);o=c}else{for(A=new Array(c),S=new Array(c),l&&(P=new Array(c)),R=0,z=Math.min(o,c);R<z&&n[R]===h[R];R++);for(z=o-1,ze=c-1;z>=R&&ze>=R&&n[z]===h[ze];z--,ze--)A[ze]=s[z],S[ze]=r[z],l&&(P[ze]=l[z]);for(M=new Map,E=new Array(ze+1),d=ze;d>=R;d--)zt=h[d],f=M.get(zt),E[d]=f===void 0?-1:f,M.set(zt,d);for(f=R;f<=z;f++)zt=n[f],d=M.get(zt),d!==void 0&&d!==-1?(A[d]=s[f],S[d]=r[f],l&&(P[d]=l[f]),d=E[d],M.set(zt,d)):r[f]();for(d=R;d<c;d++)d in A?(s[d]=A[d],r[d]=S[d],l&&(l[d]=P[d],l[d](d))):s[d]=yi(g);s=s.slice(0,o=c),n=h.slice(0)}return s});function g(M){if(r[d]=M,l){const[E,A]=Ca(d);return l[d]=A,e(h[d],E)}return e(h[d])}}}function dc(i,e){return it(()=>i(e||{}))}const Ko=i=>`Stale read from <${i}>.`;function pc(i){const e="fallback"in i&&{fallback:()=>i.fallback};return Cn(qo(()=>i.each,i.children,e||void 0))}function fc(i){const e=i.keyed,t=Cn(()=>i.when,void 0,void 0),n=e?t:Cn(t,void 0,{equals:(s,r)=>!s==!r});return Cn(()=>{const s=n();if(s){const r=i.children;return typeof r=="function"&&r.length>0?it(()=>r(e?s:()=>{if(!it(n))throw Ko("Show");return t()})):r}return i.fallback},void 0,void 0)}const Yo=new Set(["innerHTML","textContent","innerText","children"]),Zo=Object.assign(Object.create(null),{className:"class",htmlFor:"for"}),Qo=new Set(["beforeinput","click","dblclick","contextmenu","focusin","focusout","input","keydown","keyup","mousedown","mousemove","mouseout","mouseover","mouseup","pointerdown","pointermove","pointerout","pointerover","pointerup","touchend","touchmove","touchstart"]),Xo={xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace"},mc=i=>Cn(()=>i());function Jo(i,e,t){let n=t.length,s=e.length,r=n,o=0,l=0,h=e[s-1].nextSibling,c=null;for(;o<s||l<r;){if(e[o]===t[l]){o++,l++;continue}for(;e[s-1]===t[r-1];)s--,r--;if(s===o){const f=r<n?l?t[l-1].nextSibling:t[r-l]:h;for(;l<r;)i.insertBefore(t[l++],f)}else if(r===l)for(;o<s;)(!c||!c.has(e[o]))&&e[o].remove(),o++;else if(e[o]===t[r-1]&&t[l]===e[s-1]){const f=e[--s].nextSibling;i.insertBefore(t[l++],e[o++].nextSibling),i.insertBefore(t[--r],f),e[s]=t[r]}else{if(!c){c=new Map;let d=l;for(;d<r;)c.set(t[d],d++)}const f=c.get(e[o]);if(f!=null)if(l<f&&f<r){let d=o,g=1,M;for(;++d<s&&d<r&&!((M=c.get(e[d]))==null||M!==f+g);)g++;if(g>f-l){const E=e[o];for(;l<f;)i.insertBefore(t[l++],E)}else i.replaceChild(t[l++],e[o++])}else o++;else e[o++].remove()}}}const Ga="_$DX_DELEGATE";function gc(i,e,t,n={}){let s;return yi(r=>{s=r,e===document?i():ia(e,i(),e.firstChild?null:void 0,t)},n.owner),()=>{s(),e.textContent=""}}function bc(i,e,t,n){let s;const r=()=>{const l=n?document.createElementNS("http://www.w3.org/1998/Math/MathML","template"):document.createElement("template");return l.innerHTML=i,t?l.content.firstChild.firstChild:n?l.firstChild:l.content.firstChild},o=e?()=>it(()=>document.importNode(s||(s=r()),!0)):()=>(s||(s=r())).cloneNode(!0);return o.cloneNode=o,o}function el(i,e=window.document){const t=e[Ga]||(e[Ga]=new Set);for(let n=0,s=i.length;n<s;n++){const r=i[n];t.has(r)||(t.add(r),e.addEventListener(r,cl))}}function na(i,e,t){t==null?i.removeAttribute(e):i.setAttribute(e,t)}function tl(i,e,t,n){n==null?i.removeAttributeNS(e,t):i.setAttributeNS(e,t,n)}function nl(i,e,t){t?i.setAttribute(e,""):i.removeAttribute(e)}function il(i,e){e==null?i.removeAttribute("class"):i.className=e}function sl(i,e,t,n){if(n)Array.isArray(t)?(i[`$$${e}`]=t[0],i[`$$${e}Data`]=t[1]):i[`$$${e}`]=t;else if(Array.isArray(t)){const s=t[0];i.addEventListener(e,t[0]=r=>s.call(i,t[1],r))}else i.addEventListener(e,t,typeof t!="function"&&t)}function al(i,e,t={}){const n=Object.keys(e||{}),s=Object.keys(t);let r,o;for(r=0,o=s.length;r<o;r++){const l=s[r];!l||l==="undefined"||e[l]||(Ua(i,l,!1),delete t[l])}for(r=0,o=n.length;r<o;r++){const l=n[r],h=!!e[l];!l||l==="undefined"||t[l]===h||!h||(Ua(i,l,!0),t[l]=h)}return t}function rl(i,e,t){if(!e)return t?na(i,"style"):e;const n=i.style;if(typeof e=="string")return n.cssText=e;typeof t=="string"&&(n.cssText=t=void 0),t||(t={}),e||(e={});let s,r;for(r in t)e[r]==null&&n.removeProperty(r),delete t[r];for(r in e)s=e[r],s!==t[r]&&(n.setProperty(r,s),t[r]=s);return t}function yc(i,e,t){t!=null?i.style.setProperty(e,t):i.style.removeProperty(e)}function vc(i,e={},t,n){const s={};return ki(()=>typeof e.ref=="function"&&ol(e.ref,i)),ki(()=>ll(i,e,t,!0,s,!0)),s}function ol(i,e,t){return it(()=>i(e,t))}function ia(i,e,t,n){if(t!==void 0&&!n&&(n=[]),typeof e!="function")return As(i,e,n,t);ki(s=>As(i,e(),s,t),n)}function ll(i,e,t,n,s={},r=!1){e||(e={});for(const o in s)if(!(o in e)){if(o==="children")continue;s[o]=za(i,o,null,s[o],t,r,e)}for(const o in e){if(o==="children")continue;const l=e[o];s[o]=za(i,o,l,s[o],t,r,e)}}function hl(i){return i.toLowerCase().replace(/-([a-z])/g,(e,t)=>t.toUpperCase())}function Ua(i,e,t){const n=e.trim().split(/\s+/);for(let s=0,r=n.length;s<r;s++)i.classList.toggle(n[s],t)}function za(i,e,t,n,s,r,o){let l,h,c,f;if(e==="style")return rl(i,t,n);if(e==="classList")return al(i,t,n);if(t===n)return n;if(e==="ref")r||t(i);else if(e.slice(0,3)==="on:"){const d=e.slice(3);n&&i.removeEventListener(d,n,typeof n!="function"&&n),t&&i.addEventListener(d,t,typeof t!="function"&&t)}else if(e.slice(0,10)==="oncapture:"){const d=e.slice(10);n&&i.removeEventListener(d,n,!0),t&&i.addEventListener(d,t,!0)}else if(e.slice(0,2)==="on"){const d=e.slice(2).toLowerCase(),g=Qo.has(d);if(!g&&n){const M=Array.isArray(n)?n[0]:n;i.removeEventListener(d,M)}(g||t)&&(sl(i,d,t,g),g&&el([d]))}else if(e.slice(0,5)==="attr:")na(i,e.slice(5),t);else if(e.slice(0,5)==="bool:")nl(i,e.slice(5),t);else if((f=e.slice(0,5)==="prop:")||(c=Yo.has(e))||(l=i.nodeName.includes("-")||"is"in o))f&&(e=e.slice(5),h=!0),e==="class"||e==="className"?il(i,t):l&&!h&&!c?i[hl(e)]=t:(e==="value"||e==="defaultValue")&&(i.nodeName==="INPUT"||i.nodeName==="TEXTAREA")?i[e]=t??"":i[e]=t;else{const d=e.indexOf(":")>-1&&Xo[e.split(":")[0]];d?tl(i,d,e,t):na(i,Zo[e]||e,t)}return t}function cl(i){let e=i.target;const t=`$$${i.type}`,n=i.target,s=i.currentTarget,r=h=>Object.defineProperty(i,"target",{configurable:!0,value:h}),o=()=>{const h=e[t];if(h&&!e.disabled){const c=e[`${t}Data`];if(c!==void 0?h.call(e,c,i):h.call(e,i),i.cancelBubble)return}return e.host&&typeof e.host!="string"&&!e.host._$host&&e.contains(i.target)&&r(e.host),!0},l=()=>{for(;o()&&(e=e._$host||e.parentNode||e.host););};if(Object.defineProperty(i,"currentTarget",{configurable:!0,get(){return e||document}}),i.composedPath){const h=i.composedPath();r(h[0]);for(let c=0;c<h.length-2&&(e=h[c],!!o());c++){if(e._$host){e=e._$host,l();break}if(e.parentNode===s)break}}else l();r(n)}function As(i,e,t,n,s){for(;typeof t=="function";)t=t();if(e===t)return t;const r=typeof e,o=n!==void 0;if(i=o&&t[0]&&t[0].parentNode||i,r==="string"||r==="number"){if(r==="number"&&(e=e.toString(),e===t))return t;if(o){let l=t[0];l&&l.nodeType===3?l.data!==e&&(l.data=e):l=document.createTextNode(e),t=$t(i,t,n,l)}else t!==""&&typeof t=="string"?t=i.firstChild.data=e:t=i.textContent=e}else if(e==null||r==="boolean")t=$t(i,t,n);else{if(r==="function")return ki(()=>{let l=e();for(;typeof l=="function";)l=l();t=As(i,l,t,n)}),()=>t;if(Array.isArray(e)){const l=[],h=t&&Array.isArray(t);if(sa(l,e,t,s))return ki(()=>t=As(i,l,t,n,!0)),()=>t;if(l.length===0){if(t=$t(i,t,n),o)return t}else h?t.length===0?$a(i,l,n):Jo(i,t,l):(t&&$t(i),$a(i,l));t=l}else if(e.nodeType){if(Array.isArray(t)){if(o)return t=$t(i,t,n,e);$t(i,t,null,e)}else t==null||t===""||!i.firstChild?i.appendChild(e):i.replaceChild(e,i.firstChild);t=e}}return t}function sa(i,e,t,n){let s=!1;for(let r=0,o=e.length;r<o;r++){let l=e[r],h=t&&t[i.length],c;if(!(l==null||l===!0||l===!1))if((c=typeof l)=="object"&&l.nodeType)i.push(l);else if(Array.isArray(l))s=sa(i,l,h)||s;else if(c==="function")if(n){for(;typeof l=="function";)l=l();s=sa(i,Array.isArray(l)?l:[l],Array.isArray(h)?h:[h])||s}else i.push(l),s=!0;else{const f=String(l);h&&h.nodeType===3&&h.data===f?i.push(h):i.push(document.createTextNode(f))}}return s}function $a(i,e,t=null){for(let n=0,s=e.length;n<s;n++)i.insertBefore(e[n],t)}function $t(i,e,t,n){if(t===void 0)return i.textContent="";const s=n||document.createTextNode("");if(e.length){let r=!1;for(let o=e.length-1;o>=0;o--){const l=e[o];if(s!==l){const h=l.parentNode===i;!r&&!o?h?i.replaceChild(s,l):i.insertBefore(s,t):h&&l.remove()}else r=!0}}else i.insertBefore(s,t);return[s]}const ul="http://www.w3.org/2000/svg";function dl(i,e=!1,t=void 0){return e?document.createElementNS(ul,i):document.createElement(i,{is:t})}function wc(i){const{useShadow:e}=i,t=document.createTextNode(""),n=()=>i.mount||document.body,s=Wo();let r;return Sr(()=>{r||(r=Go(s,()=>Cn(()=>i.children)));const o=n();if(o instanceof HTMLHeadElement){const[l,h]=Ca(!1),c=()=>h(!0);yi(f=>ia(o,()=>l()?f():r(),null)),ea(c)}else{const l=dl(i.isSVG?"g":"div",i.isSVG),h=e&&l.attachShadow?l.attachShadow({mode:"open"}):l;Object.defineProperty(l,"_$host",{get(){return t.parentNode},configurable:!0}),ia(h,r),o.appendChild(l),i.ref&&i.ref(l),ea(()=>o.contains(l)&&o.removeChild(l))}},void 0,{render:!0}),t}async function pl(i={echoCancellation:!1,noiseSuppression:!0,autoGainControl:!0},e=""){try{return await navigator.mediaDevices.getUserMedia({audio:e?{...i,deviceId:{exact:e}}:i})}catch(t){if(e&&t.name==="OverconstrainedError")return console.warn("Requested audio input device unavailable, falling back to default"),navigator.mediaDevices.getUserMedia({audio:i});throw t}}const fl={KeyZ:48,KeyS:49,KeyX:50,KeyD:51,KeyC:52,KeyV:53,KeyG:54,KeyB:55,KeyH:56,KeyN:57,KeyJ:58,KeyM:59,Comma:60,KeyL:61,Period:62,Semicolon:63,Slash:64,KeyQ:60,Digit2:61,KeyW:62,Digit3:63,KeyE:64,KeyR:65,Digit5:66,KeyT:67,Digit6:68,KeyY:69,Digit7:70,KeyU:71,KeyI:72,Digit9:73,KeyO:74,Digit0:75,KeyP:76,BracketLeft:77,Equal:78,BracketRight:79,Numpad1:60,Numpad2:62,Numpad3:64,Numpad4:65,Numpad5:67,Numpad6:69,Numpad7:71,Numpad8:72,Numpad9:74};function Fs(i){const{baseNote:e,scale:t}=i;if(t.length===0)throw new RangeError("scale must contain at least one interval");const n=[["KeyZ","KeyX","KeyC","KeyV","KeyB","KeyN","KeyM","Comma","Period","Slash"],["KeyA","KeyS","KeyD","KeyF","KeyG","KeyH","KeyJ","KeyK","KeyL","Semicolon","Quote","Backslash"],["KeyQ","KeyW","KeyE","KeyR","KeyT","KeyY","KeyU","KeyI","KeyO","KeyP","BracketLeft","BracketRight"],["Digit1","Digit2","Digit3","Digit4","Digit5","Digit6","Digit7","Digit8","Digit9","Digit0","Minus","Equal"]],s={};return n.forEach((r,o)=>{const l=e+o*12;r.forEach((h,c)=>{const f=c%t.length,d=Math.floor(c/t.length);s[h]=l+d*12+t[f]})}),["Numpad1","Numpad2","Numpad3","Numpad4","Numpad5","Numpad6","Numpad7","Numpad8","Numpad9"].forEach((r,o)=>{const l=o%t.length,h=Math.floor(o/t.length);s[r]=e+36+h*12+t[l]}),s}const ml=Fs({baseNote:36,scale:[0,2,4,5,7,9,11]}),gl=Fs({baseNote:36,scale:[0,2,3,5,7,8,10]}),bl=Fs({baseNote:36,scale:[0,2,4,7,9]}),yl=Fs({baseNote:48,scale:[0,1,2,3,4,5,6,7,8,9,10,11]}),Mc="major",Ec={piano:fl,major:ml,minor:gl,pentatonic:bl,chromatic:yl};var vl=Object.defineProperty,Nr=i=>{throw TypeError(i)},wl=(i,e,t)=>e in i?vl(i,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[e]=t,y=(i,e,t)=>wl(i,typeof e!="symbol"?e+"":e,t),Oa=(i,e,t)=>e.has(i)||Nr("Cannot "+t),a=(i,e,t)=>(Oa(i,e,"read from private field"),t?t.call(i):e.get(i)),p=(i,e,t)=>e.has(i)?Nr("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(i):e.set(i,t),u=(i,e,t,n)=>(Oa(i,e,"write to private field"),e.set(i,t),t),b=(i,e,t)=>(Oa(i,e,"access private method"),t),Gs=(i,e,t,n)=>({set _(s){u(i,e,s)},get _(){return a(i,e,n)}});const Ml=48e3,El={sampleRate:Ml};function Sl(i,e=!1){if(i==null)return!1;const t=.001,n=240,s=1,r=2;if(i.duration<t)return console.warn(`Audio duration is too short: ${i.duration} seconds. Must be longer than ${t} seconds`),!1;if(i.duration>n)return console.warn(`Audio duration is too long: ${i.duration} seconds. Must be shorter than ${n} seconds`),!1;if(i.numberOfChannels<s||i.numberOfChannels>r)return console.warn("Invalid number of audio channels."),!1;let o=!1,l=0,h=0;for(let c=0;c<i.numberOfChannels;c++)try{const f=i.getChannelData(c);if(!f||f.length===0)return!1;let d=0;for(let M=0;M<f.length;M++){const E=Math.abs(f[M]);E>0&&(o=!0),E>l&&(l=E),d+=E*E}const g=Math.sqrt(d/f.length);if(g>h&&(h=g),o)break}catch{return!1}if(o){if(e){const c=20*Math.log10(l),f=20*Math.log10(h);console.log(`AudioBuffer Analysis:
      Duration: ${i.duration} seconds
      Peak amplitude: ${l.toFixed(4)} (${c.toFixed(1)} dB)
      RMS amplitude: ${h.toFixed(4)} (${f.toFixed(1)} dB)
    `)}}else console.warn("Invalid Buffer: No non-zero data.");return o}var vi,Ps,Ne,bt,Fe,qt,Kt,Yt,wi,En,fe,kr,Ha,Dr,aa,ra,Wn;class ja{constructor(e,t,n,s=1024){p(this,fe),p(this,vi),p(this,Ps),p(this,Ne),p(this,bt),p(this,Fe),p(this,qt),p(this,Kt),p(this,Yt,null),p(this,wi,new Map),p(this,En,null),u(this,vi,e),u(this,Ps,t),u(this,Ne,n),u(this,bt,e.createAnalyser()),u(this,Fe,e.createAnalyser()),a(this,bt).fftSize=s,a(this,Fe).fftSize=s,u(this,qt,new Float32Array(a(this,bt).fftSize)),u(this,Kt,new Float32Array(a(this,Fe).fftSize))}start(e=1e3,t,n=!1){return this.stop(),b(this,fe,kr).call(this),u(this,Yt,window.setInterval(()=>{const s=this.getLevels();t&&t(s),n&&b(this,fe,Dr).call(this,s)},e)),this}getLevels(){a(this,bt).getFloatTimeDomainData(a(this,qt)),a(this,Fe).getFloatTimeDomainData(a(this,Kt));const e=b(this,fe,aa).call(this,a(this,qt)),t=b(this,fe,aa).call(this,a(this,Kt)),n=b(this,fe,ra).call(this,a(this,qt)),s=b(this,fe,ra).call(this,a(this,Kt)),r=b(this,fe,Wn).call(this,e),o=b(this,fe,Wn).call(this,t),l=b(this,fe,Wn).call(this,n),h=b(this,fe,Wn).call(this,s),c=l-h;return{input:{rms:e,peak:n,rmsDB:r,peakDB:l},output:{rms:t,peak:s,rmsDB:o,peakDB:h},gainChange:c,gainChangeDB:c}}stop(){if(a(this,Yt)){window.clearInterval(a(this,Yt)),u(this,Yt,null);try{a(this,bt).disconnect(),a(this,Fe).disconnect(),a(this,En)&&(a(this,En).disconnect(),u(this,En,null));const e=a(this,wi).get(a(this,Ne));if(e){a(this,Ne).disconnect();for(const t of e)t.node instanceof AudioNode?a(this,Ne).connect(t.node,t.output,t.input):t.node instanceof AudioParam&&a(this,Ne).connect(t.node,t.output)}a(this,wi).clear()}catch(e){console.error("Error removing level monitoring:",e)}}}}vi=new WeakMap,Ps=new WeakMap,Ne=new WeakMap,bt=new WeakMap,Fe=new WeakMap,qt=new WeakMap,Kt=new WeakMap,Yt=new WeakMap,wi=new WeakMap,En=new WeakMap,fe=new WeakSet,kr=function(){try{const i=b(this,fe,Ha).call(this,a(this,Ne));a(this,wi).set(a(this,Ne),i);const e=a(this,vi).createGain();e.gain.value=1,a(this,Ps).connect(e),e.connect(a(this,bt)),a(this,Ne).disconnect(),a(this,Ne).connect(a(this,Fe));for(const t of i)t.node instanceof AudioNode?a(this,Fe).connect(t.node,t.output,t.input):t.node instanceof AudioParam&&a(this,Fe).connect(t.node,t.output);u(this,En,e)}catch(i){console.error("Error setting up level monitoring:",i)}},Ha=function(i){return[{node:a(this,vi).destination,output:0,input:0}]},Dr=function(i){console.log(`Audio Levels:
       Input:  RMS ${i.input.rmsDB.toFixed(1)} dB | Peak ${i.input.peakDB.toFixed(1)} dB
       Output: RMS ${i.output.rmsDB.toFixed(1)} dB | Peak ${i.output.peakDB.toFixed(1)} dB
       Gain Change: ${i.gainChangeDB>0?"+":""}${i.gainChangeDB.toFixed(1)} dB`)},aa=function(i){let e=0;for(let t=0;t<i.length;t++)e+=i[t]*i[t];return Math.sqrt(e/i.length)},ra=function(i){let e=0;for(let t=0;t<i.length;t++){const n=Math.abs(i[t]);n>e&&(e=n)}return e},Wn=function(i){return i<1e-7?-100:20*Math.log10(i)};function qa(i,e,t=.9){const n=e.numberOfChannels,s=e.length,r=e.sampleRate;let o=0;for(let c=0;c<n;c++){const f=e.getChannelData(c);for(let d=0;d<s;d++){const g=Math.abs(f[d]);g>o&&(o=g)}}if(o===0)return e;const l=t/o,h=i.createBuffer(n,s,r);for(let c=0;c<n;c++){const f=e.getChannelData(c),d=h.getChannelData(c);for(let g=0;g<s;g++)d[g]=f[g]*l}return h}const Al=1e-4;function Ka(i,e=Al){const t=i.getChannelData(0),n=i.sampleRate,s=[];for(let r=1;r<t.length;r++)if(Math.abs(t[r])<e)s.push(r/n);else if(Math.sign(t[r])!==Math.sign(t[r-1])){const o=-t[r-1]/(t[r]-t[r-1]),l=(r-1+o)/n;s.push(l)}return s}const Rr=["pulse","bandlimited-sawtooth","supersaw","warm-pad","metallic","formant","white-noise","pink-noise","brown-noise","colored-noise","random-harmonic","custom-function"],Sc=["sine","sawtooth","square","triangle",...Rr];function Pl(i){return Rr.includes(i)}function _l(i,e,t={}){switch(e){case"pulse":return Tl(i,{dutyCycle:t.dutyCycle,harmonics:t.harmonics});case"bandlimited-sawtooth":return Nl(i,{harmonics:t.harmonics,rolloff:t.rolloff});case"supersaw":return kl(i,{voices:t.voices,detune:t.detune,harmonics:t.harmonics});case"warm-pad":return Dl(i,{brightness:t.brightness,harmonics:t.harmonics});case"metallic":return Rl(i,{inharmonicity:t.inharmonicity,harmonics:t.harmonics});case"formant":return Cl(i,{formantFreqs:t.formantFreqs,formantBandwidths:t.formantBandwidths,fundamentalFreq:t.fundamentalFreq,harmonics:t.harmonics});case"white-noise":return xl(i,{harmonics:t.harmonics,seed:t.seed});case"pink-noise":return Ol(i,{harmonics:t.harmonics,seed:t.seed});case"brown-noise":return Vl(i,{harmonics:t.harmonics,seed:t.seed});case"colored-noise":return Ll(i,{slope:t.slope,harmonics:t.harmonics,seed:t.seed});case"random-harmonic":return Fl(i,{chaos:t.chaos,harmonicDensity:t.harmonicDensity,harmonics:t.harmonics,seed:t.seed});case"custom-function":return Il(i,t.waveFunction||(n=>Math.sin(n)),{harmonics:t.harmonics});default:throw new Error(`Invalid waveform type: ${e}`)}}function Tl(i,e={}){const{dutyCycle:t=.5,harmonics:n=32}=e,s=new Float32Array(n+1),r=new Float32Array(n+1);for(let o=1;o<=n;o++)s[o]=0,r[o]=2/Math.PI*Math.sin(o*Math.PI*t)/o;return i.createPeriodicWave(s,r,{disableNormalization:!1})}function Nl(i,e={}){const{harmonics:t=32,rolloff:n=1}=e,s=new Float32Array(t+1),r=new Float32Array(t+1);for(let o=1;o<=t;o++)s[o]=0,r[o]=1/o*Math.pow(o,-n+1),o%2===0&&(r[o]*=-1);return i.createPeriodicWave(s,r,{disableNormalization:!1})}function kl(i,e={}){const{voices:t=7,detune:n=25,harmonics:s=16}=e,r=new Float32Array(s+1),o=new Float32Array(s+1);for(let l=0;l<t;l++){const h=l===0?0:(l%2===1?1:-1)*Math.ceil(l/2)*(n/Math.ceil(t/2)),c=Math.pow(2,h/1200);for(let f=1;f<=s;f++){const d=f*c;if(d<=s){const g=1/t*(1/f);o[Math.floor(d)]+=g*(f%2===1?1:-1)}}}return i.createPeriodicWave(r,o,{disableNormalization:!1})}function Dl(i,e={}){const{brightness:t=.3,harmonics:n=64}=e,s=new Float32Array(n+1),r=new Float32Array(n+1);for(let o=1;o<=n;o++){const l=1/o*Math.exp(-o*(1-t)*.1);o%2===1&&(r[o]=l),o%2===0&&o<=n/2&&(r[o]=l*.3)}return i.createPeriodicWave(s,r,{disableNormalization:!1})}function Rl(i,e={}){const{inharmonicity:t=.2,harmonics:n=32}=e,s=new Float32Array(n+1),r=new Float32Array(n+1);for(let o=1;o<=n;o++){const l=Math.sqrt(1+t*o*o),h=Math.round(o*l);if(h<=n){const c=1/(o*o);s[h]+=c*.3,r[h]+=c*.7}}return i.createPeriodicWave(s,r,{disableNormalization:!1})}function Cl(i,e={}){const{formantFreqs:t=[800,1200,2600],formantBandwidths:n=[80,120,260],fundamentalFreq:s=440,harmonics:r=64}=e,o=new Float32Array(r+1),l=new Float32Array(r+1);for(let h=1;h<=r;h++){const c=h*s;let f=1/h;for(let d=0;d<t.length;d++){const g=t[d],M=n[d]||100,E=Math.abs(c-g),A=1/(1+Math.pow(E/M,2));f*=1+A*2}l[h]=f*(h%2===1?1:-1)}return i.createPeriodicWave(o,l,{disableNormalization:!1})}function Il(i,e,t={}){const{harmonics:n=32}=t,s=new Float32Array(n+1),r=new Float32Array(n+1),o=2048,l=new Float32Array(o);for(let h=0;h<o;h++){const c=h/o*2*Math.PI;l[h]=e(c)}for(let h=1;h<=n;h++){let c=0,f=0;for(let d=0;d<o;d++){const g=d/o*2*Math.PI*h;c+=l[d]*Math.cos(g),f+=l[d]*Math.sin(g)}s[h]=c/o,r[h]=f/o}return i.createPeriodicWave(s,r,{disableNormalization:!1})}function xl(i,e={}){const{harmonics:t=64,seed:n}=e,s=new Float32Array(t+1),r=new Float32Array(t+1);let o=n!==void 0?n:Math.random()*1e6;const l=()=>(o=(o*9301+49297)%233280,o/233280);for(let h=1;h<=t;h++){const c=1/Math.sqrt(t),f=l()*2*Math.PI;s[h]=c*Math.cos(f),r[h]=c*Math.sin(f)}return i.createPeriodicWave(s,r,{disableNormalization:!1})}function Ol(i,e={}){const{harmonics:t=64,seed:n}=e,s=new Float32Array(t+1),r=new Float32Array(t+1);let o=n!==void 0?n:Math.random()*1e6;const l=()=>(o=(o*9301+49297)%233280,o/233280);for(let h=1;h<=t;h++){const c=1/Math.sqrt(h*t),f=l()*2*Math.PI;s[h]=c*Math.cos(f),r[h]=c*Math.sin(f)}return i.createPeriodicWave(s,r,{disableNormalization:!1})}function Vl(i,e={}){const{harmonics:t=64,seed:n}=e,s=new Float32Array(t+1),r=new Float32Array(t+1);let o=n!==void 0?n:Math.random()*1e6;const l=()=>(o=(o*9301+49297)%233280,o/233280);for(let h=1;h<=t;h++){const c=1/(h*Math.sqrt(t)),f=l()*2*Math.PI;s[h]=c*Math.cos(f),r[h]=c*Math.sin(f)}return i.createPeriodicWave(s,r,{disableNormalization:!1})}function Ll(i,e={}){const{slope:t=0,harmonics:n=64,seed:s}=e,r=new Float32Array(n+1),o=new Float32Array(n+1);let l=s!==void 0?s:Math.random()*1e6;const h=()=>(l=(l*9301+49297)%233280,l/233280);for(let c=1;c<=n;c++){const f=1/(Math.pow(c,t/2)*Math.sqrt(n)),d=h()*2*Math.PI;r[c]=f*Math.cos(d),o[c]=f*Math.sin(d)}return i.createPeriodicWave(r,o,{disableNormalization:!1})}function Fl(i,e={}){const{chaos:t=.5,harmonicDensity:n=.7,harmonics:s=32,seed:r}=e,o=new Float32Array(s+1),l=new Float32Array(s+1);let h=r!==void 0?r:Math.random()*1e6;const c=()=>(h=(h*9301+49297)%233280,h/233280);for(let f=1;f<=s;f++)if(c()<n){const d=1/f,g=1+(c()-.5)*2*t,M=d*g,E=c()*2*Math.PI;c()>.5?o[f]=M*Math.cos(E):l[f]=M*Math.sin(E)}return i.createPeriodicWave(o,l,{disableNormalization:!1})}const Cr=[["C"],["C#","Db"],["D"],["D#","Eb"],["E"],["F"],["F#","Gb"],["G"],["G#","Ab"],["A"],["A#","Bb"],["B"]],Bl={C:0,"C#":1,Db:1,D:2,"D#":3,Eb:3,E:4,F:5,"F#":6,Gb:6,G:7,"G#":8,Ab:8,A:9,"A#":10,Bb:10,B:11},Wl={chromatic:[0,1,2,3,4,5,6,7,8,9,10,11],major:[0,2,4,5,7,9,11],minor:[0,2,3,5,7,8,10],harmonic_minor:[0,2,3,5,7,8,11],melodic_minor:[0,2,3,5,7,9,11],lydian:[0,2,4,6,7,9,10],dorian:[0,2,3,5,7,9,10],phrygian:[0,1,3,5,7,8,10],mixolydian:[0,2,4,5,7,9,10],locrian:[0,1,3,5,6,8,10],diminished:[0,2,3,5,6,8,9,11],augmented:[0,3,4,8,9],major_pentatonic:[0,2,4,7,9],minor_pentatonic:[0,2,3,7,8],blues:[0,3,5,6,7,10],whole_tone:[0,2,4,6,8,10]};function Gl(i,e=440){return e*Math.pow(2,(i-69)/12)}function Ul(i,e="semitones",t=440,n){const s=12*Math.log2(i/t)+69;return e==="semitones"?Math.round(s):s}function zl(i=0,e=9,t=440,n=4){const s=[],r=Math.pow(2,.08333333333333333),o=57;for(let l=i*12;l<=e*12+(e===8?0:11);l++){const h=t*Math.pow(r,l-o);s.push(Number(h.toFixed(n)))}return s}function Ya(i){return typeof i=="number"&&Number.isInteger(i)&&i>=0&&i<=127}function Us(i,e=60){return Math.pow(2,(i-e)/12)}const Va=zl(0,9),$l=Va.map(i=>1/i),Hl=Array.from({length:Va.length},(i,e)=>{const t=Math.floor(e/12)-1,n=e%12;return`${Cr[n][0]}${t}`}),jl=Cr,Bi=Bl,_s=Va,ql=$l,Ir=Hl,xr=Wl,Or=i=>{const e=_s.reduce((n,s)=>Math.abs(s-i)<Math.abs(n-i)?s:n),t=Ul(e);return Kl(t)};function Kl(i){const e=Gl(i),t=Math.floor(i/12)-1,n=i%12;return{name:jl[n][0],octave:t,midiNote:i,frequency:e,period:1/e}}function Yl(){const i={};return Ir.forEach((e,t)=>{i[e]=_s[t]}),Zl(i),Ql(i)}function Zl(i){const e=[["C#","Db"],["D#","Eb"],["F#","Gb"],["G#","Ab"],["A#","Bb"]];for(let t=0;t<=8;t++)for(const[n,s]of e){const r=`${n}${t}`,o=`${s}${t}`;r in i&&!(o in i)?i[o]=i[r]:o in i&&!(r in i)&&(i[r]=i[o])}}function Ql(i){return Object.fromEntries(Object.entries(i).sort((e,t)=>e[1]-t[1]))}const Xl=Yl();Object.fromEntries(Object.entries(Xl).map(([i,e])=>[i,1/e]));function Jl(i,e,t=0,n=8){if(!Bi[i]&&Bi[i]!==0)throw new Error(`Unknown root note: ${i}`);const s=[...typeof e=="string"?xr[e]:e],r=Bi[i],o=[],l=[],h=[];for(let c=t;c<=n;c++)s.forEach(f=>{const d=c*12+(r+f)%12;d<_s.length&&(o.push(_s[d]),l.push(ql[d]),h.push(Ir[d]))});return{rootIdx:r,frequencies:o,periodsInSec:l,scalePattern:s,noteNames:h}}function eh(i,e){const t=Math.pow(2,e/12);return i.map(n=>n/t)}function Se(i,e,t){if(!i){const n=t?`
Context: ${JSON.stringify(t)}`:"";throw new Error(`Assertion failed${e?`: ${e}`:""}${n}`)}}function th(i){return typeof i=="object"&&i!==null&&typeof i.then=="function"}async function Wi(i,e,t=!0){if(typeof i!="function")throw new Error("tryCatch argument must be a function");try{const n=i();if(th(n))try{return{data:await n,error:null}}catch(s){return Za(s,e,t)}return{data:n,error:null}}catch(n){return Za(n,e,t)}}function Za(i,e,t=!0){if(t){const n=i.message??i;console.error(n)}return{data:null,error:i}}var Gn;class nh{constructor(){p(this,Gn,null);try{if(typeof window>"u"||typeof AudioContext>"u"){console.error("Environment util: Window or AudioContext is undefined");return}const e=window.AudioContext||window.webkitAudioContext,t=new e,n=t.createGain().gain,s=typeof navigator<"u"&&"keyboard"in navigator,r=typeof KeyboardEvent<"u"&&typeof KeyboardEvent.prototype.getModifierState=="function";u(this,Gn,{cancelAndHoldSupported:typeof n.cancelAndHoldAtTime=="function",workletSupported:typeof t.audioWorklet=="object",keyboardAPISupported:s,modifierStateSupported:r}),t.close().catch(console.error)}catch{u(this,Gn,{cancelAndHoldSupported:!1,workletSupported:!1,keyboardAPISupported:!1,modifierStateSupported:!1})}}get capabilities(){return a(this,Gn)}}Gn=new WeakMap;const Qa=new nh,ih=()=>{var i;return!!((i=Qa==null?void 0:Qa.capabilities)!=null&&i.cancelAndHoldSupported)};function Gi(i,e,t){const n=t??i.value;i.cancelScheduledValues(e),i.setValueAtTime(n,e)}function Mi(i,e,t){(Array.isArray(i)?i:[i]).forEach(n=>{ih()?n.cancelAndHoldAtTime(e):(n.cancelScheduledValues(e),n.setValueAtTime(n.value,e))})}function sh(i,e,t="any",n=r=>r,s=(r,o)=>Math.abs(r-o)){if(i.length===0)throw new Error("Array cannot be empty");if(i.length===1)return 0;const r=e,o=n(i[0]),l=n(i[i.length-1]);if(r<=o)return 0;if(r>=l)return i.length-1;let h=0,c=i.length-1;for(;h<c-1;){const g=Math.floor((h+c)/2),M=n(i[g]);if(M===r)return g;M<r?h=g:c=g}if(t==="left")return h;if(t==="right")return c;const f=s(n(i[h]),r),d=s(n(i[c]),r);return f<=d?h:c}function Oi(i,e,t="any",n=r=>r,s=(r,o)=>Math.abs(r-o)){const r=sh(i,e,t,n,s);return i[r]}const G=(i,e,t,n={warn:!1})=>{if(n.warn&&(i<e||i>t)){const s=n.name?`(${n.name})`:"";console.warn(`Value${s} ${i} is outside range [${e}, ${t}], clamping to ${i<e?e:t}`)}return Math.max(e,Math.min(t,i))},ke=(i,e,t,n,s,r={warn:!0})=>{if(i<e||i>t){const l=r.name?`(${r.name})`:"";r.warn&&console.warn(`Input value${l} ${i} is outside nominal range [${e}, ${t}]`),i=G(i,e,t)}const o=(i-e)*(s-n)/(t-e)+n;return G(o,Math.min(n,s),Math.max(n,s))};function ah(i,e){const{inputRange:t,outputRange:n,curve:s="linear"}=e;(i>t.max||i<t.min)&&console.warn("interpolate: Value outside of input range, will be clamped");let r=(Math.max(t.min,Math.min(i,t.max))-t.min)/(t.max-t.min);switch(s){case"linear":break;case"power1":r=Math.pow(r,1/1.5);break;case"power2":r=Math.pow(r,1/2);break;case"power3":r=Math.pow(r,1/3);break;case"power4":r=Math.pow(r,1/4);break;case"expo":r=r===0?0:Math.pow(2,10*(r-1));break;case"log":r=Math.log(1+9*r)/Math.log(10);break;case"sine":r=1-Math.cos(r*Math.PI/2);break;case"circ":r=1-Math.sqrt(1-r*r);break;default:typeof s=="number"&&(r=Math.pow(r,1/s));break}return n.min+r*(n.max-n.min)}function rh(i,e){const{inputRange:t,outputRange:n,blend:s=1,curve:r="linear"}=e;(i>t.max||i<t.min)&&console.warn("interpolateLinearToExp: Value outside of input range, will be clamped"),n.min<=0&&console.warn("interpolateLinearToExp: Output min must be > 0 for exponential interpolation");let o=(Math.max(t.min,Math.min(i,t.max))-t.min)/(t.max-t.min);const l=Math.max(0,Math.min(s,1)),h=typeof r=="number"?r:r==="smooth"?2:r==="steep"?3:r==="gentle"?1.5:1;h!==1&&(o=Math.pow(o,1/h));const c=n.min+o*(n.max-n.min),f=n.min*Math.pow(n.max/n.min,o);return(1-l)*c+l*f}const Xa=i=>{const e=i.values().next();if(!e.done)return i.delete(e.value),e.value};let Ft=null,Ei=null;function Ut(i){return Ft||(Ft=new AudioContext({sampleRate:El.sampleRate,latencyHint:"interactive"}),Ft.state==="suspended"&&(Ei=Ei||Vr())),Ft}async function La(i){const e=Ut();if(e.state==="running")return e;if(e.state==="closed"){Ft=null;const t=await Wi(()=>La(i));return Se(t.data instanceof AudioContext&&!t.error,"failed to re-created closed audio context",t.error),t.data}return Ei=Ei||Vr(),await Ei,e}function Vr(){if(typeof document>"u")return Promise.resolve();const i=["click","touchstart","keydown"];return new Promise(e=>{const t=async()=>{Ft&&(await Ft.resume(),i.forEach(n=>document.removeEventListener(n,t)),e())};i.forEach(n=>document.addEventListener(n,t,{once:!0}))})}function oh(){return typeof AudioContext<"u"&&"setSinkId"in AudioContext.prototype}async function Ac(){return(await navigator.mediaDevices.enumerateDevices()).filter(i=>i.kind==="audiooutput")}async function Pc(){return(await navigator.mediaDevices.enumerateDevices()).filter(i=>i.kind==="audioinput")}async function _c(i){Se(oh(),"AudioContext.setSinkId is not supported in this browser"),await(await La()).setSinkId(i==="default"?"":i)}const lh=30,hh=1e3,ch={off:0,low:.1,medium:.2,high:.3};async function Lr(i,e="medium"){const t=i.getChannelData(0),n=ch[e];let s=0;for(let S=0;S<t.length;S++){const P=Math.abs(t[S]);P>s&&(s=P)}const r=n>0?t.map(S=>Math.abs(S)>n*s?S:0):t,o=Math.floor(i.sampleRate/hh),l=Math.floor(i.sampleRate/lh),h=new Float32Array(l);for(let S=o;S<h.length;S++){let P=0;for(let R=0;R<r.length-S;R++)P+=r[R]*r[R+S];h[S]=P}let c=o;for(let S=o;S<l;S++)h[S]>h[c]&&(c=S);const f=c;let d=0;if(f>0&&f<h.length-1){const S=h[f-1],P=h[f],R=h[f+1],z=2*(2*P-S-R);d=Math.abs(z)<1e-6?0:(R-S)/z}const g=h[c],M=r.reduce((S,P)=>S+P*P,0),E=M>0?g/M:0,A=Math.max(0,Math.min(1,E));return{frequency:i.sampleRate/(f+d),confidence:A}}function Ja(i,e,t,n){const s=Math.min(e+t,i.length);for(let r=e;r<s;r++){const o=(r-e)/t,l=n==="in"?o:1-o;i[r]*=l}}function Fr(i,e,t,n,s=4){const r=e.numberOfChannels,o=n-t,l=i.createBuffer(r,o,e.sampleRate),h=Math.floor(s/1e3*e.sampleRate);for(let c=0;c<r;c++){const f=e.getChannelData(c),d=l.getChannelData(c);for(let g=0;g<o;g++)d[g]=f[t+g];o>h*2&&h>0&&(Ja(d,0,h,"in"),Ja(d,o-h,h,"out"))}return l}function uh(i,e,t=.5,n=4,s=1){const r=e.numberOfChannels,o=e.length,l=e.sampleRate;let h=0;for(let d=0;d<r;d++){const g=e.getChannelData(d);for(let M=0;M<o;M++){const E=Math.abs(g[M]);E>h&&(h=E)}}let c=s;if(h>0){const d=.95/(h<=t?h:t+(h-t)/n);c=Math.min(s,d),h>.9&&(c=Math.min(c,1.2))}const f=i.createBuffer(r,o,l);for(let d=0;d<r;d++){const g=e.getChannelData(d),M=f.getChannelData(d);for(let E=0;E<o;E++){const A=g[E],S=Math.abs(A);let P;if(S<=t)P=A*c;else{const R=(S-t)/n,z=t+R;P=(A<0?-1:1)*z*c}M[E]=Math.max(-.99,Math.min(.99,P))}}return f}function dh(i){let e=0,t=0,n=0;for(let o=0;o<i.numberOfChannels;o++){const l=i.getChannelData(o);for(let h=0;h<l.length;h++){const c=Math.abs(l[h]);c>e&&(e=c),t+=l[h]*l[h],n++}}const s=n>0?Math.sqrt(t/n):0,r=s>0?e/s:0;return r<5.5?{shouldCompress:!1,crestFactor:r}:r<7?{shouldCompress:!0,crestFactor:r,suggestedSettings:{threshold:.5,ratio:2,makeupGain:1}}:{shouldCompress:!0,crestFactor:r,suggestedSettings:{threshold:.3,ratio:4,makeupGain:1}}}function ph(i,e,t="samples"){const n=i.numberOfChannels,s=i.sampleRate,r=Array.from({length:n},(c,f)=>i.getChannelData(f));if(r.length===0||!r[0])throw new Error("AudioBuffer must contain at least one audio channel");const o=r[0].length;function l(){for(let c=0;c<o;c++)if(Math.max(...r.map(f=>Math.abs(f[c])))>e)return t==="seconds"?c/s:c;return 0}function h(){for(let c=o-1;c>=0;c--)if(Math.max(...r.map(f=>Math.abs(f[c])))>e)return t==="seconds"?c/s:c;return t==="seconds"?(o-1)/s:o-1}return{start:l(),end:h()}}const St={normalize:{enabled:!0,maxAmplitudePeak:.99},compress:{enabled:!0},trimSilence:{enabled:!0,threshold:.005},fadeInOutMs:1,tune:{detectPitch:!0,autotune:!0,targetMidiNote:60},hpf:{auto:!0},getZeroCrossings:!0};async function Br(i,e,t={}){var n,s;const{fadeInOutMs:r=St.fadeInOutMs,hpf:o=St.hpf,getZeroCrossings:l=St.getZeroCrossings}=t;if(t.skipPreProcessing){const A={audiobuffer:e};if(l){const S=Ka(e);A.zeroCrossings=S}return A}const h={...St.normalize,...t.normalize||{}},c={...St.compress,...t.compress||{}},f={...St.trimSilence,...t.trimSilence||{}},d={...St.tune,...t.tune||{}};let g=e,M={};const E=.35;if(f!=null&&f.enabled){const{start:A,end:S}=ph(g,f.threshold??.01);g=Fr(i,g,A,S,r)}if(o){if("cutoff"in o)g=await tr(g,o.cutoff??80);else if("auto"in o&&o.auto){const A=await er(g);if(A.confidence>=E){const S=A.frequency>30&&A.frequency<350?A.frequency:80;g=await tr(g,S)}}}if(h!=null&&h.enabled&&(g=qa(i,g,h.maxAmplitudePeak)),c!=null&&c.enabled){const A=dh(g);if(A.shouldCompress){const S=c.threshold!==void 0||c.ratio!==void 0||c.makeupGain!==void 0;let P;S&&c.threshold!==void 0?P={threshold:c.threshold??.5,ratio:c.ratio??2,makeupGain:c.makeupGain??1}:P=A.suggestedSettings,g=uh(i,g,P.threshold,P.ratio,P.makeupGain)}}if(d!=null&&d.detectPitch||d!=null&&d.autotune||o&&"auto"in o&&o.auto){const A=await er(g),S=(d==null?void 0:d.targetMidiNote)||60,P=mh(A.midiFloat,S);M.detectedPitch={fundamentalHz:A.frequency,transpositionSemitones:P,confidence:A.confidence}}if(d!=null&&d.autotune&&(!((n=M.detectedPitch)!=null&&n.transpositionSemitones)||M.detectedPitch.confidence<E?console.info("Skipped autotune due to unreliable pitch detection"):Math.abs(((s=M.detectedPitch)==null?void 0:s.transpositionSemitones)??0)<.1?console.info("Skipped autotune - detected pitch is already C"):g=fh(i,g,M.detectedPitch.transpositionSemitones)),h!=null&&h.enabled&&(g=qa(i,g,h.maxAmplitudePeak)),l){const A=Ka(g);M.zeroCrossings=A}return{...M,audiobuffer:g}}function fh(i,e,t){const n=Math.pow(2,t/12),s=e.length,r=Math.round(s/n),o=i.createBuffer(e.numberOfChannels,r,e.sampleRate);for(let l=0;l<e.numberOfChannels;l++){const h=e.getChannelData(l),c=o.getChannelData(l);for(let f=0;f<r;f++){const d=f*n,g=Math.floor(d),M=d-g;g+1<s?c[f]=h[g]*(1-M)+h[g+1]*M:c[f]=h[g]}}return o}async function er(i,e=!1){const t=await Lr(i),n=Or(t.frequency),s=69+12*Math.log2(t.frequency/440),r=n.frequency/t.frequency;return e&&console.table({pitchSource:t,targetNoteInfo:n,playbackRateMultiplier:r,midiFloat:s}),{frequency:t.frequency,confidence:t.confidence,midiFloat:s,targetNoteInfo:n}}function mh(i,e){let t=e-i;for(;t>6;)t-=12;for(;t<-6;)t+=12;return t}async function tr(i,e,t=.5){const n=new OfflineAudioContext(i.numberOfChannels,i.length,i.sampleRate),s=n.createBufferSource(),r=n.createBiquadFilter();return r.type="highpass",r.frequency.value=e,r.Q.value=t,s.buffer=i,s.connect(r),r.connect(n.destination),s.start(0),await n.startRendering()}let gh=-1;const Wr=new Map,Ge=(i,e)=>{const t=`${++gh}-${i}`;return Wr.set(t,e),t},Ue=i=>{Wr.delete(i)||console.debug("Attempted to unregister a non-existent Node ID: ",i)};function Et(i){const e=new Map;return{sendMessage(t,n){const s=e.get(t);if(s){const r={type:t,senderId:i,...n};s.forEach(o=>o(r))}},onMessage(t,n){e.has(t)||e.set(t,new Set);const s=e.get(t);return s.add(n),()=>s.delete(n)},forwardFrom(t,n,s){const r=s||(l=>({...l})),o=n.map(l=>t.onMessage(l,h=>{const c=r(h);c!==null&&this.sendMessage(c.type,c)}));return()=>o.forEach(l=>l())}}}var Zt,Sn,Ts,at,$e,j,K,Un,Ui;class bh{constructor(e=[],t=[0,1],n,s,r){p(this,Un),p(this,Zt),p(this,Sn,0),p(this,Ts,!1),p(this,at),p(this,$e,null),p(this,j),p(this,K),y(this,"updateStartPoint",(o,l)=>{this.updatePoint(a(this,at),o,l)}),y(this,"updateEndPoint",(o,l)=>{this.updatePoint(a(this,K),o,l)}),y(this,"setValueRange",o=>u(this,Zt,o)),this.points=e,Se(e.length>=2,"EnvelopeData needs at least two points to initialize"),u(this,Sn,n),u(this,Zt,t),u(this,at,0),u(this,K,e.length-1),u(this,$e,s!==void 0&&e[s]?s:null),u(this,j,r!==void 0&&e[r]?r:Math.max(0,a(this,K)-1))}addPoint(e,t,n="exponential"){const s={time:e,value:t,curve:n};if(this.points.length>=2){const o=this.points[this.startPointIndex].time,l=this.points[a(this,K)].time;if(e<o||e>l){console.warn(`Cannot add point at time ${e}. Must be between ${o} and ${l}`);return}}const r=this.points.findIndex(o=>o.time>e);r===-1?(this.points.push(s),u(this,K,this.points.length-1)):(this.points.splice(r,0,s),u(this,K,this.points.length-1),a(this,$e)!==null&&r<=a(this,$e)&&Gs(this,$e)._++,a(this,j)!==null&&r<=a(this,j)&&Gs(this,j)._++),b(this,Un,Ui).call(this)}updatePoint(e,t,n){if(e>=0&&e<this.points.length){const s=this.points[e];let r=t??s.time;if(e===1&&r<=this.points[a(this,at)].time||e===a(this,K)-1&&r>=this.points[a(this,K)].time)return;this.points[e]={...s,time:r,value:n??s.value}}b(this,Un,Ui).call(this)}deletePoint(e){this.points.length>2&&e>a(this,at)&&e<a(this,K)&&(this.points.splice(e,1),u(this,K,this.points.length-1)),a(this,j)!==null&&(e<a(this,j)?Gs(this,j)._--:e===a(this,j)&&u(this,j,a(this,K)>a(this,j)+1?a(this,j)+1:Math.max(0,a(this,K)-1))),b(this,Un,Ui).call(this)}interpolateValueAtTime(e){if(this.points.length===0)return a(this,Zt)[0];if(this.points.length===1)return this.points[0].value;const t=[...this.points].sort((s,r)=>s.time-r.time);let n=0;if(e<=t[0].time)n=t[0].value;else if(e>=t[t.length-1].time)n=t[t.length-1].value;else{n=0;for(let s=0;s<t.length-1;s++){const r=t[s],o=t[s+1];if(e>=r.time&&e<=o.time){const l=o.time-r.time,h=l===0?0:(e-r.time)/l;r.curve==="exponential"&&r.value>0&&o.value>0?n=r.value*Math.pow(o.value/r.value,h):n=r.value+(o.value-r.value)*h;break}}}return n}setSustainPoint(e){if(e==null){u(this,$e,null);return}e>=0&&e<this.points.length&&u(this,$e,e)}setReleasePoint(e){e>=0&&e<this.points.length?u(this,j,e):console.error("EnvelopeData.setReleasePoint: invalid index")}get startPointIndex(){return a(this,at)}get sustainPointIndex(){return a(this,$e)}get releasePointIndex(){return a(this,j)>=this.points.length&&u(this,j,Math.max(0,this.points.length-2)),a(this,j)}get endPointIndex(){return a(this,K)}get pointValueRange(){return a(this,Zt)}get startTime(){var e;return((e=this.points[a(this,at)])==null?void 0:e.time)??0}get endTime(){var e;return((e=this.points[a(this,K)])==null?void 0:e.time)??a(this,Sn)}get durationSeconds(){return this.endTime-this.startTime}setDurationSeconds(e){u(this,Sn,e)}get hasSharpTransitions(){return a(this,Ts)}}Zt=new WeakMap,Sn=new WeakMap,Ts=new WeakMap,at=new WeakMap,$e=new WeakMap,j=new WeakMap,K=new WeakMap,Un=new WeakSet,Ui=function(){const i=.02*a(this,Sn);u(this,Ts,this.points.some((e,t)=>t>0&&Math.abs(e.time-this.points[t-1].time)<i))};var zi,ce,zn,T,rt,Qt,ot,Be,Ke,X,V,Vt,zs,Bn,Gr,xe,he,yt,lt,Me,Ur,$i,zr,$r,Hr,Hi;class $s{constructor(e,t,n,s=[],r=[0,1],o=1,l=!0){switch(p(this,V),y(this,"nodeId"),y(this,"nodeType","default-env"),p(this,zi,!1),p(this,ce),p(this,zn),p(this,T),p(this,rt),y(this,"envelopeType"),p(this,Qt),p(this,ot,!1),p(this,Be,!1),p(this,Ke,1),p(this,X,1),y(this,"addPoint",(h,c,f)=>{a(this,T).addPoint(h,c,f),a(this,he)&&u(this,yt,!0)}),y(this,"deletePoint",h=>{a(this,T).deletePoint(h),a(this,he)&&u(this,yt,!0)}),y(this,"updatePoint",(h,c,f)=>{a(this,T).updatePoint(h,c,f),a(this,he)&&u(this,yt,!0)}),y(this,"setValueRange",h=>a(this,T).setValueRange(h)),y(this,"enable",()=>u(this,Qt,!0)),y(this,"disable",()=>u(this,Qt,!1)),p(this,xe,!1),p(this,he,!1),p(this,yt,!1),p(this,lt,()=>a(this,ot)&&!a(this,xe)),p(this,Me,null),p(this,$i,navigator.userAgent.includes("Firefox")),y(this,"setTimeScale",h=>{u(this,X,h),a(this,he)&&u(this,yt,!0)}),y(this,"setLoopEnabled",(h,c="normal")=>{c!=="normal"&&console.info("Only default env loop mode implemented. Other modes coming soon!"),u(this,ot,h)}),y(this,"syncToPlaybackRate",h=>{u(this,Be,h)}),y(this,"setSustainPoint",h=>{a(this,T).setSustainPoint(h),a(this,Me)&&!a(this,ot)&&!a(this,xe)&&b(this,V,Hr).call(this)}),y(this,"setReleasePoint",h=>a(this,T).setReleasePoint(h)),this.envelopeType=t,this.nodeType=t,this.nodeId=Ge(this.envelopeType,this),u(this,ce,e),u(this,zn,Et(this.nodeId)),t){case"amp-env":u(this,rt,"envGain");break;case"pitch-env":u(this,rt,"playbackRate");break;case"filter-env":u(this,rt,"lpf");break;case"loop-env":u(this,rt,"loopEnd"),console.warn("CustomEnvelope not implemented for type: loop-env");break;default:console.error(`CustomEnvelope not implemented for type: ${t}`),u(this,rt,"default");break}u(this,Qt,l),u(this,T,n||new bh([...s],r,o)),u(this,zi,!0),this.sendUpstreamMessage(`${this.envelopeType}:created`,{})}setSampleDuration(e){return a(this,T).setDurationSeconds(e),this}get initialized(){return a(this,zi)}get data(){return a(this,T)}get param(){return a(this,rt)}get isEnabled(){return a(this,Qt)}get points(){return a(this,T).points}get baseDuration(){return a(this,T).endTime-a(this,T).startTime}get effectiveDuration(){return b(this,V,Vt).call(this)}get timeScale(){return a(this,X)}get envPointValueRange(){return a(this,T).pointValueRange}get loopEnabled(){return a(this,ot)}get syncedToPlaybackRate(){return a(this,Be)}get numPoints(){return a(this,T).points.length}getEffectivePointTime(e){return Se(e>=0&&e<=this.points.length-1),b(this,V,Vt).call(this,a(this,T).startPointIndex,e)}triggerEnvelope(e,t,n={baseValue:1,playbackRate:1}){if(a(this,$i)){try{const s=a(this,ce).currentTime,r=Math.max(s+.001,t);Mi(e,r),e.linearRampToValueAtTime(n.baseValue*.8,r+.01),e.linearRampToValueAtTime(n.baseValue*.5,r+.1),console.debug("Firefox trigger envelope - simple linear ramps")}catch(s){console.debug("Firefox trigger envelope failed silently:",s)}u(this,xe,!1),u(this,Ke,n.playbackRate);return}if(u(this,xe,!1),u(this,Ke,n.playbackRate),u(this,Me,{audioParam:e,startTime:t,options:n}),a(this,ot)?b(this,V,Ur).call(this,e,t,n):b(this,V,Gr).call(this,e,t,n),!this.releasePoint){console.error("Release point not set, ensure supported by envelope");return}setTimeout(()=>{this.sustainEnabled||a(this,xe)||(u(this,xe,!0),n.voiceId!==void 0&&this.sendUpstreamMessage(`${this.envelopeType}:release`,{voiceId:n.voiceId,midiNote:n.midiNote,releasePoint:this.releasePoint,remainingDuration:this.effectiveReleaseDuration}))},this.effectiveReleaseStartTime*1e3)}releaseEnvelope(e,t,n,s=!1){if(a(this,xe))return;const r=a(this,Me);if(u(this,xe,!0),u(this,Me,null),a(this,$i)){try{const f=a(this,ce).currentTime;e.cancelScheduledValues(f),setTimeout(()=>{try{const d=a(this,ce).currentTime;Mi(e,d),e.linearRampToValueAtTime(0,d+.1),console.debug("Firefox delayed release envelope - linear ramp to 0")}catch(d){console.debug("Firefox delayed release also failed:",d)}},10)}catch(f){console.debug("Firefox immediate release failed:",f),setTimeout(()=>{try{const d=a(this,ce).currentTime;e.setValueAtTime(0,d+.05)}catch(d){console.debug("Firefox very delayed release failed:",d)}},50)}return}const o=Math.max(a(this,ce).currentTime,t),l=r?Math.max(0,o-r.startTime):void 0,h=l!==void 0?Math.min(this.baseDuration,l*(a(this,Be)?r.options.playbackRate:1)*a(this,X)):void 0,c=this.envelopeType==="amp-env"&&(r==null?void 0:r.audioParam)===e&&h!==void 0?b(this,V,Hi).call(this,a(this,T).interpolateValueAtTime(h)*r.options.baseValue):void 0;s&&b(this,V,zr).call(this,{audioParamValue:e.value,elapsedSeconds:l,envelopeTime:h,releaseStartValue:c,safeStart:o,startTime:t,activeStartTime:r==null?void 0:r.startTime}),b(this,V,$r).call(this,e,t,this.releasePointIndex,{baseValue:e.value,playbackRate:a(this,Ke),releaseStartValue:c,curveScale:this.envelopeType==="amp-env"?r==null?void 0:r.options.baseValue:void 0,...n})}get sustainPointIndex(){return a(this,T).sustainPointIndex}get releasePointIndex(){return a(this,T).releasePointIndex}get releasePoint(){return this.points[this.releasePointIndex]||null}get effectiveReleaseStartTime(){return this.getEffectivePointTime(this.releasePointIndex)}get baseReleaseDuration(){return this.points[a(this,T).endPointIndex].time-this.points[this.releasePointIndex].time}get effectiveReleaseDuration(){return a(this,Be)?this.baseReleaseDuration/a(this,Ke)/a(this,X):this.baseReleaseDuration/a(this,X)}get sustainEnabled(){return this.sustainPoint!==null&&!this.loopEnabled}get sustainPoint(){return this.sustainPointIndex!==null?this.points[this.sustainPointIndex]:null}get currentPlaybackRate(){return a(this,Ke)}setCurrentPlaybackRate(e){u(this,Ke,e),a(this,Be)&&a(this,he)&&u(this,yt,!0)}onMessage(e,t){return a(this,zn).onMessage(e,t)}sendUpstreamMessage(e,t){return a(this,zn).sendMessage(e,t),this}hasVariation(){var e;const t=((e=this.points[0])==null?void 0:e.value)??0;return this.points.some(n=>Math.abs(n.value-t)>.001)}static getDefaults(e,t=1){switch(e){case"amp-env":return{points:[{time:0,value:0,curve:"exponential"},{time:Math.min(.005,.1*t),value:1,curve:"exponential"},{time:.25*t,value:.75,curve:"exponential"},{time:.9*t,value:.5,curve:"exponential"},{time:t,value:0,curve:"exponential"}],envPointValueRange:[0,1],initEnable:!0,sustainPointIndex:null,releasePointIndex:3};case"pitch-env":return{points:[{time:0,value:1,curve:"exponential"},{time:t,value:1,curve:"exponential"}],envPointValueRange:[.5,1.5],initEnable:!1,sustainPointIndex:null,releasePointIndex:1};case"filter-env":return{points:[{time:0,value:0,curve:"exponential"},{time:.02*t,value:1,curve:"exponential"},{time:.3*t,value:.2,curve:"exponential"},{time:t,value:0,curve:"exponential"}],envPointValueRange:[0,1],initEnable:!1,sustainPointIndex:null,releasePointIndex:2};default:return{points:[{time:0,value:0,curve:"linear"},{time:.1*t,value:1,curve:"linear"},{time:t,value:0,curve:"linear"}],envPointValueRange:[0,1],initEnable:!0,sustainPointIndex:null,releasePointIndex:1}}}dispose(){u(this,ot,!1),Ue(this.nodeId)}}zi=new WeakMap,ce=new WeakMap,zn=new WeakMap,T=new WeakMap,rt=new WeakMap,Qt=new WeakMap,ot=new WeakMap,Be=new WeakMap,Ke=new WeakMap,X=new WeakMap,V=new WeakSet,Vt=function(i=a(this,T).startPointIndex,e=a(this,T).endPointIndex,t=a(this,Ke),n=a(this,X)){if(i<a(this,T).startPointIndex||e>a(this,T).endPointIndex||i>=e)return 0;const s=this.points[i].time;let r=this.points[e].time-s;return a(this,Be)&&(r=r/t),r/n},zs=function(i){return this.envelopeType==="filter-env"?i<1?1e3:750:a(this,T).hasSharpTransitions?1e3:i<1?500:250},Bn=function(i,e=this.baseDuration,t){const n=b(this,V,zs).call(this,i),s=Math.max(2,Math.floor(i*n)),r=new Float32Array(s),{baseValue:o,minValue:l,maxValue:h,startFromValue:c}=t;let f,d,g;this.envelopeType==="filter-env"&&(f=Math.log(o),d=Math.log(h),g=d-f);for(let M=0;M<s;M++){const E=M/(s-1)*e;let A=a(this,T).interpolateValueAtTime(E);c!==void 0&&M===0?A=c:this.envelopeType==="filter-env"&&f&&g?A=Math.exp(f+g*A):o!==1&&(A=A*o),r[M]=G(A,l,h)}return r},Gr=function(i,e,t){var n;const s=this.sustainEnabled?this.sustainPointIndex??this.points.length-1:this.points.length-1,r=b(this,V,Vt).call(this,0,s,t.playbackRate,a(this,X)),o=b(this,V,Bn).call(this,r,this.sustainEnabled?((n=this.sustainPoint)==null?void 0:n.time)??this.baseDuration:this.baseDuration,{...t,minValue:i.minValue,maxValue:i.maxValue,startFromValue:i.value});t.voiceId!==void 0&&this.sendUpstreamMessage(`${this.envelopeType}:trigger`,{voiceId:t.voiceId,midiNote:t.midiNote,duration:r,sustainEnabled:this.sustainEnabled,loopEnabled:!1,sustainPoint:this.sustainPoint,releasePoint:this.releasePoint});const l=a(this,ce).currentTime,h=Math.max(l,e);if(r<.005){i.linearRampToValueAtTime(o[o.length-1],h+r);return}try{Mi(i,h),i.setValueCurveAtTime(o,h,r),this.sustainEnabled||setTimeout(()=>{u(this,Me,null)},r*1e3+100)}catch{console.debug("Failed to apply envelope curve due to rapid fire.");try{Mi(i,h),i.linearRampToValueAtTime(o[o.length-1],h+r),this.sustainEnabled||setTimeout(()=>{u(this,Me,null)},r*1e3+100)}catch{try{i.setValueAtTime(o[o.length-1],h),u(this,Me,null)}catch{u(this,Me,null)}}}},xe=new WeakMap,he=new WeakMap,yt=new WeakMap,lt=new WeakMap,Me=new WeakMap,Ur=function(i,e,t){if(!a(this,lt).call(this)){u(this,he,!1);return}let n=b(this,V,Vt).call(this,a(this,T).startPointIndex,a(this,T).endPointIndex,t.playbackRate,a(this,X)),s=b(this,V,Bn).call(this,n,this.baseDuration,{...t,minValue:i.minValue,maxValue:i.maxValue,startFromValue:i.value});t.voiceId!==void 0&&this.sendUpstreamMessage(`${this.envelopeType}:trigger`,{voiceId:t.voiceId,midiNote:t.midiNote,duration:n,sustainEnabled:!1,loopEnabled:!0,sustainPoint:this.sustainPoint,releasePoint:this.releasePoint});let r=Math.max(a(this,ce).currentTime,e);const o=Math.max(.15,Math.min(n*3,.5)),l=.005;let h=0,c=0;u(this,he,!0);let f=!1,d=null;const g=()=>{if(!a(this,lt).call(this)){u(this,he,!1);return}if(d!==null&&(clearTimeout(d),d=null),!f){f=!0;try{for(a(this,yt)&&(n=b(this,V,Vt).call(this,a(this,T).startPointIndex,a(this,T).endPointIndex,t.playbackRate,a(this,X)),s=b(this,V,Bn).call(this,n,this.baseDuration,{...t,minValue:i.minValue,maxValue:i.maxValue,startFromValue:i.value}));r<a(this,ce).currentTime+o&&r>=h;){if(!a(this,lt).call(this)){u(this,he,!1);return}const M=n-l;try{i.setValueCurveAtTime(s,r,M)}catch{c++,c>=100&&(console.debug(`Multiple curve overlaps in looping envelope, nr of overlaps: ${c} 
                (loop duration: ${n.toFixed(3)}s, buffer: ${l})`),c=0)}if(r+=n+l,h=r,t.voiceId!==void 0){const E=a(this,ce).getOutputTimestamp();if(E.contextTime!==void 0&&E.performanceTime!==void 0){const A=r-E.contextTime,S=E.performanceTime+A*1e3,P=Math.max(0,S-performance.now());setTimeout(()=>{if(!a(this,lt).call(this)){u(this,he,!1);return}this.sendUpstreamMessage(`${this.envelopeType}:trigger:loop`,{voiceId:t.voiceId,midiNote:t.midiNote,duration:n})},P)}else{if(!a(this,lt).call(this)){u(this,he,!1);return}this.sendUpstreamMessage(`${this.envelopeType}:trigger:loop`,{voiceId:t.voiceId,midiNote:t.midiNote,duration:n})}}}d=setTimeout(()=>{if(!a(this,lt).call(this)){u(this,he,!1);return}g()},100)}finally{f=!1}}};g()},$i=new WeakMap,zr=function(i){console.debug("CustomEnvelope release debug:",{envelopeType:this.envelopeType,...i})},$r=function(i,e,t,n){const s=n.curveScale??1,r=this.points[t],o=this.points[this.points.length-1],l=Math.max(a(this,ce).currentTime,e),h=o.time-r.time,c=b(this,V,Vt).call(this,t,this.points.length-1,n.playbackRate,a(this,X)),f=b(this,V,Hi).call(this,a(this,T).interpolateValueAtTime(o.time)*s);if(c<=1e-4){Gi(i,l,n.releaseStartValue),i.linearRampToValueAtTime(f,l+.005);return}const d=b(this,V,zs).call(this,c),g=Math.max(2,Math.floor(c*d)),M=new Float32Array(g);for(let E=0;E<g;E++){const A=E/(g-1),S=r.time+A*h;M[E]=b(this,V,Hi).call(this,a(this,T).interpolateValueAtTime(S)*s)}n.voiceId!==void 0&&this.sendUpstreamMessage(`${this.envelopeType}:release`,{voiceId:n.voiceId,midiNote:n.midiNote,releasePoint:this.releasePoint,remainingDuration:c});try{const E=n.releaseStartValue??i.value;Gi(i,l,E);const A=new Float32Array(M.length);for(let S=0;S<M.length;S++){const P=S/(M.length-1);A[S]=E+P*(M[S]-E)}A[0]=E,i.setValueCurveAtTime(A,l+.001,c)}catch{try{Gi(i,l,n.releaseStartValue),i.linearRampToValueAtTime(f,l+c)}catch(E){console.warn("Fallback linear ramp also failed:",E);try{i.setValueAtTime(f,l)}catch(A){console.warn("All AudioParam operations failed:",A)}}}},Hr=function(){if(!a(this,Me)||!this.sustainEnabled)return;const{audioParam:i,startTime:e,options:t}=a(this,Me),n=a(this,ce).currentTime,s=n-Math.max(e,n),r=a(this,Be)?s*t.playbackRate*a(this,X):s*a(this,X),o=this.sustainPoint;if(!(!o||r>=o.time))try{Mi(i,n);const l=o.time-r,h=a(this,Be)?l/t.playbackRate/a(this,X):l/a(this,X);if(h>.001){const c=b(this,V,Bn).call(this,h,o.time,{...t,minValue:i.minValue,maxValue:i.maxValue,startFromValue:i.value});i.setValueCurveAtTime(c,n,h)}}catch{console.debug("Dynamic sustain reschedule failed, envelope will continue normally")}},Hi=function(i){const[e,t]=a(this,T).pointValueRange;return Math.max(e,Math.min(t,i))};function Hs(i,e,t={}){const{durationSeconds:n=2,points:s,sustainPointIndex:r,releasePointIndex:o,envPointValueRange:l,initEnable:h,sharedData:c}=t;if(c)return new $s(i,e,c);const f=$s.getDefaults(e,n),d=s||f.points;let g=l||f.envPointValueRange;const M=h!==void 0?h:f.initEnable,E=r!==void 0?r:f.sustainPointIndex,A=o!==void 0?o:f.releasePointIndex,S=new $s(i,e,void 0,d,g,n,M);return S.setSustainPoint(E),A&&S.setReleasePoint(A),S}class yh{constructor(){y(this,"timers",new Map)}debounce(e,t,n){const s=n??e.name??"default";return(...r)=>{this.timers.has(s)&&clearTimeout(this.timers.get(s)),this.timers.set(s,setTimeout(()=>{e(...r),this.timers.delete(s)},t))}}cancel(e){this.timers.has(e)&&(clearTimeout(this.timers.get(e)),this.timers.delete(e))}}var At,Oe,Xt,$n,Pt;const jr=class oa{constructor(e,t=oa.MIN_EXPONENTIAL_RAMP_VALUE){y(this,"nodeId"),y(this,"nodeType","audio-param-controller"),p(this,At),p(this,Oe),p(this,Xt,[]),p(this,$n,!1),p(this,Pt),u(this,At,e),this.nodeId=Ge(this.nodeType,this),u(this,Oe,e.createConstantSource()),a(this,Oe).offset.setValueAtTime(t,e.currentTime),u(this,Pt,t),a(this,Oe).start(),u(this,$n,!0)}addTarget(e,t=1){if(t===1)a(this,Oe).connect(e),a(this,Xt).push({param:e});else{const n=new GainNode(a(this,At),{gain:t});a(this,Oe).connect(n),n.connect(e),a(this,Xt).push({param:e,scaler:n})}return this}ramp(e,t,n="exponential",s=!0){const r=a(this,At).currentTime;s&&this.param.cancelScheduledValues(r);const o=this.param.value;if(this.param.setValueAtTime(o,r),n==="exponential"){const l=Math.max(e,oa.MIN_EXPONENTIAL_RAMP_VALUE);this.param.exponentialRampToValueAtTime(l,r+t),u(this,Pt,l)}else this.param.linearRampToValueAtTime(e,r+t),u(this,Pt,e);return this}setValue(e,t=this.now,n=!0){return n&&this.param.cancelScheduledValues(t),this.param.setValueAtTime(e,t),u(this,Pt,e),this}get targets(){return a(this,Xt)}get context(){return a(this,At)}get now(){return a(this,At).currentTime}get param(){return a(this,Oe).offset}get value(){return a(this,Pt)}get initialized(){return a(this,$n)}dispose(){u(this,$n,!1);try{a(this,Oe).stop(),a(this,Oe).disconnect(),a(this,Xt).forEach(({scaler:e})=>e&&e.disconnect())}catch{}Ue(this.nodeId)}};At=new WeakMap,Oe=new WeakMap,Xt=new WeakMap,$n=new WeakMap,Pt=new WeakMap,y(jr,"MIN_EXPONENTIAL_RAMP_VALUE",1e-6);let vh=jr;const nr=(i,e)=>{const{from:t,to:n}=e,[s,r]=t,[o,l]=n,h=(l-o)/(r-s);if(Array.isArray(i))return i.map(c=>{const f=Math.max(s,Math.min(r,c));return o+(f-s)*h});{const c=Math.max(s,Math.min(r,i));return o+(c-s)*h}};var Jt,de,Hn,ji,jn,qr;class wh{constructor(){p(this,qr),p(this,Jt,[]),p(this,de,[]),p(this,Hn,0),p(this,ji,"C"),p(this,jn,[]),y(this,"paramType",null)}setScale(e,t,n=0,s=0,r=6,o,l=!1){const h=[...t];let c=Jl(e,h,s,r).periodsInSec.sort((f,d)=>f-d);return n!==0&&(c=eh(c,-n)),u(this,ji,e),u(this,jn,h),this.setAllowedPeriods(c,o,l)}setRootNote(e){this.setScale(e,a(this,jn),0,0,6,!1,!1)}setAllowedPeriods(e,t,n=!1,s="any"){let r=t?nr([...e],t):e;return u(this,de,[...r].sort((o,l)=>o-l)),u(this,Hn,a(this,de).length-1),a(this,de)}snapToValue(e,t=a(this,Jt),n,s="any"){if(t.length===0)return e;if(n===void 0)return Oi(t,e);const r=t.filter(o=>Math.abs(o-e)<=n);if(r.length>0)return Oi(r,e,s);if(n!==void 0){const o=Oi(t,e,s),l=Math.sign(o-e);return e+l*n}return e}snapToMusicalPeriod(e,t=a(this,de)){if(t.length===0||e>this.longestPeriod)return e;if(e<=this.shortestPeriod)return this.shortestPeriod;const n=a(this,de)[a(this,Hn)];if(e===n)return e;const s=e>n?"right":"left",r=Oi(t,e,s);return u(this,Hn,a(this,de).indexOf(r)),r}setAllowedValues(e,t){const n=t?nr(e,t):e;return u(this,Jt,[...n].sort((s,r)=>s-r)),a(this,Jt)}get rootNote(){return a(this,ji)}get scalePattern(){return a(this,jn)}get periods(){return a(this,de)}get shortestPeriod(){return a(this,de)[0]}get longestPeriod(){const e=a(this,de).length-1;return a(this,de)[e]}get hasValueSnapping(){return a(this,Jt).length>0}get hasPeriodSnapping(){return a(this,de).length>0}}Jt=new WeakMap,de=new WeakMap,Hn=new WeakMap,ji=new WeakMap,jn=new WeakMap,qr=new WeakSet;var ye,B,qi,qn,Ze,Ki,_t,la,Kr,Yr;class ir{constructor(e,t){p(this,la),y(this,"nodeType","macro"),y(this,"nodeId"),p(this,ye),p(this,B),p(this,qi),p(this,qn),p(this,Ze,""),p(this,Ki,!1),p(this,_t),y(this,"getValue",()=>a(this,ye).value),p(this,Yr,(n,s,r,o,l)=>{console.debug("adjusting param: ",a(this,Ze),"targetValue",n,"constant",s,"targetPeriod",r,"quantizedPeriod",o,"result",l)}),u(this,ye,new vh(e,t)),u(this,B,new wh),u(this,qi,new yh),u(this,qn,Et(a(this,ye).nodeId)),this.nodeId=a(this,ye).nodeId,u(this,_t,t),u(this,Ki,!0)}async init(){}addTarget(e,t,n=1){return a(this,Ze)||u(this,Ze,t),Se(t===a(this,Ze),"Macros only support a single ParamType"),a(this,ye).addTarget(e,n),this}ramp(e,t,n,s={}){const r=b(this,la,Kr).call(this,e,n);if(r===a(this,_t))return this;u(this,_t,r);const{method:o="exponential",debounceMs:l=20,onComplete:h,onCompleteDelayMs:c=30}=s,f=()=>{a(this,ye).ramp(r,t,o,!0),h&&setTimeout(h,t*1e3+c)};return l===0?f():a(this,qi).debounce(f,l,this.nodeId)(),this}debugProcessVal(e,t,n){console.log("MacroParam.#processValue input:",{value:e,constant:t,targetPeriod:n,hasValueSnapping:a(this,B).hasValueSnapping,hasPeriodSnapping:a(this,B).hasPeriodSnapping,longestPeriod:a(this,B).longestPeriod})}setAllowedParamValues(e,t){return a(this,B).setAllowedValues(e,t)}setAllowedPeriods(e,t,n=!1){return a(this,B).setAllowedPeriods(e,t,n)}setScale(e){const{rootNote:t,scale:n,tuningOffset:s=0,lowestOctave:r=0,highestOctave:o=8}=e,l=Array.isArray(n)?n:xr[n];return a(this,B).setScale(t,l,s,r,o,e.normalize,e.snapToZeroCrossings)}setValue(e,t){return a(this,ye).setValue(e,t),u(this,_t,e),this}get targetValue(){return a(this,_t)}get targets(){return a(this,ye).targets}get snapper(){return a(this,B)}get rootNote(){return a(this,B).rootNote}setRootNote(e){a(this,B).setRootNote(e)}get scalePattern(){return a(this,B).scalePattern}get isReady(){return a(this,Ki)}get now(){throw new Error("Not implemented")}get audioParam(){return a(this,ye).param}get type(){return a(this,Ze)}get longestPeriod(){return a(this,B).longestPeriod}onChange(e){return this.onMessage("value:changed",e)}onMessage(e,t){return a(this,qn).onMessage(e,t)}sendMessage(e,t){a(this,qn).sendMessage(e,t)}dispose(){a(this,ye).dispose()}connect(e,t,n){return this.addTarget(e,t,n),this}disconnect(e){throw new Error("Not implemented")}}ye=new WeakMap,B=new WeakMap,qi=new WeakMap,qn=new WeakMap,Ze=new WeakMap,Ki=new WeakMap,_t=new WeakMap,la=new WeakSet,Kr=function(i,e){if(!Number.isFinite(i)||!Number.isFinite(e))return i;const t=Math.abs(i-e);if(a(this,B).hasPeriodSnapping&&t<a(this,B).longestPeriod){const n=a(this,B).snapToMusicalPeriod(t);let s;if(a(this,Ze)==="loopEnd"&&(s=e+n),a(this,Ze)==="loopStart"&&(s=Math.max(0,e-n),s>=e-.001)){const r=a(this,B).periods.filter(o=>o<n);if(r.length>0){const o=Math.max(...r);s=e-o}else s=Math.max(0,e-.001)}if(s!==void 0)return s}else if(a(this,B).hasValueSnapping)return a(this,B).snapToValue(i);return i},Yr=new WeakMap;function Mh(i,e){return typeof e=="number"&&Number.isFinite(e)&&e>=i.min&&e<=i.max&&(!i.allowedValues||i.allowedValues.includes(e))}const Vi=i=>`${(i*100).toFixed(0)}%`,js=i=>`${i.toFixed(0)} Hz`,Li=(i,e)=>`${(i*e).toFixed(2)} s`,Ht={volume:{label:"Volume",min:0,max:1,defaultValue:.75,apply:(i,e)=>i.setVolume(e)},dryWet:{label:"Dry/Wet",min:0,max:1,defaultValue:.5,apply:(i,e)=>i.setDryWetMix({dry:1-e,wet:e})},glide:{label:"Glide",min:0,max:1,defaultValue:0,step:.001,format:i=>i.toFixed(3),apply:(i,e)=>i.setGlideTime(e)},tempo:{label:"Tempo",min:20,max:300,defaultValue:120,step:1,format:i=>`${i.toFixed(0)} BPM`,apply:(i,e)=>i.setTempo(e)},lowpassFilter:{label:"LPF",min:40,max:2e4,defaultValue:2e4,curve:5,format:js,apply:(i,e)=>i.setLpfCutoff(e)},highpassFilter:{label:"HPF",min:20,max:2e4,defaultValue:40,curve:5,format:js,apply:(i,e)=>i.setHpfCutoff(e)},feedback:{label:"Feedback",min:0,max:1,defaultValue:0,step:.001,curve:2.5,format:i=>i.toFixed(3),apply:(i,e)=>i.setFeedbackAmount(e)},feedbackPitch:{label:"FB-Pitch",min:.25,max:4,defaultValue:1,allowedValues:[.25,.5,1,2,3,4],curve:2,apply:(i,e)=>i.setFeedbackPitchScale(e)},feedbackDecay:{label:"FB-Decay",min:.01,max:1,defaultValue:.75,curve:1.5,apply:(i,e)=>i.setFeedbackDecay(e)},feedbackLpf:{label:"FB-LPF",min:400,max:16e3,defaultValue:1e4,curve:5,format:js,apply:(i,e)=>i.setFeedbackLowpassCutoff(e)},distortion:{label:"Distortion",min:0,max:1,defaultValue:0,curve:1.5,apply:(i,e)=>i.outputBus.setDistortionMacro(e)},drive:{label:"Drive",min:0,max:1,defaultValue:0,apply:(i,e)=>i.outputBus.setDrive(e)},clipping:{label:"Clipping",min:0,max:1,defaultValue:0,apply:(i,e)=>i.outputBus.setClippingMacro(e)},amMod:{label:"AM",min:0,max:1,defaultValue:0,apply:(i,e)=>i.setModulationAmount("AM",e)},reverbSend:{label:"Reverb Send",min:0,max:1,defaultValue:0,format:Vi,apply:(i,e)=>i.sendToFx("reverb",e)},reverbSize:{label:"Reverb Size",min:0,max:1,defaultValue:.7,apply:(i,e)=>i.setReverbAmount(e)},delaySend:{label:"Delay Send",min:0,max:1,defaultValue:0,curve:2,format:Vi,apply:(i,e)=>i.sendToFx("delay",e)},delayTime:{label:"Delay Time",min:.005,max:1.5,defaultValue:.1,curve:2,format:i=>`${i.toFixed(3)} s`,apply:(i,e)=>i.outputBus.setDelayTime(e)},delayFeedback:{label:"Delay Feedback",min:0,max:1,defaultValue:.25,curve:1.5,format:Vi,apply:(i,e)=>i.outputBus.setDelayFeedback(e)},gainLFORate:{label:"Amp LFO Rate",min:0,max:1,defaultValue:.1,curve:5,apply:(i,e)=>{var t;return(t=i.gainLFO)==null?void 0:t.setFrequency(e*100+.1)}},gainLFODepth:{label:"Amp LFO Depth",min:0,max:1,defaultValue:0,curve:1.5,apply:(i,e)=>{var t;return(t=i.gainLFO)==null?void 0:t.setDepth(e)}},pitchLFORate:{label:"Pitch LFO Rate",min:0,max:1,defaultValue:.01,curve:5,apply:(i,e)=>{var t;return(t=i.pitchLFO)==null?void 0:t.setFrequency(e*100+.1)}},pitchLFODepth:{label:"Pitch LFO Depth",min:0,max:1,defaultValue:0,curve:1.5,apply:(i,e)=>{var t;return(t=i.pitchLFO)==null?void 0:t.setDepth(e/10)}},trimStart:{label:"Start",min:0,max:1,defaultValue:0,step:.001,format:Li,apply:(i,e)=>i.setSampleStartPoint(e*i.sampleDuration)},trimEnd:{label:"End",min:0,max:1,defaultValue:1,step:.001,format:Li,apply:(i,e)=>i.setSampleEndPoint(e*i.sampleDuration)},loopStart:{label:"Loop Start",min:0,max:1,defaultValue:0,step:.001,format:Li,apply:(i,e)=>i.setLoopStart(e*i.sampleDuration)},loopDuration:{label:"Loop Length",min:0,max:1,defaultValue:1,curve:4,format:(i,e)=>{const t=i*e;return t<=.061?`${(t*1e3).toFixed(0)}ms`:`${t.toFixed(2)} s`},apply:(i,e)=>i.setLoopDuration(e*i.sampleDuration)},loopEnd:{label:"Loop End",min:0,max:1,defaultValue:1,step:.001,format:Li,apply:(i,e)=>i.setLoopEnd(e*i.sampleDuration)},loopRampDuration:{label:"Loop Ramp",min:.001,max:1,defaultValue:.5,step:.001,apply:(i,e)=>i.setLoopRampDuration(e)},loopDurationDrift:{label:"Loop Drift",min:0,max:1,defaultValue:.3,step:.001,curve:.5,format:i=>`${(i*100).toFixed(1)}%`,apply:(i,e)=>i.setLoopDurationDriftAmount(e)},keytrackLoop:{label:"KeyTrack",min:0,max:1,defaultValue:0,format:Vi,apply:(i,e)=>i.setKeytrackLoopAmount(e)}};var en,se,Ve,tn,Kn;class ha{constructor(e){p(this,en),p(this,se),p(this,Ve),p(this,tn,new Set),p(this,Kn,null),y(this,"storeCurrentValues",()=>{u(this,Kn,{rate:a(this,se).frequency.value,depth:a(this,Ve).gain.value})}),y(this,"getStoredValues",()=>a(this,Kn)),u(this,en,e),u(this,se,e.createOscillator()),u(this,Ve,e.createGain()),a(this,se).frequency.value=1,a(this,Ve).gain.value=0,a(this,se).connect(a(this,Ve)),a(this,se).start()}setFrequency(e,t=this.now){a(this,se).frequency.setValueAtTime(e,t)}setDepth(e,t=this.now){a(this,Ve).gain.setValueAtTime(e,t)}setWaveform(e,t){if(e instanceof PeriodicWave)a(this,se).setPeriodicWave(e);else if(typeof e=="string"&&Pl(e)){const n=_l(a(this,en),e,t);a(this,se).setPeriodicWave(n)}else a(this,se).type=e}setPeriodicWave(e){a(this,se).setPeriodicWave(e)}connect(e){a(this,Ve).connect(e),a(this,tn).add(e)}disconnect(e){e?(a(this,Ve).disconnect(e),a(this,tn).delete(e)):(a(this,Ve).disconnect(),a(this,tn).clear())}setMusicalNote(e,t={}){const{divisor:n=1,glideTime:s=0,timestamp:r=this.now}=t,o=440*Math.pow(2,(e-69)/12)/n;if(s<=.001)return this.setFrequency(o,r),this;if(t.glideFromMidiNote){const l=440*Math.pow(2,(t.glideFromMidiNote-69)/12)/n;this.setFrequency(l,r)}a(this,se).frequency.setTargetAtTime(o,r+.001,s)}getPitchWobbleWaveform(){const e=new Float32Array(8),t=new Float32Array(8);e[0]=0,t[0]=0;for(let n=1;n<8;n++)e[n]=Math.random()*.5,t[n]=Math.random()*.5;return a(this,en).createPeriodicWave(e,t,{disableNormalization:!0})}get now(){return a(this,en).currentTime}dispose(){a(this,se).stop(),a(this,tn).clear(),u(this,Kn,null),this.disconnect()}}en=new WeakMap,se=new WeakMap,Ve=new WeakMap,tn=new WeakMap,Kn=new WeakMap;var Yn,Yi,ve,nn,He,sn,Zn;class je{constructor(e,t,n,s={}){y(this,"nodeId"),y(this,"nodeType"),p(this,Yn),p(this,Yi,!1),p(this,ve),p(this,nn),p(this,He),p(this,sn,new Set),p(this,Zn,new Set),this.nodeType=n,this.nodeId=Ge(n,this),u(this,Yn,Et(this.nodeId)),u(this,ve,e),s.createIOGains?(u(this,nn,new GainNode(t,{gain:1})),u(this,He,new GainNode(t,{gain:1})),a(this,nn).connect(a(this,ve)),a(this,ve).connect(a(this,He))):(u(this,nn,e),u(this,He,e)),u(this,Yi,!0)}onMessage(e,t){return a(this,Yn).onMessage(e,t)}sendUpstreamMessage(e,t){return a(this,Yn).sendMessage(e,t),this}connect(e){var t;const n="input"in e?e.input:e;a(this,He).connect(n),"nodeId"in e&&(a(this,sn).add(e.nodeId),(t=e.addIncoming)==null||t.call(e,this.nodeId))}disconnect(e){var t;if(e){const n="input"in e?e.input:e;a(this,He).disconnect(n),"nodeId"in e&&(a(this,sn).delete(e.nodeId),(t=e.removeIncoming)==null||t.call(e,this.nodeId))}else a(this,He).disconnect(),a(this,sn).clear()}addIncoming(e){a(this,Zn).add(e)}removeIncoming(e){a(this,Zn).delete(e)}get connections(){return{outgoing:Array.from(a(this,sn)),incoming:Array.from(a(this,Zn))}}setParam(e,t,n=this.now){if("parameters"in a(this,ve)){const r=a(this,ve).parameters.get(e);if(r){r.setValueAtTime(t,n);return}}const s=a(this,ve)[e];if(s!=null&&s.setValueAtTime){s.setValueAtTime(t,n);return}console.warn(`Parameter '${e}' not found on node`)}getAudioParam(e){return a(this,ve)[e]||null}get audioNode(){return a(this,ve)}get input(){return a(this,nn)}get output(){return a(this,He)}get context(){return a(this,ve).context}get now(){return a(this,ve).context.currentTime}get initialized(){return a(this,Yi)}dispose(){this.disconnect(),Ue(this.nodeId)}}Yn=new WeakMap,Yi=new WeakMap,ve=new WeakMap,nn=new WeakMap,He=new WeakMap,sn=new WeakMap,Zn=new WeakMap;const Eh={threshold:-13,knee:6,ratio:4,attack:.003,release:.05},Sh={threshold:-1,ratio:20,attack:.001,release:.01,knee:0};var ca,Zi,an,Qn,F,Xn;const Zr=class ua{constructor(e=Ut()){y(this,"nodeId"),y(this,"nodeType","dattorro-reverb"),p(this,ca,!1),p(this,Zi),p(this,an,new Set),p(this,Qn,new Set),p(this,F),p(this,Xn,"default"),this.nodeId=Ge(this.nodeType,this),u(this,Zi,e),u(this,F,new AudioWorkletNode(e,"dattorro-reverb-processor",{outputChannelCount:[2]})),this.setParam("dry",0),this.setAmountMacro(.01)}connect(e){var t;const n="input"in e?e.input:e;a(this,F).connect(n),"nodeId"in e&&(a(this,an).add(e.nodeId),(t=e.addIncoming)==null||t.call(e,this.nodeId))}disconnect(e){var t;if(e){const n="input"in e?e.input:e;a(this,F).disconnect(n),"nodeId"in e&&(a(this,an).delete(e.nodeId),(t=e.removeIncoming)==null||t.call(e,this.nodeId))}else a(this,F).disconnect(),a(this,an).clear()}addIncoming(e){a(this,Qn).add(e.nodeId)}removeIncoming(e){a(this,Qn).delete(e.nodeId)}setParam(e,t,n=this.now){var s;if(!isFinite(t)){console.warn(`Skipping non-finite value for ${e}:`,t);return}if(e==="size"){this.setAmountMacro(t);return}if(e==="diffusion"){this.setDiffusionMacro(t);return}(s=a(this,F).parameters.get(e))==null||s.setValueAtTime(t,n)}getAudioParam(e){return e==="diffusion"?{value:this.getDiffusionMacroValue(),setValueAtTime:(t,n)=>this.setDiffusionMacro(t)}:a(this,F).parameters.get(e)||null}setAmountMacro(e){var t;if(e<0||e>1){console.warn("Reverb amount must be 0-1 range");return}const n=ua.PRESETS[a(this,Xn)],s=ke(e,0,1,n.decay,.93),r=ke(e,0,1,n.excursionRate,2),o=ke(e,0,1,n.excursionDepth,2),l=ke(e,0,1,n.damping,.65),h=ke(e,0,1,n.bandwidth,.2),c=ke(e,0,1,.3,1);this.setDiffusionMacro(c),(t=this.getAudioParam("decay"))==null||t.setTargetAtTime(s,this.now,.1),this.setParam("excursionRate",r),this.setParam("excursionDepth",o),this.setParam("damping",l),this.setParam("bandwidth",h)}setPreset(e="default",t=.5){u(this,Xn,e);const n=ua.PRESETS[e],s=a(this,F).context.currentTime;Object.entries(n).forEach(([r,o])=>{const l=a(this,F).parameters.get(r);l?l.linearRampToValueAtTime(o,s+t):console.warn(`Parameter '${r}' not found in reverb node`)})}setDiffusionMacro(e){const t=Math.max(.1,e*.75),n=Math.max(.1,e*.625),s=Math.min(.7,Math.max(.1,e*.6)),r=Math.max(.2,e*.4);this.setParam("inputDiffusion1",t),this.setParam("inputDiffusion2",n),this.setParam("decayDiffusion1",s),this.setParam("decayDiffusion2",r)}getDiffusionMacroValue(){var e;return((((e=this.getAudioParam("inputDiffusion1"))==null?void 0:e.value)??.75)-.1)/(.75-.1)}getCurrentSettings(){const e={};return Array.from(a(this,F).parameters.keys()).forEach(t=>{var n;e[t]=((n=a(this,F).parameters.get(t))==null?void 0:n.value)??0}),e}get audioNode(){return a(this,F)}get context(){return a(this,Zi)}get input(){return a(this,F)}get output(){return a(this,F)}get now(){return a(this,F).context.currentTime}get initialized(){return a(this,ca)}get currentPreset(){return a(this,Xn)}get connections(){return{outgoing:Array.from(a(this,an)),incoming:Array.from(a(this,Qn))}}get numberOfInputs(){return this.input.numberOfInputs}get numberOfOutputs(){return this.output.numberOfOutputs}get workletInfo(){return{numberOfInputs:a(this,F).numberOfInputs,numberOfOutputs:a(this,F).numberOfOutputs,channelCount:a(this,F).channelCount,channelCountMode:a(this,F).channelCountMode}}dispose(){this.disconnect(),Ue(this.nodeId)}};ca=new WeakMap,Zi=new WeakMap,an=new WeakMap,Qn=new WeakMap,F=new WeakMap,Xn=new WeakMap,y(Zr,"PRESETS",{room:{preDelay:1525,bandwidth:.5683,inputDiffusion1:.4666,inputDiffusion2:.5853,decay:.3226,decayDiffusion1:.6954,decayDiffusion2:.6022,damping:.6446,excursionRate:0,excursionDepth:0},church:{preDelay:0,bandwidth:.928,inputDiffusion1:.7331,inputDiffusion2:.4534,decay:.7,decayDiffusion1:.7839,decayDiffusion2:.1992,damping:.5975,excursionRate:0,excursionDepth:0},freeze:{preDelay:0,bandwidth:.999,inputDiffusion1:.75,inputDiffusion2:.625,decay:1,decayDiffusion1:.5,decayDiffusion2:.711,damping:.005,excursionRate:.3,excursionDepth:1.4},ether:{preDelay:0,bandwidth:.999,inputDiffusion1:.23,inputDiffusion2:.667,decay:.45,decayDiffusion1:.7,decayDiffusion2:.5,damping:.3,excursionRate:.85,excursionDepth:1.2},default:{preDelay:0,bandwidth:.85,inputDiffusion1:.4,inputDiffusion2:.45,decay:.1,decayDiffusion1:.5,decayDiffusion2:.45,damping:.25,excursionRate:.3,excursionDepth:.3}});let Ah=Zr;class Bs extends AudioWorkletNode{constructor(e,t,n){super(e,t,n),y(this,"_processorReady",!1),y(this,"_messageQueue",[]),y(this,"_onProcessorMessage"),this.port.onmessage=s=>{if(s.data&&s.data.type==="initialized"){this._processorReady=!0;for(const r of this._messageQueue)this.port.postMessage(r);this._messageQueue=[]}this._onProcessorMessage&&this._onProcessorMessage(s)}}setParam(e,t){const n=this.parameters.get(e);return n?(n.setValueAtTime(t,this.context.currentTime),this):(console.warn(`Parameter '${String(e)}' not found on worklet node`),this)}getParam(e){return this.parameters.get(e)}sendProcessorMessage(e){return this._processorReady?this.port.postMessage(e):this._messageQueue.push(e),this}onProcessorMessage(e){return this._onProcessorMessage=e,this}dispose(){this.disconnect(),this.port.onmessage=null,this.port.close()}}function Ph(i){return new Bs(i,"feedback-delay-processor")}function _h(i){return new Bs(i,"distortion-processor")}function Th(i){return new Bs(i,"delay-processor")}var Qi,Jn,te,ei,ht,rn,ti,ni,Xi,An,da,pa,fa,ma,ii,Ji,es,Ns,Qr,sr;class Xr{constructor(e=Ut()){p(this,Ns),y(this,"nodeId"),y(this,"nodeType","harmonic-feedback"),p(this,Qi,!1),p(this,Jn),p(this,te),p(this,ei),p(this,ht),p(this,rn,new Set),p(this,ti,new Set),p(this,ni),p(this,Xi,1),p(this,An,!1),p(this,da,0),p(this,pa,.999),p(this,fa,.15),p(this,ma,1),p(this,ii,.00012656238799684143),p(this,Ji,2),p(this,es,0),this.nodeId=Ge(this.nodeType,this),u(this,Jn,e),u(this,te,Ph(e)),u(this,ei,new GainNode(e,{gain:1})),u(this,ht,new GainNode(e,{gain:1})),a(this,ei).connect(a(this,te)).connect(a(this,ht));const t=this.setPitch(60);u(this,ni,t),u(this,Qi,!0)}trigger(e,t={}){const{secondsFromNow:n=0,cents:s=0,velocity:r=100,glideTime:o=0,triggerDecay:l=!0}=t,h=this.now+n;return this.setPitch(e,s,h,o),l&&b(this,Ns,Qr).call(this),this}setAmountMacro(e){const t=G(e,0,1);return this.setFeedbackAmount(t),u(this,es,t),this}get currentAmount(){return a(this,es)}setPitch(e,t=0,n=this.now,s=0){const r=440*Math.pow(2,(e-69)/12),o=1/(t!==0?r*Math.pow(2,t/1200):r),l=a(this,ii),h=Math.max(l,o);return this.setDelay(h,n,s),h}setDelay(e,t=this.now,n=0){u(this,ni,e);const s=e*a(this,Xi),r=G(s,a(this,ii),a(this,Ji));return n===0||!isFinite(n)?(this.getAudioParam("delayTime").setValueAtTime(r,t),this):(this.getAudioParam("delayTime").linearRampToValueAtTime(r,t+n),this)}setDelayMultiplier(e,t=this.now,n=.75){if(typeof e!="number"||!isFinite(e)){console.warn("setDelayMultiplier:Invalid multiplier:",e);return}const s=G(e,.25,4,{warn:!0,name:"pitchDelayMultiplier"}),r=this.getAudioParam("delayTime");u(this,Xi,s);const o=G(s*a(this,ni),a(this,ii),a(this,Ji));return n===0||!isFinite(n)?(r.setValueAtTime(o,t),this):(r.setTargetAtTime(o,t,n/3),this)}setFeedbackAmount(e,t=this.now){const n=ah(e,{inputRange:{min:0,max:1},outputRange:{min:Math.max(.001,a(this,da)),max:a(this,pa)},curve:"power4"});return a(this,te).parameters.get("feedbackAmount").setValueAtTime(n,t),this}setAutoGain(e,t){return a(this,te).port.postMessage({type:"setAutoGain",enabled:e,amount:t}),this}setDecay(e,t=this.now){const n=ke(e,0,1,a(this,fa),a(this,ma));return this.getAudioParam("decay").setValueAtTime(n,t),this}setLowpassCutoff(e){if(e>16e3||e<100){console.warn("Feedback lowpass cutoff out of bounds");return}this.getAudioParam("lowpass").setTargetAtTime(e,this.now,.1)}connect(e){var t;const n="input"in e?e.input:e;a(this,ht).connect(n),"nodeId"in e&&(a(this,rn).add(e.nodeId),(t=e.addIncoming)==null||t.call(e,this.nodeId))}disconnect(e){var t;if(e){const n="input"in e?e.input:e;a(this,ht).disconnect(n),"nodeId"in e&&(a(this,rn).delete(e.nodeId),(t=e.removeIncoming)==null||t.call(e,this.nodeId))}else a(this,ht).disconnect(),a(this,rn).clear()}addIncoming(e){a(this,ti).add(e.nodeId)}removeIncoming(e){a(this,ti).delete(e.nodeId)}setParam(e,t,n=this.now){var s;switch(e){case"feedback":this.setFeedbackAmount(t,n);break;case"delayTime":this.setDelay(t,n);break;case"amount":this.setAmountMacro(t);break;case"decay":this.setDecay(t,n);break;default:(s=a(this,te).parameters.get(e))==null||s.setValueAtTime(t,n);break}}getAudioParam(e){return a(this,te).parameters.get(e)||null}get audioNode(){return a(this,te)}get context(){return a(this,Jn)}get now(){return a(this,Jn).currentTime}get input(){return a(this,ei)}get output(){return a(this,ht)}get connections(){return{outgoing:Array.from(a(this,rn)),incoming:Array.from(a(this,ti))}}get initialized(){return a(this,Qi)}get decayActive(){return a(this,An)}get numberOfInputs(){return this.input.numberOfInputs}get numberOfOutputs(){return this.output.numberOfOutputs}get workletInfo(){return{numberOfInputs:a(this,te).numberOfInputs,numberOfOutputs:a(this,te).numberOfOutputs,channelCount:a(this,te).channelCount,channelCountMode:a(this,te).channelCountMode}}dispose(){this.disconnect(),Ue(this.nodeId)}}Qi=new WeakMap,Jn=new WeakMap,te=new WeakMap,ei=new WeakMap,ht=new WeakMap,rn=new WeakMap,ti=new WeakMap,ni=new WeakMap,Xi=new WeakMap,An=new WeakMap,da=new WeakMap,pa=new WeakMap,fa=new WeakMap,ma=new WeakMap,ii=new WeakMap,Ji=new WeakMap,es=new WeakMap,Ns=new WeakSet,Qr=function(){a(this,An)&&b(this,Ns,sr).call(this),u(this,An,!0);const i=this.getAudioParam("feedbackAmount").value;return a(this,te).port.postMessage({type:"triggerDecay",baseFeedbackAmount:i}),this},sr=function(){return u(this,An,!1),a(this,te).port.postMessage({type:"stopDecay"}),this};var ts,N,si,on,_e,ue,qe,ln,ai,ct,Qe,Jr,ga,ba,ns,ar,eo,ut;class Nh{constructor(e){p(this,Qe),y(this,"nodeId"),y(this,"nodeType","InstrumentBus"),p(this,ts),p(this,N),p(this,si,!1),p(this,on,null),p(this,_e,{}),p(this,ue,new Map),p(this,qe,new Map),p(this,ln,new Set),p(this,ai,new Set),p(this,ct,t=>{for(let n=0;n<t.length-1;n++)b(this,Qe,ga).call(this,t[n],t[n+1]);return this}),p(this,ns,(t,n={})=>{const{initGain:s=0}=n,r=new je(new GainNode(a(this,N),{gain:s}),a(this,N),"gain");return a(this,qe).set(t,r),r}),y(this,"getSendNode",t=>a(this,qe).get(t)),p(this,ut,null),this.nodeId=Ge(this.nodeType,this),u(this,N,e||Ut()),u(this,ts,Et(this.nodeId))}createGainNode(e,t={}){const{initialGain:n=1}=t;return new je(new GainNode(a(this,N),{gain:n}),e,"gain")}async init(){if(!a(this,si))return a(this,on)?a(this,on):(u(this,on,(async()=>{try{const e=this.createGainNode(a(this,N),{initialGain:1}),t=this.createGainNode(a(this,N),{initialGain:1}),n=this.createGainNode(a(this,N),{initialGain:1}),s=this.createGainNode(a(this,N),{initialGain:1}),r=new je(new BiquadFilterNode(a(this,N),{type:"lowpass",Q:.5,frequency:a(this,N).sampleRate/2-1e3}),a(this,N),"lpf"),o=new je(new BiquadFilterNode(a(this,N),{type:"highpass",Q:.707,frequency:20}),a(this,N),"hpf"),l=new je(new DynamicsCompressorNode(a(this,N),Eh),a(this,N),"compressor"),h=new je(new DynamicsCompressorNode(a(this,N),Sh),a(this,N),"limiter"),c=new je(_h(a(this,N)),a(this,N),"distortion"),f=new je(Th(a(this,N)),a(this,N),"Delay",{createIOGains:!1}),d=new Ah(a(this,N)),g=new Xr(a(this,N));b(this,Qe,eo).call(this,{input:e,lpf:r,hpf:o,dryMix:t,wetMix:n,output:s,compressor:l,limiter:h,feedback:g,distortion:c,reverb:d,delay:f}),a(this,ns).call(this,"reverb"),a(this,ns).call(this,"delay"),b(this,Qe,Jr).call(this),u(this,si,!0)}catch{}})()),a(this,on))}getNode(e){if(e.endsWith("_send")){const t=e.replace("_send","");return a(this,qe).get(t)}return a(this,_e)[e]}removeNode(e){if(a(this,_e)[e]){b(this,Qe,ba).call(this,e);for(const[t,n]of a(this,ue)){const s=n.indexOf(e);s>-1&&(n.splice(s,1),a(this,ue).set(t,n))}delete a(this,_e)[e],a(this,ue).delete(e)}return this}noteOn(e,t=100,n=0,s=0){const r=this.getNode("feedback");r&&"trigger"in r&&typeof r.trigger=="function"&&r.trigger(e,{velocity:t,secondsFromNow:n,glideTime:s});const o=this.getNode("delay");return o==null||o.audioNode.sendProcessorMessage({type:"trigger"}),this}setSendAmount(e,t){const n=a(this,qe).get(e);if(!n)return console.warn(`Send effect ${e} not found`),this;const s=Math.max(0,Math.min(1,t));return n.setParam("gain",s),this}setHpfCutoff(e){var t;const n=G(e,20,this.context.sampleRate/2-1e3);return(t=this.getNode("hpf"))==null||t.audioNode.frequency.setTargetAtTime(n,this.now,.1),this}setLpfCutoff(e){var t;const n=G(e,20,this.context.sampleRate/2-1e3);return(t=this.getNode("lpf"))==null||t.audioNode.frequency.setTargetAtTime(n,this.now,.1),this}setCompressorParams(e){var t;const n=(t=this.getNode("compressor"))==null?void 0:t.audioNode;return e.threshold!==void 0&&n.threshold.setValueAtTime(e.threshold,this.now),e.knee!==void 0&&n.knee.setValueAtTime(e.knee,this.now),e.ratio!==void 0&&n.ratio.setValueAtTime(e.ratio,this.now),e.attack!==void 0&&n.attack.setValueAtTime(e.attack,this.now),e.release!==void 0&&n.release.setValueAtTime(e.release,this.now),this}setDryWetMix(e){var t,n;if(e.dry!==void 0){const s=Math.max(0,Math.min(1,e.dry));(t=this.getNode("dryMix"))==null||t.setParam("gain",s)}if(e.wet!==void 0){const s=Math.max(0,Math.min(1,e.wet));(n=this.getNode("wetMix"))==null||n.setParam("gain",s)}return this}setDelayTime(e){var t;const n=G(e,0,5);return(t=this.getNode("delay"))==null||t.setParam("delayTime",n),this}setDelayFeedback(e){var t;const n=ke(e,0,1,0,.99);return(t=this.getNode("delay"))==null||t.setParam("feedbackAmount",n),this}setDelayCharacter(e){const t=this.getNode("delay");return t==null||t.audioNode.sendProcessorMessage({type:"setCharacter",modes:e}),this}setReverbSize(e){const t=this.getNode("reverb");return t&&"setAmountMacro"in t&&typeof t.setAmountMacro=="function"&&t.setAmountMacro(e),this}setReverbDecay(e){var t;return(t=this.getNode("reverb"))==null||t.setParam("decay",e),this}setDistortionMacro(e){const t=G(e,0,1);this.setDrive(t);const n=ke(t,0,1,0,.95);this.setClippingMacro(n)}setDrive(e){var t;return(t=this.getNode("distortion"))==null||t.setParam("distortionDrive",e),this}setClippingMacro(e){const t=G(e,0,1),n=this.getNode("distortion");n==null||n.setParam("clippingAmount",t);const s=ke(t,0,1,.25,.03);return n==null||n.setParam("clippingThreshold",s),this}setClippingMode(e){const t=this.getNode("distortion");t instanceof Bs&&t.sendProcessorMessage({type:"setLimitingMode",mode:e})}setFeedbackAmount(e){const t=this.getNode("feedback");return t&&"setAmountMacro"in t&&typeof t.setAmountMacro=="function"&&t.setAmountMacro(e),this}setFeedbackPitchScale(e){const t=this.getNode("feedback");return t&&"setDelayMultiplier"in t&&typeof t.setDelayMultiplier=="function"&&t.setDelayMultiplier(e),this}setFeedbackDecay(e){var t;return(t=this.getNode("feedback"))==null||t.setDecay(e),this}setFeedbackLowpassCutoff(e){var t;return(t=this.getNode("feedback"))==null||t.setLowpassCutoff(e),this}connect(e){var t;this.getNode("output").connect(e),"nodeId"in e&&(a(this,ln).add(e.nodeId),(t=e.addIncoming)==null||t.call(e,this.nodeId))}disconnect(e){var t;this.getNode("output").disconnect(e),e&&"nodeId"in e?(a(this,ln).delete(e.nodeId),(t=e.removeIncoming)==null||t.call(e,this.nodeId)):e||a(this,ln).clear()}addIncoming(e){a(this,ai).add(e)}removeIncoming(e){a(this,ai).delete(e)}setParam(e,t){switch(e){case"outputLevel":this.outputLevel=t;break;case"reverbAmount":this.setReverbSize(t);break;case"feedbackAmount":this.setFeedbackAmount(t);break;case"feedbackDecay":this.setFeedbackDecay(t);break;case"drive":this.setDrive(t);break;case"hpfCutoff":this.setHpfCutoff(t);break;case"lpfCutoff":this.setLpfCutoff(t);break;default:console.warn(`Parameter '${e}' not recognized on InstrumentMasterBus`);break}}getAudioParam(e){var t,n;switch(e){case"outputLevel":return this.getNode("output").getAudioParam("gain");case"hpfCutoff":return((t=this.getNode("hpf"))==null?void 0:t.getAudioParam("frequency"))||null;case"lpfCutoff":return((n=this.getNode("lpf"))==null?void 0:n.getAudioParam("frequency"))||null;default:return null}}getInput(){return this.getNode("input")}getOutput(){return this.getNode("output")}getLpf(){return this.getNode("lpf")}getHpf(){return this.getNode("hpf")}getDryMix(){return this.getNode("dryMix")}getWetMix(){return this.getNode("wetMix")}getCompressor(){return this.getNode("compressor")}getLimiter(){return this.getNode("limiter")}getDistortion(){return this.getNode("distortion")}getReverb(){return this.getNode("reverb")}getFeedback(){return this.getNode("feedback")}dispose(){for(const e of Object.keys(a(this,_e)))b(this,Qe,ba).call(this,e);u(this,_e,{}),a(this,ue).clear(),a(this,qe).clear(),Ue(this.nodeId)}get audioNode(){return this.getNode("output").audioNode}get context(){return a(this,N)}get connections(){return{outgoing:Array.from(a(this,ln)),incoming:Array.from(a(this,ai))}}get input(){var e;return(e=this.getNode("input"))==null?void 0:e.audioNode}get output(){var e;return(e=this.getNode("output"))==null?void 0:e.audioNode}get now(){return a(this,N).currentTime}set outputLevel(e){const t=Math.max(0,Math.min(1,e));this.getNode("output").setParam("gain",t)}get outputLevel(){const e=this.getNode("output").getAudioParam("gain");return(e==null?void 0:e.value)||0}get initialized(){return a(this,si)}get dryWetMix(){var e,t,n,s;return{dry:((t=(e=this.getNode("dryMix"))==null?void 0:e.getAudioParam("gain"))==null?void 0:t.value)||0,wet:((s=(n=this.getNode("wetMix"))==null?void 0:n.getAudioParam("gain"))==null?void 0:s.value)||0}}getSendAmount(e){var t;const n=a(this,qe).get(e);return((t=n==null?void 0:n.getAudioParam("gain"))==null?void 0:t.value)??0}getRoutingMap(){const e={};for(const[t,n]of a(this,ue))e[t]=[...n];return e}debugRouting(){console.debug("=== Bus Routing Map ===");for(const[e,t]of a(this,ue))t.length>0&&console.debug(`${e} -> ${t.join(", ")}`);console.debug("======================")}debugSends(){console.debug("=== Sends ===");for(const[e]of a(this,qe)){const t=this.getSendAmount(e);console.debug(`${e}: Send=${t.toFixed(2)}}`)}console.debug("=================================")}listNodes(){return Object.keys(a(this,_e))}startLevelMonitoring(e=1e3,t=1024,n=!1){this.stopLevelMonitoring(),u(this,ut,new ja(a(this,N),this.getNode("input").audioNode,this.getNode("output").audioNode,t)),a(this,ut).start(e,void 0,n),console.log("Level monitoring started")}stopLevelMonitoring(){a(this,ut)&&(a(this,ut).stop(),u(this,ut,null),console.log("Level monitoring stopped"))}logLevels(){let e=a(this,ut);e===null&&(e=new ja(a(this,N),this.getNode("input").audioNode,this.getNode("output").audioNode));const t=e.getLevels();console.log(`Levels: Input RMS ${t.input.rmsDB.toFixed(1)} dB | Output RMS ${t.output.rmsDB.toFixed(1)} dB`)}onMessage(e,t){return a(this,ts).onMessage(e,t)}}ts=new WeakMap,N=new WeakMap,si=new WeakMap,on=new WeakMap,_e=new WeakMap,ue=new WeakMap,qe=new WeakMap,ln=new WeakMap,ai=new WeakMap,ct=new WeakMap,Qe=new WeakSet,Jr=function(){a(this,ct).call(this,["input","hpf","feedback","dryMix"]),a(this,ct).call(this,["feedback","delay_send","delay","wetMix"]),a(this,ct).call(this,["delay","reverb_send"]),a(this,ct).call(this,["feedback","reverb_send","reverb","wetMix"]),a(this,ct).call(this,["wetMix","distortion"]),b(this,Qe,ga).call(this,"dryMix","distortion"),a(this,ct).call(this,["distortion","compressor","lpf","limiter","output"])},ga=function(i,e){const t=i.endsWith("_send")?this.getNode(i):this.getNode(i),n=e.endsWith("_send")?this.getNode(e):this.getNode(e);if(!t||!n)return console.warn(`Cannot connect ${i} -> ${e}: node not found`),this;t.connect(n);const s=a(this,ue).get(i)||[];return s.includes(e)||(s.push(e),a(this,ue).set(i,s)),this},ba=function(i,e){const t=a(this,_e)[i];if(!t)return this;if(e){const n=a(this,_e)[e];if(n){t.disconnect(n);const s=a(this,ue).get(i)||[],r=s.indexOf(e);r>-1&&(s.splice(r,1),a(this,ue).set(i,s))}}else t.disconnect(),a(this,ue).set(i,[]);return this},ns=new WeakMap,ar=function(i,e){a(this,_e)[i]=e,a(this,ue).set(i,[])},eo=function(i){return Object.keys(i).forEach(e=>{const t=i[e];t!==void 0&&b(this,Qe,ar).call(this,e,t)}),this},ut=new WeakMap;async function kh(i){const e=new Nh(i);return await e.init(),e}const $={NOT_READY:"NOT_READY",LOADED:"LOADED",PLAYING:"PLAYING",RELEASING:"RELEASING",STOPPING:"STOPPING",STOPPED:"STOPPED"};var Pn,Tt,In,re,q,Le,We,k,U,ks,L,is,Si,ss,vt,hn,ge,be,_n,ya,wt,va,as,rs,C,to,no,wa,io,so,dt,pt,cn,un,os,ao,rr,ro;class Dh{constructor(e=Ut(),t={}){p(this,C),y(this,"nodeId"),y(this,"nodeType","sample-voice"),p(this,Pn),p(this,Tt,null),p(this,In),p(this,re),p(this,q,null),p(this,Le,null),p(this,We,null),p(this,k,new Map),p(this,U,$.NOT_READY),p(this,ks,!1),p(this,L,null),p(this,is,-1),p(this,Si,0),p(this,ss,0),p(this,vt),p(this,hn,!1),p(this,ge,null),p(this,be,null),p(this,_n,40),p(this,ya,.5),p(this,wt,18e3),p(this,va,.707),p(this,as,0),p(this,rs,.5),p(this,io,()=>{console.table("Available worklet params:",Array.from(a(this,re).parameters.keys()))}),p(this,dt,null),p(this,pt,null),y(this,"enableEnvelope",n=>{var s;(s=a(this,k).get(n))==null||s.enable()}),y(this,"disableEnvelope",n=>{var s;if((s=a(this,k).get(n))==null||s.disable(),n==="filter-env"&&a(this,vt)){const r=this.getParam("lpf");r==null||r.cancelScheduledValues(this.now),r==null||r.setValueAtTime(a(this,wt),this.now+.01)}}),y(this,"setEnvelopeTimeScale",(n,s)=>{var r;(r=a(this,k).get(n))==null||r.setTimeScale(s)}),y(this,"setEnvelopeSustainPoint",(n,s)=>{const r=a(this,k).get(n);r!=null&&r.isEnabled&&r.setSustainPoint(s)}),y(this,"setEnvelopeReleasePoint",(n,s)=>{const r=a(this,k).get(n);r!=null&&r.isEnabled&&r.setReleasePoint(s)}),y(this,"getEnvelope",n=>a(this,k).get(n)),y(this,"setStartPoint",(n,s=this.now)=>{this.setParam("startPoint",n,s)}),y(this,"setEndPoint",(n,s=this.now)=>{this.setParam("endPoint",n,s)}),y(this,"disablePitch",()=>{var n;u(this,hn,!0);const s=this.now,r=.1;(n=this.getParam("playbackRate"))==null||n.linearRampToValueAtTime(1,s+r),b(this,C,cn).call(this,1,s,{glideTime:r}),b(this,C,un).call(this,1,s,{glideTime:r})}),y(this,"enablePitch",()=>{var n;u(this,hn,!1);const s=this.now,r=.1;if(a(this,L)){const o=Us(a(this,L));(n=this.getParam("playbackRate"))==null||n.linearRampToValueAtTime(o,this.context.currentTime+.01),b(this,C,cn).call(this,o,s,{glideTime:r}),b(this,C,un).call(this,o,s,{glideTime:r})}}),y(this,"setEnvelopeLoop",(n,s,r="normal")=>{const o=a(this,k).get(n);return o==null||o.setLoopEnabled(s,r),this}),y(this,"syncEnvelopeToPlaybackRate",(n,s)=>{const r=a(this,k).get(n);return r==null||r.syncToPlaybackRate(s),this}),y(this,"setPanDriftEnabled",n=>this.sendToProcessor({type:"setPanDriftEnabled",value:n})),y(this,"setTimestretchEnabled",n=>this.sendToProcessor({type:"setPreserveDuration",value:n})),this.context=e,this.nodeId=Ge(this.nodeType,this),u(this,Pn,Et(this.nodeId)),u(this,vt,t.enableFilters??!0),u(this,In,new GainNode(e,{gain:1})),u(this,re,new AudioWorkletNode(e,"sample-player-processor",{numberOfInputs:0,numberOfOutputs:1,outputChannelCount:[2],processorOptions:t.processorOptions||{}}))}async init(){return a(this,Tt)?a(this,Tt):(u(this,Tt,(async()=>{try{a(this,vt)&&b(this,C,no).call(this),u(this,We,new Xr(this.context)),u(this,Le,new GainNode(this.context,{gain:1})),b(this,C,os).call(this),this.setParam("loopStart",0,this.now),this.setParam("loopEnd",0,this.now),b(this,C,to).call(this),b(this,C,wa).call(this),b(this,C,ro).call(this),a(this,re).port.start()}catch(e){throw this.dispose(),u(this,Tt,null),e}})()),a(this,Tt))}async loadBuffer(e,t){if(u(this,U,$.NOT_READY),e.sampleRate!==this.context.sampleRate)return console.warn(`Sample rate mismatch - buffer: ${e.sampleRate}, context: ${this.context.sampleRate}`),!1;const n=Array.from({length:e.numberOfChannels},(s,r)=>e.getChannelData(r).slice());return this.sendToProcessor({type:"voice:setBuffer",buffer:n,durationSeconds:e.duration}),t!=null&&t.length&&(b(this,C,so).call(this,t),this.sendToProcessor({type:"voice:setZeroCrossings",zeroCrossings:t})),!0}freeze(e){return console.info(`SampleVoice: freeze(${e}) called. 
      Spectral freeze not implemented yet`),this}setGlideTime(e){u(this,ss,e)}trigger(e){var t,n,s,r;const{midiNote:o=60,velocity:l=100,secondsFromNow:h=0}={...e},c=this.now+h;if(a(this,U)===$.PLAYING||a(this,U)===$.RELEASING)return console.log(`had to stop a playing voice, midinote: ${o}`),this.stop(c),null;u(this,U,$.PLAYING),u(this,is,c),u(this,L,o);const f=(((t=e.glide)==null?void 0:t.glideTime)??a(this,ss))/8;let d=1,g=1;if(a(this,hn)||(d=Us(o),e.glide&&(g=Us(e.glide.prevMidiNote)),b(this,C,cn).call(this,d,c,{glideTime:f}),b(this,C,un).call(this,d,c,{glideTime:f})),!a(this,hn)&&e.glide&&f>0){const M=this.getParam("playbackRate");g>0&&M.setValueAtTime(g,c),this.getParam("playbackRate").setTargetAtTime(d,c,f)}else this.setParam("playbackRate",d,c);return this.setParam("velocity",l,c),this.sendToProcessor({type:"voice:start",timestamp:c}),this.applyEnvelopes(c,d,l,o),(n=a(this,We))==null||n.trigger(o,{velocity:l,secondsFromNow:h,glideTime:f,triggerDecay:!0}),(r=a(this,q))==null||r.setMusicalNote(o,{divisor:1,glideTime:f,glideFromMidiNote:(s=e==null?void 0:e.glide)==null?void 0:s.prevMidiNote,timestamp:c}),a(this,L)}applyEnvelopes(e,t,n,s){a(this,k).forEach((h,c)=>{if(!h.isEnabled)return;const f=this.getParam(h.param);if(!f||c==="pitch-env"&&!h.hasVariation())return;const d=(()=>{switch(c){case"amp-env":return n?n/127:1;case"pitch-env":return t;case"filter-env":return a(this,wt);default:return 1}})();h.triggerEnvelope(f,e,{baseValue:d,playbackRate:t,voiceId:this.nodeId,midiNote:s??60})});const r=a(this,k).get("amp-env"),o=a(this,k).get("pitch-env"),l=a(this,k).get("filter-env");this.sendUpstreamMessage("sample-envelopes:trigger",{voiceId:this.nodeId,midiNote:a(this,L),envDurations:{"amp-env":r.syncedToPlaybackRate?r.baseDuration/t/r.timeScale:r.baseDuration/r.timeScale,"pitch-env":o.syncedToPlaybackRate?o.baseDuration/t/o.timeScale:o.baseDuration/o.timeScale,"filter-env":l.syncedToPlaybackRate?l.baseDuration/t/l.timeScale:l.baseDuration/l.timeScale},loopEnabled:{"amp-env":r.loopEnabled,"pitch-env":o.loopEnabled,"filter-env":l.loopEnabled}})}release({releaseTime:e=this.releaseTime,secondsFromNow:t=0}){var n;if(a(this,U)===$.RELEASING)return this;if(!this.getParam("envGain"))throw new Error("Cannot release - envGain parameter is null");u(this,U,$.RELEASING);const s=this.now+t,r=((n=this.getParam("playbackRate"))==null?void 0:n.value)??1;if(a(this,k).forEach(h=>{if(!h.isEnabled)return;const c=this.getParam(h.param);c&&h.releaseEnvelope(c,s,{playbackRate:r,voiceId:this.nodeId,midiNote:a(this,L)??60})}),e<=0)return this.stop(s);this.sendToProcessor({type:"voice:release",timestamp:s});const o=Array.from(a(this,k).values()).filter(h=>h.isEnabled),l=o.length>0?Math.max(...o.map(h=>h.effectiveReleaseDuration)):e;return a(this,dt)&&clearTimeout(a(this,dt)),u(this,dt,setTimeout(()=>{try{(a(this,U)===$.RELEASING||a(this,U)===$.PLAYING)&&this.stop()}finally{u(this,dt,null)}},l*1e3+50)),this}stop(e=this.now){if(a(this,U)===$.STOPPED||a(this,U)===$.STOPPING)return this;u(this,U,$.STOPPING);const t=.005,n=Math.max(e,this.now),s=this.getParam("envGain");return s&&(Gi(s,n),s.linearRampToValueAtTime(0,n+t)),a(this,pt)&&clearTimeout(a(this,pt)),u(this,pt,setTimeout(()=>{this.sendToProcessor({type:"voice:stop",timestamp:n}),u(this,pt,null)},Math.max(0,(n+t-this.now)*1e3))),this}setModulationAmount(e,t){var n;const s=ke(t,0,1,0,.95,{warn:!0,name:"sampleVoice.setModulationAmount"});return e==="AM"?(a(this,q)||b(this,C,os).call(this,s),(n=a(this,q))==null||n.setDepth(s)):e==="FM"&&console.warn("SampleVoice: FM modulation not implemented yet"),this}setModulationWaveform(e="AM",t="triangle",n={}){var s;return e==="AM"?(a(this,q)||b(this,C,os).call(this),(s=a(this,q))==null||s.setWaveform(t,n)):e==="FM"&&console.info("SampleVoice: FM modulation not implemented yet"),this}addEnvelopePoint(e,t,n){const s=a(this,k).get(e);s!=null&&s.isEnabled&&s.addPoint(t,n)}updateEnvelopePoint(e,t,n,s){const r=a(this,k).get(e);r!=null&&r.isEnabled&&r.updatePoint(t,n,s)}deleteEnvelopePoint(e,t){const n=a(this,k).get(e);n!=null&&n.isEnabled&&n.deletePoint(t)}get envelopes(){return a(this,k)}setParam(e,t,n=this.now,s={}){const r=this.getParam(e);if(!r||r.value===t)return this;const{glideTime:o=0,cancelPrevious:l=!0}=s;return l&&r.cancelScheduledValues(n),o<=0?r.setValueAtTime(t,Math.max(n,this.now+.001)):r.linearRampToValueAtTime(t,n+Math.max(o,.001)),this}setParams(e,t,n={}){const s=e.filter(r=>this.getParam(r.name)!==null);return s.length===0?this:(s.forEach(({name:r,value:o})=>{this.setParam(r,o,t,{...n})}),this)}setLoopPoints(e,t,n=this.now,s=0){return e>=t?this:(e!==void 0&&this.setParam("loopStart",e,n,{glideTime:s,cancelPrevious:!0}),t!==void 0&&this.setParam("loopEnd",t,n,{glideTime:s,cancelPrevious:!0}),this)}syncLoopToTempo(e){return this.sendToProcessor({type:"syncLoopToTempo",value:e}),this}setKeytrackLoopAmount(e){return this.sendToProcessor({type:"setKeytrackLoopAmount",value:e}),this}setTempo(e){return this.setParam("tempo",e,this.now),this}setAllowedPeriods(e){return this.sendToProcessor({type:"setAllowedPeriods",allowedPeriods:e}),this}connect(e,t,n){return e instanceof je?this.out.connect(e.input,t):e instanceof AudioParam?this.out.connect(e,t):e instanceof AudioNode?this.out.connect(e,t,n):console.warn(`SampleVoice: Unsupported destination: ${e}`),e}disconnect(e="main",t){return e==="alt"?(console.warn('SampleVoice has no "alt" output to disconnect'),this):(t?t instanceof AudioNode?this.out.disconnect(t):t instanceof AudioParam&&this.out.disconnect(t):this.out.disconnect(),this)}onMessage(e,t){return a(this,Pn).onMessage(e,t)}sendToProcessor(e){return a(this,re).port.postMessage(e),this}sendUpstreamMessage(e,t){return a(this,Pn).sendMessage(e,t),this}getPlaybackDuration(){const e=this.getParam("startPoint").value;return this.getParam("endPoint").value-e}get isActive(){return a(this,L)!==null}get feedback(){return a(this,We)}get currMidiNote(){return a(this,L)}get hpf(){return a(this,ge)}get lpf(){return a(this,be)}get in(){return null}get out(){return a(this,In)}get state(){return a(this,U)}get initialized(){return a(this,ks)}get now(){return this.context.currentTime}get activeNoteId(){return a(this,L)}get triggerTimestamp(){return a(this,is)}get sampleDurationSeconds(){return a(this,Si)}get startPoint(){return this.getParam("startPoint").value}get endPoint(){return this.getParam("endPoint").value}get releaseTime(){return a(this,k).get("amp-env").effectiveReleaseDuration}setMasterGain(e){const t=a(this,re).parameters.get("masterGain");t.cancelScheduledValues(this.context.currentTime),t.setTargetAtTime(e,this.context.currentTime,.006)}enablePositionTracking(e){return this.sendToProcessor({type:"voice:usePlaybackPosition",value:e}),this}setLoopEnabled(e){return this.sendToProcessor({type:"setLoopEnabled",value:e}),!e&&a(this,L)&&this.release({}),this}setPlaybackRate(e,t=this.now,n){return this.setParam("playbackRate",e,t,n),b(this,C,cn).call(this,e,t,n),b(this,C,un).call(this,e,t,n),this}setHpfCutoff(e,t=this.now,n={}){var s;const r=G(e,20,this.context.sampleRate/2-1e3);if(u(this,_n,r),a(this,ge)){this.setParam("hpf",r,t,{glideTime:0});const o=((s=this.getParam("playbackRate"))==null?void 0:s.value)??1;b(this,C,cn).call(this,o,t,n)}return this}setLpfCutoff(e,t=this.now,n={}){var s;const r=G(e,20,this.context.sampleRate/2-1e3);if(u(this,wt,r),a(this,be)){this.setParam("lpf",r,t,{glideTime:0,cancelPrevious:!0});const o=((s=this.getParam("playbackRate"))==null?void 0:s.value)??1;b(this,C,un).call(this,o,t,n)}return this}setPlaybackDirection(e){return this.sendToProcessor({type:"voice:setPlaybackDirection",playbackDirection:e}),this}setLoopDurationDriftAmount(e){if(e===0)return this.setParam("loopDurationDriftAmount",0,this.now),this;const t=rh(e,{inputRange:{min:0,max:1},outputRange:{min:1e-4,max:1},blend:1,curve:"linear"});return this.setParam("loopDurationDriftAmount",t,this.now),this}debugDuration(){console.info(`
      sample duration: ${this.sampleDurationSeconds}, 
      startPoint: ${this.getParam("startPoint").value}, 
      endPoint: ${this.getParam("endPoint").value}, 
      playback duration: ${this.getPlaybackDuration()}
      `)}dispose(){this.stop(),this.disconnect(),b(this,C,ao).call(this),a(this,k).forEach(e=>e.dispose()),a(this,re).port.close(),a(this,dt)&&clearTimeout(a(this,dt)),a(this,pt)&&clearTimeout(a(this,pt)),Ue(this.nodeId)}getParam(e){var t,n,s,r;if(a(this,re)&&a(this,re).parameters.has(e))return a(this,re).parameters.get(e)??null;if(a(this,vt))switch(e){case"highpass":case"hpf":return((t=a(this,ge))==null?void 0:t.frequency)||null;case"lowpass":case"lpf":return((n=a(this,be))==null?void 0:n.frequency)||null;case"hpfQ":return((s=a(this,ge))==null?void 0:s.Q)||null;case"lpfQ":return((r=a(this,be))==null?void 0:r.Q)||null}return null}}Pn=new WeakMap,Tt=new WeakMap,In=new WeakMap,re=new WeakMap,q=new WeakMap,Le=new WeakMap,We=new WeakMap,k=new WeakMap,U=new WeakMap,ks=new WeakMap,L=new WeakMap,is=new WeakMap,Si=new WeakMap,ss=new WeakMap,vt=new WeakMap,hn=new WeakMap,ge=new WeakMap,be=new WeakMap,_n=new WeakMap,ya=new WeakMap,wt=new WeakMap,va=new WeakMap,as=new WeakMap,rs=new WeakMap,C=new WeakSet,to=function(){Se(a(this,We),"SampleVoice: Feedback not initialized!"),Se(a(this,Le),"SampleVoice: AM mod not initialized!"),a(this,vt)?(Se(a(this,ge)&&a(this,be),"SampleVoice: Filters not initialized!"),a(this,re).connect(a(this,We).input),a(this,We).output.connect(a(this,Le)),a(this,Le).connect(a(this,ge)),a(this,ge).connect(a(this,be)),a(this,be).connect(a(this,In))):(a(this,re).connect(a(this,We).input),a(this,We).output.connect(a(this,Le)),a(this,Le).connect(a(this,In)))},no=function(){u(this,_n,40),u(this,wt,this.context.sampleRate/2-1e3),a(this,ge)||u(this,ge,new BiquadFilterNode(this.context,{type:"highpass",frequency:a(this,_n),Q:a(this,ya)})),a(this,be)||u(this,be,new BiquadFilterNode(this.context,{type:"lowpass",frequency:a(this,wt),Q:a(this,va)}))},wa=function(){a(this,k).forEach(n=>n.dispose()),a(this,k).clear();const i=a(this,Si)||void 0,e=Hs(this.context,"amp-env",{durationSeconds:i});a(this,k).set("amp-env",e);const t=Hs(this.context,"pitch-env",{durationSeconds:i});if(a(this,k).set("pitch-env",t),a(this,vt)){const n=Hs(this.context,"filter-env",{durationSeconds:i,envPointValueRange:[0,1],initEnable:!1});a(this,k).set("filter-env",n)}b(this,C,rr).call(this)},io=new WeakMap,so=function(i){return this.sendToProcessor({type:"voice:set_zero_crossings",zeroCrossings:i}),this},dt=new WeakMap,pt=new WeakMap,cn=function(i,e=this.now,t={}){if(!a(this,L)||!a(this,ge)||a(this,rs)<=0)return;const n=a(this,ge).frequency,{glideTime:s=0,cancelPrevious:r=!0}=t||{};r&&n.cancelScheduledValues(e);const o=a(this,_n)*i*a(this,rs),l=G(o,20,this.context.sampleRate/2-1e3);s>0?n.setTargetAtTime(l,e,s):n.setValueAtTime(l,Math.max(e,this.now+.001))},un=function(i,e=this.now,t={}){if(!a(this,L)||!a(this,be)||a(this,as)<=0)return;const n=a(this,be).frequency,{glideTime:s=0,cancelPrevious:r=!0}=t||{};r&&n.cancelScheduledValues(e);const o=a(this,wt)*i*a(this,as),l=G(o,20,this.context.sampleRate/2-1e3);s>0?n.setTargetAtTime(l,e,s):n.setValueAtTime(l,Math.max(e,this.now+.001))},os=function(i=0,e="square",t={}){if(a(this,q)===null)if(u(this,q,new ha(this.context)),a(this,q).setWaveform(e,t),a(this,q).setDepth(i),a(this,q).setMusicalNote(a(this,L)??60),a(this,Le))a(this,q).connect(a(this,Le).gain);else throw console.error("Missing gain node for AM-LFO in SampleVoice"),new Error("Missing gain node for AM-LFO in SampleVoice");else console.debug("setupAmpModLFO: LFO already setup: ",a(this,q));return this},ao=function(){if(a(this,q))return a(this,q).dispose(),u(this,q,null),this},rr=function(){a(this,k).forEach((i,e)=>{a(this,Pn).forwardFrom(i,[`${e}:trigger`,`${e}:release`,`${e}:trigger:loop`,`${e}:created`],t=>({...t,voiceId:this.nodeId,midiNote:a(this,L)}))})},ro=function(){a(this,re).port.onmessage=i=>{var e;let{type:t,...n}=i.data;switch(t){case"initialized":u(this,ks,!0),u(this,U,$.NOT_READY),this.sendUpstreamMessage("voice:initialized",{voice:this,voiceId:this.nodeId});break;case"voice:loaded":u(this,L,null),n.durationSeconds&&(u(this,Si,n.durationSeconds),b(this,C,wa).call(this),this.setStartPoint(0),this.setEndPoint(n.durationSeconds)),u(this,U,$.LOADED);break;case"voice:started":u(this,U,$.PLAYING),n={voice:this,midiNote:a(this,L)};break;case"voice:stopped":u(this,U,$.STOPPED),n={voiceId:this.nodeId,voice:this,midiNote:a(this,L)},u(this,L,null);break;case"voice:releasing":u(this,U,$.RELEASING),n={voiceId:this.nodeId,voice:this,midiNote:a(this,L)};break;case"loop:enabled":break;case"voice:looped":break;case"voice:playbackDirectionChange":break;case"voice:position":(e=this.getParam("playbackPosition"))==null||e.setValueAtTime(n.position,this.context.currentTime);break;case"debug:params":console.debug("Debug params: ",{loopStart:n.loopStart},{loopStartSamples:n.loopStartSamples},{loopEnd:n.loopEnd},{loopEndSamples:n.loopEndSamples});break;case"debug:release":console.debug("SampleVoice release debug:",n);break;case"debug:loop":console.log("Loop debug:",n);break;default:console.warn(`Unhandled message type: ${t}`);break}this.sendUpstreamMessage(t,n)}};async function Rh(i,e){const t=new Dh(i,e);return await t.init(),t}async function Ch(i,e,t){const n=Array.from({length:i},()=>Rh(e,t));return Promise.all(n)}var Tn,ls,dn,ft,ri,H,xn,oe,De,Re,le,oi,hs,li,Nn,oo,Ma,or,qs;class Ih{constructor(e,t){p(this,Nn),y(this,"nodeId"),y(this,"nodeType","pool"),p(this,Tn),p(this,ls),p(this,dn,!1),p(this,ft,null),p(this,ri),p(this,H,[]),p(this,xn,new Set),p(this,oe,new Set),p(this,De,new Set),p(this,Re,new Set),p(this,le,new Map),p(this,oi,1),p(this,hs,new Set),p(this,li,new Map),y(this,"prevMidiNote",60),p(this,Ma,.4),this.nodeId=Ge(this.nodeType,this),u(this,Tn,Et(this.nodeId)),u(this,ls,e),u(this,ri,t)}async init(){if(!a(this,dn))return a(this,ft)?a(this,ft):(u(this,ft,(async()=>{try{u(this,H,await Ch(a(this,ri),a(this,ls))),a(this,H).forEach(e=>{a(this,oe).add(e),b(this,Nn,oo).call(this,e)}),u(this,dn,!0)}catch(e){a(this,H).forEach(n=>n.dispose()),u(this,H,[]),a(this,oe).clear(),u(this,ft,null);const t=e instanceof Error?e.message:String(e);throw new Error(`Failed to initialize SamplePlayer: ${t}`)}})()),a(this,ft))}connect(e){a(this,H).forEach(t=>{t.connect(e)})}disconnect(){a(this,H).forEach(e=>{e.disconnect()})}onMessage(e,t){return a(this,Tn).onMessage(e,t)}sendUpstreamMessage(e,t){return a(this,Tn).sendMessage(e,t),this}setBuffer(e,t){return a(this,xn).clear(),a(this,H).forEach(n=>n.loadBuffer(e,t)),this}allocate(e=a(this,oe),t=a(this,Re)){let n;return e.size?n=Xa(e):t.size&&(n=Xa(t),n==null||n.stop()),n||console.warn("Could not allocate voice"),n}noteOn(e,t=100,n=0,s=0){if(this.playingVoicesCount>=a(this,ri))return console.log("Pool noteON(): Max polyphony reached, cannot play new note"),null;const r=this.allocate();return r!=null&&r.trigger({midiNote:e,velocity:t,secondsFromNow:n,glide:{prevMidiNote:this.prevMidiNote,glideTime:s}})&&r?(a(this,le).set(e,r),this.prevMidiNote=e,e):null}noteOff(e,t=0,n){const s=a(this,le).get(e);if(s)return(s==null?void 0:s.state)===$.PLAYING&&s.release({secondsFromNow:t,releaseTime:n}),this}allNotesOff(e=0){return a(this,le).forEach(t=>{t.release({releaseTime:e})}),a(this,le).clear(),this}applyToAllVoices(e){a(this,H).forEach(t=>e(t))}applyToActiveVoices(e){a(this,le).forEach(t=>e(t))}applyToInactiveVoices(e){a(this,oe).forEach(t=>e(t))}applyToActiveNote(e,t){const n=a(this,le).get(e);n?t(n):console.warn(`No active voice found for midiNote: ${e}`)}debug(){console.debug(`
      releasing: ${a(this,Re).size}
      playing: ${a(this,De).size}
      available: ${a(this,oe).size}
      Sum: ${a(this,Re).size+a(this,De).size+a(this,oe).size}
      Sum should be: ${this.allVoicesCount}
      `,{midiToVoiceMap:a(this,le)})}dispose(){this.applyToAllVoices(e=>e.dispose()),u(this,H,[]),a(this,le).clear(),a(this,oe).clear(),a(this,Re).clear(),a(this,De).clear(),a(this,xn).clear(),u(this,dn,!1),u(this,ft,null),Ue(this.nodeId)}get initialized(){return a(this,dn)}get availableVoices(){return a(this,oe)}get playingVoicesCount(){return a(this,De).size}get releasingVoicesCount(){return a(this,Re).size}get availableVoicesCount(){return a(this,oe).size}get allVoices(){return a(this,H)}get allVoicesCount(){return a(this,H).length}get assignedVoicesMidiMap(){return a(this,le)}}Tn=new WeakMap,ls=new WeakMap,dn=new WeakMap,ft=new WeakMap,ri=new WeakMap,H=new WeakMap,xn=new WeakMap,oe=new WeakMap,De=new WeakMap,Re=new WeakMap,le=new WeakMap,oi=new WeakMap,hs=new WeakMap,li=new WeakMap,Nn=new WeakSet,oo=function(i){i.onMessage("voice:started",e=>{a(this,oe).delete(e.voice),a(this,Re).delete(e.voice),a(this,De).add(e.voice),b(this,Nn,qs).call(this),a(this,le).set(e.midiNote,e.voice)}),i.onMessage("voice:releasing",e=>{a(this,oe).delete(e.voice),a(this,De).delete(e.voice),a(this,Re).add(e.voice)}),i.onMessage("voice:stopped",e=>{a(this,De).delete(e.voice),a(this,Re).delete(e.voice),b(this,Nn,qs).call(this),a(this,oe).add(e.voice),e.midiNote!==void 0&&a(this,le).get(e.midiNote)===e.voice&&a(this,le).delete(e.midiNote)}),i.onMessage("voice:initialized",e=>{a(this,hs).add(e.voice),a(this,hs).size===a(this,H).length&&this.sendUpstreamMessage("voice-pool:initialized",{voiceCount:a(this,H).length})}),["amp-env","pitch-env","filter-env"].forEach(e=>{i.onMessage(`${e}:created`,t=>{a(this,li).has(e)||a(this,li).set(e,new Set);const n=a(this,li).get(e);n.add(t.voice),n.size===a(this,H).length&&this.sendUpstreamMessage(`${e}:created`,{envType:e,voiceCount:a(this,H).length})})}),a(this,Tn).forwardFrom(i,["voice:initialized","voice:started","voice:stopped","voice:releasing","voice:loaded","amp-env:trigger","amp-env:trigger:loop","amp-env:release","pitch-env:trigger","pitch-env:trigger:loop","pitch-env:release","filter-env:trigger","filter-env:trigger:loop","filter-env:release","amp-env:created","pitch-env:created","filter-env:created"],e=>e.type==="voice:loaded"?(a(this,xn).add(e.senderId),a(this,xn).size===a(this,H).length?{...e,type:"sample:loaded"}:null):e)},Ma=new WeakMap,or=function(){const i=a(this,De).size+a(this,Re).size;if(i===0){u(this,oi,1);return}u(this,oi,1/(1+Math.log10(i)*a(this,Ma))),[...a(this,De)].forEach(e=>{e.setMasterGain(a(this,oi))})},qs=function(){b(this,Nn,or).call(this)};async function xh(i,e){const t=new Ih(i,e);return await t.init(),t}var kn,pn,fn,Dn,cs,hi,mn,ci,gn,Lt,Nt,bn,ui,kt,di,ae,Y,Z,Te,Ee,Dt,yn,us,ds,ps,fs,ms,gs,Ea,Sa,bs,ys,Rt,vs,Aa,mt,Ye,lo,ho,co,Pa,uo,lr,pi,fi,Ct;class Oh{constructor(e,t=16,n){p(this,Ye),y(this,"nodeId"),y(this,"nodeType","sample-player"),y(this,"context"),p(this,kn),p(this,pn,!1),p(this,fn,null),p(this,Dn,!1),p(this,cs),p(this,hi,null),p(this,mn,new Set),p(this,ci,new Set),p(this,gn,null),p(this,Lt,0),p(this,Nt,!1),p(this,bn,!1),p(this,ui,!1),p(this,kt,!1),p(this,di,!1),p(this,ae),p(this,Y),p(this,Z),p(this,Te,null),p(this,Ee,null),p(this,Dt,0),p(this,yn,120),p(this,us,Ht.glide.defaultValue),p(this,ds,Ht.loopRampDuration.defaultValue),p(this,ps,Ht.keytrackLoop.defaultValue),p(this,fs,Ht.highpassFilter.defaultValue),p(this,ms,Ht.lowpassFilter.defaultValue),p(this,gs,!1),p(this,Ea,300),p(this,Sa,20),p(this,bs,!1),p(this,ys,!1),p(this,Rt,[]),p(this,vs,!0),p(this,Aa,!0),y(this,"randomizeVelocity",!1),y(this,"voicePool"),y(this,"outBus"),p(this,mt,new Set),y(this,"setModulationAmount",(s,r)=>this.voicePool.applyToAllVoices(o=>o.setModulationAmount(s,r))),p(this,pi,!1),y(this,"panic",s=>this.releaseAll(s)),p(this,fi,!1),y(this,"sustainPedalOn",()=>this.setSustainPedal(!0)),y(this,"sustainPedalOff",()=>this.setSustainPedal(!1)),y(this,"setPanDriftEnabled",s=>(this.voicePool.applyToAllVoices(r=>r.setPanDriftEnabled(s)),this)),y(this,"setTimestretchEnabled",s=>(this.voicePool.applyToAllVoices(r=>r.setTimestretchEnabled(s)),this)),y(this,"isNormalized",(s,r=[0,1])=>s>=r[0]&&s<=r[1]),y(this,"MIN_LOOP_DURATION_SECONDS",1/523.25),y(this,"setLoopStart",(s,r=this.getLoopRampDuration())=>this.setLoopPoint("start",s,this.loopEnd,r)),y(this,"setLoopEnd",(s,r=this.getLoopRampDuration())=>this.setLoopPoint("end",this.loopStart,s,r)),y(this,"setLoopDuration",(s,r=this.getLoopRampDuration())=>this.setLoopPoint("end",this.loopStart,this.loopStart+s,r)),y(this,"debugcounter",0),y(this,"getKeytrackLoopAmount",()=>a(this,ps)),y(this,"getHpfCutoff",()=>a(this,fs)),y(this,"getLpfCutoff",()=>a(this,ms)),y(this,"enablePitch",()=>this.voicePool.allVoices.forEach(s=>s.enablePitch())),y(this,"disablePitch",()=>this.voicePool.allVoices.forEach(s=>s.disablePitch())),y(this,"enableEnvelope",s=>{this.voicePool.applyToAllVoices(r=>r.enableEnvelope(s))}),y(this,"disableEnvelope",s=>{this.voicePool.applyToAllVoices(r=>r.disableEnvelope(s))}),y(this,"setEnvelopeLoop",(s,r,o="normal")=>{this.voicePool.applyToAllVoices(l=>l.setEnvelopeLoop(s,r,o))}),y(this,"setEnvelopeSync",(s,r)=>{this.voicePool.applyToAllVoices(o=>o.syncEnvelopeToPlaybackRate(s,r))}),y(this,"setEnvelopeTimeScale",(s,r)=>{this.voicePool.applyToAllVoices(o=>o.setEnvelopeTimeScale(s,r))}),y(this,"setDryWetMix",s=>{this.outBus.setDryWetMix(s)}),y(this,"sendToFx",(s,r)=>{this.outBus.setSendAmount(s,r)}),y(this,"setLpfCutoff",(s,r="pre")=>{u(this,ms,s),r==="pre"?this.voicePool.applyToAllVoices(o=>{o.setLpfCutoff(s)}):r==="post"&&this.outBus.setLpfCutoff(s)}),y(this,"setHpfCutoff",(s,r="pre")=>{u(this,fs,s),r==="pre"?this.voicePool.applyToAllVoices(o=>{o.setHpfCutoff(s)}):r==="post"&&this.outBus.setHpfCutoff(s)}),y(this,"setReverbAmount",s=>{this.outBus.setReverbSize(s)}),y(this,"setFeedbackAmount",s=>{s=G(s,0,1),(a(this,Ct)==="monophonic"||a(this,Ct)==="double-trouble")&&this.outBus.setFeedbackAmount(s),(a(this,Ct)==="polyphonic"||a(this,Ct)==="double-trouble")&&this.voicePool.applyToAllVoices(r=>{var o;(o=r.feedback)==null||o.setAmountMacro(s)})}),p(this,Ct,"monophonic"),this.nodeId=Ge("sample-player",this),this.context=e,u(this,kn,Et(this.nodeId)),u(this,ae,new GainNode(this.context,{gain:.5})),u(this,Y,new ir(this.context,0)),u(this,Z,new ir(this.context,0)),u(this,cs,t),u(this,hi,n||null)}async init(){if(!a(this,pn))return a(this,fn)?a(this,fn):(u(this,fn,(async()=>{var e,t,n;try{this.outBus=await kh(this.context),this.voicePool=await xh(this.context,a(this,cs)),b(this,Ye,Pa).call(this),b(this,Ye,lo).call(this),b(this,Ye,co).call(this),b(this,Ye,uo).call(this),b(this,Ye,ho).call(this),a(this,hi)&&await this.loadSample(a(this,hi),void 0,{skipPreProcessing:!0}),u(this,pn,!0)}catch(s){(e=this.voicePool)==null||e.dispose(),(t=a(this,Y))==null||t.dispose(),(n=a(this,Z))==null||n.dispose();const r=s instanceof Error?s.message:String(s);throw new Error(`Failed to initialize SamplePlayer: ${r}`)}})()),a(this,fn))}onMessage(e,t){return a(this,kn).onMessage(e,t)}sendUpstreamMessage(e,t){return a(this,kn).sendMessage(e,t),this}connect(e){var t;const n="input"in e&&e.input?e.input:e;a(this,ae).connect(n),"nodeId"in e&&(a(this,mn).add(e.nodeId),(t=e.addIncoming)==null||t.call(e,this.nodeId))}disconnect(e){var t;if(e){const n="input"in e?e.input:e;a(this,ae).disconnect(n),"nodeId"in e&&(a(this,mn).delete(e.nodeId),(t=e.removeIncoming)==null||t.call(e,this.nodeId))}else a(this,ae).disconnect(),a(this,mn).clear()}addIncoming(e){a(this,ci).add(e.nodeId)}removeIncoming(e){a(this,ci).delete(e.nodeId)}get connections(){return{outgoing:Array.from(a(this,mn)),incoming:Array.from(a(this,ci))}}get audioNode(){return a(this,ae)}get input(){return this.outBus.input}get output(){return a(this,ae)}get now(){return this.context.currentTime}get initialized(){return a(this,pn)}getMacrosAudioParam(e){switch(e){case"loopStart":return a(this,Y).audioParam;case"loopEnd":return a(this,Z).audioParam;default:const t=e;throw new Error(`Unknown macro parameter: ${t}`)}}getMacro(e){switch(e){case"loopStart":return a(this,Y);case"loopEnd":return a(this,Z);default:const t=e;throw new Error(`Unknown macro parameter: ${t}`)}}setModulationWaveform(e="AM",t="triangle",n={}){this.voicePool.applyToAllVoices(s=>s.setModulationWaveform(e,t,n))}syncLFOsToNoteFreq(e,t){var n,s,r,o,l,h;if(e==="gain-lfo"){if(t===!0)(n=a(this,Te))==null||n.storeCurrentValues();else{const c=(s=a(this,Te))==null?void 0:s.getStoredValues();c&&((r=a(this,Te))==null||r.setFrequency(c.rate))}u(this,bs,t)}if(e==="pitch-lfo"){if(t===!0)(o=a(this,Ee))==null||o.storeCurrentValues();else{const c=(l=a(this,Ee))==null?void 0:l.getStoredValues();c&&((h=a(this,Ee))==null||h.setFrequency(c.rate))}u(this,ys,t)}}freezeActiveVoices(e){return console.info(`SamplePlayer: freezeActiveVoices(${e}). Spectral freeze not implemented yet`),this}async loadSample(e,t,n){if(a(this,pi))throw new Error("A sample load is already in progress");u(this,pi,!0);let s;try{if(e instanceof ArrayBuffer&&(e=await this.context.decodeAudioData(e.slice(0))),!Sl(e))return console.error("Invalid AudioBuffer provided to loadSample"),null;if(e.sampleRate!==this.context.sampleRate)throw new RangeError(`Sample rate mismatch: buffer rate ${e.sampleRate}, context rate ${this.context.sampleRate}`);t&&this.context.sampleRate!==t&&console.warn(`Sample rate mismatch: context rate ${this.context.sampleRate}, requested rate ${t}`),this.releaseAll(0),this.transposeSemitones=0,u(this,Dn,!1),u(this,gn,null);let r;a(this,Aa)&&(r=await Br(this.context,e,n),e=r.audiobuffer,a(this,vs)&&r.zeroCrossings&&u(this,Rt,r.zeroCrossings)),u(this,gn,e),u(this,Lt,e.duration);const o=new Promise(h=>{s=this.voicePool.onMessage("sample:loaded",()=>{h()})});this.voicePool.setBuffer(e,a(this,Rt)),b(this,Ye,Pa).call(this);const l={rootNote:"C",scale:[0],lowestOctave:0,highestOctave:5,tuningOffset:0,normalize:!1};return this.setScale(l),await o,e}finally{s==null||s(),u(this,pi,!1)}}async cropSample(e=this.getStartPoint(),t=this.getEndPoint(),n=4){const s=a(this,gn);if(!s||!Number.isFinite(e)||!Number.isFinite(t))return null;const r=Math.max(0,Math.floor(e*s.sampleRate)),o=Math.min(s.length,Math.ceil(t*s.sampleRate));if(o<=r)return null;const l=Fr(this.context,s,r,o,n);return this.loadSample(l,void 0,{skipPreProcessing:!0})}async detectPitch(e){const t=await Lr(e),n=Or(t.frequency),s=69+12*Math.log2(t.frequency/440),r=n.frequency/t.frequency;return console.table({pitchSource:t,targetNoteInfo:n,playbackRateMultiplier:r,midiFloat:s}),this.sendUpstreamMessage("sample:pitch-detected",{pitchResults:t,closestNoteInfo:n}),{frequency:t.frequency,confidence:t.confidence,midiFloat:s,targetNoteInfo:n}}detectedPitchToTransposition(e,t){let n=t-e;for(;n>6;)n-=12;for(;n<-6;)n+=12;return n}play(e,t=100,n=this.getGlideTime()){var s,r;const o=Ya(t)?t:100,l=e+a(this,Dt);return Ya(l)?(a(this,bs)&&((s=a(this,Te))==null||s.setMusicalNote(l)),a(this,ys)&&((r=a(this,Ee))==null||r.setMusicalNote(l,{divisor:4})),this.outBus.noteOn(l,o,0,n),this.voicePool.noteOn(l,o,0,n)):(console.warn(`Invalid midiNote: ${l}`),null)}release(e){if(this.holdEnabled||a(this,kt))return this;const t=e+a(this,Dt);return a(this,di)?(a(this,mt).add(t),this):(a(this,mt).delete(t),this.voicePool.noteOff(t),this.sendUpstreamMessage("note:off",{transposedMidiNote:t}),this)}releaseAll(e){var t;return a(this,mt).clear(),(t=this.voicePool)==null||t.allNotesOff(e),this}get transposedBySemitones(){return a(this,Dt)}set transposeSemitones(e){a(this,Dt)!==e&&u(this,Dt,e)}setScale(e){return a(this,Y).setScale({snapToZeroCrossings:a(this,Rt),...e}),a(this,Z).setScale({snapToZeroCrossings:a(this,Rt),...e}),this}setRootNote(e){const t=Bi[e];let n=t===0?0:t-12;return this.transposedBySemitones===n?this:(this.transposeSemitones=n,a(this,Z).setRootNote(e),a(this,Y).setRootNote(e),this)}setVolume(e){return e=G(e,0,1),a(this,ae).gain.setValueAtTime(e,this.now),this}setSampleStartPoint(e){return this.voicePool.applyToAllVoices(t=>t.setStartPoint(e)),this.sendUpstreamMessage("start-point:updated",{startPoint:e}),this}setSampleEndPoint(e){return this.voicePool.applyToAllVoices(t=>t.setEndPoint(e)),this.sendUpstreamMessage("end-point:updated",{endPoint:e}),this}setLoopRampDuration(e){return u(this,ds,e),this}setGlideTime(e){return u(this,us,e),this}setLoopEnabled(e){return a(this,Nt)===e?this:a(this,bn)&&!e?this:(this.voicePool.allVoices.forEach(t=>t.setLoopEnabled(e)),u(this,Nt,e),this.sendUpstreamMessage("loop:enabled",{enabled:e}),this)}setLoopLocked(e){return a(this,bn)===e?this:(u(this,bn,e),this.setLoopEnabled(e),this.sendUpstreamMessage("loop:locked",{locked:e}),this)}setHoldEnabled(e){return a(this,ui)===e?this:a(this,kt)&&!e?this:(u(this,ui,e),e||this.releaseAll(.1),this.sendUpstreamMessage("hold:enabled",{enabled:e}),this)}setHoldLocked(e){return a(this,kt)===e?this:(u(this,kt,e),e===!1&&this.releaseAll(),this.sendUpstreamMessage("hold:locked",{locked:e}),this)}setSustainPedal(e){if(a(this,di)===e)return this;if(u(this,di,e),a(this,bn)||(a(this,fi)&&!e?(u(this,fi,!1),this.setLoopEnabled(!1)):e&&!a(this,Nt)&&(this.setLoopEnabled(!0),u(this,fi,!0))),a(this,kt)||this.setHoldEnabled(e),!e){for(const t of a(this,mt))this.voicePool.noteOff(t),this.sendUpstreamMessage("note:off",{transposedMidiNote:t});a(this,mt).clear()}return this}setPlaybackDirection(e){return this.voicePool.applyToAllVoices(t=>t.setPlaybackDirection(e)),this}setLoopDurationDriftAmount(e){return this.voicePool.applyToAllVoices(t=>t.setLoopDurationDriftAmount(e)),this}setTempo(e){if(!(e<a(this,Sa)||e>a(this,Ea)))return u(this,yn,e),this.voicePool.applyToAllVoices(t=>t.setTempo(e)),this.sendUpstreamMessage("tempo:updated",{bpm:e}),this}syncLoopToTempo(e){return this.voicePool.applyToAllVoices(t=>t.syncLoopToTempo(e)),this}setKeytrackLoopAmount(e){const t=Math.max(0,Math.min(1,e));return u(this,ps,t),this.voicePool.applyToAllVoices(n=>n.setKeytrackLoopAmount(t)),this}get tempo(){return a(this,yn)}setLoopPoint(e,t,n,s=this.getLoopRampDuration()){let r=e==="start"?G(t,this.MIN_LOOP_DURATION_SECONDS/2,n):t;if(e==="start"&&r===this.loopStart)return this;let o=G(n,r,a(this,Lt)-this.MIN_LOOP_DURATION_SECONDS/2);if(e==="end"&&o===this.loopEnd)return this;const l=o-r,h=s*1;if(e==="start"&&r!==this.loopStart){if(a(this,gs)){const c=60/a(this,yn),f=Math.round(l/c);r=o-f*c}l<this.MIN_LOOP_DURATION_SECONDS&&(r=o-this.MIN_LOOP_DURATION_SECONDS),a(this,Y).ramp(r,h,o)}else if(e==="end"&&o!==this.loopEnd){if(a(this,gs)){const c=60/a(this,yn),f=Math.round(l/c);o=r+f*c}l<this.MIN_LOOP_DURATION_SECONDS&&(o=r+this.MIN_LOOP_DURATION_SECONDS),a(this,Z).ramp(o,h,r)}return this.sendUpstreamMessage("loop-points:updated",{loopStart:this.loopStart,loopEnd:this.loopEnd}),this}scrollLoopPoints(e,t){const n=this.context.currentTime;return a(this,Y).setValue(e,n),a(this,Z).setValue(t,n),this.sendUpstreamMessage("loop-points:updated",{loopStart:this.loopStart,loopEnd:this.loopEnd}),this}setParam(e,t){switch(e){case"startPoint":this.setSampleStartPoint(t);break;case"endPoint":this.setSampleEndPoint(t);break;case"glideTime":this.setGlideTime(t);break;case"loopStart":this.setLoopStart(t);break;case"loopEnd":this.setLoopEnd(t);break;case"loopRampDuration":this.setLoopRampDuration(t);break;default:console.warn(`Unknown parameter: ${e}`)}return this}applyParams(e){return Object.entries(e).forEach(([t,n])=>{const s=Ht[t];!s||!Mh(s,n)||s.apply(this,n)}),this}getAudioParam(e){switch(e){case"loopStart":return a(this,Y).audioParam;case"loopEnd":return a(this,Z).audioParam;default:return console.warn(`Parameter '${e}' not found on SamplePlayer`),null}}getStartPoint(){var e,t;return((t=(e=this.voicePool)==null?void 0:e.allVoices[0])==null?void 0:t.startPoint)??0}getEndPoint(){var e,t;return((t=(e=this.voicePool)==null?void 0:e.allVoices[0])==null?void 0:t.endPoint)??this.sampleDuration}getLoopRampDuration(){return a(this,ds)}getGlideTime(){return a(this,us)}getParameterValue(e){switch(e){case"loopStart":return this.loopStart;case"loopEnd":return this.loopEnd;case"loopRampDuration":return this.getLoopRampDuration();case"startPoint":return this.getStartPoint();case"endPoint":return this.getEndPoint();case"glideTime":return this.getGlideTime();case"hpfCutoff":return this.getHpfCutoff();case"lpfCutoff":return this.getLpfCutoff();default:console.warn(`Unknown parameter: ${e}`);return}}getEnvelope(e){const t=this.voicePool.allVoices[0];if(!t)throw new Error("No voices available in voice pool");const n=t.getEnvelope(e);if(!n)throw new Error(`Envelope type '${e}' not found`);return n}setEnvelopeSustainPoint(e,t){this.voicePool.applyToAllVoices(n=>n.setEnvelopeSustainPoint(e,t))}setEnvelopeReleasePoint(e,t){this.voicePool.applyToAllVoices(n=>n.setEnvelopeReleasePoint(e,t))}updateEnvelopePoint(e,t,n,s){this.voicePool.applyToAllVoices(r=>r.updateEnvelopePoint(e,t,n,s))}addEnvelopePoint(e,t,n){this.voicePool.applyToAllVoices(s=>s.addEnvelopePoint(e,t,n))}deleteEnvelopePoint(e,t){this.voicePool.applyToAllVoices(n=>n.deleteEnvelopePoint(e,t))}startLevelMonitoring(e){this.outBus.startLevelMonitoring(e)}setFeedbackDecay(e){this.outBus.setFeedbackDecay(e),this.voicePool.applyToAllVoices(t=>{var n;(n=t.feedback)==null||n.setDecay(e)})}setFeedbackLowpassCutoff(e){this.outBus.setFeedbackLowpassCutoff(e),this.voicePool.applyToAllVoices(t=>{var n;(n=t.feedback)==null||n.setLowpassCutoff(e)})}setFeedbackMode(e){var t;if(u(this,Ct,e),e==="monophonic"){let n=((t=this.voicePool.allVoices[0].feedback)==null?void 0:t.currentAmount)??0;this.voicePool.applyToAllVoices(s=>{var r;(r=s.feedback)==null||r.setAmountMacro(0)}),this.outBus.setFeedbackAmount(n)}else if(e==="polyphonic"){const n=this.outBus.getFeedback().currentAmount;this.outBus.setFeedbackAmount(0),this.voicePool.applyToAllVoices(s=>{var r;(r=s.feedback)==null||r.setAmountMacro(n)})}else console.info("Feedback mode set to double-trouble, radical!")}setFeedbackPitchScale(e){this.outBus.setFeedbackPitchScale(e),this.voicePool.applyToAllVoices(t=>{var n;(n=t.feedback)==null||n.setDelayMultiplier(e)})}get mainOut(){return a(this,ae)}get outputBus(){return this.outBus}get sampleDuration(){return a(this,Lt)}get volume(){return a(this,ae).gain.value}set volume(e){a(this,ae).gain.setValueAtTime(e,this.context.currentTime)}get loopEnabled(){return a(this,Nt)}get holdEnabled(){return a(this,ui)}get gainLFO(){return a(this,Te)}get pitchLFO(){return a(this,Ee)}get loopStart(){return a(this,Y).targetValue}get loopEnd(){return a(this,Z).targetValue}get isLoaded(){return a(this,Dn)}get audiobuffer(){return a(this,gn)}dispose(){var e,t,n,s;try{this.releaseAll(),a(this,mt).clear(),this.voicePool&&(this.voicePool.dispose(),this.voicePool=null),this.outBus&&(this.outBus.dispose(),this.outBus=null),(e=a(this,Y))==null||e.dispose(),(t=a(this,Z))==null||t.dispose(),u(this,Y,null),u(this,Z,null),(n=a(this,Te))==null||n.dispose(),(s=a(this,Ee))==null||s.dispose(),this.disconnect(),u(this,Lt,0),u(this,pn,!1),u(this,Dn,!1),u(this,Rt,[]),u(this,vs,!1),u(this,Nt,!1),Ue(this.nodeId)}catch(r){console.error(`Error disposing Sampler ${this.nodeId}:`,r)}}}kn=new WeakMap,pn=new WeakMap,fn=new WeakMap,Dn=new WeakMap,cs=new WeakMap,hi=new WeakMap,mn=new WeakMap,ci=new WeakMap,gn=new WeakMap,Lt=new WeakMap,Nt=new WeakMap,bn=new WeakMap,ui=new WeakMap,kt=new WeakMap,di=new WeakMap,ae=new WeakMap,Y=new WeakMap,Z=new WeakMap,Te=new WeakMap,Ee=new WeakMap,Dt=new WeakMap,yn=new WeakMap,us=new WeakMap,ds=new WeakMap,ps=new WeakMap,fs=new WeakMap,ms=new WeakMap,gs=new WeakMap,Ea=new WeakMap,Sa=new WeakMap,bs=new WeakMap,ys=new WeakMap,Rt=new WeakMap,vs=new WeakMap,Aa=new WeakMap,mt=new WeakMap,Ye=new WeakSet,lo=function(){this.voicePool.connect(this.outBus.input),this.outBus.connect(a(this,ae)),a(this,ae).connect(this.context.destination)},ho=function(){return this.voicePool.onMessage("sample:loaded",i=>{u(this,Dn,!0)}),this.voicePool.onMessage("voice-pool:initialized",()=>{this.sendUpstreamMessage("sample-player:initialized",{})}),a(this,kn).forwardFrom(this.voicePool,["voice-pool:initialized","voice:started","voice:stopped","voice:releasing","sample:loaded","amp-env:created","amp-env:trigger","amp-env:trigger:loop","amp-env:release","pitch-env:created","pitch-env:trigger","pitch-env:trigger:loop","pitch-env:release","filter-env:created","filter-env:trigger","filter-env:trigger:loop","filter-env:release"]),this},co=function(){return this.voicePool.allVoices.forEach((i,e)=>{const t=i.getParam("loopStart"),n=i.getParam("loopEnd");t?a(this,Y).addTarget(t,"loopStart"):console.error("loopStart param is null!"),n?a(this,Z).addTarget(n,"loopEnd"):console.error("loopEnd param is null!")}),this},Pa=function(){return a(this,Y).setValue(0),a(this,Z).setValue(a(this,Lt)),this},uo=function(){u(this,Te,new ha(this.context)),a(this,Te).setWaveform("sine"),u(this,Ee,new ha(this.context));const i=a(this,Ee).getPitchWobbleWaveform();a(this,Ee).setWaveform(i),b(this,Ye,lr).call(this,a(this,Ee),"playbackRate"),a(this,Te).connect(this.outBus.input.gain)},lr=function(i,e){this.voicePool.applyToAllVoices(t=>{const n=t.getParam(e);n&&i.connect(n)})},pi=new WeakMap,fi=new WeakMap,Ct=new WeakMap;const Vh=`var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _SamplePlayerProcessor_instances, handleMessage_fn, resetState_fn, stop_fn, smoothLoopWrap_fn, _clamp, _clampZeroCrossing, findNearestZeroCrossing_fn, normalizedToSamples_fn, samplesToNormalized_fn, midiVelocityToGain_fn, getBufferDurationSeconds_fn, getMusicalNoteDurations_fn, quantizeLoopDuration_fn, extractPositionParams_fn, calculatePlaybackRange_fn, calculateLoopRange_fn, getSafeParam_fn, getConstantFlags_fn, resetDurationPreservation_fn, isDurationPreservationActive_fn, prepareDurationPreservingSample_fn, advanceDurationPreservingPlayback_fn, generateLoopDrift_fn, analyzeLoopAmplitude_fn;
function findClosestIdx(sortedArray, target, direction = "any", getValue = (x) => x, getDistance = (a, b) => Math.abs(a - b)) {
  if (sortedArray.length === 0) {
    throw new Error("Array cannot be empty");
  }
  if (sortedArray.length === 1) {
    return 0;
  }
  const targetValue = target;
  const firstValue = getValue(sortedArray[0]);
  const lastValue = getValue(sortedArray[sortedArray.length - 1]);
  if (targetValue <= firstValue) return 0;
  if (targetValue >= lastValue) return sortedArray.length - 1;
  let left = 0;
  let right = sortedArray.length - 1;
  while (left < right - 1) {
    const mid = Math.floor((left + right) / 2);
    const midValue = getValue(sortedArray[mid]);
    if (midValue === targetValue) {
      return mid;
    } else if (midValue < targetValue) {
      left = mid;
    } else {
      right = mid;
    }
  }
  if (direction === "left") return left;
  if (direction === "right") return right;
  const leftDistance = getDistance(getValue(sortedArray[left]), targetValue);
  const rightDistance = getDistance(getValue(sortedArray[right]), targetValue);
  return leftDistance <= rightDistance ? left : right;
}
function findClosest(sortedArray, target, direction = "any", getValue = (x) => x, getDistance = (a, b) => Math.abs(a - b)) {
  const index = findClosestIdx(
    sortedArray,
    target,
    direction,
    getValue,
    getDistance
  );
  return sortedArray[index];
}
const SAMPLE_PLAYER_WORKLET_AUDIOPARAMS = {
  masterGain: {
    name: "masterGain",
    defaultValue: 1,
    minValue: 0,
    maxValue: 2,
    automationRate: "k-rate"
  },
  envGain: {
    name: "envGain",
    defaultValue: 0,
    minValue: 0,
    maxValue: 1,
    automationRate: "a-rate"
  },
  velocity: {
    name: "velocity",
    defaultValue: 100,
    minValue: 0,
    maxValue: 127,
    automationRate: "k-rate"
  },
  pan: {
    name: "pan",
    defaultValue: 0,
    minValue: -1,
    // -1 hard left
    maxValue: 1,
    // 1 hard right
    automationRate: "k-rate"
  },
  playbackRate: {
    name: "playbackRate",
    defaultValue: 1,
    minValue: 0.1,
    maxValue: 24,
    automationRate: "a-rate"
  },
  // NOTE: Time based params use seconds
  loopStart: {
    name: "loopStart",
    defaultValue: 0,
    minValue: 0,
    maxValue: 99999,
    // Max sample length in seconds
    automationRate: "k-rate"
  },
  loopEnd: {
    name: "loopEnd",
    defaultValue: 99999,
    // Will be set to actual buffer duration when loaded
    minValue: 0,
    maxValue: 99999,
    automationRate: "k-rate"
  },
  startPoint: {
    name: "startPoint",
    defaultValue: 0,
    minValue: 0,
    maxValue: 9999,
    // Max sample length in seconds
    automationRate: "k-rate"
  },
  endPoint: {
    name: "endPoint",
    defaultValue: 9999,
    // Will be set to actual buffer duration when loaded
    minValue: 0,
    maxValue: 9999,
    automationRate: "k-rate"
  },
  playbackPosition: {
    name: "playbackPosition",
    defaultValue: 0,
    minValue: 0,
    maxValue: 99999,
    automationRate: "k-rate"
  },
  loopDurationDriftAmount: {
    name: "loopDurationDriftAmount",
    defaultValue: 0,
    minValue: 0,
    maxValue: 1,
    // 0 = no drift, 1 = max drift (up to 100% of loop duration)
    automationRate: "k-rate"
  },
  maxLoopCount: {
    name: "maxLoopCount",
    defaultValue: 999999,
    minValue: 1,
    maxValue: 999999,
    automationRate: "k-rate"
  },
  tempo: {
    name: "tempo",
    defaultValue: 120,
    minValue: 20,
    maxValue: 300,
    automationRate: "k-rate"
  }
};
const SAMPLE_PLAYER_WORKLET_AUDIOPARAM_DESCRIPTORS = Object.values(
  SAMPLE_PLAYER_WORKLET_AUDIOPARAMS
);
class SamplePlayerProcessor extends AudioWorkletProcessor {
  // ===== CONSTRUCTOR =====
  constructor() {
    super();
    __privateAdd(this, _SamplePlayerProcessor_instances);
    __privateAdd(this, _clamp, (value, min, max) => Math.max(min, Math.min(max, value)));
    __privateAdd(this, _clampZeroCrossing, (value) => __privateGet(this, _clamp).call(this, value, this.minZeroCrossing, this.maxZeroCrossing));
    this.buffer = null;
    this.minZeroCrossing = 0;
    this.maxZeroCrossing = 0;
    this.usePlaybackPosition = false;
    this.enableLoopSmoothing = true;
    this.enableAdaptiveDrift = true;
    this.enableAmplitudeCompensation = true;
    this.syncLoopToTempo = false;
    this.keytrackLoopAmount = 0;
    this.durationPreservation = {
      enabled: false,
      maxDriftSamples: Math.floor(sampleRate * 0.04),
      timelinePosition: 0,
      resetPending: false
    };
    this.PITCH_PRESERVATION_THRESHOLD = Math.floor(sampleRate * 0.061);
    this.AMPLITUDE_COMPENSATION_THRESHOLD = Math.floor(sampleRate / 16.35);
    this.port.onmessage = __privateMethod(this, _SamplePlayerProcessor_instances, handleMessage_fn).bind(this);
    __privateMethod(this, _SamplePlayerProcessor_instances, resetState_fn).call(this);
    this.port.postMessage({ type: "initialized" });
  }
  // ===== PARAMETER DESCRIPTORS =====
  static get parameterDescriptors() {
    return SAMPLE_PLAYER_WORKLET_AUDIOPARAM_DESCRIPTORS;
  }
  // ===== MAIN PROCESS METHOD =====
  process(inputs, outputs, parameters) {
    var _a, _b, _c;
    const output = outputs[0];
    this.debugCounter++;
    if (!output || !this.isPlaying || !((_b = (_a = this.buffer) == null ? void 0 : _a[0]) == null ? void 0 : _b.length)) {
      return true;
    }
    const masterGain = parameters.masterGain[0];
    const positionParams = __privateMethod(this, _SamplePlayerProcessor_instances, extractPositionParams_fn).call(this, parameters);
    const playbackRange = __privateMethod(this, _SamplePlayerProcessor_instances, calculatePlaybackRange_fn).call(this, positionParams);
    const effectivePlaybackRate = parameters.playbackRate[0] * this.transpositionPlaybackrate;
    const tempo = parameters.tempo[0];
    const loopRange = __privateMethod(this, _SamplePlayerProcessor_instances, calculateLoopRange_fn).call(this, positionParams, playbackRange, parameters.loopDurationDriftAmount[0], tempo, effectivePlaybackRate);
    const amplitudeGain = __privateMethod(this, _SamplePlayerProcessor_instances, analyzeLoopAmplitude_fn).call(this, loopRange.loopStartSamples, loopRange.loopEndSamples);
    const velocityGain = __privateMethod(this, _SamplePlayerProcessor_instances, midiVelocityToGain_fn).call(this, parameters.velocity[0]) * this.velocitySensitivity;
    const basePan = parameters.pan[0];
    const effectivePan = this.panDriftEnabled ? Math.max(-1, Math.min(1, basePan + this.currentPanDrift)) : basePan;
    let outputChannels;
    if (output instanceof Float32Array) {
      outputChannels = [output];
    } else if (Array.isArray(output) && output.every((ch) => ch instanceof Float32Array)) {
      outputChannels = output;
    } else {
      console.error("Unexpected output structure:", {
        outputType: typeof output,
        isArray: Array.isArray(output),
        constructor: (_c = output == null ? void 0 : output.constructor) == null ? void 0 : _c.name,
        length: output == null ? void 0 : output.length
      });
      return true;
    }
    const numChannels = outputChannels.length;
    const isConstant = __privateMethod(this, _SamplePlayerProcessor_instances, getConstantFlags_fn).call(this, parameters);
    const silencePadTail = loopRange.loopEndSamples > playbackRange.endSamples;
    const TAIL_FADE_SAMPLES = 64;
    if (this.playbackPosition === 0) {
      this.playbackPosition = this.reversePlayback ? playbackRange.endSamples - 1 : playbackRange.startSamples;
      __privateMethod(this, _SamplePlayerProcessor_instances, resetDurationPreservation_fn).call(this, this.playbackPosition);
    }
    for (let sample = 0; sample < outputChannels[0].length; sample++) {
      const envelopeGain = __privateMethod(this, _SamplePlayerProcessor_instances, getSafeParam_fn).call(this, parameters.envGain, sample, isConstant.envGain);
      const baseRate = __privateMethod(this, _SamplePlayerProcessor_instances, getSafeParam_fn).call(this, parameters.playbackRate, sample, isConstant.playbackRate);
      const effectiveRate = this.reversePlayback ? -Math.abs(baseRate) : Math.abs(baseRate);
      const playbackStep = effectiveRate * this.transpositionPlaybackrate;
      const canWrapLoop = this.loopEnabled && this.loopCount < parameters.maxLoopCount[0];
      if (canWrapLoop) {
        if (!this.reversePlayback && this.playbackPosition >= loopRange.loopEndSamples) {
          __privateMethod(this, _SamplePlayerProcessor_instances, smoothLoopWrap_fn).call(this, silencePadTail ? 0 : this.buffer[0][Math.floor(this.playbackPosition - 1)] || 0, this.buffer[0][Math.floor(loopRange.loopStartSamples)] || 0);
          this.playbackPosition = loopRange.loopStartSamples;
          this.loopCount++;
          this.nextDriftGenerated = false;
        } else if (this.reversePlayback && this.playbackPosition <= loopRange.loopStartSamples) {
          __privateMethod(this, _SamplePlayerProcessor_instances, smoothLoopWrap_fn).call(this, this.buffer[0][Math.floor(loopRange.loopStartSamples)] || 0, silencePadTail ? 0 : this.buffer[0][Math.floor(loopRange.loopEndSamples) - 1] || 0);
          this.playbackPosition = loopRange.loopEndSamples;
          this.loopCount++;
          this.nextDriftGenerated = false;
        }
      }
      const durationResetTarget = __privateMethod(this, _SamplePlayerProcessor_instances, prepareDurationPreservingSample_fn).call(this, playbackStep, loopRange);
      const shouldStopForward = !this.reversePlayback && (__privateMethod(this, _SamplePlayerProcessor_instances, isDurationPreservationActive_fn).call(this, loopRange) ? this.durationPreservation.timelinePosition : this.playbackPosition) >= playbackRange.endSamples;
      const shouldStopReverse = this.reversePlayback && (__privateMethod(this, _SamplePlayerProcessor_instances, isDurationPreservationActive_fn).call(this, loopRange) ? this.durationPreservation.timelinePosition : this.playbackPosition) <= playbackRange.startSamples;
      const isWithinLoop = this.loopEnabled && this.playbackPosition >= loopRange.loopStartSamples && this.playbackPosition <= loopRange.loopEndSamples;
      if ((shouldStopForward || shouldStopReverse) && !(this.loopEnabled && isWithinLoop)) {
        __privateMethod(this, _SamplePlayerProcessor_instances, stop_fn).call(this);
        return true;
      }
      let tailGain = 1;
      if (silencePadTail) {
        const distToEnd = playbackRange.endSamples - this.playbackPosition;
        if (distToEnd < TAIL_FADE_SAMPLES) {
          tailGain = Math.max(0, distToEnd / TAIL_FADE_SAMPLES);
        }
      }
      const currentPosition = Math.floor(this.playbackPosition);
      const positionOffset = this.playbackPosition - currentPosition;
      let nextPosition, interpWeight;
      if (this.reversePlayback) {
        nextPosition = Math.max(
          currentPosition - 1,
          playbackRange.startSamples
        );
        interpWeight = 1 - positionOffset;
      } else {
        nextPosition = Math.min(
          currentPosition + 1,
          playbackRange.endSamples - 1
        );
        interpWeight = positionOffset;
      }
      for (let channel = 0; channel < numChannels; channel++) {
        if (!outputChannels[channel]) {
          console.warn(
            \`Output channel \${channel} does not exist. Available channels:\`,
            outputChannels.length
          );
          continue;
        }
        const bufferChannelIndex = Math.min(channel, this.buffer.length - 1);
        const bufferChannel = this.buffer[bufferChannelIndex];
        const currentSample = bufferChannel[currentPosition] || 0;
        const nextSample = bufferChannel[nextPosition] || 0;
        let interpolatedSample = currentSample + interpWeight * (nextSample - currentSample);
        if (this.applyClickCompensation) {
          interpolatedSample += this.loopClickCompensation;
          if (this.compensationDecay) {
            this.loopClickCompensation *= this.compensationDecay;
            if (Math.abs(this.loopClickCompensation) < 1e-3) {
              this.applyClickCompensation = false;
            }
          } else {
            this.applyClickCompensation = false;
          }
        }
        const finalSample = interpolatedSample * velocityGain * envelopeGain * masterGain * amplitudeGain * tailGain;
        let panAdjustedSample = finalSample;
        if (outputChannels.length === 2) {
          if (channel === 0) {
            panAdjustedSample = finalSample * (1 - Math.max(0, effectivePan));
          } else if (channel === 1) {
            panAdjustedSample = finalSample * (1 - Math.max(0, -effectivePan));
          }
        }
        outputChannels[channel][sample] = Math.max(
          -1,
          Math.min(1, isFinite(panAdjustedSample) ? panAdjustedSample : 0)
        );
      }
      __privateMethod(this, _SamplePlayerProcessor_instances, advanceDurationPreservingPlayback_fn).call(this, playbackStep, durationResetTarget, loopRange, canWrapLoop);
    }
    if (this.usePlaybackPosition) {
      const normalizedPosition = __privateMethod(this, _SamplePlayerProcessor_instances, samplesToNormalized_fn).call(this, this.playbackPosition);
      this.port.postMessage({
        type: "voice:position",
        position: normalizedPosition
      });
    }
    return true;
  }
}
_SamplePlayerProcessor_instances = new WeakSet();
// ===== MESSAGE HANDLING =====
handleMessage_fn = function(event) {
  const {
    type,
    value,
    buffer,
    timestamp,
    durationSeconds,
    zeroCrossings,
    semitones,
    allowedPeriods,
    playbackDirection
  } = event.data;
  switch (type) {
    case "voice:reset":
      __privateMethod(this, _SamplePlayerProcessor_instances, resetState_fn).call(this);
      this.port.postMessage({ type: "voice:reset" });
      break;
    case "voice:setBuffer":
      __privateMethod(this, _SamplePlayerProcessor_instances, resetState_fn).call(this);
      this.zeroCrossings = [];
      this.minZeroCrossing = 0;
      this.maxZeroCrossing = 0;
      this.buffer = null;
      this.buffer = buffer;
      this.port.postMessage({
        type: "voice:loaded",
        durationSeconds,
        time: currentTime
      });
      break;
    case "transpose":
      this.transpositionPlaybackrate = Math.pow(2, semitones / 12);
      this.port.postMessage({
        type: "voice:transposed",
        semitones,
        time: currentTime
      });
      break;
    case "voice:setZeroCrossings":
      this.zeroCrossings = (zeroCrossings || []).map(
        (timeSec) => timeSec * sampleRate
      );
      if (this.zeroCrossings.length > 0) {
        this.minZeroCrossing = this.zeroCrossings[0];
        this.maxZeroCrossing = this.zeroCrossings[this.zeroCrossings.length - 1];
      }
      break;
    case "voice:start":
      this.isReleasing = false;
      this.isPlaying = true;
      this.loopCount = 0;
      this.playbackPosition = 0;
      this.port.postMessage({
        type: "voice:started",
        time: timestamp || currentTime
      });
      break;
    case "voice:release":
      this.isReleasing = true;
      this.port.postMessage({
        type: "voice:releasing",
        time: currentTime
      });
      break;
    case "voice:stop":
      __privateMethod(this, _SamplePlayerProcessor_instances, stop_fn).call(this);
      break;
    case "setLoopEnabled":
      this.loopEnabled = value;
      this.port.postMessage({
        type: "loop:enabled",
        enabled: value
      });
      break;
    case "setPanDriftEnabled":
      this.panDriftEnabled = value;
      break;
    case "voice:setPlaybackDirection": {
      const reverse = playbackDirection === "reverse";
      if (reverse !== this.reversePlayback && this.playbackPosition > 0) {
        this.playbackPosition += reverse ? 1 : -1;
      }
      this.reversePlayback = reverse;
      this.port.postMessage({
        type: "voice:playbackDirectionChange",
        playbackDirection
      });
      break;
    }
    case "voice:usePlaybackPosition":
      this.usePlaybackPosition = value;
      break;
    case "syncLoopToTempo":
      this.syncLoopToTempo = value;
      this.port.postMessage({
        type: "loop:syncToTempo",
        enabled: value
      });
      break;
    case "setKeytrackLoopAmount":
      this.keytrackLoopAmount = Math.max(0, Math.min(1, value));
      break;
    case "setPreserveDuration":
      this.durationPreservation.enabled = Boolean(value);
      __privateMethod(this, _SamplePlayerProcessor_instances, resetDurationPreservation_fn).call(this, this.playbackPosition);
      break;
  }
};
// ===== METHODS =====
resetState_fn = function() {
  this.isPlaying = false;
  this.isReleasing = false;
  this.loopEnabled = false;
  this.transpositionPlaybackrate = 1;
  this.velocitySensitivity = 1;
  this.reversePlayback = false;
  this.playbackPosition = 0;
  this.debugCounter = 0;
  this.loopCount = 0;
  this.applyClickCompensation = false;
  this.loopClickCompensation = 0;
  this.driftUpdateCounter = 0;
  this.currentLoopDrift = 0;
  this.currentPanDrift = 0;
  this.panDriftEnabled = true;
  this.nextDriftGenerated = false;
  this.loopAmplitudeGain = 1;
  this.lastAnalyzedLoopStart = -1;
  this.lastAnalyzedLoopEnd = -1;
  __privateMethod(this, _SamplePlayerProcessor_instances, resetDurationPreservation_fn).call(this);
};
stop_fn = function() {
  this.isPlaying = false;
  this.isReleasing = false;
  this.playbackPosition = 0;
  this.port.postMessage({ type: "voice:stopped" });
};
// Arm click compensation for a loop-wrap discontinuity between the sample
// just emitted and the first sample of the next pass.
smoothLoopWrap_fn = function(lastLoopSample, newFirstSample) {
  const discontinuity = lastLoopSample - newFirstSample;
  if (this.enableLoopSmoothing && Math.abs(discontinuity) > 0.01) {
    this.loopClickCompensation = discontinuity * 0.5;
    this.compensationDecay = 0.9;
    this.applyClickCompensation = true;
  }
};
_clamp = new WeakMap();
_clampZeroCrossing = new WeakMap();
findNearestZeroCrossing_fn = function(position, direction = "any", maxDistance = null) {
  if (!this.zeroCrossings || this.zeroCrossings.length === 0) {
    return position;
  }
  const closestValue = findClosest(this.zeroCrossings, position, direction);
  if (maxDistance !== null && Math.abs(closestValue - position) > maxDistance) {
    return position;
  }
  return closestValue;
};
// ===== CONVERSION UTILITIES =====
/**
 * Convert normalized position (0-1) to sample index
 * @param {number} normalizedPosition - Position as 0-1 value
 * @returns {number} - Sample index
 */
normalizedToSamples_fn = function(normalizedPosition) {
  if (!this.buffer || !this.buffer[0]) return 0;
  return normalizedPosition * this.buffer[0].length;
};
/**
 * Convert sample index to normalized position (0-1)
 * @param {number} sampleIndex - Sample index
 * @returns {number} - Normalized position 0-1
 */
samplesToNormalized_fn = function(sampleIndex) {
  if (!this.buffer || !this.buffer[0]) return 0;
  return sampleIndex / this.buffer[0].length;
};
/**
 * Convert MIDI velocity (0-127) to gain multiplier (0-1)
 * @param {number} midiVelocity - MIDI velocity 0-127
 * @returns {number} - Gain multiplier 0-1
 */
midiVelocityToGain_fn = function(midiVelocity) {
  return Math.max(0, Math.min(1, midiVelocity / 127));
};
/**
 * Get buffer duration in seconds
 * @returns {number} - Buffer duration in seconds
 */
getBufferDurationSeconds_fn = function() {
  var _a, _b;
  return (((_b = (_a = this.buffer) == null ? void 0 : _a[0]) == null ? void 0 : _b.length) || 0) / sampleRate;
};
/**
 * Calculate musical note durations in samples for given tempo
 * @param {number} tempo - BPM
 * @returns {Object} - Musical note durations in samples
 */
getMusicalNoteDurations_fn = function(tempo) {
  const beatsPerSecond = tempo / 60;
  const samplesPerBeat = sampleRate / beatsPerSecond;
  return {
    // Standard notes
    whole: samplesPerBeat * 4,
    half: samplesPerBeat * 2,
    quarter: samplesPerBeat,
    eighth: samplesPerBeat / 2,
    sixteenth: samplesPerBeat / 4,
    thirtySecond: samplesPerBeat / 8,
    // Triplets (divide by 3/2 = multiply by 2/3)
    quarterTriplet: samplesPerBeat * 2 / 3,
    eighthTriplet: samplesPerBeat / 2 * 2 / 3,
    sixteenthTriplet: samplesPerBeat / 4 * 2 / 3
  };
};
/**
 * Quantize loop duration to nearest musical interval (skips if below the smallest quantize option)
 * @param {number} loopDurationSamples - Current loop duration in samples
 * @param {number} tempo - Current tempo in BPM
 * @param {number} playbackRate - Current playback rate
 * @returns {number} - Quantized loop duration in samples
 */
quantizeLoopDuration_fn = function(loopDurationSamples, tempo, playbackRate) {
  if (!this.syncLoopToTempo) {
    return loopDurationSamples;
  }
  const noteDurations = __privateMethod(this, _SamplePlayerProcessor_instances, getMusicalNoteDurations_fn).call(this, tempo);
  const effectiveDuration = loopDurationSamples / Math.abs(playbackRate);
  const smallestInterval = noteDurations.thirtySecond;
  if (effectiveDuration < smallestInterval) {
    return loopDurationSamples;
  }
  const intervals = Object.values(noteDurations);
  let closestInterval = intervals[0];
  let smallestDiff = Math.abs(effectiveDuration - closestInterval);
  for (const interval of intervals) {
    const diff = Math.abs(effectiveDuration - interval);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestInterval = interval;
    }
  }
  return Math.floor(closestInterval * Math.abs(playbackRate));
};
/**
 * Extract and convert all position parameters from seconds to samples
 * @param {Object} parameters - AudioWorkletProcessor parameters
 * @returns {Object} - Converted parameters in samples
 */
extractPositionParams_fn = function(parameters) {
  const samples = {
    startPointSamples: Math.floor(parameters.startPoint[0] * sampleRate),
    endPointSamples: Math.floor(parameters.endPoint[0] * sampleRate),
    loopStartSamples: Math.floor(parameters.loopStart[0] * sampleRate),
    loopEndSamples: Math.floor(parameters.loopEnd[0] * sampleRate)
  };
  return samples;
};
/**
 * Calculate effective playback range in samples
 * @param {Object} params - Position parameters from #extractPositionParams
 * @returns {Object} - Effective start and end positions
 */
calculatePlaybackRange_fn = function(params) {
  var _a, _b;
  const bufferLength = ((_b = (_a = this.buffer) == null ? void 0 : _a[0]) == null ? void 0 : _b.length) || 0;
  const start = Math.max(0, params.startPointSamples);
  const end = params.endPointSamples > start ? Math.min(bufferLength, params.endPointSamples) : bufferLength;
  const snappedStart = __privateMethod(this, _SamplePlayerProcessor_instances, findNearestZeroCrossing_fn).call(this, start, "right");
  const snappedEnd = __privateMethod(this, _SamplePlayerProcessor_instances, findNearestZeroCrossing_fn).call(this, end, "left");
  return {
    startSamples: snappedStart,
    endSamples: snappedEnd,
    durationSamples: snappedEnd - snappedStart
  };
};
/**
 * Calculate effective loop range in samples with optional drift
 * @param {Object} params - Position parameters from #extractPositionParams
 * @param {Object} playbackRange - Range from #calculatePlaybackRange
 * @param {number} driftAmount - Loop duration drift amount (0-1)
 * @param {number} tempo - Current tempo in BPM
 * @param {number} playbackRate - Current playback rate
 * @returns {Object} - Effective loop start and end positions with drift applied
 */
calculateLoopRange_fn = function(params, playbackRange, driftAmount = 0, tempo = 120, playbackRate = 1) {
  const lpStart = params.loopStartSamples;
  const lpEnd = params.loopEndSamples;
  let calcLoopStart = lpStart < lpEnd && lpStart >= 0 ? lpStart : playbackRange.startSamples;
  let calcLoopEnd = lpEnd > lpStart && lpEnd <= playbackRange.endSamples ? lpEnd : playbackRange.endSamples;
  let baseDuration = calcLoopEnd - calcLoopStart;
  if (this.syncLoopToTempo) {
    const quantizedDuration = __privateMethod(this, _SamplePlayerProcessor_instances, quantizeLoopDuration_fn).call(this, baseDuration, tempo, playbackRate);
    calcLoopEnd = calcLoopStart + quantizedDuration;
    calcLoopEnd = Math.min(calcLoopEnd, playbackRange.endSamples);
  }
  if (baseDuration > this.PITCH_PRESERVATION_THRESHOLD && this.keytrackLoopAmount > 0 && !this.syncLoopToTempo) {
    const scale = 1 + this.keytrackLoopAmount * (Math.abs(playbackRate) - 1);
    baseDuration = Math.max(1, Math.floor(baseDuration * scale));
    calcLoopEnd = calcLoopStart + baseDuration;
  }
  baseDuration = calcLoopEnd - calcLoopStart;
  if (baseDuration > this.PITCH_PRESERVATION_THRESHOLD) {
    calcLoopStart = __privateMethod(this, _SamplePlayerProcessor_instances, findNearestZeroCrossing_fn).call(this, calcLoopStart, "right");
  }
  if (driftAmount > 0 && this.loopEnabled) {
    if (!this.nextDriftGenerated || this.loopCount === 0) {
      const updateInterval = baseDuration <= this.PITCH_PRESERVATION_THRESHOLD ? Math.max(
        1,
        Math.floor(this.PITCH_PRESERVATION_THRESHOLD / baseDuration)
      ) : 1;
      const shouldUpdateDrift = this.driftUpdateCounter % updateInterval === 0;
      if (shouldUpdateDrift) {
        this.currentLoopDrift = __privateMethod(this, _SamplePlayerProcessor_instances, generateLoopDrift_fn).call(this, driftAmount, baseDuration);
        if (this.panDriftEnabled && driftAmount > 0 && this.loopCount > 0) {
          const panDriftAmountScalar = 1e-4;
          this.currentPanDrift = this.currentLoopDrift * panDriftAmountScalar;
        } else {
          this.currentPanDrift = 0;
        }
      }
      this.driftUpdateCounter++;
      this.nextDriftGenerated = true;
    }
    const driftedLoopEnd = calcLoopEnd + this.currentLoopDrift;
    const minLoopDuration = Math.max(1, Math.floor(baseDuration * 0.1));
    const maxLoopEnd = Math.max(playbackRange.endSamples, calcLoopEnd);
    calcLoopEnd = Math.max(
      calcLoopStart + minLoopDuration,
      Math.min(maxLoopEnd, driftedLoopEnd)
    );
  } else {
    this.currentPanDrift = 0;
  }
  if (baseDuration > this.PITCH_PRESERVATION_THRESHOLD && calcLoopEnd <= playbackRange.endSamples) {
    calcLoopEnd = Math.max(
      calcLoopStart + 1,
      __privateMethod(this, _SamplePlayerProcessor_instances, findNearestZeroCrossing_fn).call(this, calcLoopEnd, "left")
    );
  }
  const loopDuration = calcLoopEnd - calcLoopStart;
  return {
    loopStartSamples: calcLoopStart,
    loopEndSamples: calcLoopEnd,
    loopDurationSamples: loopDuration
  };
};
getSafeParam_fn = function(paramArray, index, isConstant) {
  return isConstant ? paramArray[0] : paramArray[Math.min(index, paramArray.length - 1)];
};
getConstantFlags_fn = function(parameters) {
  this.constantFlags ?? (this.constantFlags = {
    envGain: true,
    playbackRate: true
  });
  this.constantFlags.envGain = parameters.envGain.length === 1;
  this.constantFlags.playbackRate = parameters.playbackRate.length === 1;
  return this.constantFlags;
};
// ===== DURATION PRESERVATION =====
resetDurationPreservation_fn = function(position = 0) {
  this.durationPreservation.timelinePosition = position;
  this.durationPreservation.resetPending = false;
};
isDurationPreservationActive_fn = function(loopRange) {
  var _a;
  return this.durationPreservation.enabled && Boolean((_a = this.zeroCrossings) == null ? void 0 : _a.length) && (!this.loopEnabled || loopRange.loopDurationSamples > this.PITCH_PRESERVATION_THRESHOLD);
};
prepareDurationPreservingSample_fn = function(playbackRate, loopRange) {
  const state = this.durationPreservation;
  if (!__privateMethod(this, _SamplePlayerProcessor_instances, isDurationPreservationActive_fn).call(this, loopRange)) return null;
  if (Math.abs(this.playbackPosition - state.timelinePosition) > state.maxDriftSamples) {
    state.resetPending = true;
  }
  if (!state.resetPending) return null;
  const direction = playbackRate < 0 ? "left" : "right";
  const outgoingZero = __privateMethod(this, _SamplePlayerProcessor_instances, findNearestZeroCrossing_fn).call(this, this.playbackPosition, direction);
  if (Math.abs(outgoingZero - this.playbackPosition) > Math.abs(playbackRate)) {
    return null;
  }
  this.playbackPosition = outgoingZero;
  state.resetPending = false;
  return __privateMethod(this, _SamplePlayerProcessor_instances, findNearestZeroCrossing_fn).call(this, state.timelinePosition, "any", state.maxDriftSamples);
};
advanceDurationPreservingPlayback_fn = function(playbackRate, resetTarget, loopRange, canWrapLoop) {
  const state = this.durationPreservation;
  this.playbackPosition = resetTarget === null ? this.playbackPosition + playbackRate : resetTarget;
  if (__privateMethod(this, _SamplePlayerProcessor_instances, isDurationPreservationActive_fn).call(this, loopRange)) {
    state.timelinePosition += playbackRate < 0 ? -1 : 1;
    if (canWrapLoop && playbackRate >= 0 && state.timelinePosition >= loopRange.loopEndSamples) {
      state.timelinePosition = loopRange.loopStartSamples;
    } else if (canWrapLoop && playbackRate < 0 && state.timelinePosition <= loopRange.loopStartSamples) {
      state.timelinePosition = loopRange.loopEndSamples - 1;
    }
  } else {
    __privateMethod(this, _SamplePlayerProcessor_instances, resetDurationPreservation_fn).call(this, this.playbackPosition);
  }
};
/**
 * Generate a new drift amount for the current loop iteration
 * @param {number} driftAmount - Maximum drift amount (0-1)
 * @param {number} baseDuration - Base loop duration in samples
 * @returns {number} - Drift amount in samples
 */
generateLoopDrift_fn = function(driftAmount, baseDuration) {
  if (driftAmount <= 0) return 0;
  const randomFactor = (Math.random() - 0.5) * 2;
  let effectiveDriftAmount = driftAmount;
  if (this.enableAdaptiveDrift) {
    const shortThreshold = 1024;
    const longThreshold = 8192;
    if (baseDuration < shortThreshold) {
      effectiveDriftAmount *= 0.1;
    } else if (baseDuration < longThreshold) {
      const scaleFactor = 0.1 + 0.9 * (baseDuration - shortThreshold) / (longThreshold - shortThreshold);
      effectiveDriftAmount *= scaleFactor;
    }
  }
  const maxDriftSamples = effectiveDriftAmount * baseDuration;
  return Math.floor(randomFactor * maxDriftSamples);
};
/**
 * Analyze loop amplitude and calculate makeup gain for short loops
 * @param {number} loopStart - Loop start position in samples
 * @param {number} loopEnd - Loop end position in samples
 * @returns {number} - Makeup gain multiplier (1.0 = no change)
 */
analyzeLoopAmplitude_fn = function(loopStart, loopEnd) {
  if (!this.enableAmplitudeCompensation || !this.buffer || !this.buffer[0]) {
    return 1;
  }
  const loopDuration = loopEnd - loopStart;
  if (loopDuration >= this.AMPLITUDE_COMPENSATION_THRESHOLD) {
    return 1;
  }
  if (loopStart === this.lastAnalyzedLoopStart && loopEnd === this.lastAnalyzedLoopEnd) {
    return this.loopAmplitudeGain;
  }
  let sumSquares = 0;
  let sampleCount = 0;
  const channel = this.buffer[0];
  const startIndex = Math.floor(loopStart);
  const endIndex = Math.floor(loopEnd);
  for (let i = startIndex; i < endIndex && i < channel.length; i++) {
    const sample = channel[i];
    sumSquares += sample * sample;
    sampleCount++;
  }
  if (sampleCount === 0) return 1;
  const rmsAmplitude = Math.sqrt(sumSquares / sampleCount);
  const targetAmplitude = 0.3;
  let makeupGain = 1;
  if (rmsAmplitude < targetAmplitude) {
    const safeRms = Math.max(rmsAmplitude, 1e-3);
    makeupGain = targetAmplitude / safeRms;
    makeupGain = Math.min(2, makeupGain);
  }
  this.lastAnalyzedLoopStart = loopStart;
  this.lastAnalyzedLoopEnd = loopEnd;
  this.loopAmplitudeGain = makeupGain;
  return makeupGain;
};
registerProcessor("sample-player-processor", SamplePlayerProcessor);
class RandomNoiseProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.previousNoise = 0;
    this.previousFiltered = 0;
    this.hpfHz = 150;
    this.alpha = this.hpfHz / (this.hpfHz + sampleRate / (2 * Math.PI));
    this.port.onmessage = (event) => {
      if (event.data.type === "setHpfHz") {
        this.hpfHz = event.data.value;
        this.alpha = this.calculateAlpha(this.hpfHz);
      }
    };
    this.port.postMessage({ type: "initialized" });
  }
  calculateAlpha(frequency) {
    return frequency / (frequency + sampleRate / (2 * Math.PI));
  }
  process(inputs, outputs, parameters) {
    const output = outputs[0];
    output.forEach((channel) => {
      for (let i = 0; i < channel.length; i++) {
        const noise = Math.random() * 2 - 1;
        const filtered = this.alpha * (noise - this.previousNoise) + this.previousFiltered;
        this.previousNoise = noise;
        this.previousFiltered = filtered;
        channel[i] = filtered;
      }
    });
    return true;
  }
}
registerProcessor("random-noise-processor", RandomNoiseProcessor);
const cheapSoftClipSingleSample = (sample, max = 0.9) => {
  const a = Math.abs(sample);
  if (a <= max) return sample;
  const x = a / max;
  const compressed = x / (1 + x);
  return Math.sign(sample) * max * compressed;
};
const compressSingleSample = (input, threshold = 0.75, ratio = 4, limiter = { enabled: true, type: "soft", outputRange: { min: -1, max: 1 } }) => {
  const { min, max } = limiter.outputRange;
  let x = input;
  if (Math.abs(x) > threshold) {
    x = Math.sign(x) * (threshold + (Math.abs(x) - threshold) / ratio);
  }
  if (limiter.enabled) {
    if (limiter.type === "soft") {
      x = cheapSoftClipSingleSample(x, Math.abs(max));
    } else if (limiter.type === "hard") {
      x = Math.max(min, Math.min(max, x));
    }
  }
  return x;
};
class DelayBuffer {
  constructor(maxDelaySamples) {
    this.buffer = new Float32Array(maxDelaySamples);
    this.writePtr = 0;
    this.readPtr = 0;
  }
  write(sample) {
    this.buffer[this.writePtr] = sample;
  }
  read() {
    return this.buffer[this.readPtr];
  }
  updatePointers(delaySamples) {
    this.writePtr = (this.writePtr + 1) % this.buffer.length;
    this.readPtr = (this.writePtr - delaySamples + this.buffer.length) % this.buffer.length;
  }
}
const AUTO_GAIN_THRESHOLD = 0.8;
const SAFETY_GAIN_COMPENSATION = 0.2;
class FeedbackDelay {
  constructor(sampleRate2) {
    this.sampleRate = sampleRate2;
    this.buffers = [];
    this.initialized = false;
    this.autoGainEnabled = false;
    this.gainCompensation = SAFETY_GAIN_COMPENSATION;
    this.lowpassStates = [];
    this.highpassStates = [];
    this.highpassInputStates = [];
  }
  initializeBuffers(channelCount) {
    this.buffers = [];
    this.lowpassStates = [];
    this.highpassStates = [];
    this.highpassInputStates = [];
    const maxSamples = Math.floor(this.sampleRate * 2);
    for (let c = 0; c < channelCount; c++) {
      this.buffers[c] = new DelayBuffer(maxSamples);
      this.lowpassStates[c] = 0;
      this.highpassStates[c] = 0;
      this.highpassInputStates[c] = 0;
    }
    this.initialized = true;
  }
  /** Simple one-pole lowpass filter */
  lowpass(input, cutoffFreq, channelIndex) {
    if (cutoffFreq >= this.sampleRate * 0.4) {
      return input;
    }
    const omega = 2 * Math.PI * cutoffFreq / this.sampleRate;
    const alpha = Math.max(
      0,
      Math.min(0.99, Math.sin(omega) / (Math.sin(omega) + Math.cos(omega)))
    );
    this.lowpassStates[channelIndex] = alpha * input + (1 - alpha) * this.lowpassStates[channelIndex];
    return this.lowpassStates[channelIndex];
  }
  /** Simple one-pole highpass filter */
  highpass(input, cutoffFreq, channelIndex) {
    if (cutoffFreq < 5) return input;
    const omega = 2 * Math.PI * cutoffFreq / this.sampleRate;
    const alpha = Math.max(
      0,
      Math.min(0.99, Math.sin(omega) / (Math.sin(omega) + Math.cos(omega)))
    );
    const lowpassOutput = alpha * input + (1 - alpha) * this.highpassStates[channelIndex];
    const highpassOutput = input - lowpassOutput;
    this.highpassStates[channelIndex] = lowpassOutput;
    return highpassOutput;
  }
  process(inputSample, channelIndex, feedbackAmount, delayTime, lowpassFreq = 1e4, highpassFreq = 100) {
    if (!this.initialized) return inputSample;
    const buffer = this.buffers[channelIndex] || this.buffers[0];
    const delaySamples = Math.floor(this.sampleRate * delayTime);
    const delayedSample = buffer.read();
    let filteredDelay = this.highpass(
      delayedSample,
      highpassFreq,
      channelIndex
    );
    filteredDelay = this.lowpass(filteredDelay, lowpassFreq, channelIndex);
    const feedbackSample = feedbackAmount * filteredDelay + inputSample;
    let outputSample = feedbackSample;
    const compressedFeedback = compressSingleSample(feedbackSample, 0.5, 4, {
      enabled: true,
      // limiter enabled
      outputRange: { min: -0.99, max: 0.99 },
      type: "soft"
      // soft clip
    });
    if (this.autoGainEnabled && feedbackAmount > AUTO_GAIN_THRESHOLD) {
      const safetyReduction = 1 - (feedbackAmount - AUTO_GAIN_THRESHOLD) * this.gainCompensation;
      outputSample = compressedFeedback * safetyReduction;
    }
    return { outputSample, feedbackSample: compressedFeedback, delaySamples };
  }
  updateBuffer(channelIndex, sample, delaySamples) {
    const buffer = this.buffers[channelIndex] || this.buffers[0];
    buffer.write(sample);
    buffer.updatePointers(delaySamples);
  }
  setAutoGain(enabled, compensation = SAFETY_GAIN_COMPENSATION) {
    this.autoGainEnabled = enabled;
    this.gainCompensation = compensation;
  }
}
registerProcessor(
  "feedback-delay-processor",
  class extends AudioWorkletProcessor {
    static get parameterDescriptors() {
      return [
        {
          name: "feedbackAmount",
          defaultValue: 0.5,
          minValue: 0,
          maxValue: 1,
          automationRate: "k-rate"
        },
        {
          name: "delayTime",
          defaultValue: 0.5,
          minValue: 12656238799684143e-20,
          // <- B8 natural in seconds (highest note period that works)
          maxValue: 2,
          automationRate: "k-rate"
        },
        {
          name: "decay",
          // feedback decay time factor
          defaultValue: 1,
          minValue: 0,
          maxValue: 1,
          automationRate: "k-rate"
        },
        {
          name: "lowpass",
          defaultValue: 1e4,
          minValue: 100,
          maxValue: 16e3,
          automationRate: "k-rate"
        }
      ];
    }
    constructor() {
      super();
      this.feedbackDelay = new FeedbackDelay(sampleRate);
      this.decayStartTime = null;
      this.decayActive = false;
      this.baseFeedbackAmount = 0.5;
      this.setupMessageHandling();
      this.port.postMessage({ type: "initialized" });
    }
    setupMessageHandling() {
      this.port.onmessage = (event) => {
        switch (event.data.type) {
          case "setAutoGain":
            this.feedbackDelay.setAutoGain(
              event.data.enabled,
              event.data.amount
            );
            break;
          case "triggerDecay":
            this.decayStartTime = currentTime;
            this.decayActive = true;
            this.baseFeedbackAmount = event.data.baseFeedbackAmount || 0.5;
            break;
          case "stopDecay":
            this.decayActive = false;
            this.decayStartTime = null;
            break;
        }
      };
    }
    process(inputs, outputs, parameters) {
      const input = inputs[0];
      const output = outputs[0];
      if (!input || !output) return true;
      if (!this.feedbackDelay.initialized || this.feedbackDelay.buffers.length !== input.length) {
        this.feedbackDelay.initializeBuffers(input.length);
      }
      const baseFeedbackAmount = parameters.feedbackAmount[0];
      const delayTime = parameters.delayTime[0];
      const decay = parameters.decay[0];
      const lowpassFreq = parameters.lowpass[0];
      const channelCount = Math.min(input.length, output.length);
      const frameCount = output[0].length;
      for (let i = 0; i < frameCount; ++i) {
        let effectiveFeedbackAmount = baseFeedbackAmount;
        if (this.decayActive && this.decayStartTime !== null) {
          const elapsedTime = currentTime - this.decayStartTime + i / sampleRate;
          const delayCompensation = Math.min(100, 0.5 / delayTime);
          const timeConstant = Math.pow(decay, 5) * 1e3 * delayCompensation + 0.5;
          const decayFactor = Math.exp(-elapsedTime / timeConstant);
          effectiveFeedbackAmount = baseFeedbackAmount * decayFactor;
          if (effectiveFeedbackAmount < 0.01) {
            this.decayActive = false;
            effectiveFeedbackAmount = 0;
          }
        }
        for (let c = 0; c < channelCount; c++) {
          const processed = this.feedbackDelay.process(
            input[c][i],
            c,
            effectiveFeedbackAmount,
            delayTime,
            lowpassFreq
          );
          output[c][i] = processed.outputSample;
          this.feedbackDelay.updateBuffer(
            c,
            processed.feedbackSample,
            processed.delaySamples
          );
        }
      }
      return true;
    }
  }
);
const DEFAULT_DELAY_CONFIG = {
  CHARACTER: ["filtered"],
  // 'clean' | 'bitCrushed' | 'filtered' or combo
  // Smoothing factor for delay time interpolation
  SMOOTHING_FACTOR: {
    slowest: 1e-4
  }
};
const DEFAULT_CHARACTER_CONFIG = {
  bitCrushed: {
    bits: 11,
    // bits for bit reduction (e.g. 4 = 16 levels)
    downsample: 3
    // downsample factor (1 = no downsampling, 4 = 1/4 samplerate)
  },
  filtered: {
    freq: 900,
    // Hz
    Q: 0.15
    // very subtle / broad
  }
};
registerProcessor(
  "delay-processor",
  class extends AudioWorkletProcessor {
    static get parameterDescriptors() {
      return [
        {
          name: "delayTime",
          defaultValue: 0.5,
          minValue: 1e-3,
          maxValue: 2,
          automationRate: "k-rate"
        },
        {
          name: "feedbackAmount",
          defaultValue: 0,
          minValue: 0,
          maxValue: 0.99,
          automationRate: "k-rate"
        }
      ];
    }
    constructor() {
      super();
      this.buffers = [];
      this.smoothedDelaySamples = [];
      this.smoothingFactor = DEFAULT_DELAY_CONFIG.SMOOTHING_FACTOR.slowest;
      this.characterModes = [...DEFAULT_DELAY_CONFIG.CHARACTER];
      this._bpState = [];
      this._bpFreq = DEFAULT_CHARACTER_CONFIG.filtered.freq;
      this._bpQ = DEFAULT_CHARACTER_CONFIG.filtered.Q;
      this._bpCoeffs = null;
      this._lastBpFreq = -1;
      this._lastBpQ = -1;
      this.lofiBits = DEFAULT_CHARACTER_CONFIG["bitCrushed"].bits;
      this.lofiDownsample = DEFAULT_CHARACTER_CONFIG["bitCrushed"].downsample;
      this._lofiSampleHold = [];
      this._lofiSampleCount = [];
      this.initialized = false;
      this.port.onmessage = (event) => {
        if (event.data && event.data.type === "setCharacter" && Array.isArray(event.data.modes)) {
          this.characterModes = [...event.data.modes];
        }
        if (event.data && event.data.type === "setBandpassFreq" && typeof event.data.hz === "number") {
          this.setBandpassFreq(event.data.hz);
        }
        if (event.data && event.data.type === "trigger") ;
      };
      this.port.postMessage({ type: "initialized" });
    }
    setBandpassFreq(hz) {
      this._bpFreq = hz;
      this._lastBpFreq = -1;
    }
    _updateBandpassCoeffs() {
      if (this._lastBpFreq === this._bpFreq && this._lastBpQ === this._bpQ) {
        return;
      }
      const bpFreq = this._bpFreq;
      const bpQ = this._bpQ;
      const omega = 2 * Math.PI * bpFreq / sampleRate;
      const alpha = Math.sin(omega) / (2 * bpQ);
      const cosw = Math.cos(omega);
      const b0 = alpha;
      const b1 = 0;
      const b2 = -alpha;
      const a0 = 1 + alpha;
      const a1 = -2 * cosw;
      const a2 = 1 - alpha;
      this._bpCoeffs = {
        b0: b0 / a0,
        b1: b1 / a0,
        b2: b2 / a0,
        a1: a1 / a0,
        a2: a2 / a0
      };
      this._lastBpFreq = bpFreq;
      this._lastBpQ = bpQ;
    }
    initializeBuffers(channelCount) {
      const maxSamples = Math.floor(sampleRate * 2);
      this.buffers = [];
      this.smoothedDelaySamples = [];
      this._lofiSampleHold = [];
      this._lofiSampleCount = [];
      for (let c = 0; c < channelCount; c++) {
        this.buffers[c] = new DelayBuffer(maxSamples);
        this.smoothedDelaySamples[c] = Math.floor(sampleRate * 0.5);
        this._lofiSampleHold[c] = 0;
        this._lofiSampleCount[c] = 0;
      }
      this.initialized = true;
    }
    _processLoFi(delayed, c) {
      if (this._lofiSampleCount[c] % this.lofiDownsample === 0) {
        const levels = Math.pow(2, this.lofiBits);
        delayed = Math.round(delayed * levels) / levels;
        this._lofiSampleHold[c] = delayed;
      } else {
        delayed = this._lofiSampleHold[c];
      }
      this._lofiSampleCount[c]++;
      return delayed;
    }
    _processBandpass(delayed, c) {
      if (!this._bpState) this._bpState = [];
      if (!this._bpState[c]) {
        this._bpState[c] = { x1: 0, x2: 0, y1: 0, y2: 0 };
      }
      this._updateBandpassCoeffs();
      if (!this._bpCoeffs) {
        return delayed;
      }
      const { b0, b1, b2, a1, a2 } = this._bpCoeffs;
      const s = this._bpState[c];
      const y = b0 * delayed + b1 * s.x1 + b2 * s.x2 - a1 * s.y1 - a2 * s.y2;
      s.x2 = s.x1;
      s.x1 = delayed;
      s.y2 = s.y1;
      s.y1 = y;
      return y;
    }
    process(inputs, outputs, parameters) {
      const input = inputs[0];
      const output = outputs[0];
      if (!input || !output || input.length === 0 || output.length === 0) {
        return true;
      }
      if (!input[0] || !output[0] || input[0].length === 0 || output[0].length === 0) {
        return true;
      }
      if (!this.initialized || this.buffers.length !== input.length) {
        this.initializeBuffers(input.length);
      }
      const delayTime = parameters.delayTime[0];
      const feedbackAmount = parameters.feedbackAmount[0];
      const targetDelaySamples = sampleRate * delayTime;
      const channelCount = Math.min(input.length, output.length);
      const frameCount = output[0].length;
      const smoothing = this.smoothingFactor;
      for (let i = 0; i < frameCount; ++i) {
        for (let c = 0; c < channelCount; c++) {
          const buf = this.buffers[c];
          if (!buf) {
            continue;
          }
          this.smoothedDelaySamples[c] += (targetDelaySamples - this.smoothedDelaySamples[c]) * smoothing;
          const smoothedDelay = this.smoothedDelaySamples[c];
          const intDelay = Math.floor(smoothedDelay);
          const frac = smoothedDelay - intDelay;
          const readPtrA = (buf.writePtr - intDelay + buf.buffer.length) % buf.buffer.length;
          const readPtrB = (readPtrA - 1 + buf.buffer.length) % buf.buffer.length;
          const sampleA = buf.buffer[readPtrA];
          const sampleB = buf.buffer[readPtrB];
          let delayed = sampleA * (1 - frac) + sampleB * frac;
          for (const mode of this.characterModes) {
            if (mode === "bitCrushed") {
              delayed = this._processLoFi(delayed, c);
            } else if (mode === "filtered") {
              delayed = this._processBandpass(delayed, c);
            }
          }
          output[c][i] = compressSingleSample(delayed, 0.75, 4, {
            enabled: true,
            type: "soft",
            outputRange: { min: -0.9, max: 0.9 }
          });
          const inputSample = input[c] && input[c][i] !== void 0 ? input[c][i] : 0;
          buf.write(inputSample + delayed * feedbackAmount);
          buf.updatePointers(intDelay);
        }
      }
      return true;
    }
  }
);
class DattorroReverb extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      ["preDelay", 0, 0, sampleRate - 1, "k-rate"],
      ["bandwidth", 0.9999, 0, 1, "k-rate"],
      ["inputDiffusion1", 0.75, 0, 1, "k-rate"],
      ["inputDiffusion2", 0.625, 0, 1, "k-rate"],
      ["decay", 0.5, 0, 1, "k-rate"],
      ["decayDiffusion1", 0.7, 0, 0.999999, "k-rate"],
      ["decayDiffusion2", 0.5, 0, 0.999999, "k-rate"],
      ["damping", 5e-3, 0, 1, "k-rate"],
      ["excursionRate", 0.5, 0, 2, "k-rate"],
      ["excursionDepth", 0.7, 0, 2, "k-rate"],
      ["wet", 0.3, 0, 1, "k-rate"],
      ["dry", 0.6, 0, 1, "k-rate"]
    ].map(
      (x) => new Object({
        name: x[0],
        defaultValue: x[1],
        minValue: x[2],
        maxValue: x[3],
        automationRate: x[4]
      })
    );
  }
  constructor(options) {
    super(options);
    this._Delays = [];
    this._pDLength = sampleRate + (128 - sampleRate % 128);
    this._preDelay = new Float32Array(this._pDLength);
    this._pDWrite = 0;
    this._lp1 = 0;
    this._lp2 = 0;
    this._lp3 = 0;
    this._excPhase = 0;
    const SHORT_DELAY_SCALE = 0.5;
    [
      4771345e-9,
      3595309e-9,
      0.012734787,
      9307483e-9,
      0.022579886,
      0.149625349,
      0.060481839,
      0.1249958,
      0.030509727,
      0.141695508,
      0.089244313,
      0.106280031
    ].map((x) => x * SHORT_DELAY_SCALE).forEach((x) => this.makeDelay(x));
    this._taps = Int16Array.from(
      [
        8937872e-9,
        0.099929438,
        0.064278754,
        0.067067639,
        0.066866033,
        6283391e-9,
        0.035818689,
        0.011861161,
        0.121870905,
        0.041262054,
        0.08981553,
        0.070931756,
        0.011256342,
        4065724e-9
      ],
      (x) => Math.round(x * sampleRate)
    );
    this.port.postMessage({ type: "initialized" });
  }
  makeDelay(length) {
    let len = Math.round(length * sampleRate);
    let nextPow2 = 2 ** Math.ceil(Math.log2(len));
    this._Delays.push([
      new Float32Array(nextPow2),
      len - 1,
      // ? or should be 0 ?
      0 | 0,
      // ? or should be len - 1 ?
      nextPow2 - 1
    ]);
  }
  writeDelay(index, data) {
    return this._Delays[index][0][this._Delays[index][1]] = data;
  }
  readDelay(index) {
    return this._Delays[index][0][this._Delays[index][2]];
  }
  readDelayAt(index, i) {
    let d = this._Delays[index];
    return d[0][d[2] + i & d[3]];
  }
  // cubic interpolation
  // O. Niemitalo: https://www.musicdsp.org/en/latest/Other/49-cubic-interpollation.html
  readDelayCAt(index, i) {
    let d = this._Delays[index], frac = i - ~~i, int = ~~i + d[2] - 1, mask = d[3];
    let x0 = d[0][int++ & mask], x1 = d[0][int++ & mask], x2 = d[0][int++ & mask], x3 = d[0][int & mask];
    let a = (3 * (x1 - x2) - x0 + x3) / 2, b = 2 * x2 + x0 - (5 * x1 + x3) / 2, c = (x2 - x0) / 2;
    return ((a * frac + b) * frac + c) * frac + x1;
  }
  // First input will be downmixed to mono if number of channels is not 2
  // Outputs Stereo.
  process(inputs, outputs, parameters) {
    const TWO_PI = 6.283185307179586;
    const TWO_PI_DETUNE = 6.284702653297906;
    const pd = ~~parameters.preDelay[0], bw = parameters.bandwidth[0], fi = parameters.inputDiffusion1[0], si = parameters.inputDiffusion2[0], dc = parameters.decay[0], ft = parameters.decayDiffusion1[0], st = parameters.decayDiffusion2[0], dp = 1 - parameters.damping[0], ex = parameters.excursionRate[0] / sampleRate, ed = parameters.excursionDepth[0] * sampleRate / 1e3, we = parameters.wet[0] * 0.6, dr = parameters.dry[0];
    if (inputs[0].length == 2) {
      for (let i2 = 127; i2 >= 0; i2--) {
        this._preDelay[this._pDWrite + i2] = (inputs[0][0][i2] + inputs[0][1][i2]) * 0.5;
        outputs[0][0][i2] = inputs[0][0][i2] * dr;
        outputs[0][1][i2] = inputs[0][1][i2] * dr;
      }
    } else if (inputs[0].length > 0) {
      this._preDelay.set(inputs[0][0], this._pDWrite);
      for (let i2 = 127; i2 >= 0; i2--)
        outputs[0][0][i2] = outputs[0][1][i2] = inputs[0][0][i2] * dr;
    } else {
      this._preDelay.set(new Float32Array(128), this._pDWrite);
    }
    let i = 0 | 0;
    while (i < 128) {
      let lo = 0, ro = 0;
      this._lp1 += bw * (this._preDelay[(this._pDLength + this._pDWrite - pd + i) % this._pDLength] - this._lp1);
      let pre = this.writeDelay(0, this._lp1 - fi * this.readDelay(0));
      pre = this.writeDelay(
        1,
        fi * (pre - this.readDelay(1)) + this.readDelay(0)
      );
      pre = this.writeDelay(
        2,
        fi * pre + this.readDelay(1) - si * this.readDelay(2)
      );
      pre = this.writeDelay(
        3,
        si * (pre - this.readDelay(3)) + this.readDelay(2)
      );
      let split = si * pre + this.readDelay(3);
      let exc = ed * (1 + Math.cos(this._excPhase * TWO_PI));
      let exc2 = ed * (1 + Math.sin(this._excPhase * TWO_PI_DETUNE));
      let temp = this.writeDelay(
        4,
        split + dc * this.readDelay(11) + ft * this.readDelayCAt(4, exc)
      );
      this.writeDelay(5, this.readDelayCAt(4, exc) - ft * temp);
      this._lp2 += dp * (this.readDelay(5) - this._lp2);
      temp = this.writeDelay(6, dc * this._lp2 - st * this.readDelay(6));
      this.writeDelay(7, this.readDelay(6) + st * temp);
      temp = this.writeDelay(
        8,
        split + dc * this.readDelay(7) + ft * this.readDelayCAt(8, exc2)
      );
      this.writeDelay(9, this.readDelayCAt(8, exc2) - ft * temp);
      this._lp3 += dp * (this.readDelay(9) - this._lp3);
      temp = this.writeDelay(10, dc * this._lp3 - st * this.readDelay(10));
      this.writeDelay(11, this.readDelay(10) + st * temp);
      lo = this.readDelayAt(9, this._taps[0]) + this.readDelayAt(9, this._taps[1]) - this.readDelayAt(10, this._taps[2]) + this.readDelayAt(11, this._taps[3]) - this.readDelayAt(5, this._taps[4]) - this.readDelayAt(6, this._taps[5]) - this.readDelayAt(7, this._taps[6]);
      ro = this.readDelayAt(5, this._taps[7]) + this.readDelayAt(5, this._taps[8]) - this.readDelayAt(6, this._taps[9]) + this.readDelayAt(7, this._taps[10]) - this.readDelayAt(9, this._taps[11]) - this.readDelayAt(10, this._taps[12]) - this.readDelayAt(11, this._taps[13]);
      outputs[0][0][i] += lo * we;
      outputs[0][1][i] += ro * we;
      this._excPhase += ex;
      if (this._excPhase >= 1) this._excPhase -= 1;
      i++;
      const delays = this._Delays;
      for (let j = 0; j < delays.length; j++) {
        const d = delays[j];
        d[1] = d[1] + 1 & d[3];
        d[2] = d[2] + 1 & d[3];
      }
    }
    this._pDWrite = (this._pDWrite + 128) % this._pDLength;
    return true;
  }
}
registerProcessor("dattorro-reverb-processor", DattorroReverb);
class Distortion {
  constructor() {
    this.limitingMode = "hard-clipping";
  }
  applyDrive(sample, driveAmount) {
    if (driveAmount <= 0) return sample;
    const driveMultiplier = 1 + driveAmount * 3;
    const drivenSample = sample * driveMultiplier;
    return drivenSample;
  }
  applyClipping(sample, clippingAmount, clipThreshold) {
    if (clippingAmount <= 0) return sample;
    let clippedSample;
    switch (this.limitingMode) {
      case "soft-clipping":
        clippedSample = clipThreshold * Math.tanh(sample / clipThreshold);
        break;
      case "hard-clipping":
        clippedSample = Math.max(
          -clipThreshold,
          Math.min(clipThreshold, sample)
        );
        break;
      case "bypass":
      default:
        clippedSample = sample;
        break;
    }
    if (clipThreshold < 0.08) {
      const makeupGain = Math.min(2, Math.pow(0.1 / clipThreshold, 0.5));
      clippedSample *= makeupGain;
    }
    const blended = sample * (1 - clippingAmount) + clippedSample * clippingAmount;
    return blended;
  }
  setLimitingMode(mode) {
    this.limitingMode = mode;
  }
}
registerProcessor(
  "distortion-processor",
  class extends AudioWorkletProcessor {
    static get parameterDescriptors() {
      return [
        {
          name: "distortionDrive",
          defaultValue: 0,
          minValue: 0,
          maxValue: 1,
          automationRate: "a-rate"
        },
        {
          name: "clippingAmount",
          defaultValue: 0,
          minValue: 0,
          maxValue: 1,
          automationRate: "a-rate"
        },
        {
          name: "clippingThreshold",
          defaultValue: 0.5,
          minValue: 0,
          maxValue: 1,
          automationRate: "k-rate"
        }
      ];
    }
    constructor() {
      super();
      this.distortion = new Distortion();
      this.setupMessageHandling();
      this.port.postMessage({ type: "initialized" });
    }
    setupMessageHandling() {
      this.port.onmessage = (event) => {
        switch (event.data.type) {
          case "setLimitingMode":
            this.distortion.setLimitingMode(event.data.mode);
            break;
          default:
            console.warn("distortion-processor: Unsupported message");
            break;
        }
      };
    }
    process(inputs, outputs, parameters) {
      const input = inputs[0];
      const output = outputs[0];
      if (!input || !output) return true;
      const clipThreshold = parameters.clippingThreshold[0];
      for (let i = 0; i < output[0].length; ++i) {
        const distortionDrive = parameters.distortionDrive[Math.min(i, parameters.distortionDrive.length - 1)];
        const clippingAmount = parameters.clippingAmount[Math.min(i, parameters.clippingAmount.length - 1)];
        for (let c = 0; c < Math.min(input.length, output.length); c++) {
          let sample = input[c][i];
          sample = this.distortion.applyDrive(sample, distortionDrive);
          sample = this.distortion.applyClipping(
            sample,
            clippingAmount,
            clipThreshold
          );
          output[c][i] = Math.max(-0.999, Math.min(0.999, sample));
        }
      }
      return true;
    }
  }
);
registerProcessor(
  "envelope-follower-processor",
  class extends AudioWorkletProcessor {
    static get parameterDescriptors() {
      return [
        {
          name: "inputGain",
          // linear gain (1.0 = unity)
          defaultValue: 1,
          minValue: 0,
          maxValue: 10,
          automationRate: "k-rate"
        },
        {
          name: "outputGain",
          // linear gain (1.0 = unity)
          defaultValue: 1,
          minValue: 0,
          maxValue: 10,
          automationRate: "k-rate"
        },
        {
          name: "attack",
          // seconds
          defaultValue: 3e-3,
          minValue: 1e-3,
          maxValue: 1,
          automationRate: "k-rate"
        },
        {
          name: "release",
          // seconds
          defaultValue: 0.05,
          minValue: 1e-3,
          maxValue: 5,
          automationRate: "k-rate"
        }
      ];
    }
    constructor() {
      super();
      this.envelope = 0;
      this.gateThreshold = 5e-3;
      this.debugCounter = 0;
      this.port.postMessage({ type: "initialized" });
    }
    process(inputs, outputs, parameters) {
      const input = inputs[0];
      const output = outputs[0];
      const channel = inputs[0][0];
      if (!input || !output || !channel || input.length === 0 || output.length === 0 || channel.length === 0) {
        return true;
      }
      const inChannel = input[0];
      if (!inChannel || inChannel.length === 0) return true;
      const attack = parameters.attack[0];
      const release = parameters.release[0];
      const inputGain = parameters.inputGain[0];
      const outputGain = parameters.outputGain[0];
      const attackCoeff = Math.exp(-1 / (attack * sampleRate));
      const releaseCoeff = Math.exp(-1 / (release * sampleRate));
      for (let sample = 0; sample < output[0].length; sample++) {
        const inputLevel = Math.abs((input[0][sample] || 0) * inputGain);
        if (inputLevel > 1e-6) {
          if (inputLevel > this.envelope) {
            this.envelope = inputLevel + (this.envelope - inputLevel) * attackCoeff;
          } else {
            this.envelope = inputLevel + (this.envelope - inputLevel) * releaseCoeff;
          }
        } else {
          this.envelope *= releaseCoeff;
        }
        if (this.envelope < this.gateThreshold) this.envelope = 0;
        const finalOutput = this.envelope * outputGain;
        for (let channel2 = 0; channel2 < output.length; channel2++) {
          output[channel2][sample] = finalOutput;
        }
      }
      return true;
    }
  }
);
`;let hr=!1;async function Lh(i){if(hr)return console.info("AudioWorklet processors already initialized, skipping"),{success:!0,loadedPath:"already-initialized",timestamp:new Date().toISOString()};if(!i.audioWorklet)return console.warn("AudioWorklet API is not fully supported on this browser."),console.warn("The audio sampler requires AudioWorklet support. Please try:"),console.warn("1. Using Chrome, Firefox, or Edge on desktop"),console.warn("2. Updating your mobile browser to the latest version"),console.warn("3. Using a different browser on mobile (Chrome or Firefox)"),{success:!1,loadedPath:"none-worklet-not-supported",timestamp:new Date().toISOString(),error:"AudioWorklet not supported on this browser"};const e=URL.createObjectURL(new Blob([Vh],{type:"application/javascript"}));try{await i.audioWorklet.addModule(e)}finally{URL.revokeObjectURL(e)}return hr=!0,console.info("Audiolib: AudioWorklet module loaded."),{success:!0,loadedPath:"blob-url",timestamp:new Date().toISOString()}}async function Tc(i,e=16,t=Ut()){if(await La(),Se(t,"Audio context is not available"),!(await Lh(t)).success)throw new Error("AudioWorklet is required but not supported on this browser. Please use a modern desktop browser (Chrome, Firefox, Edge) or update your mobile browser.");let n;if(i instanceof AudioBuffer)n=i;else if(i instanceof ArrayBuffer)try{n=await t.decodeAudioData(i)}catch(r){throw console.error("Failed to decode sample audiodata when creating SamplePlayer:",r),r}else throw new Error("createSamplePlayer requires an AudioBuffer or ArrayBuffer. No default sample is bundled.");const s=new Oh(t,e,n);return await s.init(),s}async function Fh(){const i=await navigator.mediaDevices.getDisplayMedia({audio:!0,video:!0}),e=new MediaStream(i.getAudioTracks());return i.getVideoTracks().forEach(t=>t.stop()),e}const Q={IDLE:"IDLE",ARMED:"ARMED",RECORDING:"RECORDING",STOPPED:"STOPPED"},po={mimeType:"audio/webm"},Bh={mediaRecorderOptions:po,useThreshold:!0,startThreshold:-30,autoStop:!1,stopThreshold:-40,silenceTimeoutMs:1e3,preprocess:!1,preprocessOptions:{}};var ie,me,ne,vn,Xe,I,It,Ae,xt,Ot,W,gt,wn,x,fo,mo,Ds,Ks,cr,ur,Ai,_a,go,bo,dr,Rs;class Wh{constructor(e){p(this,x),y(this,"nodeId"),y(this,"nodeType","recorder"),p(this,ie),p(this,me,null),p(this,ne,null),p(this,vn),p(this,Xe,null),p(this,I,Q.IDLE),p(this,It,null),p(this,Ae,null),p(this,xt,null),p(this,Ot,null),p(this,W,null),p(this,gt,null),p(this,wn,null),this.nodeId=Ge(this.nodeType,this),u(this,ie,e),u(this,vn,Et(this.nodeId))}async init(){return console.warn("Recorder: init() method is deprecated and will be removed in a future version."),this}async start(e={}){a(this,ie).state==="suspended"&&await a(this,ie).resume(),a(this,me)&&(a(this,me).getTracks().forEach(o=>o.stop()),u(this,me,null)),b(this,x,Rs).call(this);const{input:t={type:"microphone"},...n}=e,s={...Bh,...n};t.type==="display"&&e.startThreshold===void 0&&(s.startThreshold=-60),u(this,W,s);let r;if(t.type==="audio-node"?(r=await Wi(()=>b(this,x,fo).call(this,t.node)),Se(!r.error,`Failed to create audio-node stream: ${r.error}`,r)):t.type==="display"?(r=await Wi(async()=>(a(this,ie).state==="suspended"&&await a(this,ie).resume(),Fh())),Se(!r.error,`Failed to get browser audio: ${r.error}`,r)):(r=await Wi(()=>pl(void 0,t.deviceId)),Se(!r.error,`Failed to get audio input: ${r.error}`,r)),u(this,me,r.data),u(this,ne,new MediaRecorder(a(this,me),a(this,W)?a(this,W).mediaRecorderOptions:po)),!a(this,ne))throw new Error("Recorder not initialized");if(a(this,I)===Q.RECORDING)return this;try{return!a(this,W)||!a(this,W).useThreshold?b(this,x,Ds).call(this):b(this,x,mo).call(this),this}catch(o){throw console.error("Error starting recording:",o),o}}forceStart(){return a(this,I)!==Q.ARMED||!this.initialized?(console.warn("Recorder must be initialized and armed before calling forceStart. Current state:",a(this,I)),!1):a(this,W)?(a(this,W).autoStop=!1,b(this,x,Ds).call(this),!0):(console.error("Recorder config is null, cannot force start"),!1)}cancel(){return a(this,I)!==Q.ARMED&&a(this,I)!==Q.RECORDING?!1:(b(this,x,Ai).call(this),a(this,ne)&&a(this,ne).state!=="inactive"&&a(this,ne).stop(),u(this,I,Q.STOPPED),console.info(`Recorder state: ${a(this,I)} (cancelled)`),this.sendMessage("record:cancelled",{}),b(this,x,_a).call(this),!0)}async stop(){var e;if(!a(this,ne))throw new Error("Recorder not initialized");if(a(this,I)===Q.ARMED)throw this.cancel(),new Error("Recording was armed but never triggered");if(a(this,I)!==Q.RECORDING)throw new Error("Not recording");b(this,x,Ai).call(this);const t=await b(this,x,go).call(this);let n=await b(this,x,bo).call(this,t),s;return(e=a(this,W))!=null&&e.preprocess&&(s=await Br(a(this,ie),n,a(this,W).preprocessOptions),n=s.audiobuffer),a(this,Xe)&&await a(this,Xe).loadSample(n),u(this,I,Q.STOPPED),console.info(`Recorder state: ${a(this,I)}`),this.sendMessage("record:stop",{duration:n.duration}),b(this,x,_a).call(this),n}onMessage(e,t){return a(this,vn).onMessage(e,t)}sendMessage(e,t){a(this,vn).sendMessage(e,t),e.startsWith("record:")&&a(this,vn).sendMessage("state-change",{state:a(this,I),event:e,...t})}connect(e){return u(this,Xe,e),this}disconnect(){u(this,Xe,null)}dispose(){var e;b(this,x,Ai).call(this),b(this,x,Rs).call(this),(e=a(this,me))==null||e.getTracks().forEach(t=>t.stop()),u(this,me,null),u(this,ne,null),u(this,I,Q.IDLE),u(this,W,null),Ue(this.nodeId)}get isArmed(){return a(this,I)===Q.ARMED}get isRecording(){return a(this,I)===Q.RECORDING}get state(){return a(this,I)}get initialized(){return a(this,ne)!==null&&a(this,me)!==null}get now(){return a(this,ie).currentTime}get destination(){return a(this,Xe)}}ie=new WeakMap,me=new WeakMap,ne=new WeakMap,vn=new WeakMap,Xe=new WeakMap,I=new WeakMap,It=new WeakMap,Ae=new WeakMap,xt=new WeakMap,Ot=new WeakMap,W=new WeakMap,gt=new WeakMap,wn=new WeakMap,x=new WeakSet,fo=async function(i){return u(this,gt,a(this,ie).createMediaStreamDestination()),u(this,wn,i),i.connect(a(this,gt)),a(this,gt).stream},mo=function(){if(!b(this,x,dr).call(this,a(this,W).startThreshold)){console.warn(`Threshold ${a(this,W).startThreshold}dB out of range (-60 to 0)`);return}u(this,I,Q.ARMED),console.info("Recorder state: ARMED"),this.sendMessage("record:armed",{threshold:a(this,W).startThreshold,destination:a(this,Xe)}),b(this,x,Ks).call(this)},Ds=function(){var i;a(this,ne).start(),u(this,I,Q.RECORDING),console.info(`Recorder state: ${a(this,I)}`),this.sendMessage("record:start",{destination:a(this,Xe)}),(i=a(this,W))!=null&&i.autoStop&&b(this,x,Ks).call(this)},Ks=async function(){u(this,It,a(this,ie).createMediaStreamSource(a(this,me))),u(this,Ae,a(this,ie).createAnalyser()),a(this,Ae).fftSize=1024,a(this,It).connect(a(this,Ae));const i=new Float32Array(a(this,Ae).fftSize);a(this,ie).state==="suspended"&&await a(this,ie).resume();const e=async()=>{if(!a(this,Ae))return;a(this,Ae).getFloatTimeDomainData(i);const t=Math.max(...i.map(Math.abs)),n=t>1e-7?20*Math.log10(t):-100;if(a(this,I)===Q.ARMED)b(this,x,cr).call(this,n);else if(a(this,I)===Q.RECORDING)b(this,x,ur).call(this,n);else{b(this,x,Ai).call(this);return}u(this,xt,requestAnimationFrame(e))};u(this,xt,requestAnimationFrame(e))},cr=function(i){i>=a(this,W).startThreshold&&b(this,x,Ds).call(this)},ur=function(i){if(!a(this,W).autoStop)return;const e=performance.now();i<a(this,W).stopThreshold?a(this,Ot)===null?u(this,Ot,e):e-a(this,Ot)>=a(this,W).silenceTimeoutMs&&(this.sendMessage("record:stopping",{}),this.stop().catch(t=>console.error("Error auto-stopping:",t))):u(this,Ot,null)},Ai=function(){a(this,xt)!==null&&(cancelAnimationFrame(a(this,xt)),u(this,xt,null)),a(this,It)&&(a(this,It).disconnect(),u(this,It,null)),a(this,Ae)&&(a(this,Ae).disconnect(),u(this,Ae,null)),u(this,Ot,null)},_a=function(){var i;(i=a(this,me))==null||i.getTracks().forEach(e=>e.stop()),u(this,me,null),u(this,ne,null),b(this,x,Rs).call(this)},go=function(){return new Promise(i=>{var e,t,n;((e=a(this,ne))==null?void 0:e.state)!=="inactive"&&((t=a(this,ne))==null||t.addEventListener("dataavailable",s=>i(s.data),{once:!0}),(n=a(this,ne))==null||n.stop())})},bo=async function(i){const e=await i.arrayBuffer();return await a(this,ie).decodeAudioData(e)},dr=function(i){return i>-60&&i<0},Rs=function(){a(this,gt)&&a(this,wn)&&(a(this,wn).disconnect(a(this,gt)),u(this,gt,null),u(this,wn,null))};async function Nc(i){const e=i||Ut();return new Wh(e)}const kc={timestretch:{label:"Timestretch",defaultValue:!1,format:i=>i?"Warp":"RePitch",apply:(i,e)=>i.setTimestretchEnabled(e)},panDrift:{label:"Pan drift",defaultValue:!0,format:i=>i?"◐":"○",apply:(i,e)=>i.setPanDriftEnabled(e)},feedbackMode:{label:"Feedback mode",defaultValue:!0,format:i=>i?"Poly":"Mono",apply:(i,e)=>i.setFeedbackMode(e?"polyphonic":"monophonic")},gainLFOSync:{label:"Amp LFO sync",defaultValue:!1,format:i=>i?"Sync":"Free",apply:(i,e)=>i.syncLFOsToNoteFreq("gain-lfo",e)},pitchLFOSync:{label:"Pitch LFO sync",defaultValue:!1,format:i=>i?"Sync":"Free",apply:(i,e)=>i.syncLFOsToNoteFreq("pitch-lfo",e)}};var Gh=Object.defineProperty,Uh=(i,e,t)=>e in i?Gh(i,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[e]=t,Pe=(i,e,t)=>Uh(i,typeof e!="symbol"?e+"":e,t);const yo=class pe extends HTMLElement{constructor(){super(),Pe(this,"pathElement"),Pe(this,"config",{minValue:0,maxValue:100,defaultValue:0,minRotation:-170,maxRotation:170,snapIncrement:1,curve:1,disabled:!1,borderStyle:"currentState"}),Pe(this,"currentValue",0),Pe(this,"currentRotation",0),Pe(this,"rotationToValue"),Pe(this,"valueToRotation"),Pe(this,"applySnapping"),Pe(this,"dragHandlers"),Pe(this,"lastClickTime",0),Pe(this,"DOUBLE_CLICK_THRESHOLD",300)}static mapRange(e,t,n,s,r){return t===e?n:(r-e)*(s-n)/(t-e)+n}static clamp(e,t,n){return Math.min(Math.max(e,t),n)}static get observedAttributes(){return["min-value","max-value","default-value","min-rotation","max-rotation","snap-increment","allowed-values","value","disabled","width","height","border-style","curve","color"]}connectedCallback(){this.injectGlobalStyles(),this.createUtilityFunctions(),this.render(),this.updateColorFromAttribute(),this.setValue(this.config.defaultValue??this.config.minValue),this.createDraggable()}disconnectedCallback(){this.cleanup()}attributeChangedCallback(e,t,n){if(t!==n){if(e==="max-value"||e==="min-value"){const s=this.config.minValue,r=this.config.maxValue;this.updateConfigFromAttributes(),this.updateBorder();let o;e==="max-value"?o=pe.mapRange(s,parseFloat(t),this.config.minValue,this.config.maxValue,this.currentValue):o=pe.mapRange(parseFloat(t),r,this.config.minValue,this.config.maxValue,this.currentValue),this.createUtilityFunctions(),this.setValue(o);return}if(this.updateConfigFromAttributes(),this.updateBorder(),e==="width"||e==="height"||e==="border-style")return;if(e==="color"){this.updateColorFromAttribute();return}if(e==="curve"){this.createUtilityFunctions(),this.setValue(this.currentValue);return}}}injectGlobalStyles(){if(pe.stylesInjected)return;const e=document.createElement("style");e.id="knob-element-styles",e.textContent=`
      knob-element {
        display: block;
        box-sizing: border-box;
        --knob-size: 120px;
        --knob-stroke: rgb(234, 234, 234);

        width: var(--knob-size, 120px); 
        height: var(--knob-size, 120px);

        touch-action: none; /* Prevents browser touch gestures */
        user-select: none; /* Prevents text selection during drag */
        border-radius: 50%;
        cursor: grab;
      }
      
      knob-element[disabled] {
        opacity: 0.5;
        pointer-events: none; 
      }
    
      knob-element:active {
        cursor: grabbing;
      }
    `,document.head.appendChild(e),pe.stylesInjected=!0}updateConfigFromAttributes(){const e=(l,h)=>{const c=this.getAttribute(l);return c!==null?parseFloat(c):h},t=(l,h)=>this.getAttribute(l)||h,n=l=>{const h=this.getAttribute(l);if(h)try{return JSON.parse(h)}catch{console.warn(`KnobElement: Invalid ${l} JSON:`,h);return}},s=n("allowed-values");let r=e("min-value",0),o=e("max-value",100);if(s&&s.length>0){const l=[...s].sort((f,d)=>f-d),h=l[0],c=l[l.length-1];this.hasAttribute("min-value")&&r!==h&&console.debug(`KnobElement: min-value (${r}) doesn't match first allowedValue (${h}). Using ${h}.`),this.hasAttribute("max-value")&&o!==c&&console.debug(`KnobElement: max-value (${o}) doesn't match last allowedValue (${c}). Using ${c}.`),this.hasAttribute("snap-thresholds")&&console.debug("KnobElement: allowedValues overrides snap-increment and snap-thresholds."),r=h,o=c}this.config={minValue:r,maxValue:o,defaultValue:e("default-value",0),minRotation:e("min-rotation",-150),maxRotation:e("max-rotation",150),snapIncrement:e("snap-increment",1),curve:e("curve",1),borderStyle:t("border-style","currentState"),allowedValues:s?[...s].sort((l,h)=>l-h):void 0,snapThresholds:n("snap-thresholds"),disabled:this.hasAttribute("disabled")},this.updateDimensions()}updateDimensions(){const e=this.getAttribute("width"),t=this.getAttribute("height");if(e||t){const n=e||t||"120";this.style.setProperty("--knob-size",`${n}px`)}}updateColorFromAttribute(){const e=this.getAttribute("color");e&&this.style.setProperty("--knob-stroke",e)}render(){this.innerHTML=`
      <svg class="ac-knob" width="100%" height="100%" viewBox="0 0 100 100">
          <path class="knob-path" 
                fill="none" 
                stroke="var(--knob-stroke)" 
                stroke-width="5" 
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M50,50 L50,2"
                />
      </svg>
  `,this.pathElement=this.querySelector(".knob-path")}cleanup(){this.dragHandlers&&(this.removeEventListener("mousedown",this.dragHandlers.start),this.removeEventListener("touchstart",this.dragHandlers.start),document.removeEventListener("mousemove",this.dragHandlers.move),document.removeEventListener("mouseup",this.dragHandlers.end),document.removeEventListener("touchmove",this.dragHandlers.move),document.removeEventListener("touchend",this.dragHandlers.end))}createUtilityFunctions(){const e=this.config.curve||1;this.rotationToValue=t=>{const n=pe.mapRange(this.config.minRotation,this.config.maxRotation,0,1,t),s=Math.pow(n,e);return pe.mapRange(0,1,this.config.minValue,this.config.maxValue,s)},this.valueToRotation=t=>{const n=pe.mapRange(this.config.minValue,this.config.maxValue,0,1,t),s=Math.pow(n,1/e);return pe.mapRange(0,1,this.config.minRotation,this.config.maxRotation,s)},this.applySnapping=t=>{if(this.config.allowedValues&&this.config.allowedValues.length>0)return this.config.allowedValues.reduce((s,r)=>Math.abs(r-t)<Math.abs(s-t)?r:s);if(this.config.snapIncrement<=0)return t;let n=this.config.snapIncrement;if(this.config.snapThresholds){for(const{maxValue:s,increment:r}of this.config.snapThresholds)if(t<s){n=r;break}}return Math.round(t/n)*n}}createDraggable(){const e="pointerLockElement"in document&&"requestPointerLock"in HTMLElement.prototype;let t=!1,n=0,s=0,r=0,o=!1;const l=d=>{n=d.clientY,o=document.pointerLockElement===this,!(!e||document.pointerLockElement)&&this.requestPointerLock().then(()=>{o=document.pointerLockElement===this},()=>{o=!1})},h=d=>{if(this.config.disabled)return;const g=Date.now(),M=g-this.lastClickTime;if(M<this.DOUBLE_CLICK_THRESHOLD&&M>0){this.resetToDefault();return}this.lastClickTime=g,t=!0,s=this.currentRotation,r=0,"touches"in d?(n=d.touches[0].clientY,o=!1):l(d)},c=d=>{if(!t)return;let g;const M=2;if(o&&document.pointerLockElement)r+=d.movementY,g=-r*M;else{const R="touches"in d?d.touches[0].clientY:d.clientY;g=(n-R)*M}const E=s+g,A=pe.clamp(E,this.config.minRotation,this.config.maxRotation),S=this.rotationToValue(A),P=this.applySnapping(S);this.currentValue=P,P!==S?this.currentRotation=this.valueToRotation(P):this.currentRotation=A,this.updateBorder(),this.dispatchChangeEvent("user"),d.preventDefault()},f=()=>{t=!1,o&&document.pointerLockElement&&document.exitPointerLock(),o=!1};this.dragHandlers={start:h,move:c,end:f},this.addEventListener("mousedown",h),this.addEventListener("touchstart",h,{passive:!1}),document.addEventListener("mousemove",c),document.addEventListener("mouseup",f),document.addEventListener("touchmove",c,{passive:!1}),document.addEventListener("touchend",f)}updateBorder(){if(this.pathElement)if((this.getAttribute("border-style")||"currentState")==="currentState"){const e=(this.config.minRotation-90)*Math.PI/180,t=(this.currentRotation-90)*Math.PI/180,n=48*Math.cos(e)+50,s=48*Math.sin(e)+50,r=48*Math.cos(t)+50,o=48*Math.sin(t)+50,l=this.currentRotation-this.config.minRotation,h=Math.abs(l)>180?1:0,c=`M50,50 L${n},${s} A48,48,0,${h},1,${r},${o} Z`;this.pathElement.setAttribute("d",c)}else this.pathElement.setAttribute("d","M50,2 A48,48,0,1,1,49.9,2 Z")}dispatchChangeEvent(e="programmatic"){const t=pe.mapRange(this.config.minValue,this.config.maxValue,0,100,this.currentValue),n=new CustomEvent("knob-change",{detail:{value:this.currentValue,rotation:this.currentRotation,percentage:t,source:e},bubbles:!0});this.dispatchEvent(n)}setValue(e){!this.valueToRotation||!this.pathElement||(this.currentValue=pe.clamp(e,this.config.minValue,this.config.maxValue),this.currentRotation=this.valueToRotation(this.currentValue),this.updateBorder(),this.dispatchChangeEvent())}setValueNormalized(e){const{minRotation:t,maxRotation:n}=this.config,s=Math.max(0,Math.min(1,e)),r=t+s*(n-t),o=this.rotationToValue(r);this.setValue(o)}getValueNormalized(){return(this.currentRotation-this.config.minRotation)/(this.config.maxRotation-this.config.minRotation)}resetToDefault(){this.setValue(this.config.defaultValue)}getValue(){return this.currentValue}setCurve(e){this.config.curve=e,this.createUtilityFunctions(),this.setValue(this.currentValue)}getCurve(){return this.config.curve||1}setDisabled(e){e?this.setAttribute("disabled",""):this.removeAttribute("disabled")}isDisabled(){return this.hasAttribute("disabled")}getPercentage(){return pe.mapRange(this.config.minValue,this.config.maxValue,0,100,this.currentValue)}get value(){return this.getValue()}set value(e){this.setValue(e)}get disabled(){return this.isDisabled()}set disabled(e){this.setDisabled(e)}};Pe(yo,"stylesInjected",!1);let zh=yo;const $h={KNOB:"knob-element"};function Hh(i,e){typeof customElements>"u"||customElements.get(i)||customElements.define(i,e)}function Dc(){Hh($h.KNOB,zh)}const Ta=Symbol("store-raw"),On=Symbol("store-node"),Je=Symbol("store-has"),vo=Symbol("store-self");function wo(i){let e=i[Wt];if(!e&&(Object.defineProperty(i,Wt,{value:e=new Proxy(i,Kh)}),!Array.isArray(i))){const t=Object.keys(i),n=Object.getOwnPropertyDescriptors(i),s=Object.getPrototypeOf(i),r=s!==null&&i!==null&&typeof i=="object"&&!Array.isArray(i)&&s!==Object.prototype;if(r){const o=Object.getOwnPropertyDescriptors(s);t.push(...Object.keys(o)),Object.assign(n,o)}for(let o=0,l=t.length;o<l;o++){const h=t[o];r&&h==="constructor"||n[h].get&&Object.defineProperty(i,h,{configurable:!0,enumerable:n[h].enumerable,get:n[h].get.bind(e)})}}return e}function Cs(i){let e;return i!=null&&typeof i=="object"&&(i[Wt]||!(e=Object.getPrototypeOf(i))||e===Object.prototype||Array.isArray(i))}function Ri(i,e=new Set){let t,n,s,r;if(t=i!=null&&i[Ta])return t;if(!Cs(i)||e.has(i))return i;if(Array.isArray(i)){Object.isFrozen(i)?i=i.slice(0):e.add(i);for(let o=0,l=i.length;o<l;o++)s=i[o],(n=Ri(s,e))!==s&&(i[o]=n)}else{Object.isFrozen(i)?i=Object.assign({},i):e.add(i);const o=Object.keys(i),l=Object.getOwnPropertyDescriptors(i);for(let h=0,c=o.length;h<c;h++)r=o[h],!l[r].get&&(s=i[r],(n=Ri(s,e))!==s&&(i[r]=n))}return i}function Is(i,e){let t=i[e];return t||Object.defineProperty(i,e,{value:t=Object.create(null)}),t}function Ci(i,e,t){if(i[e])return i[e];const[n,s]=Ca(t,{equals:!1,internal:!0});return n.$=s,i[e]=n}function jh(i,e){const t=Reflect.getOwnPropertyDescriptor(i,e);return!t||t.get||!t.configurable||e===Wt||e===On||(delete t.value,delete t.writable,t.get=()=>i[Wt][e]),t}function Mo(i){ta()&&Ci(Is(i,On),vo)()}function qh(i){return Mo(i),Reflect.ownKeys(i)}const Kh={get(i,e,t){if(e===Ta)return i;if(e===Wt)return t;if(e===Js)return Mo(i),t;const n=Is(i,On),s=n[e];let r=s?s():i[e];if(e===On||e===Je||e==="__proto__")return r;if(!s){const o=Object.getOwnPropertyDescriptor(i,e);ta()&&(typeof r!="function"||Object.prototype.hasOwnProperty.call(i,e))&&!(o&&o.get)&&(r=Ci(n,e,r)())}return Cs(r)?wo(r):r},has(i,e){return e===Ta||e===Wt||e===Js||e===On||e===Je||e==="__proto__"?!0:(ta()&&Ci(Is(i,Je),e)(),e in i)},set(){return!0},deleteProperty(){return!0},ownKeys:qh,getOwnPropertyDescriptor:jh};function xs(i,e,t,n=!1){if(e==="__proto__"||!n&&i[e]===t)return;const s=i[e],r=i.length;t===void 0?(delete i[e],i[Je]&&i[Je][e]&&s!==void 0&&i[Je][e].$()):(i[e]=t,i[Je]&&i[Je][e]&&s===void 0&&i[Je][e].$());let o=Is(i,On),l;if((l=Ci(o,e,s))&&l.$(()=>t),Array.isArray(i)&&i.length!==r){for(let h=i.length;h<r;h++)(l=o[h])&&l.$();(l=Ci(o,"length",r))&&l.$(i.length)}(l=o[vo])&&l.$()}function Eo(i,e){const t=Object.keys(e);for(let n=0;n<t.length;n+=1){const s=t[n];So(s)||xs(i,s,e[s])}}function So(i){return i==="__proto__"||i==="constructor"||i==="prototype"}function Yh(i,e){if(typeof e=="function"&&(e=e(i)),e=Ri(e),Array.isArray(e)){if(i===e)return;let t=0,n=e.length;for(;t<n;t++){const s=e[t];i[t]!==s&&xs(i,t,s)}xs(i,"length",n)}else Eo(i,e)}function mi(i,e,t=[]){let n,s=i;if(e.length>1){n=e.shift();const o=typeof n,l=Array.isArray(i);if(o==="string"&&(n==="__proto__"||e.length>1&&So(n)))return;if(Array.isArray(n)){for(let h=0;h<n.length;h++)mi(i,[n[h]].concat(e),t);return}else if(l&&o==="function"){for(let h=0;h<i.length;h++)n(i[h],h)&&mi(i,[h].concat(e),t);return}else if(l&&o==="object"){const{from:h=0,to:c=i.length-1,by:f=1}=n;for(let d=h;d<=c;d+=f)mi(i,[d].concat(e),t);return}else if(e.length>1){mi(i[n],e,[n].concat(t));return}s=i[n],t=[n].concat(t)}let r=e[0];typeof r=="function"&&(r=r(s,t),r===s)||n===void 0&&r==null||(r=Ri(r),n===void 0||Cs(s)&&Cs(r)&&!Array.isArray(r)?Eo(s,r):xs(i,n,r))}function Rc(...[i,e]){const t=Ri(i||{}),n=Array.isArray(t),s=wo(t);function r(...o){Bo(()=>{n&&o.length===1?Yh(t,o[0]):mi(t,o)})}return[s,r]}class Ie{constructor(e=!1){this.eventMap={},this.eventsSuspended=e==!0}addListener(e,t,n={}){if(typeof e=="string"&&e.length<1||e instanceof String&&e.length<1||typeof e!="string"&&!(e instanceof String)&&e!==Ie.ANY_EVENT)throw new TypeError("The 'event' parameter must be a string or EventEmitter.ANY_EVENT.");if(typeof t!="function")throw new TypeError("The callback must be a function.");const s=new pr(e,this,t,n);return this.eventMap[e]||(this.eventMap[e]=[]),n.prepend?this.eventMap[e].unshift(s):this.eventMap[e].push(s),s}addOneTimeListener(e,t,n={}){n.remaining=1,this.addListener(e,t,n)}static get ANY_EVENT(){return Symbol.for("Any event")}hasListener(e,t){return e===void 0?this.eventMap[Ie.ANY_EVENT]&&this.eventMap[Ie.ANY_EVENT].length>0?!0:Object.entries(this.eventMap).some(([,n])=>n.length>0):this.eventMap[e]&&this.eventMap[e].length>0?t instanceof pr?this.eventMap[e].filter(s=>s===t).length>0:typeof t=="function"?this.eventMap[e].filter(s=>s.callback===t).length>0:t==null:!1}get eventNames(){return Object.keys(this.eventMap)}getListeners(e){return this.eventMap[e]||[]}suspendEvent(e){this.getListeners(e).forEach(t=>{t.suspended=!0})}unsuspendEvent(e){this.getListeners(e).forEach(t=>{t.suspended=!1})}getListenerCount(e){return this.getListeners(e).length}emit(e,...t){if(typeof e!="string"&&!(e instanceof String))throw new TypeError("The 'event' parameter must be a string.");if(this.eventsSuspended)return;let n=[],s=this.eventMap[Ie.ANY_EVENT]||[];return this.eventMap[e]&&(s=s.concat(this.eventMap[e])),s.forEach(r=>{if(r.suspended)return;let o=[...t];Array.isArray(r.arguments)&&(o=o.concat(r.arguments)),r.remaining>0&&(n.push(r.callback.apply(r.context,o)),r.count++),--r.remaining<1&&r.remove()}),n}removeListener(e,t,n={}){if(e===void 0){this.eventMap={};return}else if(!this.eventMap[e])return;let s=this.eventMap[e].filter(r=>t&&r.callback!==t||n.remaining&&n.remaining!==r.remaining||n.context&&n.context!==r.context);s.length?this.eventMap[e]=s:delete this.eventMap[e]}async waitFor(e,t={}){return t.duration=parseInt(t.duration),(isNaN(t.duration)||t.duration<=0)&&(t.duration=1/0),new Promise((n,s)=>{let r,o=this.addListener(e,()=>{clearTimeout(r),n()},{remaining:1});t.duration!==1/0&&(r=setTimeout(()=>{o.remove(),s("The duration expired before the event was emitted.")},t.duration))})}get eventCount(){return Object.keys(this.eventMap).length}}class pr{constructor(e,t,n,s={}){if(typeof e!="string"&&!(e instanceof String)&&e!==Ie.ANY_EVENT)throw new TypeError("The 'event' parameter must be a string or EventEmitter.ANY_EVENT.");if(!t)throw new ReferenceError("The 'target' parameter is mandatory.");if(typeof n!="function")throw new TypeError("The 'callback' must be a function.");s.arguments!==void 0&&!Array.isArray(s.arguments)&&(s.arguments=[s.arguments]),s=Object.assign({context:t,remaining:1/0,arguments:void 0,duration:1/0},s),s.duration!==1/0&&setTimeout(()=>this.remove(),s.duration),this.arguments=s.arguments,this.callback=n,this.context=s.context,this.count=0,this.event=e,this.remaining=parseInt(s.remaining)>=1?parseInt(s.remaining):1/0,this.suspended=!1,this.target=t}remove(){this.target.removeListener(this.event,this.callback,{context:this.context,remaining:this.remaining})}}/**
 * The `Enumerations` class contains enumerations and arrays of elements used throughout the
 * library. All its properties are static and should be referenced using the class name. For
 * example: `Enumerations.CHANNEL_MESSAGES`.
 *
 * @license Apache-2.0
 * @since 3.0.0
 */class m{static get MIDI_CHANNEL_MESSAGES(){return this.validation&&console.warn("The MIDI_CHANNEL_MESSAGES enum has been deprecated. Use the Enumerations.CHANNEL_MESSAGES enum instead."),m.CHANNEL_MESSAGES}static get CHANNEL_MESSAGES(){return{noteoff:8,noteon:9,keyaftertouch:10,controlchange:11,programchange:12,channelaftertouch:13,pitchbend:14}}static get CHANNEL_NUMBERS(){return[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]}static get MIDI_CHANNEL_NUMBERS(){return this.validation&&console.warn("The MIDI_CHANNEL_NUMBERS array has been deprecated. Use the Enumerations.CHANNEL_NUMBERS array instead."),[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]}static get CHANNEL_MODE_MESSAGES(){return{allsoundoff:120,resetallcontrollers:121,localcontrol:122,allnotesoff:123,omnimodeoff:124,omnimodeon:125,monomodeon:126,polymodeon:127}}static get MIDI_CHANNEL_MODE_MESSAGES(){return this.validation&&console.warn("The MIDI_CHANNEL_MODE_MESSAGES enum has been deprecated. Use the Enumerations.CHANNEL_MODE_MESSAGES enum instead."),m.CHANNEL_MODE_MESSAGES}static get MIDI_CONTROL_CHANGE_MESSAGES(){return this.validation&&console.warn("The MIDI_CONTROL_CHANGE_MESSAGES enum has been deprecated. Use the Enumerations.CONTROL_CHANGE_MESSAGES array instead."),{bankselectcoarse:0,modulationwheelcoarse:1,breathcontrollercoarse:2,controller3:3,footcontrollercoarse:4,portamentotimecoarse:5,dataentrycoarse:6,volumecoarse:7,balancecoarse:8,controller9:9,pancoarse:10,expressioncoarse:11,effectcontrol1coarse:12,effectcontrol2coarse:13,controller14:14,controller15:15,generalpurposeslider1:16,generalpurposeslider2:17,generalpurposeslider3:18,generalpurposeslider4:19,controller20:20,controller21:21,controller22:22,controller23:23,controller24:24,controller25:25,controller26:26,controller27:27,controller28:28,controller29:29,controller30:30,controller31:31,bankselectfine:32,modulationwheelfine:33,breathcontrollerfine:34,controller35:35,footcontrollerfine:36,portamentotimefine:37,dataentryfine:38,volumefine:39,balancefine:40,controller41:41,panfine:42,expressionfine:43,effectcontrol1fine:44,effectcontrol2fine:45,controller46:46,controller47:47,controller48:48,controller49:49,controller50:50,controller51:51,controller52:52,controller53:53,controller54:54,controller55:55,controller56:56,controller57:57,controller58:58,controller59:59,controller60:60,controller61:61,controller62:62,controller63:63,holdpedal:64,portamento:65,sustenutopedal:66,softpedal:67,legatopedal:68,hold2pedal:69,soundvariation:70,resonance:71,soundreleasetime:72,soundattacktime:73,brightness:74,soundcontrol6:75,soundcontrol7:76,soundcontrol8:77,soundcontrol9:78,soundcontrol10:79,generalpurposebutton1:80,generalpurposebutton2:81,generalpurposebutton3:82,generalpurposebutton4:83,controller84:84,controller85:85,controller86:86,controller87:87,controller88:88,controller89:89,controller90:90,reverblevel:91,tremololevel:92,choruslevel:93,celestelevel:94,phaserlevel:95,databuttonincrement:96,databuttondecrement:97,nonregisteredparametercoarse:98,nonregisteredparameterfine:99,registeredparametercoarse:100,registeredparameterfine:101,controller102:102,controller103:103,controller104:104,controller105:105,controller106:106,controller107:107,controller108:108,controller109:109,controller110:110,controller111:111,controller112:112,controller113:113,controller114:114,controller115:115,controller116:116,controller117:117,controller118:118,controller119:119,allsoundoff:120,resetallcontrollers:121,localcontrol:122,allnotesoff:123,omnimodeoff:124,omnimodeon:125,monomodeon:126,polymodeon:127}}static get CONTROL_CHANGE_MESSAGES(){return[{number:0,name:"bankselectcoarse",description:"Bank Select (Coarse)",position:"msb"},{number:1,name:"modulationwheelcoarse",description:"Modulation Wheel (Coarse)",position:"msb"},{number:2,name:"breathcontrollercoarse",description:"Breath Controller (Coarse)",position:"msb"},{number:3,name:"controller3",description:"Undefined",position:"msb"},{number:4,name:"footcontrollercoarse",description:"Foot Controller (Coarse)",position:"msb"},{number:5,name:"portamentotimecoarse",description:"Portamento Time (Coarse)",position:"msb"},{number:6,name:"dataentrycoarse",description:"Data Entry (Coarse)",position:"msb"},{number:7,name:"volumecoarse",description:"Channel Volume (Coarse)",position:"msb"},{number:8,name:"balancecoarse",description:"Balance (Coarse)",position:"msb"},{number:9,name:"controller9",description:"Controller 9 (Coarse)",position:"msb"},{number:10,name:"pancoarse",description:"Pan (Coarse)",position:"msb"},{number:11,name:"expressioncoarse",description:"Expression Controller (Coarse)",position:"msb"},{number:12,name:"effectcontrol1coarse",description:"Effect Control 1 (Coarse)",position:"msb"},{number:13,name:"effectcontrol2coarse",description:"Effect Control 2 (Coarse)",position:"msb"},{number:14,name:"controller14",description:"Undefined",position:"msb"},{number:15,name:"controller15",description:"Undefined",position:"msb"},{number:16,name:"generalpurposecontroller1",description:"General Purpose Controller 1 (Coarse)",position:"msb"},{number:17,name:"generalpurposecontroller2",description:"General Purpose Controller 2 (Coarse)",position:"msb"},{number:18,name:"generalpurposecontroller3",description:"General Purpose Controller 3 (Coarse)",position:"msb"},{number:19,name:"generalpurposecontroller4",description:"General Purpose Controller 4 (Coarse)",position:"msb"},{number:20,name:"controller20",description:"Undefined",position:"msb"},{number:21,name:"controller21",description:"Undefined",position:"msb"},{number:22,name:"controller22",description:"Undefined",position:"msb"},{number:23,name:"controller23",description:"Undefined",position:"msb"},{number:24,name:"controller24",description:"Undefined",position:"msb"},{number:25,name:"controller25",description:"Undefined",position:"msb"},{number:26,name:"controller26",description:"Undefined",position:"msb"},{number:27,name:"controller27",description:"Undefined",position:"msb"},{number:28,name:"controller28",description:"Undefined",position:"msb"},{number:29,name:"controller29",description:"Undefined",position:"msb"},{number:30,name:"controller30",description:"Undefined",position:"msb"},{number:31,name:"controller31",description:"Undefined",position:"msb"},{number:32,name:"bankselectfine",description:"Bank Select (Fine)",position:"lsb"},{number:33,name:"modulationwheelfine",description:"Modulation Wheel (Fine)",position:"lsb"},{number:34,name:"breathcontrollerfine",description:"Breath Controller (Fine)",position:"lsb"},{number:35,name:"controller35",description:"Undefined",position:"lsb"},{number:36,name:"footcontrollerfine",description:"Foot Controller (Fine)",position:"lsb"},{number:37,name:"portamentotimefine",description:"Portamento Time (Fine)",position:"lsb"},{number:38,name:"dataentryfine",description:"Data Entry (Fine)",position:"lsb"},{number:39,name:"channelvolumefine",description:"Channel Volume (Fine)",position:"lsb"},{number:40,name:"balancefine",description:"Balance (Fine)",position:"lsb"},{number:41,name:"controller41",description:"Undefined",position:"lsb"},{number:42,name:"panfine",description:"Pan (Fine)",position:"lsb"},{number:43,name:"expressionfine",description:"Expression Controller (Fine)",position:"lsb"},{number:44,name:"effectcontrol1fine",description:"Effect control 1 (Fine)",position:"lsb"},{number:45,name:"effectcontrol2fine",description:"Effect control 2 (Fine)",position:"lsb"},{number:46,name:"controller46",description:"Undefined",position:"lsb"},{number:47,name:"controller47",description:"Undefined",position:"lsb"},{number:48,name:"controller48",description:"General Purpose Controller 1 (Fine)",position:"lsb"},{number:49,name:"controller49",description:"General Purpose Controller 2 (Fine)",position:"lsb"},{number:50,name:"controller50",description:"General Purpose Controller 3 (Fine)",position:"lsb"},{number:51,name:"controller51",description:"General Purpose Controller 4 (Fine)",position:"lsb"},{number:52,name:"controller52",description:"Undefined",position:"lsb"},{number:53,name:"controller53",description:"Undefined",position:"lsb"},{number:54,name:"controller54",description:"Undefined",position:"lsb"},{number:55,name:"controller55",description:"Undefined",position:"lsb"},{number:56,name:"controller56",description:"Undefined",position:"lsb"},{number:57,name:"controller57",description:"Undefined",position:"lsb"},{number:58,name:"controller58",description:"Undefined",position:"lsb"},{number:59,name:"controller59",description:"Undefined",position:"lsb"},{number:60,name:"controller60",description:"Undefined",position:"lsb"},{number:61,name:"controller61",description:"Undefined",position:"lsb"},{number:62,name:"controller62",description:"Undefined",position:"lsb"},{number:63,name:"controller63",description:"Undefined",position:"lsb"},{number:64,name:"damperpedal",description:"Damper Pedal On/Off"},{number:65,name:"portamento",description:"Portamento On/Off"},{number:66,name:"sostenuto",description:"Sostenuto On/Off"},{number:67,name:"softpedal",description:"Soft Pedal On/Off"},{number:68,name:"legatopedal",description:"Legato Pedal On/Off"},{number:69,name:"hold2",description:"Hold 2 On/Off"},{number:70,name:"soundvariation",description:"Sound Variation",position:"lsb"},{number:71,name:"resonance",description:"Resonance",position:"lsb"},{number:72,name:"releasetime",description:"Release Time",position:"lsb"},{number:73,name:"attacktime",description:"Attack Time",position:"lsb"},{number:74,name:"brightness",description:"Brightness",position:"lsb"},{number:75,name:"decaytime",description:"Decay Time",position:"lsb"},{number:76,name:"vibratorate",description:"Vibrato Rate",position:"lsb"},{number:77,name:"vibratodepth",description:"Vibrato Depth",position:"lsb"},{number:78,name:"vibratodelay",description:"Vibrato Delay",position:"lsb"},{number:79,name:"controller79",description:"Undefined",position:"lsb"},{number:80,name:"generalpurposecontroller5",description:"General Purpose Controller 5",position:"lsb"},{number:81,name:"generalpurposecontroller6",description:"General Purpose Controller 6",position:"lsb"},{number:82,name:"generalpurposecontroller7",description:"General Purpose Controller 7",position:"lsb"},{number:83,name:"generalpurposecontroller8",description:"General Purpose Controller 8",position:"lsb"},{number:84,name:"portamentocontrol",description:"Portamento Control",position:"lsb"},{number:85,name:"controller85",description:"Undefined"},{number:86,name:"controller86",description:"Undefined"},{number:87,name:"controller87",description:"Undefined"},{number:88,name:"highresolutionvelocityprefix",description:"High Resolution Velocity Prefix",position:"lsb"},{number:89,name:"controller89",description:"Undefined"},{number:90,name:"controller90",description:"Undefined"},{number:91,name:"effect1depth",description:"Effects 1 Depth (Reverb Send Level)"},{number:92,name:"effect2depth",description:"Effects 2 Depth"},{number:93,name:"effect3depth",description:"Effects 3 Depth (Chorus Send Level)"},{number:94,name:"effect4depth",description:"Effects 4 Depth"},{number:95,name:"effect5depth",description:"Effects 5 Depth"},{number:96,name:"dataincrement",description:"Data Increment"},{number:97,name:"datadecrement",description:"Data Decrement"},{number:98,name:"nonregisteredparameterfine",description:"Non-Registered Parameter Number (Fine)",position:"lsb"},{number:99,name:"nonregisteredparametercoarse",description:"Non-Registered Parameter Number (Coarse)",position:"msb"},{number:100,name:"registeredparameterfine",description:"Registered Parameter Number (Fine)",position:"lsb"},{number:101,name:"registeredparametercoarse",description:"Registered Parameter Number (Coarse)",position:"msb"},{number:102,name:"controller102",description:"Undefined"},{number:103,name:"controller103",description:"Undefined"},{number:104,name:"controller104",description:"Undefined"},{number:105,name:"controller105",description:"Undefined"},{number:106,name:"controller106",description:"Undefined"},{number:107,name:"controller107",description:"Undefined"},{number:108,name:"controller108",description:"Undefined"},{number:109,name:"controller109",description:"Undefined"},{number:110,name:"controller110",description:"Undefined"},{number:111,name:"controller111",description:"Undefined"},{number:112,name:"controller112",description:"Undefined"},{number:113,name:"controller113",description:"Undefined"},{number:114,name:"controller114",description:"Undefined"},{number:115,name:"controller115",description:"Undefined"},{number:116,name:"controller116",description:"Undefined"},{number:117,name:"controller117",description:"Undefined"},{number:118,name:"controller118",description:"Undefined"},{number:119,name:"controller119",description:"Undefined"},{number:120,name:"allsoundoff",description:"All Sound Off"},{number:121,name:"resetallcontrollers",description:"Reset All Controllers"},{number:122,name:"localcontrol",description:"Local Control On/Off"},{number:123,name:"allnotesoff",description:"All Notes Off"},{number:124,name:"omnimodeoff",description:"Omni Mode Off"},{number:125,name:"omnimodeon",description:"Omni Mode On"},{number:126,name:"monomodeon",description:"Mono Mode On"},{number:127,name:"polymodeon",description:"Poly Mode On"}]}static get REGISTERED_PARAMETERS(){return{pitchbendrange:[0,0],channelfinetuning:[0,1],channelcoarsetuning:[0,2],tuningprogram:[0,3],tuningbank:[0,4],modulationrange:[0,5],azimuthangle:[61,0],elevationangle:[61,1],gain:[61,2],distanceratio:[61,3],maximumdistance:[61,4],maximumdistancegain:[61,5],referencedistanceratio:[61,6],panspreadangle:[61,7],rollangle:[61,8]}}static get MIDI_REGISTERED_PARAMETERS(){return this.validation&&console.warn("The MIDI_REGISTERED_PARAMETERS enum has been deprecated. Use the Enumerations.REGISTERED_PARAMETERS enum instead."),m.MIDI_REGISTERED_PARAMETERS}static get SYSTEM_MESSAGES(){return{sysex:240,timecode:241,songposition:242,songselect:243,tunerequest:246,tuningrequest:246,sysexend:247,clock:248,start:250,continue:251,stop:252,activesensing:254,reset:255,midimessage:0,unknownsystemmessage:-1}}static get MIDI_SYSTEM_MESSAGES(){return this.validation&&console.warn("The MIDI_SYSTEM_MESSAGES enum has been deprecated. Use the Enumerations.SYSTEM_MESSAGES enum instead."),m.SYSTEM_MESSAGES}static get CHANNEL_EVENTS(){return["noteoff","controlchange","noteon","keyaftertouch","programchange","channelaftertouch","pitchbend","allnotesoff","allsoundoff","localcontrol","monomode","omnimode","resetallcontrollers","nrpn","nrpn-dataentrycoarse","nrpn-dataentryfine","nrpn-dataincrement","nrpn-datadecrement","rpn","rpn-dataentrycoarse","rpn-dataentryfine","rpn-dataincrement","rpn-datadecrement","nrpn-databuttonincrement","nrpn-databuttondecrement","rpn-databuttonincrement","rpn-databuttondecrement"]}}/**
 * The `Note` class represents a single musical note such as `"D3"`, `"G#4"`, `"F-1"`, `"Gb7"`, etc.
 *
 * `Note` objects can be played back on a single channel by calling
 * [`OutputChannel.playNote()`]{@link OutputChannel#playNote} or, on multiple channels of the same
 * output, by calling [`Output.playNote()`]{@link Output#playNote}.
 *
 * The note has [`attack`](#attack) and [`release`](#release) velocities set at `0.5` by default.
 * These can be changed by passing in the appropriate option. It is also possible to set a
 * system-wide default for attack and release velocities by using the
 * [`WebMidi.defaults`](WebMidi#defaults) property.
 *
 * If you prefer to work with raw MIDI values (`0` to `127`), you can use [`rawAttack`](#rawAttack) and
 * [`rawRelease`](#rawRelease) to both get and set the values.
 *
 * The note may have a [`duration`](#duration). If it does, playback will be automatically stopped
 * when the duration has elapsed by sending a `"noteoff"` event. By default, the duration is set to
 * `Infinity`. In this case, it will never stop playing unless explicitly stopped by calling a
 * method such as [`OutputChannel.stopNote()`]{@link OutputChannel#stopNote},
 * [`Output.stopNote()`]{@link Output#stopNote} or similar.
 *
 * @license Apache-2.0
 * @since 3.0.0
 */class Rn{constructor(e,t={}){this.duration=w.defaults.note.duration,this.attack=w.defaults.note.attack,this.release=w.defaults.note.release,t.duration!=null&&(this.duration=t.duration),t.attack!=null&&(this.attack=t.attack),t.rawAttack!=null&&(this.attack=v.from7bitToFloat(t.rawAttack)),t.release!=null&&(this.release=t.release),t.rawRelease!=null&&(this.release=v.from7bitToFloat(t.rawRelease)),Number.isInteger(e)?this.identifier=v.toNoteIdentifier(e):this.identifier=e}get identifier(){return this._name+(this._accidental||"")+this._octave}set identifier(e){const t=v.getNoteDetails(e);if(w.validation&&!e)throw new Error("Invalid note identifier");this._name=t.name,this._accidental=t.accidental,this._octave=t.octave}get name(){return this._name}set name(e){if(w.validation&&(e=e.toUpperCase(),!["C","D","E","F","G","A","B"].includes(e)))throw new Error("Invalid name value");this._name=e}get accidental(){return this._accidental}set accidental(e){if(w.validation&&(e=e.toLowerCase(),!["#","##","b","bb"].includes(e)))throw new Error("Invalid accidental value");this._accidental=e}get octave(){return this._octave}set octave(e){if(w.validation&&(e=parseInt(e),isNaN(e)))throw new Error("Invalid octave value");this._octave=e}get duration(){return this._duration}set duration(e){if(w.validation&&(e=parseFloat(e),isNaN(e)||e===null||e<0))throw new RangeError("Invalid duration value.");this._duration=e}get attack(){return this._attack}set attack(e){if(w.validation&&(e=parseFloat(e),isNaN(e)||!(e>=0&&e<=1)))throw new RangeError("Invalid attack value.");this._attack=e}get release(){return this._release}set release(e){if(w.validation&&(e=parseFloat(e),isNaN(e)||!(e>=0&&e<=1)))throw new RangeError("Invalid release value.");this._release=e}get rawAttack(){return v.fromFloatTo7Bit(this._attack)}set rawAttack(e){this._attack=v.from7bitToFloat(e)}get rawRelease(){return v.fromFloatTo7Bit(this._release)}set rawRelease(e){this._release=v.from7bitToFloat(e)}get number(){return v.toNoteNumber(this.identifier)}getOffsetNumber(e=0,t=0){return w.validation&&(e=parseInt(e)||0,t=parseInt(t)||0),Math.min(Math.max(this.number+e*12+t,0),127)}}/**
 * The `Utilities` class contains general-purpose utility methods. All methods are static and
 * should be called using the class name. For example: `Utilities.getNoteDetails("C4")`.
 *
 * @license Apache-2.0
 * @since 3.0.0
 */class v{static toNoteNumber(e,t=0){if(t=t==null?0:parseInt(t),isNaN(t))throw new RangeError("Invalid 'octaveOffset' value");typeof e!="string"&&(e="");const n=this.getNoteDetails(e);if(!n)throw new TypeError("Invalid note identifier");const s={C:0,D:2,E:4,F:5,G:7,A:9,B:11};let r=(n.octave+1+t)*12;if(r+=s[n.name],n.accidental&&(n.accidental.startsWith("b")?r-=n.accidental.length:r+=n.accidental.length),r<0||r>127)throw new RangeError("Invalid octaveOffset value");return r}static getNoteDetails(e){Number.isInteger(e)&&(e=this.toNoteIdentifier(e));const t=e.match(/^([CDEFGAB])(#{0,2}|b{0,2})(-?\d+)$/i);if(!t)throw new TypeError("Invalid note identifier");const n=t[1].toUpperCase(),s=parseInt(t[3]);let r=t[2].toLowerCase();return r=r===""?void 0:r,{accidental:r,identifier:n+(r||"")+s,name:n,octave:s}}static sanitizeChannels(e){let t;if(w.validation){if(e==="all")t=["all"];else if(e==="none")return[]}return Array.isArray(e)?t=e:t=[e],t.indexOf("all")>-1&&(t=m.MIDI_CHANNEL_NUMBERS),t.map(function(n){return parseInt(n)}).filter(function(n){return n>=1&&n<=16})}static toTimestamp(e){let t=!1;const n=parseFloat(e);return isNaN(n)?!1:(typeof e=="string"&&e.substring(0,1)==="+"?n>=0&&(t=w.time+n):n>=0&&(t=n),t)}static guessNoteNumber(e,t){t=parseInt(t)||0;let n=!1;if(Number.isInteger(e)&&e>=0&&e<=127)n=parseInt(e);else if(parseInt(e)>=0&&parseInt(e)<=127)n=parseInt(e);else if(typeof e=="string"||e instanceof String)try{n=this.toNoteNumber(e.trim(),t)}catch{return!1}return n}static toNoteIdentifier(e,t){if(e=parseInt(e),isNaN(e)||e<0||e>127)throw new RangeError("Invalid note number");if(t=t==null?0:parseInt(t),isNaN(t))throw new RangeError("Invalid octaveOffset value");const n=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],s=Math.floor(e/12-1)+t;return n[e%12]+s.toString()}static buildNote(e,t={}){if(t.octaveOffset=parseInt(t.octaveOffset)||0,e instanceof Rn)return e;let n=this.guessNoteNumber(e,t.octaveOffset);if(n===!1)throw new TypeError(`The input could not be parsed as a note (${e})`);return t.octaveOffset=void 0,new Rn(n,t)}static buildNoteArray(e,t={}){let n=[];return Array.isArray(e)||(e=[e]),e.forEach(s=>{n.push(this.buildNote(s,t))}),n}static from7bitToFloat(e){return e===1/0&&(e=127),e=parseInt(e)||0,Math.min(Math.max(e/127,0),1)}static fromFloatTo7Bit(e){return e===1/0&&(e=1),e=parseFloat(e)||0,Math.min(Math.max(Math.round(e*127),0),127)}static fromMsbLsbToFloat(e,t=0){w.validation&&(e=Math.min(Math.max(parseInt(e)||0,0),127),t=Math.min(Math.max(parseInt(t)||0,0),127));const n=((e<<7)+t)/16383;return Math.min(Math.max(n,0),1)}static fromFloatToMsbLsb(e){w.validation&&(e=Math.min(Math.max(parseFloat(e)||0,0),1));const t=Math.round(e*16383);return{msb:t>>7,lsb:t&127}}static offsetNumber(e,t=0,n=0){if(w.validation){if(e=parseInt(e),isNaN(e))throw new Error("Invalid note number");t=parseInt(t)||0,n=parseInt(n)||0}return Math.min(Math.max(e+t*12+n,0),127)}static getPropertyByValue(e,t){return Object.keys(e).find(n=>e[n]===t)}static getCcNameByNumber(e){if(!(w.validation&&(e=parseInt(e),!(e>=0&&e<=127))))return m.CONTROL_CHANGE_MESSAGES[e].name}static getCcNumberByName(e){let t=m.CONTROL_CHANGE_MESSAGES.find(n=>n.name===e);return t?t.number:m.MIDI_CONTROL_CHANGE_MESSAGES[e]}static getChannelModeByNumber(e){if(!(e>=120&&e<=127))return!1;for(let t in m.CHANNEL_MODE_MESSAGES)if(m.CHANNEL_MODE_MESSAGES.hasOwnProperty(t)&&e===m.CHANNEL_MODE_MESSAGES[t])return t;return!1}static get isNode(){return typeof process<"u"&&process.versions!=null&&process.versions.node!=null}static get isBrowser(){return typeof window<"u"&&typeof window.document<"u"}}/**
 * The `OutputChannel` class represents a single output MIDI channel. `OutputChannel` objects are
 * provided by an [`Output`](Output) port which, itself, is made available by a device. The
 * `OutputChannel` object is derived from the host's MIDI subsystem and should not be instantiated
 * directly.
 *
 * All 16 `OutputChannel` objects can be found inside the parent output's
 * [`channels`]{@link Output#channels} property.
 *
 * @param {Output} output The [`Output`](Output) this channel belongs to.
 * @param {number} number The MIDI channel number (`1` - `16`).
 *
 * @extends EventEmitter
 * @license Apache-2.0
 * @since 3.0.0
 */class Zh extends Ie{constructor(e,t){super(),this._output=e,this._number=t,this._octaveOffset=0}destroy(){this._output=null,this._number=null,this._octaveOffset=0,this.removeListener()}send(e,t={time:0}){return this.output.send(e,t),this}sendKeyAftertouch(e,t,n={}){if(w.validation){if(n.useRawValue&&(n.rawValue=n.useRawValue),isNaN(parseFloat(t)))throw new RangeError("Invalid key aftertouch value.");if(n.rawValue){if(!(t>=0&&t<=127&&Number.isInteger(t)))throw new RangeError("Key aftertouch raw value must be an integer between 0 and 127.")}else if(!(t>=0&&t<=1))throw new RangeError("Key aftertouch value must be a float between 0 and 1.")}n.rawValue||(t=v.fromFloatTo7Bit(t));const s=w.octaveOffset+this.output.octaveOffset+this.octaveOffset;return Array.isArray(e)||(e=[e]),v.buildNoteArray(e).forEach(r=>{this.send([(m.CHANNEL_MESSAGES.keyaftertouch<<4)+(this.number-1),r.getOffsetNumber(s),t],{time:v.toTimestamp(n.time)})}),this}sendControlChange(e,t,n={}){if(typeof e=="string"&&(e=v.getCcNumberByName(e)),Array.isArray(t)||(t=[t]),w.validation){if(e===void 0)throw new TypeError("Control change must be identified with a valid name or an integer between 0 and 127.");if(!Number.isInteger(e)||!(e>=0&&e<=127))throw new TypeError("Control change number must be an integer between 0 and 127.");if(t=t.map(s=>{const r=Math.min(Math.max(parseInt(s),0),127);if(isNaN(r))throw new TypeError("Values must be integers between 0 and 127");return r}),t.length===2&&e>=32)throw new TypeError("To use a value array, the controller must be between 0 and 31")}return t.forEach((s,r)=>{this.send([(m.CHANNEL_MESSAGES.controlchange<<4)+(this.number-1),e+r*32,t[r]],{time:v.toTimestamp(n.time)})}),this}_selectNonRegisteredParameter(e,t={}){return this.sendControlChange(99,e[0],t),this.sendControlChange(98,e[1],t),this}_deselectRegisteredParameter(e={}){return this.sendControlChange(101,127,e),this.sendControlChange(100,127,e),this}_deselectNonRegisteredParameter(e={}){return this.sendControlChange(101,127,e),this.sendControlChange(100,127,e),this}_selectRegisteredParameter(e,t={}){return this.sendControlChange(101,e[0],t),this.sendControlChange(100,e[1],t),this}_setCurrentParameter(e,t={}){return e=[].concat(e),this.sendControlChange(6,e[0],t),e.length<2?this:(this.sendControlChange(38,e[1],t),this)}sendRpnDecrement(e,t={}){if(Array.isArray(e)||(e=m.REGISTERED_PARAMETERS[e]),w.validation){if(e===void 0)throw new TypeError("The specified registered parameter is invalid.");let n=!1;if(Object.getOwnPropertyNames(m.REGISTERED_PARAMETERS).forEach(s=>{m.REGISTERED_PARAMETERS[s][0]===e[0]&&m.REGISTERED_PARAMETERS[s][1]===e[1]&&(n=!0)}),!n)throw new TypeError("The specified registered parameter is invalid.")}return this._selectRegisteredParameter(e,t),this.sendControlChange(97,0,t),this._deselectRegisteredParameter(t),this}sendRpnIncrement(e,t={}){if(Array.isArray(e)||(e=m.REGISTERED_PARAMETERS[e]),w.validation){if(e===void 0)throw new TypeError("The specified registered parameter is invalid.");let n=!1;if(Object.getOwnPropertyNames(m.REGISTERED_PARAMETERS).forEach(s=>{m.REGISTERED_PARAMETERS[s][0]===e[0]&&m.REGISTERED_PARAMETERS[s][1]===e[1]&&(n=!0)}),!n)throw new TypeError("The specified registered parameter is invalid.")}return this._selectRegisteredParameter(e,t),this.sendControlChange(96,0,t),this._deselectRegisteredParameter(t),this}playNote(e,t={}){this.sendNoteOn(e,t);const n=Array.isArray(e)?e:[e];for(let s of n)if(parseInt(s.duration)>0){const r={time:(v.toTimestamp(t.time)||w.time)+parseInt(s.duration),release:s.release,rawRelease:s.rawRelease};this.sendNoteOff(s,r)}else if(parseInt(t.duration)>0){const r={time:(v.toTimestamp(t.time)||w.time)+parseInt(t.duration),release:t.release,rawRelease:t.rawRelease};this.sendNoteOff(s,r)}return this}sendNoteOff(e,t={}){if(w.validation){if(t.rawRelease!=null&&!(t.rawRelease>=0&&t.rawRelease<=127))throw new RangeError("The 'rawRelease' option must be an integer between 0 and 127");if(t.release!=null&&!(t.release>=0&&t.release<=1))throw new RangeError("The 'release' option must be an number between 0 and 1");t.rawVelocity&&(t.rawRelease=t.velocity,console.warn("The 'rawVelocity' option is deprecated. Use 'rawRelease' instead.")),t.velocity&&(t.release=t.velocity,console.warn("The 'velocity' option is deprecated. Use 'attack' instead."))}let n=64;t.rawRelease!=null?n=t.rawRelease:isNaN(t.release)||(n=Math.round(t.release*127));const s=w.octaveOffset+this.output.octaveOffset+this.octaveOffset;return v.buildNoteArray(e,{rawRelease:parseInt(n)}).forEach(r=>{this.send([(m.CHANNEL_MESSAGES.noteoff<<4)+(this.number-1),r.getOffsetNumber(s),r.rawRelease],{time:v.toTimestamp(t.time)})}),this}stopNote(e,t={}){return this.sendNoteOff(e,t)}sendNoteOn(e,t={}){if(w.validation){if(t.rawAttack!=null&&!(t.rawAttack>=0&&t.rawAttack<=127))throw new RangeError("The 'rawAttack' option must be an integer between 0 and 127");if(t.attack!=null&&!(t.attack>=0&&t.attack<=1))throw new RangeError("The 'attack' option must be an number between 0 and 1");t.rawVelocity&&(t.rawAttack=t.velocity,t.rawRelease=t.release,console.warn("The 'rawVelocity' option is deprecated. Use 'rawAttack' or 'rawRelease'.")),t.velocity&&(t.attack=t.velocity,console.warn("The 'velocity' option is deprecated. Use 'attack' instead."))}let n=64;t.rawAttack!=null?n=t.rawAttack:isNaN(t.attack)||(n=Math.round(t.attack*127));const s=w.octaveOffset+this.output.octaveOffset+this.octaveOffset;return v.buildNoteArray(e,{rawAttack:n}).forEach(r=>{this.send([(m.CHANNEL_MESSAGES.noteon<<4)+(this.number-1),r.getOffsetNumber(s),r.rawAttack],{time:v.toTimestamp(t.time)})}),this}sendChannelMode(e,t=0,n={}){if(typeof e=="string"&&(e=m.CHANNEL_MODE_MESSAGES[e]),w.validation){if(e===void 0)throw new TypeError("Invalid channel mode message name or number.");if(isNaN(e)||!(e>=120&&e<=127))throw new TypeError("Invalid channel mode message number.");if(isNaN(parseInt(t))||t<0||t>127)throw new RangeError("Value must be an integer between 0 and 127.")}return this.send([(m.CHANNEL_MESSAGES.controlchange<<4)+(this.number-1),e,t],{time:v.toTimestamp(n.time)}),this}sendOmniMode(e,t={}){return e===void 0||e?this.sendChannelMode("omnimodeon",0,t):this.sendChannelMode("omnimodeoff",0,t),this}sendChannelAftertouch(e,t={}){if(w.validation){if(isNaN(parseFloat(e)))throw new RangeError("Invalid channel aftertouch value.");if(t.rawValue){if(!(e>=0&&e<=127&&Number.isInteger(e)))throw new RangeError("Channel aftertouch raw value must be an integer between 0 and 127.")}else if(!(e>=0&&e<=1))throw new RangeError("Channel aftertouch value must be a float between 0 and 1.")}return t.rawValue||(e=v.fromFloatTo7Bit(e)),this.send([(m.CHANNEL_MESSAGES.channelaftertouch<<4)+(this.number-1),Math.round(e)],{time:v.toTimestamp(t.time)}),this}sendMasterTuning(e,t={}){if(e=parseFloat(e)||0,w.validation&&!(e>-65&&e<64))throw new RangeError("The value must be a decimal number larger than -65 and smaller than 64.");let n=Math.floor(e)+64,s=e-Math.floor(e);s=Math.round((s+1)/2*16383);let r=s>>7&127,o=s&127;return this.sendRpnValue("channelcoarsetuning",n,t),this.sendRpnValue("channelfinetuning",[r,o],t),this}sendModulationRange(e,t,n={}){if(w.validation){if(!Number.isInteger(e)||!(e>=0&&e<=127))throw new RangeError("The semitones value must be an integer between 0 and 127.");if(t!=null&&(!Number.isInteger(t)||!(t>=0&&t<=127)))throw new RangeError("If specified, the cents value must be an integer between 0 and 127.")}return t>=0&&t<=127||(t=0),this.sendRpnValue("modulationrange",[e,t],n),this}sendNrpnValue(e,t,n={}){if(t=[].concat(t),w.validation){if(!Array.isArray(e)||!Number.isInteger(e[0])||!Number.isInteger(e[1]))throw new TypeError("The specified NRPN is invalid.");if(!(e[0]>=0&&e[0]<=127))throw new RangeError("The first byte of the NRPN must be between 0 and 127.");if(!(e[1]>=0&&e[1]<=127))throw new RangeError("The second byte of the NRPN must be between 0 and 127.");t.forEach(s=>{if(!(s>=0&&s<=127))throw new RangeError("The data bytes of the NRPN must be between 0 and 127.")})}return this._selectNonRegisteredParameter(e,n),this._setCurrentParameter(t,n),this._deselectNonRegisteredParameter(n),this}sendPitchBend(e,t={}){if(w.validation)if(t.rawValue&&Array.isArray(e)){if(!(e[0]>=0&&e[0]<=127))throw new RangeError("The pitch bend MSB must be an integer between 0 and 127.");if(!(e[1]>=0&&e[1]<=127))throw new RangeError("The pitch bend LSB must be an integer between 0 and 127.")}else if(t.rawValue&&!Array.isArray(e)){if(!(e>=0&&e<=127))throw new RangeError("The pitch bend MSB must be an integer between 0 and 127.")}else{if(isNaN(e)||e===null)throw new RangeError("Invalid pitch bend value.");if(!(e>=-1&&e<=1))throw new RangeError("The pitch bend value must be a float between -1 and 1.")}let n=0,s=0;if(t.rawValue&&Array.isArray(e))n=e[0],s=e[1];else if(t.rawValue&&!Array.isArray(e))n=e;else{const r=v.fromFloatToMsbLsb((e+1)/2);n=r.msb,s=r.lsb}return this.send([(m.CHANNEL_MESSAGES.pitchbend<<4)+(this.number-1),s,n],{time:v.toTimestamp(t.time)}),this}sendPitchBendRange(e,t,n={}){if(w.validation){if(!Number.isInteger(e)||!(e>=0&&e<=127))throw new RangeError("The semitones value must be an integer between 0 and 127.");if(!Number.isInteger(t)||!(t>=0&&t<=127))throw new RangeError("The cents value must be an integer between 0 and 127.")}return this.sendRpnValue("pitchbendrange",[e,t],n),this}sendProgramChange(e,t={}){if(e=parseInt(e)||0,w.validation&&!(e>=0&&e<=127))throw new RangeError("The program number must be between 0 and 127.");return this.send([(m.CHANNEL_MESSAGES.programchange<<4)+(this.number-1),e],{time:v.toTimestamp(t.time)}),this}sendRpnValue(e,t,n={}){if(Array.isArray(e)||(e=m.REGISTERED_PARAMETERS[e]),w.validation){if(!Number.isInteger(e[0])||!Number.isInteger(e[1]))throw new TypeError("The specified NRPN is invalid.");if(!(e[0]>=0&&e[0]<=127))throw new RangeError("The first byte of the RPN must be between 0 and 127.");if(!(e[1]>=0&&e[1]<=127))throw new RangeError("The second byte of the RPN must be between 0 and 127.");[].concat(t).forEach(s=>{if(!(s>=0&&s<=127))throw new RangeError("The data bytes of the RPN must be between 0 and 127.")})}return this._selectRegisteredParameter(e,n),this._setCurrentParameter(t,n),this._deselectRegisteredParameter(n),this}sendTuningBank(e,t={}){if(w.validation&&(!Number.isInteger(e)||!(e>=0&&e<=127)))throw new RangeError("The tuning bank number must be between 0 and 127.");return this.sendRpnValue("tuningbank",e,t),this}sendTuningProgram(e,t={}){if(w.validation&&(!Number.isInteger(e)||!(e>=0&&e<=127)))throw new RangeError("The tuning program number must be between 0 and 127.");return this.sendRpnValue("tuningprogram",e,t),this}sendLocalControl(e,t={}){return e?this.sendChannelMode("localcontrol",127,t):this.sendChannelMode("localcontrol",0,t)}sendAllNotesOff(e={}){return this.sendChannelMode("allnotesoff",0,e)}sendAllSoundOff(e={}){return this.sendChannelMode("allsoundoff",0,e)}sendResetAllControllers(e={}){return this.sendChannelMode("resetallcontrollers",0,e)}sendPolyphonicMode(e,t={}){return e==="mono"?this.sendChannelMode("monomodeon",0,t):this.sendChannelMode("polymodeon",0,t)}get octaveOffset(){return this._octaveOffset}set octaveOffset(e){if(this.validation&&(e=parseInt(e),isNaN(e)))throw new TypeError("The 'octaveOffset' property must be an integer.");this._octaveOffset=e}get output(){return this._output}get number(){return this._number}}/**
 * The `Output` class represents a single MIDI output port (not to be confused with a MIDI channel).
 * A port is made available by a MIDI device. A MIDI device can advertise several input and output
 * ports. Each port has 16 MIDI channels which can be accessed via the [`channels`](#channels)
 * property.
 *
 * The `Output` object is automatically instantiated by the library according to the host's MIDI
 * subsystem and should not be directly instantiated.
 *
 * You can access all available `Output` objects by referring to the
 * [`WebMidi.outputs`](WebMidi#outputs) array or by using methods such as
 * [`WebMidi.getOutputByName()`](WebMidi#getOutputByName) or
 * [`WebMidi.getOutputById()`](WebMidi#getOutputById).
 *
 * @fires Output#opened
 * @fires Output#disconnected
 * @fires Output#closed
 *
 * @extends EventEmitter
 * @license Apache-2.0
 */class Na extends Ie{constructor(e){super(),this._midiOutput=e,this._octaveOffset=0,this.channels=[];for(let t=1;t<=16;t++)this.channels[t]=new Zh(this,t);this._midiOutput.onstatechange=this._onStateChange.bind(this)}async destroy(){this.removeListener(),this.channels.forEach(e=>e.destroy()),this.channels=[],this._midiOutput&&(this._midiOutput.onstatechange=null),await this.close(),this._midiOutput=null}_onStateChange(e){let t={timestamp:w.time};e.port.connection==="open"?(t.type="opened",t.target=this,t.port=t.target,this.emit("opened",t)):e.port.connection==="closed"&&e.port.state==="connected"?(t.type="closed",t.target=this,t.port=t.target,this.emit("closed",t)):e.port.connection==="closed"&&e.port.state==="disconnected"?(t.type="disconnected",t.port={connection:e.port.connection,id:e.port.id,manufacturer:e.port.manufacturer,name:e.port.name,state:e.port.state,type:e.port.type},this.emit("disconnected",t)):e.port.connection==="pending"&&e.port.state==="disconnected"||console.warn("This statechange event was not caught:",e.port.connection,e.port.state)}async open(){try{return await this._midiOutput.open(),Promise.resolve(this)}catch(e){return Promise.reject(e)}}async close(){this._midiOutput?await this._midiOutput.close():await Promise.resolve()}send(e,t={time:0},n=0){if(e instanceof Ao&&(e=v.isNode?e.data:e.rawData),e instanceof Uint8Array&&v.isNode&&(e=Array.from(e)),w.validation){if(!Array.isArray(e)&&!(e instanceof Uint8Array)&&(e=[e],Array.isArray(t)&&(e=e.concat(t)),t=isNaN(n)?{time:0}:{time:n}),!(parseInt(e[0])>=128&&parseInt(e[0])<=255))throw new RangeError("The first byte (status) must be an integer between 128 and 255.");e.slice(1).forEach(s=>{if(s=parseInt(s),!(s>=0&&s<=255))throw new RangeError("Data bytes must be integers between 0 and 255.")}),t||(t={time:0})}return this._midiOutput.send(e,v.toTimestamp(t.time)),this}sendSysex(e,t=[],n={}){if(e=[].concat(e),t instanceof Uint8Array){const s=new Uint8Array(1+e.length+t.length+1);s[0]=m.SYSTEM_MESSAGES.sysex,s.set(Uint8Array.from(e),1),s.set(t,1+e.length),s[s.length-1]=m.SYSTEM_MESSAGES.sysexend,this.send(s,{time:n.time})}else{const s=e.concat(t,m.SYSTEM_MESSAGES.sysexend);this.send([m.SYSTEM_MESSAGES.sysex].concat(s),{time:n.time})}return this}clear(){return this._midiOutput.clear?this._midiOutput.clear():w.validation&&console.warn("The 'clear()' method has not yet been implemented in your environment."),this}sendTimecodeQuarterFrame(e,t={}){if(w.validation&&(e=parseInt(e),isNaN(e)||!(e>=0&&e<=127)))throw new RangeError("The value must be an integer between 0 and 127.");return this.send([m.SYSTEM_MESSAGES.timecode,e],{time:t.time}),this}sendSongPosition(e=0,t={}){e=Math.floor(e)||0;var n=e>>7&127,s=e&127;return this.send([m.SYSTEM_MESSAGES.songposition,n,s],{time:t.time}),this}sendSongSelect(e=0,t={}){if(w.validation&&(e=parseInt(e),isNaN(e)||!(e>=0&&e<=127)))throw new RangeError("The program value must be between 0 and 127");return this.send([m.SYSTEM_MESSAGES.songselect,e],{time:t.time}),this}sendTuneRequest(e={}){return this.send([m.SYSTEM_MESSAGES.tunerequest],{time:e.time}),this}sendClock(e={}){return this.send([m.SYSTEM_MESSAGES.clock],{time:e.time}),this}sendStart(e={}){return this.send([m.SYSTEM_MESSAGES.start],{time:e.time}),this}sendContinue(e={}){return this.send([m.SYSTEM_MESSAGES.continue],{time:e.time}),this}sendStop(e={}){return this.send([m.SYSTEM_MESSAGES.stop],{time:e.time}),this}sendActiveSensing(e={}){return this.send([m.SYSTEM_MESSAGES.activesensing],{time:e.time}),this}sendReset(e={}){return this.send([m.SYSTEM_MESSAGES.reset],{time:e.time}),this}sendTuningRequest(e={}){return w.validation&&console.warn("The sendTuningRequest() method has been deprecated. Use sendTuningRequest() instead."),this.sendTuneRequest(e)}sendKeyAftertouch(e,t,n={}){return n.channels==null&&(n.channels=m.MIDI_CHANNEL_NUMBERS),v.sanitizeChannels(n.channels).forEach(s=>{this.channels[s].sendKeyAftertouch(e,t,n)}),this}sendControlChange(e,t,n={},s={}){if(w.validation&&(Array.isArray(n)||Number.isInteger(n)||n==="all")){const r=n;n=s,n.channels=r,n.channels==="all"&&(n.channels=m.MIDI_CHANNEL_NUMBERS)}return n.channels==null&&(n.channels=m.MIDI_CHANNEL_NUMBERS),v.sanitizeChannels(n.channels).forEach(r=>{this.channels[r].sendControlChange(e,t,n)}),this}sendPitchBendRange(e=0,t=0,n={}){return n.channels==null&&(n.channels=m.MIDI_CHANNEL_NUMBERS),v.sanitizeChannels(n.channels).forEach(s=>{this.channels[s].sendPitchBendRange(e,t,n)}),this}setPitchBendRange(e=0,t=0,n="all",s={}){return w.validation&&(console.warn("The setPitchBendRange() method is deprecated. Use sendPitchBendRange() instead."),s.channels=n,s.channels==="all"&&(s.channels=m.MIDI_CHANNEL_NUMBERS)),this.sendPitchBendRange(e,t,s)}sendRpnValue(e,t,n={}){return n.channels==null&&(n.channels=m.MIDI_CHANNEL_NUMBERS),v.sanitizeChannels(n.channels).forEach(s=>{this.channels[s].sendRpnValue(e,t,n)}),this}setRegisteredParameter(e,t=[],n="all",s={}){return w.validation&&(console.warn("The setRegisteredParameter() method is deprecated. Use sendRpnValue() instead."),s.channels=n,s.channels==="all"&&(s.channels=m.MIDI_CHANNEL_NUMBERS)),this.sendRpnValue(e,t,s)}sendChannelAftertouch(e,t={},n={}){if(w.validation&&(Array.isArray(t)||Number.isInteger(t)||t==="all")){const s=t;t=n,t.channels=s,t.channels==="all"&&(t.channels=m.MIDI_CHANNEL_NUMBERS)}return t.channels==null&&(t.channels=m.MIDI_CHANNEL_NUMBERS),v.sanitizeChannels(t.channels).forEach(s=>{this.channels[s].sendChannelAftertouch(e,t)}),this}sendPitchBend(e,t={},n={}){if(w.validation&&(Array.isArray(t)||Number.isInteger(t)||t==="all")){const s=t;t=n,t.channels=s,t.channels==="all"&&(t.channels=m.MIDI_CHANNEL_NUMBERS)}return t.channels==null&&(t.channels=m.MIDI_CHANNEL_NUMBERS),v.sanitizeChannels(t.channels).forEach(s=>{this.channels[s].sendPitchBend(e,t)}),this}sendProgramChange(e=0,t={},n={}){if(w.validation&&(Array.isArray(t)||Number.isInteger(t)||t==="all")){const s=t;t=n,t.channels=s,t.channels==="all"&&(t.channels=m.MIDI_CHANNEL_NUMBERS)}return t.channels==null&&(t.channels=m.MIDI_CHANNEL_NUMBERS),v.sanitizeChannels(t.channels).forEach(s=>{this.channels[s].sendProgramChange(e,t)}),this}sendModulationRange(e,t,n={}){return n.channels==null&&(n.channels=m.MIDI_CHANNEL_NUMBERS),v.sanitizeChannels(n.channels).forEach(s=>{this.channels[s].sendModulationRange(e,t,n)}),this}setModulationRange(e=0,t=0,n="all",s={}){return w.validation&&(console.warn("The setModulationRange() method is deprecated. Use sendModulationRange() instead."),s.channels=n,s.channels==="all"&&(s.channels=m.MIDI_CHANNEL_NUMBERS)),this.sendModulationRange(e,t,s)}sendMasterTuning(e,t={}){return t.channels==null&&(t.channels=m.MIDI_CHANNEL_NUMBERS),v.sanitizeChannels(t.channels).forEach(n=>{this.channels[n].sendMasterTuning(e,t)}),this}setMasterTuning(e,t={},n={}){return w.validation&&(console.warn("The setMasterTuning() method is deprecated. Use sendMasterTuning() instead."),n.channels=t,n.channels==="all"&&(n.channels=m.MIDI_CHANNEL_NUMBERS)),this.sendMasterTuning(e,n)}sendTuningProgram(e,t={}){return t.channels==null&&(t.channels=m.MIDI_CHANNEL_NUMBERS),v.sanitizeChannels(t.channels).forEach(n=>{this.channels[n].sendTuningProgram(e,t)}),this}setTuningProgram(e,t="all",n={}){return w.validation&&(console.warn("The setTuningProgram() method is deprecated. Use sendTuningProgram() instead."),n.channels=t,n.channels==="all"&&(n.channels=m.MIDI_CHANNEL_NUMBERS)),this.sendTuningProgram(e,n)}sendTuningBank(e=0,t={}){return t.channels==null&&(t.channels=m.MIDI_CHANNEL_NUMBERS),v.sanitizeChannels(t.channels).forEach(n=>{this.channels[n].sendTuningBank(e,t)}),this}setTuningBank(e,t="all",n={}){return w.validation&&(console.warn("The setTuningBank() method is deprecated. Use sendTuningBank() instead."),n.channels=t,n.channels==="all"&&(n.channels=m.MIDI_CHANNEL_NUMBERS)),this.sendTuningBank(e,n)}sendChannelMode(e,t=0,n={},s={}){if(w.validation&&(Array.isArray(n)||Number.isInteger(n)||n==="all")){const r=n;n=s,n.channels=r,n.channels==="all"&&(n.channels=m.MIDI_CHANNEL_NUMBERS)}return n.channels==null&&(n.channels=m.MIDI_CHANNEL_NUMBERS),v.sanitizeChannels(n.channels).forEach(r=>{this.channels[r].sendChannelMode(e,t,n)}),this}sendAllSoundOff(e={}){return e.channels==null&&(e.channels=m.MIDI_CHANNEL_NUMBERS),v.sanitizeChannels(e.channels).forEach(t=>{this.channels[t].sendAllSoundOff(e)}),this}sendAllNotesOff(e={}){return e.channels==null&&(e.channels=m.MIDI_CHANNEL_NUMBERS),v.sanitizeChannels(e.channels).forEach(t=>{this.channels[t].sendAllNotesOff(e)}),this}sendResetAllControllers(e={},t={}){if(w.validation&&(Array.isArray(e)||Number.isInteger(e)||e==="all")){const n=e;e=t,e.channels=n,e.channels==="all"&&(e.channels=m.MIDI_CHANNEL_NUMBERS)}return e.channels==null&&(e.channels=m.MIDI_CHANNEL_NUMBERS),v.sanitizeChannels(e.channels).forEach(n=>{this.channels[n].sendResetAllControllers(e)}),this}sendPolyphonicMode(e,t={},n={}){if(w.validation&&(Array.isArray(t)||Number.isInteger(t)||t==="all")){const s=t;t=n,t.channels=s,t.channels==="all"&&(t.channels=m.MIDI_CHANNEL_NUMBERS)}return t.channels==null&&(t.channels=m.MIDI_CHANNEL_NUMBERS),v.sanitizeChannels(t.channels).forEach(s=>{this.channels[s].sendPolyphonicMode(e,t)}),this}sendLocalControl(e,t={},n={}){if(w.validation&&(Array.isArray(t)||Number.isInteger(t)||t==="all")){const s=t;t=n,t.channels=s,t.channels==="all"&&(t.channels=m.MIDI_CHANNEL_NUMBERS)}return t.channels==null&&(t.channels=m.MIDI_CHANNEL_NUMBERS),v.sanitizeChannels(t.channels).forEach(s=>{this.channels[s].sendLocalControl(e,t)}),this}sendOmniMode(e,t={},n={}){if(w.validation&&(Array.isArray(t)||Number.isInteger(t)||t==="all")){const s=t;t=n,t.channels=s,t.channels==="all"&&(t.channels=m.MIDI_CHANNEL_NUMBERS)}return t.channels==null&&(t.channels=m.MIDI_CHANNEL_NUMBERS),v.sanitizeChannels(t.channels).forEach(s=>{this.channels[s].sendOmniMode(e,t)}),this}sendNrpnValue(e,t,n={}){return n.channels==null&&(n.channels=m.MIDI_CHANNEL_NUMBERS),v.sanitizeChannels(n.channels).forEach(s=>{this.channels[s].sendNrpnValue(e,t,n)}),this}setNonRegisteredParameter(e,t=[],n="all",s={}){return w.validation&&(console.warn("The setNonRegisteredParameter() method is deprecated. Use sendNrpnValue() instead."),s.channels=n,s.channels==="all"&&(s.channels=m.MIDI_CHANNEL_NUMBERS)),this.sendNrpnValue(e,t,s)}sendRpnIncrement(e,t={}){return t.channels==null&&(t.channels=m.MIDI_CHANNEL_NUMBERS),v.sanitizeChannels(t.channels).forEach(n=>{this.channels[n].sendRpnIncrement(e,t)}),this}incrementRegisteredParameter(e,t="all",n={}){return w.validation&&(console.warn("The incrementRegisteredParameter() method is deprecated. Use sendRpnIncrement() instead."),n.channels=t,n.channels==="all"&&(n.channels=m.MIDI_CHANNEL_NUMBERS)),this.sendRpnIncrement(e,n)}sendRpnDecrement(e,t={}){return t.channels==null&&(t.channels=m.MIDI_CHANNEL_NUMBERS),v.sanitizeChannels(t.channels).forEach(n=>{this.channels[n].sendRpnDecrement(e,t)}),this}decrementRegisteredParameter(e,t="all",n={}){return w.validation&&(console.warn("The decrementRegisteredParameter() method is deprecated. Use sendRpnDecrement() instead."),n.channels=t,n.channels==="all"&&(n.channels=m.MIDI_CHANNEL_NUMBERS)),this.sendRpnDecrement(e,n)}sendNoteOff(e,t={},n={}){if(w.validation&&(Array.isArray(t)||Number.isInteger(t)||t==="all")){const s=t;t=n,t.channels=s,t.channels==="all"&&(t.channels=m.MIDI_CHANNEL_NUMBERS)}return t.channels==null&&(t.channels=m.MIDI_CHANNEL_NUMBERS),v.sanitizeChannels(t.channels).forEach(s=>{this.channels[s].sendNoteOff(e,t)}),this}stopNote(e,t){return this.sendNoteOff(e,t)}playNote(e,t={},n={}){if(w.validation&&(t.rawVelocity&&console.warn("The 'rawVelocity' option is deprecated. Use 'rawAttack' instead."),t.velocity&&console.warn("The 'velocity' option is deprecated. Use 'velocity' instead."),Array.isArray(t)||Number.isInteger(t)||t==="all")){const s=t;t=n,t.channels=s,t.channels==="all"&&(t.channels=m.MIDI_CHANNEL_NUMBERS)}return t.channels==null&&(t.channels=m.MIDI_CHANNEL_NUMBERS),v.sanitizeChannels(t.channels).forEach(s=>{this.channels[s].playNote(e,t)}),this}sendNoteOn(e,t={},n={}){if(w.validation&&(Array.isArray(t)||Number.isInteger(t)||t==="all")){const s=t;t=n,t.channels=s,t.channels==="all"&&(t.channels=m.MIDI_CHANNEL_NUMBERS)}return t.channels==null&&(t.channels=m.MIDI_CHANNEL_NUMBERS),v.sanitizeChannels(t.channels).forEach(s=>{this.channels[s].sendNoteOn(e,t)}),this}get name(){return this._midiOutput.name}get id(){return this._midiOutput.id}get connection(){return this._midiOutput.connection}get manufacturer(){return this._midiOutput.manufacturer}get state(){return this._midiOutput.state}get type(){return this._midiOutput.type}get octaveOffset(){return this._octaveOffset}set octaveOffset(e){if(this.validation&&(e=parseInt(e),isNaN(e)))throw new TypeError("The 'octaveOffset' property must be an integer.");this._octaveOffset=e}}/**
 * The `Forwarder` class allows the forwarding of MIDI messages to predetermined outputs. When you
 * call its [`forward()`](#forward) method, it will send the specified [`Message`](Message) object
 * to all the outputs listed in its [`destinations`](#destinations) property.
 *
 * If specific channels or message types have been defined in the [`channels`](#channels) or
 * [`types`](#types) properties, only messages matching the channels/types will be forwarded.
 *
 * While it can be manually instantiated, you are more likely to come across a `Forwarder` object as
 * the return value of the [`Input.addForwarder()`](Input#addForwarder) method.
 *
 * @license Apache-2.0
 * @since 3.0.0
 */class fr{constructor(e=[],t={}){this.destinations=[],this.types=[...Object.keys(m.SYSTEM_MESSAGES),...Object.keys(m.CHANNEL_MESSAGES)],this.channels=m.MIDI_CHANNEL_NUMBERS,this.suspended=!1,Array.isArray(e)||(e=[e]),t.types&&!Array.isArray(t.types)&&(t.types=[t.types]),t.channels&&!Array.isArray(t.channels)&&(t.channels=[t.channels]),w.validation&&(e.forEach(n=>{if(!(n instanceof Na))throw new TypeError("Destinations must be of type 'Output'.")}),t.types!==void 0&&t.types.forEach(n=>{if(!m.SYSTEM_MESSAGES.hasOwnProperty(n)&&!m.CHANNEL_MESSAGES.hasOwnProperty(n))throw new TypeError("Type must be a valid message type.")}),t.channels!==void 0&&t.channels.forEach(n=>{if(!m.MIDI_CHANNEL_NUMBERS.includes(n))throw new TypeError("MIDI channel must be between 1 and 16.")})),this.destinations=e,t.types&&(this.types=t.types),t.channels&&(this.channels=t.channels)}forward(e){this.suspended||this.types.includes(e.type)&&(e.channel&&!this.channels.includes(e.channel)||this.destinations.forEach(t=>{w.validation&&!(t instanceof Na)||t.send(e)}))}}/**
 * The `InputChannel` class represents a single MIDI input channel (1-16) from a single input
 * device. This object is derived from the host's MIDI subsystem and should not be instantiated
 * directly.
 *
 * All 16 `InputChannel` objects can be found inside the input's [`channels`](Input#channels)
 * property.
 *
 * @fires InputChannel#midimessage
 * @fires InputChannel#unknownmessage
 *
 * @fires InputChannel#noteoff
 * @fires InputChannel#noteon
 * @fires InputChannel#keyaftertouch
 * @fires InputChannel#programchange
 * @fires InputChannel#channelaftertouch
 * @fires InputChannel#pitchbend
 *
 * @fires InputChannel#allnotesoff
 * @fires InputChannel#allsoundoff
 * @fires InputChannel#localcontrol
 * @fires InputChannel#monomode
 * @fires InputChannel#omnimode
 * @fires InputChannel#resetallcontrollers
 *
 * @fires InputChannel#event:nrpn
 * @fires InputChannel#event:nrpn-dataentrycoarse
 * @fires InputChannel#event:nrpn-dataentryfine
 * @fires InputChannel#event:nrpn-dataincrement
 * @fires InputChannel#event:nrpn-datadecrement
 * @fires InputChannel#event:rpn
 * @fires InputChannel#event:rpn-dataentrycoarse
 * @fires InputChannel#event:rpn-dataentryfine
 * @fires InputChannel#event:rpn-dataincrement
 * @fires InputChannel#event:rpn-datadecrement
 *
 * @fires InputChannel#controlchange
 * @fires InputChannel#event:controlchange-controllerxxx
 * @fires InputChannel#event:controlchange-bankselectcoarse
 * @fires InputChannel#event:controlchange-modulationwheelcoarse
 * @fires InputChannel#event:controlchange-breathcontrollercoarse
 * @fires InputChannel#event:controlchange-footcontrollercoarse
 * @fires InputChannel#event:controlchange-portamentotimecoarse
 * @fires InputChannel#event:controlchange-dataentrycoarse
 * @fires InputChannel#event:controlchange-volumecoarse
 * @fires InputChannel#event:controlchange-balancecoarse
 * @fires InputChannel#event:controlchange-pancoarse
 * @fires InputChannel#event:controlchange-expressioncoarse
 * @fires InputChannel#event:controlchange-effectcontrol1coarse
 * @fires InputChannel#event:controlchange-effectcontrol2coarse
 * @fires InputChannel#event:controlchange-generalpurposecontroller1
 * @fires InputChannel#event:controlchange-generalpurposecontroller2
 * @fires InputChannel#event:controlchange-generalpurposecontroller3
 * @fires InputChannel#event:controlchange-generalpurposecontroller4
 * @fires InputChannel#event:controlchange-bankselectfine
 * @fires InputChannel#event:controlchange-modulationwheelfine
 * @fires InputChannel#event:controlchange-breathcontrollerfine
 * @fires InputChannel#event:controlchange-footcontrollerfine
 * @fires InputChannel#event:controlchange-portamentotimefine
 * @fires InputChannel#event:controlchange-dataentryfine
 * @fires InputChannel#event:controlchange-channelvolumefine
 * @fires InputChannel#event:controlchange-balancefine
 * @fires InputChannel#event:controlchange-panfine
 * @fires InputChannel#event:controlchange-expressionfine
 * @fires InputChannel#event:controlchange-effectcontrol1fine
 * @fires InputChannel#event:controlchange-effectcontrol2fine
 * @fires InputChannel#event:controlchange-damperpedal
 * @fires InputChannel#event:controlchange-portamento
 * @fires InputChannel#event:controlchange-sostenuto
 * @fires InputChannel#event:controlchange-softpedal
 * @fires InputChannel#event:controlchange-legatopedal
 * @fires InputChannel#event:controlchange-hold2
 * @fires InputChannel#event:controlchange-soundvariation
 * @fires InputChannel#event:controlchange-resonance
 * @fires InputChannel#event:controlchange-releasetime
 * @fires InputChannel#event:controlchange-attacktime
 * @fires InputChannel#event:controlchange-brightness
 * @fires InputChannel#event:controlchange-decaytime
 * @fires InputChannel#event:controlchange-vibratorate
 * @fires InputChannel#event:controlchange-vibratodepth
 * @fires InputChannel#event:controlchange-vibratodelay
 * @fires InputChannel#event:controlchange-generalpurposecontroller5
 * @fires InputChannel#event:controlchange-generalpurposecontroller6
 * @fires InputChannel#event:controlchange-generalpurposecontroller7
 * @fires InputChannel#event:controlchange-generalpurposecontroller8
 * @fires InputChannel#event:controlchange-portamentocontrol
 * @fires InputChannel#event:controlchange-highresolutionvelocityprefix
 * @fires InputChannel#event:controlchange-effect1depth
 * @fires InputChannel#event:controlchange-effect2depth
 * @fires InputChannel#event:controlchange-effect3depth
 * @fires InputChannel#event:controlchange-effect4depth
 * @fires InputChannel#event:controlchange-effect5depth
 * @fires InputChannel#event:controlchange-dataincrement
 * @fires InputChannel#event:controlchange-datadecrement
 * @fires InputChannel#event:controlchange-nonregisteredparameterfine
 * @fires InputChannel#event:controlchange-nonregisteredparametercoarse
 * @fires InputChannel#event:controlchange-registeredparameterfine
 * @fires InputChannel#event:controlchange-registeredparametercoarse
 * @fires InputChannel#event:controlchange-allsoundoff
 * @fires InputChannel#event:controlchange-resetallcontrollers
 * @fires InputChannel#event:controlchange-localcontrol
 * @fires InputChannel#event:controlchange-allnotesoff
 * @fires InputChannel#event:controlchange-omnimodeoff
 * @fires InputChannel#event:controlchange-omnimodeon
 * @fires InputChannel#event:controlchange-monomodeon
 * @fires InputChannel#event:controlchange-polymodeon
 * @fires InputChannel#event:
 *
 * @extends EventEmitter
 * @license Apache-2.0
 * @since 3.0.0
 */class Qh extends Ie{constructor(e,t){super(),this._input=e,this._number=t,this._octaveOffset=0,this._nrpnBuffer=[],this._rpnBuffer=[],this.parameterNumberEventsEnabled=!0,this.notesState=new Array(128).fill(!1)}destroy(){this._input=null,this._number=null,this._octaveOffset=0,this._nrpnBuffer=[],this.notesState=new Array(128).fill(!1),this.parameterNumberEventsEnabled=!1,this.removeListener()}_processMidiMessageEvent(e){const t=Object.assign({},e);t.port=this.input,t.target=this,t.type="midimessage",this.emit(t.type,t),this._parseEventForStandardMessages(t)}_parseEventForStandardMessages(e){const t=Object.assign({},e);t.type=t.message.type||"unknownmessage";const n=e.message.dataBytes[0],s=e.message.dataBytes[1];if(t.type==="noteoff"||t.type==="noteon"&&s===0)this.notesState[n]=!1,t.type="noteoff",t.note=new Rn(v.offsetNumber(n,this.octaveOffset+this.input.octaveOffset+w.octaveOffset),{rawAttack:0,rawRelease:s}),t.value=v.from7bitToFloat(s),t.rawValue=s,t.velocity=t.note.release,t.rawVelocity=t.note.rawRelease;else if(t.type==="noteon")this.notesState[n]=!0,t.note=new Rn(v.offsetNumber(n,this.octaveOffset+this.input.octaveOffset+w.octaveOffset),{rawAttack:s}),t.value=v.from7bitToFloat(s),t.rawValue=s,t.velocity=t.note.attack,t.rawVelocity=t.note.rawAttack;else if(t.type==="keyaftertouch")t.note=new Rn(v.offsetNumber(n,this.octaveOffset+this.input.octaveOffset+w.octaveOffset)),t.value=v.from7bitToFloat(s),t.rawValue=s,t.identifier=t.note.identifier,t.key=t.note.number,t.rawKey=n;else if(t.type==="controlchange"){t.controller={number:n,name:m.CONTROL_CHANGE_MESSAGES[n].name,description:m.CONTROL_CHANGE_MESSAGES[n].description,position:m.CONTROL_CHANGE_MESSAGES[n].position},t.subtype=t.controller.name||"controller"+n,t.value=v.from7bitToFloat(s),t.rawValue=s;const r=Object.assign({},t);r.type=`${t.type}-controller${n}`,delete r.subtype,this.emit(r.type,r);const o=Object.assign({},t);o.type=`${t.type}-`+m.CONTROL_CHANGE_MESSAGES[n].name,delete o.subtype,o.type.indexOf("controller")!==0&&this.emit(o.type,o),t.message.dataBytes[0]>=120&&this._parseChannelModeMessage(t),this.parameterNumberEventsEnabled&&this._isRpnOrNrpnController(t.message.dataBytes[0])&&this._parseEventForParameterNumber(t)}else t.type==="programchange"?(t.value=n,t.rawValue=t.value):t.type==="channelaftertouch"?(t.value=v.from7bitToFloat(n),t.rawValue=n):t.type==="pitchbend"?(t.value=((s<<7)+n-8192)/8192,t.rawValue=(s<<7)+n):t.type="unknownmessage";this.emit(t.type,t)}_parseChannelModeMessage(e){const t=Object.assign({},e);t.type=t.controller.name,t.type==="localcontrol"&&(t.value=t.message.data[2]===127,t.rawValue=t.message.data[2]),t.type==="omnimodeon"?(t.type="omnimode",t.value=!0,t.rawValue=t.message.data[2]):t.type==="omnimodeoff"&&(t.type="omnimode",t.value=!1,t.rawValue=t.message.data[2]),t.type==="monomodeon"?(t.type="monomode",t.value=!0,t.rawValue=t.message.data[2]):t.type==="polymodeon"&&(t.type="monomode",t.value=!1,t.rawValue=t.message.data[2]),this.emit(t.type,t)}_parseEventForParameterNumber(e){const t=e.message.dataBytes[0],n=e.message.dataBytes[1];t===99||t===101?(this._nrpnBuffer=[],this._rpnBuffer=[],t===99?this._nrpnBuffer=[e.message]:n!==127&&(this._rpnBuffer=[e.message])):t===98||t===100?t===98?(this._rpnBuffer=[],this._nrpnBuffer.length===1?this._nrpnBuffer.push(e.message):this._nrpnBuffer=[]):(this._nrpnBuffer=[],this._rpnBuffer.length===1&&n!==127?this._rpnBuffer.push(e.message):this._rpnBuffer=[]):(t===6||t===38||t===96||t===97)&&(this._rpnBuffer.length===2?this._dispatchParameterNumberEvent("rpn",this._rpnBuffer[0].dataBytes[1],this._rpnBuffer[1].dataBytes[1],e):this._nrpnBuffer.length===2?this._dispatchParameterNumberEvent("nrpn",this._nrpnBuffer[0].dataBytes[1],this._nrpnBuffer[1].dataBytes[1],e):(this._nrpnBuffer=[],this._rpnBuffer=[]))}_isRpnOrNrpnController(e){return e===6||e===38||e===96||e===97||e===98||e===99||e===100||e===101}_dispatchParameterNumberEvent(e,t,n,s){e=e==="nrpn"?"nrpn":"rpn";const r={target:s.target,timestamp:s.timestamp,message:s.message,parameterMsb:t,parameterLsb:n,value:v.from7bitToFloat(s.message.dataBytes[1]),rawValue:s.message.dataBytes[1]};e==="rpn"?r.parameter=Object.keys(m.REGISTERED_PARAMETERS).find(h=>m.REGISTERED_PARAMETERS[h][0]===t&&m.REGISTERED_PARAMETERS[h][1]===n):r.parameter=(t<<7)+n;const o=m.CONTROL_CHANGE_MESSAGES[s.message.dataBytes[0]].name;r.type=`${e}-${o}`,this.emit(r.type,r);const l=Object.assign({},r);l.type==="nrpn-dataincrement"?l.type="nrpn-databuttonincrement":l.type==="nrpn-datadecrement"?l.type="nrpn-databuttondecrement":l.type==="rpn-dataincrement"?l.type="rpn-databuttonincrement":l.type==="rpn-datadecrement"&&(l.type="rpn-databuttondecrement"),this.emit(l.type,l),r.type=e,r.subtype=o,this.emit(r.type,r)}getChannelModeByNumber(e){return w.validation&&(console.warn("The 'getChannelModeByNumber()' method has been moved to the 'Utilities' class."),e=Math.floor(e)),v.getChannelModeByNumber(e)}getCcNameByNumber(e){if(w.validation&&(console.warn("The 'getCcNameByNumber()' method has been moved to the 'Utilities' class."),e=parseInt(e),!(e>=0&&e<=127)))throw new RangeError("Invalid control change number.");return v.getCcNameByNumber(e)}getNoteState(e){e instanceof Rn&&(e=e.identifier);const t=v.guessNoteNumber(e,w.octaveOffset+this.input.octaveOffset+this.octaveOffset);return this.notesState[t]}get octaveOffset(){return this._octaveOffset}set octaveOffset(e){if(this.validation&&(e=parseInt(e),isNaN(e)))throw new TypeError("The 'octaveOffset' property must be an integer.");this._octaveOffset=e}get input(){return this._input}get number(){return this._number}get nrpnEventsEnabled(){return this.parameterNumberEventsEnabled}set nrpnEventsEnabled(e){this.validation&&(e=!!e),this.parameterNumberEventsEnabled=e}}/**
 * The `Message` class represents a single MIDI message. It has several properties that make it
 * easy to make sense of the binary data it contains.
 *
 * @license Apache-2.0
 * @since 3.0.0
 */class Ao{constructor(e){this.rawData=e,this.data=Array.from(this.rawData),this.statusByte=this.rawData[0],this.rawDataBytes=this.rawData.slice(1),this.dataBytes=this.data.slice(1),this.isChannelMessage=!1,this.isSystemMessage=!1,this.command=void 0,this.channel=void 0,this.manufacturerId=void 0,this.type=void 0,this.statusByte<240?(this.isChannelMessage=!0,this.command=this.statusByte>>4,this.channel=(this.statusByte&15)+1):(this.isSystemMessage=!0,this.command=this.statusByte),this.isChannelMessage?this.type=v.getPropertyByValue(m.CHANNEL_MESSAGES,this.command):this.isSystemMessage&&(this.type=v.getPropertyByValue(m.SYSTEM_MESSAGES,this.command)),this.statusByte===m.SYSTEM_MESSAGES.sysex&&(this.dataBytes[0]===0?(this.manufacturerId=this.dataBytes.slice(0,3),this.dataBytes=this.dataBytes.slice(3,this.rawDataBytes.length-1),this.rawDataBytes=this.rawDataBytes.slice(3,this.rawDataBytes.length-1)):(this.manufacturerId=[this.dataBytes[0]],this.dataBytes=this.dataBytes.slice(1,this.dataBytes.length-1),this.rawDataBytes=this.rawDataBytes.slice(1,this.rawDataBytes.length-1)))}}/**
 * The `Input` class represents a single MIDI input port. This object is automatically instantiated
 * by the library according to the host's MIDI subsystem and does not need to be directly
 * instantiated. Instead, you can access all `Input` objects by referring to the
 * [`WebMidi.inputs`](WebMidi#inputs) array. You can also retrieve inputs by using methods such as
 * [`WebMidi.getInputByName()`](WebMidi#getInputByName) and
 * [`WebMidi.getInputById()`](WebMidi#getInputById).
 *
 * Note that a single MIDI device may expose several inputs and/or outputs.
 *
 * **Important**: the `Input` class does not directly fire channel-specific MIDI messages
 * (such as [`noteon`](InputChannel#event:noteon) or
 * [`controlchange`](InputChannel#event:controlchange), etc.). The [`InputChannel`](InputChannel)
 * object does that. However, you can still use the
 * [`Input.addListener()`](#addListener) method to listen to channel-specific events on multiple
 * [`InputChannel`](InputChannel) objects at once.
 *
 * @fires Input#opened
 * @fires Input#disconnected
 * @fires Input#closed
 * @fires Input#midimessage
 *
 * @fires Input#sysex
 * @fires Input#timecode
 * @fires Input#songposition
 * @fires Input#songselect
 * @fires Input#tunerequest
 * @fires Input#clock
 * @fires Input#start
 * @fires Input#continue
 * @fires Input#stop
 * @fires Input#activesensing
 * @fires Input#reset
 *
 * @fires Input#unknownmidimessage
 *
 * @extends EventEmitter
 * @license Apache-2.0
 */class Xh extends Ie{constructor(e){super(),this._midiInput=e,this._octaveOffset=0,this.channels=[];for(let t=1;t<=16;t++)this.channels[t]=new Qh(this,t);this._forwarders=[],this._midiInput.onstatechange=this._onStateChange.bind(this),this._midiInput.onmidimessage=this._onMidiMessage.bind(this)}async destroy(){this.removeListener(),this.channels.forEach(e=>e.destroy()),this.channels=[],this._forwarders=[],this._midiInput&&(this._midiInput.onstatechange=null,this._midiInput.onmidimessage=null),await this.close(),this._midiInput=null}_onStateChange(e){let t={timestamp:w.time,target:this,port:this};e.port.connection==="open"?(t.type="opened",this.emit("opened",t)):e.port.connection==="closed"&&e.port.state==="connected"?(t.type="closed",this.emit("closed",t)):e.port.connection==="closed"&&e.port.state==="disconnected"?(t.type="disconnected",t.port={connection:e.port.connection,id:e.port.id,manufacturer:e.port.manufacturer,name:e.port.name,state:e.port.state,type:e.port.type},this.emit("disconnected",t)):e.port.connection==="pending"&&e.port.state==="disconnected"||console.warn("This statechange event was not caught: ",e.port.connection,e.port.state)}_onMidiMessage(e){const t=new Ao(e.data),n={port:this,target:this,message:t,timestamp:e.timeStamp,type:"midimessage",data:t.data,rawData:t.data,statusByte:t.data[0],dataBytes:t.dataBytes};this.emit("midimessage",n),t.isSystemMessage?this._parseEvent(n):t.isChannelMessage&&this.channels[t.channel]._processMidiMessageEvent(n),this._forwarders.forEach(s=>s.forward(t))}_parseEvent(e){const t=Object.assign({},e);t.type=t.message.type||"unknownmidimessage",t.type==="songselect"&&(t.song=e.data[1]+1,t.value=e.data[1],t.rawValue=t.value),this.emit(t.type,t)}async open(){try{await this._midiInput.open()}catch(e){return Promise.reject(e)}return Promise.resolve(this)}async close(){if(!this._midiInput)return Promise.resolve(this);try{await this._midiInput.close()}catch(e){return Promise.reject(e)}return Promise.resolve(this)}getChannelModeByNumber(){w.validation&&console.warn("The 'getChannelModeByNumber()' method has been moved to the 'Utilities' class.")}addListener(e,t,n={}){if(w.validation&&typeof n=="function"){let s=t!=null?[].concat(t):void 0;t=n,n={channels:s}}if(m.CHANNEL_EVENTS.includes(e)){n.channels===void 0&&(n.channels=m.MIDI_CHANNEL_NUMBERS);let s=[];return v.sanitizeChannels(n.channels).forEach(r=>{s.push(this.channels[r].addListener(e,t,n))}),s}else return super.addListener(e,t,n)}addOneTimeListener(e,t,n={}){return n.remaining=1,this.addListener(e,t,n)}on(e,t,n,s){return this.addListener(e,t,n,s)}hasListener(e,t,n={}){if(w.validation&&typeof n=="function"){let s=[].concat(t);t=n,n={channels:s}}return m.CHANNEL_EVENTS.includes(e)?(n.channels===void 0&&(n.channels=m.MIDI_CHANNEL_NUMBERS),v.sanitizeChannels(n.channels).every(s=>this.channels[s].hasListener(e,t))):super.hasListener(e,t)}removeListener(e,t,n={}){if(w.validation&&typeof n=="function"){let s=[].concat(t);t=n,n={channels:s}}if(n.channels===void 0&&(n.channels=m.MIDI_CHANNEL_NUMBERS),e==null)return v.sanitizeChannels(n.channels).forEach(s=>{this.channels[s]&&this.channels[s].removeListener()}),super.removeListener();m.CHANNEL_EVENTS.includes(e)?v.sanitizeChannels(n.channels).forEach(s=>{this.channels[s].removeListener(e,t,n)}):super.removeListener(e,t,n)}addForwarder(e,t={}){let n;return e instanceof fr?n=e:n=new fr(e,t),this._forwarders.push(n),n}removeForwarder(e){this._forwarders=this._forwarders.filter(t=>t!==e)}hasForwarder(e){return this._forwarders.includes(e)}get name(){return this._midiInput.name}get id(){return this._midiInput.id}get connection(){return this._midiInput.connection}get manufacturer(){return this._midiInput.manufacturer}get octaveOffset(){return this._octaveOffset}set octaveOffset(e){if(this.validation&&(e=parseInt(e),isNaN(e)))throw new TypeError("The 'octaveOffset' property must be an integer.");this._octaveOffset=e}get state(){return this._midiInput.state}get type(){return this._midiInput.type}get nrpnEventsEnabled(){return w.validation&&console.warn("The 'nrpnEventsEnabled' property has been moved to the 'InputChannel' class."),!1}}/**
 * The `WebMidi` object makes it easier to work with the low-level Web MIDI API. Basically, it
 * simplifies sending outgoing MIDI messages and reacting to incoming MIDI messages.
 *
 * When using the WebMidi.js library, you should know that the `WebMidi` class has already been
 * instantiated. You cannot instantiate it yourself. If you use the **IIFE** version, you should
 * simply use the global object called `WebMidi`. If you use the **CJS** (CommonJS) or **ESM** (ES6
 * module) version, you get an already-instantiated object when you import the module.
 *
 * @fires WebMidi#connected
 * @fires WebMidi#disabled
 * @fires WebMidi#disconnected
 * @fires WebMidi#enabled
 * @fires WebMidi#error
 * @fires WebMidi#midiaccessgranted
 * @fires WebMidi#portschanged
 *
 * @extends EventEmitter
 * @license Apache-2.0
 */class Jh extends Ie{constructor(){super(),this.defaults={note:{attack:v.from7bitToFloat(64),release:v.from7bitToFloat(64),duration:1/0}},this.interface=null,this.validation=!0,this._inputs=[],this._disconnectedInputs=[],this._outputs=[],this._disconnectedOutputs=[],this._stateChangeQueue=[],this._octaveOffset=0}async enable(e={},t=!1){if(v.isNode)try{window.navigator}catch{let l=await Object.getPrototypeOf(async function(){}).constructor(`
        let jzz = await import("jzz");
        return jzz.default;
        `)();global.navigator||(global.navigator={}),Object.assign(global.navigator,l)}if(this.validation=e.validation!==!1,this.validation&&(typeof e=="function"&&(e={callback:e,sysex:t}),t&&(e.sysex=!0)),this.enabled)return typeof e.callback=="function"&&e.callback(),Promise.resolve();const n={timestamp:this.time,target:this,type:"error",error:void 0},s={timestamp:this.time,target:this,type:"midiaccessgranted"},r={timestamp:this.time,target:this,type:"enabled"};try{typeof e.requestMIDIAccessFunction=="function"?this.interface=await e.requestMIDIAccessFunction({sysex:e.sysex,software:e.software}):this.interface=await navigator.requestMIDIAccess({sysex:e.sysex,software:e.software})}catch(o){return n.error=o,this.emit("error",n),typeof e.callback=="function"&&e.callback(o),Promise.reject(o)}this.emit("midiaccessgranted",s),this.interface.onstatechange=this._onInterfaceStateChange.bind(this);try{await this._updateInputsAndOutputs()}catch(o){return n.error=o,this.emit("error",n),typeof e.callback=="function"&&e.callback(o),Promise.reject(o)}return this.emit("enabled",r),typeof e.callback=="function"&&e.callback(),Promise.resolve(this)}async disable(){return this.interface&&(this.interface.onstatechange=void 0),this._destroyInputsAndOutputs().then(()=>{navigator&&typeof navigator.close=="function"&&navigator.close(),this.interface=null;let e={timestamp:this.time,target:this,type:"disabled"};this.emit("disabled",e),this.removeListener()})}getInputById(e,t={disconnected:!1}){if(this.validation){if(!this.enabled)throw new Error("WebMidi is not enabled.");if(!e)return}if(t.disconnected){for(let n=0;n<this._disconnectedInputs.length;n++)if(this._disconnectedInputs[n]._midiInput&&this._disconnectedInputs[n].id===e.toString())return this._disconnectedInputs[n]}else for(let n=0;n<this.inputs.length;n++)if(this.inputs[n]._midiInput&&this.inputs[n].id===e.toString())return this.inputs[n]}getInputByName(e,t={disconnected:!1}){if(this.validation){if(!this.enabled)throw new Error("WebMidi is not enabled.");if(!e)return;e=e.toString()}if(t.disconnected){for(let n=0;n<this._disconnectedInputs.length;n++)if(~this._disconnectedInputs[n].name.indexOf(e))return this._disconnectedInputs[n]}else for(let n=0;n<this.inputs.length;n++)if(~this.inputs[n].name.indexOf(e))return this.inputs[n]}getOutputByName(e,t={disconnected:!1}){if(this.validation){if(!this.enabled)throw new Error("WebMidi is not enabled.");if(!e)return;e=e.toString()}if(t.disconnected){for(let n=0;n<this._disconnectedOutputs.length;n++)if(~this._disconnectedOutputs[n].name.indexOf(e))return this._disconnectedOutputs[n]}else for(let n=0;n<this.outputs.length;n++)if(~this.outputs[n].name.indexOf(e))return this.outputs[n]}getOutputById(e,t={disconnected:!1}){if(this.validation){if(!this.enabled)throw new Error("WebMidi is not enabled.");if(!e)return}if(t.disconnected){for(let n=0;n<this._disconnectedOutputs.length;n++)if(this._disconnectedOutputs[n]._midiOutput&&this._disconnectedOutputs[n].id===e.toString())return this._disconnectedOutputs[n]}else for(let n=0;n<this.outputs.length;n++)if(this.outputs[n]._midiOutput&&this.outputs[n].id===e.toString())return this.outputs[n]}noteNameToNumber(e){return this.validation&&console.warn("The noteNameToNumber() method is deprecated. Use Utilities.toNoteNumber() instead."),v.toNoteNumber(e,this.octaveOffset)}getOctave(e){return this.validation&&(console.warn("The getOctave()is deprecated. Use Utilities.getNoteDetails() instead"),e=parseInt(e)),!isNaN(e)&&e>=0&&e<=127?v.getNoteDetails(v.offsetNumber(e,this.octaveOffset)).octave:!1}sanitizeChannels(e){return this.validation&&console.warn("The sanitizeChannels() method has been moved to the utilities class."),v.sanitizeChannels(e)}toMIDIChannels(e){return this.validation&&console.warn("The toMIDIChannels() method has been deprecated. Use Utilities.sanitizeChannels() instead."),v.sanitizeChannels(e)}guessNoteNumber(e){return this.validation&&console.warn("The guessNoteNumber() method has been deprecated. Use Utilities.guessNoteNumber() instead."),v.guessNoteNumber(e,this.octaveOffset)}getValidNoteArray(e,t={}){return this.validation&&console.warn("The getValidNoteArray() method has been moved to the Utilities.buildNoteArray()"),v.buildNoteArray(e,t)}convertToTimestamp(e){return this.validation&&console.warn("The convertToTimestamp() method has been moved to Utilities.toTimestamp()."),v.toTimestamp(e)}async _destroyInputsAndOutputs(){let e=[];return this.inputs.forEach(t=>e.push(t.destroy())),this.outputs.forEach(t=>e.push(t.destroy())),Promise.all(e).then(()=>{this._inputs=[],this._outputs=[]})}_onInterfaceStateChange(e){if(!this.enabled)return;this._updateInputsAndOutputs();let t={timestamp:e.timeStamp,type:e.port.state,target:this};if(e.port.state==="connected"&&e.port.connection==="open"){e.port.type==="output"?t.port=this.getOutputById(e.port.id):e.port.type==="input"&&(t.port=this.getInputById(e.port.id)),this.emit(e.port.state,t);const n=Object.assign({},t);n.type="portschanged",this.emit(n.type,n)}else if(e.port.state==="disconnected"&&e.port.connection==="pending"){e.port.type==="input"?t.port=this.getInputById(e.port.id,{disconnected:!0}):e.port.type==="output"&&(t.port=this.getOutputById(e.port.id,{disconnected:!0})),this.emit(e.port.state,t);const n=Object.assign({},t);n.type="portschanged",this.emit(n.type,n)}}async _updateInputsAndOutputs(){return Promise.all([this._updateInputs(),this._updateOutputs()])}async _updateInputs(){if(!this.interface)return;for(let t=this._inputs.length-1;t>=0;t--){const n=this._inputs[t];Array.from(this.interface.inputs.values()).find(r=>r===n._midiInput)||(this._disconnectedInputs.push(n),this._inputs.splice(t,1))}let e=[];return this.interface.inputs.forEach(t=>{if(!this._inputs.find(n=>n._midiInput===t)){let n=this._disconnectedInputs.find(s=>s._midiInput===t);n||(n=new Xh(t)),this._inputs.push(n),e.push(n.open())}}),Promise.all(e)}async _updateOutputs(){if(!this.interface)return;for(let t=this._outputs.length-1;t>=0;t--){const n=this._outputs[t];Array.from(this.interface.outputs.values()).find(r=>r===n._midiOutput)||(this._disconnectedOutputs.push(n),this._outputs.splice(t,1))}let e=[];return this.interface.outputs.forEach(t=>{if(!this._outputs.find(n=>n._midiOutput===t)){let n=this._disconnectedOutputs.find(s=>s._midiOutput===t);n||(n=new Na(t)),this._outputs.push(n),e.push(n.open())}}),Promise.all(e)}get enabled(){return this.interface!==null}get inputs(){return this._inputs}get isNode(){return this.validation&&console.warn("WebMidi.isNode has been deprecated. Use Utilities.isNode instead."),v.isNode}get isBrowser(){return this.validation&&console.warn("WebMidi.isBrowser has been deprecated. Use Utilities.isBrowser instead."),v.isBrowser}get octaveOffset(){return this._octaveOffset}set octaveOffset(e){if(this.validation&&(e=parseInt(e),isNaN(e)))throw new TypeError("The 'octaveOffset' property must be an integer.");this._octaveOffset=e}get outputs(){return this._outputs}get supported(){return typeof navigator<"u"&&!!navigator.requestMIDIAccess}get sysexEnabled(){return!!(this.interface&&this.interface.sysexEnabled)}get time(){return performance.now()}get version(){return"3.1.16"}get flavour(){return"esm"}get CHANNEL_EVENTS(){return this.validation&&console.warn("The CHANNEL_EVENTS enum has been moved to Enumerations.CHANNEL_EVENTS."),m.CHANNEL_EVENTS}get MIDI_SYSTEM_MESSAGES(){return this.validation&&console.warn("The MIDI_SYSTEM_MESSAGES enum has been moved to Enumerations.SYSTEM_MESSAGES."),m.SYSTEM_MESSAGES}get MIDI_CHANNEL_MODE_MESSAGES(){return this.validation&&console.warn("The MIDI_CHANNEL_MODE_MESSAGES enum has been moved to Enumerations.CHANNEL_MODE_MESSAGES."),m.CHANNEL_MODE_MESSAGES}get MIDI_CONTROL_CHANGE_MESSAGES(){return this.validation&&console.warn("The MIDI_CONTROL_CHANGE_MESSAGES enum has been replaced by the Enumerations.CONTROL_CHANGE_MESSAGES array."),m.MIDI_CONTROL_CHANGE_MESSAGES}get MIDI_REGISTERED_PARAMETER(){return this.validation&&console.warn("The MIDI_REGISTERED_PARAMETER enum has been moved to Enumerations.REGISTERED_PARAMETERS."),m.REGISTERED_PARAMETERS}get NOTES(){return this.validation&&console.warn("The NOTES enum has been deprecated."),["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]}}const w=new Jh;w.constructor=null;var Po=i=>{throw TypeError(i)},Fa=(i,e,t)=>e.has(i)||Po("Cannot "+t),J=(i,e,t)=>(Fa(i,e,"read from private field"),t?t.call(i):e.get(i)),jt=(i,e,t)=>e.has(i)?Po("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(i):e.set(i,t),ec=(i,e,t,n)=>(Fa(i,e,"write to private field"),e.set(i,t),t),et=(i,e,t)=>(Fa(i,e,"access private method"),t);function ka(){return typeof navigator<"u"&&typeof navigator.requestMIDIAccess=="function"}function mr(){const i=navigator.userAgent,e=/Chrome/.test(i)&&/Google Inc/.test(navigator.vendor||""),t=/Edg/.test(i),n=/OPR/.test(i),s=/Safari/.test(i)&&!/Chrome/.test(i),r=/Firefox/.test(i);let o="Unknown";e?o="Chrome":t?o="Edge":n?o="Opera":s?o="Safari":r&&(o="Firefox");const l=ka();let h="";return l||(s?h="Safari doesn't support Web MIDI API. Use Chrome, Edge, or Opera for MIDI functionality.":r?h="Firefox has limited Web MIDI API support. Use Chrome, Edge, or Opera for full MIDI functionality.":h="Web MIDI API not supported in this browser."),{supported:l,browserName:o,message:h}}var gi,Pi,_i,Vn,Ln,Ce,_o,Ys,gr,br,bi;class tc{constructor(){jt(this,Ce),jt(this,gi,!1),jt(this,Pi,new Set),jt(this,_i,new Set),jt(this,Vn,new Set),jt(this,Ln,new Set)}async init(){if(J(this,gi))return!0;if(!ka()){const{browserName:e,message:t}=mr();return console.warn(`InputController: ${t} (Browser: ${e})`),!1}try{await w.enable()}catch(e){return console.warn("InputController: WebMIDI enable failed",e),!1}return w.enabled?(ec(this,gi,!0),et(this,Ce,_o).call(this),!0):(console.warn("InputController: WebMIDI not enabled"),!1)}onNoteOn(e){return J(this,Pi).add(e),()=>J(this,Pi).delete(e)}onNoteOff(e){return J(this,_i).add(e),()=>J(this,_i).delete(e)}onControlChange(e){return J(this,Vn).add(e),()=>J(this,Vn).delete(e)}onSustainPedal(e){return J(this,Ln).add(e),()=>J(this,Ln).delete(e)}registerNoteTarget(e,t="all"){const n=this.onNoteOn(r=>{et(this,Ce,bi).call(this,t,r.channel)&&e.play(r.note,r.velocity??0)}),s=this.onNoteOff(r=>{et(this,Ce,bi).call(this,t,r.channel)&&e.release(r.note)});return()=>{n(),s()}}registerControlTarget(e,t){const n=Array.isArray(e)?e:[e],s=Array.isArray(t.controller)?t.controller:[t.controller],r=t.channel??"all",o=t.transformValue??(l=>l.normalizedValue);return this.onControlChange(l=>{if(!s.includes(l.controller)||!et(this,Ce,bi).call(this,r,l.channel))return;const h=o(l);n.forEach(c=>{typeof c=="function"?c(h,l):"onControlChange"in c?c.onControlChange(h,l):"setValueNormalized"in c&&c.setValueNormalized?c.setValueNormalized(h):"setValue"in c&&c.setValue&&c.setValue(h)})})}registerSustainPedalTarget(e,t="all"){return this.onSustainPedal(n=>{et(this,Ce,bi).call(this,t,n.channel)&&e.setSustainPedal(n.pressed)})}get initialized(){return J(this,gi)}get midiSupported(){return ka()}get supportInfo(){return mr()}}gi=new WeakMap,Pi=new WeakMap,_i=new WeakMap,Vn=new WeakMap,Ln=new WeakMap,Ce=new WeakSet,_o=function(){w.inputs.forEach(i=>{i&&(i.addListener("noteon",e=>{et(this,Ce,Ys).call(this,J(this,Pi),e,"noteon")}),i.addListener("noteoff",e=>{et(this,Ce,Ys).call(this,J(this,_i),e,"noteoff")}),i.addListener("controlchange",e=>{var t,n;(((t=e.controller)==null?void 0:t.number)??((n=e.controller)==null?void 0:n.value)??0)===64?et(this,Ce,br).call(this,e):et(this,Ce,gr).call(this,e)}))})},Ys=function(i,e,t){var n,s,r,o;if(!i.size)return;const l={type:t,note:((n=e.note)==null?void 0:n.number)??0,velocity:((s=e.note)==null?void 0:s.rawAttack)??(typeof e.velocity=="number"?e.velocity:((r=e.note)==null?void 0:r.attack)??0),channel:((o=e.message)==null?void 0:o.channel)??1,raw:e};i.forEach(h=>h(l))},gr=function(i){var e,t,n;if(!J(this,Vn).size)return;const s={type:"controlchange",controller:((e=i.controller)==null?void 0:e.number)??((t=i.controller)==null?void 0:t.value)??(typeof i.controller=="number"?i.controller:0),normalizedValue:typeof i.value=="number"?i.value:typeof i.rawValue=="number"?i.rawValue/127:0,midiValue:typeof i.rawValue=="number"?i.rawValue:typeof i.value=="number"?Math.round(i.value*127):0,channel:((n=i.message)==null?void 0:n.channel)??1,raw:i};J(this,Vn).forEach(r=>r(s))},br=function(i){var e;if(!J(this,Ln).size)return;const t={type:"sustainpedal",pressed:(typeof i.rawValue=="number"?i.rawValue:typeof i.value=="number"?Math.round(i.value*127):0)>=64,channel:((e=i.message)==null?void 0:e.channel)??1,raw:i};J(this,Ln).forEach(n=>n(t))},bi=function(i,e){return i==="all"?!0:typeof e!="number"?!1:i===e};const Cc=new tc;let tt=Object.getPrototypeOf,Ti,Ni,we,Bt,To={isConnected:1},nc=1e3,Fi,Zs={},ic=tt(To),No=tt(tt),Fn,ko=(i,e,t,n)=>(i??(n?setTimeout(t,n):queueMicrotask(t),new Set)).add(e),Do=(i,e,t)=>{let n=we;we=e;try{return i(t)}catch(s){return console.error(s),t}finally{we=n}},Os=i=>i.filter(e=>{var t;return(t=e._dom)==null?void 0:t.isConnected}),Ro=i=>Fi=ko(Fi,i,()=>{for(let e of Fi)e._bindings=Os(e._bindings),e._listeners=Os(e._listeners);Fi=Fn},nc),Vs={get val(){var i;return(i=we==null?void 0:we._getters)==null||i.add(this),this.rawVal},get oldVal(){var i;return(i=we==null?void 0:we._getters)==null||i.add(this),this._oldVal},set val(i){var e;(e=we==null?void 0:we._setters)==null||e.add(this),i!==this.rawVal&&(this.rawVal=i,this._bindings.length+this._listeners.length?(Ni==null||Ni.add(this),Ti=ko(Ti,this,sc)):this._oldVal=i)}},Co=i=>({__proto__:Vs,rawVal:i,_oldVal:i,_bindings:[],_listeners:[]}),Ii=(i,e)=>{let t={_getters:new Set,_setters:new Set},n={f:i},s=Bt;Bt=[];let r=Do(i,t,e);r=(r??document).nodeType?r:new Text(r);for(let o of t._getters)t._setters.has(o)||(Ro(o),o._bindings.push(n));for(let o of Bt)o._dom=r;return Bt=s,n._dom=r},Ba=(i,e=Co(),t)=>{let n={_getters:new Set,_setters:new Set},s={f:i,s:e};s._dom=t??(Bt==null?void 0:Bt.push(s))??To,e.val=Do(i,n,e.rawVal);for(let r of n._getters)n._setters.has(r)||(Ro(r),r._listeners.push(s));return e},Io=(i,...e)=>{for(let t of e.flat(1/0)){let n=tt(t??0),s=n===Vs?Ii(()=>t.val):n===No?Ii(t):t;s!=Fn&&i.append(s)}return i},xo=(i,e,...t)=>{var l,h,c;let[{is:n,...s},...r]=tt(t[0]??0)===ic?t:[{},...t],o=i?document.createElementNS(i,e,{is:n}):document.createElement(e,{is:n});for(let[f,d]of Object.entries(s)){let g=P=>P&&(Object.getOwnPropertyDescriptor(P,f)??g(tt(P))),M=!i&&!n&&!e.includes("-")?Zs[h=e+","+f]??(Zs[h]=((l=g(tt(o)))==null?void 0:l.set)??0):(c=g(tt(o)))==null?void 0:c.set,E=f.startsWith("on"),A=E?(P,R)=>{let z=f.slice(2);o.removeEventListener(z,R),o.addEventListener(z,P)}:M?M.bind(o):o.setAttribute.bind(o,f),S=tt(d??0);E||S===No&&(d=Ba(d),S=Vs),S===Vs?Ii(()=>(A(d.val,d._oldVal),o)):A(d)}return Io(o,r)},yr=i=>({get:(e,t)=>xo.bind(Fn,i,t)}),Oo=(i,e)=>e?e!==i&&i.replaceWith(e):i.remove(),sc=()=>{let i=100,e=[...Ti].filter(n=>n.rawVal!==n._oldVal);do{Ni=new Set;for(let n of new Set(e.flatMap(s=>s._listeners=Os(s._listeners))))Ba(n.f,n.s,n._dom),n._dom=Fn}while(--i&&(e=[...Ni]).length);let t=[...Ti].filter(n=>n.rawVal!==n._oldVal);Ti=Fn;for(let n of new Set(t.flatMap(s=>s._bindings=Os(s._bindings))))Oo(n._dom,Ii(n.f,n._dom)),n._dom=Fn;for(let n of t)n._oldVal=n.rawVal};const Ic={tags:new Proxy(i=>new Proxy(xo,yr(i)),yr()),hydrate:(i,e)=>Oo(i,Ii(e,i)),add:Io,state:Co,derive:Ba};try{self["workbox:window:7.4.0"]&&_()}catch{}function Da(i,e){return new Promise((function(t){var n=new MessageChannel;n.port1.onmessage=function(s){t(s.data)},i.postMessage(e,[n.port2])}))}function vr(i,e){(e==null||e>i.length)&&(e=i.length);for(var t=0,n=Array(e);t<e;t++)n[t]=i[t];return n}function ac(i,e,t){return e&&(function(n,s){for(var r=0;r<s.length;r++){var o=s[r];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(n,oc(o.key),o)}})(i.prototype,e),Object.defineProperty(i,"prototype",{writable:!1}),i}function rc(i,e){var t=typeof Symbol<"u"&&i[Symbol.iterator]||i["@@iterator"];if(t)return(t=t.call(i)).next.bind(t);if(Array.isArray(i)||(t=(function(s,r){if(s){if(typeof s=="string")return vr(s,r);var o={}.toString.call(s).slice(8,-1);return o==="Object"&&s.constructor&&(o=s.constructor.name),o==="Map"||o==="Set"?Array.from(s):o==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o)?vr(s,r):void 0}})(i))||e){t&&(i=t);var n=0;return function(){return n>=i.length?{done:!0}:{done:!1,value:i[n++]}}}throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Ra(i,e){return Ra=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,n){return t.__proto__=n,t},Ra(i,e)}function oc(i){var e=(function(t,n){if(typeof t!="object"||!t)return t;var s=t[Symbol.toPrimitive];if(s!==void 0){var r=s.call(t,n);if(typeof r!="object")return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)})(i,"string");return typeof e=="symbol"?e:e+""}try{self["workbox:core:7.4.0"]&&_()}catch{}var Qs=function(){var i=this;this.promise=new Promise((function(e,t){i.resolve=e,i.reject=t}))};function Xs(i,e){var t=location.href;return new URL(i,t).href===new URL(e,t).href}var Mn=function(i,e){this.type=i,Object.assign(this,e)};function st(i,e,t){return i&&i.then||(i=Promise.resolve(i)),e?i.then(e):i}function lc(){}var hc={type:"SKIP_WAITING"};function wr(i,e){return i&&i.then?i.then(lc):Promise.resolve()}var cc=(function(i){function e(r,o){var l,h;return o===void 0&&(o={}),(l=i.call(this)||this).nn={},l.tn=0,l.rn=new Qs,l.en=new Qs,l.on=new Qs,l.un=0,l.an=new Set,l.cn=function(){var c=l.fn,f=c.installing;l.tn>0||!Xs(f.scriptURL,l.sn.toString())||performance.now()>l.un+6e4?(l.vn=f,c.removeEventListener("updatefound",l.cn)):(l.hn=f,l.an.add(f),l.rn.resolve(f)),++l.tn,f.addEventListener("statechange",l.ln)},l.ln=function(c){var f=l.fn,d=c.target,g=d.state,M=d===l.vn,E={sw:d,isExternal:M,originalEvent:c};!M&&l.mn&&(E.isUpdate=!0),l.dispatchEvent(new Mn(g,E)),g==="installed"?l.wn=self.setTimeout((function(){g==="installed"&&f.waiting===d&&l.dispatchEvent(new Mn("waiting",E))}),200):g==="activating"&&(clearTimeout(l.wn),M||l.en.resolve(d))},l.yn=function(c){var f=l.hn,d=f!==navigator.serviceWorker.controller;l.dispatchEvent(new Mn("controlling",{isExternal:d,originalEvent:c,sw:f,isUpdate:l.mn})),d||l.on.resolve(f)},l.gn=(h=function(c){var f=c.data,d=c.ports,g=c.source;return st(l.getSW(),(function(){l.an.has(g)&&l.dispatchEvent(new Mn("message",{data:f,originalEvent:c,ports:d,sw:g}))}))},function(){for(var c=[],f=0;f<arguments.length;f++)c[f]=arguments[f];try{return Promise.resolve(h.apply(this,c))}catch(d){return Promise.reject(d)}}),l.sn=r,l.nn=o,navigator.serviceWorker.addEventListener("message",l.gn),l}var t,n;n=i,(t=e).prototype=Object.create(n.prototype),t.prototype.constructor=t,Ra(t,n);var s=e.prototype;return s.register=function(r){var o=(r===void 0?{}:r).immediate,l=o!==void 0&&o;try{var h=this;return st((function(c,f){var d=c();return d&&d.then?d.then(f):f(d)})((function(){if(!l&&document.readyState!=="complete")return wr(new Promise((function(c){return window.addEventListener("load",c)})))}),(function(){return h.mn=!!navigator.serviceWorker.controller,h.dn=h.pn(),st(h.bn(),(function(c){h.fn=c,h.dn&&(h.hn=h.dn,h.en.resolve(h.dn),h.on.resolve(h.dn),h.dn.addEventListener("statechange",h.ln,{once:!0}));var f=h.fn.waiting;return f&&Xs(f.scriptURL,h.sn.toString())&&(h.hn=f,Promise.resolve().then((function(){h.dispatchEvent(new Mn("waiting",{sw:f,wasWaitingBeforeRegister:!0}))})).then((function(){}))),h.hn&&(h.rn.resolve(h.hn),h.an.add(h.hn)),h.fn.addEventListener("updatefound",h.cn),navigator.serviceWorker.addEventListener("controllerchange",h.yn),h.fn}))})))}catch(c){return Promise.reject(c)}},s.update=function(){try{return this.fn?st(wr(this.fn.update())):st()}catch(r){return Promise.reject(r)}},s.getSW=function(){return this.hn!==void 0?Promise.resolve(this.hn):this.rn.promise},s.messageSW=function(r){try{return st(this.getSW(),(function(o){return Da(o,r)}))}catch(o){return Promise.reject(o)}},s.messageSkipWaiting=function(){this.fn&&this.fn.waiting&&Da(this.fn.waiting,hc)},s.pn=function(){var r=navigator.serviceWorker.controller;return r&&Xs(r.scriptURL,this.sn.toString())?r:void 0},s.bn=function(){try{var r=this;return st((function(o,l){try{var h=o()}catch(c){return l(c)}return h&&h.then?h.then(void 0,l):h})((function(){return st(navigator.serviceWorker.register(r.sn,r.nn),(function(o){return r.un=performance.now(),o}))}),(function(o){throw o})))}catch(o){return Promise.reject(o)}},ac(e,[{key:"active",get:function(){return this.en.promise}},{key:"controlling",get:function(){return this.on.promise}}])})((function(){function i(){this.Pn=new Map}var e=i.prototype;return e.addEventListener=function(t,n){this.jn(t).add(n)},e.removeEventListener=function(t,n){this.jn(t).delete(n)},e.dispatchEvent=function(t){t.target=this;for(var n,s=rc(this.jn(t.type));!(n=s()).done;)(0,n.value)(t)},e.jn=function(t){return this.Pn.has(t)||this.Pn.set(t,new Set),this.Pn.get(t)},i})());const xc=Object.freeze(Object.defineProperty({__proto__:null,Workbox:cc,WorkboxEvent:Mn,messageSW:Da},Symbol.toStringTag,{value:"Module"}));export{Ec as A,Ic as B,Dc as C,Nc as D,gc as E,pc as F,xc as G,Pc as J,Sc as K,mr as O,wc as P,fc as S,Cc as U,Ac as X,Ca as a,Sr as b,Rc as c,ea as d,ki as e,il as f,bc as g,vc as h,ia as i,el as j,dc as k,Wo as l,mc as m,sl as n,uc as o,yc as p,oh as q,Cn as r,na as s,Ht as t,ol as u,_c as v,kc as w,rl as x,Mc as y,Tc as z};
//# sourceMappingURL=vendor-CPfRUSSD.js.map
