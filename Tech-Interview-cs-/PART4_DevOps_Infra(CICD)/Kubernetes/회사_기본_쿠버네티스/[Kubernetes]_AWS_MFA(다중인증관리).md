# 🌐 쿠버네티스(Kubernetes), AWS MFA(다중인증) 설정

## 🎯 1. AWS 계정보완 강화 MFA

- AWS 계정 보안을 강화, MFA(Multi-Factor Authentication) 설정 방법

### 1-1. MFA란?

- MFA는 비밀번호 + 스마트폰으로 이중 보안을 설정하는 방법
  - 1단계: 아이디 / 비밀번호 입력
  - 2단계: 스마트폰 앱에서 6자리 숫자 입력

### 1-2 확인 작업

- 필수 앱 설치
  - Google Authenticator
    - IOS 다운
    - Android 다운
  - Microsoft Authenticator
    - IOS 다운
    - Android 다운

### 단계별 설정 가이드 🚀

#### 1단계: IAM 화면으로 이동

AWS 콘솔

```bash
AWS 콘솔 -> IAM 서비스 검색 -> IAM 클릭
```

또는

```bash
https://console.aws.amazon.com/iam/
```

#### 2단계: 보안 자격 증명 페이지 이동

1. 우측 상단 계정명 클릭
2. 보안 자격 증명(Security credentials)선택
   또는:
3. IAM 대시보드 -> 사용자 메뉴
4. 본인 사용자명 클릭
5. 보안 자격 증명 탭 선택

#### 3단계: MFA 디바이스 추가

3-1. MFA 설정

1.  다중 인증(MFA) 섹션
2.  MFA 디바이스 할당
    3-2. MFA 디바이스 할당

```bash
디바이스 이름: [본인_ID_입력]
```

예시:

- 본인 ID가 `kimyohan` -> `kimyohan`
- 본인 ID가 `neo_dididi1212` -> `neo_dididi1212`
  본인 ID와 동일하게 설정한다.

3-3 MFA 디바이스 유형
"Aythenticator app " 선택 -> 다음

#### 4단계: QR 코드 스캔 및 등록 📲

4-1. QR 코드 화면

- AWS 화면 -> QR 코드

4-2. 스마트폰 앱 -> QR 코드 스캔

- Google Authenticator 사용 :

  1. 앱 실행
  2. 우측 하단 + 버튼 선택
  3. QR 코드 선택
  4. AWS 화면의 qr 코드를 카메라로 스캔
  5. 계정 추가 확인

- Microsoft Authenticator 사용:
  1. 앱 실행
  2. 계정 추가 -> 회사 학교 or 학교 계정
  3. QR 코드 스캔
  4. AWS QR 코드 스캔

4-3. 6자리 OTP 입력

1. 스마트폰 앱에서 6자리 확인
2. AWS 화면 **MFA 코드1**에 입력
3. 30초 기다린 후 새로운 6자리 숫자 확인
4. AWS 화면의 **MFA 코드 2**에 입력
5. MFA 추가 버튼 클릭

#### 5단계: 설정 완료 확인

성공 메시지 확인

```text
MFA 디바이스가 성공적으로 할당되었다.
```

설정 상태 확인
보안 자격증명 페이지:

```text
다중 인증(MFA): 할당됨
디바이스 이름: [본인_ID]
디바이스 유형: Virtual MFA device
```

### 로그인

#### MFA 적용 후 로그인

1.  일반 로그인
2.  MFA 코드 입력 화면 확인
3.  스마트폰 앱에서 6자리 숫자 확인
4.  MFA 코드 입력 -> 로그인 완료
