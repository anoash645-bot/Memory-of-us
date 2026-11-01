import {createClient} from '@supabase/supabase-js';
export const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'http://localhost',process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'x');
export const BUCKET='memories';
export async function uploadFile(file,folder){
  const ext=(file.name.split('.').pop()||'bin').toLowerCase();
  const path=`${folder}/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
  const {error}=await supabase.storage.from(BUCKET).upload(path,file,{cacheControl:'31536000',contentType:file.type});
  if(error)throw error;
  return {url:supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl,path};
}
export async function compressImage(file,max=1920){
  if(!file.type.startsWith('image/'))return file;
  const b=await createImageBitmap(file),s=Math.min(1,max/Math.max(b.width,b.height));
  const c=document.createElement('canvas');c.width=b.width*s;c.height=b.height*s;
  c.getContext('2d').drawImage(b,0,0,c.width,c.height);
  const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.85));
  return new File([blob],file.name.replace(/\.\w+$/,'.jpg'),{type:'image/jpeg'});
}
