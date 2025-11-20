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
```

**파라미터**

- arr(T[]): 요소를 가져올 배열이다.
- indices(number[]): 가져올 요소들 인덱스 배열이다. 음수 값을 사용하여 배열을 계산한다.

**반환 값**

- (T[]): 지정된 인덱스에 있는 요소들을 담은 새 배열이다.

### 1-2. chunk

- Node.js나 Bun을 사용하는 경우, npm에서 설치할 수 있다.
- 브라우저에서 쓰는 경우 CDN에서 가져올 수 있다.

---

**Node.js**

- es-toolkit은 Node.js 18 또는 이후 버전을 지원한다. es-toolkit을 설치하기 위해 아래 명령어를 사용한다.

```bash
npm install es-toolkit
pnpm add es-toolkit
yarn add es-toolkit
```

- es-toolkit의 함수를 사용하려면 아래와 같이 `import`해서 사용한다.

```ts
import { sum } from "es-toolkit";

sum([1, 2, 3]);
```

**Deno**

- es-toolkit을 Deno에서도 사용할 수 있다. JSR에서 명령어로 설치한다.

```sh
deno add @es-toolkit/es-toolkit
```

- 추가적인 Scope가 필요하다.

```ts
import { sum } from "@es-toolkit/es-toolkit";

sum([1, 2, 3]);
```

**브라우저**

- CDN에서 es-toolkit을 쓸 수 있어요. Lodash와 같이 \_ 변수에 모든 함수가 포함돼요.

```html
<script src="https://cdn.jsdelivr.net/npm/es-toolkit@%5E1"></script>
<script>
  var arr = _.chunk([1, 2, 3, 4, 5, 6], 3);
</script>
```

- esm.sh도 쓸 수 있다.

```html
<script type="importmap">
  {
    "imports": {
      "es-toolkit": "https://esm.sh/es-toolkit@%5E1"
    }
  }
</script>
<script type="module">
  import { chunk } from "es-toolkit";

  chunk([1, 2, 3, 4, 5, 6], 3);
</script>
```

### 1-3. flatten

### 1-4. compact

- es-toolkit은 설계할 때 성능을 우선적으로 고려하고 있다.
- `lodash`와 같은 다른 라이브러리와 비교했을 때, 평균적으로 **2배의 성능 향상**을 확인했고, 함수에 따라서는 **최대 11배 빠른 성능**을 보이기도 합니다.
- 성능 향상은 **현대적인 JavaScript API**를 적극적으로 활용하여 구현했기 때문에 가능하다.
  ![es-toolkit vs lodash 성능 비교 차트](performance.webp)

# 🏎️ 성능 비교 상세 (초당 실행 횟수)

| 함수명               | es-toolkit (v0.0.1) | lodash-es (v4.17.21) | 차이 (속도)  |
| :------------------- | :------------------ | :------------------- | :----------- |
| **omit**             | 4,767,360회         | 403,624회            | **11.8× 🚀** |
| **pick**             | 9,121,839회         | 2,663,072회          | **3.43×**    |
| **differenceWith**   | 9,291,897회         | 4,275,222회          | **2.17×**    |
| **difference**       | 10,436,101회        | 5,155,631회          | **2.02×**    |
| **intersectionWith** | 8,074,722회         | 3,814,479회          | **2.12×**    |
| **intersection**     | 9,999,571회         | 4,630,316회          | **2.15×**    |
| **unionBy**          | 6,435,983회         | 3,794,899회          | **1.69×**    |
| **union**            | 5,059,209회         | 4,771,400회          | **1.06×**    |
| **dropRightWhile**   | 7,529,559회         | 5,606,439회          | **1.34×**    |
| **groupBy**          | 5,000,235회         | 5,206,286회          | 0.96×        |

---

## 2. 배열 검색

### 2-1. uniq

> [!TIP] ✅ 1.39.3 버전부터 Lodash와 100% 호환성을 보장해요
>
> `es-toolkit/compat`은 Lodash의 모든 함수에 대해서 똑같이 동작하면서 더 가볍고 빨라요.
>
> - Lodash의 실제 테스트 코드로 동일하게 동작하는 것을 보장해요.
> - Storybook, Recharts, CKEditor 등 유명 오픈소스 라이브러리들이 사용하고 있고, Nuxt에서도 추천하고 있어요.
>
> 모든 호환성 함수들의 자세한 문서는 [호환성 레퍼런스](#)에서 확인할 수 있어요.

```tsx
// es-toolkit/compat은 lodash와 100% 동일한 동작을 제공하도록 목표하고 있다.
import { chunk } from "es-toolkit/compat";

// es-toolkit은 원래 chunk의 size로 0을 지원하지 않는다.
chunk([1, 2, 3, 4], 0);

// es-toolki/compat은 lodash와 같은 []을 반환한다.
```

- `lodash`와 최대 호환성을 위해 `es-toolkit/compat` 라이브러리를 사용한다.
- `es-toolkit`은 매끄러운 마그레이션을 보장, 동작차이가 없는 `es-toolkit/compat`라이브러리를 개발 중.

- `es-toolkit`은 `lodash` 테스트 코드를 이용해 테스트된다.
- 새로운 기능은 `es-toolkit`로 개발해야 한다.

**설계원칙**

> [!TIP] > `es-toolkit/compat` 설계 원칙의 방향성은 변경될 수 있다.

- es-toolkit/compat은 lodash와 100% 동일한 기능을 제공하는 걸 목표로 한다.

1. lodash의 테스트 케이스로 작성된 기능들
2. `@types/lodash`, `@types/lodash-es` 의 타입에 추론할 수 있는 기능
3. `lodash`에서 `es-toolkit`으로 코드를 마이그레이션 하는 동안 생긴 차이점

- 아래와 같은 기능은 `es-toolkit/compat`에 지원되지 안흔ㄴ다.
  1. 임시적 타입 변환: 빈 문자열을 0 또는 false로 변환
  2. 어떤 경우에 특화된 구현: sortedUniq와 같이 정렬된 배열만 받는 함수
  3. JavaScript 내장 객체의 프로토타입이 바뀐 경우에 대응하는 코드
  4. JavaScript Realm에 대응하는 코드
  5. 메서드 체이닝: `\_(arr).map(...).filter(...)와 같은 메서드 체이닝

**구현 상태**

- 해당 공식홈페이지에가서 확인하는 것이 더 정확할것으로 생각된다.

### 2-2. uniqBy

1. 새 프로젝트 시작

- 작은 번들 크기와 빠른 성능 확보
- 최신 JavaScript 생태계 활용

2. 번들 크기 최적화가 중요한 경우

- 모바일 웹 서비스

3. TypeScript 프로젝트

- 내장된 타입 정의 사용
- 타입 안전성 확보

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
