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

처음 한 번은 `supabase/migrations/`의 SQL을 Supabase SQL Editor에서 실행한다.

## 환경 변수

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`: 필수. service_role 키는 서버에만 둔다.
- `RESEND_API_KEY`, `MAIL_FROM`: 인증 메일 발송용(Resend). 키가 없으면 개발 중에는 인증번호를 콘솔에 찍는다.
- `PORT`: 기본 3000.

## API

모두 `Authorization: Bearer <Supabase access token>`이 필요하다.

- `POST /verification/school-email/send` `{ "email": "me@snu.ac.kr" }` → `{ "universityId": "snu" }`. 지원하지 않는 학교 400, 다른 계정이 이미 인증한 이메일 409, 60초 안에 다시 요청 429.
- `POST /verification/school-email/verify` `{ "code": "123456" }` → `{ "universityId", "email" }`. 틀린 번호·만료 400, 5번 넘게 틀림 429.
