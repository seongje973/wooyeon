# CLAUDE.md

우연(Wooyeon)은 대학생을 위한 소개팅 앱이다. 학교 이메일(`.ac.kr`)로 인증하고, 1:1 매칭·다대다 파티·채팅을 제공한다. 지금 레포에는 `frontend/`만 있다: Expo SDK 54 + React Native 0.81 + React 19.1 + TypeScript, 라우팅은 expo-router 6, 로그인·데이터는 Supabase(`@supabase/supabase-js`)를 쓴다. 이 문서에는 꼭 지켜야 하는 규칙만 둔다. 설치와 실행은 `frontend/README.md`를 본다 (`cd frontend && npm install && npx expo start`).

## 작업 원칙

속도보다 신중함을 우선한다. 아주 작은 작업은 판단해서 가볍게 처리한다.

### 먼저 생각한다

추측하지 않는다. 헷갈리는 점을 숨기지 않는다. 장단점을 드러낸다.

- 구현 전에 가정을 분명히 말한다. 확실하지 않으면 묻는다.
- 해석이 여러 가지면 하나를 몰래 고르지 말고 선택지를 보여 준다.
- 더 단순한 방법이 있으면 말하고, 필요하면 반대 의견을 낸다.
- 불분명하면 멈추고, 무엇이 헷갈리는지 짚어서 묻는다.
- 불필요한 인사 없이 바로 답한다. 간단한 질문은 짧게, 복잡한 작업은 충분히 자세히 답한다.
- 확실하지 않은 사실·날짜·수치·출처는 확실하지 않다고 먼저 밝힌다.

### 단순하게 만든다

문제를 푸는 최소한의 코드만 쓴다. 추측으로 미리 만들지 않는다.

- 요청하지 않은 기능, 한 번만 쓰는 추상화, 요청하지 않은 "유연성"·설정 옵션, 일어날 수 없는 경우의 예외 처리를 넣지 않는다.
- 200줄로 쓴 것이 50줄로 될 수 있으면 다시 쓴다. "시니어 엔지니어가 보면 과하다고 할까?"를 묻고, 그렇다면 줄인다.
- 새로 만들기 전에 있는 것을 찾는다. 공용 컴포넌트는 `src/components/`(`CommonButton`, `CommonInput`, `SocialButton`), 색은 `src/constants/Colors.ts`, 스크립트는 `frontend/package.json`에 이미 있는지 먼저 본다. 임시 빌드·테스트 스크립트를 따로 만들지 않는다.

### 필요한 곳만 고친다

꼭 필요한 부분만 건드리고, 내가 만든 흔적만 정리한다.

- 주변 코드·주석·포맷을 "개선"하지 않는다. 고장 나지 않은 것은 리팩터링하지 않는다. 내 취향과 달라도 기존 스타일을 따른다.
- 관련 없는 죽은 코드는 지우지 말고 알린다. 내 변경으로 안 쓰게 된 import·변수·함수만 지운다.
- 요청받지 않은 파일·문단·구조는 바꾸지 않는다. 바뀐 줄은 모두 요청으로 설명할 수 있어야 한다.
- 큰 변경, 삭제, 덮어쓰기, 외부 전송은 무엇을 바꿀지 먼저 설명하고 확인을 받는다.
- 작업이 끝나면 바뀐 점과 확인이 필요한 점을 짧게 정리한다.

### 목표를 정하고 검증으로 끝낸다

성공 기준을 정하고, 검증될 때까지 반복한다.

- 작업을 확인 가능한 목표로 바꾼다. 아직 테스트 환경이 없으므로, 기준은 아래 "검증" 명령과 실제 화면 동작(어떤 화면에서 무엇을 누르면 무엇이 보이는지)으로 정한다.
- 여러 단계 작업은 짧은 계획을 먼저 적는다. 형식: `1. [단계] → 확인: [검사]`
- 완료는 검증 명령을 직접 돌리고 결과를 확인한 뒤에만 말한다. 화면을 직접 띄워 보지 못했으면 못 봤다고 밝힌다.

## 경계

**먼저 확인받는다** (준비와 로컬 검증은 묻기 전에 끝내 둔다)

- 새 외부 패키지 추가, 메이저 버전 올리기, Expo SDK 올리기
- 앱 설정 변경: `frontend/app.json`, `frontend/tsconfig.json`, `frontend/eslint.config.js`
- Supabase 쪽 변경(테이블, RLS 정책, 인증 공급자·리디렉션 URL 설정). 레포 밖에 있어서 되돌리기 어렵다.
- 요청하지 않은 파일·문단 삭제나 덮어쓰기, 외부 서비스에 쓰기

**하지 않는다**

- 비밀값(`.env`, Supabase 키, OAuth 키)을 출력하거나 커밋하지 않는다. 새 환경 변수는 이름과 용도만 PR 설명에 적는다.
- `EXPO_PUBLIC_`로 시작하는 환경 변수는 앱 번들에 그대로 들어간다. 여기에는 공개돼도 되는 값(Supabase URL, anon key)만 넣고, `service_role` 키 같은 서버용 비밀은 앱 코드에 두지 않는다. 권한 제어는 Supabase RLS로 한다.
- `npm run reset-project`를 돌리지 않는다. `app/`을 `app-example/`로 옮기고 빈 프로젝트로 만든다.
- 생성되는 파일을 손으로 고치지 않는다. `package-lock.json`은 `npm install`로 다시 만든다. `ios/`, `android/`는 생성 폴더라 커밋하지 않는다.

그 밖의 읽기, 로컬 수정, 린트·타입 검사, 브랜치·PR 작업은 묻지 않고 진행한다.

## 구조

- `frontend/app/`은 expo-router 라우트 파일만 둔다. 라우트 파일은 `src/screens/`의 화면을 가져와 내보내기만 한다 (예: `app/(tabs)/index.tsx` → `@/screens/Main/HomeScreen`). 화면 로직은 `src/screens/<기능>/`에 쓴다.
- 탭은 `app/(tabs)/`(홈·매칭·파티·채팅·마이), 로그인 흐름은 `app/(auth)/`, 로그인 여부에 따른 이동은 `app/_layout.tsx`에서 한다. 새 Stack 화면은 `app/_layout.tsx`에도 등록한다.
- import는 `app → screens → components → constants · lib · api` 방향으로만 한다. `components`는 `screens`를 import하지 않는다.
- `src/` 아래는 `@/` 별칭으로 import한다 (`@/components/CommonButton`). 상대 경로(`../../`)를 새로 쓰지 않는다.
- Supabase는 `src/lib/supabase.ts`의 `supabase` 하나만 쓴다. `createClient`를 다른 곳에서 다시 부르지 않는다. 이 클라이언트가 웹은 `localStorage`, 앱은 AsyncStorage에 세션을 저장한다.

## 프론트엔드 규칙

- 색은 `@/constants/Colors`의 `Colors.*` 토큰을 쓴다. 새 코드에 hex 값을 직접 쓰지 않고, 필요한 색이 없으면 `Colors.ts`에 추가한다. 메인 색은 `Colors.primary`(`primaryLight`·`primaryDark`)이고, 바꿀 때는 `Colors.ts`만 고친다.
- 화면 스타일은 화면 옆 `<화면>.styles.ts` 파일에 `StyleSheet.create`로 둔다 (예: `HomeScreen.styles.ts`).
- `SafeAreaView`는 `react-native` 대신 `react-native-safe-area-context`에서 가져온다.
- Expo 패키지는 `npm install` 대신 `npx expo install <패키지>`로 넣어 SDK 54와 맞는 버전을 받는다. Expo API는 SDK 54 문서(`https://docs.expo.dev/versions/v54.0.0/`)를 기준으로 쓴다.
- 앱이 웹(`expo start --web`)에서도 돌아간다. `localStorage`, `window` 같은 웹 전용 API나 네이티브 전용 API는 `Platform.OS`로 나눠서 쓴다.

## 주석

- 주석은 코드만 보고 알 수 없는 이유(플랫폼 차이, 호출 순서, 바꾸면 안 되는 값)만 쓴다. 다음 줄을 되풀이하거나 버그의 경위를 적지 않는다. 경위는 PR 설명에 쓴다. 내 변경으로 틀리게 된 주석은 고친다.

## 검증

`frontend/`를 바꿨으면 둘 다 돌린다. 문서만 바꿨으면 내용·링크 검토로 끝낸다.

- `npm run lint --prefix frontend` (경고는 기존 것이 있다. 내 변경으로 새 경고·에러가 생기지 않으면 된다)
- `cd frontend && npx tsc --noEmit --ignoreDeprecations 5.0`

함정:

- `tsconfig.json`의 `"ignoreDeprecations": "6.0"`은 설치된 TypeScript 5.9에서 TS5103 에러가 난다. 그래서 타입 검사는 위처럼 `--ignoreDeprecations 5.0`을 붙여 돌린다. `tsconfig.json`은 확인 없이 고치지 않는다.
- `src/api/auth.ts`는 axios로 `https://api.wooyeon.com`(임시 주소, 이 레포에 서버 없음)을 부르고, 로그인은 Supabase를 쓴다. 서버 호출을 새로 만들 때는 어느 쪽으로 할지 먼저 묻는다.
- 아직 테스트 러너가 없다. 테스트를 추가하려면 먼저 도구(예: jest-expo) 도입을 확인받는다.
- 로그인 여부는 `app/_layout.tsx`가 Supabase 세션으로 정한다. 실제 로그인 없이 웹에서 로그인 후 화면을 보려면, 아무 값의 `EXPO_PUBLIC_SUPABASE_URL`(예: `https://dummy.supabase.co`)로 띄우고 `localStorage`의 `sb-dummy-auth-token`에 만료 전 `expires_at`을 가진 가짜 세션 JSON을 넣은 뒤 새로고침한다.
- `app.json`의 `scheme: "wooyeon"`은 소셜 로그인 리디렉션(`Linking.createURL('/')`)에 쓰인다. 바꾸면 Supabase에 등록된 리디렉션 URL도 같이 바꿔야 로그인이 된다.
- `app.json`이 가리키는 `./assets/images/*` 파일이 레포에 없다. 빌드·아이콘 관련 작업 전에 이미지를 먼저 채워야 한다.
- `.vscode/settings.json`이 저장할 때 import 정리·멤버 정렬을 한다. 내가 건드리지 않은 줄이 바뀌었으면 되돌린다.
- 패키지 매니저는 npm만 쓴다 (`package-lock.json` 기준, yarn·pnpm 금지).

## 파일 형식

- 텍스트 파일은 LF 줄바꿈이다. CRLF로 바뀐 파일은 LF로 맞춰 커밋한다.
- 코드 포맷은 `frontend/.prettierrc`를 따른다. 기존 파일의 따옴표가 섞여 있어도 내가 바꾸는 줄만 맞추고, 파일 전체를 다시 포맷하지 않는다.
- 코드 주석과 문서는 한국어로 쓴다.

## PR과 리뷰

- 작업은 브랜치에서 하고 PR로 올린다. PR 하나는 한 가지 일만 하고, 한 번에 읽을 수 있는 크기로 만든다. 이유가 둘이면 PR을 나눈다.
- PR은 직접 머지하지 않는다. 머지는 사용자가 한다. PR이 준비되면 준비됐다고 알린다.
- PR 브랜치는 rebase·force push하지 않는다 (봇이 PR 브랜치에 커밋을 올릴 수 있다).
- CodeRabbit 리뷰 코멘트는 코드와 대조해 검증하고 맞는 것만 고친다. 반영하지 않은 코멘트에는 이유를 짧게 답한다.
- 수정은 한 번에 모아 푸시하고, 자동 리뷰가 멈추면 `@coderabbitai review`로 다시 요청한다.
- 충돌은 `main`을 브랜치에 merge해서 풀고, lockfile은 `main` 쪽을 받은 뒤 `npm install`로 다시 만든다.

## 이 문서 관리

- 코드나 설정을 보면 알 수 있는 내용(폴더 목록, 스크립트 전체)과 일반론은 쓰지 않는다. 지키지 않으면 실제로 문제가 나는 규칙만 둔다.
- 금지 규칙에는 대신 할 행동을 함께 쓴다.
- 백엔드나 테스트 환경이 생기면 그 PR에서 이 문서의 구조·검증 부분을 같이 고친다.
- 작업하다 새 함정을 찾으면 한 줄로 "함정"에 추가하고, 그 수정과 같은 PR에 넣는다. 틀린 규칙은 발견한 PR에서 고치거나 지운다.
