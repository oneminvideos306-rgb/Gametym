const $=i=>document.getElementById(i),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const GN={snl:'Snake & Ladder',chess:'Chess',ludo:'Ludo',ttt:'Tic-Tac-Toe',c4:'Connect Four',checkers:'Checkers',battleship:'Battleship',memory:'Memory Match'},COL=['#00f0ff','#ff2bd6','#9dff00','#ffb300'];
let ws,me=null,mute=localStorage.gtmute=='1',lastCode='',celeb='',lastSig='',pendingRoom=new URLSearchParams(location.search).get('room'),view='auth',inRoom=false;
const send=o=>ws&&ws.readyState==1&&ws.send(JSON.stringify(o));
function connect(){ws=new WebSocket((location.protocol=='https:'?'wss':'ws')+'://'+location.host);ws.onopen=()=>{$('off').classList.add('hide');const t=localStorage.gttok;if(t)send({t:'auth',mode:'resume',token:t});else show('auth')};ws.onmessage=e=>on(JSON.parse(e.data));ws.onclose=()=>{$('off').classList.remove('hide');setTimeout(connect,1500)}}
function show(v){view=v;document.querySelectorAll('.view').forEach(e=>e.classList.add('hide'));$('v-'+v).classList.remove('hide');document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.v==v));$('nav').classList.toggle('hide',!me);if(v=='ranks')send({t:'lb',game:$('lg').value});if(v=='friends')send({t:'friends'});if(v=='prof')prof();scrollTo(0,0)}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>show(b.dataset.v));
function doAuth(mode){send({t:'auth',mode,name:$('au').value,pass:$('ap').value,gid:localStorage.gtg})}
function logout(){localStorage.removeItem('gttok');me=null;send({t:'leave'});$('hd').textContent='';show('auth')}
function toast(x,btn){const d=document.createElement('div');d.className='toast';d.innerHTML=esc(x)+(btn?` <button class=sm onclick="${btn[1]};this.parentNode.remove()">${btn[0]}</button>`:'');$('toasts').appendChild(d);setTimeout(()=>d.remove(),btn?15000:4500)}
let ac;function beep(f=520,d=.08){if(mute)return;try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;g.gain.value=.05;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch{}}
function toggleMute(){mute=!mute;localStorage.gtmute=mute?'1':'0';$('mu').textContent=mute?'🔇':'🔊'}$('mu').textContent=mute?'🔇':'🔊';
function confetti(){const c=$('fx'),x=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;const P=Array.from({length:150},()=>({x:Math.random()*c.width,y:-20,vx:Math.random()*4-2,vy:Math.random()*4+2,c:COL[Math.floor(Math.random()*4)],r:Math.random()*5+2}));let f=0;(function a(){x.clearRect(0,0,c.width,c.height);P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;x.fillStyle=p.c;x.fillRect(p.x,p.y,p.r,p.r*1.6)});if(f++<170)requestAnimationFrame(a);else x.clearRect(0,0,c.width,c.height)})()}
(function(){const c=$('bg'),x=c.getContext('2d');let W,H,P=[];function rs(){W=c.width=innerWidth;H=c.height=innerHeight;P=Array.from({length:Math.min(90,W/12|0)},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.8+.4,v:Math.random()*.4+.1,c:COL[Math.random()*2|0]}))}rs();addEventListener('resize',rs);(function a(){x.clearRect(0,0,W,H);P.forEach(p=>{p.y-=p.v;if(p.y<0){p.y=H;p.x=Math.random()*W}x.globalAlpha=.6;x.fillStyle=p.c;x.beginPath();x.arc(p.x,p.y,p.r,0,7);x.fill()});requestAnimationFrame(a)})()})();
const GL=[['snl','🐍','Snake & Ladder','Classic 1–100 race with snakes, ladders and dice.',['2–4 players','Dice','Classic'],1],['chess','♟️','Chess','Full rules: castling, en passant, promotion and checkmate.',['2 players','Strategy']],['ludo','🎯','Ludo','Classic race home with four tokens and dice.',['2–4 players','Dice']],['ttt','❌','Tic-Tac-Toe','Quick three-in-a-row duel.',['2 players','Quick']],['c4','🔴','Connect Four','Drop discs and line up four.',['2 players','Strategy']],['checkers','⚫','Checkers','Classic 8×8 draughts with captures and kings.',['2 players','Strategy']],['battleship','🚢','Battleship','Find and sink the hidden fleet.',['2 players','Strategy']],['memory','🧠','Memory Match','Flip cards, find pairs and score more matches.',['2–4 players','Memory']]];
$('gl').innerHTML=GL.map((g,n)=>`<div class=gc style="animation-delay:${n*70}ms"><div class=ic>${g[1]}</div><h4>${g[2]}</h4><p>${g[3]}</p><div class=tags>${g[4].map(t=>`<span>${t}</span>`).join('')}</div><div class=row><button class=pri onclick="send({t:'quick',game:'${g[0]}'})">⚡ Quick match</button><button onclick="send({t:'create',game:'${g[0]}'})">Private room</button></div></div>`).join('');
$('lg').innerHTML='<option value="">Overall XP</option>'+Object.entries(GN).map(([k,v])=>`<option value=${k}>${v} wins</option>`).join('');
const ACH=[['🥇 First win',u=>u.wins>=1],['🔟 10 wins',u=>u.wins>=10],['🎮 20 games played',u=>u.played>=20],['⭐ Level 5',u=>u.xp>=400],['👑 Level 10',u=>u.xp>=900],['♟ Chess master (5 wins)',u=>(u.gw.chess||0)>=5],['🎯 Ludo legend (5 wins)',u=>(u.gw.ludo||0)>=5],['🐍 Ladder climber (5 wins)',u=>(u.gw.snl||0)>=5],['⚫ Checkers ace (5 wins)',u=>(u.gw.checkers||0)>=5],['🚢 Admiral (5 wins)',u=>(u.gw.battleship||0)>=5],['🧠 Memory master (5 wins)',u=>(u.gw.memory||0)>=5],['🌐 Social (3 friends)',u=>u.friends>=3]];
function hdr(){$('hd').textContent=me?`${me.name} · Lv ${Math.floor(me.xp/100)+1} · ${me.xp} XP`:'';$('dc').innerHTML=`Today: win a game of <b>${GN[daily()]}</b> for <b>+50 bonus XP</b>.`}
function prof(){if(!me)return;const lv=Math.floor(me.xp/100)+1;$('pn').innerHTML=esc(me.name)+(me.guest?' <small>(guest)</small>':'');$('pb').innerHTML=`<div class=stat><div><b>${lv}</b>Level</div><div><b>${me.xp}</b>XP</div><div><b>${me.wins}</b>Wins</div><div><b>${me.played}</b>Played</div></div><div class=bar><i style="width:${me.xp%100}%"></i></div><small>${100-me.xp%100} XP to level ${lv+1}</small>${me.guest?'<p><small>Guest progress is tied to this browser. Log out and create an account to keep it forever and add friends.</small></p>':''}`;$('ach').innerHTML=ACH.map(a=>`<div class="${a[1](me)?'on':''}">${a[0]}</div>`).join('');$('hist').innerHTML=me.hist.length?`<table>${me.hist.map(h=>`<tr><td>${h.d}<td>${GN[h.g]||h.g}<td>${h.r=='W'?'🏆 Win':h.r=='D'?'🤝 Draw':'Loss'}<td>vs ${esc(h.vs)}`).join('')}</table>`:'<small>No matches yet. Go play!</small>'}
function on(m){switch(m.t){case'authed':me=m.me;localStorage.gttok=m.token;if(m.gid)localStorage.gtg=m.gid;hdr();if(pendingRoom){send({t:'join',code:pendingRoom});pendingRoom=null}else if(view=='auth')show('games');else $('nav').classList.remove('hide');break;case'authfail':localStorage.removeItem('gttok');toast(m.x);show('auth');break;case'me':me=m.me;hdr();if(view=='prof')prof();break;case'room':render(m);break;case'left':inRoom=false;show('games');break;case'chat':addChat(m);break;case'friends':renderF(m.list);break;case'lb':renderLb(m);break;case'invite':toast(`${m.from} invited you to ${GN[m.game]}`,['Join',`send({t:'join',code:'${m.code}'})`]);beep(700);break;case'toast':case'err':toast(m.x);break}}
function renderLb(m){if(m.online!=null)$('onl').textContent=`🟢 ${m.online} online · ${m.rooms} live rooms`;$('lbd').innerHTML=m.l.length?`<table><tr><th>#<th>Player<th>${m.game?'Wins':'XP'}<th>Total wins</tr>${m.l.map((u,i)=>`<tr><td>${['🥇','🥈','🥉'][i]||i+1}<td>${esc(u.n)}${u.guest?' <small>(guest)</small>':''}<td>${m.game?u.g:u.xp}<td>${u.w}</tr>`).join('')}</table>`:'<small>No games played yet. Be the first!</small>'}
function renderF(l){$('fl').innerHTML=me&&me.guest?'<small>Create an account to add friends.</small>':l.length?`<table>${l.map(f=>`<tr><td><span class="dot ${f.on?'on':''}"></span>${esc(f.n)}<td>${f.room?`<button class=sm onclick="send({t:'join',code:'${f.room}',spectate:1})">Watch</button>`:''}${inRoom&&f.on?`<button class=sm onclick="send({t:'invite',name:'${esc(f.n)}'})">Invite</button>`:''}<button class=sm onclick="send({t:'fdel',name:'${esc(f.n)}'})">✕</button>`).join('')}</table>`:'<small>No friends yet. Add someone by username.</small>'}
function addF(){const n=$('fn').value.trim();if(n)send({t:'fadd',name:n});$('fn').value=''}
setInterval(()=>{if(me&&view=='friends')send({t:'friends'})},6000);
function joinCode(sp){const c=$('code').value.trim();if(c.length!=4)return toast('Enter the 4-letter room code');send({t:'join',code:c,spectate:sp})}
function shareLink(){const u=location.origin+location.pathname+'?room='+lastCode;if(navigator.share)navigator.share({title:'Play GameTym with me',url:u}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(u).then(()=>toast('Link copied'));else prompt('Copy this link',u)}
function chat(){const x=$('cx').value.trim();$('cx').value='';if(x)send({t:'chat',x})}
function addChat(m){const d=document.createElement('div');d.innerHTML='<b style="color:var(--c1)">'+esc(m.n)+':</b> ';d.appendChild(document.createTextNode(m.x));$('chat').appendChild(d);$('chat').scrollTop=1e9;beep(380,.05)}
const LCOL=['#ff3f57','#2fb8ff','#63d94d','#ffd447'],LNAME=['Red','Blue','Green','Yellow'];
const mv=o=>send({t:'move',...o});let sel=-1,cm=null;

function chessUI(m){const s=m.state,fl=m.seat==1,lg=m.seat==s.turn&&s.win===undefined&&m.names[1]?legal(s):[],tg=sel>=0?lg.filter(x=>x[0]==sel).map(x=>x[1]):[];let h='<div class=ch>';for(let i=0;i<64;i++){const q=fl?63-i:i,p=s.b[q];h+=`<div class="sqc ${((q>>3)+(q&7))%2?'dk':''} ${q==sel?'sel':''} ${s.last&&(s.last[0]==q||s.last[1]==q)?'lm':''} ${tg.includes(q)?'tg':''}" onclick="cclick(${q})">${p!='.'?`<span class="pc ${p==p.toUpperCase()?'w':'b'}">${PCS[p.toLowerCase()]}</span>`:''}</div>`}return h+'</div><p><small>Server validates every move. Pawns auto-promote to a queen.</small></p>'}
function cclick(q){const m=cm,s=m.state;if(m.seat!=s.turn||s.win!==undefined||!m.names[1])return;const p=s.b[q];if(sel>=0&&legal(s).some(x=>x[0]==sel&&x[1]==q)){const f=sel;sel=-1;return mv({f,to:q})}sel=p!='.'&&((p==p.toUpperCase())==(m.seat==0))?q:-1;render(m)}

function ludoUI(m){
const s=m.state,my=m.seat,go=my===s.turn&&s.win===undefined&&!s.out[my],can=go&&s.rolled?LM(s,my):[],C=30;
const colors=LCOL;
const homes=[[0,0],[9,0],[9,9],[0,9]],homeNames=['Red','Blue','Green','Yellow'];
const cell=(x,y,fill,stroke='#34384a',cls='')=>`<rect x="${x*C}" y="${y*C}" width="${C}" height="${C}" rx="3" fill="${fill}" stroke="${stroke}" class="${cls}"/>`;
let h='<svg viewBox="0 0 450 450" style="width:100%;max-width:560px;display:block;margin:auto;border:5px solid #181b27;border-radius:12px;background:#f4ead1;box-shadow:0 18px 45px #0009">';
/* Four traditional 6x6 home yards. */
for(let sl=0;sl<4;sl++){
 const [ox,oy]=homes[sl],c=colors[sl];
 h+=`<rect x="${ox*C}" y="${oy*C}" width="${6*C}" height="${6*C}" fill="${c}" stroke="#252837" stroke-width="2"/>`;
 h+=`<rect x="${(ox+1)*C}" y="${(oy+1)*C}" width="${4*C}" height="${4*C}" rx="12" fill="#fff8e8" stroke="#252837" stroke-width="2"/>`;
 YARD[sl].forEach(([x,y],i)=>{h+=`<circle cx="${x*C+C/2}" cy="${y*C+C/2}" r="12" fill="#fff8e8" stroke="${c}" stroke-width="3"/><circle cx="${x*C+C/2}" cy="${y*C+C/2}" r="5" fill="${c}" opacity=".22"/>`});
}
/* The 52-square outer track. */
for(let i=0;i<52;i++){
 const [x,y]=LP(i),safe=SAFE.includes(i),start=[0,13,26,39].includes(i),owner=start?[0,1,2,3][[0,13,26,39].indexOf(i)]:-1;
 h+=cell(x,y,safe?(owner>=0?colors[owner]+'55':'#fffdf4'):'#fffdf4',safe?(owner>=0?colors[owner]:'#c1a96d'):'#77705f');
 if(safe)h+=`<text x="${x*C+C/2}" y="${y*C+C/2+6}" text-anchor="middle" font-size="15" fill="${owner>=0?colors[owner]:'#9b8a50'}">★</text>`;
 if(start)h+=`<text x="${x*C+C/2}" y="${y*C+C/2+5}" text-anchor="middle" font-size="13" fill="${colors[owner]}">➜</text>`;
}
/* Four coloured home lanes. */
for(let sl=0;sl<4;sl++){
 const c=colors[sl];
 for(let j=1;j<=5;j++){
   const [x,y]=LXY(sl,50+j,0);
   h+=cell(x,y,c+'bb',c);
 }
}
/* Classical four-colour center. */
h+='<polygon points="180,180 270,180 225,225" fill="'+colors[1]+'"/><polygon points="270,180 270,270 225,225" fill="'+colors[2]+'"/><polygon points="270,270 180,270 225,225" fill="'+colors[3]+'"/><polygon points="180,270 180,180 225,225" fill="'+colors[0]+'"/><circle cx="225" cy="225" r="13" fill="#fff8e8" stroke="#252837" stroke-width="2"/>';
/* Tokens. */
const cnt={};
s.pos.forEach((P,k)=>P.forEach((p,i)=>{
 const sl=slot(s,k),[x,y]=LXY(sl,p,i),key=x+','+y,n=cnt[key]=(cnt[key]||0)+1;
 const offs=[[0,0],[8,-8],[-8,8],[8,8]][Math.min(n-1,3)],cl=k===my&&can.includes(i);
 const clickable=cl?`onclick="mv({tok:${i}})" style="cursor:pointer"`:'';
 h+=`<g ${clickable}><circle cx="${x*C+C/2+offs[0]}" cy="${y*C+C/2+offs[1]}" r="${p<0?12:cl?13:11}" fill="${colors[sl]}" stroke="${cl?'#ffffff':'#242735'}" stroke-width="${cl?4:2}"/><text x="${x*C+C/2+offs[0]}" y="${y*C+C/2+offs[1]+4}" text-anchor="middle" font-size="10" font-weight="800" fill="#151515" pointer-events="none">${i+1}</text></g>`;
}));
h+='</svg><p class=mut style="text-align:center">'+(my>=0?'You are <b style="color:'+colors[slot(s,my)]+'">'+LNAME[slot(s,my)]+'</b> · ':'')+'Last roll: <b>'+(s.roll||'-')+'</b> · ★ safe square · Roll 6 to bring a token out · exact roll needed to reach home</p>';
if(go&&!s.rolled)h+='<div class="row cen"><button class=pri onclick="mv({roll:1})">🎲 Roll dice</button></div>';
else if(go&&s.rolled)h+='<p class=mut style="text-align:center">Tap a highlighted token to move it</p>';
return h;
}
function snlUI(m){const s=m.state,C=50,rc=k=>{const r=Math.floor((k-1)/10),c=r%2?9-(k-1)%10:(k-1)%10;return[r,c]},cx=k=>{const[r,c]=rc(k);return[(c+.5)*C,(9-r+.5)*C]};
let h='<svg viewBox="0 0 500 500" style="width:100%;max-width:560px;display:block;margin:auto;border-radius:12px;background:#080817">',L='',S='';
for(let k=1;k<=100;k++){const[r,c]=rc(k),j=JUMP[k];h+='<rect x="'+c*C+'" y="'+(9-r)*C+'" width="'+C+'" height="'+C+'" fill="'+(j?(j<k?'#3a1530':'#12351f'):(r+c)%2?'#1a1a3d':'#11112b')+'" stroke="#30305b"/><text x="'+(c*C+3)+'" y="'+((9-r)*C+12)+'" font-size="11" fill="#a8a8d0">'+k+'</text>'}
for(const k in JUMP){const f=+k,t=JUMP[k],[x1,y1]=cx(f),[x2,y2]=cx(t),dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len;
 if(t>f){const o=5;L+='<line x1="'+(x1+nx*o)+'" y1="'+(y1+ny*o)+'" x2="'+(x2+nx*o)+'" y2="'+(y2+ny*o)+'" stroke="#9dff00" stroke-width="3"/><line x1="'+(x1-nx*o)+'" y1="'+(y1-ny*o)+'" x2="'+(x2-nx*o)+'" y2="'+(y2-ny*o)+'" stroke="#9dff00" stroke-width="3"/>';for(let d=14;d<len-6;d+=16){const px=x1+dx/len*d,py=y1+dy/len*d;L+='<line x1="'+(px+nx*o)+'" y1="'+(py+ny*o)+'" x2="'+(px-nx*o)+'" y2="'+(py-ny*o)+'" stroke="#c9ff6b" stroke-width="2.5"/>'}}
 else{const w=Math.min(26,len/5);S+='<path d="M'+x1+' '+y1+' C'+(x1+dx/3+nx*w)+' '+(y1+dy/3+ny*w)+' '+(x1+2*dx/3-nx*w)+' '+(y1+2*dy/3-ny*w)+' '+x2+' '+y2+'" fill="none" stroke="#ff2bd6" stroke-width="7" stroke-linecap="round" opacity=".9"/><circle cx="'+x1+'" cy="'+y1+'" r="8" fill="#ff2bd6"/><circle cx="'+(x1-3)+'" cy="'+(y1-2)+'" r="1.8" fill="#fff"/><circle cx="'+(x1+3)+'" cy="'+(y1-2)+'" r="1.8" fill="#fff"/><circle cx="'+x2+'" cy="'+y2+'" r="3" fill="#ff2bd6"/>'}}
h+=L+S;const O=[[-10,8],[10,8],[-10,-4],[10,-4]];
s.pos.forEach((p,i)=>{const[x,y]=cx(p);h+='<circle cx="'+(x+O[i][0])+'" cy="'+(y+O[i][1])+'" r="9" fill="'+COL[i]+'" stroke="#fff" stroke-width="2"/><text x="'+(x+O[i][0])+'" y="'+(y+O[i][1]+4)+'" text-anchor="middle" font-size="11" font-weight="700" fill="#000">'+(i+1)+'</text>'});
h+='</svg><p class=mut style="text-align:center">Last roll: <b>'+(s.roll||'-')+'</b> · 🪜 green = ladder up · 🐍 pink = snake down · 6 = roll again · exact roll needed for 100</p>';
if(s.win===undefined&&m.seat===s.turn)h+='<div class="row cen"><button class=pri onclick="mv({})">🎲 Roll dice</button></div>';return h}

function checkersUI(m){const s=m.state,rc=i=>{const r=Math.floor(i/4);return[r,2*(i%4)+((r+1)%2)]},idx=(r,c)=>r<0||r>7||c<0||c>7||((r+c)%2===0)?-1:r*4+Math.floor(c/2);if(s.chain>=0&&m.seat===s.turn)sel=s.chain;let h='<div class=checkBoard>';for(let r=0;r<8;r++)for(let c=0;c<8;c++){const i=idx(r,c),p=i>=0?s.b[i]:'',selq=sel===i&&i>=0,red=p==='r'||p==='R';h+='<button class="'+((r+c)%2?'darkSq':'lightSq')+' '+(selq?'sel':'')+'" onclick="checkClick('+i+')">'+(p?'<span class="'+(p===p.toUpperCase()?'kingPiece':'')+'" style="color:'+(red?'#ff2bd6':'#00f0ff')+';text-shadow:0 0 8px '+(red?'#ff2bd6':'#00f0ff')+'">'+(p===p.toUpperCase()?'♛':'●')+'</span>':'')+'</button>'}return h+'</div><p class=mut>Pink = Red (moves first) · Cyan = Black · capture is mandatory · multi-jumps continue · kings move both ways.</p>'}
function checkClick(i){const m=cm;if(m.seat!==m.state.turn||m.state.win!==undefined||i<0)return;const p=m.state.b[i],mine=!!p&&((p==='r'||p==='R')?0:1)===m.seat;if(mine&&!(m.state.chain>=0))sel=i===sel?-1:i;else if(sel>=0){const f=sel;sel=-1;mv({f,to:i})}render(m)}

function battleUI(m){const s=m.state,my=m.seat,go=my===s.turn&&s.win===undefined;
const grid=(title,shots,fleet,click)=>'<div style="margin-bottom:14px"><h4 style="margin:6px 0;text-align:center;color:var(--c1)">'+title+'</h4><div class=battleGrid>'+Array.from({length:100},(_,i)=>{const v=shots[i]||0,ship=fleet&&fleet[i];return '<button class="battleCell '+(v===2?'hit':v===1?'miss':'')+'" style="'+(ship&&!v?'background:#2f5a96;border-color:#5aa0ff':'')+'" '+(click&&!v?'onclick="mv({q:'+i+'})"':'disabled')+'>'+(v===2?'✦':v===1?'•':'')+'</button>'}).join('')+'</div></div>';
let h='<div class=battleWrap>';
if(my>=0){h+=grid(go?'🎯 Enemy waters — tap to fire':'🎯 Enemy waters',s.shots[my],null,go)+grid('🚢 Your fleet',s.shots[1-my],s.boards[my],false)}
else h+=grid("Player 1's shots",s.shots[0],null,false)+grid("Player 2's shots",s.shots[1],null,false);
return h+'</div><p class=mut style="text-align:center">✦ hit · • miss · blue squares are your ships · sink all 5 enemy ships (17 squares) to win</p>'}

const MEM=['🍎','🚀','🐱','⭐','🎲','🌙','🍕','⚽','🎸','🐼','🌈','🔥'];
function memoryUI(m){const s=m.state,go=m.seat===s.turn&&s.win===undefined&&!s.lock,cols=s.deck.length<=16?4:6;
return '<div class=memGrid style="grid-template-columns:repeat('+cols+',1fr);max-width:'+cols*90+'px">'+s.deck.map((v,i)=>{const show=s.open[i]||s.matched[i];return '<button class="memCard '+(show?'open':'')+' '+(s.matched[i]?'matched':'')+'" '+(go&&!show?'onclick="mv({q:'+i+'})"':'')+'>'+(show&&v>=0?MEM[v]:'?')+'</button>'}).join('')+'</div><div class=memScores>'+s.scores.map((x,i)=>'<span style="border-color:'+COL[i]+'">'+esc(m.names[i]||'?')+': <b>'+x+'</b></span>').join('')+'</div>'+(s.lock?'<p class=mut style="text-align:center">No match — flipping back…</p>':'')}

function render(m){cm=m;inRoom=true;const s=m.state,n=m.names,over=s&&s.win!==undefined;if(lastCode!==m.code){$('chat').innerHTML='';lastCode=m.code;sel=-1;history.replaceState(0,'',location.pathname)}show('room');$('rt').textContent=GN[m.game]+' · '+m.code+(m.seat<0?' (watching)':'')+(m.spec?` · 👁 ${m.spec}`:'');const PCOL=k=>m.game==='ludo'?LCOL[s?slot(s,k):k]:COL[k];$('pl').innerHTML=n.map((x,k)=>`<span class=pl style="border-color:${PCOL(k)};color:${PCOL(k)}">${esc(x)}${s&&s.turn===k&&!over?' ▸':''}</span>`).join('')+(n.length<m.max?`<span class=mut> waiting for ${m.max-n.length} more…</span>`:'');
 const sig=JSON.stringify(s);if(sig!==lastSig){if(lastSig)beep(m.seat==(s&&s.turn)?640:440);lastSig=sig}
 let h='',ac='';if(!s){$('st').innerHTML=n.length<2?'Waiting for players… share the link or code <b>'+m.code+'</b>':m.host?'Ready when you are':'Waiting for the host to start';if(m.host&&n.length>=2)ac='<button class=pri onclick="send({t:\'start\'})">▶ Start game</button>'}
 else{$('st').innerHTML=over?(s.win==='d'?'🤝 Draw!':'🏆 <b>'+esc(n[s.win]||'?')+'</b> wins!'):m.seat===s.turn?'<b style="color:var(--c3)">Your turn</b>':esc(n[s.turn])+"'s turn";if(over&&celeb!==m.code+m.round){celeb=m.code+m.round;if(s.win===m.seat){confetti();beep(880,.3)}}if(over&&m.seat>=0)ac=m.max>2?(m.host?'<button class=pri onclick="send({t:\'again\'})">↻ Play again</button>':''):'<button class=pri onclick="send({t:\'again\'})">↻ Rematch</button>';
 if(m.game==='ttt')h='<div class=b3>'+s.b.map((v,i)=>`<button onclick="mv({i:${i}})" style="color:${v==='X'?COL[0]:COL[1]}">${v}</button>`).join('')+'</div>';
 if(m.game==='c4')h='<div class=b7>'+s.b.map((v,i)=>`<div class="cell ${v>=0?'p'+v:''}" onclick="mv({c:${i%7}})"></div>`).join('')+'</div>';
 if(m.game==='snl')h=snlUI(m);if(m.game==='chess')h=chessUI(m);if(m.game==='ludo')h=ludoUI(m);if(m.game==='checkers')h=checkersUI(m);if(m.game==='battleship')h=battleUI(m);if(m.game==='memory')h=memoryUI(m)}
 $('bd').innerHTML=h;$('ac').innerHTML=ac}
connect();
