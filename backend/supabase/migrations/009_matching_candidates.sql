create index profiles_university on public.profiles (university_id);
create index matches_user_b on public.matches (user_b);

-- 매칭 후보. p_universities는 가까운 학교부터 준다. 그 안에서 성별이 다르고,
-- 내가 아직 고르지 않았고, 서로 차단하지 않은 프로필을 가까운 학교 순으로 돌려준다.
create function public.matching_candidates(p_user uuid, p_gender text, p_universities text[], p_limit int)
returns setof public.profiles
language sql stable as $$
  select p.*
  from public.profiles p
  where p.university_id = any (p_universities)
    and p.gender <> p_gender
    and p.user_id <> p_user
    and not exists (
      select 1 from public.likes l where l.from_user = p_user and l.to_user = p.user_id
    )
    and not exists (
      select 1 from public.blocks b
      where (b.blocker = p_user and b.blocked = p.user_id)
         or (b.blocker = p.user_id and b.blocked = p_user)
    )
  order by array_position(p_universities, p.university_id), p.created_at desc
  limit p_limit;
$$;

-- 함수는 기본으로 누구나 실행할 수 있다. API 서버(service_role)만 부르게 한다.
revoke execute on function public.matching_candidates(uuid, text, text[], int) from public, anon, authenticated;
grant execute on function public.matching_candidates(uuid, text, text[], int) to service_role;
