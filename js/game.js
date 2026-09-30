/* President Simulator — core game state & simulation */
(function(){
  const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const $=s=>document.querySelector(s);
  const fmt$=v=>{ const a=Math.abs(v); const s=v<0?"-":""; if(a>=1000) return s+"$"+(a/1000).toFixed(2)+"T"; return s+"$"+a.toFixed(1)+"B"; };
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const rnd=(a,b)=>a+Math.random()*(b-a);
  const pick=a=>a[Math.floor(Math.random()*a.length)];

  let S=null; // state
  let saveKey="president-sim-save-v1";

  function flag(iso){ return iso.replace(/./g,c=>String.fromCodePoint(127397+c.charCodeAt(0))); }
  window.flagEmoji = flag;

  function newGame(iso){
    const c = window.COUNTRY_MAP[iso];
    const gdp = Math.max(c.gdp, 3);
    S = {
      playerIso: iso, selectedIso: iso,
      year: 2026, month: 0, turn: 0,
      gdpB: gdp, treasuryB: +(gdp*0.12).toFixed(1),
      approval: 55, stability: 65, prestige: 50,
      taxRate: 20,
      spend: {health:10, edu:8, mil:8, infra:8},
      inflation: 2.5, unemployment: 6.0, gdpGrowth: 2.0,
      relations: {}, trades: [], allies: [], sanctions: [], wars: {},
      embargo: [], log: [], gameOver:false, won:false,
      lowApprovalStreak:0, autoPlay:false,
      stats:{monthsRuled:0, warsWon:0, dealsSigned:0}
    };
    // seed relations: neighbors/region slightly positive, great powers nuanced
    window.COUNTRIES.forEach(k=>{
      if(k[0]===iso) return;
      let base = rnd(-8,8);
      if(k[3]===c.region) base+=8;
      if(["US","CN","RU","GB","FR","DE"].includes(k[0])) base+=rnd(-5,10);
      S.relations[k[0]] = Math.round(clamp(base,-20,30));
    });
    log(`🏛️ You were sworn in as President of <b>${c.name}</b>!`, "good");
    log(`Treasury ${fmt$(S.treasuryB)} • GDP ${fmt$(S.gdpB)} • Approval ${S.approval}%`, "");
    log(`Tip: tap any country on the map for diplomacy. Press <b>Next Month</b> to rule.`, "");
    save(); renderAll();
  }

  function log(html, cls){
    if(!S) return;
    S.log.unshift({t:`${MONTHS[S.month]} ${S.year}`, html, cls:cls||""});
    if(S.log.length>120) S.log.pop();
  }

  function monthlyEconomy(){
    const monthlyGDP = S.gdpB/12;
    // revenue
    const collectEff = 0.92 - S.unemployment*0.004;
    const revenue = monthlyGDP*(S.taxRate/100)*collectEff;
    // expenses
    const totSpendPct = S.spend.health+S.spend.edu+S.spend.mil+S.spend.infra;
    const spending = monthlyGDP*(totSpendPct/100)*0.5;
    // trade income
    let tradeIncome = 0;
    S.trades.forEach(()=>{ tradeIncome += monthlyGDP*0.012; });
    tradeIncome = Math.min(tradeIncome, monthlyGDP*0.15);
    // war cost
    const warCount = Object.keys(S.wars).length;
    const warCost = warCount * (monthlyGDP*0.06 + 1.2);
    // sanctions drag
    const sancCost = S.sanctions.length*monthlyGDP*0.004;
    // aid upkeep? handled instantly
    const net = revenue - spending + tradeIncome - warCost - sancCost;
    S.treasuryB += net;

    // GDP growth
    const base = 0.18;
    let growth = base
      + S.spend.infra*0.012 + S.spend.edu*0.010
      - S.taxRate*0.008
      + (S.stability-60)*0.004
      + S.trades.length*0.02
      - warCount*0.25
      - S.sanctions.length*0.015
      + (S.spend.health-8)*0.004
      + rnd(-0.25,0.3);
    growth = clamp(growth,-2.5,2.5);
    S.gdpB = Math.max(1, S.gdpB*(1+growth/100/1*0.25)); // damp monthly (quarterly-ish feel)
    S.gdpGrowth = clamp(S.gdpGrowth*0.7 + growth*4*0.3, -12, 12);

    // unemployment
    const uTarget = 6 + (S.taxRate-20)*0.22 - (S.spend.infra-8)*0.22 - S.gdpGrowth*0.9 + warCount*0.4;
    S.unemployment = clamp(S.unemployment*0.85 + clamp(uTarget,2,25)*0.15, 2, 30);
    // inflation
    const deficit = (spending+warCost-revenue)/Math.max(monthlyGDP,0.01);
    const iTarget = 2 + deficit*8 + rnd(-0.3,0.3);
    S.inflation = clamp(S.inflation*0.85+iTarget*0.15, -2, 30);
    // approval drift
    let aDrift = (50-S.approval)*0.03
      + (S.spend.health-10)*0.25 + (S.spend.edu-8)*0.15
      - (S.taxRate-20)*0.45
      + (S.stability-60)*0.12
      + S.gdpGrowth*0.9 - (S.unemployment-6)*0.7
      - warCount*1.2 + (S.prestige-50)*0.03
      + rnd(-1.2,1.2);
    if(S.treasuryB<0) aDrift -= 1.5; // debt angers voters
    S.approval = clamp(S.approval+aDrift, 0, 100);
    // stability drift
    let sDrift = (60-S.stability)*0.04 + (S.approval-50)*0.05 + (S.spend.mil-8)*0.2 - warCount*0.8 + rnd(-1,1);
    S.stability = clamp(S.stability+sDrift, 0, 100);
    // prestige drift to 50
    S.prestige = clamp(S.prestige + (50-S.prestige)*0.02 + rnd(-0.8,0.8), 0, 100);
    // relations drift
    for(const k in S.relations){
      S.relations[k] += (0-S.relations[k])*0.01;
      if(S.wars[k]) S.relations[k]=clamp(S.relations[k]-1.5,-100,100);
      else if(S.allies.includes(k)) S.relations[k]=clamp(S.relations[k]+0.3,-100,100);
      else if(S.trades.includes(k)) S.relations[k]=clamp(S.relations[k]+0.15,-100,100);
      S.relations[k]=clamp(S.relations[k],-100,100);
    }
    return {revenue, spending, tradeIncome, warCost, net, growth};
  }

  function warTick(){
    const me = militaryPower(S.playerIso);
    for(const iso of Object.keys(S.wars)){
      const w = S.wars[iso];
      w.months++;
      const foe = militaryPower(iso)*rnd(0.85,1.2);
      const edge = me - foe + rnd(-8,8);
      w.score += edge*0.08;
      const cn = window.COUNTRY_MAP[iso];
      if(w.score>60){
        // victory
        delete S.wars[iso];
        const loot = Math.max(2, cn.gdp*0.03);
        S.treasuryB+=loot; S.prestige=clamp(S.prestige+12,0,100); S.approval=clamp(S.approval+8,0,100);
        S.stats.warsWon++;
        const i=S.sanctions.indexOf(iso); if(i>=0)S.sanctions.splice(i,1);
        S.relations[iso]=-30;
        log(`🏆 <b>Victory!</b> ${cn.name} surrendered. War reparations ${fmt$(loot)}.`, "good");
      } else if(w.score<-60){
        delete S.wars[iso];
        S.prestige=clamp(S.prestige-15,0,100); S.approval=clamp(S.approval-10,0,100); S.stability=clamp(S.stability-10,0,100);
        S.treasuryB-=Math.max(2, S.gdpB*0.02);
        log(`💀 Defeat... ${cn.name} repelled our forces. Humiliating peace signed.`, "bad");
      } else {
        S.approval=clamp(S.approval-rnd(0.5,1.5),0,100);
        S.stability=clamp(S.stability-rnd(0.3,1),0,100);
        if(w.months%3===0) log(`⚔️ War with ${cn.name}: ${w.score>0?"we advance!":"front stalls."} (${Math.round(w.score)})`, w.score>0?"good":"bad");
      }
    }
  }

  function militaryPower(iso){
    if(iso===S.playerIso) return S.spend.mil*3 + Math.log10(S.gdpB+1)*12 + S.prestige*0.05;
    const c=window.COUNTRY_MAP[iso];
    return 8*1.2 + Math.log10(c.gdp+1)*12 + rnd(-4,4);
  }

  function nextMonth(){
    if(!S||S.gameOver) return;
    S.turn++; S.stats.monthsRuled++;
    S.month++; if(S.month>11){S.month=0;S.year++;}
    const e = monthlyEconomy();
    warTick();
    // monthly summary occasionally
    if(e.net<-S.gdpB/12*0.1) log(`📉 Deficit ${fmt$(e.net)} — revenue ${fmt$(e.revenue)} vs spending ${fmt$(e.spending)}.`, "bad");
    // random events (~38% chance)
    if(Math.random()<0.38){
      const ev = pick(window.EVENTS);
      openEvent(ev);
    }
    // debt / approval checks
    if(S.treasuryB < -S.gdpB*0.5){
      return endGame(false, "💸 <b>Bankruptcy!</b> The state defaulted. Parliament removed you.");
    }
    if(S.approval<15){ S.lowApprovalStreak++; } else S.lowApprovalStreak=0;
    if(S.lowApprovalStreak>=6){
      return endGame(false, "🚨 <b>Overthrown!</b> Approval collapsed. Mass uprising stormed the palace.");
    }
    if(S.stability<=3 && Object.keys(S.wars).length>0){
      if(Math.random()<0.2) return endGame(false,"🪖 <b>Military coup!</b> Generals seized power as chaos reigned.");
    }
    // elections every 48 months
    if(S.turn%48===0){
      if(S.approval>=50){
        S.prestige=clamp(S.prestige+8,0,100);
        log(`🗳️ <b>Re-elected!</b> ${Math.round(S.approval)}% voted for you. Four more years!`, "good");
        toast("🎉 Re-elected!");
      } else {
        return endGame(false, `🗳️ <b>Election lost!</b> Only ${Math.round(S.approval)}% voted for you. You leave the palace.`);
      }
    }
    if(S.turn>=240){ // 20 years = legendary
      return endGame(true, "👑 <b>Legend!</b> 20 years in power. Statues built in your honor.");
    }
    save(); renderAll();
  }

  // ---------- diplomacy ----------
  function costScaled(base){ return Math.max(base, S.gdpB*0.004); }
  function doDiplomacy(action){
    const iso=S.selectedIso; if(!iso||iso===S.playerIso) return toast("Select another country on the map first.");
    const c=window.COUNTRY_MAP[iso];
    const rel=()=>Math.round(S.relations[iso]||0);
    switch(action){
      case "visit": {
        const cost=costScaled(0.4);
        if(!spend(cost)) return;
        S.relations[iso]=clamp(rel()+rnd(8,14),-100,100); S.prestige=clamp(S.prestige+2,0,100); S.approval=clamp(S.approval+1,0,100);
        log(`✈️ State visit to ${c.name}. Relations now ${Math.round(S.relations[iso])}.`, "good"); break; }
      case "aid": {
        const cost=costScaled(1.5);
        if(!spend(cost)) return;
        S.relations[iso]=clamp(rel()+rnd(14,22),-100,100); S.prestige=clamp(S.prestige+4,0,100);
        log(`🎁 Sent ${fmt$(cost)} aid to ${c.name}. Relations now ${Math.round(S.relations[iso])}.`, "good"); break; }
      case "trade": {
        if(S.trades.includes(iso)) return toast("Trade deal already active.");
        if(rel()<0) return toast("Need relations ≥ 0 for trade. Send visits/aid first.");
        S.trades.push(iso); S.relations[iso]=clamp(rel()+8,-100,100); S.stats.dealsSigned++;
        log(`🤝 Trade deal signed with ${c.name}! Income +${fmt$(S.gdpB/12*0.012)}/mo.`, "good"); break; }
      case "ally": {
        if(S.allies.includes(iso)) return toast("Already allies.");
        if(rel()<50) return toast("Need relations ≥ 50 to ally.");
        const cost=costScaled(1.0); if(!spend(cost)) return;
        S.allies.push(iso); S.prestige=clamp(S.prestige+3,0,100);
        log(`🛡️ <b>Alliance</b> with ${c.name}! They will deter your enemies.`, "good"); break; }
      case "sanction": {
        if(S.sanctions.includes(iso)){ // lift
          S.sanctions=S.sanctions.filter(x=>x!==iso); S.relations[iso]=clamp(rel()+10,-100,100);
          log(`🔓 Sanctions on ${c.name} lifted.`, ""); break;
        }
        S.sanctions.push(iso); S.relations[iso]=clamp(rel()-22,-100,100); S.prestige=clamp(S.prestige-2,0,100);
        log(`⛔ Sanctioned ${c.name}. Their economy suffers; yours slightly too.`, "bad"); break; }
      case "threaten": {
        S.relations[iso]=clamp(rel()-rnd(10,18),-100,100); S.prestige=clamp(S.prestige-3,0,100);
        S.approval=clamp(S.approval+1,0,100);
        log(`😠 You threatened ${c.name}. Relations now ${Math.round(S.relations[iso])}. Risky...`, "bad");
        if(S.relations[iso]<-70 && Math.random()<0.25){ startWar(iso, true); }
        break; }
      case "war": {
        startWar(iso,false); break; }
      case "peace": {
        if(!S.wars[iso]) return toast("Not at war.");
        delete S.wars[iso]; S.relations[iso]=-20; S.prestige=clamp(S.prestige-4,0,100);
        log(`🕊️ Peace signed with ${c.name}. Guns fall silent.`, "good"); break; }
    }
    save(); renderAll();
  }
  function startWar(iso, provoked){
    const c=window.COUNTRY_MAP[iso];
    if(S.wars[iso]) return;
    if(S.spend.mil<6) { toast("Military too weak (raise Mil budget ≥ 6)."); return; }
    S.wars[iso]={months:0, score: provoked?-10:0};
    S.relations[iso]=-80; S.prestige=clamp(S.prestige-5,0,100); S.stability=clamp(S.stability-5,0,100);
    S.allies.forEach(()=>{ S.prestige=clamp(S.prestige+1,0,100); });
    log(`⚔️ <b>WAR</b> with ${c.name}! ${provoked?"They struck first!":"You ordered the invasion."} Victory needs military edge + money.`, "bad");
  }
  function spend(b){
    if(S.treasuryB<b-0.001){ toast(`Not enough funds (need ${fmt$(b)}). Raise taxes or cut spending.`); return false; }
    S.treasuryB-=b; return true;
  }

  // ---------- decrees (domestic one-click policies) ----------
  const DECREES=[
    {id:"stimulus", name:"💵 Stimulus checks", desc:"-$ dub, +approval +growth", run(){ const c=costScaled(3); if(!spend(c))return; S.approval=clamp(S.approval+6,0,100); S.gdpB*=1.01; log(`💵 Stimulus sent! Approval +6.`,"good"); }},
    {id:"health", name:"🏥 Health reform", desc:"+health effect, -$", run(){ const c=costScaled(2); if(!spend(c))return; S.spend.health=clamp(S.spend.health+1,0,30); S.approval=clamp(S.approval+3,0,100); S.stability=clamp(S.stability+2,0,100); log(`🏥 Hospitals funded. Health budget now ${S.spend.health}%.`,"good"); }},
    {id:"crackdown", name:"🚔 Anti-corruption purge", desc:"+stability, risk approval", run(){ S.stability=clamp(S.stability+5,0,100); S.approval=clamp(S.approval+rnd(-3,3),0,100); S.prestige=clamp(S.prestige+2,0,100); log(`🚔 Corrupt officials jailed on live TV! Stability +5.`,"good"); }},
    {id:"parade", name:"🎖️ Military parade", desc:"+prestige +approval, -$", run(){ const c=costScaled(0.8); if(!spend(c))return; S.prestige=clamp(S.prestige+5,0,100); S.approval=clamp(S.approval+2,0,100); log(`🎖️ Tanks roll through capital. Patriots cheer!`,"good"); }},
    {id:"festival2", name:"🎪 National holiday", desc:"+approval, small cost", run(){ const c=costScaled(0.5); if(!spend(c))return; S.approval=clamp(S.approval+4,0,100); log(`🎪 Day off declared! Approval +4.`,"good"); }},
    {id:"austerity", name:"📉 Austerity", desc:"+treasury, -approval", run(){ S.treasuryB+=Math.max(1,S.gdpB*0.01); S.approval=clamp(S.approval-4,0,100); log(`📉 Austerity: treasury padded, people grumble.`,"bad"); }},
  ];

  function endGame(won, html){
    S.gameOver=true; S.won=won;
    log(html, won?"good":"bad");
    localStorage.removeItem(saveKey);
    renderAll();
    showGameOver(won, html);
  }

  // ---------- persistence ----------
  function save(){ try{ if(S&&!S.gameOver) localStorage.setItem(saveKey, JSON.stringify(S)); }catch(e){} }
  function load(){ try{ const r=localStorage.getItem(saveKey); if(!r) return null; const s=JSON.parse(r); if(!s||!s.playerIso||!window.COUNTRY_MAP[s.playerIso]) return null; return s; }catch(e){ return null; } }

  // ---------- events modal ----------
  let pendingEvent=null;
  function openEvent(ev){
    pendingEvent=ev;
    $("#evTitle").textContent=ev.t;
    $("#evDesc").textContent=ev.d;
    const box=$("#evChoices"); box.innerHTML="";
    ev.choices.forEach((ch,i)=>{
      const b=document.createElement("button");
      b.className="choice-btn"; b.textContent=ch.label;
      b.onclick=()=>resolveEvent(i);
      box.appendChild(b);
    });
    $("#eventModal").classList.add("show");
  }
  function resolveEvent(i){
    const ev=pendingEvent; if(!ev) return;
    const ch=ev.choices[i];
    applyFx(ch.fx||{});
    log(`<b>${ev.t}</b> ${ch.msg||""}`, "event");
    $("#eventModal").classList.remove("show");
    pendingEvent=null;
    save(); renderAll();
  }
  function applyFx(fx){
    if(fx.treasuryPct) S.treasuryB += S.gdpB*fx.treasuryPct*0.15; // scaled: events cost a fraction of monthly revenue, not of GDP
    if(fx.approval) S.approval=clamp(S.approval+fx.approval,0,100);
    if(fx.stability) S.stability=clamp(S.stability+fx.stability,0,100);
    if(fx.prestige) S.prestige=clamp(S.prestige+fx.prestige,0,100);
    if(fx.gdpGrowth){ S.gdpB=Math.max(1,S.gdpB*(1+fx.gdpGrowth/100*0.5)); S.gdpGrowth=clamp(S.gdpGrowth+fx.gdpGrowth, -15,15); }
    if(fx.relAll){ for(const k in S.relations) S.relations[k]=clamp(S.relations[k]+fx.relAll,-100,100); }
    if(fx.healthBonus){ S.spend.health=clamp(S.spend.health+fx.healthBonus,0,30); }
    if(fx.milBonus){ S.spend.mil=clamp(S.spend.mil+fx.milBonus,0,30); }
  }

  // ---------- rendering ----------
  function toast(msg){
    const t=$("#toast"); t.textContent=msg; t.classList.add("show");
    clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove("show"),2600);
  }
  window._toast=toast;

  function meter(v){ return `<div class="bar"><div class="fill" style="width:${clamp(v,0,100)}%"></div></div>`; }

  function renderAll(){
    if(!S) return;
    renderTop(); renderTabs(); renderMapList(); renderDiplo(); renderNews(); renderDecrees();
    if(window.WorldMap) window.WorldMap.setState(S), window.WorldMap.refresh();
    drawEconomy();
  }

  function renderTop(){
    const c=window.COUNTRY_MAP[S.playerIso];
    $("#flagName").textContent=`${flag(S.playerIso)} ${c.name}`;
    $("#dateLine").textContent=`${MONTHS[S.month]} ${S.year} • Month ${S.turn}`;
    $("#statTreasury").textContent=fmt$(S.treasuryB);
    $("#statTreasury").className="stat-val "+(S.treasuryB<0?"neg":"pos");
    $("#statApproval").textContent=Math.round(S.approval)+"%";
    $("#statGDP").textContent=fmt$(S.gdpB);
    $("#statPrestige").textContent=Math.round(S.prestige);
    $("#topApprovalBar").style.width=clamp(S.approval,0,100)+"%";
  }

  let activeTab="map";
  window.switchTab=function(t){ activeTab=t; renderTabs(); };
  function renderTabs(){
    document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active", b.dataset.tab===activeTab));
    document.querySelectorAll(".panel").forEach(p=>p.classList.toggle("active", p.id==="panel-"+activeTab));
  }

  function drawEconomy(){
    $("#taxVal").textContent=S.taxRate+"%";
    $("#taxRange").value=S.taxRate;
    ["health","edu","mil","infra"].forEach(k=>{
      $("#sp_"+k).value=S.spend[k];
      $("#sp_"+k+"_v").textContent=S.spend[k]+"%";
    });
    const monthlyGDP=S.gdpB/12;
    const rev=monthlyGDP*(S.taxRate/100)*0.9;
    const tot=S.spend.health+S.spend.edu+S.spend.mil+S.spend.infra;
    const exp=monthlyGDP*(tot/100)*0.5;
    $("#ecoNums").innerHTML=`
      <div class="kpi"><span>GDP</span><b>${fmt$(S.gdpB)}</b><small>growth ${S.gdpGrowth>=0?"+":""}${S.gdpGrowth.toFixed(1)}%/yr</small></div>
      <div class="kpi"><span>Revenue/mo</span><b>${fmt$(rev)}</b><small>tax ${S.taxRate}%</small></div>
      <div class="kpi"><span>Spending/mo</span><b>${fmt$(exp)}</b><small>budget ${tot}% of GDP</small></div>
      <div class="kpi"><span>Unemployment</span><b>${S.unemployment.toFixed(1)}%</b><small>inflation ${S.inflation.toFixed(1)}%</small></div>
      <div class="kpi"><span>Stability</span><b>${Math.round(S.stability)}</b>${meter(S.stability)}</div>
      <div class="kpi"><span>Approval</span><b>${Math.round(S.approval)}%</b>${meter(S.approval)}</div>`;
  }

  function renderMapList(){
    const q=($("#search").value||"").toLowerCase();
    const rf=$("#regionFilter").value;
    const sf=$("#sortFilter").value;
    let list=window.COUNTRIES.map(c=>({iso:c[0],name:c[1],region:c[3],pop:c[4],gdp:c[5],rel:S.playerIso===c[0]?999:(S.relations[c[0]]||0)}));
    if(rf!=="ALL") list=list.filter(x=>window.COUNTRY_MAP[x.iso].region===rf);
    if(q) list=list.filter(x=>x.name.toLowerCase().includes(q)||x.iso.toLowerCase()===q);
    list.sort((a,b)=> sf==="REL"?(b.rel-a.rel): sf==="GDP"?(b.gdp-a.gdp): sf==="POP"?(b.pop-a.pop): a.name.localeCompare(b.name));
    const box=$("#countryList");
    box.innerHTML=list.slice(0,120).map(x=>{
      const war=S.wars[x.iso]?" ⚔️":"", ally=S.allies.includes(x.iso)?" 🛡️":"", tr=S.trades.includes(x.iso)?" 🤝":"";
      const relCls=x.rel===999?"me":(x.rel>=20?"fr":(x.rel<=-20?"en":""));
      const relTxt=x.rel===999?"YOU":Math.round(x.rel);
      return `<div class="crow ${S.selectedIso===x.iso?"sel":""}" data-iso="${x.iso}">
        <span class="cflag">${flag(x.iso)}</span>
        <span class="cname">${x.name}${war}${ally}${tr}</span>
        <span class="crel ${relCls}">${relTxt}</span></div>`;
    }).join("");
    box.querySelectorAll(".crow").forEach(el=>{
      el.onclick=()=>{ S.selectedIso=el.dataset.iso; save(); renderAll(); if(window.WorldMap) window.WorldMap.focus(S.selectedIso); };
    });
  }

  function renderDiplo(){
    const iso=S.selectedIso, box=$("#diploBox");
    if(!iso){ box.innerHTML="<p class='muted'>Tap a country on the map or list.</p>"; return; }
    const c=window.COUNTRY_MAP[iso];
    if(iso===S.playerIso){
      box.innerHTML=`<div class="dcard"><h3>${flag(iso)} ${c.name} (YOU)</h3>
      <p class="muted">Capital ${c.capital} • Pop ${c.pop}M • GDP ${fmt$(c.gdp)}</p>
      <p>Rule well, President. Manage economy, survive elections every 4 years, avoid bankruptcy & coups.</p>
      <div class="warbox">${Object.keys(S.wars).length?("⚔️ At war with: "+Object.keys(S.wars).map(w=>window.COUNTRY_MAP[w].name).join(", ")):"☮️ At peace."}</div></div>`;
      return;
    }
    const rel=Math.round(S.relations[iso]||0);
    const atWar=!!S.wars[iso], ally=S.allies.includes(iso), tr=S.trades.includes(iso), sn=S.sanctions.includes(iso);
    box.innerHTML=`<div class="dcard">
      <h3>${flag(iso)} ${c.name}</h3>
      <p class="muted">${c.capital} • ${c.region} • Pop ${c.pop}M • GDP ${fmt$(c.gdp)}</p>
      <div class="relrow"><span>Relations <b class="${rel>=20?"pos":rel<=-20?"neg":""}">${rel}</b></span>${meter(rel<0?100+rel:rel)}</div>
      <div class="tags">${ally?"<span class='tag ally'>🛡️ ALLY</span>":""}${tr?"<span class='tag trade'>🤝 TRADE</span>":""}${sn?"<span class='tag sanc'>⛔ SANCTIONED</span>":""}${atWar?"<span class='tag war'>⚔️ WAR</span>":""}</div>
      <div class="dbtns">
        <button onclick="Game.diplo('visit')">✈️ Visit</button>
        <button onclick="Game.diplo('aid')">🎁 Aid</button>
        <button onclick="Game.diplo('trade')">${tr?"✅ Trade":"🤝 Trade"}</button>
        <button onclick="Game.diplo('ally')">${ally?"✅ Ally":"🛡️ Ally"}</button>
        <button onclick="Game.diplo('sanction')">${sn?"🔓 Lift sanc.":"⛔ Sanction"}</button>
        <button onclick="Game.diplo('threaten')">😠 Threaten</button>
        ${atWar?`<button class="danger" onclick="Game.diplo('peace')">🕊️ Peace</button>`:`<button class="danger" onclick="Game.diplo('war')">⚔️ War</button>`}
      </div>
      ${atWar?`<div class="warbox">⚔️ War score: <b>${Math.round(S.wars[iso].score)}</b> (win at +60). Fund <b>Mil</b> budget & keep treasury alive!</div>`:""}
      <p class="muted small">Trade needs rel ≥ 0 • Ally needs rel ≥ 50 • War needs Mil ≥ 6</p>
    </div>`;
  }

  function renderNews(){
    $("#newsBox").innerHTML=S.log.map(e=>`<div class="news ${e.cls}"><span class="nt">${e.t}</span><span>${e.html}</span></div>`).join("");
  }
  function renderDecrees(){
    $("#decreeBox").innerHTML=DECREES.map(d=>`<button class="decree" data-id="${d.id}"><b>${d.name}</b><small>${d.desc}</small></button>`).join("");
    $("#decreeBox").querySelectorAll("button").forEach(b=>b.onclick=()=>{
      const d=DECREES.find(x=>x.id===b.dataset.id); d.run(); save(); renderAll();
    });
  }

  function showGameOver(won, html){
    $("#goTitle").textContent=won?"🏆 Victory!":"💀 Game Over";
    $("#goDesc").innerHTML=html+`<br><br>Ruled <b>${S.stats.monthsRuled}</b> months • GDP ${fmt$(S.gdpB)} • Prestige ${Math.round(S.prestige)} • Wars won ${S.stats.warsWon}`;
    $("#gameoverModal").classList.add("show");
  }

  // ---------- public API ----------
  window.Game={
    newGame, nextMonth, doDiplo(){}, diplo:doDiplomacy,
    get state(){return S;},
    setTax(v){ S.taxRate=+v; $("#taxVal").textContent=v+"%"; save(); drawEconomy(); },
    setSpend(k,v){ S.spend[k]=+v; $("#sp_"+k+"_v").textContent=v+"%"; save(); drawEconomy(); },
    select(iso){ S.selectedIso=iso; save(); renderAll(); },
    restart(){ localStorage.removeItem(saveKey); location.reload(); },
    continueAfter(){ $("#gameoverModal").classList.remove("show"); },
    toggleAuto(){ S.autoPlay=!S.autoPlay; $("#autoBtn").textContent=S.autoPlay?"⏸ Pause":"▶ Auto"; if(S.autoPlay) autoLoop(); },
    hasSave(){ return !!load(); },
    loadSaved(){ const s=load(); if(s){ S=s; renderAll(); return true; } return false; }
  };

  function autoLoop(){
    if(!S||!S.autoPlay||S.gameOver) return;
    if(!pendingEvent) nextMonth();
    setTimeout(autoLoop, 1400);
  }

  // wire static controls after DOM ready (called from inline script)
  window.GameInit=function(){
    $("#nextBtn").onclick=()=>{ nextMonth(); };
    $("#autoBtn").onclick=()=>Game.toggleAuto();
    $("#taxRange").oninput=e=>Game.setTax(e.target.value);
    ["health","edu","mil","infra"].forEach(k=>{ $("#sp_"+k).oninput=e=>Game.setSpend(k,e.target.value); });
    $("#search").oninput=renderMapList;
    $("#regionFilter").onchange=renderMapList;
    $("#sortFilter").onchange=renderMapList;
    $("#resetViewBtn").onclick=()=>window.WorldMap.resetView();
    $("#newGameBtn").onclick=()=>{ if(confirm("Abandon presidency and start over?")) Game.restart(); };
    // country picker
    const sel=$("#startCountry");
    const opts=[...window.COUNTRIES].sort((a,b)=>b[5]-a[5]).map(c=>`<option value="${c[0]}">${flag(c[0])} ${c[1]} — ${fmt$(c[5])}</option>`).join("");
    sel.innerHTML=opts;
    sel.value="US";
    $("#startBtn").onclick=()=>{ $("#startModal").classList.remove("show"); newGame(sel.value); toast("Welcome, President! 🎉"); };
    $("#continueBtn").onclick=()=>{ if(Game.loadSaved()){ $("#startModal").classList.remove("show"); } };
    if(!Game.hasSave()) $("#continueBtn").style.display="none";
    $("#restartBtn").onclick=()=>Game.restart();
    // map
    window.WorldMap.init($("#map"),{
      getRel:iso=> (S&&iso!==S.playerIso)?(S.relations[iso]||0):0,
      isAtWar:iso=>!!(S&&S.wars[iso]),
      isAlly:iso=>!!(S&&S.allies.includes(iso)),
      hasTrade:iso=>!!(S&&S.trades.includes(iso)),
      onSelect:iso=>{ if(S){ S.selectedIso=iso; save(); renderAll(); switchTab("diplo"); } }
    });
    switchTab("map");
  };
})();
