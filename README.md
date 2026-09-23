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
4. Apps Script에서 `setup()`을 한 번 실행하고 권한을 승인합니다. 다음 시트와 헤더가 자동 생성됩니다.
5. `admins` 시트에 관리자 Google 이메일, `ACTIVE`, 생성일을 한 행 추가합니다.

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
