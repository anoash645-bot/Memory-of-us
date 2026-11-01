'use client';
import {useEffect,useState} from 'react';
import {supabase,uploadFile,compressImage,BUCKET} from '../../lib/supabase';
import {CATS,TEXT} from '../../lib/defaults';

function Login(){const[e,setE]=useState('');const[p,setP]=useState('');const[err,setErr]=useState('');
  return <div className="min-h-screen flex items-center justify-center"><div className="w-80 space-y-3"><h1 className="font-serif text-4xl mb-4">Admin</h1>
    <input placeholder="Email" value={e} onChange={x=>setE(x.target.value)}/><input type="password" placeholder="Password" value={p} onChange={x=>setP(x.target.value)}/>
    <button className="btn w-full" onClick={async()=>{const{error}=await supabase.auth.signInWithPassword({email:e,password:p});if(error)setErr(error.message)}}>Sign in</button><p className="text-sm text-red-700">{err}</p></div></div>}

function Media({kind}){const[rows,setRows]=useState([]);const[busy,setBusy]=useState(false);
  const load=async()=>{const{data}=await supabase.from('media').select('*').eq('kind',kind).order('taken_on',{ascending:false});setRows(data||[])};useEffect(()=>{load()},[kind]);
  const add=async files=>{setBusy(true);try{for(const f of files){const u=await uploadFile(kind==='photo'?await compressImage(f):f,kind+'s');
    await supabase.from('media').insert({kind,url:u.url,path:u.path,title:f.name.replace(/\.\w+$/,'')})}}catch(e){alert(e.message)}setBusy(false);load()};
  const save=(id,v)=>supabase.from('media').update(v).eq('id',id);
  const del=async r=>{if(!confirm('Delete?'))return;if(r.path)await supabase.storage.from(BUCKET).remove([r.path]);await supabase.from('media').delete().eq('id',r.id);load()};
  const replace=async(r,f)=>{setBusy(true);try{const u=await uploadFile(kind==='photo'?await compressImage(f):f,kind+'s');await supabase.from('media').update({url:u.url,path:u.path}).eq('id',r.id);if(r.path)await supabase.storage.from(BUCKET).remove([r.path])}catch(e){alert(e.message)}setBusy(false);load()};
  return <div><label className="btn inline-block cursor-pointer">{busy?'Uploading…':`Upload ${kind}s`}<input type="file" hidden multiple accept={kind==='photo'?'image/*':'video/mp4,video/quicktime,video/webm,.mov'} onChange={e=>add([...e.target.files])}/></label>
    <div className="grid md:grid-cols-2 gap-4 mt-6">{rows.map(r=><div key={r.id} className="bg-white rounded-xl p-3 flex gap-3">
      {kind==='photo'?<img src={r.url} className="w-24 h-24 object-cover rounded"/>:<video src={r.url+'#t=0.5'} preload="metadata" className="w-32 h-24 object-cover rounded"/>}
      <div className="flex-1 space-y-1"><input defaultValue={r.title} placeholder="Title" onBlur={e=>save(r.id,{title:e.target.value})}/><input defaultValue={r.caption} placeholder="Caption" onBlur={e=>save(r.id,{caption:e.target.value})}/>
        <div className="flex gap-1"><input type="date" defaultValue={r.taken_on} onBlur={e=>save(r.id,{taken_on:e.target.value})}/>{kind==='video'&&<select defaultValue={r.category} onChange={e=>save(r.id,{category:e.target.value})}>{CATS.map(c=><option key={c}>{c}</option>)}</select>}</div>
        <div className="flex gap-3 text-xs"><label className="underline cursor-pointer">Replace<input type="file" hidden onChange={e=>e.target.files[0]&&replace(r,e.target.files[0])}/></label><button className="underline text-red-700" onClick={()=>del(r)}>Delete</button></div></div></div>)}</div></div>}

function Timeline(){const[rows,setRows]=useState([]);const load=async()=>{const{data}=await supabase.from('timeline').select('*').order('event_date');setRows(data||[])};useEffect(()=>{load()},[]);
  const save=(id,v)=>supabase.from('timeline').update(v).eq('id',id);
  return <div><button className="btn" onClick={async()=>{await supabase.from('timeline').insert({title:'New chapter'});load()}}>Add chapter</button>
  <div className="space-y-4 mt-6">{rows.map(r=><div key={r.id} className="bg-white rounded-xl p-4 space-y-2"><div className="flex gap-2"><input type="date" defaultValue={r.event_date} onBlur={e=>save(r.id,{event_date:e.target.value})}/><input defaultValue={r.title} onBlur={e=>save(r.id,{title:e.target.value})}/></div>
    <textarea rows="3" defaultValue={r.story} onBlur={e=>save(r.id,{story:e.target.value})}/>
    <div className="flex items-center gap-3 text-sm">{r.photo_url&&<img src={r.photo_url} className="w-14 h-14 object-cover rounded"/>}<label className="underline cursor-pointer">Photo<input type="file" hidden accept="image/*" onChange={async e=>{const u=await uploadFile(await compressImage(e.target.files[0]),'timeline');await save(r.id,{photo_url:u.url});load()}}/></label>
    <button className="underline text-red-700" onClick={async()=>{await supabase.from('timeline').delete().eq('id',r.id);load()}}>Delete</button></div></div>)}</div></div>}

function Things(){const[rows,setRows]=useState([]);const[t,setT]=useState('');const load=async()=>{const{data}=await supabase.from('little_things').select('*').order('created_at');setRows(data||[])};useEffect(()=>{load()},[]);
  return <div><div className="flex gap-2"><input value={t} onChange={e=>setT(e.target.value)} placeholder="A little thing…"/><button className="btn" onClick={async()=>{if(!t)return;await supabase.from('little_things').insert({text:t});setT('');load()}}>Add</button></div>
  <ul className="mt-4 space-y-2">{rows.map(r=><li key={r.id} className="bg-white rounded-lg p-3 flex justify-between">{r.text}<button className="text-red-700 text-sm" onClick={async()=>{await supabase.from('little_things').delete().eq('id',r.id);load()}}>Delete</button></li>)}</ul></div>}

function Settings(){const[s,setS]=useState({});const load=async()=>{const{data}=await supabase.from('settings').select('*');setS({...TEXT,...Object.fromEntries((data||[]).map(r=>[r.key,r.value]))})};useEffect(()=>{load()},[]);
  const save=async(key,value)=>{await supabase.from('settings').upsert({key,value});setS(x=>({...x,[key]:value}))};
  const File=({k,label,accept,folder})=><div className="flex items-center gap-3 bg-white rounded-lg p-3"><span className="w-40 text-sm">{label}</span><label className="btn2 cursor-pointer">Upload<input type="file" hidden accept={accept} onChange={async e=>{const f=e.target.files[0];if(!f)return;const u=await uploadFile(accept==='image/*'?await compressImage(f):f,folder);save(k,u.url)}}/></label><span className="text-xs opacity-60 truncate">{s[k]}</span></div>;
  return <div className="space-y-4"><label className="block text-sm">Letter<textarea rows="6" key={s.letter} defaultValue={s.letter} onBlur={e=>save('letter',e.target.value)}/></label>
    <label className="block text-sm">Hidden message ("One More Thing")<textarea rows="3" key={s.hidden_message} defaultValue={s.hidden_message} onBlur={e=>save('hidden_message',e.target.value)}/></label>
    <label className="block text-sm">Song title<input key={s.music_title} defaultValue={s.music_title} onBlur={e=>save('music_title',e.target.value)}/></label>
    <File k="music_url" label="Music file" accept="audio/*" folder="music"/><File k="music_cover" label="Album cover" accept="image/*" folder="music"/>
    <File k="hero_bg" label="Opening background" accept="image/*" folder="bg"/><File k="final_bg" label="Final background" accept="image/*" folder="bg"/></div>}

export default function Admin(){const[u,setU]=useState(null);const[ok,setOk]=useState(false);const[tab,setTab]=useState('photo');
  useEffect(()=>{supabase.auth.getSession().then(({data})=>{setU(data.session?.user||null);setOk(true)});const{data:l}=supabase.auth.onAuthStateChange((_,s)=>setU(s?.user||null));return()=>l.subscription.unsubscribe()},[]);
  if(!ok)return null;if(!u)return <Login/>;
  const tabs=[['photo','Photos'],['video','Videos'],['timeline','Story'],['things','Little things'],['settings','Texts & media']];
  return <div className="max-w-5xl mx-auto p-6"><div className="flex justify-between items-center mb-6"><h1 className="font-serif text-4xl">Content Manager</h1><div className="flex gap-3"><a href="/" className="btn2">View site</a><button className="btn2" onClick={()=>supabase.auth.signOut()}>Sign out</button></div></div>
    <div className="flex flex-wrap gap-2 mb-8">{tabs.map(([k,l])=><button key={k} onClick={()=>setTab(k)} className={`btn2 ${tab===k?'bg-cocoa text-cream':''}`}>{l}</button>)}</div>
    {tab==='photo'&&<Media kind="photo"/>}{tab==='video'&&<Media kind="video"/>}{tab==='timeline'&&<Timeline/>}{tab==='things'&&<Things/>}{tab==='settings'&&<Settings/>}</div>}
