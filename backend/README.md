# 우연 API 서버

Node.js + NestJS + TypeScript. 로그인은 앱이 Supabase로 하고, 서버는 앱이 보낸 Supabase access token을 확인한 뒤 service_role 키로 Supabase에 쓴다.

## 실행

```bash
cd backend
npm install
cp .env.example .env   # 값 채우기
npm run build
node --env-file=.env dist/main.js
```

`supabase/migrations/`의 SQL을 번호 순서대로 Supabase SQL Editor에서 실행한다.

## 환경 변수

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`: 필수. service_role 키는 서버에만 둔다.
- `RESEND_API_KEY`, `MAIL_FROM`: 인증 메일 발송용(Resend). 키가 없으면 개발 중에는 인증번호를 콘솔에 찍는다.
- `PORT`: 기본 3000.

## API

모두 `Authorization: Bearer <Supabase access token>`이 필요하다.

- `POST /verification/school-email/send` `{ "email": "me@snu.ac.kr" }` → `{ "universityId": "snu" }`. 지원하지 않는 학교 400, 다른 계정이 이미 인증한 이메일 409, 60초 안에 다시 요청 429.
- `POST /verification/school-email/verify` `{ "code": "123456" }` → `{ "universityId", "email" }`. 틀린 번호·만료 400, 5번 넘게 틀림 429.
- `GET /profile/me` → 내 프로필. 없으면 404.
- `PUT /profile/me` `{ nickname, birthYear, gender: "male"|"female", bio?, photoPath?, radiusKm: 5|10|20 }` → 저장한 프로필. 전체를 바꾸는 요청이라 빠진 `bio`·`photoPath`는 비워진다. 학교 인증 전이면 403. 학교는 인증한 이메일에서 정해진다. `photoPath`는 앱이 Storage `profile-photos` 버킷의 `<user_id>/` 아래에 올린 파일 경로다.
- `GET /matching/candidates` → 내 반경(내 학교 기준) 안 학교의 이성 중, 아직 고르지 않은 사람 최대 20명을 가까운 순으로. 프로필이 없으면 404.
- `POST /matching/swipes` `{ targetUserId, liked: true|false }` → `{ matched: false }` 또는 서로 좋아요면 `{ matched: true, matchId }`. 같은 상대를 다시 고르면 409.
- `GET /matching/matches` → 내 매칭 목록과 상대 요약, 최근 순.
