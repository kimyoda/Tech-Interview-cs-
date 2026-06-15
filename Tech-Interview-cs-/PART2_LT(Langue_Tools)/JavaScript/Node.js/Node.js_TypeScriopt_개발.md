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
