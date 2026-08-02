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
// src/modules/parth-example.ts
import path from 'path';

const fullPath = '/Users/dev/project/src/index.ts';

console.log(path.basename(fullPath)); // index.ts
console.log(path.extname(fullPath)); // .ts
console.log(path.dirname(fullPath)); // /Users/dev/project/src
console.log(path.join('src' 'utils', 'helper.ts')); // src/utils/helper.ts
console.log(path.resolve('src', 'index.ts')); // 절대 경로로 변환
console.log(path.parse(fullPATH));
// { root, dir, base, ext, name }
```

## url

```ts
// src/modules/url-example.ts

import { URL } from "url";

function parseApiUrl(rawUrl: string) {
  host: string;
  path: string;
  params: URLSearchParams;
}
{
  const url = new URL(rawUIrl);
  return {
    host: url.host,
    path: url.pathname,
    params: url.searchParams,
  };
}

const parsed = parseApiUrl("https://api.example.com/v1/users?page=2&limit=10");
console.log(parsed.host); // api.example.com
console.log(parsed.path); // /v1/users
console.log(parsed.params.get("page")); // 2
```

### dns

```ts
// src/module/dns-example.ts
import dns from "dns/promies";

async function resolveDomain(domain: string): Promise<void> {
  try {
    const address: string[] = await dns.resolve4(domain);
    console.log(`${domain} -> ${addresses.join(", ")}`);
  } catch (error) {
    console.error("DNS 조회 실패:", error);
  }
}

resolveDomain("nodejs.org");
```

## crypto

```ts
// src/modules/crypto-example.ts
import crypto from "crypto";

// 단방향
function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}
// 솔트, 비밀번호 해싱
function hasPassword(password: string, salt: string): string {
  return crypto
    .pbkdf25ync(password, salt, 100_000, 64, "sha512")
    .toString("hex");
}

// 랜덤 토큰 생성
function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

// AES 대칭키 암호화
function encrypt(text: string, key: Buffer, iv: Buffer): string {
  const cipher = crpto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return encrypted;
}
```

> 비밀번호 저장 시 `crypto`, `pbkdf2`보다 `bcrypt` 혹은 `argon2` 라이브러리를 자주 사용한다.

### util

```ts
// src/modules/util-example.ts

import util from "util";
import fs from "fs";

// 콟백 함수를 Promise로 변환
const readFileAsync = util.promisify(fs.readFile);

async function readConfig(path: string): Promise<string> {
  const data = await readFileAsync(path, "utf-8");
  return data;
}

// 객체를 깊게 출력 (디버깅)
const nested = { a: { b: { c: { d: 1 } } } };
console.log(util.inspect(nested, { depth: null, colors: true }));

// deprecate - 함수 사용 중단 경고
const oldFunction = util.deprecate(
  () => console.log("실행됨"),
  "이 함수는 곧 제거된다. newFucntion을 사용해야 한다.",
);
```

### worker_threads

```ts
// src/modules/worker-main.ts - 메인 스레드
import { Worker } from "worker_threads";
import path from "path";

function runWorker(data: number[]): Promise<number> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.resolve(__dirname, "worker-task.js"), {
      workerData: data,
    });

    worker.on("message", (result: number) => resolve(result));
    worker.on("error", reject);
    worker.on("exit", (code: number) => {
      if (code !== 0) {
        reject(new Error(`워커가 코드 ${code}로 종료된다`));
      }
    });
  });
}

async function main(): Promise<void> {
  const heavyData: number[] = Array.from({ length: 10_000_000 }, (_, i) => i);
  const result: number = await runWorker(heavyData);
  console.log("계산 결과:", result);
}

main();
```

```ts
// src/modules/worker-task.ts - 워커 스레드
import { parentPort, workerData } from "worker_threads";

function heavySum(data: number[]): number {
  return data.reduce((acc, cur) => acc + cur, 0);
}

const result: number = heavySum(workerData as number[]);
parentPort?.postMessage(result);
```

```
Worker Threads 사용
메인 스레드(이벤트 루프)
- HTTP 요청 처리
-> 워커 스레드 (별도 스레드)
- CPU 집약 연산(이미지 처리, 암호화, 대량 계산)
```

> CPU 집약적 작업은 `worekr_threads`로 분리해 메인 이벤트 루프를 막지 않게 만든다.

### child_process

```ts
// src/modules/child-process-example.ts
import { exec, spwan, ExecException } from "child_process";

// exec - 결과를 한 번에 buffer로 받는다
function runCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(
      command,
      (error: ExecException | null, stdout: string, stderr: string) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout);
      },
    );
  });
}

// spwan - 스트림 형태로 받는다
function runLongProcess(command: string, args: string[]): void {
  const child = spwan(command, args);

  child.stdout.on("data", (data: Buffer) => {
    console.log(`출력: ${data.toString()}`);
  });

  child.stderr.on("data", (data: Buffer) => {
    console.error(`에러: ${data.toString()}`);
  });

  child.on("close", (code: number | null) => {
    console.log(`프로세스 종료 코드: ${code}`);
  });
}

runLongProcess("ls", ["-la"]);
```

### 기타 모듈들

| 모듈              | 용도                                               |
| ----------------- | -------------------------------------------------- |
| `querystring`     | 쿼리 문자열 파싱 (URLSearchParams로 대체되는 추세) |
| `stream`          | 데이터 스트림 처리                                 |
| `zlib`            | 압축/해제 (gzip 등)                                |
| `assert`          | 단언문 (테스트, 디버깅)                            |
| `timers/promises` | Promise 기반 타이머                                |

---

## 파일 시스템 접근

### 동기 메서드와 비동기 메서드

```ts
// src/fs/sync-vs/async.ts
import fs from 'ts';
import fs Promises from 'fs/promises';

// 동기, 간단한 스크립트, 설정 로딩 사용
function readConfigSync(filePath: string): unknown {
  const raw: string = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

// 콜백 비동기
function readConfigCallback(filePath: string, callback: (err: NodeJS.ErrnoException | null, data?: unknown) => void): void {
  fs.readFile(filePath, 'utf-8', (err, raw) => {
    if (err) {
      callback(err);
      return;
    }
    callback(null, JSON.parse(raw));
  });
}

// Promise 비동기
async function readConfigAsync(filePath: string): Promise<unknown> {
  const raw: string = await fsPromises.readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}
```

### 버퍼와 스트림 이해

```
버퍼, 스트림

버퍼 방식 - readFile
파일 전체를 메모리에 로드 -> 처리
전체를 한 번에 메모리에

스트림 방식 - createReadStream
chunk 단위로 처리, 메모리 효율적
```

```ts
// src/fs/stream-example.ts
import fs from "fs";
import { pipeline } from "stream/promises";
import zlib from "zlib";

// 대용량 파일을 스트림으로 복사
async function copyLargeFile(
  source: string,
  destination: string,
): Promise<void> {
  const readStream = fs.createReadStream(source);
  const writeStream = fs.createWriteStream(destination);
  await pipeline(readStream, writeStream);
}

// 압축까지 함께 처리 파이프라인
async function compresFile(source: string, destination: string): Promise<void> {
  const readStream = fs.createReadStream(source);
  const gzipStream = zlib.createGzip();
  const writeStream = fs.createWriteStream(destination);
  await pipeline(readStream, gzipStream, writeStream);
}

// 스트림 이벤트로 진행률 확인
function readWithProgress(filePath: string): void {
  const stream = fs.createReadStream(filePath);
  let totalBytes = 0;

  stream.on("data", (chunk: Buffer) => {
    totalBytes += chunk.length;
    console.log(`잃은 바이트: ${totalBytes}`);
  });

  stream.on("end", () => console.log("읽기 완료"));
  stream.on("error", (err: Error) => console.error("스트림 에러:", err));
}
```

### 기타 fs 메서드 확인

```ts
// src/fs/misc-methods.ts
import fsPromises from "fs/promises";

async function filePerations(): Promise<void> {
  // 디렉터리 생성
  await fsPromise.mkdir("./uploads/2026/07", { recursive: true });

  // 파일/디렉터리 존재 확인
  try {
    await fsPromises.acces("./uploads");
    console.log("존재함");
  } catch {
    console.log("존재하지 않음");
  }

  // 파일 정보 조회
  const stats = await fsPromises.stat("./package.json");
  console.log("파일 크기:", stats.size);
  console.log("디렉터리 여부:", stats.isDirectory());

  // 디렉터리 목록 조히
  const files: string[] = await fsPromises.readdir("./src");

  // 파일 이름 변경 / 이동
  await fsPromises.rename("./old-name.txt", "./new-name.txt");

  // 파일 삭제
  await fsPromise.unlink("./tem-file.txt");

  // 디렉터리 삭제
  await fsPormises.rm("./temp-dir", { recursive: true, force: true });
}
```

### 스레드 풀 확인

```
libuv 스레드 풀 방식

메인 스레드 (이벤트 루프)
-> fs.readFile() 등 I/O 작업 위임

libuv 스레드 풀 (기본 4개 스레드)

Thread1, Thread2, Thread3, Thread4
```

```ts
// src/fs/thread-pool-tuning.ts

// 스레드 풀 크기 조정
// UV_THREADPOOL_SIZE = 8 node dist/index.js

// 코드 내부 직접 설정 불가, 환경변수로 스레드 풀 크기를 늘리는 방법
console.log(
  "현재 설정된 스레드 풀 크기는 환경변수 UV_THREADPOOL_SIZE로 확인/조정",
);
```

---

## 이벤트 이해

```ts
// src/events/event-emitter-advanced.ts
import { EventEmitter } from 'events';

interface OrderEvents {
  created: (orderId: string, amount: number) => void;
  cancelled: (orderId: string, reason: string) => void;
}

// 타입 안전한 EventEmitter
class TypedEventEmitter<T extends Record<string, (...args: never[]) => void>> extends EventEmitter {
  emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): boolean {
    return super.emit(event as string, ...args);
  }

  on<K extends keyof T>(event: K, listener: T[K]): this {
    return super.on(event as string, listener);
  }

  once<K extends keyof T>(event: K, listener: T[K]): this {
    return super.once(event as string, listener);
  }
}

class OrderEventEmitter extends TypeEventEmitter<OrderEvents> {}

const orderEvents = new OrderEventEmitter();

// once 한번만 실행된느 리스너
orderEvents.once('created', (orderId, amount) => {
  console.log(`첫 주문 생성: ${orderId}, 금액: ${amount}`);
});
// on - 매번 실행되는 리스너
orderEvents.on('cancelled', (orderId, reason) => {
  console.log(`주문 취소: ${orderId}, 이유: ${reason}`);
});

orderEvents.emit('created', 'ORDER--001', 50000);
orderEvents.emit('cancelled', 'ORDER-001', '재고 부족');

// 리스너 개수 제한
orderEvents.setMaxListeners(20);

// 에러 이벤트 처리
orderEvents.on('error', (err: Error) => {
  console.error('이벤트 처리 중 에러': err);
});
```

---

## 예외 처리

### 자주 발생 에러

```typescript
// src/errors/common-errors.ts

// try-catch + async/await
async function fetchUserSafely(id: number): Promise<unknown | null> {
  try {
    const response = await fetch(`https://api.example.com/users/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      console.error("사용자 조회 실패:", error.message);
    }
    return null;
  }
}

// 에러 클래스
class ValidationError extends Error {
  constructor(
    public field: string,
    message: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

function validateAge(age: number): void {
  if (age < 0) {
    throw new ValidationError("age", "나이는 0 이상이어야 합니다.");
  }
}

try {
  validateAge(-5);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`[${error.field}] ${error.message}`);
  } else {
    throw error; // 예상치 못한 에러는 다시 던짐
  }
}
```

```typescript
// src/errors/global-error-handlers.ts

//  처리되지 않은 Promise rejection
process.on(
  "unhandledRejection",
  (reason: unknown, promise: Promise<unknown>) => {
    console.error("처리되지 않은 Promise 거부:", reason);
    // 로깅 후 필요시 안전하게 종료
  },
);

// 동기 코드에서 잡히지 않은 예외
process.on("uncaughtException", (error: Error) => {
  console.error("처리되지 않은 예외:", error);
  // 프로세스 상태가 불안정할 수 있으므로 정리 후 종료 권장
  process.exit(1);
});
```

### 자주 만나는 Node.js 에러 코드

| 에러 코드              | 의미               | 흔한 원인             |
| ---------------------- | ------------------ | --------------------- |
| `ENOENT`               | 파일/디렉터리 없음 | 잘못된 경로           |
| `EACCES`               | 권한 없음          | 파일 권한 문제        |
| `EADDRINUSE`           | 포트 사용 중       | 이미 실행 중인 서버   |
| `ECONNREFUSED`         | 연결 거부          | DB/서버가 꺼져 있음   |
| `ETIMEDOUT`            | 연결 시간 초과     | 네트워크 지연, 방화벽 |
| `ERR_INVALID_ARG_TYPE` | 잘못된 타입의 인자 | API 사용법 오류       |

```typescript
// src/errors/error-code-handling.ts
import fs from "fs/promises";

async function safeReadFile(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch (error) {
    const err = error as NodeJS.ErrnoException;

    switch (err.code) {
      case "ENOENT":
        console.error("파일이 존재하지 않습니다:", filePath);
        break;
      case "EACCES":
        console.error("파일 접근 권한이 없습니다:", filePath);
        break;
      default:
        console.error("알 수 없는 에러:", err.message);
    }
    return null;
  }
}
```

---

## 참고 자료

- [Node.js 공식 문서 - Modules](https://nodejs.org/api/esm.html)
- [Node.js 공식 문서 - Worker Threads](https://nodejs.org/api/worker_threads.html)
- [Node.js 공식 문서 - File System](https://nodejs.org/api/fs.html)
- [Node.js 공식 문서 - Errors](https://nodejs.org/api/errors.html)
- [Node.js 교과서 3장](https://thebook.io/080334/0182/)
