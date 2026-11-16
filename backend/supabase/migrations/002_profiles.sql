-- 프로필. API 서버(service_role)만 읽고 쓴다.
create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null,
  birth_year int not null,
  gender text not null check (gender in ('male', 'female')),
  bio text not null default '',
  photo_path text,
  university_id text not null,
  radius_km int not null default 10 check (radius_km in (5, 10, 20)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- 프로필 사진. 앱이 로그인한 사용자로 자기 폴더(<user_id>/...)에만 올리고, 읽기는 공개다.
insert into storage.buckets (id, name, public) values ('profile-photos', 'profile-photos', true);

create policy "profile photos: own folder insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "profile photos: own folder update" on storage.objects for update to authenticated
  using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "profile photos: own folder delete" on storage.objects for delete to authenticated
  using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);
