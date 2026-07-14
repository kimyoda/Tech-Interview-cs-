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

---

## 참고 자료

- [Node.js 공식 문서 - Modules](https://nodejs.org/api/esm.html)
- [Node.js 공식 문서 - Worker Threads](https://nodejs.org/api/worker_threads.html)
- [Node.js 공식 문서 - File System](https://nodejs.org/api/fs.html)
- [Node.js 공식 문서 - Errors](https://nodejs.org/api/errors.html)
- [Node.js 교과서 3장](https://thebook.io/080334/0182/)
