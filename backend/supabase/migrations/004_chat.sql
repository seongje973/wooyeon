-- 매칭된 두 사람의 채팅 메시지. API 서버(service_role)만 읽고 쓴다.
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  sender uuid not null references auth.users (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index messages_match_created on public.messages (match_id, created_at);

alter table public.messages enable row level security;
