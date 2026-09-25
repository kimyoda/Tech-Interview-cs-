# 운영체제

---

## 운영체제와 컴퓨터

### 운영체제의 역할과 구조

#### 운영체제는

**운영체제(Operating System)**는 하드웨어 자원을 관리하고 사용자 프로그램이 컴퓨터 자원을 안전하고 편리하게 사용할 수 있도록 인터페이스를 제공하는 시스템 소프트웨어다

대표적인 운영체제는 아래와 같다

- Windows
- Linux
- macOS
- Android
- iOS

앱은 CPU, 메모리, 디스크 같은 하드웨어를 직접 제어하지 않고 운영체제가 제공하는 기능을 사용

```text
사용자
앱
운영체제
CPU, 메모리, 디스크, 네트워크 장치
```

---

#### 운영체제의 주요 역할

| 역할             | 설명                                          |
| ---------------- | --------------------------------------------- |
| CPU 관리         | 어떤 프로세스와 스레드에 CPU를 할당할지 결정  |
| 프로세스 관리    | 프로세스 생성, 실행, 중단, 종료 관리          |
| 메모리 관리      | 프로세스에 메모리를 할당하고 회수             |
| 파일 시스템 관리 | 파일과 디렉터리의 생성, 읽기, 쓰기, 삭제 관리 |
| 입출력 장치 관리 | 키보드, 디스크, 네트워크 장치 등 관리         |
| 보안과 권한 관리 | 사용자와 프로세스의 자원 접근 제한            |
| 네트워크 관리    | 소켓과 네트워크 장치를 통한 통신 지원         |

---

#### 커널

**커널(Kernel)**은 운영체제의 핵심 부분으로 하드웨어 자원을 직접 관리

커널의 주요 역할은 다음과 같다

- CPU 스케줄링
- 프로세스와 스레드 관리
- 메모리 관리
- 파일 시스템 관리
- 장치 드라이버 관리
- 네트워크 스택 관리
- 시스템 콜 처리

일반 앱은 커널에 직접 접근하지 않고 시스템 콜을 통해 커널 기능을 요청

---

#### 사용자 모드, 커널 모드

CPU는 프로그램의 권한을 구분해 실행

| 구분        | 설명                                                    |
| ----------- | ------------------------------------------------------- |
| 사용자 모드 | 일반 앱이 실행되는 제한된 권한의 모드                   |
| 커널 모드   | 운영체제가 하드웨어와 전체 메모리에 접근할 수 있는 모드 |

사용자 프로그램이 모든 메모리와 하드웨어에 직접 접근할 수 있으면 다른 프로그램이나 운영체제를 손상시킬 수 있다

따라서 일반 앱은 사용자 모드에서 실행되고, 권한이 필요한 작업은 시스템 콜을 통해 커널에 요청

```text
사용자 프로그램
  시스템 콜
커널모드로 전환
커널이 요청 처리
사용자 모드로 복귀
```

CPU가 사용하는 구체적인 권한 단계와 비트 값은 CPU 아키텍처에 따라 다르다

다음처럼 특정 값을 모든 시스템에 공통으로 적용해서 외우는 건 정확하지 않음

```text
0이면 무조건 커널 모드
1이면 무조건 사용자 모드
```

핵심은 CPU가 권한 수준을 구분, 중요한 명령은 커널 모드에서 실행한다는 것

---

#### 시스템 콜

**시스템 콜(System call)**은 사용자 프로그램이 운영체제 커널의 기능을 요청하는 인터페이스

대표적인 시스템 콜은 다음과 같다

- 파일 열기와 읽기
- 파일 쓰기
- 프로세스 생성
- 메모리 할당
- 네트워크 소켓 생성
- 데이터 송수신
- 시간 정보 조회

```text
Node.js fs.readFile()
Node.js, libuv
운영체제 파일 관련 시스템 콜
디스크 또는 파일 시스템
```

Node.js 개발자가 시스템 콜을 직접 호출하지 않아도 Node.js 내부 모듈과 libuv가 운영체제 기능을 사용

---

#### 인터럽트와 트랩

**인터럽트(Interrupt)**는 CPU가 현재 작업을 잠시 중단하고 특정 이벤트를 처리하도록 만드는 신호

| 구분                      | 설명                      | 예                            |
| ------------------------- | ------------------------- | ----------------------------- |
| 하드웨어 인터럽트         | 외부 하드웨어 장치가 발생 | 키보드 입력, 네트워크 패킷    |
| 소프트웨어 인터럽트, 트랩 | 실행 중인 프로그램이 발생 | 시스템 콜, 예외, 0으로 나누기 |

일반적인 처리 흐름은 다음과 같음

```text
CPU가 프로그램 실행
인터럽트 발생
현재 실행 상태 저장
인터럽트 처리 루틴 실행
기존 실행 상태 복원
프로그램 실행 재개
```

#### 운영체제 구조

운영체제는 일반적으로 다음 요소로 구성

```text
사용자 앱
시스템 프로그램과 라이브러리
시스템 콜 인터페이스
커널
하드웨어
```

커널 구조는 구현 방식에 따라 다음과 같이 분류

| 구조            | 설명                                                  |
| --------------- | ----------------------------------------------------- |
| 모놀리식 커널   | 운영체제의 주요 기능을 하나의 큰 커널 공간에서 실행   |
| 마이크로 커널   | 최소 기능만 커널에 두고 나머지를 사용자 공간에서 실행 |
| 하이브리드 커널 | 모놀리식과 마이크로커널의 특징을 혼합                 |

Linux는 일반적으로 모놀리식 커널로 분류, 커널 모듈을 동적으로 추가할 수 있음

> 운영체제는 CPU, 메모리, 파일, 입출력 장치와 같은 하드웨어 자원을 관리, 애플리케이션이 이를 완전하게 사용할 수 있도록 인터페이스를 제공하는 시스템 소프트웨어

> 앱은 사용자 모드에서 실행, 파일이나 네트워크 같은 커널 기능이 필요하면 시스템 콜을 통해 커널 모드의 기능을 요청

---

### 컴퓨터 요소

컴퓨터는 다음 요소로 구성

- CPU
- 메모리
- 보조 저장 장치
- 입출력 장치
- 시스템 버스
- 장치 컨트롤러

---

#### CPU

**CPU(Central Processing Unit)**는 프로그램의 명령어를 해석하고 실행

CPU의 주요 구성 요소는 다음과 같음

| 구성             | 역할                                      |
| ---------------- | ----------------------------------------- |
| 제어 장치        | 명령어를 해석하고 다른 장치의 동작을 제어 |
| 산술논리연산장치 | 산술 연산과 논리 연산 수행                |
| 레지스터         | CPU 내부의 매우 빠른 임시 저장 공간       |
| 캐시             | 자주 사용하는 데이터와 명령어 저장        |

---

#### 명령어 처리 과정

CPU는 다음 과정을 반복

```text
1. Fetch: 메모리에서 명령어를 가져온다
2. Decode: 명령어를 해석
3. Execute: 명령어를 실행
4. Store: 필요한 경우 결과를 저장
```

이를 **명령어 사이클(Instruction Cycle)**이라고 한다

---

#### 레지스터

레지스터는 CPU 내부에 가장 빠르게 접근할 수 있는 저장 공간이다

| 레지스터                 | 역할                      |
| ------------------------ | ------------------------- |
| Program Counter          | 다음에 실행할 명령어 주소 |
| Instruction Register     | 현재 실행 중인 명령어     |
| Stack Pointer            | 현재 Stack 위치           |
| General Purpose Register | 연산 데이터, 임시 값 저장 |

CPU 아키텍처에 따라 실제 레지스터 이름과 구조는 달라짐

---

#### 메모리

주기억장치인 RAM은 실행 중인 프로그램의 코드와 데이터를 저장

CPU는 보조 저장 장치보다 RAM에 훨씬 빠르게 접근할 수 있음

```text
SSD에 저장된 프로그램
  실행
RAM에 프로그램 적재
CPU가 명령어 실행
```

---

#### 타이머

운영체제는 타이머를 이용해 특정 프로그램이 CPU를 계속 독점하지 못하도록 한다

```text
프로세스에 일정 시간 CPU 할당
타이머 인터럽트 발생
운영체제가 CPU 제어권 회수
다른 프로세스 실행
```

선점형 CPU 스케줄링을 구현하는 데 타이머 인터럽트가 사용

---

#### DMA Controller

**DMA(Direct Memory Access)**는 CPU가 모든 입출력 데이터를 직접 옮기지 않아도 장치와 메모리 사이에 데이터를 전송할 수 있도록 한다

```text
DMA를 사용하지 않는 경우
장치 -> CPU -> 메모리
```

```text
DMA를 사용하는 경우
장치 -> 메모리
CPU는 전송 시작만 지시, 완료 인터럽트를 받음
```

DMA를 이용하면 CPU가 데이터 복사 작업에 계속 관여하지 않아도 되어 다른 작업을 수행할 수 있음

---

#### 장치 컨트롤러

장치 컨트롤러는 운영체제, 하드웨어 장치 사이에 통신을 담당한다

운영체제는 장치 드라이버를 통해 장치 컨트롤러와 통신

---

#### Node.js에서 확인

```ts
import { availableParallelism, freemem, totalmem } from "node:os";

function toMb(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(2);
}

console.log({
  cpuCount: availableParallelism(),
  totalMemoryMb: toMb(totalmem()),
  freeMemoryMb: toMb(freemem()),
});
```

`availableParallelism()` 은 Node.js 프로세스가 사용할 수 있는 병렬 처리 수준을 확인해 사용할 수 있음. 컨테이너나 CPU 제한이 있는 환경에서 단순한 물리 CPU 개수와 다를 수 있음

---

## 메모리

### 메모리 계층

컴퓨터의 저장 장치는 속도, 용량, 가격에 따라 계층적으로 구성

```text
빠름 / 용량 작음 / 가격 비쌈
레지스터
L1 Cache
L2 Cache
L3 Cache
RAM
SSD
HDD
느림 / 용량 큼 / 가격 저렴
```

| 계층     | 위치               | 특징                             |
| -------- | ------------------ | -------------------------------- |
| 레지스터 | CPU 내부           | 가장 빠르고 용량이 매우 작다     |
| 캐시     | CPU 내부 또는 주변 | 자주 사용하는 데이터 저장        |
| RAM      | 주기억장치         | 실행 중인 프로그램과 데이터 저장 |
| SSD      | 보조 저장 장치     | 비휘발성, HDD보다 빠름           |
| HDD      | 보조 저장 장치     | 대용량, 상대적으로 느림          |

---

#### 지역성의 원리

CPU Cache는 프로그램이 보이는 접근 패턴인 **지역성(Locality)**을 이용

#### 시간 지역성

최근 사용한 데이터가 가까운 시간에 다시 사용될 가능성이 높다는 성질

```ts
let total = 0;

for (let index = 0; index < 1000; index += 1) {
  total += index;
}
```

`total`과 `index`는 반복해 시간 지역성이 높음

#### 공간 지역성

최근 접근한 메모리 주소 근처의 데이터가 곧 사용될 가능성이 높다는 성질

```ts
const numbers = [1, 2, 3, 4, 5];

for (let index = 0; index < numbers.length; index += 1) {
  console.log(numbers[index]);
}
```

배열을 순서대로 접근하면 인접한 메모리 영역을 사용, 공간 지역성을 활용하기 쉽다

---

#### 캐시 Hit와 Miss

```text
CPU가 필요한 데이터를 Cache에 발견 -> Cache Hit
Cache에 없어 RAM에서 가져 옴 -> Cache Miss
```

캐시 적중률이 높으면 상대적으로 느린 RAM 접근을 줄일 수 있음

---

#### Node.js 프로세스 메모리 확인

```ts
import process from "node:process";

function bytesToMb(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(2);
}

const memory = process.memoryUsage();

console.table({
  rss: bytesToMb(memory.rss),
  heapTotal: bytesToMb(memory.heapTotal),
  heapUsed: bytesToMb(memory.heapUsed),
  external: bytesToMb(memory.external),
  arrayBuffers: bytesToMb(memory.arrayBuffers),
});
```

| 항목           | 설명                                         |
| -------------- | -------------------------------------------- |
| `rss`          | 프로세스가 실제 메모리에 차지하는 전체 영역  |
| `heapTotal`    | V8이 확보한 Heap 크기                        |
| `heapUsed`     | V8 Heap에 실제 사용 중인 크기                |
| `external`     | V8 외부에서 관리되는 C++ 객체 관련 메모리    |
| `arrayBuffers` | `ArrayBuffer`, `Buffer` 등에 사용되는 메모리 |

`heapUsed` 만 확인해 Node.js 프로세스의 전체 메모리 사용량을 판단하면 안 된다

`Buffer`나 Native Module이 사용하는 메모리는 V8 Heap 외부에 존재할 수 있음

---

### 메모리 관리

#### 논리 주소와 물리 주소

프로세스가 사용하는 주소와 실제 RAM의 주소는 구분

| 구분                 | 설명                     |
| -------------------- | ------------------------ |
| 논리 주소, 가상 주소 | 프로세스가 사용하는 주소 |
| 물리 주소            | 실제 RAM의 주소          |

각 프로세스는 자신만의 가상 주소 공간을 가짐

```text
프로세스 A 가상 주소 0x1000 -> 물리 메모리 특정 위치
프로세스 B 가상 주소 0x1000 -> 다른 물리 메모리 위치
```

같은 가상 주소라도 프로세스마다 다른 물리 주소에 연결될 수 있음

---

#### MMU

**MMU(Memory Management Unit)**는 CPU가 사용하는 가상 주소를 물리 주소로 변환하는 하드웨어

```text
CPU가 가상 주소 요청
MMU가 페이지 테이블 확인
물리 주소로 변환
RAM 접근
```

---

#### 가상 메모리

**가상 메모리(Virtual Memory)**는 프로세스가 실제 물리 메모리보다 큰 연속된 메모리 공간을 사용하는 것처럼 보이게 하는 기술

장점

- 프로세스마다 독립된 주소 공간 제공
- 다른 프로세스의 메모리 접근 방지
- 실제 RAM보다 큰 주소 공간 제공
- 필요한 Page만 RAM에 적재 가능
- 메모리 관리 단순화

가상 메모리가 실제 RAM 용량을 무한하게 늘려주는 것은 아님

RAM이 부족해 디스크 접근이 지나치게 증가하면 성능이 크게 저하될 수 있음

---

#### 페이징

**페이징(Paging)**은 가상 메모리와 물리 메모리를 고정 크기의 블록으로 나누는 방식

| 구분  | 설명                         |
| ----- | ---------------------------- |
| Page  | 가상 메모리의 고정 크기 블록 |
| Frame | 물리 메모리의 고정 크기 블록 |

```text
가상 Page 0 -> 물리 Frame 5
가상 Page 1 -> 물리 Frame 2
가상 Page 2 -> 디스크
```

Page, Frame 크기는 같다

---

#### 페이지 테이블

페이지 테이블은 가상 Page, 물리 Frame의 매핑 정보를 저장

```text
가상 Page 번호
-> 페이지 테이블 조회, 물리 Frame 번호 확인
```

프로세스마다 독립적인 페이지 테이블을 가질 수 있음

---

#### TLB

**TLB(Translation Lookaside Buffer)**는 최근 사용한 가상 주소와 물리 주소 변환 결과를 저장하는 고속 캐시

```text
가상 주소 변환 정보가 TLB에 있음 -> TLB Hit -> 빠르게 물리 주소 확인
TLB에 없음 -> TLB Miss -> 페이지 테이블 조회
```

---

#### 페이지 폴트

프로세스가 접근한 Page가 현재 RAM에 없을 때 **페이지 폴트(Page Fault)**가 발생

```text
1. 프로세스가 Page 접근
2. 해당 Page가 RAM에 없음
3. 운영체제에 Page Fault 발생
4. 디스크에서 Page를 읽음
5. RAM의 Frame에 적재
6. 페이지 테이블 갱신
7. 명령어 다시 실행
```

Page Fault 자체는 가상 메모리에서 발생할 수 있는 정상적인 동작, 디스크 접근을 동반하는 Page Fault가 지나치게 많이 발생하면 성능이 크게 저하된다

---

#### 스와핑

메모리가 부족할 때 운영체제는 일부 메모리 내용을 디스크의 Swap 영역으로 옮길 수 있다

```text
RAM 부족
사용 빈도가 낮은 Page를 디스크로 이동
필요할 때 다시 RAM으로 적재
```

디스크는 RAM보다 훨씬 느리므로 Swap 사용이 지나치게 증가하면 시스템 성능이 크게 저하된다

---

#### 스래싱

**스래싱(Thrashing)**은 실제 작업보다 Page를 디스크와 RAM 사이에 교체하는 데 더 많은 시간을 사용하는 상태

```text
메모리 부족
-> Page Fault 증가 -> 디스크 접근 증가 -> CPU는 Page를 기다린다 -> 처리량 급감
```

해결 방법은 다음과 같다

- 실행 프로세스 수 감소
- 메모리 증설
- 프로세스 메모리 제한 조정
- 메모리 누수 제거, 캐시 크기 제한
- Working Set 관리

---

#### 내부 단편화, 외부 단편화

| 구분        | 설명                                                               |
| ----------- | ------------------------------------------------------------------ |
| 내부 단편화 | 할당된 메모리 블록 내부에 사용하지 않는 공간이 남음                |
| 외부 단편화 | 사용 가능한 공간이 여러 위치에 흩어져 큰 연속 공간을 할당하지 못함 |

페이징은 외부 단편화를 줄이고 마지막 Page에서 내부 단편화가 발생할 수 있음

---

#### 페이지 교체 알고리즘

RAM에 빈 Frame이 없을 때 어떤 Page를 내보낼지 결정해야 한다

| 알고리즘 | 설명                                         |
| -------- | -------------------------------------------- |
| FIFO     | 가장 먼저 들어온 Page 교체                   |
| LRU      | 가장 오래 사용하지 않은 Page 교체            |
| Optimal  | 앞으로 가장 오랫동안 사용하지 않을 Page 교체 |
| Clock    | 참조 비트를 이용해 교체 대상 선택            |

Optimal 알고리즘은 미래의 메모리 접근을 알아야 하여 실제 구현보다 다른 알고리즘을 평가하는 기준으로 사용

FIFO는 Frame 수를 늘렸으나 Page Fault가 증가할 수 있는 **Belady's Anomaly**가 발생할 수 있음

---

#### Node.js 메모리 누수

JavaScript는 Garbage Collection을 사용하나 더 이상 필요하지 않은 객체에 대한 참조가 남아 있으면 메모리가 해제되지 않음

- 크기 제한 없는 `Map`
- 전역 배열에 계속 데이터 추가
- 제거하지 않은 Event Listener
- 해제하지 않은 Timer
- Closure가 큰 객체를 계속 참조
- 요청 데이터를 전역 변수에 보관
- 무제한 메모리 캐시
- 종료하지 않은 Stream, Socket

---

#### 잘못된 캐시 예시

```ts
type User = {
  id: number;
  name: string;
};

const userCache = new Map<number, User>();

function cacheUser(user: User): void {
  userCache.set(user.id, user);
}
```

데이터가 계속 추가되고 삭제되지 않으면 프로세스 메모리 사용량이 지속적으로 증가할 수 있음

- 최대 항목 수
- TTL
- LRU 정책, 주기적인 정리
- Redis 같은 캐시
- 메모리 사용량 모니터링

---

## 프로세스, 스레드

### 프로세스와 컴파일 과정

#### 프로그램과 프로세스

**프로그램(Program)**은 디스크에 저장된 실행 가능한 코드

**프로세스(Process)**는 프로그램이 메모리에 적재되어 실행 중인 상태

```text
디스크의 실행 파일 -> 실행 -> 메모리에 적재 -> 운영체제가 자원 할당 -> 프로세스
```

같은 프로그램을 여러 번 실행하면 서로 다른 프로세스가 생성될 수 있음. 각 프로세스는 일반적으로 독립적인 가상 주소 공간과 운영체제 자원을 가짐

---

#### 일반적인 컴파일 과정

C, C++ 같은 컴파일 언어는 일반적으로 다음 과정을 거친다

```text
소스 코드
  전처리
전처리된 소스
  컴파일
어셈블리 코드
  어셈블
오브젝트 파일
  링킹
실행 파일
```

##### 전처리

- `#include`
- Macro
- 조건부 컴파일

##### 컴파일

고급 언어를 어셈블리 코드나 중간 표현으로 변환하고 문법 검사와 최적화를 수행

##### 링킹

여러 오브젝트 파일과 라이브러리를 결합해 실행 파일을 생성

---

#### TypeScript, Node.js 실행 과정

```text
TypeScript
  tsc
JavaScript
  Node.js가 로드
V8이 Parse
Bytecode 생성
실행 중 필요한 코드 JIT 최적화
기계어 실행
```

```ts
const score: number = 100;
```

컴파일 결과:

```js
const score = 100;
```

Node.js는 JavaScript를 단순히 인터프리터 방식으로만 실행하는 것이 아닌 V8 엔진의 Bytecode와 JIT 컴파일을 활용

---

### 프로세스의 상태

프로세스는 실행 과정에서 여러 상태를 가진다

| 상태       | 설명                        |
| ---------- | --------------------------- |
| 생성       | 프로세스가 만들어지는 중    |
| 준비       | CPU를 할당받기 위해 대기    |
| 실행       | CPU에서 명령어 실행 중      |
| 대기, 블록 | I/O나 특정 이벤트 완료 대기 |
| 종료       | 실행이 끝난 상태            |

---

#### 상태 전이

```text
생성
준비
  CPU 할당
실행
  I/O 요청 -> 대기
  시간 할당량 종료 -> 준비
  실행 완료 -> 종료
대기
  I/O 완료
준비
```

I/O가 완료된 프로세스가 즉시 실행 상태가 되는 것은 아님, 일반적으로 준비 상태로 이동한 뒤 CPU 스케줄러의 선택을 기다림

---

#### Ready, Blocked 차이

```text
Ready -> 실행할 준비는 끝났지만 CPU를 기다림
Blocked -> I/O나 Lock 같은 이벤트가 완료되지 않아 실행할 수 없다
```

---

#### Node.js 관점

Node.js에서 비동기 I/O를 기다리는 동안 JavaScript 실행 스레드가 해당 요청만 붙잡고 대기하는 것은 아님

```text
요청 A가 DB 응답 대기
Event Loop가 요청 B의 Callback 실행
요청 A의 I/O 완료
완료 Callback이 실행 대기열에 등록
```

비동기 I/O는 많은 동시 요청을 적은 수의 스레드로 처리하는데 유리, JavaScript에서 CPU 연산을 오래 수행하면 Event Loop가 다른 Callback을 처리하지 못함

---

### 프로세스의 메모리 구조

프로세스 가상 주소 공간은 개념적으로 다음과 같이 구분

```text
높은 주소
Stack
Memory Mapping
Heap
BSS
Data
Text / Code
낮은 주소
```

실제 배치, 주소 방향, 영역 구성은 운영체제와 실행 환경에 따라 달라질 수 있음

---

#### Text, Code 영역

실행할 프로그램의 기계어 코드가 저장, 일반적으로 읽기 전용으로 설정되어 여러 프로세스가 같은 실행 파일의 코드 Page를 공유

---

#### Data 영역

초기값이 있는 전역 변수와 정적 변수가 저장

```c
int score = 100;
```

---

#### BSS 영역

초기값이 없거나 0으로 초기화되는 전역 변수와 정적 변수가 저장

```c
int score;
```

---

#### Heap 영역

동적으로 할당된 메모리가 저장된다. C에서는 `malloc()`, C++에서 `new` 등으로 할당. JavaScript 객체는 일반적으로 V8이 Heap에 저장

```ts
const player = {
  id: 1,
  name: "Kim",
};
```

사용하지 않은 JavaScript 객체는 참조 관계를 분석해 정리한다

---

#### Stack 영역

함수 호출 정보, 매개변수, 반환 주소, 지역 변수 등의 실행 문맥이 저장

```ts
function first(): void {
  second();
}

function second(): void {
  third();
}

function third(): void {
  console.log("실행");
}

first();
```

호출 Stack:

```text
third()
second()
first()
global
```

재귀 호출이 지나치면 Stack Overflow가 발생할 수 있음

```ts
function recursive(): void {
  recursive();
}

recursive();
```

#### Node.js 메모리 주의

Node.js 프로세스의 메모리가 모두 V8 Heap인 것은 아님

```text
Node.js 프로세스 메모리
 - V8 Heap
 - JavaScript Call Stack
 - Native Addon
 - Buffer
 - libuv 관련 메모리
 - 공유 라이브러리
```

`heapUsed`가 안정적이어도 `rss`가 계속 증가하면 Native Memory나 `Buffer` 사용량도 함께 확인

---

### PCB

**PCB(Process Control Block)**는 운영체제가 프로세스를 관리하기 위해 저장하는 정보 구조

운영체제마다 실제 구조와 이름은 다를 수 있음, PCB는 일반적으로 다음 정보가 들어간다

- Process ID
- 프로세스 상태
- Program Counter
- CPU Register 값
- CPU 스케줄링 정보
- 메모리 관리 정보
- 열린 파일 정보
- 입출력 상태
- 사용자와 권한 정보
- CPU 사용 시간

PCB는 커널이 관리하는 메모리 영역에 존재

---

#### Context Switching

**Context Switching**은 CPU가 실행할 프로세스나 스레드를 변경하는 과정

```text
1. 현재 실행 중인 작업의 상태 저장
2. 다음 작업 선택
3. 다음 작업의 상태 복원
4. 실행 재개
```

저장하거나 복원할 정보는 다음과 같다

- Program Counter
- Stack Pointer
- CPU Register
- 스케줄링 정보
- 메모리 관련 정보

Context Switching 중에 앱의 실제 작업이 진행되지 않으므로 오버헤드가 발생, 또한 Cache의 TLB 적중률이 떨어질 수 있음

---

#### 프로세스와 스레드 Context Switching

스레드 전환은 같은 프로세스 안의 스레드끼리 주소 공간을 공유, 일반적으로 프로세스 전환보다 비용이 작을 수 있음

실제 비용은 운영체제, CPU Cache 상태, 보안 처리 등에 따라 달라짐

---

### 멀티프로세싱

**멀티프로세싱(Multiprocessing)**은 여러 프로세스를 이용해 작업을 동시에 또는 병렬로 처리하는 방식

각 프로세스는 독립적인 메모리 공간을 가짐

```text
Process A
  독립된 Heap
  독립된 Stack

Process B
  독립된 Heap
  독립된 Stack
```

한 프로세스가 비정상 종료되어도 다른 프로세스의 메모리를 직접 손상시킬 가능성이 상대적으로 낮다

---

#### 장점

- 프로세스 간 메모리 격리
- 하나의 프로세스 장애가 전체에 미치는 영향 감소
- 여러 CPU Core 활용 가능
- 권한과 자원 분리 가능

#### 단점

- 프로세스 생성 비용
- 메모리 사용량 증가
- Context Switching 비용
- 프로세스 간 데이터 공유가 복잡
- IPC 직렬화 비용

---

#### IPC

서로 다른 프로세스는 메모리 공간이 분리되어 있어 데이터를 주고받기 위한 IPC가 필요

대표적 IPC 방식은 다음과 같다

- Pipe, Named Pipe
- Message Queue
- Shared Memory
- Socket, Signal
- 파일
- Redis, Message Broker

---

#### Node.js child_process

```ts
import { fork } from "node:child_process";

const child = fork("./dist/worker.js");

child.send({
  type: "calculate",
  value: 100,
});

child.on("message", (message) => {
  console.log("자식 프로세스 응답:", message);
});
```

`child_process.fork()`는 새로운 Node.js 프로세스를 생성, 부모와 자식 사이에 IPC Channel을 제공, 이는 별도의 프로세스

---

#### Node.js Cluster

Cluster를 사용하여 여러 Node.js 프로세스가 하나의 서버 Port를 공유

```ts
import cluster from "node:cluster";
import { availableParallelism } from "node:os";
import process from "node:process";
import { createServer } from "node:http";

if (cluster.isPrimary) {
  const workerCount = availableParallelism();

  for (let index = 0; index < workerCount; index += 1) {
    cluster.fork();
  }
} else {
  createServer((request, response) => {
    response.end(`worker pid=${process.pid}`);
  }).listen(3000);
}
```

Cluster Worker는 각각 별도의 프로세스므로 JavaScript 전역 변수와 메모리를 공유하지 않는다

```text
Worker 1의 Map ≠ Worker 2의 Map
```

여러 프로세스에서 상태를 공유하려면 Redis, 데이터베이스 같은 외부 저장소를 사용해야 한다

---

#### Kubernetes 환경

Kubernetes에서 Node.js Cluster를 하나의 Pod안에 실행하는 방법보다 여러 Pod Replica로 확장하는 방식을 사용할 수 있음

```text
Service
  Pod1: Node.js Process
  Pod2: Node.js Process
  Pod3: Node.js Process
```

Pod 단위 확장의 장점은

- 장애격리, 독립적인 재시작
- 수평 확장
- Resource Limit 적용
- Rolling Update
- Health Check

Cluster와 Kubernetes Replica 중 어떤 방식을 사용할지 배포 구조와 운영 정책에 따라 결정

---

### 스레드와 멀티 스레딩

#### 스레드

**스레드(Thread)**는 프로세스 안에서 실제 명령어를 실행하는 흐름의 단위

하나의 프로세스는 하나 이상의 스레드를 가진다. 같은 프로세스 안의 스레드는 일반적으로 다음 자원을 공유

- Code 영역
- Data 영역
- Heap 영역
- 열린 파일과 Socket
- 프로세스 자원

각 스레드는 다음 실행 정보를 독립적으로 가진다

- Program Counter
- CPU Register
- Stack

```text
Process
  공유 Code
  공유 Data
  공유 Heap
  Thread A Stack
  Thread B Stack
  Thread C Stack
```

---

#### 멀티스레딩

**멀티스레딩(Multithreading)**은 하나의 프로세스 안에서 여러 스레드가 작업을 처리하는 방식

장점은 다음과 같다

- 메모리 공유가 쉬움
- 프로세스보다 생성 비용이 작을 수 있다
- 여러 CPU Core를 이용한 병렬 처리 가능
- 프로세스 간 IPC보다 데이터 교환이 빠를 수 있다

단점은 다음과 같다

- Race Condition
- Deadlock
- 공유 데이터 손상 가능성
- 디버깅 복잡성
- 동기화 비용

---

#### Node.js는 싱글스레드

> Node.js는 기본적으로 하나의 JavaScript 실행 스레드와 하나의 Event Loop에서 JavaScript Callback을 실행, Node.js 프로세스 전체가 스레드 하나만 사용하는 것은 아니다

Node.js 내부에 다음 요소가 존재할 수 있음

- JavaScript 실행 스레드
- libuv Worker Pool
- Garbage Collection 관련 Thread
- 운영체제 비동기 I/O
- Worker Thread
- Native Library Thread

파일 시스템, 일부 DNS, Crypto 등의 작업은 libuv Worker Pool을 사용할 수 있음. 네트워크 I/O는 운영체제의 비동기 I/O 기능을 활용하는 경우가 많다

---

#### 동시성과 병렬성

| 구분   | 설명                                                    |
| ------ | ------------------------------------------------------- |
| 동시성 | 여러 작업이 번갈아 진행되어 동시에 처리되는 것처럼 보임 |
| 병렬성 | 여러 작업이 실제로 같은 시각에 여러 Core에서 실행       |

Node.js Event Loop는 JavaScript 실행 스레드에서도 비동기 I/O를 이용해 동시성을 제공, Worker Thread나 여러 프로세스를 사용하면 CPU 작업을 실제로 병렬 처리할 수 있음

---

#### Event Loop Blocking

```ts
function calculate(): number {
  let result = 0;

  for (let index = 0; index < 5_000_000_000; index += 1) {
    result += index;
  }

  return result;
}
```

NestJS Controller에서 위 함수를 직접 실행하여 계산이 끝날 때까지 Event Loop가 다른 요청의 JavaScript Callback을 실행하지 못한다

```ts
@Get("calculate")
calculate(): number {
  return calculate();
}
```

CPU 연산이 긴 작업은 다음 방법을 고려

- Worker Thread
- Child Process
- 작업 Queue
- 별도 계산 서버
- Batch Worker

---

#### Worker Thread

```ts
// prime-worker.ts

import { parentPort, workerData } from "node:worker_threads";

type WorkerInput = {
  value: number;
};

function isPrime(value: number): boolean {
  if (value < 2) {
    return false;
  }

  for (let divisor = 2; divisor * divisor <= value; divisor += 1) {
    if (value % divisor === 0) {
      return false;
    }
  }

  return true;
}

const input = workerData as WorkerInput;

parentPort?.postMessage({
  value: input.value,
  isPrime: isPrime(input.value),
});
```

---

#### Main

```ts
// main.ts

import { Worker } from "node:worker_threads";

function checkPrime(value: number): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // TypeScript 컴파일 이후 생성되는 .js 파일 실행
    const worker = new Worker(new URL("./prime-worker.js", import.meta.url), {
      workerData: {
        value,
      },
    });

    worker.once("message", (result: { value: number; isPrime: boolean }) => {
      resolve(result.isPrime);
    });

    worker.once("error", reject);

    worker.once("exit", (exitCode) => {
      if (exitCode !== 0) {
        reject(new Error(`Worker 종료 코드: ${exitCode}`));
      }
    });
  });
}

const result = await checkPrime(999_983);

console.log(result);
```

작업마다 Worker를 새로 생성하면 생성 비용이 반복되어 요청이 많은 서버에서 Worker Pool을 고려해야 한다

---

#### 프로세스와 스레드 비교

| 구분        | 프로세스         | 스레드                                        |
| ----------- | ---------------- | --------------------------------------------- |
| 메모리      | 독립된 주소 공간 | 같은 프로세스의 주소 공간 공유                |
| Stack       | 독립             | 스레드마다 독립                               |
| Heap        | 독립             | 같은 프로세스 안에서 공유 가능                |
| 생성 비용   | 상대적으로 크다  | 상대적으로 작다                               |
| 장애 격리   | 높음             | 한 스레드 오류가 프로세스에 영향을 줄 수 있다 |
| 데이터 공유 | IPC 필요         | 공유 메모리 사용 가능                         |
| 동기화 문제 | 상대적으로 적다  | Race Condition에 주의                         |

---

### 공유 자원과 임계 영역

#### 공유 자원

**공유 자원(Shared Resource)**은 여러 프로세스나 스레드 또는 비동기 작업이 함께 접근하는 자원

- 전역 변수, 파일
- 데이터베이스 Row
- Redis Key, 메모리 Cache
- Queue
- 사용자 잔액, 아이템 수량

---

#### Race Condition

**Race Condition**은 여러 실행 흐름이 공유 자원에 접근할 때 순서에 따라 결과가 달라지는 문제다

```text
초기 잔액: 1000

요청 A: 잔액 1000 조회
요청 B: 잔액 1000 조회

요청 A: 100 차감 -> 900 저장
요청 B: 200 차감 -> 800 저장

정상 결과: 700
실제 결과: 800
```

요청 A의 변경이 요청 B에 의해 사라지는 **Lost Update**가 발생했다

---

#### Node.js에서 Race Condition이 발생이유

JavaScript Callback은 한 시점에 하나씩 실행되나 `await` 사이에 다른 요청이 실행될 수 있음

```ts
let balance = 1000;

async function withdraw(amount: number): Promise<void> {
  const currentBalance = balance;

  await Promise.resolve();

  balance = currentBalance - amount;
}
```

두 요청이 동시에 `withdraw()`를 실행하여 둘 다 변경 전 잔액을 읽을 수 있음, 싱글 스레드라는 사실이 논리적인 동시성 문제까지 제거하는 건 아님

---

#### 임계 영역

**임계 영역(Critical Section)**은 공유 자원에 접근하는 코드 중 동시에 실행되어 문제가 발생할 수 있는 구간

```text
Lock 획득
공유 자원 읽기
공유 자원 변경
Lock 해제
```

임계 영역을 해결하기 위한 조건은 다음과 같음

| 조건      | 설명                                                        |
| --------- | ----------------------------------------------------------- |
| 상호 배제 | 한 번에 하나의 실행 흐름만 임계 영역 실행                   |
| 진행      | 임계 영역이 비어 있으면 진입할 작업을 결정할 수 있어야 한다 |
| 한정 대기 | 특정 작업이 무한히 기다리지 않아야 한다                     |

---

#### Mutex, Semaphore

| 구분   | Mutex                              | Semaphore                      |
| ------ | ---------------------------------- | ------------------------------ |
| 의미   | 하나의 실행 흐름만 접근하도록 잠금 | 정해진 개수만큼 동시 접근 허용 |
| 값     | 잠금, 해제                         | Counter                        |
| 예     | 잔액 변경                          | DB Connection Pool             |
| 소유권 | 일반적으로 잠근 주체가 해제        | 구현에 따라 다름               |

---

#### 데이터베이스에서 원자적 변경

다음과 같이 읽은 후 앱에서 계산, 다시 저장하면 Race Condition이 발생할 수 있음

```text
SELECT balance
앱에서 계산
UPDATE balance
```

가능하면 데이터베이스에 조건부 원자 연산으로 처리

```sql
UPDATE user_wallets
SET balance = balance - 100
WHERE user_id = 1
  AND balance >= 100;
```

변경된 Row 수가 `0`이면 잔액 부족이나 사용자 미존재로 판단할 수 있음

여러 테이블을 함께 변경해야 한다면 Transaction, Row Lock을 고려

```sql
START TRANSACTION;

SELECT balance
FROM user_wallets
WHERE user_id = 1
FOR UPDATE;

UPDATE user_wallets
SET balance = balance - 100
WHERE user_id = 1;

COMMIT;
```

---

#### 인메모리 Lock 한계

Node.js 프로세스 안에서 구현한 Mutex는 해당 프로세스 안에서 동작

```text
Pod A의 Mutex ≠ Pod B의 Mutex
```

여러 Pod나 서버 인스턴스가 같은 데이터를 변경하면 다음 방법을 고려

- 데이터베이스 Transaction
- Row Lock
- Uniuqe Constaint
- Atomic Update
- Redis Atomic Command
- 분산 Lock
- Message Queue를 이용한 직렬화

분산 Lock은 TTL, 장애 복구, Lock 소유권, Fencing Token 등을 함께 고려

---

### 교착 상태

#### 교착상태란

**교착 상태(Deadlock)**는 둘 이상의 프로세스나 스레드가 서로 보유한 자원을 기다리며 모두 작업을 진행하지 못하는 상태

```text
작업 A
- Lock 1 보유
- Lock 2 대기

작업 B
- Lock 2 보유
- Lock 1 대기
```

두 작업 모두 상대방이 Lock을 해제하기를 기다리어 영원히 진행할 수 없음

---

#### 교착 상태의 네가지 조건

교착 상태가 발생하려면 다음 네 조건이 모두 성립해야됨

| 조건      | 설명                                            |
| --------- | ----------------------------------------------- |
| 상호배제  | 하나의 자원을 동시에 하나의 작업만 사용         |
| 점유 대기 | 자원을 보유한 상태에서 다른 자원을 기다림       |
| 비선점    | 다른 작업이 보유한 자원을 강제로 빼앗을 수 없음 |
| 순환 대기 | 작업들이 원형으로 서로의 자원을 기다림          |

네 조건 중 하나 이상을 제거, 교착 상태를 예방할 수 있음

---

#### 교착 상태 해결 방법

##### 예방

교착 상태의 필요 조건 중 하나가 발생하지 않도록 설계, 예를 들어 모든 작업이 같은 순서로 Lock을 획득하도록 한다

```text
모든 작업: Lock 1 획득 -> Lock 2 획득
```

순환 대기 가능성을 줄일 수 있음

##### 회피

자원 할당 전에 시스템이 안전 상태를 유지할 수 있는지 검사, 대표적인 이론적 알고리즘은 **은행원 알고리즘(Banker's Algorithm)**이다

실무의 일반적인 웹 서버에서 은행원 알고리즘을 직접 구현하는 경우가 드물다

##### 탐지와 회복

교착 상태 발생을 허용, 탐지한 뒤 일부 작업을 종료하거나 Rollback한다

데이터베이스는 교착 상태를 탐지해 Transaction 중 하나를 중단시킬 수 있음

교착 상태 오류를 확인하고 안전한 경우 Transaction을 재시도할 수 있음

##### Timeout

Lock을 무한히 기다리지 않고 일정 시간이 지나면 실패 처리한다

```text
Lock 획득 시도
3초 안에 획득 실패
작업 취소 또는 재시도
```

Timeout은 무한 대기를 방지, 교착 상태의 근본 원인을 제거하는 것은 아님

---

#### 데이터베이스 교착 상태 예방

- Transaction을 짧게 유지
- 항상 같은 순서로 Row를 Lock 한다
- 불필요한 Lock을 줄인다
- 적절한 인덱스를 사용
- 외부 API 호출을 Transaction 안에서 오래 기다리지 않음
- Deadlock 오류 발생 시 제한적으로 재시도
- 재시도하는 작업은 멱등성을 고려

#### 교락 상태, 기아상태, 라이브락

| 구분       | 설명                                                 |
| ---------- | ---------------------------------------------------- |
| Deadlock   | 서로 자원을 기다려 모두 멈춘다                       |
| Starvation | 특정 작업이 계속 자원을 할당받지 못함                |
| Livelock   | 작업들이 상태를 계속 변경하나 실제로 진행하지 못한다 |

> 교착 상태는 둘 이상의 작업이 서로 보유한 자원을 기다리며 모두 진행하지 못하는 상태. 상호 배제, 점유 대기, 비선점, 순환 대기 네 조건이 모두 성립할 때 발생

> Lock 순서를 통일해 순환 대기를 제거, Transaction을 짧게 유지, Timeout과 Deadlock 재시도를 적용하는 방법으로 대응

---

## CPU 스케줄링 알고리즘

CPU 스케줄러는 준비 상태에 있는 프로세스나 스레드 중 어떤 작업에 CPU를 할당할지 결정, 운영체제는 실제로 실행 가능한 스레드를 CPU에 스케줄링한다

---

### 스케줄리 목표

| 목표       | 설명                                   |
| ---------- | -------------------------------------- |
| CPU 이용률 | CPU가 유휴 상태로 있는 시간 감소       |
| 처리량     | 단위 시간당 완료하는 작업 수 증가      |
| 반환 시간  | 작업 제출부터 완료까지 시간 감소       |
| 대기 시간  | 준비 Queue에 기다리는 시간 감소        |
| 응답 시간  | 요청 후 첫 응답까지 시간 감소          |
| 공정성     | 특정 작업이 CPU를 독점하지 않도록 관리 |

모든 목표를 동시에 최대로 만족시키기는 어려워 시스템의 목적에 따라 우선순위가 달라짐

---

### 주요 시간 용어

| 용어            | 설명                              |
| --------------- | --------------------------------- |
| Arrival Time    | 작업이 Ready Queue에 들어온 시간  |
| Burst Time      | CPU를 사용해야 하는 시간          |
| Completion Time | 작업이 완료된 시간                |
| Turnaround Time | 완료 시간 - 도착 시간             |
| Waiting Time    | Ready Queue에서 기다린 총시간     |
| Response Time   | 처음 CPU를 할당받기까지 걸린 시간 |

---

### 비선점형 방식

**비선정형(Non-preemptive) 스케줄링** 실행 중인 작업이 종료되거나 I/O 대기를 위해 CPU를 스스로 반항할 때까지 다른 작업이 CPU를 강제로 빼앗지 않은 방식

#### 장점

- 구현이 단순
- Context Sitching 상대적으로 적음
- 실행 흐름을 예측하기 쉽다

#### 단점

- 긴 작업이 CPU를 오래 점유할 수 있음
- 짧은 작업의 응답 시간이 길어질 수 있음
- 대하형 시스템에 적합하지 않을 수 있음

#### FCFS

**FCFS(First Come First Served)**는 Ready Queue에 먼저 도착한 작업부터 실행

```text
도착 순서: P1 -> P2 -> P3

실행 순서: P1 -> P2 -> P3
```

장점:

- 구현이 단순
- 먼저 도착한 작업을 먼저 처리

단점:

- 긴 작업이 앞에 있으면 짧은 작업들이 오래 기다린다
- Convoy Effect가 발생할 수 있음

#### Convoy Effect

실행 시간이 긴 작업 뒤에 여러 짧은 작업이 기다리는 현상

```
P1: 20초
P2: 1초
P3: 1초

P1 -> P2 -> P3
```

P2, P3는 실행 시간이 짧지만 P1 때문에 오랫동안 기다려야 한다

#### SJF

**SJF(Shortest Job First)**는 실행 시간이 가장 짧은 작업부터 실행

장점:

- 모든 작업의 실행 시간을 미리 안다고 가정하면 평균 대기 시간을 줄일 수 있음

단점:

- 실제 실행 시간을 미리 정확히 알기 어렵다
- 긴 작업이 계속 뒤로 밀리는 Stravation이 발생할 수 있음

---

#### 비선점 우선순위 스케줄링

우선순위가 높은 작업부터 실행

```text
우선순위 1: 가장 높음
우선순위 5: 가장 낮음
```

이를 완화하기 위해 오래 기다린 작업의 우선순위를 점차 높이는 **Aging**을 사용할 수 있음

---

### 선점형 방식

**선점형(Preemptive) 스케줄링**은 운영체제가 실행 중인 작업에서 CPU를 강제로 회수, 다음 작업에 할당할 수 있는 방식

#### 장점

- 응답성이 높음
- 특정 프로세스의 CPU 독점을 방지할 수 있음
- 대화형 시스템에 적합

#### 단점

- Context Switching이 증가할 수 있음
- 공유 자원 동기화가 복잡해진다
- 스케줄링 오버헤드가 발생한다

---

#### Round Robin

**Round Robin**은 각 작업에 동일한 시간 할당량인 Time Quantum을 주고 순서대로 실행

```text
Time Quantum = 4ms

P1 -> P2 -> P3 -> P1 -> P2 ...
```

할당 시간 안에 작업이 끝나지 않으면 Ready Queue 뒤로 이동

Time Quantum이 너무 크면 FCFS와 비슷

```text
Quantum이 너무 크다 -> 응답성이 낮아짐 -> FCFS와 유사
```

Time Quantum이 너무 작으면 Context Switching이 지나치게 증가

```text
Quantum이 너무 작음 -> Context Switching 증가 -> CPU 오버헤드 증가
```

---

#### SRTF

**SRTF(Shortest Remaining Time First)**는 남은 실행 시간이 가장 짧은 작업을 우선 실행하는 방식

SJF의 선점형 형태

현재 작업보다 남은 시간이 짧은 작업이 들어오면 현재 작업을 중단하고 새로운 작업을 실행할 수 있음

단점:

- 실행 시간을 미리 추정해야 한다
- 긴 작업에 Starvation이 발생할 수 있음

---

#### 선점 우선순위 스케줄링

더 높은 우선순외 작업이 준비 상태가 되면 현재 작업을 중단하고 높은 우선순위 작업을 실행, 실시간성과 긴급 작업 처리에 유리하나 낮은 웃헌순위 작업에 Stravation이 발생할 수 있음

#### Multilevel Queue

작업의 종류에 따라 Ready Queue를 여러 개로 분리

```text
높은 우선순위
  시스템 프로세스 Queue
  대화형 프로세스 Queue
  Batch 프로세스 Queue
낮은 우선순위
```

각 Queue 에 서로 다른 스케줄링 알고리즘을 적용

---

#### Multilevel Feddback Queue

**MLFQ(Multilevel Feddback Queue)**는 여러 우선순위 Queue를 사용, 작업의 실행 특성에 따라 Queue 사이를 이동시킴

```text
짧고 자주 대기하는 작업 -> 높은 우선순위 유지

CPU를 오래 사용하는 작업 -> 낮은 우선순위로 이동

오래 기다린 작업 -> 우선순위 상승 가능
```

---

### Node.js Event Loop와 CPU 스케줄러 차이

Node.js Event Loop 운영체제 CPU 스케줄러는 같은 개념이 아님

| 구분      | Event Loop                     | CPU 스케줄러                 |
| --------- | ------------------------------ | ---------------------------- |
| 관리 주체 | Node.js, libuv                 | 운영체제 커널                |
| 관리 대상 | Callback, Timer, I/O 완료 작업 | 실행 가능한 프로세스, 스레드 |
| 실행 범위 | Node.js 프로세스 내부          | 시스템 전체                  |
| 목적      | 비동기 작업 실행 순서 관리     | CPU 자원 할당                |

```text
운영체제 CPU 스케줄러
↓
Node.js 실행 스레드에 CPU 할당
↓
Node.js Event Loop
↓
실행할 JavaScript Callback 선택
```

Event Loop가 효율적으로 동작해도 CPU를 오래 사용하는 JavaScript Callback이 실행되면 다른 요청이 지연될 수 있음

---

## 면접 답변

### 운영체제 역할은?

> 운영체제는 CPU, 메모리, 파일, 입출력 장치 같은 하드웨어 자원을 관리, 앱이 이를 안전하게 사용할 수 있도록 시스템콜과 같은 인터페이스 지원

### 사용자 모드와 커널 개념 차이

> 사용자 모드는 앱이 제한된 권한으로 실행되는 모드, 커널 모드는 운영체제가 하드웨어와 전체 메모리에 접근할 수 있는 높은 권한의 모드

### 가상 메모리란

> 가상 메모리는 프로세스마다 독립적인 가상 주소 공간을 제공하고 필요한 Page만 실제 RAM에 적재하는 메모리 관리 기술이다. 프로세스 격리와 효율적인 메모리 사용이라는 장점이 있으나 Page Fault가 지나치게 많으면 성능이 저하될 수 있음

### 페이지 폴트

> 프로세스가 접근하려는 Page가 현재 물리 메모리에 없을 때 발생하는 예외이다. 운영체제는 필요한 Page를 디스크에서 RAM으로 가져오고 페이지 테이블을 갱신한 뒤 명령어를 다시 실행한다

### 프로세스 스레드 차이

> 프로세스는 접근하려는 Page가 현재 물리 메모리에 없을 때 발생하는 예외이다. 스레드는 프로세스 안의 실행 흐름으로 같은 프로세스의 Code, Data, Heap 등을 공유, Stack과 Register, Program Counter는 독립적으로 가진다.

### 멀티프로세스 멀티스레드 차이

> 멀티프로세스는 독립된 메모리 공간을 사용해 장애 격리가 좋지만 데이터 공유에 IPC가 필요, 메모리 비율이 크다. 멀티스레드는 같은 프로세스의 메모리를 공유해 데이터 교환이 빠를 수 있으나 동기화 문제에 주의해야 한다.

### Node.js는 싱글스래드

> JavaScript Callback은 기본적으로 하나의 실행 스레드와 Event Loop에서 실행된다. 하지만 Node.js 프로세스 전체에 libuv Worker Pool, Garbage Collection Thread, 운영체제 비동기 I/O, Worker Thread등이 존재할 수있어 Node.js 전체가 스레드 하나만 사용한다고 표현하면 부정확하다.

---

## 정리

```text
운영체제 -> CPU, 메모리, 파일, 장치 관리

프로세스 -> 독립된 메모리 공간을 가진 실행 중인 프로그램

스레드 -> 프로세스 안에서 실제 코드를 실행하는 흐름

가상 메모리 -> 프로세스마다 독립적인 가상 주소 공간을 제공

Node.js -> JavaScript는 기본적으로 하나의 Event Loop Thread에 실행, 프로세스 전체가 하나의 Thread만 사용하는 건 아님
```
