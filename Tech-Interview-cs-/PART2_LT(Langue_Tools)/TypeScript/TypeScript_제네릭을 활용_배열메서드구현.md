# 🌐 TypeScrpt 제네릭을 활용한 배열 메서드 구현

JavaScript의 배열 메서드를 TypeScript에서 제네릭을 이용해 타입을 안전하게 재구현하는 방법에 대해 다뤄봤다. 자바스크립트의 배열에 대해 간략하게 소개도 하고, TypeScript로 어떻게 활용하는 지에 대해서도 작성하였다.
이 포스트에는 배열 메서드들(filter, reduce, find, some, every, at, includes, push, pop, reverse, slice, map, forEach)를 중점으로:

- JavaScript 기본동작
- TypeScript 구현
- 화살표 함수 버전
- 실제 적용 예시
  등으로 작성해볼 예정이다.

---

## 1.filter 메서드: 조건에 맞는 필터링

### 1-1. JavaScript

`filter` 메서드는 배열의 각 요소를 주어진 콜백 함수에 조건에 통과하는 요소들만 모아 새로운 배열을 반환한다.
원본 배열은 변경되지 않는다. 시간복잡도는 O(n)으로 배열 전체를 순회한다.

```js
const arrFilter = [1, 2, 3, 4];
const resFilter = arrFilter.filter((num) => num > 2); // [3, 4]
```

### 1-2. TypeScript 구현

- TypeScript에서 제네릭을 사용하여 배열 요소 타입 T를 지정해 타입 안전성을 보장한다. 콜백 함수의 인자도 T로 묶어 타입 불일치를 방지한다.
  - 기본 제네릭 버전: 배열 요소 타입과 콜백인자를 하나의 제네릭 T로 묶는다.

```ts
function filter1<T>(arr: T[], func: (arg: T) => boolean): T[] {
  return arr.filter(func);
}
```

- 콜백 타입 제한버전: 추가 제네릭 func를 추가하여 콜백의 타입을 더 세밀하게 제한할 수도 있다.

```ts
function filter2<T, Func extends (arg: T) => boolean>(
  arr: T[],
  func: Func
): T[] {
  return arr.filter(func);
}
```

- 화살표 함수

```ts
const filter1_3 = <T>(arr: T[], func: (arg: T) => boolean): T[] =>
  arr.filter(func);

const filter2_3 = <T, Func extends (arg: T) => boolean>(
  arr: T[],
  func: Func
): T[] => arr.filter(func);
```

- 실제 적용 예시

```ts
const nums = [1, 2, 3, 4];
const result1 = filter1(nums, (num) => num > 2);

const result2 = filter2(["apple", "banana"], (str) => str.length > 5); // ["banana"]
```

---

## 2. reduce 메서드: 배열을 하나의 값으로 축소

### 1-1. JavaScript 동작

`reduce`는 배열의 각 요소를 누적하며 콜백 함수를 적용해 단일 값을 줄인다. 초기값을 제공할 수 있고, 합산, 문자열 연결 등에 유용하다.
초기값 없이 호출하면 첫 요소를 초기값으로 사용하나, 빈 배열에서 에러가 발생할 수 있다.

```js
const arrReduce = [1, 2, 3];
const sumJS = arrReduce.reduce((arr, cur) => acc + cur, 0); // 6
```

### 1-2. TypeScript 구현

- 제네릭으로 누적값 타입 `Result`와 요소 타입 `T`를 분리해 사용한다.

```ts
functiuon reudce1<T, Result>(
   arr: T[],
   func: (acc: Result, cur: T) => Result,
   init: Result
): Result {
   return arr.reduce(func, init);
};
```

- 콜백 타입 제한

```ts
function reduce2<T, Result, Func extends (acc: Result, cur: T) => Result>(
  arr: T[],
  func: Func,
  init: Result
): Result {
  return arr.reduce(func, init);
}
```

- 화살표 함수버전

```ts
const reduce1_3 = <T, Result>(
  arr: T[],
  func: (acc: Result, cur: T) => Result,
  init: Result
): Result => arr.redcue(func, init);

const reduce2_3 = <T, Result, Func extends (acc: Result, cur: T) => Result>(
  arr: T[],
  func: Func,
  init: Result
): Result => arr.reduce(func, init);
```

- 실제 적용 예시

```ts
const sumTS = reduce1([1, 2, 3], (acc, cur) => acc + cur, 0); // 6

const joined = reduce2<string, string, (acc: string, cur: string) => string>(
   ["a", "b", "c"],
   (acc + cur) => acc + cur,
   ""
); // "abc"
```

---

## 3. find 메서드: 첫 번째 일치 요소 찾기

### 3-1. JavaScript 기본 동작

`find`는 콜백 조건을 만족하는 첫 번째 요소를 반환한다. 없으면 `undefined`를 반환한다. `filter`와 달리 첫번째만 찾는다.

```js
const arrFind = [10, 20, 30];
const foundJS = arrFind.find((value) => value > 15); // 20
```

### 3-2. TypeScript 구현

- 변환 타입을 `T | undefined`로 지정해서 처리한다.

```ts
function find1<T>(arr: T[], func: (arg: T) => boolean): T | undefined {
  return arr.find(func);
}
```

- 콜백 타입 제한

```ts
function find2<T, Func extends (arg: T) => boolean>(
  arr: T[],
  func: Func
): T | undefined {
  return arr.find(func);
}
```

- 화살표 함수

```ts
const find1_3 = <T>(arr: T[], func: (arg: T) => boolean): T | undefined =>
  arr.find(func);

const find2_3 = <T, Func extends (arg: T) => boolean>(
  arr: T[],
  func: Func
): T | undefined => arr.find(func);
```

예시

```ts
const users = [{ name: "Kim" }, { name: "Lee" }];
const userFinded = find1(users, (user) => user.name === "Kim"); // { name: "Kim"}
```

## 4. some, every 메서드: 조건 만족 여부 확인

### 4-1. JavaScript 동작 구현

`some`은 하나라도 조건을 만족하면 true, `every`는 모두 만족해야 true를 반환한다.

```js
const arrCond = [80, 90, 100];
const hasPerfectJS = arrCond.some((score) => score === 100); // true
const isPassJs = arrCond.every((score) => score >= 70); // true
```

### 4-2. TypeScript 구현

- boolean
- some

```ts
function some1<T>(arr: T[], func: (arg: T) => boolean): boolean {
  return arr.some(func);
}
```

- every

```ts
function every1<T>(arr: T[], func: (arg: T) => boolean): boolean {
  return arr.every(func);
}
```

### 4-3 화살표 함수 버전

```ts
const some1_3 = <T>(arr: T[], func: (arg: T) => boolean): boolean =>
  arr.some(func);

const every1_3 = <T>(arr: T[], func: (arg: T) => boolean): boolean =>
  arr.every(func);
```

### 4-4. 실제예시

```ts
const scores = [80, 90, 100];
const hasPerfect = some1(scores, (score) => score === 100); // true
const allPass = every1(scores, (score) => score > 70); // true
```

- 빈 배열에서 `some`은 false, `every`는 true를 반환한다.

## 5. at, includes 메서드: 인덱스 접근과 포함

### 5-1. JavaScript 기본동작

- `at`은 인덱스(음수 지원)로 요소를 가져오고, `includes`는 값 존재 여부를 확인한다. `at`은 ES2022부터 도입되어 호환성을 확인한다.

```js
const arrAtInc = ["red", "blue", "green"];
const lastJS = arrAtInc.at(-1); // "green"
const hasRedJS = arrAtInc.includes("red"); // true
```

### 5-2. TypeScript 구현

- `at`은 `undefined` 가능성을 고려한다.
- at:

```ts
function at1<T>(arr: T[], index: number): T | undefined {
  return arr.at(index);
}
```

- includes:

```ts
function includes1<T>(arr: T[], value: T): boolean {
  return arr.includes(value);
}
```

### 5-3. 화살표 함수

```ts
const at1_3 = <T>(arr: T[], index: number): T | undefined => arr.at(index);

const includes1_3 = <T>(arr: T[], value: T): boolean => arr.includes(value);
```

### 5-4. 실제 적용 예시

```ts
const colors = ["red", "blue", "green"];
const lastColor = at1(colors, -1); // "green"
const hasRed = includes1(colors, "red"); // true
```

- value 타입을 배열 요소와 일치 시켜 타입 오류를 찾는다.
- `includes`는 NaN도 처리하나, 참조 비교다.

## 6. push, pop메서드: 요소 추가/ 제거
