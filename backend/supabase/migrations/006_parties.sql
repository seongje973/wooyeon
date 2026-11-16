-- 다대다 파티(미팅). API 서버(service_role)만 읽고 쓴다.
create table public.parties (
  id uuid primary key default gen_random_uuid(),
  host uuid not null references auth.users (id) on delete cascade,
  university_id text not null,
  title text not null check (char_length(title) between 1 and 40),
  description text not null default '' check (char_length(description) <= 500),
  place text not null check (char_length(place) between 1 and 60),
  meet_at timestamptz not null,
  -- 성별마다 받는 인원 (2:2, 3:3, 4:4)
  size int not null check (size between 2 and 4),
  created_at timestamptz not null default now()
);

create table public.party_members (
  party_id uuid not null references public.parties (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  gender text not null check (gender in ('male', 'female')),
  joined_at timestamptz not null default now(),
  primary key (party_id, user_id)
);

create index parties_meet_at on public.parties (meet_at);

-- 동시에 참여해도 성별 인원을 넘지 않도록, 파티 행을 잠근 뒤 센다.
create function public.party_members_check_capacity() returns trigger
language plpgsql as $$
declare
  cap int;
  taken int;
begin
  select size into cap from public.parties where id = new.party_id for update;
  select count(*) into taken from public.party_members
    where party_id = new.party_id and gender = new.gender;
  if taken >= cap then
    raise exception 'party is full' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger party_members_capacity
  before insert on public.party_members
  for each row execute function public.party_members_check_capacity();

alter table public.parties enable row level security;
alter table public.party_members enable row level security;
