const DEFAULT_HABITS = [
  ["study","Study 2 hours","Make focused time for learning"],
  ["lectures","Attend All Lectures","Show up and take part"],
  ["workout","Gym workout","Move your body and build strength"],
  ["water","Drink 3–4 L water","Stay hydrated throughout the day"],
  ["reading","Read 10 Pages","Read a little every day"],
  ["coding","Coding Practice 1 hour","Keep improving your coding skills"],
  ["social","No social media to study","Protect your study time"],
  ["sleep","Sleep before 11:30","Make time for proper rest"],
  ["revision","Revise college lectures & notes","Review what you learned"],
  ["project","Build Project","Make progress on a project"]
].map(([id,name,detail])=>({id,name,detail}));
const KEY="habitflow-dashboard-v2";
let store=loadStore(), selectedDate=new Date();
selectedDate.setHours(0,0,0,0);
const months=["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
function loadStore(){try{const x=JSON.parse(localStorage.getItem(KEY));if(x&&x.days)return {...x,habits:x.habits||DEFAULT_HABITS,theme:x.theme||"light"};}catch(e){}return {habits:DEFAULT_HABITS,days:{},theme:"light"}}
function save(){localStorage.setItem(KEY,JSON.stringify(store))}
function key(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function record(d){return store.days[key(d)]||(store.days[key(d)]={})}
function daysInMonth(y,m){return new Date(y,m+1,0).getDate()}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function monthStats(habit,y,m){let yes=0;for(let day=1;day<=daysInMonth(y,m);day++){const d=new Date(y,m,day);if(record(d)[habit.id])yes++}return {yes,no:daysInMonth(y,m)-yes,pct:Math.round(yes/daysInMonth(y,m)*100)}}
function initSelectors(){
 const hs=document.getElementById("habitSelect"), ms=document.getElementById("monthSelect");
 hs.innerHTML=store.habits.map(h=>`<option value="${h.id}">${escapeHtml(h.name)}</option>`).join("");
 ms.innerHTML=months.map((m,i)=>`<option value="${i}">${m}</option>`).join("");
 ms.value=selectedDate.getMonth();
 hs.addEventListener("change",renderDashboard);ms.addEventListener("change",renderDashboard);
}
function applyTheme(){document.body.classList.toggle("dark",store.theme==="dark");document.getElementById("themeToggle").innerHTML=store.theme==="dark"?'☀ <span>Light mode</span>':'☾ <span>Dark mode</span>'}
document.getElementById("themeToggle").addEventListener("click",()=>{store.theme=store.theme==="dark"?"light":"dark";save();applyTheme();renderDashboard()});
function setupCanvas(canvas,height=190){
 const dpr=window.devicePixelRatio||1,w=canvas.clientWidth||300;canvas.style.height=height+"px";canvas.width=w*dpr;canvas.height=height*dpr;
 const ctx=canvas.getContext("2d");ctx.scale(dpr,dpr);return {ctx,w,h:height};
}
function css(name){return getComputedStyle(document.body).getPropertyValue(name).trim()}
function drawBarChart(){
 const {ctx,w,h}=setupCanvas(document.getElementById("yearChart"),190),y=new Date().getFullYear(),habit=store.habits.find(x=>x.id===document.getElementById("habitSelect").value)||store.habits[0];
 const values=months.map((_,m)=>monthStats(habit,y,m).pct),pad={l:31,r:8,t:12,b:27},cw=w-pad.l-pad.r,ch=h-pad.t-pad.b;
 ctx.font="10px DM Sans";ctx.textAlign="right";ctx.textBaseline="middle";
 [0,25,50,75,100].forEach(v=>{let yy=pad.t+ch-(v/100)*ch;ctx.strokeStyle=css("--line");ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(w-pad.r,yy);ctx.stroke();ctx.fillStyle=css("--muted");ctx.fillText(v+"%",pad.l-7,yy)});
 const gap=5,bw=(cw-gap*11)/12;
 values.forEach((v,i)=>{let bh=ch*v/100,x=pad.l+i*(bw+gap);ctx.fillStyle=i===Number(document.getElementById("monthSelect").value)?css("--green-dark"):css("--blue");ctx.beginPath();ctx.roundRect(x,pad.t+ch-bh,Math.max(2,bw),Math.max(0,bh),[4,4,0,0]);ctx.fill();ctx.fillStyle=css("--muted");ctx.textAlign="center";ctx.fillText(months[i],x+bw/2,h-10)});
}
function drawDonut(yes,no){
 const {ctx,w,h}=setupCanvas(document.getElementById("donutChart"),175),cx=w/2,cy=h/2,r=Math.min(w,h)*.37,thick=20,total=yes+no||1;
 ctx.lineWidth=thick;ctx.lineCap="butt";ctx.strokeStyle=css("--line");ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
 ctx.strokeStyle=css("--green");ctx.beginPath();ctx.arc(cx,cy,r,-Math.PI/2,-Math.PI/2+Math.PI*2*yes/total);ctx.stroke();
}
function drawTrend(){
 const {ctx,w,h}=setupCanvas(document.getElementById("trendChart"),180),y=selectedDate.getFullYear(),m=Number(document.getElementById("monthSelect").value),habit=store.habits.find(x=>x.id===document.getElementById("habitSelect").value)||store.habits[0],n=daysInMonth(y,m);
 const vals=Array.from({length:n},(_,i)=>record(new Date(y,m,i+1))[habit.id]?100:0),p={l:29,r:8,t:14,b:25},cw=w-p.l-p.r,ch=h-p.t-p.b;
 ctx.font="10px DM Sans";ctx.textAlign="right";ctx.textBaseline="middle";
 [0,50,100].forEach(v=>{let yy=p.t+ch-ch*v/100;ctx.strokeStyle=css("--line");ctx.beginPath();ctx.moveTo(p.l,yy);ctx.lineTo(w-p.r,yy);ctx.stroke();ctx.fillStyle=css("--muted");ctx.fillText(v+"%",p.l-6,yy)});
 ctx.beginPath();vals.forEach((v,i)=>{let x=p.l+(n===1?0:i/(n-1))*cw,yy=p.t+ch-ch*v/100;i?ctx.lineTo(x,yy):ctx.moveTo(x,yy)});ctx.strokeStyle=css("--blue");ctx.lineWidth=2;ctx.stroke();
 [1,Math.ceil(n/4),Math.ceil(n/2),Math.ceil(n*3/4),n].forEach(day=>{let x=p.l+(n===1?0:(day-1)/(n-1))*cw;ctx.fillStyle=css("--muted");ctx.textAlign="center";ctx.fillText(day,x,h-9)});
}
function renderDashboard(){
 const habit=store.habits.find(h=>h.id===document.getElementById("habitSelect").value)||store.habits[0],y=selectedDate.getFullYear(),m=Number(document.getElementById("monthSelect").value),stats=monthStats(habit,y,m),n=daysInMonth(y,m);
 document.getElementById("selectedScore").textContent=stats.pct+"%";document.getElementById("selectedScoreText").textContent=`${stats.yes} completed out of ${n} days`;
 document.getElementById("yesCount").textContent=stats.yes;document.getElementById("noCount").textContent=stats.no;
 let totalDone=0,totalPossible=store.habits.length*n;
 store.habits.forEach(h=>{for(let d=1;d<=n;d++)if(record(new Date(y,m,d))[h.id])totalDone++});
 document.getElementById("allDone").textContent=totalDone;document.getElementById("overallScore").textContent=(totalPossible?Math.round(totalDone/totalPossible*100):0)+"%";
 document.getElementById("yearTag").textContent=y;document.getElementById("donutPercent").textContent=stats.pct+"%";document.getElementById("legendYes").textContent=stats.yes;document.getElementById("legendNo").textContent=stats.no;
 document.getElementById("trendTitle").textContent=habit.name+" — daily trend";
 drawBarChart();drawDonut(stats.yes,stats.no);drawTrend();
 const ranked=store.habits.map(h=>({h,...monthStats(h,y,m)})).sort((a,b)=>b.pct-a.pct);
 document.getElementById("leaderboard").innerHTML=ranked.map(x=>`<div class="leader-row"><div class="leader-name" title="${escapeHtml(x.h.name)}">${escapeHtml(x.h.name)}</div><div class="leader-percent">${x.pct}%</div><div class="leader-track"><span style="width:${x.pct}%"></span></div></div>`).join("");
 renderHabits();
}
function renderHabits(){
 const r=record(selectedDate),done=store.habits.filter(h=>r[h.id]).length,total=store.habits.length,pct=Math.round(done/total*100);
 document.getElementById("dayLabel").textContent=selectedDate.toDateString()===new Date().toDateString()?"Check off what you complete today.":`Habits for ${selectedDate.toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}`;
 document.getElementById("dayProgressText").textContent=`${done} of ${total} complete`;document.getElementById("dayProgressFill").style.width=pct+"%";document.getElementById("dayProgressPercent").textContent=pct+"%";
 document.getElementById("habitList").innerHTML=store.habits.map(h=>{const isDone=!!r[h.id];return `<article class="habit-row ${isDone?"done":""}"><button class="check" data-id="${h.id}" aria-label="Toggle ${escapeHtml(h.name)}">${isDone?"✓":""}</button><div class="habit-copy"><p class="habit-name">${escapeHtml(h.name)}</p><p class="habit-detail">${escapeHtml(h.detail)}</p></div><span class="status">${isDone?"Completed":"Not done"}</span></article>`}).join("");
 document.querySelectorAll(".check").forEach(b=>b.addEventListener("click",()=>{const r=record(selectedDate);if(r[b.dataset.id])delete r[b.dataset.id];else r[b.dataset.id]=true;save();renderDashboard()}));
}
function setDate(delta){selectedDate.setDate(selectedDate.getDate()+delta);document.getElementById("monthSelect").value=selectedDate.getMonth();renderDashboard()}
document.getElementById("prevDay").addEventListener("click",()=>setDate(-1));document.getElementById("nextDay").addEventListener("click",()=>setDate(1));document.getElementById("todayBtn").addEventListener("click",()=>{selectedDate=new Date();selectedDate.setHours(0,0,0,0);document.getElementById("monthSelect").value=selectedDate.getMonth();renderDashboard()});
document.getElementById("todayLabel").textContent=new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"});
window.addEventListener("resize",()=>{clearTimeout(window._chartResize);window._chartResize=setTimeout(renderDashboard,100)});
initSelectors();applyTheme();renderDashboard();
