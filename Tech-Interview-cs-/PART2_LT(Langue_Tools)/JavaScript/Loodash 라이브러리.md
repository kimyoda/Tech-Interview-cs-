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

2.\_.filter(collection, predicate)

3.\_.debounce(func, wait, options)

4.\_.throttle(func, wait, options)

5.\_.cloneDeep(value)

6.\_.groupBy(collection, iteratee)

---
