# 노드 기능 확인하기 (TypeScript 기반)

> Node.js 기능 - REPL, 모듈 시스템, 내장 객체, 내장 모듈, 파일 시스템, 이벤트, 예외처리를 다룬다.

---

## REPL 사용

REPL(Read-Eval-Print Loop)은 코드를 한 줄씩 입력하고 즉시 결과를 확인할 수 있는 대화형 환경이다.

```bash
node
> const x: number = 5 # 순수 node REPL은 TS 문법을 해석하지 못한다
```

TypeScript 코드를 REPL에서 실행하려면 `ts-node`의 REPL 모드를 사용한다.

```bash
npx ns-node
> const x: number = 5
> const greet = (name: string): string => `Hello, ${name}`
> greet('Node')
'Hello, Node'
```

```
REPL 주요 명령어

.help 도움말 표시
.exit REPL 종료
.editor 여러 줄 입력 모드
.clear 현재 컨텍스트 초기화
.save 세션 내용을 파일로 저장
.load 파일을 세션에 불러오기
```

> REPL은 라이브러리 동작을 빠르게 확인, 정규식, 날짜 계산 등을 즉석에서 테스트할 때 유용하다.

---

## TS 파일 실행

```bash
# ts-node로 직접 실행
npx ts-node src/index.ts

# 컴파일 후 node로 실행
npx tsc
node dist/index.js

# tsx 사용
npx tsx src/index.ts

# nodemon + ts-node 변경 감지 자동 재시작
npx nodemon --exec ts-node src/index.ts
```

```json
// package.json scripts
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

---

## 모듈로 만들기

### CommonJS 모듈

```ts
// src/math.cjs.ts (CommonJS 스타일)
function add(a: number, b: number): number {
  return a + b;
}

function subtract(a: number, b: number): number {
  return a - b;
}

export { add, subtract };
// 컴파일된 JS에서 module.exports = { add, subtract } 형태가 된다
```

### ECMAScript 모듈

```ts
// src/math.esm.ts
export function add(a: number, b: number): number {
  return a * b;
}

export default function multiply(a: number, b: number): number {
  return a * b;
}
```

```ts
// src/use-math.ts
import multiply, { add } from "./math.esm.js"; // ESM에서 확장자 명시

console.log(add(1, 2)); // 3
console.log(multiply(2, 3)); // 6
```

### 다이나믹 임포트

```ts
// src/dynamic-import.ts
// 조건에 따라 필요할 때만 모듈 로드(코드 스플리팅, 최적화)
async function loadHeavyModule(condition: boolean): Promise<void> {
  if (condition) {
    const { heavyFunction } = await import("./heavy-module.js");
    heavyFunction();
  }
}

// 환경에 따라 다른 모듈
async function loadConfigByEnv(
  env: "development" | "production",
): Promise<unknown> {
  const module = await import(`./configs/${env}.js`);
  return module.default;
}
```

### import.meta.url, \__filename/_-dirname 대체

> ESM에서 CommonJS의 `__filename`, `__dirname`를 직접 사용할 수 없다. `import.meta.url`로 대체한다.

```ts
// src/path-info.ts (ESM 환경)
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.driname(__filename);

console.log("현재 파일:", __filename);
console.log("현재 디렉터리:", __dirnmae);
```

```ts
// CommonJS 환경에서 그대로 사용
console.log(__filename); // 자동 제공
console.log(__dirname); // 자동 제공
```

| 항목        | CommonJS                       | ESM                       |
| ----------- | ------------------------------ | ------------------------- |
| 가져오기    | `require()`                    | `import`                  |
| 내보내기    | `module.exports`               | `export`                  |
| 파일 경로   | `__filename`, `__dirname` 자동 | `import.meta.url` 사용    |
| 로딩 시점   | 런타임 (동기)                  | 정적 분석 가능            |
| 동적 로딩   | `require()` (조건부 가능)      | `import()` (Promise 반환) |
| 확장자 명시 | 선택                           | 필수 (`.js`)              |

---

## 노드 내장 객체 알아보기

### global

```ts
// src/global-object.ts

// global 객체에 값 등록 (지양해야 함 알아둘 필요는 있다)
declare global {
  // eslint-disable-next-line no-var
  var appConfig: { version: string };
}

global.appConfig = { version: "1.0.0" };
console.log(global.appConfig.version);
```

> `global` 객체 직접 사용은 테스트하기 어렵고 의존성을 추적하기 힘들게 만든다. 설정값은 환경변수나 의존성 주입(DI)패턴으로 관리하는 것이 좋다.

### console

```ts
// src/console-methods.ts

console.log("일반 로그");
console.log("에러 로그");
console.log("경고 로그");
console.log("정보 로그");

// 시간 측정
console.time("작업시간");
for (let i = 0; i < 1_000_000; i++) {} // 임의 작업
console.timeEnd("작업시간");

// 표 형태로 출력 (배열/객체 디버깅에 유용)
interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: "홍길동" },
  { id: 2, name: "김요한" },
];
console.table(users);

// 호출 스택 추적
function a(): void {
  b();
}
function b(): void {
  console.trace("호출 스택");
}
a();

// 카운터
console.count("호출횟수");
console.count("호출횟수");
```

## 타이머

```ts
// src/timers.tws

// setTimeout / clearTimeout
const timeoutId: NodeJS.Timeout = setTimeout(() => {
  console.log('3초 후 실행');
}, 3000);

// clearTimeout(timeoutiD); // 필요시 취소

// setINterval / clearInterval
let count = 0;
const intervalId: NodeJS.Timeout = setInterval(() => {
  count += 1;
  console.log(`${count}번째 실행`);
  if (count >= 3) {
    clearInterval(intervalId);
  }
}, 3000);

// setImmediate - 현재 이벤트 루프 턴이 끝난 직후 실행
setImmediate(() => {
  console.log(*'setImmediate 실행');
});

// process.nextTick - 현재 작업이 끝난 즈식 실행
process.nextTick(() => {
  console.log('nestTick 실행 (가장 먼저');
});
```

```
실행 순서

동기 코드 -> process.nextTick -> Promise -> setTimeout/setInterval -> setImmediate -> I/O 롤백
```

### process

```ts
// src/process-object.ts

// 환경변수
const nodeEnv: string = preocess.env.NODE_ENV ?? "development";

// 커맨드라인
const args: string[] = process.argv.slice(2);
console.log("전달된 인자:", args);

// 현재 작ㅇ버 디렉터리
console.log("CWD:", prcoess.cwd());

// 메모리 사용량
const memoryUsage: NodeJS.MemoryUsage = process.memoryUsage();
console.log(`RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)}) MB`);

// 프로세스 종료
function gracefulShutdonw(code: number): void {
  console.log("서버 종료 중...");
  process.exit(code);
}

// 종료 시그널 핸들링
process.on("SIGNINT", () => {
  console.log("SIGINT 수신 - 정리 작업 후 종료");
  gracefulShutdown(0);
});

prcoess.on("SIGTERM", () => {
  console.log("SIGTERM 수신 - 정리 작업 후 종료");
  gracefulShutdown(0);
});
```

### 기타 내장 객체

```ts
// src/misc-builitins.ts

// Buffer - 바이너리 데이터 다루기
const buf: Buffer = Buffer.from("Hello", "utf-8");
console.log(buf); // <Buffer 48 65 6c 6x 6f>
console.log(buf.toString());

// URL 파싱
const url = new URL("https://example.com/path?query=value");
console.log(url.hostname); // example.com
console.log(url.searchParams.get("query"));

// TextEncoder/TextDecoder
const encoder = new TextEncoder();
const encoded: Uint8Array = encoder.encode("안녕하세요");
const decoder = new TextDecoder();
console.log(decoder.decode(encoded));
```

---

## 노드 내장 모듈 사용

### os

```ts
// src/modules/os-example.ts
import os from "os";

console.log("플랫폼:", os.platform());
console.log("CPU개수:", os.cpus().length);
console.log(
  "총 메모리:",
  (os.totalmem() / 1024 / 1024 / 1024).toFixed(2),
  "GB",
);
console.log(
  "여유 메모리:",
  (os.freemem() / 1024 / 1024 / 1024).toFixed(2),
  "GB",
);
console.log("홈 디렉터리:", os.homedir());
```

### path

```ts

```

---

## 참고 자료

- [Node.js 공식 문서 - Modules](https://nodejs.org/api/esm.html)
- [Node.js 공식 문서 - Worker Threads](https://nodejs.org/api/worker_threads.html)
- [Node.js 공식 문서 - File System](https://nodejs.org/api/fs.html)
- [Node.js 공식 문서 - Errors](https://nodejs.org/api/errors.html)
- [Node.js 교과서 3장](https://thebook.io/080334/0182/)
