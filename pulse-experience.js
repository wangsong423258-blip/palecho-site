(() => {
  "use strict";
  const experience = document.getElementById("pulse-experience");
  const scroll = document.getElementById("pulse-scroll");
  const opening = document.getElementById("pulse-opening");
  const score = document.getElementById("pulse-score");
  const scoreStage = document.getElementById("pulse-score-stage");
  const closeButton = document.getElementById("pulse-close");
  const particleCanvas = document.getElementById("pulse-particles");
  const trendCanvas = document.getElementById("pulse-trend-chart");
  if (!experience || !scroll || !opening || !score || !particleCanvas || !trendCanvas) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const timers = new Set();
  let isOpen = false, restoreScrollY = 0, closingTimer = 0, raf = 0, chartDrawn = false;
  let particles = [], pointer = { x: -9999, y: -9999 }, previousScroll = 0;
  const statuses = ["今天状态稳定", "心率保持平稳", "睡眠恢复良好", "未发现异常变化", "Mira 正在持续学习你的宠物"];
  const analyses = ["今天睡眠恢复效果优于昨天", "今日活动量略高于平均水平", "未检测到异常体温趋势", "健康基线持续完善", "Mira 正在不断理解你的宠物"];
  const data = { heart:[72,74,71,76,81,79,77,83,80,76,75,78], breath:[20,21,21,22,23,22,21,22,23,22,21,22], temp:[38.1,38.15,38.2,38.2,38.25,38.3,38.28,38.3,38.32,38.3], sleep:[7.6,8.1,7.9,8.35,8.7,8.2,8.35], activity:[.61,.66,.63,.74,.71,.78,.73], location:[.38,.42,.4,.47,.62,.69,.63,.74,.71,.65] };
  const later = (fn, ms) => { const id = window.setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
  const clearTimers = () => { timers.forEach((id) => clearTimeout(id)); timers.clear(); };
  const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
  const ease = (n) => 1 - Math.pow(1 - clamp(n), 4);

  function sizeCanvas(canvas) { const r = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2); canvas.width = Math.max(1, Math.round(r.width * dpr)); canvas.height = Math.max(1, Math.round(r.height * dpr)); const c = canvas.getContext("2d"); c.setTransform(dpr,0,0,dpr,0,0); return [c,r.width,r.height]; }
  function strokeCurve(ctx, points, color, progress = 1, width = 1.5) { const shown = Math.max(2, Math.ceil(points.length * progress)); ctx.beginPath(); points.slice(0,shown).forEach((p,i) => { if (!i) ctx.moveTo(p.x,p.y); else { const q=points[i-1], m=(q.x+p.x)/2; ctx.bezierCurveTo(m,q.y,m,p.y,p.x,p.y); } }); ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap="round";ctx.lineJoin="round";ctx.stroke(); }
  function drawMini(canvas) {
    const [ctx,w,h] = sizeCanvas(canvas), key = canvas.dataset.chart, card = canvas.closest(".pulse-metric"), color = getComputedStyle(card).getPropertyValue("--metric-color").trim(), pad = 3;
    ctx.clearRect(0,0,w,h);
    if (key === "location") return drawLocationMap(ctx,w,h,color);
    ctx.strokeStyle = "rgba(17,17,17,.055)"; ctx.lineWidth = 1;
    [0.28,0.68].forEach(level => { ctx.beginPath();ctx.moveTo(0,Math.round(h*level)+.5);ctx.lineTo(w,Math.round(h*level)+.5);ctx.stroke(); });
    if (key === "activity") return drawActivityBars(ctx,w,h,color,pad);
    if (key === "sleep") return drawSleepStages(ctx,w,h,color,pad);
    const values = key === "heart"
      ? [.50,.48,.51,.49,.50,.46,.52,.38,.74,.30,.51,.48,.49,.50,.47,.52,.49,.48,.51,.50,.46,.53,.38,.73,.29,.50,.48,.51,.49]
      : key === "breath"
        ? [.50,.53,.61,.69,.72,.68,.59,.48,.38,.30,.27,.32,.41,.51,.60,.68,.71,.66,.56,.45,.35,.29,.31,.39,.49]
        : [38.16,38.17,38.19,38.20,38.22,38.22,38.24,38.28,38.31,38.30,38.31,38.33,38.32,38.31];
    const min = Math.min(...values), max = Math.max(...values), range = Math.max(.01,max-min), points = values.map((v,i)=>({x:pad+i/(values.length-1)*(w-pad*2),y:pad+(1-(v-min)/range)*(h-pad*2)}));
    const area = ctx.createLinearGradient(0,0,0,h); area.addColorStop(0,color+"2b"); area.addColorStop(1,"rgba(255,255,255,0)");
    ctx.beginPath(); points.forEach((p,i)=>{if(!i)ctx.moveTo(p.x,p.y);else{const q=points[i-1],m=(q.x+p.x)/2;ctx.bezierCurveTo(m,q.y,m,p.y,p.x,p.y);}});ctx.lineTo(points.at(-1).x,h);ctx.lineTo(points[0].x,h);ctx.closePath();ctx.fillStyle=area;ctx.fill();strokeCurve(ctx,points,color,1,key === "heart" ? 1.3 : 1.55);
    const last=points.at(-1);ctx.fillStyle="#fff";ctx.strokeStyle=color;ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(last.x,last.y,2.6,0,Math.PI*2);ctx.fill();ctx.stroke();
  }
  function drawSleepStages(ctx,w,h,color,pad) {
    const levels=[.26,.26,.55,.55,.76,.76,.46,.46,.68,.68,.32,.32,.57,.57,.42], width=(w-pad*2)/(levels.length-1);
    ctx.beginPath(); levels.forEach((level,i)=>{const x=pad+i*width,y=pad+(1-level)*(h-pad*2);if(!i)ctx.moveTo(x,y);else ctx.lineTo(x,y);});ctx.strokeStyle=color;ctx.lineWidth=1.65;ctx.lineJoin="round";ctx.stroke();
    ctx.fillStyle=color+"24";ctx.lineTo(w-pad,h-pad);ctx.lineTo(pad,h-pad);ctx.closePath();ctx.fill();
  }
  function drawActivityBars(ctx,w,h,color,pad) {
    const bars=[.16,.24,.12,.34,.55,.42,.78,.63,.88,.46,.71,.36], gap=Math.max(2,w*.025), bar=(w-pad*2-gap*(bars.length-1))/bars.length;
    bars.forEach((level,i)=>{const height=Math.max(2,level*(h-pad*2)),x=pad+i*(bar+gap),y=h-pad-height;ctx.fillStyle=color+(i===8?"ba":"62");ctx.beginPath();ctx.roundRect(x,y,bar,height,Math.min(2,bar/2));ctx.fill();});
  }
  function drawLocationMap(ctx,w,h,color) {
    ctx.fillStyle="#f6f8f8";ctx.fillRect(0,0,w,h);ctx.strokeStyle="rgba(106,128,128,.25)";ctx.lineWidth=.7;
    const roads=[[[.02,.18],[.30,.25],[.48,.17],[.73,.28],[1,.18]],[[.05,.78],[.22,.60],[.48,.66],[.73,.51],[.98,.62]],[[.23,0],[.31,.39],[.24,1]],[[.63,0],[.55,.32],[.68,.70],[.61,1]]];
    roads.forEach(road=>{ctx.beginPath();road.forEach(([x,y],i)=>i?ctx.lineTo(x*w,y*h):ctx.moveTo(x*w,y*h));ctx.stroke();});
    const route=[[.15,.76],[.27,.61],[.39,.48],[.52,.55],[.63,.38],[.74,.29],[.86,.36]];ctx.beginPath();route.forEach(([x,y],i)=>i?ctx.lineTo(x*w,y*h):ctx.moveTo(x*w,y*h));ctx.strokeStyle=color;ctx.lineWidth=1.7;ctx.lineCap="round";ctx.lineJoin="round";ctx.stroke();
    const [x,y]=route.at(-1);ctx.fillStyle="#fff";ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x*w,y*h,3.1,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle="#557a70";ctx.font=`${Math.max(7,Math.min(9,w*.08))}px Inter, sans-serif`;ctx.fillText("PalEcho",Math.max(2,x*w-21),Math.max(9,y*h-7));
  }
  function drawMinis() { experience.querySelectorAll(".pulse-mini-chart").forEach(drawMini); }
  function drawTrend(progress = 1) { const [ctx,w,h]=sizeCanvas(trendCanvas), values=[89,90,90,91,91,92,91,92,93,92,93,94,93,94,94,95,94,95,95,96,95,96,96,97,96,97,97,98,97,98], min=88,max=99; const points=values.map((v,i)=>({x:8+i/(values.length-1)*(w-16),y:20+(1-(v-min)/(max-min))*(h-48)}));ctx.clearRect(0,0,w,h);strokeCurve(ctx,points,"#a9cfee",progress,2); if(progress>=1){const p=points[points.length-1];ctx.fillStyle="#fff";ctx.strokeStyle="#96c7ed";ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fill();ctx.stroke();} return points; }
  function animateTrend() { if(chartDrawn) return; chartDrawn=true; const start=performance.now(), dur=reduceMotion?1:1450; const frame=(now)=>{drawTrend(ease((now-start)/dur));if(now-start<dur)requestAnimationFrame(frame);};requestAnimationFrame(frame); }
  function countScore() { const start=performance.now(),dur=reduceMotion?1:1500; const frame=(now)=>{score.textContent=Math.round(98*ease((now-start)/dur));if(now-start<dur)requestAnimationFrame(frame);};requestAnimationFrame(frame); }
  function setRotator(element, items, duration, formatter) { let index=0; const cycle=()=>later(()=>{element.classList.add("is-changing");later(()=>{index=(index+1)%items.length;element.innerHTML=formatter(items[index]);element.classList.remove("is-changing");cycle();},520);},duration);cycle(); }
  function setEvent(event) { const card=document.getElementById("pulse-event-card"); if(!card) return; card.innerHTML=`<time>${event.dataset.time}</time><strong>${event.dataset.title}</strong><span>${event.dataset.copy}</span>`; card.classList.add("is-visible"); }
  function activateReveal() { const observer=new IntersectionObserver((entries)=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");if(entry.target.querySelector(".pulse-metrics")) entry.target.querySelector(".pulse-metrics").classList.add("is-visible");if(entry.target.querySelector("#pulse-trend-card")) animateTrend();}}),{root:scroll,threshold:.16}); experience.querySelectorAll("[data-pulse-reveal]").forEach(node=>observer.observe(node)); return observer; }
  function initParticles() { const ctx=particleCanvas.getContext("2d"); let w=0,h=0,dpr=1; const resize=()=>{const r=particleCanvas.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,2);w=r.width;h=r.height;particleCanvas.width=w*dpr;particleCanvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);particles=Array.from({length:Math.min(110,Math.max(46,Math.round(w/16)))},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.15+.2,vx:(Math.random()-.5)*.09,vy:(Math.random()-.5)*.09,seed:Math.random()*Math.PI*2}));}; resize(); const render=(now)=>{if(!isOpen){raf=0;return;}ctx.clearRect(0,0,w,h);const scrollDelta=(scroll.scrollTop-previousScroll)*.002;previousScroll=scroll.scrollTop;particles.forEach(p=>{const dx=pointer.x-p.x,dy=pointer.y-p.y,dist=Math.hypot(dx,dy);if(dist<150){p.vx+=dx*.000004;p.vy+=dy*.000004;}p.x+=p.vx;p.y+=p.vy+scrollDelta;p.vx*=.99;p.vy*=.99;if(p.x<-3)p.x=w+3;if(p.x>w+3)p.x=-3;if(p.y<-3)p.y=h+3;if(p.y>h+3)p.y=-3;ctx.fillStyle="rgba(115,160,198,.025)";ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();});raf=requestAnimationFrame(render);}; window.addEventListener("resize",resize);raf=requestAnimationFrame(render);return()=>{window.removeEventListener("resize",resize);cancelAnimationFrame(raf);raf=0;}; }
  let stopParticles=()=>{}, revealObserver;
  function showDashboard() { if(!isOpen)return; experience.classList.add("is-dashboard");opening.setAttribute("aria-hidden","true");countScore();drawMinis();revealObserver=activateReveal();setRotator(document.getElementById("pulse-live-status"),statuses,7000,(item)=>`<span aria-hidden="true">●</span><p>${item}</p>`);setRotator(document.getElementById("pulse-analysis-copy"),analyses,15000,(item)=>item);later(()=>closeButton?.focus({preventScroll:true}),600); }
  function openPulse() { if(isOpen)return;window.clearTimeout(closingTimer);isOpen=true;restoreScrollY=window.scrollY;scroll.scrollTop=0;previousScroll=0;chartDrawn=false;score.textContent="0";opening.classList.remove("is-leaving");experience.classList.remove("is-closing","is-dashboard");experience.setAttribute("aria-hidden","false");document.body.classList.add("pulse-open");document.querySelector("[data-pulse-last-launch='true']")?.removeAttribute("data-pulse-last-launch");window.requestAnimationFrame(()=>{experience.classList.add("is-open");experience.focus({preventScroll:true});stopParticles=initParticles();});if(reduceMotion){later(showDashboard,20);return;}later(()=>opening.classList.add("is-leaving"),1000);later(showDashboard,1900); }
  function closePulse() { if(!isOpen)return;isOpen=false;clearTimers();revealObserver?.disconnect();stopParticles();experience.classList.add("is-closing");experience.classList.remove("is-open");experience.setAttribute("aria-hidden","true");document.body.classList.remove("pulse-open");closingTimer=later(()=>{experience.classList.remove("is-closing","is-dashboard");opening.classList.remove("is-leaving");window.scrollTo({top:restoreScrollY,behavior:"instant"});document.querySelector("[data-pulse-last-launch='true']")?.focus({preventScroll:true});},reduceMotion?10:550); }
  document.addEventListener("click",(event)=>{const launch=event.target.closest("[data-pulse-launch]");if(!launch||experience.contains(launch))return;event.preventDefault();event.stopImmediatePropagation();launch.setAttribute("data-pulse-last-launch","true");openPulse();},true);
  closeButton?.addEventListener("click",closePulse);document.addEventListener("keydown",(event)=>{if(isOpen&&event.key==="Escape"){event.preventDefault();closePulse();}});
  scoreStage?.addEventListener("pointermove",(event)=>{const r=scoreStage.getBoundingClientRect(),x=(event.clientX-r.left)/r.width-.5,y=(event.clientY-r.top)/r.height-.5;scoreStage.style.setProperty("--score-x",`${-y*.9}deg`);scoreStage.style.setProperty("--score-y",`${x*1.2}deg`);});scoreStage?.addEventListener("pointerleave",()=>{scoreStage.style.setProperty("--score-x","0deg");scoreStage.style.setProperty("--score-y","0deg");});experience.addEventListener("pointermove",(event)=>{const r=experience.getBoundingClientRect();pointer={x:event.clientX-r.left,y:event.clientY-r.top};});
  experience.querySelectorAll(".pulse-event").forEach(event=>{event.addEventListener("mouseenter",()=>setEvent(event));event.addEventListener("focus",()=>setEvent(event));event.addEventListener("click",()=>setEvent(event));});
  const dot=document.getElementById("pulse-timeline-dot");let timelineProgress=1;const flow=()=>{if(isOpen&&dot){timelineProgress=(timelineProgress+.026)%96;dot.style.setProperty("--timeline-progress",`${timelineProgress}%`);experience.querySelectorAll(".pulse-event").forEach(node=>{const pos=parseFloat(node.style.getPropertyValue("--event-position"));node.classList.toggle("is-passing",Math.abs(pos-timelineProgress)<.55);});}requestAnimationFrame(flow);};requestAnimationFrame(flow);
  const trendCard=document.getElementById("pulse-trend-card"),tooltip=document.getElementById("pulse-trend-tooltip");trendCard?.addEventListener("pointermove",()=>{tooltip?.classList.add("is-visible");});trendCard?.addEventListener("pointerleave",()=>tooltip?.classList.remove("is-visible"));window.addEventListener("resize",()=>{if(isOpen){drawMinis();if(chartDrawn)drawTrend();}});
})();
