-- 차단과 신고. API 서버(service_role)만 읽고 쓴다.
create table public.blocks (
  blocker uuid not null references auth.users (id) on delete cascade,
  blocked uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker, blocked)
);

-- 신고는 운영자가 볼 기록이라, 신고한 사람이 탈퇴해도 남긴다.
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter uuid references auth.users (id) on delete set null,
  reported uuid not null,
  reason text not null check (char_length(reason) between 1 and 500),
  created_at timestamptz not null default now()
);

alter table public.blocks enable row level security;
alter table public.reports enable row level security;
