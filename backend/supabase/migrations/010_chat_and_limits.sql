-- 횟수 제한을 셀 때 쓰는 인덱스 (최근에 내가 보낸 메시지·신고 수).
create index messages_sender_created on public.messages (sender, created_at);
create index reports_reporter_created on public.reports (reporter, created_at);

-- 채팅 목록용. 채팅방마다 마지막 메시지 하나씩을 한 번에 가져온다.
create function public.last_messages(p_matches uuid[])
returns setof public.messages
language sql stable as $$
  select distinct on (match_id) *
  from public.messages
  where match_id = any (p_matches)
  order by match_id, created_at desc;
$$;

-- 함수는 기본으로 누구나 실행할 수 있다. API 서버(service_role)만 부르게 한다.
revoke execute on function public.last_messages(uuid[]) from public, anon, authenticated;
grant execute on function public.last_messages(uuid[]) to service_role;
