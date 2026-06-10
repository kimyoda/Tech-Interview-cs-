# macOS에서 Codex 앱 GUI 이슈 해결

> CLI는 정상이나, GUI만 검은 화면으로 멈추는 현상, 원인과 해결 과정을 공유한다

---

## 문제 상황

Codex앱은 데스크톱 GUI와 터미널 CLI 두 가지 형태로 제공된다
갑자기 어느날 CLI는 정상 동작하나, GUI 앱을 열면 다음과 같은 증상이 나타났다.

| 항목               | 상태                                       |
| ------------------ | ------------------------------------------ |
| Codex GUL 실행     | 창이 열리자마자 검은 화면, 화면이 멈춘다   |
| Codex CLI(`codex`) | 정상 동작                                  |
| CPU 점유율         | 실행 직후 100$로 치솟음 (렌더링 루프 의심) |
| 메뉴/버튼 클릭     | 완전 무응답                                |

---

## 환경 정보

```
# 아키텍처 확인
$ uname -m
arm64

# 바이너리 확인
$ file /Applications/Codex.app/Contents/MacOS/Codex
Mach-O 64-bit executable arm64
```

- 칩: Apple Silicon (arm64)
- OS: macOS
- Codex 바이너리: arm64 정상 확인
- 앱 리소스: `codex`, `node`, `node_repl` 등 필요 파일 모두 존재
- 보안 프로그램: NAC 솔루션 설치 환경

---

## 원인 분석

```
1. GUI 렌더링 캐시 문제
   앱의 캐시/설정이 꼬인 경우 렌더링 루프 발생

2. GPU / Metal 렌더링 충돌
   Apple Silicon 환경에서 GPU 가속과 Metal 기능 충돌 가능

3. Codex 계정 / 세션 꼬임
   캐시에 저장된 로그인 세션이 엉켜 초기화 단계에서 멈춤

4. ~/.codex 설정과 새 앱 버전 불일치
   이전 버전 설정 잔존 → 새 앱 로딩 과정에서 오류 발생

```

---

## 시도한 해결 방법들

1. GPU / Metal 비활성화
   그래픽 드라이버 문제를 우회할 때 먼저 시도하는 방법

```bash
# Codex 프로세스 완전 종료
pkill -f "Codex"
pkill -f "codex"

# GPU 비활성화 후 실행
open -a Codex --args --disable-gpu

# 그래도 안 되면 Metal 기능도 함께 비활성화
pkill -f "Codex" && pkill -f "codex"
open -a Codex --args --disable-gpu --disable-features=Metal
```

결과 - 검은 화면 동일하게 재현. GPU 문제가 아닌걸로 확인

---

2. 내부 로그 출력
   `open -a`로 실행 터미널에 오류가 출력되지 않는다.
   환경 변수를 내부 로그와 스택 덤프를 확인한다.

```bash
pkill -f "Codex" && pkill -f "codex"

ELECTRON_ENABLE_LOGGING=1 \
ELECTRON_ENABLE_STACK_DUMPING=1 \
/Applications/Codex.app/Contents/MacOS/Codex --disable-gpu
```

실패 - GPU 초기화 오류나 렌더링 오류 없음. 로그 분석만으로 원인 특정 불가

---

3. 캐시 및 권한 초기화
   `~/Library` 아래에 저장된 Codex 관련 캐시, WebKit 데이터, 설정 파일, 권한(TCC)을 전부 초기화했다.

```bash
# 프로세스 종료
pkill -f "Codex" && pkill -f "codex"

# Codex 관련 데이터 전체 삭제
rm -rf ~/Library/Application\ Support/Codex
rm -rf ~/Library/Application\ Support/com.openai.codex
rm -rf ~/Library/Caches/Codex
rm -rf ~/Library/Caches/com.openai.codex
rm -rf ~/Library/HTTPStorages/Codex
rm -rf ~/Library/HTTPStorages/com.openai.codex
rm -rf ~/Library/WebKit/Codex
rm -rf ~/Library/WebKit/com.openai.codex
rm -rf ~/Library/Saved\ Application\ State/com.openai.codex.savedState
rm -rf ~/Library/Preferences/com.openai.codex.plist
rm -rf ~/Library/Cookies/com.openai.codex.binarycookies

# macOS 권한(TCC) 초기화
# bundle ID 확인: osascript -e 'id of app "Codex"'
tccutil reset Accessibility com.openai.codex
tccutil reset ScreenCapture com.openai.codex
tccutil reset AppleEvents com.openai.codex

# 재부팅 후 앱 재설치
sudo reboot
```

결과: 실패 - 재설치 후에도 동일한 현상 재현, 캐시/권한 문제도 아니다.

---

## 최종해결: 설정 디렉토리 격리

마지막으로 Codex 사용자 설정 디렉토리(`~/.codex`)를 격리하는 방법을 시도했다
`~/.cdoex` 디렉토리에 다음 정보가 저장된다.

- 프로젝트 신뢰 설정
- 사용자 세션 정보
- 플러그인 설정
- MCP 서버 설정
  새 앱 버전간의 불일칠 또는 손상이 GUI 초기화를 막고있다고 생각했다.

해결절차

1. Codex 프로세스 종료

```bash
pkill -9 -f "Codex"
pkill -9 -f "codex"
```

2. 설정 디렉토리를 백업으로 이동 (삭제 대신 백업)

```bash
mv ~/.codex ~/.codex.backup-test
```

3. Codex 앱 실행

```
open -a Codex
```

결과 : 성공 - 로그인 화면이 정상적으로 표시되고 검은 화면 및 블러 현상이 모두 사라졌다.

### 핵심 포인트

> **Codex GUI가 멈출 때 CLI는 정상일 수 있다.**  
> GUI와 CLI는 다른 레이어에서 동작한다. CLI는 터미널 프로세스라 보안 프로그램이나 설정 파일의 영향을 덜 받는 반면, GUI는 내부 WebView를 사용하여 민감하게 반응한다.

### 권장 점검 순서

```
1. ~/.codex 백업 후 제거  →  가장 빠르고 확실한 해결책
2. GPU/Metal 비활성화    →  그래픽 드라이버 문제를 의심할 경우
3. ~/Library 캐시 초기화 →  앱 상태 꼬임이 의심될 경우
4. 앱 재설치             →  바이너리 문제를 의심할 경우
```

### 추가 참고 사항

- **아키텍처 일치 여부 확인**: 앱을 재설치할 때 `file` 명령으로 바이너리가 `arm64`인지 확인한다.
- **앱 최신 버전 유지**: 설정 파일과 앱 버전 간 불일치를 방지하기 위해 정기적으로 업데이트한다.

---

비슷한 문제를 겪는 분들에게 도움이 되길 바랍니다.  
다른 해결 방법을 찾으셨다면 댓글로 공유해 주시면 감사할 것 같습니다. 🙏
