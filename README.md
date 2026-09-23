# BigData Alumni Network

한국폴리텍대학 서울강서캠퍼스 빅데이터소프트웨어공학과의 취업·진학·동문 연결 서비스입니다. 졸업생의 공개 프로필을 검색하고, 개인 연락처를 공개하지 않은 채 서버가 연락 요청 메일을 전달합니다.

- 서비스: https://alumni.k-bigdata.kr/
- 프론트엔드: GitHub Pages, HTML/CSS/Vanilla JavaScript
- 백엔드: Google Apps Script Web App
- 저장소: Google Sheets
- 메일: Apps Script `MailApp`

## 아키텍처와 보안 경계

브라우저는 Apps Script에 공개 프로필 또는 `alumni_id`만 요청합니다. `list`와 `detail`은 명시된 공개 필드만 반환하며 이메일, 휴대전화, PIN 해시는 반환하지 않습니다. 연락 요청에서는 Apps Script가 시트에서 대상 이메일을 내부 조회하여 HTML 메일을 발송합니다. 신규 등록과 수정은 `PENDING`이 되고 승인 후 공개됩니다.

PIN은 Script Property의 무작위 `PIN_PEPPER`와 alumni ID를 사용한 HMAC-SHA256 결과만 저장됩니다. 관리자 작업은 Google ID 토큰의 서명 정보·issuer·audience·이메일 확인 여부를 검증하고 `admins` 시트의 `ACTIVE` 계정을 다시 확인합니다.

## 파일 구조

```text
index.html              졸업생 검색/필터
detail.html             공개 상세 정보
contact.html            비공개 연락 요청
alumni.html             신규 등록/본인 PIN 수정
admin.html              승인/반려/비공개 및 요청 기록
css/style.css           모바일 우선 공통 디자인
js/config.js            Apps Script URL, Google OAuth Client ID
js/api.js               API 통신/타임아웃
js/common.js            공통 UI/escaping
js/app.js               검색·필터·카드
js/detail.js            상세 표시
js/contact.js           연락 요청
js/alumni.js            조건부 등록·수정 폼
js/admin.js             Google 로그인·관리 기능
apps-script/Code.gs     Apps Script 백엔드
apps-script/appsscript.json
CNAME
```

## Google Sheets 설치

1. 빈 Google Sheets를 만들고 **확장 프로그램 → Apps Script**를 엽니다.
2. `apps-script/Code.gs`와 `apps-script/appsscript.json` 내용을 각각 복사합니다.
3. Apps Script **프로젝트 설정 → 스크립트 속성**에 `SPREADSHEET_ID`를 만들고 Sheets URL의 `/d/` 다음 ID를 저장합니다.
4. 같은 위치에 `ADMIN_NOTIFICATION_EMAIL`을 만들고 신규 졸업생 승인 요청을 받을 관리자 이메일을 저장합니다. 등록 시 개인정보를 제외한 요약과 7일 동안 유효한 서명 승인 링크가 발송됩니다.
5. Apps Script에서 `setup()`을 한 번 실행하고 권한을 승인합니다. 다음 시트와 헤더가 자동 생성됩니다.
6. `admins` 시트에 관리자 Google 이메일, `ACTIVE`, 생성일을 한 행 추가합니다.

### `alumni`

`alumni_id, name, student_id, graduation_year, email, phone, employment_status, company, job, company_url, employment_year, job_description, skills, bachelor_status, bachelor_school, bachelor_major, bachelor_year, graduate_status, graduate_school_type, graduate_school, graduate_major, graduate_degree, graduate_entry_year, graduate_graduation_year, research_fields, mentoring_topics, introduction, message_to_juniors, contact_allowed, edit_pin_hash, status, created_at, updated_at`

`status`: `PENDING`, `APPROVED`, `REJECTED`, `HIDDEN`. 취업 상태와 대학원 상태는 서로 다른 열이며 동시에 저장·표시됩니다.

### `contact_requests`

`request_id, alumni_id, requester_name, requester_type, requester_student_id_or_year, requester_email, requester_phone, share_email, share_phone, category, subject, message, status, created_at, sent_at`

`status`: `PENDING`, `SENT`, `FAILED`.

### `admins` / `logs`

- `admins`: `email, status, created_at`
- `logs`: `log_id, action, result, reference_id, detail, created_at`

## Google OAuth와 Apps Script 배포

1. Google Cloud Console에서 OAuth 2.0 웹 클라이언트를 만듭니다.
2. 승인된 JavaScript 원본에 `https://alumni.k-bigdata.kr`과 필요하면 GitHub Pages 원본을 추가합니다.
3. Apps Script **프로젝트 설정 → 스크립트 속성**에 `GOOGLE_CLIENT_ID`를 만들고 OAuth Client ID를 저장합니다.
4. **배포 → 새 배포 → 웹 앱**에서 실행 사용자를 **나**, 액세스 사용자를 **모든 사용자**로 설정합니다. 공개 조회/등록 엔드포인트 때문에 익명 접근이 필요하며 관리자 권한은 각 작업 내부에서 별도 검증됩니다.
5. `/exec`로 끝나는 배포 URL을 복사합니다.
6. `js/config.js`의 `API_URL`과 `GOOGLE_CLIENT_ID`를 각각 배포 URL과 OAuth Client ID로 바꿉니다.
7. Apps Script 코드를 바꿀 때는 반드시 새 버전으로 웹 앱 배포를 업데이트합니다.

## GitHub Pages와 Custom Domain

1. GitHub 저장소 **Settings → Pages**에서 `main` 브랜치 루트 배포를 선택합니다.
2. Custom domain을 `alumni.k-bigdata.kr`로 지정하고 DNS 확인 뒤 **Enforce HTTPS**를 켭니다.
3. 저장소의 `CNAME`은 이미 `alumni.k-bigdata.kr`로 구성되어 있습니다.
4. Cafe24 CNAME이 GitHub Pages 대상과 연결되었는지 확인합니다.

## 운영 방법

- 졸업생 신규 등록은 `PENDING`; 관리자가 승인해야 검색에 표시됩니다.
- 졸업생 수정도 PIN 본인 확인 후 `PENDING`으로 돌아가 재승인을 거칩니다.
- 관리자 페이지에서 Google 로그인 후 승인, 반려, 비공개 전환과 연락 요청 발송 상태를 확인합니다.
- `admins` 시트의 상태를 `ACTIVE`가 아닌 값으로 바꾸면 즉시 관리 권한이 중단됩니다.
- Apps Script와 Sheets 편집 권한은 최소 인원에게만 부여합니다.
- Apps Script 메일 일일 할당량과 `logs`의 `FAILED`를 정기 확인합니다.

## 검증 체크리스트

로컬에서는 정적 서버로 저장소 루트를 열고 브라우저 개발자 도구에서 검사합니다.

- 360, 390, 430px, 태블릿, 1920px에서 가로 스크롤 없음
- 검색과 모든 필터, 취업+대학원 병행 카드/상세 표시
- 등록/수정 조건부 필드와 필수값, `PENDING` 처리
- `list`, `detail` Network 응답에 `email`, `phone`, `edit_pin_hash`가 없음
- 연락 요청이 `alumni_id`만 대상으로 보내며 공개 선택한 요청자 연락처만 메일에 포함
- 30분 중복 제한, 버튼 잠금, 서버 길이·형식 검증, 실패 로그
- 미승인/반려/비공개 상세 조회 차단
- 비관리자 토큰으로 관리자 작업 거부
- 브라우저 콘솔 오류 없음, HTTPS/Custom Domain 정상

> 실제 개인정보나 운영 PIN, API 응답 덤프를 GitHub 이슈·커밋·README에 추가하지 마세요.

## 선배가 알려준 채용정보

승인된 졸업생은 `job-submit.html`에서 Alumni ID와 수정 PIN으로 본인 확인 후 채용정보를 등록할 수 있습니다. 신규 공고는 `PENDING`으로 저장되고 관리자 승인 전에는 공개되지 않습니다. 승인된 모집중 공고는 홈(최근 3건), `jobs.html`, `job-detail.html`, 등록 졸업생의 상세 프로필에 표시됩니다. 마감일이 지나고 상시채용이 아닌 공고는 `EXPIRED`로 자동 전환됩니다.

추가 파일은 `jobs.html`, `job-detail.html`, `job-submit.html`, `css/jobs.css`와 관련 `js/` 파일입니다. 기존 공개 API와 동일하게 채용정보 API도 이메일, 휴대전화, PIN 해시, 승인 nonce를 반환하지 않습니다. 채용 문의는 `job_id`와 `alumni_id`를 서버에서 함께 검증한 뒤 기존 비공개 연락 전달 구조를 사용합니다.

### 추가되는 Sheets 구조

- `alumni` 끝에 안전하게 추가: `career_mail_enabled, career_mail_consent_at, career_mail_updated_at`
- `jobs`: `job_id, alumni_id, company, job_title, recruit_type, employment_type, location, job_url, deadline, always_open, skills, alumni_comment, referral_available, contact_allowed, status, approved_at, approved_by, created_at, updated_at, last_mailed_at, approval_nonce_hash, approval_token_expires_at`
- `alumni_consent_logs`: `log_id, alumni_id, consent_type, previous_value, new_value, changed_at`
- `job_mail_logs`: `mail_id, job_ids, recipient_count, sent_count, failed_count, sent_at, status`
- `career_consent_invites`: `invite_id, alumni_id, sent_at, status`

`migrateJobsFeature()` 또는 최신 `setup()`은 시트를 삭제하거나 초기화하지 않습니다. 기존 헤더 순서를 확인한 뒤 누락된 끝 열과 새 시트만 추가합니다. 기존 졸업생의 `career_mail_enabled`는 빈값으로 유지되며 `TRUE`로 자동 변경되지 않습니다.

### 승인 메일과 보안

채용정보 등록 시 `ADMIN_NOTIFICATION_EMAIL`로 모바일용 HTML 승인 메일을 보냅니다. 승인·반려 URL은 `APPROVAL_TOKEN_SECRET`을 이용한 HMAC-SHA256 서명, 7일 만료시간, 공고별 일회용 nonce 해시를 사용합니다. 처리 후 nonce를 비워 재사용과 중복 처리를 막습니다. 비밀값과 원문 nonce는 GitHub에 저장하지 않습니다.

필수 Script Properties:

- `SPREADSHEET_ID`: 운영 Google Sheets ID
- `GOOGLE_CLIENT_ID`: 관리자 Google OAuth 웹 클라이언트 ID
- `ADMIN_NOTIFICATION_EMAIL`: 승인 요청 수신 관리자 이메일
- `SITE_URL`: `https://alumni.k-bigdata.kr` (생략 시 이 주소 사용)
- `PIN_PEPPER`, `APPROVAL_TOKEN_SECRET`: `setup()`과 최초 사용 시 안전하게 생성; 운영 중 임의 변경 금지

### 일일 채용정보 Digest

`sendDailyJobDigest()`는 아직 발송하지 않은 승인·모집중 공고를 한 통의 HTML Digest로 묶어 `status == APPROVED`, `career_mail_enabled == TRUE`, 유효한 이메일이 있는 졸업생에게만 발송합니다. 공고가 없으면 메일을 보내지 않습니다. 발송 후 `last_mailed_at`과 `job_mail_logs`를 기록해 다음 날 중복 발송하지 않습니다. 일일 MailApp 할당량이 전체 대상보다 적으면 발송하지 않고 `QUOTA_BLOCKED`를 기록합니다. 개인별 실패는 나머지 발송을 중단하지 않습니다.

Apps Script 편집기에서 `installDailyJobDigestTrigger()`를 한 번 실행하면 Asia/Seoul 기준 매일 오전 8시 시간 기반 Trigger가 생성됩니다. 또는 **Apps Script → 트리거(시계 아이콘) → 트리거 추가**에서 실행 함수 `sendDailyJobDigest`, 이벤트 소스 `시간 기반`, 유형 `일 단위 타이머`를 선택합니다.

## 동문소식

`news.html`, `news-detail.html`, `news-submit.html`은 취업, 이직, 승진·보직, 창업, 대학원·학위, 수상·성과, 결혼, 득남, 득녀, 부고, 기타 소식을 제공한다. 모든 소식은 등록 즉시 `PENDING`으로 저장되고 관리자 승인 후 공개된다. 사진은 직접 저장하지 않으며 청첩장, 부고장, 성과 페이지 같은 HTTPS 외부 URL만 연결한다.

일반 소식은 본인의 `alumni_id`와 `submitted_by_alumni_id`가 같다. 부고는 인증된 다른 졸업생이 승인된 대상 동문을 공개정보로 검색해 대신 등록할 수 있으며, 이 경우 `alumni_id`는 소식 대상, `submitted_by_alumni_id`는 실제 등록자다. 공개 검색과 공개 API에는 이메일, 휴대전화, 학번, PIN 해시, 승인 nonce와 만료시간을 반환하지 않는다.

지원 enum은 `EMPLOYMENT`, `JOB_CHANGE`, `PROMOTION`, `STARTUP`, `GRADUATE_SCHOOL`, `ACHIEVEMENT`, `MARRIAGE`, `BIRTH_SON`, `BIRTH_DAUGHTER`, `OBITUARY`, `OTHER`이며 화면에는 한글 명칭만 표시한다.

### Sheets 마이그레이션

Apps Script 편집기에서 `migrateAlumniNewsFeature()`를 한 번 실행한다. 기존 시트·행·값은 삭제하거나 변경하지 않고 다음 구조만 추가한다.

- `alumni` 마지막 열: `alumni_news_mail_enabled`, `alumni_news_mail_consent_at`, `alumni_news_mail_updated_at`
- `alumni_news`: 소식 본문, 대상/등록자, 승인 및 일회용 nonce 상태
- `alumni_news_mail_logs`: 소식별 전체메일 대상·성공·실패·상태
- `alumni_news_consent_invites`: 기존 졸업생 안내메일 1회 발송 기록
- 기존 `alumni_consent_logs`: `consent_type=ALUMNI_NEWS_MAIL`로 변경 이력 추가

기존 졸업생의 `alumni_news_mail_enabled`는 빈값으로 유지된다. `TRUE`인 승인 졸업생만 전체메일 대상이며 `FALSE`와 빈값은 제외한다. 채용메일의 `career_mail_enabled`와 완전히 별도다.

### 승인과 경조사 이메일

등록 알림은 기존 `ADMIN_NOTIFICATION_EMAIL`과 `APPROVAL_TOKEN_SECRET`을 재사용한다. 관리자 HTML 이메일의 `게시 + 이메일 발송`, `게시만 하기`, `반려` 링크는 HMAC-SHA256, 약 7일 만료, 1회용 nonce로 보호된다. 관리자 화면도 같은 서버 처리 함수를 사용한다.

결혼·득남·득녀·부고 등록폼의 메일 요청은 기본 ON이고 일반 소식은 기본 OFF다. 요청 여부와 관계없이 관리자가 최종적으로 게시+메일을 선택해야 발송된다. 부고 이메일은 회색 계열의 정중한 디자인을 사용한다.

`alumni_news_mail_logs`에 이미 `SENT`인 `news_id`가 있으면 재발송하지 않는다. 발송 전 `MailApp.getRemainingDailyQuota()`를 검사하며 전체 대상보다 부족하면 일부 발송 없이 `QUOTA_BLOCKED`를 기록한다. 일부 수신자 실패는 `PARTIAL_FAILED`, 전체 실패는 `FAILED`로 기록하되 게시 상태 `APPROVED`는 유지한다.

관리자 화면의 동문소식 관리 탭에서 게시+메일, 게시만, 반려, 숨김, 다시 게시를 처리하고, 통합 메일 발송 기록에서 채용정보와 동문소식 메일을 함께 확인한다. `기존 졸업생 동문소식 수신 설정 안내`는 미설정 승인 졸업생에게 한 사람당 한 번만 발송한다.

### 동문소식 배포 점검

1. `migrateAlumniNewsFeature()` 실행 성공을 확인한다.
2. 기존 Web App 배포를 새 버전으로 업데이트해 API URL을 유지한다.
3. GitHub `main` 반영 후 `news.html`, `news-detail.html`, `news-submit.html`을 확인한다.
4. 일반 소식과 부고 대리 등록이 `PENDING`으로 저장되는지 확인한다.
5. 승인메일의 세 링크가 한 번만 처리되는지 확인한다.
6. `alumni_news_mail_enabled == TRUE`인 승인 졸업생만 메일을 받는지 확인한다.
7. 동일 `news_id` 재승인·새로고침 시 중복메일이 발송되지 않는지 확인한다.
8. 공개 API 응답에 이메일, 전화번호, PIN, nonce가 없는지 확인한다.

추가 Script Property는 필요하지 않다. 기존 `SPREADSHEET_ID`, `GOOGLE_CLIENT_ID`, `ADMIN_NOTIFICATION_EMAIL`, `PIN_PEPPER`, `APPROVAL_TOKEN_SECRET`, 선택 `SITE_URL`을 그대로 사용한다. README나 GitHub에는 실제 개인정보, PIN, 토큰, 비밀값을 기록하지 않는다.

관리자 화면의 **기존 졸업생 수신 설정 안내**는 수신 여부가 빈값이고 아직 안내 성공 기록이 없는 승인 졸업생에게만 1회 안내합니다. 수신을 원하지 않으면 아무 조치가 없어도 발송 대상에 포함되지 않습니다. **채용메일 지금 점검·발송**은 운영 점검용 수동 실행 기능입니다.

### 배포 후 추가 검증

- `migrateJobsFeature()` 실행 전후 기존 `alumni`, `contact_requests`, `admins`, `logs` 행 수와 값이 동일한지 확인
- Alumni ID + PIN 확인 → 공고 등록 → `jobs`의 `PENDING` 저장 → 관리자 HTML 메일 수신
- 승인·반려 링크가 7일 내 한 번만 처리되고 공고 ID 변조 시 거부되는지 확인
- 승인 후 홈, 목록, 상세, 졸업생 프로필에 즉시 표시되는지 확인
- 채용 문의 메일에 공고 ID·회사·직무가 포함되고 개인정보가 공개 API에 없는지 확인
- `TRUE` 수신자만 Digest를 받고 빈값/`FALSE` 사용자는 제외되는지 확인
- 여러 공고가 한 통으로 묶이고 다음 실행에서 같은 공고가 재발송되지 않는지 확인
- 마감 공고가 `EXPIRED`가 되어 공개 목록에서 제외되는지 확인
