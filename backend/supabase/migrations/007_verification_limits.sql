-- 인증 메일 하루 발송 횟수. send_window_at부터 24시간 동안 보낸 횟수를 센다.
alter table public.school_verifications
  add column send_count int not null default 0,
  add column send_window_at timestamptz;
