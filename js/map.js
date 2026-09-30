/* Interactive 2D world map: real country polygons, pan/zoom/tap, touch-friendly */
window.WorldMap = (function(){
  let canvas, ctx, W=0, H=0, dpr=1;
  let cam = {x:0, y:0, z:1}; // z = zoom
  let feats = [];   // {iso, rings:[[[u,v]..]], bbox:[u0,v0,u1,v1], lonbbox, area, cu, cv}
  let orderDraw = [], orderPick = [];
  let hoverIso = null, selectedIso = null, playerIso = null;
  let getRel = ()=>0, isAtWar=()=>false, isAlly=()=>false, hasTrade=()=>false;
  let onSelect = ()=>{};
  let animT = 0, dirty = true;
  const MAJORS = ["US","CN","RU","IN","BR","GB","FR","DE","JP","AU","ZA","EG","SA","ID"];

  function latLonToUV(lat,lon){ return [(lon+180)/360, (90-lat)/180]; }

  const flag = iso => String.fromCodePoint(...[...iso].map(c=>127397+c.charCodeAt(0)));

  function build(){
    feats = [];
    const B = window.BORDERS || {};
    for(const c of window.COUNTRIES){
      const iso = c[0];
      const g = B[iso];
      if(!g) continue; // every game country has a polygon (see BORDER_META)
      const rings = [];
      let u0=1,v0=1,u1=0,v1=0, area=0;
      for(const poly of g.p){
        const pr = [];
        for(const ring of poly){
          const rr = ring.map(([lo,la])=>{
            const [u,v]=latLonToUV(la,lo);
            if(u<u0)u0=u; if(v<v0)v0=v; if(u>u1)u1=u; if(v>v1)v1=v;
            return [u,v];
          });
          pr.push(rr);
        }
        // outer-ring area for draw order (deg2 approx via u/v)
        let a=0; const o=pr[0];
        for(let i=0;i<o.length-1;i++) a+=(o[i][0]*o[i+1][1]-o[i+1][0]*o[i][1]);
        area+=Math.abs(a);
        rings.push(pr);
      }
      const [cu,cv]=latLonToUV(g.c[1],g.c[0]);
      feats.push({iso, rings, bbox:[u0,v0,u1,v1], lonbbox:g.b, area, cu, cv});
    }
    // Antarctica: decorative, never selectable
    if(B.AQ){
      const rings=[];
      for(const poly of B.AQ.p) rings.push(poly.map(ring=>ring.map(([lo,la])=>latLonToUV(la,lo))));
      feats.push({iso:"AQ", rings, bbox:[0,0.85,1,1], lonbbox:[-180,-90,180,-63], area:1e9, cu:0.5, cv:0.97, deco:true});
    }
    orderDraw = [...feats].sort((a,b)=>b.area-a.area);
    orderPick = [...feats].filter(f=>!f.deco).sort((a,b)=>
      ((a.bbox[2]-a.bbox[0])*(a.bbox[3]-a.bbox[1])) - ((b.bbox[2]-b.bbox[0])*(b.bbox[3]-b.bbox[1])));
  }

  function requestDraw(){ if(!dirty){ dirty=true; requestAnimationFrame(frame); } }
  function frame(){ if(dirty){ dirty=false; draw(); } }

  function resize(){
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio||1, 2.5);
    W = rect.width; H = rect.height;
    canvas.width = Math.round(W*dpr); canvas.height = Math.round(H*dpr);
    requestDraw();
  }

  function metrics(){
    const worldW = W*cam.z, worldH = worldW*0.5;
    return {worldW, worldH, ox: W/2-worldW/2+cam.x, oy: H/2-worldH/2+cam.y};
  }
  function baseToScreen(u,v){
    const m=metrics(); return [m.ox+u*m.worldW, m.oy+v*m.worldH, m.worldW];
  }

  function relColor(rel, iso){
    if(iso===playerIso) return "#f5c542";
    if(isAtWar(iso)) return "#ff3b30";
    if(isAlly(iso)) return "#34c759";
    if(hasTrade(iso)) return "#32ade6";
    if(rel>=50) return "#30d158";
    if(rel>=20) return "#a6e88a";
    if(rel<=-50) return "#ff453a";
    if(rel<=-20) return "#ff9f0a";
    return "#8e8e93";
  }

  // path one feature at x-offset (in screen px), assumes u/v transform already set
  function pathFeat(f){
    for(const poly of f.rings){
      for(const ring of poly){
        ctx.moveTo(ring[0][0], ring[0][1]);
        for(let i=1;i<ring.length;i++) ctx.lineTo(ring[i][0], ring[i][1]);
        ctx.closePath();
      }
    }
  }

  function draw(){
    if(!canvas||!ctx) return;
    const m = metrics();
    ctx.setTransform(dpr,0,0,dpr,0,0);
    // ocean
    const g = ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,"#0b1e3a"); g.addColorStop(0.5,"#0e2a52"); g.addColorStop(1,"#0b1e3a");
    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
    // graticule (screen space)
    ctx.strokeStyle = "rgba(120,170,255,0.12)"; ctx.lineWidth = 1;
    for(let i=1;i<12;i++){ const x=m.ox+(i/12)*m.worldW; ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for(let j=1;j<6;j++){ const y=m.oy+(j/6)*m.worldH; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
    // world frame
    ctx.strokeStyle = "rgba(140,190,255,0.35)"; ctx.lineWidth=1.5;
    ctx.strokeRect(m.ox, m.oy, m.worldW, m.worldH);

    // land polygons in u/v space (offset copies for antimeridian)
    for(const f of orderDraw){
      const isDeco = !!f.deco;
      const col = isDeco ? "#24406b" : relColor(getRel(f.iso), f.iso);
      const sel = f.iso===selectedIso, hov = f.iso===hoverIso;
      for(const k of [0,-1,1]){
        const xoff = m.ox + k*m.worldW;
        const sx0 = xoff + f.bbox[0]*m.worldW, sx1 = xoff + f.bbox[2]*m.worldW;
        const sy0 = m.oy + f.bbox[1]*m.worldH, sy1 = m.oy + f.bbox[3]*m.worldH;
        if(sx1<-20||sx0>W+20||sy1<-20||sy0>H+20) continue;
        ctx.setTransform(dpr*m.worldW,0,0,dpr*m.worldH, dpr*xoff, dpr*m.oy);
        ctx.beginPath(); pathFeat(f);
        ctx.fillStyle = col; ctx.globalAlpha = isDeco?1:0.92; ctx.fill(); ctx.globalAlpha=1;
        const wPx = (sel||hov)?2.5:(f.iso===playerIso?2:1);
        ctx.lineWidth = wPx/m.worldW;
        ctx.strokeStyle = sel||hov ? "#ffffff" : (f.iso===playerIso ? "#7a5b00" : "rgba(2,8,20,0.6)");
        ctx.stroke();
        if(f.iso===playerIso && !sel){
          ctx.lineWidth = 5/m.worldW; ctx.strokeStyle="rgba(245,197,66,0.35)"; ctx.stroke();
        }
        if(!isDeco && isAtWar(f.iso)){
          const p = 3+Math.sin(animT*2)*1.5;
          ctx.lineWidth = p/m.worldW; ctx.strokeStyle="rgba(255,69,58,0.55)"; ctx.stroke();
        }
      }
    }
    ctx.setTransform(dpr,0,0,dpr,0,0);

    // flags + labels (tiered by zoom and on-screen size)
    ctx.textAlign="center"; ctx.textBaseline="middle";
    const z=cam.z;
    for(const f of orderDraw){
      if(f.deco) continue;
      const bw=(f.bbox[2]-f.bbox[0])*m.worldW;
      let flagPx=0, showIso=false;
      if(MAJORS.includes(f.iso)){ flagPx = z>2.5?19:16; showIso = (z>2.5 && bw>70); }
      else if(z>5 && bw>10){ flagPx=13; showIso = bw>64; }
      else if(z>3 && bw>26){ flagPx=14; showIso = bw>70; }
      else if(z>2 && bw>54){ flagPx=14; showIso = bw>90; }
      if(!flagPx) continue;
      // first visible copy of the label point
      for(const k of [0,-1,1]){
        const x=m.ox+(f.cu+k)*m.worldW, y=m.oy+f.cv*m.worldH;
        if(x<-30||x>W+30||y<-30||y>H+30) continue;
        ctx.font = `${flagPx}px system-ui`;
        ctx.shadowColor="rgba(0,0,0,0.75)"; ctx.shadowBlur=4;
        ctx.fillText(flag(f.iso),x,y);
        ctx.shadowBlur=0;
        if(showIso){
          ctx.font = "10px system-ui";
          ctx.lineWidth=3; ctx.strokeStyle="rgba(4,12,28,0.9)";
          ctx.strokeText(f.iso,x,y+flagPx*0.8);
          ctx.fillStyle="#dbe7ff"; ctx.fillText(f.iso,x,y+flagPx*0.8);
        }
        break;
      }
    }
    if(cam.z===1){
      ctx.font="12px system-ui"; ctx.textBaseline="alphabetic"; ctx.fillStyle="rgba(200,220,255,0.6)";
      ctx.fillText("Pinch / scroll to zoom • drag to pan • tap a country", W/2, H-10);
    }
  }

  function pointInRing(u,v,ring){
    let inside=false;
    for(let i=0,j=ring.length-1;i<ring.length;j=i++){
      const xi=ring[i][0], yi=ring[i][1], xj=ring[j][0], yj=ring[j][1];
      if(((yi>v)!==(yj>v)) && (u < (xj-xi)*(v-yi)/(yj-yi)+xi)) inside=!inside;
    }
    return inside;
  }
  function normLon(lon){ lon=((lon+540)%360)-180; return lon===-180?180:lon; }

  function pick(sx,sy){
    const m=metrics();
    const u=(sx-m.ox)/m.worldW, v=(sy-m.oy)/m.worldH;
    if(v<-0.02||v>1.02) return null;
    const lon=normLon(u*360-180);
    // 1) polygons, small first (u-space ray cast; bbox prefilter in lon)
    for(const f of orderPick){
      const b=f.lonbbox;
      if(lon<b[0]-0.6||lon>b[2]+0.6) continue;
      const uu=(lon+180)/360, vv=v;
      for(const poly of f.rings){
        let inside=false;
        for(const ring of poly) if(pointInRing(uu,vv,ring)) inside=!inside;
        if(inside) return f.iso;
      }
    }
    // 2) near-miss: closest feature bbox within 16px (tiny islands stay tappable)
    let bestIso=null, bestD=16;
    for(const f of orderPick){
      for(const k of [0,-1,1]){
        const x0=m.ox+(f.bbox[0]+k)*m.worldW, x1=m.ox+(f.bbox[2]+k)*m.worldW;
        const y0=m.oy+f.bbox[1]*m.worldH, y1=m.oy+f.bbox[3]*m.worldH;
        if(x1<-16||x0>W+16||y1<-16||y0>H+16) continue;
        const dx=Math.max(x0-sx,0,sx-x1), dy=Math.max(y0-sy,0,sy-y1);
        const dd=Math.hypot(dx,dy);
        if(dd<bestD){bestD=dd;bestIso=f.iso;}
      }
    }
    return bestIso;
  }

  function attachGestures(){
    let pointers=new Map(), lastDist=0, moved=0, downAt=0;
    canvas.addEventListener("pointerdown",e=>{ canvas.setPointerCapture(e.pointerId); pointers.set(e.pointerId,[e.clientX,e.clientY]); moved=0; downAt=Date.now(); if(pointers.size===2){ const p=[...pointers.values()]; lastDist=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]); } });
    canvas.addEventListener("pointermove",e=>{
      if(!pointers.has(e.pointerId)){
        const rect=canvas.getBoundingClientRect();
        const h=pick(e.clientX-rect.left,e.clientY-rect.top);
        if(h!==hoverIso){ hoverIso=h; requestDraw(); }
        return;
      }
      const prev=pointers.get(e.pointerId);
      const dx=e.clientX-prev[0], dy=e.clientY-prev[1];
      moved+=Math.abs(dx)+Math.abs(dy);
      pointers.set(e.pointerId,[e.clientX,e.clientY]);
      if(pointers.size===1){ cam.x+=dx; cam.y+=dy; clamp(); requestDraw(); }
      else if(pointers.size===2){
        const p=[...pointers.values()];
        const dist=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);
        if(lastDist>0){ zoomBy(dist/lastDist); }
        lastDist=dist;
      }
    });
    const up=e=>{
      pointers.delete(e.pointerId);
      if(pointers.size<2) lastDist=0;
      const quick = Date.now()-downAt<400 && moved<12;
      if(quick){
        const rect=canvas.getBoundingClientRect();
        const iso=pick(e.clientX-rect.left,e.clientY-rect.top);
        if(iso){ selectedIso=iso; onSelect(iso); requestDraw(); }
      }
    };
    canvas.addEventListener("pointerup",up); canvas.addEventListener("pointercancel",up);
    canvas.addEventListener("wheel",e=>{ e.preventDefault(); zoomBy(e.deltaY<0?1.12:0.89); },{passive:false});
  }
  function zoomBy(f){
    cam.z=Math.max(1,Math.min(12,cam.z*f));
    clamp(); requestDraw();
  }
  function clamp(){
    const worldW=W*cam.z, worldH=worldW*0.5;
    const mx=Math.max(0,(worldW-W)/2+40), my=Math.max(0,(worldH-H)/2+60);
    cam.x=Math.max(-mx,Math.min(mx,cam.x));
    cam.y=Math.max(-my,Math.min(my,cam.y));
    if(cam.z<=1.01){cam.x=0;cam.y=0;}
  }

  return {
    init(canvasEl, opts){
      canvas=canvasEl; ctx=canvas.getContext("2d");
      Object.assign(cam,{x:0,y:0,z:1});
      if(opts){ getRel=opts.getRel||getRel; isAtWar=opts.isAtWar||isAtWar; isAlly=opts.isAlly||isAlly; hasTrade=opts.hasTrade||hasTrade; onSelect=opts.onSelect||onSelect; }
      build(); resize(); attachGestures();
      window.addEventListener("resize",resize);
      new ResizeObserver(resize).observe(canvas);
      (function raf(){ frame(); requestAnimationFrame(raf); })();
      setInterval(()=>{ animT+=0.5; requestDraw(); }, 600); // war shimmer @ ~1.6fps idle
    },
    setState(s){ playerIso=s.playerIso; selectedIso=s.selectedIso; requestDraw(); },
    refresh(){ requestDraw(); },
    resetView(){ cam.x=0;cam.y=0;cam.z=1; requestDraw(); },
    focus(iso){
      let u=null,v=null,fitZ=2.2;
      const f=feats.find(f=>f.iso===iso);
      if(f && !f.deco){
        u=f.cu; v=f.cv;
        // fit small states closer (micro-islands zoom right in)
        const bwU=Math.min(1,Math.max(0.0004,f.bbox[2]-f.bbox[0]));
        fitZ=Math.min(12,Math.max(2.2,140/(bwU*W)));
      }
      else{
        const c=window.COUNTRY_MAP[iso]; if(!c) return;
        [u,v]=latLonToUV(c.lat,c.lon);
      }
      cam.z=Math.max(cam.z,fitZ);
      const worldW=W*cam.z, worldH=worldW*0.5;
      cam.x=worldW*(0.5-u); cam.y=worldH*(0.5-v);
      clamp(); selectedIso=iso; requestDraw();
    }
  };
})();
