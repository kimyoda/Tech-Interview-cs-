# 🌐 ES2015부터 ES2025까지 주요 문법 변화와 가이드

- ES2015(ES6)부터 2025년판 매년 어떤 기능이 추가되었는 지 정리, 실무에서 주목해야할 문법과 공부할만한 내용을 작성하였다.
- Node.js나 브라우저 환경의 성능과 생산성을 높일 수 있다.

---

## 1. ES2015(ES6) - 자바스크립트 기초

- ES02015는 자바스크립트 역사에서 큰 변화를 가져 왔다.
- 변수 스코프, 클래스, 모듈 등 많은 기능이 추가되었다.
- ES6 신기능의 경우 다음과 같다.
- 화살표 함수, 클래스, 향상된 객체 리터럴, 템플릿 문자열, 구조 분해 할당, 기본값,rest,spread 파라미터, `let`과 `const`, iterator/`for...of`, 제네레이터, 유니코드, 모듈, `Map/Set` 및 WeakMap/WeakSet, Proxy, Symbol, 서브클래싱 가능한 내장 객체, 프로미스, 각종 Math/Number/String/Array/Object API, 이진,8진 리터럴, Reflect API, 꼬리호출 등이 있다.

### 1.1 블록 스코프 변수 - `let`과 `const`

- 기존 var 함수 스코프였지만 ES6부터 블록 스코프를 갖는 `let`과 재할당이 불가능한 `const`를 사용할 수 있다.
- `const`는 객체의 참조를 보호, 내부 속성은 변경될 수 있다.
- 기본적으로 `const`를 사용하고, 값이 변경될 때에는 `let`을 사용해 의도를 명확히 하는것이 권장된다.

### 1.2 화살표 함수와 `this`바인딩

- 화살표 함수는 짧은 함수 표현식을 제공, 주변 컨텍스트의 `this`를 캡쳐한다.
- 콜백을 사용할 때 더 이상 `var self = this`나 `.bind(this)`를 작성할 필요가 없고, 배열 메서드와 조합해 가독성이 향상된다.
- 화살표 함수는 `new`로 호출하거나 protototype 메서드로 사용하는 데 적합하지 않아 상황에 맞게 전통적인 함수 선언과 구분해야 한다.

### 1.3 템플릿 리터럴과 멀티라인 문자열

- 백틱`(\``)으로 감싸는 템플릿 리터럴은 문자열 내에서`${expression}` 구문으로 변수, 표현식을 삽입할 수 있게 한다.
- 여러 줄 문자열과 HTML 템플릿을 다루기 편리하고, 태그드 탬플릿(tagged templates)을 활용하여 SQL 인젝션이나 HTML escape를 만들수도 있다.

### 1.4 구조 분해 할당, spread/rest 연산자

- 구조 분해 할당(destructuring)은 배열이나 객체의 값을 변수로 쉽게 추출한다.
- 복잡한 중첩 객체에서 필요한 값만 뽑아 쓰고, 함수 매개변수에서 선택적 속성을 처리할 때 유용하다.
- `...` 연산자는 나머지(rest) 파라미터를 배열로 묶고, 배열/객체의 요소를 펼치는(spread)데 사용된다.
- 예를들어 `function sum(...nums) { return nums.reduce((a, b) => a + b); }`처럼 가변 인자를 받을 수 있다.

### 1.5 클래스와 모듈 시스템

- ES6 클래스는 프로토타입 기반 객체 지향을 문법적으로 감싸 가독성을 높인다.
- `constructor`와 `super` 호출을 지원, 정적 메서드, 접근자를 정의할 수 있다.
- 내부적으로 여전히 프로토타입 체인을 사용, 클래스로 작성된 코드와 기존 프로토타입 기반 코드가 함께 동작한다.
- 모듈 시스템(`import`/`export`)은 파일 단위로 코드를 분리, 의존성을 명시적으로 관리하는데 필수적이다.
- Node.js 환경에서 CommonJS(`require`)가 오래 사용됐지만, 최신 Node.js에서 ES모듈을 안정적으로 지원, `type: "module"` 설정을 통해 통일된 모듈 구문을 사용할 수 있다.

### 1.6 프라미스와 비동기 프로그래밍 기반 마련

- 프로미스(Promise)는 비동기 작업의 완료나 실패를 표현하는 객체, 콜백 지옥을 해결하는 기반을 제공한다.
- ES6 프로미스 이후 `async`/`await` 문법(ES2017)과 `Promise.finally()`(ES2018) 등이 추가되며 더욱 기능이 개선되었다.

## 2. ES2016~ES2019 - 점진적 개선과 편의 기능

- ES6 이후 ECMAScript는 작은 기능들을 발표했다. 2016~2019 사이 추가된 기능들을 확인

### 2.1 ES2016: includes와 거듭제곱 연산자

- ES2016은 두 개의 소규모 기능만 포함한다.
- 배열에 특정 값이 존재하는지 확인하는 `Array.prototype.includes()`와 제곱을 계산하는 **거듭제곱 연산자 `**`\*\*이다.
- `includes()`는 `indexOf()`보다 명확하고 `NaN` 비교도 지원한다.

### 2.2 ES2017: async/await, 객체, 문자열 편의 메서드

- `async` 함수와 `await` 키워드는 프로미스 기반 비동기 코드를 동기식으로 작성할 수 있게 한다.
- MDN에서 `async function`이 프로미스 기반 비동기 동작을 더 깔끔하게 작성할 수 있게 한다고 설명, `await`를 통해 명시적으로 프로미스 체인을 구성할 필요가 없다고 한다.
- 또한 `Object.values()`/`Object.entries()`, 문자열 패딩(`padStart`/`padEnd`), `Object.getOwnPropertyDescriptors()`등이 추가되어 객체 처리와 문자열 조작이 편해졌다.
- `SharedArrayBuffer`와 `Atomics`는 웹 워커, 노드 워커 간 메모리를 공유하는 기능, 병렬 처리를 지원한다.

### 2.3 ES2018: 비동기 반복, `Promise.finally()`, Rest/Spread 객체, 정규식 개선

- 비동기 반복(Async iteration)을 통해 `for await ... of` 문으로 비동기 이터러블을 순회할 수 있다.
- 데이터 스트림이나 네트워크 요청을 순차적으로 처리할 때 유용하다.
- `Promise.prototype.finally()`는 성공 여부와 관계없이 동일한 후 처리를 실행할 수 있게 해준다.
- 객체에서도 rest/spared 문법이 가능하고, 정규식에 lookbehind assertions, named capture groups, dotAll 플래그 등 기능이 도입되었다.

### 2.4 ES2019: flat/flatMap, trim, fromEntries, 안정 정렬

- `Array.prototype.flat()`과 `flatMap()`은 중첩된 배열을 평탄화하거나 map 후 평탄화를 동시에 수행한다.
- `Object.fromEntries()`는 key-value 쌍의 배열을 객체로 변환하고, 반대로 `Object.entries()`와 함께 유용하다.
- `String.prototoype.trimStart()`/`trimEnd()`은 좌/우 공백을 쉽게 제거한다.
- 정렬 안정성(stable sort)이 명시되어 V8 엔진 등 구현체에서 일관된 결과를 제공한다.

---

## 3. ES2020 ~ ES2023

### 3.1 ES2020: BigInt, dynamic import, 옵셔널 체이닝 등

- `BigInt`는 임의 정밀도의 정수를 표현하는 타입, `123n`처럼 숫자 뒤에 `n`을 붙여 선언한다.
- **동적 import(`import()`)**와 `import.meta`로 조건부 모듈 로딩과 모듈 메타 정보를 얻을 수 있다.
- **옵셔널 체이닝(`?.`)**과 **Null 병합 연산자(`??`)**는 안전하게 깊은 속성을 접근하거나 기본값을 제공하는데 유용하다.
- `Promise.allSettled()`, `globalThis`, `String.matchAll()`, 네임스페이스 재수출 등도 실무에서 자주 사용된다.

### 3.2 ES2021: 논리 할당, replaceAll, Promise.any, WeakRef

- ES2021에서 `x ||= y`, `x &&= y`와 같은 논리 할당 연산자가 도입돼 값이 없을때만 할당하는 패턴을 간결하게 표현한다.
- 문자열에서 모든 일치 항목을 교체하는 `String.prototype.replaceAll()`이 추가 되었다.
- `Promise.any()`은 여러 프라미스 중 가장 먼저 이행된 값만 반환한다.
- `WeakRef`와 `FinalizationRegistry`는 가비지 컬렉션 후 후처리를 수행할 수 있게 해 메모리 관리 도구를 제공한다.

### 3.3 ES2022: 클래스 필드, 프라이빗 슬롯, top-level await

- ES2022는 클래스 문법을 대폭 확장했다. 공개, 비공개 필드와 정적 필드, 비공개 메서드, 정적 초기화 블록 등을 지원해 명시적인 캡슐화를 가능하개 한다.
- `#privateSlot in obj` 문법으로 프라이빗 필드 존재 여부를 확인할 수 있다.
- `Object.hasOwn()`을 통해 객체 자신의 프로퍼티 여부를 안전하게 확인할 수 있다.
- Node.js 14 이상에서 모듈의 top-level await도 지원되어 모듈 스코프에서 `await`를 사용할 수 있다.

### 3.4 ES2023: 비파괴적 배열 메서드, `findLast`/`findLastIndex`, WeakMap 키, 헤시뱅

- ES2023은 불변 데이터 패턴을 지원하는 비파괴적 배열 메서드를 제공한다.
- `toReversed()`, `toSorted()`, `toSpliced()`, `.with()`메서드는 원본 배열을 수정하지 않고 새로운 배열을 반환한다.
- `findLast()`와 `findLastIndex()`로 배열을 뒤에서부터 탐색할 수 있다.
- 심볼을 `WeakMap`의 키로 사용할 수 있게 되었다.
- Node.js 스크립트 실행 시 사용하던 "해시뱅(`#!/user/bin/env mode`)"문법도 표준화되었다.

---

## 4. ES2024 ~ ES2025 - 그룹화, Iterator helpers, 세트 연산 등

### 4.1 ES2025: groupBy와 v플래그

- 2024년 ECMAScript는 데이터 그룹화와 정규식 확장이 주요했다.
- **`Object.groupBy()`와 `Map.groupBy()`**는 배열이나 iterable을 주어진 함수의 반환값에 따라 그룹화한다.
- 사용자 목록을 역할별로 그룹화하거나 학생 점수를 등급별로 묶는 등의 작업을 쉽게 처리할 수 있다.
- **`Promise.withResolvers()`**는 외부에서 resolve/reject 함수를 제어할 수 있는 프로미스를 생성한다.
- 정규식 v 플래그는 유니코드 집합과 세트 연산을 지원하여 문자 클래스를 더 유연하게 표현할 수 있고 문자열의 유효성을 확인, 보정하는 `String.isWellFormed()`/`String.toWellFormed()`메서드도 도입되었다.

### 4.2 ES2025: Import attributes, lterator helpers, Set 연산, RegExp escape

- ES2025는 모듈과 컬렉션 처리에 큰 변화를 가져올 예정이다. Import attributes는 JSON 등 비자바스크립트 모듈을 가져올 때 `import data from './data.json' with { type: 'json' };` 처럼 타입을 명시할 수 있다.
- 내장 Iterator helper methods(`filter()`, `map()`, `flatMap()`, `take()`, `drop()`, `toArray()` 등)는 이터러블 데이터를 배열처럼 변환없이 처리할 수 있어, 대용량 데이터나 스트림 처리에서 유용하다.
- `Set`에는 집합 연산 메서드(`union`, `intersection`, `difference`, `symmetricDifference`, `isSubsetOf`, `isSupersetOf`)가 추가되어 수학적 집합 연산을 직접 수행할 수 있다.
- `RegExp.escape()`와 중복 캡쳐 그룹, 인라인 플래그를 지원, `Promise.try()`와 16비트 부동소수타입도 포함된다.
