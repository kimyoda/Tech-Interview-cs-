# 🌐 TypeScrpt 기초개념

## 1.TypeScript란?

### 1-1. TypeScript란?

- **TypeScript**는 Microsoft에서 개발한 JavaScript의 상위집합 언어이다.
- JavaScript에 정적 타입 시스템을 추가해서 컴파일 타임에 오류를 미리 발견할 수 있고, 코드의 가독성과 유지보수성을 크게 향상시킨다.
- JavaScript로 컴파일이 된다.

---

## 2. TypeScript와 JavaScript의 차이점은??

- **JavaScript**: 동적 타입 언어, 런타임에서 타입 오류가 발생한다.
- **TypeScript**: 정적 타입 언어, 컴파일 시점에 타입 오류가 발생한다.
- **타입 안전성**: TypeScript는 변수, 함수, 객체의 타입을 명시적으로 정의한다.
- **편의성**: 자동 완성 기능, 타입 추론이 가능해 개발 생산성을 높이고 유지 보수성을 개선한다.

---

## 3. 기본 타입 시스템

### 2-1. TypeScript 기본 타입들은?

- **원시 타입** : `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`,
- **배열** : `number[]` 또는 `Array<number>`
- **튜플** : `[string, number]` - 고정된 길이와 타입의 배열
- **객체** : `{ name: string; age: number}`
- **함수** : `(x: number, y: number) => number`
- **any** : 모든 타입을 허용(타입 검사 비활성화)
- **unknown** : 타입 안전한 any, 사용 전 타입 검사 필요
- **void** : 반환값이 없는 함수의 반환 타입
- **never** : 절대 발생하지 않는 타입

---

## 4. any와 unknown의 차이점

- **any**는 타입 검사를 완전히 비활성화하여 모든 연산을 허용한다.
- **unknown**은 타입 안전성을 유지하면서 모든 값을 받을 수 있다.
- **unknown** 타입의 값은 사용하기 전 타입 가드나 타입 어설션을 통해 타입을 좁혀야 한다.

---

## 5. 인터페이스와 타입

### 5.1 **Interface**와 **Type**의 차이는?

1. **Interface**

   - 객체의 구조를 정의하는데 특화한다.
   - 선언 병합을 지원한다.
   - extends로 상속이 가능하다.
   - 클래스로 구현이 가능하다.

2. **Type**
   - 더 유연한 타입 정의(유니온, 교집합, 조건부 타입 등)
   - 선언 병합 불가능하다.
   - 원시타입, 유니온 타입 등 모든 타입 별칭이 가능하다.

---

## 6. 선택적 프로퍼티와 읽기 전용 프로퍼티는?

1. **선택적 프로퍼티**: `name?: string` 해당 속성이 없어도 된다.
2. **읽기 전용**: `readonly id: number` 초기화 후 수정 불가능
3. **인덱스 시그니쳐**: `[key: string]: any` 동적키 허용이다.

---

## 7. 제네릭(Generics)

### 7.1 제네릭은?

- 제네릭은 타입을 매개변수처럼 사용할 수 있게 해주는 기능이다.
- 코드의 재사용성을 높이고 타입 안전성을 유지한다.
- <T>와 같은 형태로 사용하고 함수, 클래스, 인터페이스에서 활용이 가능하다.

```ts
// 제네릭 함수
function identity<T>(arg: T) : T {
   return arg;
}

// 제네릭 인터페이스
interace GenericIdentityFn<T> {
   (arg: T): T;
}

// 제네릭 클래스
class GenericNumber<T> {
   zeroValue: T;
   add: (x: T, y: T) => T;
}
```

### 7.2 제네릭 제약조건

- 제네릭 타입 매개변수에 조건을 걸어 특정 속성이나 메서드를 가진 타입만 허용한다.
- `extends` 키워드를 사용하여 구현한다.

```ts
interface Lengthwise {
  length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}
```

---

## 8. 클래스와 상속

- TypeScript 클래스 접근 제한자들

1. pulbic: 기본값, 어디서나 접근 가능
2. private: 같은 클래스 내에서만 가능
3. protected: 같은 클래스와 상속받은 클래스에서 접근가능
4. readonly: 읽기 전용, 생성자에서만 초기화 가능
