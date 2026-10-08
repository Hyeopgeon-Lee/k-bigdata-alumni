# BigData Alumni Network Apps Script 자동배포

`alumni.k-bigdata.kr`의 Apps Script 백엔드는 GitHub 저장소의 `apps-script/`를 원본으로 관리합니다.

자동배포 흐름:

```text
GitHub main
  -> Code.gs 문법 검사
  -> appsscript.json 검증
  -> js/config.js 운영 Deployment ID 일치 확인
  -> clasp push
  -> 기존 Web App deployment 재배포
```

## 필요한 Repository Secrets

`Settings -> Secrets and variables -> Actions -> Repository secrets`에 다음 3개를 등록합니다.

| Secret | 값 |
|---|---|
| `GAS_SCRIPT_ID` | Alumni Apps Script Script ID |
| `GAS_DEPLOYMENT_ID` | 현재 운영 Web App Deployment ID |
| `CLASP_CREDENTIALS_JSON` | `clasp login`으로 생성된 인증 JSON |

### GAS_SCRIPT_ID

```text
1Wh-VQu86y7OkWsHBBVRP1eqtJEArYfmWq7xwx_pl3cvQ2BvGOF1JIr8N
```

### GAS_DEPLOYMENT_ID

현재 `js/config.js`의 운영 Web App Deployment ID:

```text
AKfycbwMMOwofSybWFy3BYmPi9ol_VQsi_WFfjnEzvnrxUF4ncDZ5TQeS8tcRyOXcgCbgVU4
```

기존 Deployment ID를 갱신하므로 `/exec` URL은 유지됩니다.

### CLASP_CREDENTIALS_JSON

앞서 사용한 동일 Google 계정이면 같은 `.clasprc.json` 값을 재사용할 수 있습니다. 다만 Secret은 저장소마다 별도로 등록합니다.

Windows 11 PowerShell:

```powershell
Get-Content -Raw "$HOME\.clasprc.json" | Set-Clipboard
```

인증 JSON은 채팅이나 저장소에 올리지 않고 GitHub Secret에만 저장합니다.

## 안전장치

- `Code.gs` 문법 오류 시 배포 중단
- `appsscript.json` 파싱 오류 시 배포 중단
- Secret의 `GAS_DEPLOYMENT_ID`와 `js/config.js`의 실제 운영 URL이 다르면 배포 중단
- 자동배포 실패 시 마지막 성공 Web App 버전 유지
- Script Properties와 기존 Trigger는 `clasp push` 및 재배포로 삭제되지 않음
