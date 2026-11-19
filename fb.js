/* 训练日记 · Firebase 适配层:把 Google 登录 + Firestore 包装成 app 原来使用的 window.claude.use("db"/"user"/"downloads") 接口 */
(function(){
var cfg={apiKey:"AIzaSyCZ_JivTmFUefI0YH4UNO6wn-08vvqM5gM",authDomain:"training-diary-aabb4.firebaseapp.com",projectId:"training-diary-aabb4",storageBucket:"training-diary-aabb4.firebasestorage.app",messagingSenderId:"950111810851",appId:"1:950111810851:web:acd609def0ec4f1a754896"};
var FBOK=typeof firebase!=="undefined";
var auth=null,fs=null;
if(FBOK){try{firebase.initializeApp(cfg);auth=firebase.auth();fs=firebase.firestore();
  try{fs.settings({ignoreUndefinedProperties:true,merge:true})}catch(e){}
  try{fs.enablePersistence({synchronizeTabs:true}).catch(function(){})}catch(e){}
}catch(e){FBOK=false}}
/* Firestore 不允许空字段名,这里存取时转换 */
var E="_e_";
function enc(x){if(Array.isArray(x))return x.map(enc);if(x&&typeof x==="object"){var o={};for(var k in x){if(x[k]===undefined)continue;o[k===""?E:k]=enc(x[k])}return o}return x}
function dec(x){if(Array.isArray(x))return x.map(dec);if(x&&typeof x==="object"&&!(x.toDate&&x.seconds!=null)){var o={};for(var k in x)o[k===E?"":k]=dec(x[k]);return o}return x}
function wDS(s){return{id:s.id,exists:s.exists,data:function(){return s.exists?dec(s.data()):undefined},ref:wDoc(s.ref)}}
function wQS(q){var ds=q.docs.map(wDS);return{docs:ds,size:ds.length,empty:!ds.length,forEach:function(f){ds.forEach(f)}}}
function wDoc(r){return{id:r.id,path:r.path,
  get:function(){return r.get().then(wDS)},
  set:function(d,o){return o?r.set(enc(d),o):r.set(enc(d))},
  update:function(d){return r.set(enc(d),{merge:true})},
  delete:function(){return r.delete()},
  collection:function(c){return wCol(r.collection(c))},
  onSnapshot:function(cb,er){return r.onSnapshot(function(s){cb(wDS(s))},er||function(){})}}}
function wCol(q){return{path:q.path,
  doc:function(id){return wDoc(id?q.doc(id):q.doc())},
  where:function(f,op,v){return wCol(q.where(f,op,v))},
  orderBy:function(f,d){return wCol(q.orderBy(f,d||"asc"))},
  limit:function(n){return wCol(q.limit(n))},
  add:function(d){return q.add(enc(d)).then(wDoc)},
  get:function(){return q.get().then(wQS)},
  onSnapshot:function(cb,er){return q.onSnapshot(function(s){cb(wQS(s))},er||function(){})}}}
var db=FBOK?{collection:function(p){return wCol(fs.collection(p))},doc:function(p){return wDoc(fs.doc(p))}}:null;

/* ---------- 登录 ---------- */
var resolveU,userP=new Promise(function(r){resolveU=r});
var cur=null;
function el(id){return document.getElementById(id)}
function showLogin(){var o=el("fbLogin");if(o){o.hidden=false;return}
  o=document.createElement("div");o.id="fbLogin";
  o.innerHTML='<div class="fbl-card"><div class="fbl-logo">🏋️</div><h1>训练日记</h1><p>记录每一次训练,看见每一点进步</p><button id="fbGo" type="button"><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>用 Google 账号登录</button><div id="fbErr" role="alert"></div></div>';
  document.body.appendChild(o);
  el("fbGo").onclick=function(){var p=new firebase.auth.GoogleAuthProvider();p.setCustomParameters({prompt:"select_account"});el("fbErr").textContent="";
    auth.signInWithPopup(p).catch(function(e){var c=e&&e.code||"";
      if(c==="auth/popup-blocked"||c==="auth/operation-not-supported-in-this-environment"){auth.signInWithRedirect(p);return}
      if(c==="auth/popup-closed-by-user"||c==="auth/cancelled-popup-request")return;
      el("fbErr").textContent="登录没成功,请再试一次。("+c+")"})}}
function hideLogin(){var o=el("fbLogin");if(o)o.hidden=true}
if(FBOK){auth.getRedirectResult().catch(function(){});
  auth.onAuthStateChanged(function(u){cur=u;if(u){hideLogin();resolveU(u);
    fs.doc("profiles/"+u.uid).set({name:u.displayName||"",photo:u.photoURL||"",t:Date.now()},{merge:true}).catch(function(){})}
    else{var go=function(){showLogin()};document.body?go():document.addEventListener("DOMContentLoaded",go)}})}

var names={};
var user={
  id:function(){return userP.then(function(u){return u.uid})},
  me:function(){return userP.then(function(u){return{id:u.uid,name:u.displayName||"",email:u.email||""}})},
  isOwner:function(){return Promise.resolve(true)},isOwnerSync:true,
  canEdit:function(){return true},can:function(){return true},
  profiles:function(ids){return Promise.all(ids.map(function(id){
    if(names[id])return Promise.resolve([id,names[id]]);
    return fs.doc("profiles/"+id).get().then(function(s){var n=s.exists&&s.data().name||"";if(n)names[id]=n;return[id,n]},function(){return[id,""]})}))
    .then(function(a){var o={};a.forEach(function(x){o[x[0]]={name:x[1]}});return o})}};

var downloads={save:function(o){try{var b=o.data instanceof Blob?o.data:new Blob([o.data],{type:/\.json$/i.test(o.filename)?"application/json":/\.csv$/i.test(o.filename)?"text/csv":"application/octet-stream"});
  var f=null;try{f=new File([b],o.filename,{type:b.type})}catch(e){}
  if(f&&navigator.canShare&&navigator.canShare({files:[f]})&&/iPhone|iPad|Android/i.test(navigator.userAgent)){
    return navigator.share({files:[f],title:o.filename}).then(function(){return{status:"saved"}},function(e){var x=new Error("declined");x.code=e&&e.name==="AbortError"?"declined":"unavailable";throw x})}
  var u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=o.filename;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(u);a.remove()},4000);return Promise.resolve({status:"saved"})}
  catch(e){var x=new Error("failed");x.code="unavailable";return Promise.reject(x)}}};

window.FB={ok:FBOK,user:function(){return cur},
  logout:function(){try{localStorage.removeItem("tl_lastuid")}catch(e){}auth.signOut().then(function(){location.reload()})}};
window.claude={use:function(n){
  if(n==="downloads")return Promise.resolve(downloads);
  if(!FBOK)return Promise.resolve(null);
  if(n==="db")return userP.then(function(){return db});
  if(n==="user")return userP.then(function(){return user});
  return Promise.resolve(null)}};
if("serviceWorker" in navigator&&location.protocol==="https:")window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){})});
})();
/* 状态栏/导航栏颜色跟随当前皮肤的背景色,避免安装后出现蓝边 */
(function(){function bg(){var els=[document.body,document.documentElement];for(var i=0;i<els.length;i++){if(!els[i])continue;var c=getComputedStyle(els[i]).backgroundColor;if(c&&c!=="transparent"&&!/rgba\(.*,\s*0\)$/.test(c))return c}return "#F1F3F5"}
  function sync(){var m=document.querySelector('meta[name="theme-color"]');if(!m){m=document.createElement("meta");m.name="theme-color";document.head.appendChild(m)}var c=bg();if(m.content!==c)m.content=c}
  function start(){sync();var mo=new MutationObserver(function(){clearTimeout(start.t);start.t=setTimeout(sync,50)});mo.observe(document.documentElement,{attributes:true,attributeFilter:["class","style","data-skin","data-theme"]});if(document.body)mo.observe(document.body,{attributes:true,attributeFilter:["class","style","data-skin","data-theme"]});setInterval(sync,3000)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start()})();
