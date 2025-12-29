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
