const JUMP={16:6,47:26,49:11,56:53,62:19,64:60,87:24,93:73,95:75,98:78,1:38,4:14,9:31,21:42,28:84,36:44,51:67,71:91,80:100};
const daily=()=>['ttt','c4','snl','chess','ludo','checkers','battleship','memory'][Math.floor(Date.now()/864e5)%8];
const nextT=(s,k)=>{let j=k;for(let i=0;i<s.n;i++){j=(j+1)%s.n;if(!s.out[j])return j}return k};
const SAFE=[0,8,13,21,26,34,39,47];
const PATH=(()=>{const p=[],a=(r,c)=>p.push([c,r]);for(let c=1;c<=5;c++)a(6,c);for(let r=5;r>=0;r--)a(r,6);a(0,7);a(0,8);for(let r=1;r<=5;r++)a(r,8);for(let c=9;c<=14;c++)a(6,c);a(7,14);a(8,14);for(let c=13;c>=9;c--)a(8,c);for(let r=9;r<=14;r++)a(r,8);a(14,7);a(14,6);for(let r=13;r>=9;r--)a(r,6);for(let c=5;c>=0;c--)a(8,c);a(7,0);a(6,0);return p})();
const LP=i=>PATH[i];
const slot=(s,k)=>s.n==2?[0,2][k]:k;
const YARD=[[0,0],[9,0],[9,9],[0,9]].map(([ox,oy])=>[[ox+1.5,oy+1.5],[ox+3.5,oy+1.5],[ox+1.5,oy+3.5],[ox+3.5,oy+3.5]]);
function LM(s,k){return[0,1,2,3].filter(i=>{const p=s.pos[k][i];return p<0?s.roll==6:p+s.roll<=56})}
function LXY(sl,p,i){if(p<0)return YARD[sl][i];if(p<=50)return LP((sl*13+p)%52);const e=LP((sl*13+50)%52),H=[[1,0],[0,1],[-1,0],[0,-1]][sl],j=p-50;return[e[0]+H[0]*j,e[1]+H[1]*j]}

function tttWin(b,k){const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];return L.some(l=>l.every(i=>b[i]===k))}
const G={
 ttt:{init:()=>({n:2,b:Array(9).fill(''),turn:0,out:[false,false]}),move(s,k,m){const i=Number(m.i);if(s.turn!==k||!Number.isInteger(i)||i<0||i>8||s.b[i])return 1;s.b[i]=k?'O':'X';if(tttWin(s.b,s.b[i]))s.win=k;else if(s.b.every(Boolean))s.win='d';else s.turn=1-k}},
 c4:{init:()=>({n:2,b:Array(42).fill(-1),turn:0,out:[false,false]}),move(s,k,m){const c=Number(m.c);if(s.turn!==k||!Number.isInteger(c)||c<0||c>6)return 1;let r=5;while(r>=0&&s.b[r*7+c]>=0)r--;if(r<0)return 1;s.b[r*7+c]=k;const w=[[0,1],[1,0],[1,1],[1,-1]].some(([dr,dc])=>{let n=1;for(const g of[1,-1]){let a=r+dr*g,b=c+dc*g;while(a>=0&&a<6&&b>=0&&b<7&&s.b[a*7+b]===k){n++;a+=dr*g;b+=dc*g}}return n>=4});if(w)s.win=k;else if(s.b.every(x=>x>=0))s.win='d';else s.turn=1-k}},
 snl:{init:n=>({n,pos:Array(n).fill(1),turn:0,roll:0,out:Array(n).fill(false)}),move(s,k){if(s.turn!==k)return 1;const r=1+Math.floor(Math.random()*6);s.roll=r;let p=s.pos[k]+r;p=p>100?s.pos[k]:(JUMP[p]||p);s.pos[k]=p;if(p===100)s.win=k;else s.turn=r===6?k:nextT(s,k)}},
 ludo:{init:n=>({n,pos:Array.from({length:n},()=>[-1,-1,-1,-1]),turn:0,roll:0,rolled:false,out:Array(n).fill(false)}),move(s,k,m){if(s.turn!==k)return 1;if(m.roll){if(s.rolled)return 1;s.roll=1+Math.floor(Math.random()*6);if(LM(s,k).length)s.rolled=true;else s.turn=nextT(s,k);return}if(!s.rolled||!LM(s,k).includes(Number(m.tok)))return 1;const tok=Number(m.tok),p=s.pos[k][tok],np=p<0?0:p+s.roll;s.pos[k][tok]=np;if(np<=50){const c=(slot(s,k)*13+np)%52;if(!SAFE.includes(c))s.pos.forEach((P,j)=>{if(j!==k)P.forEach((q,i)=>{if(q>=0&&q<=50&&(slot(s,j)*13+q)%52===c)P[i]=-1})})}if(s.pos[k].every(x=>x===56))s.win=k;else{s.rolled=false;if(s.roll!==6)s.turn=nextT(s,k)}}},

 battleship:{
  init:()=>{const make=()=>{const sizes=[5,4,3,3,2],b=Array(100).fill(0),ships=[];for(const len of sizes){let ok=false;while(!ok){const hor=Math.random()<.5,r=Math.floor(Math.random()*(hor?10:11-len)),c=Math.floor(Math.random()*(hor?11-len:10)),cells=[];for(let i=0;i<len;i++)cells.push((r+(hor?0:i))*10+c+(hor?i:0));if(cells.every(q=>!b[q])){cells.forEach(q=>b[q]=1);ships.push(cells);ok=true}}}return{b,ships}};const a=make(),z=make();return{n:2,turn:0,out:[false,false],phase:'play',boards:[a.b,z.b],ships:[a.ships,z.ships],shots:[Array(100).fill(0),Array(100).fill(0)],last:-1}},
  move(s,k,m){if(s.turn!==k)return 1;const q=Number(m.q);if(!Number.isInteger(q)||q<0||q>99||s.shots[k][q])return 1;s.shots[k][q]=s.boards[1-k][q]?2:1;s.last=q;const alive=s.boards[1-k].reduce((a,v,i)=>a+(v&&s.shots[k][i]===2?0:v),0);if(alive===0)s.win=k;else s.turn=1-k}
 },

};

const NJ=[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]],KJ=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]],PCS={k:'♚\uFE0E',q:'♛\uFE0E',r:'♜\uFE0E',b:'♝\uFE0E',n:'♞\uFE0E',p:'♟\uFE0E'};
const chessInit=()=>({n:2,b:('rnbqkbnr'+'pppppppp'+'.'.repeat(32)+'PPPPPPPP'+'RNBQKBNR').split(''),turn:0,cast:'KQkq',ep:-1,last:null,out:[false,false]});
function att(b,q,by){const r=q>>3,c=q&7,own=p=>p!='.'&&((p==p.toUpperCase())==(by==0)),ok=(y,x)=>y>=0&&y<8&&x>=0&&x<8,pr=by==0?r+1:r-1;for(const dc of[-1,1])if(ok(pr,c+dc)&&b[pr*8+c+dc]==(by==0?'P':'p'))return 1;for(const[dr,dc]of NJ)if(ok(r+dr,c+dc)&&b[(r+dr)*8+c+dc]==(by==0?'N':'n'))return 1;for(const[dr,dc]of KJ){let y=r+dr,x=c+dc,i=1;while(ok(y,x)){const p=b[y*8+x];if(p!='.'){if(own(p)){const u=p.toUpperCase(),d=dr&&dc;if(u=='Q'||(u=='R'&&!d)||(u=='B'&&d)||(u=='K'&&i==1))return 1}break}y+=dr;x+=dc;i++}}return 0}
function pseudo(s,t){const b=s.b,m=[],ok=(y,x)=>y>=0&&y<8&&x>=0&&x<8,em=(y,x)=>b[y*8+x]=='.',en=(y,x)=>{const o=b[y*8+x];return o!='.'&&o.toUpperCase()!='K'&&(o==o.toUpperCase())!=(t==0)};for(let q=0;q<64;q++){const p=b[q];if(p=='.'||(p==p.toUpperCase())!=(t==0))continue;const r=q>>3,c=q&7,u=p.toUpperCase();if(u=='P'){const d=t==0?-1:1,st=t==0?6:1;if(ok(r+d,c)&&em(r+d,c)){m.push([q,(r+d)*8+c]);if(r==st&&em(r+2*d,c))m.push([q,(r+2*d)*8+c])}for(const dc of[-1,1])if(ok(r+d,c+dc)&&(en(r+d,c+dc)||(r+d)*8+c+dc==s.ep))m.push([q,(r+d)*8+c+dc])}else if(u=='N'||u=='K'){for(const[dr,dc]of(u=='N'?NJ:KJ)){const y=r+dr,x=c+dc;if(ok(y,x)&&(em(y,x)||en(y,x)))m.push([q,y*8+x])}}else for(const[dr,dc]of KJ){if(u=='R'&&dr&&dc||u=='B'&&!(dr&&dc))continue;let y=r+dr,x=c+dc;while(ok(y,x)){if(em(y,x))m.push([q,y*8+x]);else{if(en(y,x))m.push([q,y*8+x]);break}y+=dr;x+=dc}}}return m}
function apply(s,[f,to]){const b=s.b.slice(),p=b[f],t=s.turn,u=p.toUpperCase();let ep=-1,cast=s.cast;if(u=='P'&&to==s.ep&&b[to]=='.')b[to+(t==0?8:-8)]='.';if(u=='P'&&Math.abs(to-f)==16)ep=(f+to)/2;if(u=='K'&&Math.abs(to-f)==2){const rf=to>f?f+3:f-4,rt=to>f?f+1:f-1;b[rt]=b[rf];b[rf]='.'}b[to]=p;b[f]='.';if(u=='P'&&(to>>3==0||to>>3==7))b[to]=t==0?'Q':'q';const rm=x=>cast=cast.replace(x,'');if(p=='K'){rm('K');rm('Q')}if(p=='k'){rm('k');rm('q')}if(f==63||to==63)rm('K');if(f==56||to==56)rm('Q');if(f==7||to==7)rm('k');if(f==0||to==0)rm('q');return{b,turn:1-t,cast,ep,last:[f,to]}}
function legal(s){const t=s.turn,kc=t==0?'K':'k',out=[];for(const mv of pseudo(s,t)){const n=apply(s,mv),ki=n.b.indexOf(kc);if(ki>=0&&!att(n.b,ki,1-t))out.push(mv)}const row=t==0?56:0,ki=row+4,R=t==0?'R':'r',b=s.b,A=q=>att(b,q,1-t);if(b[ki]==kc&&!A(ki)){if(s.cast.includes(t==0?'K':'k')&&b[row+5]=='.'&&b[row+6]=='.'&&b[row+7]==R&&!A(row+5)&&!A(row+6))out.push([ki,row+6]);if(s.cast.includes(t==0?'Q':'q')&&b[row+1]=='.'&&b[row+2]=='.'&&b[row+3]=='.'&&b[row]==R&&!A(row+3)&&!A(row+2))out.push([ki,row+2])}return out}
G.chess={init:chessInit,move(s,k,m){if(s.turn!==k||!legal(s).some(x=>x[0]==m.f&&x[1]==m.to))return 1;Object.assign(s,apply(s,[m.f,m.to]));const next=s.turn,ki=s.b.indexOf(next==0?'K':'k');if(!legal(s).length)s.win=att(s.b,ki,1-next)?k:'d'}};


const CK={own:q=>q.toLowerCase()==='r'?0:1,rc:i=>{const r=Math.floor(i/4);return[r,2*(i%4)+((r+1)%2)]},idx:(r,c)=>r<0||r>7||c<0||c>7||(r+c)%2===0?-1:r*4+Math.floor(c/2)};
const CKD=[[1,1],[1,-1],[-1,1],[-1,-1]];
function ckDirs(p){return p.toUpperCase()===p?CKD:CKD.filter(d=>p==='r'?d[0]<0:d[0]>0)}
function ckJumps(s,i){const p=s.b[i],[r,c]=CK.rc(i),o=[];for(const[dr,dc]of ckDirs(p)){const a=CK.idx(r+dr,c+dc),z=CK.idx(r+2*dr,c+2*dc);if(a>=0&&z>=0&&s.b[a]&&CK.own(s.b[a])!==CK.own(p)&&!s.b[z])o.push([z,a])}return o}
function ckSteps(s,i){const p=s.b[i],[r,c]=CK.rc(i),o=[];for(const[dr,dc]of ckDirs(p)){const a=CK.idx(r+dr,c+dc);if(a>=0&&!s.b[a])o.push(a)}return o}
const ckAnyJump=(s,k)=>s.b.some((q,i)=>q&&CK.own(q)===k&&ckJumps(s,i).length>0);
const ckAnyMove=(s,k)=>s.b.some((q,i)=>q&&CK.own(q)===k&&(ckJumps(s,i).length>0||ckSteps(s,i).length>0));
G.checkers={
 init:()=>{const b=Array(32).fill('');for(let i=0;i<12;i++){b[i]='b';b[31-i]='r'}return{n:2,b,turn:0,out:[false,false],chain:-1}},
 move(s,k,m){if(s.turn!==k)return 1;const f=Number(m.f),t=Number(m.to);if(!Number.isInteger(f)||!Number.isInteger(t)||f<0||f>31||t<0||t>31)return 1;
  const p=s.b[f];if(!p||CK.own(p)!==k||s.b[t])return 1;if(s.chain>=0&&f!==s.chain)return 1;
  const jp=ckJumps(s,f).find(x=>x[0]===t);let cap=-1;
  if(jp)cap=jp[1];else{if(s.chain>=0||!ckSteps(s,f).includes(t)||ckAnyJump(s,k))return 1}
  s.b[f]='';s.b[t]=p;if(cap>=0)s.b[cap]='';
  const row=CK.rc(t)[0];let kinged=false;if(p==='r'&&row===0){s.b[t]='R';kinged=true}if(p==='b'&&row===7){s.b[t]='B';kinged=true}
  if(cap>=0&&!kinged&&ckJumps(s,t).length){s.chain=t}else{s.chain=-1;s.turn=1-k;if(!ckAnyMove(s,1-k))s.win=k}
  return 0}};
G.memory={
 init:n=>{const pairs=n<=2?8:12,vals=[];for(let v=0;v<pairs;v++)vals.push(v,v);for(let i=vals.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[vals[i],vals[j]]=[vals[j],vals[i]]}return{n,turn:0,out:Array(n).fill(false),deck:vals,open:Array(vals.length).fill(false),matched:Array(vals.length).fill(false),scores:Array(n).fill(0),pick:[],lock:false,pendingFlip:null,pendingBy:-1}},
 move(s,k,m){if(s.turn!==k||s.lock)return 1;const q=Number(m.q);if(!Number.isInteger(q)||q<0||q>=s.deck.length||s.open[q]||s.matched[q])return 1;s.open[q]=true;s.pick.push(q);
  if(s.pick.length===2){const[a,b]=s.pick;if(s.deck[a]===s.deck[b]){s.matched[a]=s.matched[b]=true;s.scores[k]++;s.pick=[];if(s.matched.every(Boolean)){const mx=Math.max(...s.scores),w=s.scores.map((x,i)=>x===mx?i:-1).filter(i=>i>=0);s.win=w.length>1?'d':w[0]}}else{s.lock=true;s.pendingFlip=[a,b];s.pendingBy=k}}
  return 0},
 view:(s)=>({...s,deck:s.deck.map((v,i)=>s.open[i]||s.matched[i]?v:-1)})};
G.battleship.view=(s,seat)=>{const o=s.win!==undefined;return{...s,boards:[0,1].map(i=>o||i===seat?s.boards[i]:s.boards[i].map((x,q)=>x&&s.shots[1-i][q]===2?1:0)),ships:[0,1].map(i=>o||i===seat?s.ships[i]:[])}};

if(typeof window!=='undefined')Object.assign(window,{JUMP,daily,SAFE,LP,slot,LM,LXY,YARD,PCS,legal});
if(typeof module!=='undefined')module.exports={G,daily};
