const JUMP={16:6,47:26,49:11,56:53,62:19,64:60,87:24,93:73,95:75,98:78,1:38,4:14,9:31,21:42,28:84,36:44,51:67,71:91,80:100};
const daily=()=>['ttt','c4','snl','chess','ludo'][Math.floor(Date.now()/864e5)%5];
const nextT=(s,k)=>{let j=k;for(let i=0;i<s.n;i++){j=(j+1)%s.n;if(!s.out[j])return j}return k};
const SAFE=[0,8,13,21,26,34,39,47],LP=i=>i<13?[i,0]:i<26?[13,i-13]:i<39?[13-(i-26),13]:[0,13-(i-39)];
const slot=(s,k)=>s.n==2?[0,2][k]:k;
const YARD=[[[3,4],[4,4],[3,5],[4,5]],[[8,3],[9,3],[8,4],[9,4]],[[9,8],[10,8],[9,9],[10,9]],[[3,9],[4,9],[3,10],[4,10]]];
function LM(s,k){return[0,1,2,3].filter(i=>{const p=s.pos[k][i];return p<0?s.roll==6:p+s.roll<=56})}
function LXY(sl,p,i){if(p<0)return YARD[sl][i];if(p<=50)return LP((sl*13+p)%52);const e=LP((sl*13+50)%52),d=e[0]==0?[1,0]:e[0]==13?[-1,0]:e[1]==0?[0,1]:[0,-1],j=p-50;return[e[0]+d[0]*j,e[1]+d[1]*j]}
const G={
 ttt:{init:()=>({b:Array(9).fill(''),turn:0}),move(s,k,m){const i=m.i;if(s.turn!=k||s.b[i]!==''||!(i>=0&&i<9))return 1;s.b[i]=k?'O':'X';
  const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  if(L.some(l=>l.every(j=>s.b[j]===s.b[i])))s.win=k;else if(s.b.every(x=>x))s.win='d';else s.turn=1-k}},
 c4:{init:()=>({b:Array(42).fill(-1),turn:0}),move(s,k,m){const c=m.c;if(s.turn!=k||!(c>=0&&c<7))return 1;let r=5;while(r>=0&&s.b[r*7+c]>=0)r--;if(r<0)return 1;s.b[r*7+c]=k;
  const w=[[0,1],[1,0],[1,1],[1,-1]].some(([dr,dc])=>{let n=1;for(const g of[1,-1]){let a=r+dr*g,b=c+dc*g;while(a>=0&&a<6&&b>=0&&b<7&&s.b[a*7+b]===k){n++;a+=dr*g;b+=dc*g}}return n>=4});
  if(w)s.win=k;else if(s.b.every(x=>x>=0))s.win='d';else s.turn=1-k}},
 snl:{init:n=>({n,pos:Array(n).fill(1),turn:0,roll:0,out:Array(n).fill(false)}),move(s,k){if(s.turn!=k)return 1;const r=1+Math.floor(Math.random()*6);s.roll=r;let p=s.pos[k]+r;if(p<=100){p=JUMP[p]||p;s.pos[k]=p}
  if(s.pos[k]==100)s.win=k;else s.turn=r==6?k:nextT(s,k)}},
 ludo:{init:n=>({n,pos:Array.from({length:n},()=>[-1,-1,-1,-1]),turn:0,roll:0,rolled:false,out:Array(n).fill(false)}),move(s,k,m){if(s.turn!=k)return 1;
  if(m.roll){if(s.rolled)return 1;s.roll=1+Math.floor(Math.random()*6);if(LM(s,k).length)s.rolled=true;else s.turn=nextT(s,k);return}
  if(!s.rolled||!LM(s,k).includes(m.tok))return 1;const p=s.pos[k][m.tok],np=p<0?0:p+s.roll;s.pos[k][m.tok]=np;
  if(np<=50){const c=(slot(s,k)*13+np)%52;if(!SAFE.includes(c))s.pos.forEach((P,j)=>{if(j!=k)P.forEach((q,i)=>{if(q>=0&&q<=50&&(slot(s,j)*13+q)%52==c)P[i]=-1})})}
  if(s.pos[k].every(x=>x==56))s.win=k;else{s.rolled=false;if(s.roll!=6)s.turn=nextT(s,k)}}}
};
//CHESS
const NJ=[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]],KJ=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]],PCS={k:'♚\uFE0E',q:'♛\uFE0E',r:'♜\uFE0E',b:'♝\uFE0E',n:'♞\uFE0E',p:'♟\uFE0E'};
const chessInit=()=>({b:('rnbqkbnr'+'pppppppp'+'.'.repeat(32)+'PPPPPPPP'+'RNBQKBNR').split(''),turn:0,cast:'KQkq',ep:-1,last:null});
function att(b,q,by){const r=q>>3,c=q&7,own=p=>p!='.'&&((p==p.toUpperCase())==(by==0)),ok=(y,x)=>y>=0&&y<8&&x>=0&&x<8;
 const pr=by==0?r+1:r-1;for(const dc of[-1,1])if(ok(pr,c+dc)&&b[pr*8+c+dc]==(by==0?'P':'p'))return 1;
 for(const[dr,dc]of NJ)if(ok(r+dr,c+dc)&&b[(r+dr)*8+c+dc]==(by==0?'N':'n'))return 1;
 for(const[dr,dc]of KJ){let y=r+dr,x=c+dc,i=1;while(ok(y,x)){const p=b[y*8+x];if(p!='.'){if(own(p)){const u=p.toUpperCase(),d=dr&&dc;if(u=='Q'||(u=='R'&&!d)||(u=='B'&&d)||(u=='K'&&i==1))return 1}break}y+=dr;x+=dc;i++}}
 return 0}
function pseudo(s,t){const b=s.b,m=[],ok=(y,x)=>y>=0&&y<8&&x>=0&&x<8,em=(y,x)=>b[y*8+x]=='.',en=(y,x)=>{const o=b[y*8+x];return o!='.'&&(o==o.toUpperCase())!=(t==0)};
 for(let q=0;q<64;q++){const p=b[q];if(p=='.'||(p==p.toUpperCase())!=(t==0))continue;const r=q>>3,c=q&7,u=p.toUpperCase();
  if(u=='P'){const d=t==0?-1:1,st=t==0?6:1;if(ok(r+d,c)&&em(r+d,c)){m.push([q,(r+d)*8+c]);if(r==st&&em(r+2*d,c))m.push([q,(r+2*d)*8+c])}
   for(const dc of[-1,1])if(ok(r+d,c+dc)&&(en(r+d,c+dc)||(r+d)*8+c+dc==s.ep))m.push([q,(r+d)*8+c+dc])}
  else if(u=='N'||u=='K'){for(const[dr,dc]of(u=='N'?NJ:KJ)){const y=r+dr,x=c+dc;if(ok(y,x)&&(em(y,x)||en(y,x)))m.push([q,y*8+x])}}
  else for(const[dr,dc]of KJ){if(u=='R'&&dr&&dc||u=='B'&&!(dr&&dc))continue;let y=r+dr,x=c+dc;while(ok(y,x)){if(em(y,x))m.push([q,y*8+x]);else{if(en(y,x))m.push([q,y*8+x]);break}y+=dr;x+=dc}}}
 return m}
function apply(s,[f,to]){const b=s.b.slice(),p=b[f],t=s.turn,u=p.toUpperCase();let ep=-1,cast=s.cast;
 if(u=='P'&&to==s.ep&&b[to]=='.')b[to+(t==0?8:-8)]='.';
 if(u=='P'&&Math.abs(to-f)==16)ep=(f+to)/2;
 if(u=='K'&&Math.abs(to-f)==2){const rf=to>f?f+3:f-4,rt=to>f?f+1:f-1;b[rt]=b[rf];b[rf]='.'}
 b[to]=p;b[f]='.';if(u=='P'&&(to>>3==0||to>>3==7))b[to]=t==0?'Q':'q';
 const rm=x=>cast=cast.replace(x,'');if(p=='K'){rm('K');rm('Q')}if(p=='k'){rm('k');rm('q')}
 if(f==63||to==63)rm('K');if(f==56||to==56)rm('Q');if(f==7||to==7)rm('k');if(f==0||to==0)rm('q');
 return{b,turn:1-t,cast,ep,last:[f,to]}}
function legal(s){const t=s.turn,kc=t==0?'K':'k',out=[];
 for(const mv of pseudo(s,t)){const n=apply(s,mv);if(!att(n.b,n.b.indexOf(kc),1-t))out.push(mv)}
 const row=t==0?56:0,ki=row+4,R=t==0?'R':'r',b=s.b,A=q=>att(b,q,1-t);
 if(b[ki]==kc&&!A(ki)){
  if(s.cast.includes(t==0?'K':'k')&&b[row+5]=='.'&&b[row+6]=='.'&&b[row+7]==R&&!A(row+5)&&!A(row+6))out.push([ki,row+6]);
  if(s.cast.includes(t==0?'Q':'q')&&b[row+1]=='.'&&b[row+2]=='.'&&b[row+3]=='.'&&b[row]==R&&!A(row+3)&&!A(row+2))out.push([ki,row+2])}
 return out}
//ENDCHESS
G.chess={init:chessInit,move(s,k,m){if(s.turn!=k||!legal(s).some(x=>x[0]==m.f&&x[1]==m.t))return 1;Object.assign(s,apply(s,[m.f,m.t]));
 if(!legal(s).length)s.win=att(s.b,s.b.indexOf(s.turn==0?'K':'k'),1-s.turn)?k:'d'}};

if(typeof module!='undefined')module.exports={G,daily};
