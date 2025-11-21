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

### 2-3. difference

### 2-4. intersection

---

## 3. 배열 변환

### 3-1. groupBy

### 3-2. partition

---

## 4. 배열 정렬

### 4-1. orderBy

### 4-2. sortBy

---

## 5. 배열 필터링

### 5-1. take

### 5-2. drop

### 5-3. sample

### 5-4. sampleSize

---

## 6. 배열 집합

### 6-1. union

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
