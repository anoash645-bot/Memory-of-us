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

export default function Home(){
  const[d,setD]=useState({media:[],tl:[],things:[],s:{}});const[lb,setLb]=useState(null);const[cat,setCat]=useState('All');const[msg,setMsg]=useState(false);
  const a=useRef();const[on,setOn]=useState(false);const[pos,setPos]=useState(0);const[dur,setDur]=useState(0);
  useEffect(()=>{(async()=>{try{const[m,t,l,s]=await Promise.all([supabase.from('media').select('*').order('taken_on'),supabase.from('timeline').select('*').order('event_date'),supabase.from('little_things').select('*').order('created_at'),supabase.from('settings').select('*')]);
    setD({media:m.data||[],tl:t.data||[],things:l.data||[],s:Object.fromEntries((s.data||[]).map(r=>[r.key,r.value]))})}catch{}})()},[]);
  const src=({...TEXT,...Object.fromEntries(Object.entries(d.s).filter(([,v])=>v))}).music_url;
  useEffect(()=>{const el=a.current;if(!el||!src)return;el.volume=.8;
    const evs=['pointerdown','click','keydown','touchend'];
    const off=()=>evs.forEach(e=>removeEventListener(e,start));
    const start=()=>{el.play().then(off).catch(()=>{})};
    el.play().catch(()=>evs.forEach(e=>addEventListener(e,start,{passive:true})));
    return off},[src]);
  const t={...TEXT,...Object.fromEntries(Object.entries(d.s).filter(([,v])=>v))};
  const photos=d.media.filter(x=>x.kind==='photo');const P=photos.length?photos:PHOTOS;
  const dv=d.media.filter(x=>x.kind==='video');const videos=(dv.length?dv:VIDEOS).filter(v=>cat==='All'||v.category===cat);
  const tl=d.tl.length?d.tl:TIMELINE;const things=d.things.length?d.things:THINGS;
  return <main>
  {t.music_url&&<><audio ref={a} src={t.music_url} autoPlay loop preload="auto" onPlay={()=>setOn(true)} onPause={()=>setOn(false)} onTimeUpdate={e=>setPos(e.target.currentTime)} onLoadedMetadata={e=>setDur(e.target.duration)}/>
  <button aria-label={on?'Pause music':'Play music'} onClick={()=>{const el=a.current;el.paused?el.play().catch(()=>{}):el.pause()}} className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-cocoa/85 text-cream shadow-lg flex items-center justify-center backdrop-blur" style={on?{animation:'spin 8s linear infinite'}:{}}>{on?'♪':'▶'}</button></>}
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

  <FinalPage bg={t.final_bg}/>
  {lb&&<Lightbox items={P} start={lb.i} auto={lb.auto} onClose={()=>setLb(null)}/>}
  </main>}

function FinalPage({bg}){const[r,v]=useSeen(.3);return <section ref={r} className="relative h-screen flex items-center justify-center text-center text-cream bg-cover bg-center" style={{backgroundImage:`url(${bg})`}}>
  <div className={`absolute inset-0 bg-cocoa transition-opacity duration-[4000ms] ${v?'opacity-70':'opacity-20'}`}/>
  <div className={`relative px-6 max-w-2xl transition-opacity duration-[3000ms] delay-1000 ${v?'opacity-100':'opacity-0'}`}>
  <p className="font-serif text-3xl md:text-5xl leading-snug">Whatever happens next, I'm grateful that our paths once crossed.</p>
  <p className="mt-8 font-serif italic text-xl opacity-80">Thank you for being part of my favorite memories.</p></div></section>}
