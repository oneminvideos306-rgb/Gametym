const express=require('express'),http=require('http'),fs=require('fs'),crypto=require('crypto'),{WebSocketServer}=require('ws');
const {G,daily}=require('./public/games.js');
const app=express(),srv=http.createServer(app),wss=new WebSocketServer({server:srv,maxPayload:8192});
const ADMIN=process.env.ADMIN_KEY,UP=process.env.UPSTASH_REDIS_REST_URL,UT=process.env.UPSTASH_REDIS_REST_TOKEN;
let db={users:{},tokens:{}},dirty=0;
const rest=async c=>(await(await fetch(UP,{method:'POST',headers:{Authorization:'Bearer '+UT},body:JSON.stringify(c)})).json()).result;
async function flush(){const j=JSON.stringify(db);try{if(UP)await rest(['SET','gametym',j]);else fs.writeFileSync('data.json',j);dirty=0}catch(e){console.log('save failed',e.message)}}
(async()=>{try{if(UP){const v=await rest(['GET','gametym']);if(v)db=JSON.parse(v)}else db=JSON.parse(fs.readFileSync('data.json'))}catch(e){}})();
setInterval(()=>{if(dirty)flush()},20000);
for(const sg of['SIGTERM','SIGINT'])process.on(sg,async()=>{await flush();process.exit(0)});
const touch=()=>{dirty=1},tx=(x,o)=>x&&x.readyState==1&&x.send(JSON.stringify(o));
const hash=(p,salt=crypto.randomBytes(8).toString('hex'))=>salt+':'+crypto.scryptSync(p,salt,32).toString('hex');
const chk=(p,h)=>{const[s,x]=h.split(':');return hash(p,s).split(':')[1]===x};
const newUser=(name,pass)=>({name,pass:pass?hash(pass):null,xp:0,wins:0,played:0,gw:{},hist:[],friends:[],made:Date.now()});
const pub=u=>({name:u.name,xp:u.xp,wins:u.wins,played:u.played,gw:u.gw,hist:u.hist.slice(0,10),guest:!u.pass,friends:u.friends.length});
const rooms={},online={},esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const MAXP={snl:4,ludo:4,chess:2,ttt:2,c4:2};
function auth(ws,m){const nm=String(m.name||'').trim(),pw=String(m.pass||''),fail=x=>tx(ws,{t:'authfail',x});let key,u,gid;
 if(m.mode=='resume'){key=db.tokens[m.token];u=db.users[key];if(!u)return fail('Session expired. Please log in again.')}
 else if(m.mode=='guest'){gid=String(m.gid||'').replace(/\W/g,'').slice(0,16)||crypto.randomBytes(6).toString('hex');key='g:'+gid;u=db.users[key]||(db.users[key]=newUser('Guest'+(100+Math.floor(Math.random()*900))))}
 else{if(!/^\w{3,16}$/.test(nm))return fail('Username must be 3-16 letters, numbers or _');key='u:'+nm.toLowerCase();
  if(m.mode=='register'){if(db.users[key])return fail('That username is taken');if(pw.length<4||pw.length>64)return fail('Password must be 4-64 characters');u=db.users[key]=newUser(nm,pw)}
  else{u=db.users[key];if(!u||!u.pass||!chk(pw,u.pass))return fail('Wrong username or password')}}
 ws.key=key;ws.u=u;ws.name=u.name;online[key]=ws;
 const tok=m.mode=='resume'?m.token:crypto.randomBytes(16).toString('hex');db.tokens[tok]=key;touch();
 tx(ws,{t:'authed',me:pub(u),token:tok,gid,daily:daily()});friends(ws);lb(ws,'')}
function friends(ws){if(!ws.u)return;tx(ws,{t:'friends',list:ws.u.friends.map(f=>{const o=online['u:'+f.toLowerCase()];return{n:f,on:!!o,room:o&&o.room?o.room.code:null}})})}
function lb(ws,g){const l=Object.values(db.users).filter(u=>u.played>0).sort((a,b)=>g?(b.gw[g]||0)-(a.gw[g]||0)||b.xp-a.xp:b.xp-a.xp).slice(0,20).map(u=>({n:u.name,xp:u.xp,w:u.wins,g:g?u.gw[g]||0:0,guest:!u.pass}));
 tx(ws,{t:'lb',game:g,l,online:Object.keys(online).length,rooms:Object.keys(rooms).length})}
function push(r){const b={t:'room',code:r.code,game:r.game,max:r.max,names:r.seats.map(x=>x.name),state:r.s,started:r.started,pub:r.pub,spec:r.spec.length,round:r.round};
 r.seats.forEach((x,k)=>tx(x,{...b,seat:k,host:x===r.host}));r.spec.forEach(x=>tx(x,{...b,seat:-1,host:false}))}
function start(r){r.seats=r.seats.filter(x=>!x.ghost);const n=r.seats.length;r.s=G[r.game].init(n);r.s.n=r.s.n||n;r.s.out=r.s.out||Array(n).fill(false);r.started=true;r.done=0;r.round++;if(!r.seats.includes(r.host))r.host=r.seats[0];push(r)}
function finish(r){if(r.done)return;r.done=1;const w=r.s.win;r.seats.forEach((x,k)=>{const u=x.u;if(!u)return;const res=w==='d'?'D':w===k?'W':'L';u.played++;
 if(res=='W'){u.wins++;u.gw[r.game]=(u.gw[r.game]||0)+1;u.xp+=30+(r.game==daily()?50:0)}else u.xp+=res=='D'?15:10;
 u.hist.unshift({g:r.game,r:res,vs:r.seats.filter((y,j)=>j!=k).map(y=>y.name.replace(/ \(left\)$/,'')).join(', ')||'-',d:new Date().toISOString().slice(0,10)});u.hist=u.hist.slice(0,20);tx(x,{t:'me',me:pub(u)})});touch()}
function leave(ws){const r=ws.room;if(!r)return;ws.room=null;const k=r.seats.indexOf(ws);
 if(k<0)r.spec=r.spec.filter(x=>x!==ws);
 else if(r.started&&r.s.win===undefined){const s=r.s;s.out[k]=true;r.seats[k]={ghost:1,name:ws.name+' (left)',u:ws.u};
  const act=s.out.map((o,i)=>o?-1:i).filter(i=>i>=0);if(act.length<=1){s.win=act.length?act[0]:'d';finish(r)}else if(s.turn==k)s.turn=nextTurn(s,k)}
 else{r.seats.splice(k,1);if(r.host===ws)r.host=r.seats.find(x=>!x.ghost)}
 if(!r.seats.some(x=>!x.ghost)){r.spec.forEach(x=>{x.room=null;tx(x,{t:'left'})});delete rooms[r.code];return}push(r)}
const nextTurn=(s,k)=>{let j=k;for(let i=0;i<s.n;i++){j=(j+1)%s.n;if(!s.out[j])return j}return k};
function mk(ws,game,pb){leave(ws);const code=Math.random().toString(36).slice(2,6).toUpperCase();
 const r=rooms[code]={code,game,pub:pb,max:pb?2:MAXP[game],seats:[ws],spec:[],host:ws,s:null,started:false,done:0,round:0};ws.room=r;push(r);return r}
function sit(ws,r,spec){leave(ws);ws.room=r;const fin=r.s&&r.s.win!==undefined;
 if(!spec&&(!r.started||fin)&&r.seats.filter(x=>!x.ghost).length<r.max){r.seats=r.seats.filter(x=>!x.ghost);r.seats.push(ws);if(r.seats.length==r.max)start(r);else push(r)}else{r.spec.push(ws);push(r)}}
let lastChat=new WeakMap();
wss.on('connection',ws=>{
 ws.on('close',()=>{leave(ws);if(ws.key&&online[ws.key]===ws)delete online[ws.key]});
 ws.on('error',()=>{});
 ws.on('message',d=>{let m;try{m=JSON.parse(d)}catch{return}if(!m||typeof m!='object')return;
  if(m.t=='auth')return auth(ws,m);if(!ws.u)return;
  const r=ws.room;
  if(m.t=='lb')lb(ws,G[m.game]?m.game:'');
  else if(m.t=='friends')friends(ws);
  else if(m.t=='create'&&G[m.game])mk(ws,m.game,false);
  else if(m.t=='quick'&&G[m.game]){const q=Object.values(rooms).find(x=>x.pub&&x.game==m.game&&!x.started&&x.seats.length<2&&x.seats[0].key!==ws.key);if(q)sit(ws,q,false);else mk(ws,m.game,true)}
  else if(m.t=='join'){const q=rooms[String(m.code).toUpperCase()];if(!q)return tx(ws,{t:'err',x:'Room not found'});sit(ws,q,!!m.spectate)}
  else if(m.t=='leave'){leave(ws);tx(ws,{t:'left'})}
  else if(m.t=='start'||m.t=='again'){if(!r||r.started&&!(r.s&&r.s.win!==undefined))return;const n=r.seats.filter(x=>!x.ghost).length;
   if(r.seats.indexOf(ws)>=0&&n>=2&&(r.max>2?ws===r.host:n==r.max))start(r)}
  else if(m.t=='move'&&r){const k=r.seats.indexOf(ws);if(k<0||!r.started||r.s.win!==undefined||r.s.out[k])return;if(G[r.game].move(r.s,k,m))return;if(r.s.win!==undefined)finish(r);push(r)}
  else if(m.t=='chat'&&r){const now=Date.now();if(now-(lastChat.get(ws)||0)<400)return;lastChat.set(ws,now);const o={t:'chat',n:ws.name,x:String(m.x).slice(0,200)};[...r.seats,...r.spec].forEach(x=>tx(x,o))}
  else if(m.t=='fadd'){const nm=String(m.name||'').trim(),key='u:'+nm.toLowerCase(),f=db.users[key];
   if(ws.key.startsWith('g:'))return tx(ws,{t:'err',x:'Create an account to add friends'});
   if(!f)return tx(ws,{t:'err',x:'No player with that username'});if(key==ws.key)return tx(ws,{t:'err',x:"That's you"});
   if(!ws.u.friends.includes(f.name)&&ws.u.friends.length<50){ws.u.friends.push(f.name);touch();tx(online[key],{t:'toast',x:ws.name+' added you as a friend'})}friends(ws)}
  else if(m.t=='fdel'){ws.u.friends=ws.u.friends.filter(x=>x!==m.name);touch();friends(ws)}
  else if(m.t=='invite'&&r){const o=online['u:'+String(m.name).toLowerCase()];if(o&&ws.u.friends.includes(o.name))tx(o,{t:'invite',from:ws.name,code:r.code,game:r.game})}
 })});
app.use(express.static(__dirname+'/public'));app.use(express.urlencoded({extended:false}));
app.get('/health',(q,r)=>r.send('ok'));
const okA=k=>{if(!ADMIN||typeof k!='string'||k.length!=ADMIN.length)return false;return crypto.timingSafeEqual(Buffer.from(k),Buffer.from(ADMIN))};
app.get('/admin',(q,r)=>{if(!okA(q.query.key))return r.status(403).send('Forbidden. Set the ADMIN_KEY environment variable and open /admin?key=YOUR_KEY');
 const k=esc(q.query.key),us=Object.entries(db.users).sort((a,b)=>b[1].xp-a[1].xp);const f=(a,x)=>`<form method=post style="display:inline"><input type=hidden name=key value="${k}"><input type=hidden name=act value="${a}">${x}</form>`;
 r.send(`<body style="background:#0a0a14;color:#0ff;font-family:monospace;padding:16px"><h2>GameTym Admin</h2><p>Users: ${us.length} | Online: ${Object.keys(online).length} | Rooms: ${Object.keys(rooms).length}</p>
 ${f('say','<input name=msg placeholder="Message to all online players"><button>Broadcast</button>')} ${f('reset','<button onclick="return confirm(\'Reset all XP and wins?\')">Reset leaderboard</button>')}
 <table border=1 cellpadding=5 style="margin-top:12px"><tr><th>Player<th>Type<th>XP<th>Wins<th>Played<th></tr>${us.map(([id,u])=>`<tr><td>${esc(u.name)}<td>${u.pass?'account':'guest'}<td>${u.xp}<td>${u.wins}<td>${u.played}<td>${f('del',`<input type=hidden name=id value="${esc(id)}"><button>Delete</button>`)}`).join('')}</table>
 <h3>Live rooms</h3>${Object.values(rooms).map(x=>`<p>${x.code} ${x.game} players: ${esc(x.seats.map(s=>s.name).join(', '))} (+${x.spec.length} watching)</p>`).join('')||'none'}`)});
app.post('/admin',(q,r)=>{const b=q.body||{};if(!okA(b.key))return r.status(403).send('Forbidden');
 if(b.act=='say')wss.clients.forEach(c=>tx(c,{t:'toast',x:'📢 '+String(b.msg).slice(0,200)}));
 if(b.act=='reset'){Object.values(db.users).forEach(u=>{u.xp=0;u.wins=0;u.played=0;u.gw={};u.hist=[]});touch()}
 if(b.act=='del'&&db.users[b.id]){delete db.users[b.id];for(const t in db.tokens)if(db.tokens[t]==b.id)delete db.tokens[t];const o=online[b.id];if(o)o.close();touch()}
 r.redirect('/admin?key='+encodeURIComponent(b.key))});
srv.listen(process.env.PORT||3000,()=>console.log('GameTym running'));
