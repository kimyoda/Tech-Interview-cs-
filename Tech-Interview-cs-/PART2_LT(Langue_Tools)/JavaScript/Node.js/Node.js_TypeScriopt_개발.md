# TypeScript로 Node.js 개발하기

---

## TypeSciprt를 쓰는 이유

JavaScript 한계

```js
// JavaScript — 에러를 런타임에 발견
function calculateDiscount(price, rate) {
  return price * rate; // rate가 undefined면?
}

calculateDiscount(10000);
// → NaN ... 화면엔 아무것도 안 보임
// 배포 후에야 발견. 고객이 먼저 경험함
```

```ts
// TypeScript — 에러를 코드 작성 시점에 발견
function calculateDiscount(price: number, rate: number): number {
  return price * rate;
}

calculateDiscount(10000);
// TS 컴파일 에러: Expected 2 arguments, but got 1.
// → IDE에서 바로 빨간 줄로 표시됨. 배포 전에 차단!
```

### 설계와 타입 안전성

TypeScript는 자바스크립트의 도적 특성으로 인해 발생할 수 있는 타입 고나련 오류를 코드 작성 단계 및 컴파일 단계에서 잡아낼 수 있다.
함수와 매개변수와 반환 타입을 명확히 지정하면, 잘못된 타입을 전달하는 경우 컴파일러가 즉시 오류를 알려준다
타입 체크는 라이브러리 사용 시에도 안전성을 높여주고, API 호출 방식이나 객체 구조를 문서 없이도 파악을 용이하게 해준다.

### 협업과 개발 생산성

TypeScript의 타입 시스템은 코드가 곧 문서가 되어, 함수의 입력과 출력이 명확하게 드러난다.
IDE의 자동 완성 기능은 타입 정보에 기반하여 정확한 속성과 메서드를 제안하여 생산성을 높인다. 타입 정보는 리팩토링 시 잠재적 오류를 알려 주며, 큰 규모의 코드베이스에도 안전하게 구조를 변경할 수 있다.

---

## TypeScript가 주는 이점

런타임 에러 -> 컴파일 타임 에러로 이동(배포 후 발견 -> 코딩 중 발견)
자동완성 향상 -> IDE가 속성/메서드를 정확히 제안(`.`을 찍으면 사용 가능한 것들이 나온다)
리팩토링 안전성 -> 변경 사항의 영향 범위를 즉시 파악 (함수 파라미터 타입이 바꾸면 영향받는 곳이 전부 드러난다)
문서 역할 -> 타입 자체가 코드의 명세서
팀 협업 -> 해당 함수에 대한 인식이 빨라진다.

---

## 17.1 타입스크립트 기본 문법

### 환경 세팅

```bash
# 프로젝트 초기화
mkdir my-ts-api && cd my-ts-api
npm init -y

# TypeScript 관련 패키지 설치
npm install --save-dev typescript ts-node ts-node-dev @types/node

# tsconfig.json 생성
npx tsc --init

# 개발 실행 (파일 변경 시 자동 재시작)
npx ts-node-dev --respawn --transpile-only src/index.ts

# 빌드 (배포용 JS로 컴파일)
npx tsc
```

```
실행 흐름
────────────────────────────────────────────
개발 중: .ts 파일 → ts-node-dev → 메모리에서 직접 실행
배포 시: .ts 파일 → tsc → .js 파일 → node로 실행
```

---

## 타입 선언 기초

### 기본 타입

```ts
// ────────────────────────────────────────
// 원시 타입 (Primitive Types)
// ────────────────────────────────────────
const username: string = "Kim";
const age: number = 25;
const isAdmin: boolean = true;
const nothing: null = null;
const notDefined: undefined = undefined;

// TypeScript는 대부분 타입을 추론할 수 있다
const city = "Seoul"; // string으로 자동 추출
const score = 100; // number로 자동 추론
const active = true; // boolean으로 자동 추론

// ────────────────────────────────────────
// 배열 (Array)
// ────────────────────────────────────────
const scores: number[] = [100, 90, 85, 70];
const names: string[] = ["Kim", "Lee", "Park"];
const flags: boolean[] = [true, false, true];

// 제네릭 방식도 동일
const scores2: Array<number> = [100, 90, 85];

// ────────────────────────────────────────
// 튜플 (Tuple) — 길이와 각 위치 타입이 고정
// ────────────────────────────────────────
const point: [number, number] = [37.655, 126.978]; // 위도, 경도
const entry: [string, number] = ["score", 100]; // [키, 값]

// ────────────────────────────────────────
// 객체
// ────────────────────────────────────────
// 인라인 타입 (간단한 경우)
const user: { name: string; age: number; email?: string } = {
  name: "Kim",
  age: 25,
  // email은 선택적이라 없어도 됨
};
```

### 함수 타입

```ts
// ────────────────────────────────────────
// 기본 함수 타입 선언
// ────────────────────────────────────────

// 일반 함수
function add(a: number, b: number): number {
  return a + b;
}

// 화살표 함수
const multiply = (a: number, b: number): number => a * b;

// 반환 타입은 대부분 추론 가능 - 간단한 경우 생략 가능
const subtract = (a: number, b: number) => a - b; // number로 추론

// ────────────────────────────────────────
// 선택적 매개변수 (?)
// ────────────────────────────────────────
```
