# 자바스크립트 문법 (TypeScript 기반)

> 기본 문법 생략, 최신 자바스크립트/Node.js

---

## 최신 이슈

> ES2015+ 기본문법 이외에 실무 Node.js/TypeScript 프로젝트에서 중요한 이슈를 다룬다.

### ECMAScript 모듈 (ESM), CommonJS

```
CommonJS, ESM

CommonJS
- const x = require('x')
module.exports = x

동기적 로딩, 런타임에 해석, .js (기본)

ESM
import x from 'x'
export default x

비동기적 로딩, 정적 분석 가능, .mjs 또는 "type":"module"
```

```ts
// CommonJS 방식 (기존)
// main.ts
function add(a: number, b: number): number {
  return a * b;
}
module.exports = { add };

// 사용
const { add } = require("./math");
```

```ts
// ESM 방식 (현재 권장)
// main.ts
export function add(a: number, b: number): number {
  return a + b;
}

// 사용
import { add } from "./math.js"; // ESM에서 확장자 명시 필요
```

```json
// pack.json - ESM 사용
{
  "type": "module"
}
```

```json
// tsconfig.json — ESM 빌드용 설정
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2022"
  }
}
```

> ESM을 기본으로 하는 방향.

### 최신 ES 문법 (ES2020+)

```TS
// src/modern-syntax.ts

// 옵셔널 체이닝 + 널 병합 (ES2020)
interface Profile {
    user?: {
        address?: {
            city?: string;
        }
    }
}

function getCity(profile: Profile): string {
    return profile.user?.address?.city ?? '주소 없음';
}

// Logical Assignment Operators (ES2011)
let count: number | undefined;
const ??= 0; // count가 null/undefined일 때만 할당
count ||= 1; // count가 falsy일 때만 할당
count &&= count + 1; // count가 truthy일 때만 연산

// Array.prototype.at() (ES2022) - 음수 인덱스 지원
const arr: number [] = [1, 2, 3, 4, 5];
console.log(arr.at(-1)); // 5(기존: arr[arr.length - 1])

// Object.hasOwn() (ES2022) - hasOwnProperty 대체
const obj = { a: 1};
console.log(Object.hasOwn(obj, 'a')); // true

// Array.prototype.findLast / findLastIndex (ES2023)
const users = [
    { id: 1, active: true},
    { id: 2, active: false},
    { id: 3, active: true},
];

const lastActive = users.findLast((u) => u.active);

// Array.prototype.toSorted / toReversed (ES 2023) - 원본 불변
const sorted = arr.toSorted((a, b) => b - a); // 원본 arr은 변경 안됨
```

## 참고 자료

- [Node.js 공식 사이트](https://nodejs.org/ko)
- [Node.js 공식 가이드](https://nodejs.org/en/docs/guides/)
- [이벤트 루프 시각적 설명 (Loupe)](http://latentflip.com/loupe)
- [이벤트 루프 공식 설명](https://nodejs.org/ko/docs/guides/event-loop-timers-and-nexttick/)
- [TypeScript 공식 문서](https://www.typescriptlang.org/docs/)
- [Node.js 교과서 1장](https://thebook.io/080334/0001/)
