# 🌐 es-toolkit으로 배열 예시

- 배열을 다루기 위한 다양한 함수를 제공한다.
- 중복 제거, 차집합, 분할, 평탄화 등 배열 조작 기능을 간편하게 사용할 수 있다.

---

## 1. 배열

### 1-1. 배열조작, at

- 배열에서 지정된 인덱스에 있는 요소들을 가져와 새 배열을 반환한다.

```ts
const result = at(arr, indices);
```

**사용법**
`at(arr, indices)`

- 배열에서 특정 위치의 요소들을 선택하고 싶을 때 `at`을 사용한다. 음수 인덱스를 사용하면 배열의 끝에서부터 요소를 선택할 수 있다.

```ts
import { at } from "es-toolkit/array";

// 숫자 배열에서 여러 인덱스의 요소를 가져온다.
at([10, 20, 30, 40, 50], [1, 3, 4]);
// Returns: [20, 40, 50]

// 음수 인덱스를 사용해 끝에서부터 요소를 가져온다.
at(["a", "b", "c", "d"], [0, -1, -2]);

// Returns ['a', 'd', 'c']
```

- 정수가 아닌 인덱스는 정수로 변환된다.

```ts
import { at } from "es-toolkit/array";

at([1, 2, 3, 4], [1.5, 2.9]); // [2, 3]

// 실무 예시 1: 첫 번째와 마지막 요소
interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" },
];

const firstAndLast = at(users, [0, -1]);
console.log(firstAndLast);
// [{ id: 1, name: 'Alice' }, { id: 3, name: 'Charlie' }]

// 실무 예시 2: 샘플 데이터 추출
const logs = ["log1", "log2", "log3", "log4", "log5", "log6"];
const samples = at(logs, [0, 2, 4]); // 짝수 인덱스만
console.log(samples); // ['log1', 'log3', 'log5']
```

**파라미터**

- arr(T[]): 요소를 가져올 배열이다.
- indices(number[]): 가져올 요소들 인덱스 배열이다. 음수 값을 사용하여 배열을 계산한다.

**반환 값**

- (T[]): 지정된 인덱스에 있는 요소들을 담은 새 배열이다.

### 1-2. chunk

- 배열을 지정된 크기로 분할한다.
- 배열을 정해진 크기의 작은 배열로 나눠 새 2차원 배열을 반환한다.

```ts
const chunked = chunk(arr, size);
```

**사용법**
`chunk(arr, size)`

- 긴 배열을 같은 크기의 여러 작은 배열로 나눌 때 `chunk`를 사용한다. 배열을 똑같이 나눌 수 없으면, 마지막 배열이 남은 요소들을 포함한다.

```ts
import { chunk } from "es-toolkit/array";

// 숫자 배열을 크기 2로 나눈다.
chunk([1, 2, 3, 4, 5], 2);
// Returns: [[1, 2], [3, 4], [5]]

// 문자열 배열을 크기 3으로 나눈다.
chunk(["a", "b", "c", "d", "e", "f", "g"], 3);
// Returns: [['a', 'b', 'c'], ['d', 'e', 'f'], ['g']]

// 실무 예시 1: 상품 그리드 (한 줄에 4개씩)
interface Product {
  id: number;
  name: string;
  price: number;
}

const products: Product[] = [
  { id: 1, name: "상품1", price: 10000 },
  { id: 2, name: "상품2", price: 20000 },
  { id: 3, name: "상품3", price: 30000 },
  { id: 4, name: "상품4", price: 40000 },
  { id: 5, name: "상품5", price: 50000 },
];

const productRows = chunk(products, 4);
// [[상품1, 상품2, 상품3, 상품4], [상품5]]
```

- 빈 배열을 나누면 빈 배열이 반환된다.

```ts
import { chunk } from "es-toolkit/array";

chunk([], 2); // []
```

**파라미터**

- arr(T[]): 나눌 배열이다.
- size(number): 각 작은 배열의 크기다. 양의 정수다.

**반환 값**

- (T[][]): 크기 size로 나눠진 2차원 배열을 반환한다.

**에러**

- size가 양의 정수가 아니면 에러를 던진다.

---

**Lodash 호환성**

- `es-toolkit/compat` 에서 chunk를 가져오면 lodash와 호환된다.
  - size가 1보다 작으면 빈 배열을 반환한다.
  - size에 소수점이 있는 숫자를 제공, 정수로 내림한다.

```ts
import { chunk } from "es-toolkit/compat";

chunk([1, 2, 3], 0); // Returns []
```

**성능 비교**
| 라이브러리 | 번들 사이즈 | 런타임 성능 |
| :--- | :--- | :--- |
| **es-toolkit** | 238 바이트 (92.4% 작음) | 9,338,821 회 (11% 느림) |
| **es-toolkit/compat** | 307 바이트 (90.2% 작음) | 9,892,157 회 (5% 느림) |
| **lodash-es** | 3,153 바이트 | 10,523,270 회 |

### 1-3. flatten

- 중첩된 배열을 지정된 깊이까지 평탄화한 새 배열을 반환한다.

```ts
const result = flatten(arr, depth);
```

**사용법**
`flatten(arr, depth = 1)`

- 중첩된 배열을 특정 깊이까지 평탄화하고 싶을 때 `flatten`을 사용한다. 배열 안의 배열들을 지정된 레벨까지 풀어 구조를 만든다.
- Array#flat과 동일하게 동작하나, 더 빠르다.

```ts
import { chunk } from "es-toolkit/array";

// 기본 깊이 1로 평탄화한다.
const array = [1, [2, 3], [4, [5, 6]]];
flatten(array);
// Returns: [1, 2, 3, 4, [5, 6]]

// 깊이 2로 평탄화한다.
flatten(array, 2);
// Returns: [1, 2, 3, 4, 5, 6]

// 실무 예시 1: 카테고리별 상품 합치기
interface Category {
  name: string;
  products: Product[];
}

const categories: Category[] = [
  {
    name: "전자제품",
    products: [
      { id: 1, name: "노트북", price: 1000000 },
      { id: 2, name: "마우스", price: 30000 },
    ],
  },
  { name: "의류", products: [{ id: 3, name: "티셔츠", price: 20000 }] },
];

const allProducts = flatten(categories.map((cat) => cat.products));
console.log(allProducts);
// [{ id: 1, name: '노트북', ... }, { id: 2, name: '마우스', ... }, ...]
```

- 깊이를 조절해 원하는 레벨까지 평탄화할 수 있다.

```ts
import { flatten } from "es-toolkit/array";

const array = [1, [2, 3], [4, [5, 6]]];

// 깊이 1로 평탄화 (기본값)
const result1 = flatten(array, 1);
// Returns: [1, 2, 3, 4, [5, 6]]

// 깊이 2로 평탄화
const result2 = flatten(array, 2);
// Returns: [1, 2, 3, 4, 5, 6]
```

**파라미터**

- arr(T[]): 평탄화할 중첩 배열이다.
- depth(D, 선택): 평탄화할 깊이이다. 기본값은 1이다.

**반환값**

- (Array<FlatArray<T[], D>>): 지정된 깊이까지 평탄화 된 새 배열을 반환한다.

### 1-4. compact

- 거짓으로 평가되는 값들을 제거한 새 배열을 반환한다.

```ts
const compacted = compact(arr);
```

**사용법**

- `compact(arr)`
- 배열에서 거짓으로 평가되는 값들(false, null, 0, -0, 0n, '', undefined, NaN)을 제거할 때 compact를 사용한다.
- 참으로 평가되는 값들만 남은 새 배열이 반환된다.

```ts
import { compact } from "es-toolkit/array";

// 다양한 거짓 값들을 제거한다.
compact([0, -0, 0n, 1, false, 2, "", 3, null, undefined, 4, NaN, 5]);
// Returns: [1, 2, 3, 4, 5]

// 문자열 배열에서 빈 문자열을 제거한다.
compact(["hello", "", "world", "", "!"]);
// Returns: ['hello', 'world', '!']
```

- 타입 시스템이 거짓으로 평가되는 타입들을 자동으로 제외한다.

```ts
import { compact } from "es-toolkit/array";

const mixed: (string | number | false | null)[] = ["text", 0, false, null, 5];
const result = compact(mixed);
// result 타입은 (string | number)[]

// 실무 예시 1: API 응답 필터링
interface ApiResponse {
  id: number;
  name: string | null;
  email: string | undefined;
  age: number;
}

const responses: (ApiResponse | null | undefined)[] = [
  { id: 1, name: "John", email: "john@example.com", age: 30 },
  null,
  { id: 2, name: null, email: undefined, age: 25 },
  undefined,
  { id: 3, name: "Alice", email: "alice@example.com", age: 28 },
];

const validResponses = compact(responses);
console.log(validResponses);
// [{ id: 1, ... }, { id: 2, ... }, { id: 3, ... }]
```

**파라미터**

- arr(T[]): 거짓으로 평가되는 값을 제거할 배열이다.

**반환값**

- (Array<Exclude<T, flase | null | 0 | 0n | '' | undefined>>)ㅣ 거짓으로 평가되는 값들이 제거된 새 배열이다.

---

## 2. 배열 검색

### 2-1. uniq

- 중복 제거, 배열에서 중복된 값을 제거하고 새로운 배열을 반환한다.

```ts
const uniqueArray = uniq(arr);
```

**사용법**
`uniq(arr)`

- 배열에서 중복된 값들을 제거하고 고유한 값들만 남기고 싶을 때 uniq를 사용한다. 원본 배열에서 처음 나타나는 순서를 유지한다.

```ts
import { uniq } from "es-toolkit/array";

// 숫자 레벨에서 중복을 제거한다.
const numbers = [1, 2, 2, 3, 4, 4, 5];
const uniqeNumbers = uniq(numbers);
console.log(uniqeNumbers); // [1, 2, 3, 4, 5]

// 문자열 배열에서 중복을 제거한다.
const words = ["apple", "banana", "apple", "cherry", "banana"];
const uniqueWords = uniq(words);
console.log(uniqueWords); // ['apple', 'banana', 'cherry']

// 객체 배열에서 참조가 같은 객체를 제거한다.
const obj1 = { id: 1 };
const obj2 = { id: 2 };
const obj3 = { id: 3 };
const objects = [obj1, obj2, obj1, obj3, obj2];
console.log(uniqueObjects); // [{id: 1}, {id: 2}, {id: 3}]

// 실무 예시 1: 태그 중복 제거
const tags = ["react", "typescript", "react", "nodejs", "typescript"];
const uniqueTags = uniq(tags);
console.log(uniqueTags); // ['react', 'typescript', 'nodejs']
```

- 빈 배열에서 빈 배열을 반환한다.

```ts
import { uniq } from "es-toolkit/array";

const emptyArray = uniq([]);
console.log(emptyArray); // []
```

**파라미터**

- arr(readonly T[]): 중복을 제거할 배열이다.

**반환값**

- (T[]): 중복이 제거된 새로운 배열이다. 원본 배열에서 처음 나타나는 순서를 유지한다.

### 2-2. uniqBy

- 반환 함수가 반환하는 값을 기준으로 배열에서 중복된 요소들을 제거한 새로운 배열을 반환한다.

```ts
const uniqueArray = uniqBy(arr, mapper);
```

**사용법**
`uniqBy(arr, mapper)`

- 배열의 요소들을 특정 기준으로 반환해서 중복을 판단하고 싶을 때 `uniqBy`를 사용한다.
- 변환 함수가 같은 값을 반환하는 요소들 중 처음 나타나는 것만 남긴다.

```ts
import {uniqBy} from 'es-toolkit/array`;

// 소수점 숫자들을 내림차순으로 변환해서 중복을 제거한다.
const numbers = [1.2, 1.5, 2.1, 3.2, 5.7, 5.3, 7.19];
const result = uniqBy(numbers, Math.floor);
console.log(result); // [1.2, 2.1, 3.2, 5.7, 7.19]

// 객체 배열에서 특정 속성을 기준으로 중복 제거한다.
const users = [
  { id: 1, name: 'john', age: 30},
  { id: 2, name: 'jane', age: 30},
  { id: 3, name: 'joe', age: 25},
  { id: 4, name: 'jenny', age: 25},
];

const uniqueByAge = uniqBy(users, user => user.age);
console.log(uniqueByAge);
// [{id: 1, name: 'john', age: 30}, { id: 3, name: 'joe', age: 25}]

// 문자열 길이를 기준으로 중복을 제거한다.
const words = ['apple', 'pie', 'banana', 'cat', 'dog'];
const uniqueByLength = uniqBy(words, word => wordl.length);
console.log(uniqueByLength); // ['apple', 'pie', 'banana']
```

- 복잡한 객체에도 특정 필드의 조합을 기준으로 할 수 있다.

```ts
import { uniqBy } from "es-toolkit/array";

const products = [
  { category: "fruit", name: "apple" },
  { category: "fruit", name: "banana" },
  { category: "vegetable", name: "carrot" },
  { category: "fruit", name: "grape" },
];

// 카테고리를 기준으로 중복 제거한다.
const uniqueByCategory = uniqBy(products, (item) => item.category);
console.log(uniqueByCategory.length); // 2
console.log(uniqueByCategory);
// [{ category: 'fruit', name: 'apple' }, { category: 'vegetable', name: 'carrot' }]

// 실무 예시 1: 이메일 기준 중복 제거
const contacts = [
  { name: "Alice", email: "alice@example.com" },
  { name: "Bob", email: "bob@example.com" },
  { name: "Alice Smith", email: "alice@example.com" }, // 이메일 중복
];

const uniqueContacts = uniqBy(contacts, (c) => c.email);
```

**파라미터**

- arr(readonly T[]): 중복을 제거할 배열이다.
- mapper((item: T) => U): 각 요소를 비교할 값으로 변환하는 함수다.

**반환 값**

- (T[]): 변환 함수의 결과를 기준으로 중복이 제거된 새로운 배열이다. 원본 배열에서 처음 나타나는 순서를 유지한다.

### 2-3. difference

- 첫번째 배열에서 두 번째 배열에 있는 요소들을 제외한 새 배열을 반환한다.

```ts
const result = difference(firstArr, secondArr);
```

**사용법**
`difference(firstArr, secondArr)

- 두 배열의 차집함을 구하고 싶을 때 `difference`를 사용한다. 첫 번째 배열만 있고 두 번째 배열에는 없는 요소들로 이루어진 새 배열이 반환된다.

```ts
import { difference } from "es-toolkit/array";

// 숫자 배경의 차집합을 구한다.
const array1 = [1, 2, 3, 4, 5];
const array2 = [2, 4];
difference(array1, array2);
// Returns: [1, 3, 5]
// 2와 4는 배열에 모두 있어 차례로 제외된다.

// 문자열 배열의 차집합
const colors1 = ["red", "blue", "green"];
const colors2 = ["blue", "yellow"];
difference(array1, array2);
// Returns ['red', 'green']
```

- 빈 배열과의 차집합은 원래 배열과 같다.

```ts
import { difference } from "es-toolkit/array";

difference([1, 2, 3], []); // [1, 2, 3]
difference([], [1, 2, 3]); // []
```

**파라미터**

- `firstArr`(T[]): 차집합을 구한 기준 배열이다.
- `secondArr`(T[]): 첫 번째 배열에서 제외한 요소들을 포함한 배열이다.

**반환값**
(T[]): 첫 번째 배열에만 있고 두 번째 배열에는 없는 요소들로만 이루어진 새 배열이다.

- 라이브러리 성능 및 사이즈
  | 비교 항목 | es-toolkit (추천) | lodash-es | 차이 / 효율 |
  | :--- | :--- | :--- | :--- |
  | **번들 사이즈** | **90 바이트** | 7,958 바이트 | **92.4% 더 작음** (초경량) |
  | **성능 (연산/초)** | **9,317,227 회** | 5,030,861 회 | **85% 더 빠름** (고성능) |

### 2-4. intersection

- 두 배열에 공통으로 포함된 요소들로 이루어진 새 배열을 반환한다.

```ts
const result = intersection(firstArr, secondArr);
```

**사용법**
`intersection(firstArr, secondArr)`

- 두 배열에서 공통 요소만 찾고 싶을 때 사용한다.
- 첫 번째 배열의 요소 중 두 번째 배열에 존재하는 것들만 새 배열로 반환한다.
- 두 데이터 세트의 교집합을 구할 때 유용하다.

```ts
import { intersection } from "es-toolkit/array";

// 숫자 배열의 교집합을 구한다.
const numbers1 = [1, 2, 3, 4, 5];
const numbers2 = [3, 4, 5, 6, 7];
intersection(numbers1, numbers2);
// Returns: [3, 4, 5]

// 문자애려 배열의 교집합을 구한다.
const strings1 = ["apple", "banana", "cherry"];
const strings2 = ["banana", "cherry", "date"];
intersection(strings1, strings2);
// Returns: ['banana', 'cherry']
```

- 교집합이 없거나 특별한 경우도 처리한다.

```ts
import { intersection } from "es-toolkit/array";

// 교집합이 없는 경우 빈 배열을 반환한다.
const noCommon1 = [1, 2, 3];
const noCommon2 = [4, 5, 6];
intersection(noCommon1, noCommon2);
// returns: []

// 한 쪽이 빈 배열인 경우 빈 배열을 반환한다.
const numbers = [1, 2, 3];
const empty: number[] = [];
intersection(numbers, empty);
// returns: []
```

**파라미터**

- `firstArr(readonly T[])`: 비교할 첫 번째 배열이다.
- `secondArr(readonly T[])`: 비교할 두 번째 배열이다.

**반환값**
`(T[])`: 두 배열에 고통으로 포함된 요소들을 이루어진 새 배열을 반환한다.

---

## 3. 배열 변환

### 3-1. groupBy

- 배열의 요소들을 특정 기준에 따라 분류하고 싶을 때 `groupBy`를 사용한다.
- 각 요소에서 키를 생성하는 함수를 제공, 같은 키를 가진 요소들끼리 묶어서 객체로 반환한다.
- 반환되는 객체의 값은 그룹에 속하는 요소들의 배열이다.
- 데이터를 카테고리별로 정리하거나 그룹별 분석을 할 때 유용하다.

```ts
import { groupBy } from "es-toolkit/array";

// 객체 배열을 카테고리로 그룹화한다.
const items = [
  { category: "fruit", name: "apple" },
  { category: "fruit", name: "banana" },
  { category: "vegetable", name: "carrot" },
];

const result = groupBy(items, (item) => item.category);
// 결과:
// {
//   fruit: [
//     { category: 'fruit', name: 'apple' },
//     { category: 'fruit', name: 'banana' }
//   ],
//   vegetable: [
//     { category: 'vegetable', name: 'carrot' }
//   ]
// }
```

- 다양한 기준으로 그룹화할 수 있다.

```ts
import { groupBy } from "es-toolkit/array";

// 문자별 길이별로 그룹화한다.
const words = ["one", "two", "three", "four", "five"];
const byLength = groupBy(words, (word) => word.length);
// 결과: { 3: ['one', 'two'], 4: ['four', 'five], 5:['three']}

// 짝수/홀수별로 그룹화한다.
const numbers = [1, 2, 3, 4, 5, 6];
const byParity = groupBy(numbers, (num) => (num % 2 === 0 ? "even" : "odd"));
// 결과: { odd: [1, 3, 5], even: [2, 4, 6]}
```

**파라미터**

- `arr`(`T[]`): 그룹화할 배열이다.
- `getKeyFromItem`(`(item: T) => K`): 각 요소에서 키를 생성하는 함수다.

**반환값**

- (`Record<K, T[]>`): 키에 따라 요소들이 그룹화된 객체를 반환한다.

### 3-2. partition

`partition`

- 조건에 따라 배열을 두 그룹으로 나눈 튜플을 반환한다.

```ts
const [truthy, falsy] = partition(arr, isInTruthy);
```

**사용법**

- `partition(arr, isInTruthy)`
- 배열의 요소들을 특정 조건에 따라 두 그룹으로 분리하고 싶을 때 사용한다.
- 조건함수가 true를 반환하는 요소들과 false를 반환하는 요소들을 각각 다른 배열로 분리한다.

```ts
import { partition } from "es-toolkit/array";

// 숫자 배열을 짝수와 홀수로 나눈다.
const numbers = [1, 2, 3, 4, 5, 6];
const [evens, odss] = partition(numbers, (x) => x % 2 === 0);
// evens: [2, 4, 6]
// odss: [1, 3, 5]

// 객체 배열을 특정 조건으로 나눈다.
const users = [
  { name: "Alice", active: true },
  { name: "Bob", active: false },
  { name: "Charlie", active: true },
];

const [activeUsers, inactiveUsers] = partition(users, (user) => user.active);
// activeUsers: [{ name: 'Alice', active: true }, { name: 'Charlie', active: true }]
// inactiveUsers: [{ name: 'Bob', active: false }]
```

- 반 배열에서 두 개의 빈 배열을 반환한다.

```ts
import { partition } from "es-toolkit/array";

const [truthy, falsy] = partition([], (x) => x > 0);
// truthy: []
// falsy: []
```

**파라미터**

- `arr`(`T[]`): 두 그룹으로 나누는 배열이다.
- `isInTruthy`(`(value: T) => boolean`): 각 요소가 첫 번째 배열(truthy)에 포함될지, 두 번째 배열(falsy)에 포함될 지 결정하는 조건 함수다.

**반환값**

- (`[truthy:T[], falsy: T[]]`): 두 배열로 구성된 튜플이다. 첫번째 배열은 조건이 `true`인 요소를, 두 번째 배열은 조건이 `false`인 요소들을 담고 있다.

---

## 4. 배열 정렬

### 4-1. orderBy

- 여러 기준과 정렬방향에 따라 객체 배열을 정렬한 새 배열을 반환한다.

```ts
const sorted = orderBy(arr, criteria, orders);
```

**사용법**

- `orderBy(arr, criteria, orders)`
- 객체 배열을 여러 조건으로 복합 정렬할 때 `orderBy`를 사용한다.
- 조건마다 오름차순이나 내림차순을 지정할 수 있다.
- 같은 값이면 다음조건으로 정렬한다.

```ts
import { orderBy } from "es-toolkit/array";

// 여러 기준으로 사용자 배열을 정렬한다.
const users = [
  { user: "fred", age: 48 },
  { user: "barney", age: 34 },
  { user: "fred", age: 40 },
  { user: "barney", age: 36 },
];

orderBy(users, [(obj) => obj.user, "age"], ["asc", "desc"]);
// Returns:
// [
//   { user: 'barney', age: 36 },
//   { user: 'barney', age: 34 },
//   { user: 'fred', age: 48 },
//   { user: 'fred', age: 40 }
// ]

// 속성 이름과 함수를 섞어서 사용할 수 있다.
const products = [
  { name: "Apple", category: "fruit", price: 1.5 },
  { name: "Banana", category: "fruit", price: 0.8 },
  { name: "Broccoli", category: "vegetable", price: 2.0 },
];

orderBy(
  products,
  ["category", (product) => product.name.length],
  ["asc", "desc"]
);
// Returns: category로 먼저 정렬하고, 같은 category 내에서는 이름 길이 내림차순으로 정렬
```

- 정렬 방향의 개수가 조건보다 적으면 마지막 방향을 반복 사용한다.

```ts
import { orderBy } from "es-toolkit/array";

const data = [
  { a: 1, b: 1, c: 1 },
  { a: 1, b: 2, c: 2 },
  { a: 2, b: 1, c: 1 },
];

orderBy(data, ["a", "b", "c"], ["asc", "desc"]);
// 'a'는 오름차순, 'b'와 'c'는 내림차순으로 정렬된다.
```

**파라미터**

- `arr`(`T[]`): 정렬할 객체 배열이다.
- `criteria`(`Array<((item: T) => unknown) | keyof T>`): 정렬할 기준들이다. 객체의 속성 이름이나 값을 반환하는 함수다.
- `orders`(`Array<'asc' | 'desc'>`): 각 기준에 대한 정렬 방향 배열이다. `asc`는 오름차순, `desc`는 내림차순을 의미한다.

**반환값**

- (`T[]`): 지정된 기준과 방향에 따라 정렬된 새 배열이다.

### 4-2. sortBy

- 주어진 기준에 따라 객체 배열을 오름차순으로 정렬한 새 배열을 반환한다.

```ts
const sorted = sortBy(arr, criteria);
```

**사용법**

- `sortBy(arr, criteria)`
- 객체 배열을 여러 속성이나 계산된 값을 기준으로 정렬하고 싶을 때 `sortBy`를 사용한다.
- 속성 이름이나 변환 함수를 배열로 제공, 해당 순서대로 우선순위를 두고 오름차순으로 정렬한다.
- 테이블 데이터를 정렬하거나 복잡한 정렬 로직이 필요할 때 유용하다.

```ts
import { sortBy } from "es-toolkit/array";

// 단일 속성으로 정렬한다.
const users = [
  { name: "john", age: 30 },
  { name: "jane", age: 25 },
  { name: "bob", age: 35 },
];

const byAge = sortBy(users, ["age"]);
// Returns: [{ name: 'jane', age: 25 }, { name: 'john', age: 30 }, { name: 'bob', age: 35 }]

// 여러 속성으로 정렬한다.
const employees = [
  { name: "john", department: "engineering", age: 30 },
  { name: "jane", department: "hr", age: 25 },
  { name: "bob", department: "engineering", age: 35 },
  { name: "alice", department: "engineering", age: 25 },
];
const sorted = sortBy(employyes, ["department", "age"]);
// Returns: 부서 먼저, 그 다음 나이 순으로 정렬
// [
//   { name: 'alice', department: 'engineering', age: 25 },
//   { name: 'john', department: 'engineering', age: 30 },
//   { name: 'bob', department: 'engineering', age: 35 },
//   { name: 'jane', department: 'hr', age: 25 }
// ]
```

- 함수를 사용, 복잡한 정렬 기준을 만들 수 있다.

```ts
import { sortBy } from "es-toolkit/array";

// 함수와 속성을 섞어서 사용한다.
const proudcts = [
  { name: "laptop", price: 1000, category: "electronics" },
  { name: "shirt", price: 50, category: "clothing" },
  { name: "phone", price: 800, category: "electronics" },
];

const sorted = sortBy(products, [
  "category",
  (item) => -item.price, // 가격은 내림차순
]);
// Returns: 카테고리 먼저, 그 다음 가격 높은 순으로 정렬한다.

// 계산된 값으로 정렬한다.
const words = ["hello", "a", "wonderful", "world"];
const byLength = sortBy(
  words.map((word) => ({ word, length: word.length })),
  ["length"]
);
// Returns: 문자열 같이 순으로 정렬된 객체 배열이다.
```

**파라미터**

- `arr`(`readonly T[]`): 정렬할 객체 배열이다.
- `criteria`(`Array<((item:T)=> unknown) | keyof T>`): 정렬 기준이다. 객체 속성 이름이나 변환 함수의 배열로, 앞에 있는 기준이 우선순위가 높다.

**반환값**

- (`T[]`): 지정된 기준에 따라 오름차순으로 정렬된 새 배열을 반환한다.

---

## 5. 배열 필터링

### 5-1. take

- 배열의 처음부터 지정한 개수만큼 요소를 가져와 새 배열을 만든다.

```ts
const taken = take(arr, count);
```

**사용법**

- `take(arr, count?)`
- 배열의 앞에서 몇 개의 요소만 필요할 때 `take`를 사용한다.
- 요청한 개수가 배열 길이보다 크면 전체 배열을 반환한다.

```ts
import { take } from 'es-toolkit/array';

// 처음 3개 요소를 가져온다.
take([1. 2. 3. 4. 5], 3);

// 처음 2개 요소를 가져온다.
take(['a', 'b', 'c'], 2);
// Returns: ['a', 'b']
```

- 배열보다 많은 개수를 요청하면 전체 배열을 반환한다.

```ts
import { take } from "es-toolkit/array";

take([1, 2, 3], 5);
// Returns: [1, 2, 3]
```

- `count`를 생략하면 첫 번째 요소만 가져온다.

```ts
import { take } from "es-toolkit/array";

take([1, 2, 3]);
// Returns: [1]
```

**파라미터**

- `arr`(`T[]`): 요소를 가져올 배열이다.
- `count`(`number`, 선택): 가져올 요소의 개수다. 기본값은 1이다.

**반환값**

- (`T[]`): 배열의 처음부터 `count`개 요소를 포함한 새 배열을 반환한다.

### 5-2. drop

- 배열의 시작부터 지정된 개수만큼 요소를 제거한 새 배열을 반환한다.

```ts
const dropped = drop(arr, itemsCount);
```

**사용법**
`drop(arr, itemsCount)

- 배열의 앞부분에서 요소를 제거하고 싶을 때 `drop`을 사용한다.
- 지정한 개수만큼 처음 요소들을 제거, 나머지 요소들로 이루어진 새 배열을 반환한다.

```ts
import { drop } from "es-toolkit/array";

// 배열의 처음 2개 요소를 제거한다.
drop([1, 2, 3, 4, 5], 2);
// Returns: [3, 4, 5]

// 제거할 개수가 배열 길이보다 크면 빈 배열을 반환한다.
drop([1, 2, 3], 5);
// Returns: []
```

- 음수나 0을 전달하면 원본 배열과 같은 요소를 가진 새 배열을 반환한다.

```ts
import { drop } from "es-toolkit/array";
drop([1, 2, 3], 0); // [1, 2, 3]
drop([1, 2, 3], -2); // [1, 2, 3]
```

**파라미터**

- `arr`(`T[]`): 요소를 제거할 배열이다.
- `itemsCount`(`number`): 배열의 시작부터 제거할 요소의 개수다.

**반환값**

- (`T[]`): 시작부터 지정된 개수만큼 요소가 제거된 새 배열이다.

### 5-3. sample

- 배열에서 무작위로 선택된 하나의 요스를 반환한다.

```ts
const randomElement = sameple(arr);
```

**사용법**

- `sample(arr)`
- 배열에서 무작위로 하나의 요소를 가져오고 싶을 때 `sample`을 사용한다.
- 게임에서 랜덤 아이템을 선택, 테스트용 데이터를 랜덤하게 가져오거나 추첨할 때 사용한다.

```ts
import { sample } from "es-toolkit/array";

// 숫자 배열에서 무작위로 하나를 선택한다.
const numbers = [1, 2, 3, 4, 5];
const randomNumber = sample(numbers);
// Returns: 1, 2, 3, 4, 5 중 하나

// 문자열 배열에서 무작위로 하나를 선택한다.
const fruits = ["apple", "banana", "cherry", "date"];
const randomeFruit = sample(fruits);
// Returns: 'apple', 'banana', 'cherry', 'date' 줄 하나

// 객체 배열에서 무작위로 하나를 선택한다.
const users = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 30 },
  { name: "Charlie", age: 35 },
];
const randomUser = sample(users);
// Returns: 세 명의 시청자 중 무작위로 하나
```

- 다양한 타입의 배열에서도 사용한다.

```ts
import { sample } from "es-toolkit/array";

// 불린 배열
const booleans = [true, false];
const randomBoolean = sample(booleans);
// Returns: true or false

// 혼합 타입 배열
const mixed = [1, "hello", { key: "value" }, [1, 2, 3]];
const randomItem = sample(mixed);
// Returns: 배열에 있는 요소 중 아무거나
```

**파라미터**

- `arr`(`readonly T[]`): 무작위로 요소를 선택한 배열이다.

**반환값**

- (`T`): 배열에서 무작위로 선택된 요소이다.

### 5-4. sampleSize

- 배열에서 지정된 크기만큼 무작위로 선택된 요소들로 이루어진 새 배열을 반환한다.

```ts
const sampled = sampledSize(array, size);
```

**사용법**

- `sampleSize(array, size)`
- 배열에서 여러개의 요소를 무작위로 샘플링하고 싶을 떄 사용한다.
- Floyd의 알고리즘 사용해 효율적으로 중복없는 랜덤 샘플을 사용한다.
- 설문조사에서 표본을 추출, 게임에서 여러 아이템을 랜덤하게 선택할 때 유용하다.

```ts
import { sampleSize } from "es-toolkit/array";

// 숫자 배열에 3개를 무작위로 선택한다.
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const randomNumbers = sampleSize(numbers, 3);
// Returns: [2, 7, 9] (실제로는 무작위)

// 문자열 배열에서 2개를 무작위로 선택한다.
const fruits = ["apple", "banana", "cherry", "date", "elderberry"];
const randomFruits = sampleSize(frutis, 2);
// Returns: ['cherry' , 'apple'] (예시)
```

- 다양한 크기로 샘플링 할 수 있다.

```ts
import { sampleSize } from "es-toolkit/array";

const items = ["a", "b", "c", "d", "e"];

// 1개 선택
const single = sampleSize(items, 1);
// Returns: ['c'] (예시)

// 전체 배열 크기와 같게 선택 (섞은 효과)
const all = sampleSize(items, 5);
// Returns: ['b', 'd', 'a', 'e', 'c'] (예시)

// 빈 배열 선택
const none = sampleSize(items, 0);
// Returns: []
```

**파라미터**

- `array`(`readonly T[]`): 샘플링할 배열이다.
- `size`(`number`): 선택할 요소의 개수다.

**반환값**

- (`T[]`): 무작위로 선택된 요소들로 구성된 새배열을 반환한다.

**에러**

- `size`가 배열의 길이보다 크면 에러를 던진다.

---

## 6. 배열 집합

### 6-1. union

- 두 배열의 모든 고유한 요소를 포함하는 새 배열을 만든다.

```ts
const unified = union(arr1, arr2);
```

**사용법**

- `union(arr1, arr2)`
- 여러 배열에서 중복없이 모든 요소를 하나로 합치고 싶을 때 사용한다.
- 두 배열을 합친 후 중복된 값을 제거한 새 배열을 반환한다.

```ts
import { union } from "es-toolkit/array";

// 숫자 배열의 합집합을 구한다.
const array1 = [1, 2, 3];
const array2 = [3, 4, 5];
union(array1, array2);
// Returns: [1, 2, 3, 4, 5]

// 문자열 배열의 합집합ㄷ을 구한다.
const fruits1 = ["apple", "banana"];
const fruits2 = ["banana", "orange"];
union(fruits1, fruits2);
// Returns: ['apple', 'banana', 'orange']
```

- 첫번째 배열의 요소가 먼저 나오고, 그 다음에 두 번째 배열의 고유한 요소가 추가된다.

```ts
import { union } from "es-toolkit/array";

const arr1 = [1, 2, 3];
const arr2 = [2, 3, 4, 5];
union(arr1, arr2);
// Returns: [1, 2, 3, 4, 5]
// 1, 2, 3은 arr1에서, 4, 5는 arr2에서 온 요소다.
```

**파라미터**

- `arr1`(`T[]`): 합친 첫번째 배열이다.
- `arr2`(`T[]`): 합친 두번째 배열이다.

**반환값**

- (`T[]`): 두 배열의 모든 고유한 요소를 포함한 새 배열을 반환한다.

### 6-2. zip

### 6-3. shuffle

### 6-4. fill

### 6-5. countBy

### 6-6. maxBy/minBy

---

## 7. 체크 해야될 사항

---

### 📚 참고 자료

- [es-toolkit 공식 문서](https://es-toolkit.dev)
- [배열 레퍼런스](https://es-toolkit.dev/ko/reference/array)
