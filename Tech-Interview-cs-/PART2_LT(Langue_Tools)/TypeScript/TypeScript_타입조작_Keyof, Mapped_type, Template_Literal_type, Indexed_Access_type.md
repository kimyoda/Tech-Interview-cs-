# 🌐 TypeScrpt 타입 조작(keyof, Mapped type, Temlplate Literal Type, Indexed Access Type)

TypeScipr는 강력한 타입 시스템을 통해 코드의 안전성과 가독성을 높여준다.
타입 조작(type manipulation) 기능은 기존 타입을 기반으로 새로운 타입을 동적으로 생성하거나 변형하는데 필수적이다.

- `keyof` 연산자, Mapped Type, Template Literal Type, Indexed Access Type에 대해 소개하고자 하나다.
- 객체, 문자열, 배열 등을 다루는데 자주 사용되고, 제네릭과 결합하여 사용한다.

---

## 1.`keyof` 연산자: 객체 키를 유니온 타입으로 추출

### 1-1. 개념

`keyof` 연산자는 객체 타입에서 모든 프로퍼티 키를 추출해 문자열 리터럴 유니온 타입으로 변환한다. 동적인 키 접근을 타입 안전하게 만들 때 유용하다.
