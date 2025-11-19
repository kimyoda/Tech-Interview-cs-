# 🌐 es-toolkit으로 JavaScript 가이드

- es-toolki은 일상적인 개발에서 사용하는 다양한 함수를 모은 유틸리티 라이브러리이다.
- 같은 함수 기준 최대 97% 작은 번들 사이즈 제공, 2~3배 빠른 속도로 동작한다.
- TypeScript 타입을 내장하여 제공, 100% 테스트 커버리지를 목표로 한다.

---

## 1. 소개

### 1-1. 제공하는 기능

- 제공하는 기능 목록
  1. 배열: `uni`나 `difference`와 같이 배열을 다루기 위한 다양한 함수를 제공한다.
  2. 함수: `debounce`나 `throttle`처럼 함수 호출을 다루는 도구를 제공한다.
  3. 숫자: `sum`이나 `round`처럼 숫자를 쉽게 다루는 함수를 제공한다.
  4. 객체: `pick`이나 `omit`처럼 JavaScript 객체를 다루는 함수를 제공한다.
  5. 타입 가드: `isNotNil`처럼 특정한 객체가 어떤 상태인지 검사하는 타입 가드 함수를 제공한다.
  6. Promise: `delay`와 같은 비동기 유틸리티 함수를 제공한다.
  7. 문자열: `snackeCase`같이 문자열을 다루기 위한 다양한 함수를 제공한다.

---

### 1-2. 설치 및 사용

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

---

### 1-3. 번들

- es-toolkit은 현대적인 구현, 다른 라이브러리에 비해 **매우 작은 번들 사이즈**를 가진다.
- es-toolkit은 번들 사이즈를 줄이는 데 효율적이다.

![es-toolkit vs lodash 번들 사이즈 차트](bundle-size.webp)

## 📊 번들 사이즈 비교 상세

| 함수명         | es-toolkit (v1.40.0) | lodash-es (v4.17.21) | 차이 (절감률) |
| :------------- | :------------------- | :------------------- | :------------ |
| **sample**     | 94 bytes             | 4817 bytes           | **-98.0%**    |
| **difference** | 90 bytes             | 7985 bytes           | **-98.8%**    |
| **sum**        | 93 bytes             | 698 bytes            | **-86.6%**    |
| **debounce**   | 531 bytes            | 2873 bytes           | **-81.5%**    |
| **throttle**   | 764 bytes            | 3111 bytes           | **-75.4%**    |
| **pick**       | 132 bytes            | 9520 bytes           | **-98.6%**    |
| **zip**        | 221 bytes            | 3961 bytes           | **-94.4%**    |

**📏 번들 사이즈 측정 방법**

- `esbuild 0.23.0`을 사용, 번들 사이즈를 측정한다. 아래와 같은 코드를 사용한다.

```tsx
import { chunk } from "es-toolkit";

// 또는 import { chunk } from 'lodash-es';

console.log(chunk);
```

### 1-4. 성능

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

### 1-5. Lodash와 호환성

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

---

### 1-6. es-toolkit의 사용이 편한 경우

1. 새 프로젝트 시작

- 작은 번들 크기와 빠른 성능 확보
- 최신 JavaScript 생태계 활용

2. 번들 크기 최적화가 중요한 경우

- 모바일 웹 서비스

3. TypeScript 프로젝트

- 내장된 타입 정의 사용
- 타입 안전성 확보

4. 새 프로젝트 시작

- Node.js 18 이상, Chrome, FireFox, Edge 최신버전

**고려 사항**

- 레거시 브라우저 지원
  - 오래된 모바일 브라우저 지원
- Lodash 특수 기능 의존
  - es-toolkit에 없는 특수 함수의 경우, 마으게리여션 비용이 비용이 큰 레거시 코드 일 경우.
