# A Story Worth Remembering
1. Buat project di supabase.com → SQL Editor → jalankan `supabase/schema.sql`.
2. Authentication → Users → Add user (email+password Anda). Lalu Authentication → Providers → Email → matikan "Allow new users to sign up" (agar hanya Anda yang bisa edit).
3. Salin `.env.example` ke `.env.local`, isi URL & anon key (Project Settings → API).
4. `npm install && npm run dev` → buka `/admin` untuk login dan isi konten.
5. Deploy: push ke GitHub → Vercel, isi 2 env var yang sama. Link publik langsung aktif.
Batas upload Supabase gratis: 50 MB/file. Video besar sebaiknya dikompres dulu.
Foto contoh ada di `public/photos` (tampil jika database masih kosong).
