# 🌐 Lodash 라이브러리 활용 및 예제

- Lodash는 JavaScript의 유틸리티 라이브러리, 배열, 객체, 문자열 등을 다루는 다양한 함수를 제공한다.
- 함수형 프로그래밍 스타일을 지원, 코드의 가독성과 효율성을 높인다.
- Lodash는 Underscore.js를 기반으로 발전한 라이브러리이다.

---

## 1. 설치 및 사용방법

- NPM을 통한 설치: 프로젝트에서 Lodash를 사용하려면 터미널에서 다음 명령어를 실행해야 한다.

```bash
npm install lodash
```

- 특정 모듈만 설치할 수도 있다. `npm install lodash.map`(번들 크기를 줄일 수 있다)

- 임포트 방법:
  - ES Modules:

```js
import _ from "lodash";
```

- CommonJS(Node.js)

```js
const _ = require("lodash");
```

여기서 `_`는 Lodash의 별칭이다.

- Lodash는 네이티브 JavaScript보다 안전하고 일관된 동작을 제공, 엣지 케이스를 처리한다.
- 아래는 사용되는 함수들의 예제이다.

## 2. 주요 함수 예제

1. \_.map(array, iterate)

- 배열이나 객체의 각 요소를 변환하여 새 배열을 반환한다. 네이트 `Array.map()` 보다 정확하고 이름 배열만 필요할 때, 해당 필드만 뽑거나 다른 모양으로 변환할 때 쓰인다.

```js
const users = [
  { user: "barney", age: 36 },
  { user: "fred", age: 40 },
];

// 속기법으로 특정 속성만 추출
const names = _.map(users, "user");
console.log(names); // ['barney', 'fred']

// 함수로 변환
const ages = _.map(users, (u) => u.age + 5);
console.log(ages); // [41, 45]
```

2.\_.filter(collection, predicate)

- 조건을 만족하는 요소만 필터링한 새 배열을 반환한다. 객체 매칭 지원으로 복잡한 조건 처리 용이하고 원본 배열 변경이 없다.

```js
const users = [
  { user: "barney", active: true, age: 36 },
  { user: "fred", active: false, age: 40 },
];

// 객체 매칭으로 필터링
const activeUsers = _.filter(users, { active: true });
console.log(activeUsers); // [{ user: 'barney', ...}]

// 함수로 복잡한 조건
const seniors = _.filter(users, (u) => u.age > 35);
```

3.\_.debounce(func, wait, options)

- 함수 호출을 지연시킨다. 마지막 호출 후 지정 시간(wait)이 지나야 실행된다. 리사이즈, 스크롤, 타이핑 등 빈번한 이벤트에서 성능을 최적화할 수 있다.

```js
// 검색창 자동완성 최적화
const searchAPI = (query) => {
  console.log("API 호출:", query);
};

const debouncedSearch = _.debounce(searchAPI, 300);

// 사용자가 타이핑할 때 마다 호출
// 실제 API는 타이핑을 멈춘 후 300ms 후에만 호출이 가능
searchInput.addEventListener("input", (e) => {
  debouncedSearch(e.target.value);
});
```

4.\_.throttle(func, wait, options)

- 함수를 지정 간격(wait)마다 최대 한번 만 호출한다. 스크롤 핸들러 등 연속 입력에서 호출을 제한한다.

```js
// 스크롤 이벤트 최적화
const updateScrollPostion = () => {
  console.log("현재 위치:", window.scrollY);
};

const throttledScroll = _.throttle(updateScrollPosition, 100);

// 100ms마다 최대 한 번만 실행한다.
window.addEventListener("scroll", thorttledScroll);
```

5.\_.cloneDeep(value)

- 값의 깊은 복사본을 생성한다. 중첩 객체, 배열에서 참조 공유를 방지하고 상태 관리에서 불변성을 유지한다.

```js
const original = {
  user: "John",
  settings: {
    theme: "dark",
    notification: { email: true },
  },
};

const copy = _.cloneDeep(original);
copy.settings.theme = "light";

console.log(original.settings.theme); // 'dark' 원본유지
console.log(copy.settings.theme); // light
```

6.\_.groupBy(collection, iteratee)

- 컬렉션을 그룹화 한다. 데이터 카테고리화 간소화가 편하다.

```js
const products = [
  { name: "Apple", category: "fruit", price: 1.2 },
  { name: "Carrot", category: "vegetable", price: 0.8 },
  { name: "Banana", category: "fruit", price: 0.5 },
];

const grouped = _.groupBy(products, "category");
console.log(grouped);
// {
//   fruit: [{ name: 'Apple', ...}, { name: 'Banana', ...}],
//   vegetable: [{ name: 'Carrot', ...}]
// }

// 숫자로 내림으로 그룹화
const numbers = [6.1, 4.2, 6.3];
const byFloor = _.groupBy(numbers, Math.floor);
// { '4': [4.2], '6': [6.1, 6.3] }
```

-> 해당 함수들은 데이터 조작, 이벤트 핸들링, 성능 최적화에 유용하다. 더 많은 함수는 Lodash 공식 문서에서 확인하길 바란다.

---

## 3. 실제 예시

1. 쇼핑몰 데이터 처리

```js
const orders = [
  {id: 1, customer: 'Alice', amount: 150, status: 'completed'}
  {id: 2, customer: 'Bob', amount: 200, status: 'pending'}
  {id: 3, customer: 'Alice', amount: 80, status: 'completed'}
];

// 고객별로 그룹화
const byCustomer = _.groupBy(orders, 'customer');

// 완료된 주문만 필터링
const completed = _.filter(orders, { status: 'completed'});

// 총 금액 계산
const totalAmount = _.sumBy(completed, 'amount'); // 230
```

2. 유효성 검사 최적화

```js
const validateFomr = (formData) => {
  // 비율이 큰 유효성 검사 로직
  console.log("검사 중...", formData);
};

// 사용자가 입력할 때마다가 아닌, 입력을 멈춘 후에만 검사
const debouncedValidate = _.debounce(validateForm, 500);

formInput.addEventListener("change", (e) => {
  debouncedValidate(e.target.value);
});
```

---

### 4. 대안 라이브러리

1. es-toolkit
   - Lodash보다 더 작은 번들크기
   - ES6+ 활용, 강력한 TypeScript 지원, Lodash와 호환

```js
import { groupBy, debounce } from "es-toolkit";
```

2. Ramada
   - 순수 함수형 프로그래밍 중심
   - 불변성을 강조하고 데이터를 마지막 인자로 받는다.

```js
import R from "remda";

const getActiveUsers = R.filter(R.propEq("active", true));
const users = [{ name: "John", active: true }];
getActiveUsers(users);
```

3. Underscore.js
   - Lodash 기반 라이브러리
   - 가볍지만 Lodash보다 기능과 성능이 약간 떨어진다
   - 최소 기능만 필요한 경우에 사용한다.

---

### 5. 관련 참고 사이트

- [Lodash 공식 위키 (Resources)](https://github.com/lodash/lodash/wiki/Resources): Lodash의 실무 적용 가이드. "Lodash in the Real World" 섹션에서 체이닝, 마이크로-라이브러리 사용 예제. GitHub에서 클론해 참고.

- [You-Dont-Need-Lodash-Underscore](https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore): Lodash 함수를 네이티브 JS로 대체하는 실례 코드. 실제 프로젝트에서 Lodash를 제거한 사례 공유.

- [Using Lodash for fun and profit (PhiLhoSoft Blog)](https://philhosoft.github.io/Programming/Using-Lodash-for-fun-and-profit/): Lodash를 활용한 함수형 코딩 스타일 실례. 일반 목적 함수 예제.

- [Some common use cases of lodash in Node.js (Medium)](https://medium.com/deno-the-complete-reference/some-common-use-cases-of-lodash-in-node-js-cc3a7b6981f5): Node.js에서 10가지 실무 사례 (데이터 그룹화, 디바운스 등).

- [Real-World JavaScript Anti-Patterns (Part Two)](https://blog.javascripting.com/2015/01/12/real-world-javascript-anti-patterns-part-two/): jQuery/Lodash 사용 안티패턴과 최적화 사례.

- [It's time to let go of lodash (JS.dev Blog)](https://thejs.dev/jmitchell/its-time-to-let-go-of-lodash-nqc/): Lodash에서 네이티브 JS로 전환 사례.

- [Lodash: A modern JavaScript Utility library (SudheerJonna Blog)](https://sudheerjonna.com/blog/2017/10/30/lodash-a-modern-javascript-utility-library/): Lodash를 활용한 함수형 패러다임 실례.

---

### 6. Lodash의 단점

- Lodash는 여전히 좋은 라이브러리지만, 현재 기준으로 JavaScript 환경에서 몇 가지 단점이 있다. JS 생태계의 변화에 따라 달라지는 현상이다.

  1. 번들 크기와 성능 오버헤드:

  - Lodash를 임포트하면 앱 번들 크기가 불필요하게 커져 로딩 시간이 길어질 수 있다. React같은 SPA에서는 문제가 될 수 있고, JS자체를 쓰는것보다 무거운 경우가 발생한다.
  - `import { map } from 'lodash-es'를 하여, map 함수와 의준성을 포함해 KB가 추가되어 최근 성능 최적화 면에서는 낭비로 생각될 수있다.

  2. 네이티브 JS 기능으로 대체 가능:

  - Optional Chaining (?.): Lodash의 \_.get(obj, 'a.b.c')은 obj?.a?.b?.c로 거의 완벽하게 대체되었습니다.
  - map, filter, reduce, find: 이젠 네이티브 JS로 쓰는게 더 편하다고 생각한다.
  - ES6+ 이후 JS가 많이 발전하여 네이티브만 사용해도 충분하다는 의견도 있다.

  3. 타입스크립트 친화성 부족:

  - @types/lodash 타입지원은 괜찮나 flow, compose 같은 복잡한 함수형 패턴에서 타입 추론이 아쉬 울 수 있다.

-> 즉, 간단한 작업으로 가능하나 코드가 복잡해지고 학습하는 시간이 오래걸릴 수 있다는 단점이 있다고 생각한다.
