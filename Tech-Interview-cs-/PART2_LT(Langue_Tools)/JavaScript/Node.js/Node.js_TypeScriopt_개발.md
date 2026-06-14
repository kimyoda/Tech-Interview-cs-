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
