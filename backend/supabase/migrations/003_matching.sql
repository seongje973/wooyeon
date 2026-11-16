-- 좋아요·넘기기 기록과 매칭. API 서버(service_role)만 읽고 쓴다.
create table public.likes (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references auth.users (id) on delete cascade,
  to_user uuid not null references auth.users (id) on delete cascade,
  liked boolean not null,
  created_at timestamptz not null default now(),
  unique (from_user, to_user)
);

-- 같은 두 사람의 매칭이 두 번 생기지 않도록 user_a < user_b로 저장한다.
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references auth.users (id) on delete cascade,
  user_b uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_a, user_b),
  check (user_a < user_b)
);

alter table public.likes enable row level security;
alter table public.matches enable row level security;
