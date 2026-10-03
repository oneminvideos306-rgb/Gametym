const $=i=>document.getElementById(i),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const GN={snl:'Snake & Ladder',chess:'Chess',ludo:'Ludo',ttt:'Tic-Tac-Toe',c4:'Connect Four'},COL=['#00f0ff','#ff2bd6','#9dff00','#ffb300'];
let ws,me=null,mute=localStorage.gtmute=='1',lastCode='',celeb='',lastSig='',pendingRoom=new URLSearchParams(location.search).get('room'),view='auth',inRoom=false;
const send=o=>ws&&ws.readyState==1&&ws.send(JSON.stringify(o));
function connect(){ws=new WebSocket((location.protocol=='https:'?'wss':'ws')+'://'+location.host);
 ws.onopen=()=>{$('off').classList.add('hide');const t=localStorage.gttok;if(t)send({t:'auth',mode:'resume',token:t});else show('auth')};
 ws.onmessage=e=>on(JSON.parse(e.data));ws.onclose=()=>{$('off').classList.remove('hide');setTimeout(connect,1500)}}
function show(v){view=v;document.querySelectorAll('.view').forEach(e=>e.classList.add('hide'));$('v-'+v).classList.remove('hide');
 document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.v==v));$('nav').classList.toggle('hide',!me);
 if(v=='ranks')send({t:'lb',game:$('lg').value});if(v=='friends')send({t:'friends'});if(v=='prof')prof();scrollTo(0,0)}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>show(b.dataset.v));
function doAuth(mode){send({t:'auth',mode,name:$('au').value,pass:$('ap').value,gid:localStorage.gtg})}
function logout(){localStorage.removeItem('gttok');me=null;send({t:'leave'});$('hd').textContent='';show('auth')}
function toast(x,btn){const d=document.createElement('div');d.className='toast';d.innerHTML=esc(x)+(btn?` <button class=sm onclick="${btn[1]};this.parentNode.remove()">${btn[0]}</button>`:'');$('toasts').appendChild(d);setTimeout(()=>d.remove(),btn?15000:4500)}
let ac;function beep(f=520,d=.08){if(mute)return;try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;g.gain.value=.05;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch{}}
function toggleMute(){mute=!mute;localStorage.gtmute=mute?1:0;$('mu').textContent=mute?'🔇':'🔊'}$('mu').textContent=mute?'🔇':'🔊';
function confetti(){const c=$('fx'),x=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;const P=Array.from({length:150},()=>({x:Math.random()*c.width,y:-20,vx:Math.random()*4-2,vy:Math.random()*4+2,c:COL[Math.floor(Math.random()*4)],r:Math.random()*5+2}));let f=0;(function a(){x.clearRect(0,0,c.width,c.height);P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;x.fillStyle=p.c;x.fillRect(p.x,p.y,p.r,p.r*1.6)});if(f++<170)requestAnimationFrame(a);else x.clearRect(0,0,c.width,c.height)})()}
(function(){const c=$('bg'),x=c.getContext('2d');let W,H,P=[];function rs(){W=c.width=innerWidth;H=c.height=innerHeight;P=Array.from({length:Math.min(90,W/12|0)},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.8+.4,v:Math.random()*.4+.1,c:COL[Math.random()*2|0]}))}rs();addEventListener('resize',rs);(function a(){x.clearRect(0,0,W,H);P.forEach(p=>{p.y-=p.v;if(p.y<0){p.y=H;p.x=Math.random()*W}x.globalAlpha=.6;x.fillStyle=p.c;x.beginPath();x.arc(p.x,p.y,p.r,0,7);x.fill()});requestAnimationFrame(a)})()})();
const GL=[['snl','🎲','Snake & Ladder','Roll, dodge snakes, climb ladders and race to 100.',['2–4 players','Dice','Chat'],1],['chess','♟️','Chess','Full rules: castling, en passant, promotion, checkmate.',['2 players','Strategy']],['ludo','🎯','Ludo','Race four tokens home and capture your rivals.',['2–4 players','Dice']],['ttt','❌','Tic-Tac-Toe','Quick three-in-a-row duel.',['2 players','Quick']],['c4','🔴','Connect Four','Drop discs and line up four.',['2 players','Strategy']]];
$('gl').innerHTML=GL.map((g,n)=>`<div class=gc style="animation-delay:${n*90}ms">${g[5]?'<span class=feat>★ Featured</span>':''}<div class=ic>${g[1]}</div><h4>${g[2]}</h4><p>${g[3]}</p><div class=tags>${g[4].map(t=>`<span>${t}</span>`).join('')}</div><div class=row><button class=pri onclick="send({t:'quick',game:'${g[0]}'})">⚡ Quick match</button><button onclick="send({t:'create',game:'${g[0]}'})">Private room</button></div></div>`).join('');
$('lg').innerHTML='<option value="">Overall XP</option>'+Object.entries(GN).map(([k,v])=>`<option value=${k}>${v} wins</option>`).join('');
const ACH=[['🥇 First win',u=>u.wins>=1],['🔟 10 wins',u=>u.wins>=10],['🎮 20 games played',u=>u.played>=20],['⭐ Level 5',u=>u.xp>=400],['👑 Level 10',u=>u.xp>=900],['♟ Chess master (5 wins)',u=>(u.gw.chess||0)>=5],['🎯 Ludo legend (5 wins)',u=>(u.gw.ludo||0)>=5],['🐍 Ladder climber (5 wins)',u=>(u.gw.snl||0)>=5],['🌐 Social (3 friends)',u=>u.friends>=3]];
function hdr(){$('hd').textContent=me?`${me.name} · Lv ${Math.floor(me.xp/100)+1} · ${me.xp} XP`:'';$('dc').innerHTML=`Today: win a game of <b>${GN[daily()]}</b> for <b>+50 bonus XP</b>.`}
function prof(){if(!me)return;const lv=Math.floor(me.xp/100)+1;$('pn').innerHTML=esc(me.name)+(me.guest?' <small>(guest)</small>':'');
 $('pb').innerHTML=`<div class=stat><div><b>${lv}</b>Level</div><div><b>${me.xp}</b>XP</div><div><b>${me.wins}</b>Wins</div><div><b>${me.played}</b>Played</div></div><div class=bar><i style="width:${me.xp%100}%"></i></div><small>${100-me.xp%100} XP to level ${lv+1}</small>${me.guest?'<p><small>Guest progress is tied to this browser. Log out and create an account to keep it forever and add friends.</small></p>':''}`;
 $('ach').innerHTML=ACH.map(a=>`<div class="${a[1](me)?'on':''}">${a[0]}</div>`).join('');
 $('hist').innerHTML=me.hist.length?`<table>${me.hist.map(h=>`<tr><td>${h.d}<td>${GN[h.g]||h.g}<td>${h.r=='W'?'🏆 Win':h.r=='D'?'🤝 Draw':'Loss'}<td>vs ${esc(h.vs)}`).join('')}</table>`:'<small>No matches yet. Go play!</small>'}
function on(m){switch(m.t){
 case'authed':me=m.me;localStorage.gttok=m.token;if(m.gid)localStorage.gtg=m.gid;hdr();if(pendingRoom){send({t:'join',code:pendingRoom});pendingRoom=null}else if(view=='auth')show('games');else $('nav').classList.remove('hide');break;
 case'authfail':localStorage.removeItem('gttok');toast(m.x);show('auth');break;
 case'me':me=m.me;hdr();if(view=='prof')prof();break;
 case'room':render(m);break;case'left':inRoom=false;show('games');break;
 case'chat':addChat(m);break;case'friends':renderF(m.list);break;case'lb':renderLb(m);break;
 case'invite':toast(`${m.from} invited you to ${GN[m.game]}`,['Join',`send({t:'join',code:'${m.code}'})`]);beep(700);break;
 case'toast':case'err':toast(m.x);break}}
function renderLb(m){if(m.online!=null)$('onl').textContent=`🟢 ${m.online} online · ${m.rooms} live rooms`;
 $('lbd').innerHTML=m.l.length?`<table><tr><th>#<th>Player<th>${m.game?'Wins':'XP'}<th>Total wins</tr>${m.l.map((u,i)=>`<tr><td>${['🥇','🥈','🥉'][i]||i+1}<td>${esc(u.n)}${u.guest?' <small>(guest)</small>':''}<td>${m.game?u.g:u.xp}<td>${u.w}`).join('')}</table>`:'<small>No games played yet. Be the first!</small>'}
function renderF(l){$('fl').innerHTML=me&&me.guest?'<small>Create an account to add friends.</small>':l.length?`<table>${l.map(f=>`<tr><td><span class="dot ${f.on?'on':''}"></span>${esc(f.n)}<td>${f.room?`<button class=sm onclick="send({t:'join',code:'${f.room}',spectate:1})">Watch</button>`:''}${inRoom&&f.on?`<button class=sm onclick="send({t:'invite',name:'${esc(f.n)}'})">Invite</button>`:''}<button class=sm onclick="send({t:'fdel',name:'${esc(f.n)}'})">✕</button>`).join('')}</table>`:'<small>No friends yet. Add someone by username.</small>'}
function addF(){const n=$('fn').value.trim();if(n)send({t:'fadd',name:n});$('fn').value=''}
setInterval(()=>{if(me&&view=='friends')send({t:'friends'})},6000);
function joinCode(sp){const c=$('code').value.trim();if(c.length!=4)return toast('Enter the 4-letter room code');send({t:'join',code:c,spectate:sp})}
function shareLink(){const u=location.origin+location.pathname+'?room='+lastCode;if(navigator.share)navigator.share({title:'Play GameTym with me',url:u}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(u).then(()=>toast('Link copied'));else prompt('Copy this link',u)}
function chat(){const x=$('cx').value.trim();$('cx').value='';if(x)send({t:'chat',x})}
function addChat(m){const d=document.createElement('div');d.innerHTML='<b style="color:var(--c1)">'+esc(m.n)+':</b> ';d.appendChild(document.createTextNode(m.x));$('chat').appendChild(d);$('chat').scrollTop=1e9;beep(380,.05)}
const mv=o=>send({t:'move',...o});
let sel=-1,cm=null;
function chessUI(m){const s=m.state,fl=m.seat==1,lg=m.seat==s.turn&&s.win===undefined&&m.names[1]?legal(s):[],tg=sel>=0?lg.filter(x=>x[0]==sel).map(x=>x[1]):[];let h='<div class=ch>';
 for(let i=0;i<64;i++){const q=fl?63-i:i,p=s.b[q];h+=`<div class="sqc ${((q>>3)+(q&7))%2?'dk':''} ${q==sel?'sel':''} ${s.last&&(s.last[0]==q||s.last[1]==q)?'lm':''} ${tg.includes(q)?'tg':''}" onclick="cclick(${q})">${p!='.'?`<span class="pc ${p==p.toUpperCase()?'w':'b'}">${PCS[p.toLowerCase()]}</span>`:''}</div>`}
 return h+'</div><p><small>Pawns auto-promote to a queen. Draws by repetition or the 50-move rule aren\'t detected.</small></p>'}
function cclick(q){const m=cm,s=m.state;if(m.seat!=s.turn||s.win!==undefined||!m.names[1])return;const p=s.b[q];
 if(sel>=0&&legal(s).some(x=>x[0]==sel&&x[1]==q)){const f=sel;sel=-1;return mv({f,t:q})}
 sel=p!='.'&&((p==p.toUpperCase())==(m.seat==0))?q:-1;render(m)}
function ludoUI(m){const s=m.state,C=28,my=m.seat,go=my==s.turn&&s.win===undefined&&!s.out[my],can=go&&s.rolled?LM(s,my):[];
 let h='<svg viewBox="0 0 392 392" style="width:100%;max-width:460px;display:block;margin:auto;background:#0b0b22;border-radius:14px">';
 const R=(x,y,f,st)=>`<rect x="${x*C+1}" y="${y*C+1}" width="${C-2}" height="${C-2}" rx="5" fill="${f}" stroke="${st}"/>`;
 for(let i=0;i<52;i++){const[x,y]=LP(i);const k=s.pos.findIndex((_,j)=>slot(s,j)*13==i);h+=R(x,y,k>=0?COL[k]+'55':'#161636',SAFE.includes(i)?'#9dff00':'#2a2a55')}
 s.pos.forEach((_,k)=>{for(let j=1;j<=6;j++){const[x,y]=LXY(slot(s,k),50+j,0);h+=R(x,y,COL[k]+'33',COL[k])}});
 s.pos.forEach((P,k)=>P.forEach((p,i)=>{const[x,y]=LXY(slot(s,k),p,i),o=p>=0?(i%2?3:-3):0,c=k==my&&can.includes(i);
  h+=`<circle class="t${k}" cx="${x*C+C/2+o}" cy="${y*C+C/2+o}" r="9" stroke="#fff" stroke-width="${c?3:1}" ${c?`onclick="mv({tok:${i}})" style="cursor:pointer"`:''}/>`}));
 h+='</svg><p class=mut style="text-align:center">Last roll: '+(s.roll||'-')+' · green outline = safe cell · roll a 6 to leave the yard</p>';
 if(go&&!s.rolled)h+='<div class="row cen"><button class=pri onclick="mv({roll:1})">🎲 Roll dice</button></div>';return h}
function render(m){cm=m;inRoom=true;const s=m.state,n=m.names,over=s&&s.win!==undefined;
 if(lastCode!=m.code){$('chat').innerHTML='';lastCode=m.code;sel=-1;history.replaceState(0,'',location.pathname)}
 show('room');$('rt').textContent=GN[m.game]+' · '+m.code+(m.seat<0?' (watching)':'')+(m.spec?` · 👁 ${m.spec}`:'');
 $('pl').innerHTML=n.map((x,k)=>`<span class=pl style="border-color:${COL[k]};color:${COL[k]}">${esc(x)}${s&&s.turn==k&&!over?' ▸':''}</span>`).join('')+(n.length<m.max?`<span class=mut> waiting for ${m.max-n.length} more…</span>`:'');
 const sig=JSON.stringify(s);if(sig!=lastSig){if(lastSig)beep(m.seat==(s&&s.turn)?640:440);lastSig=sig}
 let h='',ac='';
 if(!s){$('st').innerHTML=n.length<2?'Waiting for players… share the link or code <b>'+m.code+'</b>':m.host?'Ready when you are':'Waiting for the host to start';
  if(m.host&&n.length>=2)ac='<button class=pri onclick="send({t:\'start\'})">▶ Start game</button>'}
 else{
  $('st').innerHTML=over?(s.win=='d'?'🤝 Draw!':'🏆 <b>'+esc(n[s.win]||'?')+'</b> wins!'):s.out&&s.out[m.seat]?'You left':(m.seat==s.turn?'<b style="color:var(--c3)">Your turn</b>':esc(n[s.turn])+"'s turn");
  if(over&&celeb!=m.code+m.round){celeb=m.code+m.round;if(s.win===m.seat){confetti();beep(880,.3)}}
  if(over&&m.seat>=0)ac=m.max>2?(m.host?'<button class=pri onclick="send({t:\'again\'})">↻ Play again</button>':''):'<button class=pri onclick="send({t:\'again\'})">↻ Rematch</button>';
  if(m.game=='ttt')h='<div class=b3>'+s.b.map((v,i)=>`<button onclick="mv({i:${i}})" style="color:${v=='X'?COL[0]:COL[1]}">${v}</button>`).join('')+'</div>';
  if(m.game=='c4')h='<div class=b7>'+s.b.map((v,i)=>`<div class="cell ${v>=0?'p'+v:''}" onclick="mv({c:${i%7}})"></div>`).join('')+'</div>';
  if(m.game=='snl'){let q='';for(let r=9;r>=0;r--)for(let c=0;c<10;c++){const k=r*10+(r%2?10-c:c+1),j=JUMP[k];
   q+=`<div class="sq ${j?(j<k?'s':'l'):''}">${k}${j?(j<k?'🐍':'🪜')+j:''}${s.pos.map((p,i)=>p==k?`<i class="tok t${i}" style="left:${i*12+1}px"></i>`:'').join('')}</div>`}
   h=`<div class=b10>${q}</div><p class=mut style="text-align:center">Last roll: ${s.roll||'-'} (6 = roll again)</p>`;
   if(!over&&m.seat==s.turn)h+='<div class="row cen"><button class=pri onclick="mv({})">🎲 Roll dice</button></div>'}
  if(m.game=='chess')h=chessUI(m);if(m.game=='ludo')h=ludoUI(m)}
 $('bd').innerHTML=h;$('ac').innerHTML=ac}
connect();
