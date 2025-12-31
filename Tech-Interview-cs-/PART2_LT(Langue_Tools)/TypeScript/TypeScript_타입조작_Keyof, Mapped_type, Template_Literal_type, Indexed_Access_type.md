# 🌐 TypeScrpt 타입 조작(keyof, Mapped type, Temlplate Literal Type, Indexed Access Type)

TypeScipr는 강력한 타입 시스템을 통해 코드의 안전성과 가독성을 높여준다.
타입 조작(type manipulation) 기능은 기존 타입을 기반으로 새로운 타입을 동적으로 생성하거나 변형하는데 필수적이다.

- `keyof` 연산자, Mapped Type, Template Literal Type, Indexed Access Type에 대해 소개하고자 하나다.
- 객체, 문자열, 배열 등을 다루는데 자주 사용되고, 제네릭과 결합하여 사용한다.

- `keyof` 연산자: 객체 타입의 키를 유니온 타입으로 추출한다.
- `MappedType`: 객체의 속성을 순회하여 타입을 변형한다.
- `Template Literal Type`: 문자열 리터럴 타입을 조합하여 새로운 패턴을 생성한다.
- `Indexed AccessType`: 타입에서 특정 속성이나 인덱스의 타입을 추출한다.

---

## 1.`keyof` 연산자: 객체 키를 유니온 타입으로 추출

### 1-1. 개념

- `keyof` 연산자는 객체 타입에서 모든 프로퍼티 키를 추출해 문자열 또는 숫자 리터럴 유니온 타입으로 변환한다. 동적인 키 접근을 타입 안전하게 만들 때 유용하다.
- JavaScript에서 객체의 프로퍼티에 동적으로 접근할때(`obj[key]`), TypeScript는 해당 `key`가 실제로 존재하는지 알수 없다. `keyof`를 사용하면 컴파일 타임에 유효한 키만 사용하도록 강제할 수 있다.

- 예시

```ts
interface User {
  id: number;
  name: string;
  email: string;
}

type UserKeys = keyof uSER; // "id" |  "name" | "email"

function getProperty(obj: User, key: UserKeys) {
  return obj[key];
}

const user: User = { id: 1, name: "Kim", email: "kim@example.com" };
const name = getProperty(user, "name"); // string 타입
```

### 1-2. 기본 내용

- 동작 원리: `keyof T`는 타입 T의 public 프로퍼티 키만 추출한다. 클래스의 private/protected 프로퍼티는 포함되지 않는다.
- 숫자/문자 인덱스: 인덱스 시그니처가 있을 경우, `keyof`는 `number` 또는 `string`을 반환한다.
- 유니온 타입과의 조합: `keyof (A & B)`는 교집합 키만 추출한다. `keyof T` 를 `Indexed Access`와 함께 사용하면 `T[keyof T]` 처럼 모든 값 타입의 유니온을 만들 수 있다.
