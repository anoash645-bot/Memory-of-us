'use client';
import {useEffect,useRef,useState} from 'react';
import {supabase} from '../lib/supabase';
import {PHOTOS,VIDEOS,TIMELINE,THINGS,TEXT,CATS} from '../lib/defaults';

function useSeen(th=.15){const r=useRef();const[v,setV]=useState(false);useEffect(()=>{const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);o.disconnect()}},{threshold:th});o.observe(r.current);return()=>o.disconnect()},[]);return[r,v]}
function Reveal({children,className=''}){const[r,v]=useSeen();return <div ref={r} className={`transition-all duration-1000 ease-out ${v?'opacity-100 translate-y-0':'opacity-0 translate-y-8'} ${className}`}>{children}</div>}
function Typed({text,className=''}){const[r,v]=useSeen(.4);const[n,setN]=useState(0);
  useEffect(()=>{if(!v)return;const t=setInterval(()=>setN(x=>{if(x>=text.length){clearInterval(t);return x}return x+1}),38);return()=>clearInterval(t)},[v,text]);
  return <p ref={r} className={`whitespace-pre-line relative ${className}`}><span className="invisible">{text}</span><span className="absolute inset-0">{text.slice(0,n)}</span></p>}
const fmt=d=>d?new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}):'';
function Title({k,children}){return <Reveal className="text-center mb-14"><p className="text-xs tracking-[.35em] uppercase text-blush">{k}</p><h2 className="font-serif text-4xl md:text-5xl mt-3">{children}</h2></Reveal>}

function Lightbox({items,start,auto,onClose}){
  const[i,setI]=useState(start);const[play,setPlay]=useState(auto);const n=items.length;
  useEffect(()=>{if(!play)return;const t=setInterval(()=>setI(x=>(x+1)%n),3500);return()=>clearInterval(t)},[play,n]);
  useEffect(()=>{const k=e=>{if(e.key==='Escape')onClose();if(e.key==='ArrowRight')setI(x=>(x+1)%n);if(e.key==='ArrowLeft')setI(x=>(x-1+n)%n)};addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[n]);
  const p=items[i];
  return <div className="fixed inset-0 z-50 bg-cocoa/95 flex flex-col items-center justify-center p-4 text-cream">
    <button onClick={onClose} className="absolute top-4 right-5 text-3xl">×</button>
    <img key={p.url} src={p.url} className="max-h-[75vh] max-w-full object-contain animate-[rise_.8s]" alt=""/>
    <p className="font-serif text-2xl mt-4">{p.title}</p><p className="text-sm opacity-70">{fmt(p.taken_on)} {p.caption&&'· '+p.caption}</p>
    <div className="flex gap-3 mt-4"><button className="btn2" onClick={()=>setI((i-1+n)%n)}>Prev</button><button className="btn2" onClick={()=>setPlay(!play)}>{play?'Pause':'Play'} slideshow</button><button className="btn2" onClick={()=>setI((i+1)%n)}>Next</button></div></div>}

function Player({t,a,on,pos,dur}){
  if(!t.music_url)return <p className="text-center opacity-60 text-sm">Add a song from the admin page.</p>;
  const toggle=()=>{const el=a.current;if(!el)return;el.paused?el.play().catch(()=>{}):el.pause()};
  return <div className="max-w-md mx-auto bg-white/70 rounded-3xl p-6 shadow-sm flex gap-5 items-center">
    <div className="w-24 h-24 rounded-2xl bg-blush/40 bg-cover bg-center shrink-0" style={t.music_cover?{backgroundImage:`url(${t.music_cover})`}:{}}/>
    <div className="flex-1 min-w-0"><p className="font-serif text-2xl truncate">{t.music_title}</p>
      <input type="range" className="!p-0 !border-0 !bg-transparent" min="0" max={dur||1} step=".1" value={pos} onChange={e=>{a.current.currentTime=e.target.value}}/>
      <div className="flex items-center gap-3"><button className="btn" onClick={toggle}>{on?'Pause':'Play'}</button>
      <input type="range" className="!p-0 !border-0 !bg-transparent !w-24" min="0" max="1" step=".05" defaultValue=".8" onChange={e=>{a.current.volume=e.target.value}}/></div></div></div>}

function Intro({bg,leaving,onOpen}){
  const ps=Array.from({length:22},(_,i)=>({l:(i*37+11)%100,s:2+(i%3),d:11+(i*7)%9,dl:-((i*5)%14),x:((i%5)-2)*18}));
  const sh={textShadow:'0 2px 18px rgba(40,25,18,.55)'};
  return <div role="dialog" aria-label="Opening" className="fixed inset-0 z-[60] overflow-hidden text-cream" style={{height:'100dvh',opacity:leaving?0:1,transition:'opacity 1.8s ease-in-out .35s',pointerEvents:leaving?'none':'auto'}}>
    <div className="absolute inset-0" style={{transform:leaving?'scale(1.12)':'scale(1)',transition:'transform 2.4s ease-in'}}>
      <div className="absolute inset-0 bg-cover bg-center ia" style={{backgroundImage:`url(${bg})`,animation:'introZoom 26s ease-out forwards, introFade 2.4s ease-out both'}}/></div>
    <div className="absolute inset-0 bg-cocoa/35"/>
    <div className="absolute inset-0 bg-cream" style={{opacity:leaving?.5:0,transition:'opacity 1.4s ease-in'}}/>
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">{ps.map((p,i)=><span key={i} className="absolute rounded-full bg-cream ip" style={{left:p.l+'%',bottom:'-10px',width:p.s,height:p.s,opacity:0,'--x':p.x+'px',animation:`floatUp ${p.d}s linear ${p.dl}s infinite`}}/>)}</div>
    <div className="relative h-full flex flex-col items-center justify-center text-center px-7" style={{paddingTop:'env(safe-area-inset-top)',paddingBottom:'env(safe-area-inset-bottom)',opacity:leaving?0:1,transform:leaving?'translateY(-22px)':'none',filter:leaving?'blur(6px)':'none',transition:'all .9s ease-in'}}>
      <h1 className="font-serif font-light text-[2.7rem] leading-[1.1] sm:text-6xl md:text-7xl max-w-2xl ia" style={{...sh,animation:'introIn 2.4s ease-out .6s both'}}>A Story Worth Remembering</h1>
      <p className="font-serif italic text-xl sm:text-2xl mt-5 ia" style={{...sh,animation:'introIn 2.2s ease-out 2s both'}}>Some moments are too beautiful to fade away.</p>
      <button onClick={onOpen} className="btn !bg-cream !text-cocoa mt-10 ia" style={{padding:'.95rem 2.4rem',fontSize:'.95rem',animation:'introIn 2s ease-out 3.2s both'}}>Open Our Memories</button>
      <p className="mt-5 text-xs tracking-wide opacity-80 ia" style={{...sh,animation:'introIn 2s ease-out 3.8s both'}}>Made with little memories and a lot of love.</p>
    </div></div>}

export default function Home(){
  const[d,setD]=useState({media:[],tl:[],things:[],s:{}});const[lb,setLb]=useState(null);const[cat,setCat]=useState('All');const[msg,setMsg]=useState(false);
  const a=useRef();const[on,setOn]=useState(false);const[pos,setPos]=useState(0);const[dur,setDur]=useState(0);
  useEffect(()=>{(async()=>{try{const[m,t,l,s]=await Promise.all([supabase.from('media').select('*').order('taken_on'),supabase.from('timeline').select('*').order('event_date'),supabase.from('little_things').select('*').order('created_at'),supabase.from('settings').select('*')]);
    setD({media:m.data||[],tl:t.data||[],things:l.data||[],s:Object.fromEntries((s.data||[]).map(r=>[r.key,r.value]))})}catch{}})()},[]);
  const src=({...TEXT,...Object.fromEntries(Object.entries(d.s).filter(([,v])=>v))}).music_url;
  useEffect(()=>{if(a.current)a.current.volume=.8},[src]);
  const[ph,setPh]=useState('intro');
  useEffect(()=>{document.body.style.overflow=ph==='intro'?'hidden':'';return()=>{document.body.style.overflow=''}},[ph]);
  useEffect(()=>{if(ph!=='leaving')return;
    const go=requestAnimationFrame(()=>{const el=document.getElementById('story');if(el)scrollTo({top:el.getBoundingClientRect().top+scrollY,behavior:'instant'})});
    const x=setTimeout(()=>setPh('done'),2300);return()=>{cancelAnimationFrame(go);clearTimeout(x)}},[ph]);
  const enter=()=>{if(ph!=='intro')return;try{a.current&&a.current.play().catch(()=>{})}catch{}setPh('leaving')};
  const t={...TEXT,...Object.fromEntries(Object.entries(d.s).filter(([,v])=>v))};
  const photos=d.media.filter(x=>x.kind==='photo');const P=photos.length?photos:PHOTOS;
  const dv=d.media.filter(x=>x.kind==='video');const videos=(dv.length?dv:VIDEOS).filter(v=>cat==='All'||v.category===cat);
  const tl=d.tl.length?d.tl:TIMELINE;const things=d.things.length?d.things:THINGS;
  return <>
  {t.music_url&&<audio ref={a} src={t.music_url} loop preload="auto" onPlay={()=>setOn(true)} onPause={()=>setOn(false)} onTimeUpdate={e=>setPos(e.target.currentTime)} onLoadedMetadata={e=>setDur(e.target.duration)}/>}
  {ph!=='done'&&<Intro bg={t.hero_bg} leaving={ph==='leaving'} onOpen={enter}/>}
  {ph!=='intro'&&<main>
  {t.music_url&&<button aria-label={on?'Pause music':'Play music'} onClick={()=>{const el=a.current;el.paused?el.play().catch(()=>{}):el.pause()}} className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-cocoa/85 text-cream shadow-lg flex items-center justify-center backdrop-blur" style={on?{animation:'spin 8s linear infinite'}:{}}>{on?'♪':'▶'}</button>}
  <section className="relative h-screen flex items-center justify-center text-center text-cream bg-cover bg-center" style={{backgroundImage:`url(${t.hero_bg})`}}>
    <div className="absolute inset-0 bg-cocoa/55"/>
    <div className="relative px-6 max-w-2xl">
      <h1 className="font-serif text-5xl md:text-7xl font-light" style={{animation:'rise 2s both'}}>A Story Worth Remembering</h1>
      <p className="mt-6 font-serif italic text-xl md:text-2xl" style={{animation:'rise 2s 1.2s both'}}>Some moments deserve a place to stay forever.</p>
      <a href="#story" className="btn inline-block mt-10 !bg-cream !text-cocoa" style={{animation:'rise 2s 2.2s both'}}>Open Our Memories</a></div></section>

  <section id="story" className="py-28 px-6 max-w-3xl mx-auto"><Title k="Where it all began">Our Story</Title>
    <div className="border-l border-blush/60 pl-8 space-y-16">{tl.map(e=><Reveal key={e.id}><div className="relative"><span className="absolute -left-[37px] top-2 w-3 h-3 rounded-full bg-blush"/>
      <p className="text-xs tracking-widest uppercase text-blush">{fmt(e.event_date)}</p><h3 className="font-serif text-3xl mt-1">{e.title}</h3>
      {e.photo_url&&<img src={e.photo_url} loading="lazy" className="mt-4 rounded-xl max-h-96 w-full object-cover" alt=""/>}<p className="mt-4 leading-relaxed opacity-80">{e.story}</p></div></Reveal>)}</div></section>

  <section className="py-28 px-4 bg-ivory"><Title k="Our memories">Photo Album</Title>
    <div className="text-center mb-10"><button className="btn" onClick={()=>setLb({i:0,auto:true})}>Play slideshow</button></div>
    <div className="max-w-6xl mx-auto columns-2 md:columns-3 gap-5">{P.map((p,i)=><Reveal key={p.id} className="break-inside-avoid mb-5">
      <figure onClick={()=>setLb({i,auto:false})} className="bg-white p-3 pb-4 shadow-md cursor-pointer transition duration-500 hover:-translate-y-1 hover:rotate-0 hover:shadow-xl" style={{transform:`rotate(${[-1.5,1,-.5,2][i%4]}deg)`}}>
        <img src={p.url} loading="lazy" className="w-full" alt={p.title}/><figcaption className="pt-3 text-center"><p className="font-serif text-xl">{p.title}</p><p className="text-xs opacity-60">{fmt(p.taken_on)}</p></figcaption></figure></Reveal>)}</div></section>

  <section className="py-28 px-4 bg-cocoa text-cream"><Title k="Video diary">The Little Things I Remember</Title>
    <p className="text-center font-serif italic text-xl -mt-8 mb-10 opacity-80">Sometimes, the smallest moments become the ones we remember the most.</p>
    <div className="flex flex-wrap justify-center gap-2 mb-10">{['All',...CATS].map(c=><button key={c} onClick={()=>setCat(c)} className={`btn2 ${cat===c?'bg-cream text-cocoa':''}`}>{c}</button>)}</div>
    {videos.length===0&&<p className="text-center opacity-60 text-sm">Videos you upload in the admin page will appear here.</p>}
    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">{videos.map(v=><Reveal key={v.id}><div className="bg-black/30 rounded-2xl overflow-hidden">
      <video src={v.poster?v.url:v.url+'#t=0.5'} poster={v.poster} controls preload="metadata" playsInline className="w-full aspect-video bg-black"/>
      <div className="p-5"><p className="text-xs tracking-widest uppercase text-blush">{v.category} · {fmt(v.taken_on)}</p><h3 className="font-serif text-2xl mt-1">{v.title}</h3><p className="text-sm opacity-70">{v.caption}</p></div></div></Reveal>)}</div></section>

  <section className="py-28 px-6"><Title k="The details">Little Things</Title>
    <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6">{things.map((x,i)=><Reveal key={x.id}><div className="w-60 p-6 shadow-md font-serif text-xl" style={{background:['#FBEFE9','#FFF8E7','#F3E9DA'][i%3],transform:`rotate(${[-3,2,-1.5,3][i%4]}deg)`}}>{x.text}</div></Reveal>)}</div></section>

  <section className="py-24 px-6 bg-ivory"><Title k="A song for us">Press Play</Title><Player t={t} a={a} on={on} pos={pos} dur={dur}/></section>

  <section className="py-28 px-6"><Title k="A little letter">For You</Title>
    <div className="max-w-xl mx-auto bg-white shadow-lg p-10 md:p-14 rounded-sm" style={{backgroundImage:'repeating-linear-gradient(transparent 0 35px,#f1e6d6 36px)'}}>
      <Typed text={t.letter} className="font-serif text-2xl leading-[36px]"/></div>
    <div className="text-center mt-14"><button onClick={()=>setMsg(!msg)} className="text-sm underline underline-offset-4 opacity-60 hover:opacity-100">One More Thing</button>
      <p className={`font-serif italic text-2xl mt-6 max-w-lg mx-auto transition-all duration-1000 ${msg?'opacity-100 max-h-60':'opacity-0 max-h-0 overflow-hidden'}`}>{t.hidden_message}</p></div></section>

  <Anniv t={t}/>
  <FinalPage bg={t.final_bg}/>
  {lb&&<Lightbox items={P} start={lb.i} auto={lb.auto} onClose={()=>setLb(null)}/>}
  </main>}
  </>}

function Anniv({t}){
  const[now,setNow]=useState(null);const[open,setOpen]=useState(false);const[nope,setNope]=useState(false);const[pv,setPv]=useState(false);
  useEffect(()=>{setPv(new URLSearchParams(location.search).get('unlock')==='1');setNow(Date.now());const i=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(i)},[]);
  const target=new Date(t.anniv_date+'T00:00:00').getTime();const since=new Date(t.anniv_since+'T00:00:00').getTime();
  const left=now==null?null:target-now;const ready=pv||(left!==null&&left<=0);
  const ref=now==null?target:(left>0?target:now);const days=Math.max(0,Math.floor((ref-since)/864e5));
  const p2=n=>String(n).padStart(2,'0');
  const parts=left==null||left<=0?['--','--','--','--']:[Math.floor(left/864e5),p2(Math.floor(left%864e5/36e5)),p2(Math.floor(left%36e5/6e4)),p2(Math.floor(left%6e4/1e3))];
  const tap=()=>{if(open)return;if(!ready){setNope(true);setTimeout(()=>setNope(false),2200);return}setOpen(true)};
  const cf=Array.from({length:36},(_,i)=>{const a=i*10*Math.PI/180,r=90+((i*53)%150);return{dx:Math.cos(a)*r,dy:Math.sin(a)*r-70,r:((i*47)%360)-180,c:['♥','✦','•'][i%3],k:['#D9A6A0','#FAF5EC','#E8C9A0'][i%3],z:14+(i*5)%14}});
  return <section className="py-28 px-6 bg-cocoa text-cream overflow-hidden"><Title k="A little surprise">A Gift For Us</Title>
    <div className="relative max-w-md mx-auto text-center">
      <p className="font-serif italic text-xl opacity-80 mb-10">{ready?(open?'Happy anniversary.':'It\'s time. Tap the gift.'):`Our ${t.anniv_label} is on ${fmt(t.anniv_date)}. Come back then to open it.`}</p>
      {!ready&&<div className="grid grid-cols-4 gap-3 mb-12">{[['Days',parts[0]],['Hours',parts[1]],['Minutes',parts[2]],['Seconds',parts[3]]].map(([l,v])=><div key={l} className="rounded-2xl bg-cream/10 py-4"><div className="font-serif text-3xl sm:text-4xl tabular-nums">{v}</div><div className="text-[10px] tracking-widest uppercase opacity-70 mt-1">{l}</div></div>)}</div>}
      <div className="relative mx-auto w-40 h-44">
        <div className="absolute left-1/2 -top-10 w-72 h-72 -translate-x-1/2 rounded-full pointer-events-none transition-opacity duration-[1500ms]" style={{background:'radial-gradient(circle,rgba(250,245,236,.55),transparent 65%)',opacity:open?1:0}}/>
        <button onClick={tap} aria-label="Open the gift" className="relative block w-40 h-44 outline-none ga" style={{animation:open?'none':nope?'giftShake .6s':'giftFloat 4s ease-in-out infinite',cursor:open?'default':'pointer'}}>
          <div className="absolute inset-x-0 bottom-0 h-28 rounded-b-xl bg-blush shadow-lg"><div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-cream/90"/></div>
          <div className="absolute -inset-x-1.5 top-3 h-[52px] rounded-md bg-blush shadow-md transition-all duration-[1400ms] ease-out" style={open?{transform:'translateY(-4rem) rotate(-14deg)',opacity:0}:{}}>
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-cream/90"/>
            <div className="absolute -top-5 left-1/2 -translate-x-[130%] w-7 h-7 rounded-full border-[5px] border-cream/90 rotate-[-25deg]"/><div className="absolute -top-5 left-1/2 translate-x-[30%] w-7 h-7 rounded-full border-[5px] border-cream/90 rotate-[25deg]"/></div>
        </button>
        {open&&<div className="absolute left-1/2 top-16 pointer-events-none" aria-hidden="true">{cf.map((c,i)=><span key={i} className="absolute gp ga" style={{left:0,top:0,color:c.k,fontSize:c.z,opacity:0,'--dx':c.dx+'px','--dy':c.dy+'px','--r':c.r+'deg',animation:`burst 2.6s ease-out ${(i%6)*.08}s forwards`}}>{c.c}</span>)}</div>}
      </div>
      <p className="font-serif italic mt-6 h-6 transition-opacity duration-500" style={{opacity:nope?.85:0}}>Not yet... it opens on {fmt(t.anniv_date)} ♥</p>
      {open&&<div className="mt-10" style={{animation:'introIn 1.8s ease-out .9s both'}}>
        <h3 className="font-serif text-4xl">{t.anniv_title}</h3>
        <p className="font-serif text-xl leading-relaxed mt-6 whitespace-pre-line opacity-90">{t.anniv_message}</p>
        <div className="mt-10 inline-block rounded-2xl bg-cream/10 px-8 py-5"><div className="font-serif text-5xl tabular-nums">{days}</div><div className="text-[11px] tracking-widest uppercase opacity-70 mt-1">days of us · since {fmt(t.anniv_since)}</div></div></div>}
    </div></section>}

function FinalPage({bg}){const[r,v]=useSeen(.3);return <section ref={r} className="relative h-screen flex items-center justify-center text-center text-cream bg-cover bg-center" style={{backgroundImage:`url(${bg})`}}>
  <div className={`absolute inset-0 bg-cocoa transition-opacity duration-[4000ms] ${v?'opacity-70':'opacity-20'}`}/>
  <div className={`relative px-6 max-w-2xl transition-opacity duration-[3000ms] delay-1000 ${v?'opacity-100':'opacity-0'}`}>
  <p className="font-serif text-3xl md:text-5xl leading-snug">Whatever happens next, I'm grateful that our paths once crossed.</p>
  <p className="mt-8 font-serif italic text-xl opacity-80">Thank you for being part of my favorite memories.</p></div></section>}
