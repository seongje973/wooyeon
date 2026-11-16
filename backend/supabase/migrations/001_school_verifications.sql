-- 학교 이메일 인증. API 서버(service_role)만 읽고 쓴다.
create table public.school_verifications (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  university_id text not null,
  code_hash text,
  attempts int not null default 0,
  sent_at timestamptz not null,
  expires_at timestamptz not null,
  verified_at timestamptz
);

-- 한 학교 이메일은 한 계정만 인증할 수 있다.
create unique index school_verifications_verified_email
  on public.school_verifications (email)
  where verified_at is not null;

-- 정책을 두지 않아 앱(anon, authenticated)에서는 접근할 수 없다.
alter table public.school_verifications enable row level security;
