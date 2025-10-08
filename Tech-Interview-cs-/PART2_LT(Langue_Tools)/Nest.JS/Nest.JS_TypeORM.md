# 🌐 NestJS ORM - TypeORM, Sequelize, Prisma, JPA, Eloquent 비교

## 🎯 ORM이란?

**ORM (Object-Relational Mapping)**
개념

- Object(객체)와 Relational Database(관계형 데이터베이스)를 연결(Mapping)하는 기술이다.
- 객체 지향 코드로 데이터베이스를 조작한다.
- SQL을 직접 작성하지 않고 데이터 처리가 가능하다.
  왜?

```
개발자는 객체 지향적으로 생각
데이터베이스는 관계형(테이블)으로 저장

이 둘의 패러다임 불일치를 해결!
```

---

## 🌍 언어별 ORM 생태계

**Node.js 선택의 자유**

- Node.js 자체에 ORM이 내장되어 있지 않는다.
- 여러 외부 라이브러리 중 선택해서 사용한다.
- 프로젝트 상황에 맞게 자유롭게 선택한다.

**주요 ORM**

1. TypeORM - 가장 대중적이고 NestJS에서 많이 사용한다.
2. Sequelize - 전통적으로 가장 오래되었다
3. Prisma - 차세대 ORM

Java

- JPA(Java Persistence API)가 많이 쓰인다.
- Spring에서 기본적으로 사용한다
- Hibernate가 JPA의 대표적으로 구현한다.

모든 Java 개발자가 익숙하다
통일된 사용법과 생태계가 많다.

PHP

- 프레임워크마다 ORM이 다르다
- Laravel: Eloquent (가장 대중적)
- Symfony: Doctrine

프레임워크를 선택하면 ORM도 자동으로 결정한다.
독립적인 ORM 선택 여지가 적다.

---

## 🚀 TypeORM

### 1-1. 기본정보

언어: TypeScript / JavaScript (Node.js) : 객체 지향적, 데코레이터 기반

**주요 특징**

1. 데코레이터 기반

   - Entity 정의가 매우 직관적이다.
   - `@Entity()`, `@Column()` 등 데코레이터를 사용한다.
   - NestJS 완벽한 조화

2. TypeScript 네이티브 지원

   - TypeScript로 설계되었다.
   - 타입의 안전성을 보장한다.
   - 자동완성을 지원한다.

3. Active Record와 Data Mapper 패턴 모두 지원

   - 개발자가 패턴을 선택할 수 있다.
   - 유연한 사용법이 가능하다.

4. 다양한 데이터베이스 지원
   - MySQL, PostgresSQL, SQLite
   - MongoDB, MariaDB
   - Oracle, MS SQL Server

**TypeORM의 장점**
✅ NestJS와 완벽한 통합

✅ TypeScript 친화적

✅ 마이그레이션 자동 생성

**TypeORM의 단점**
❌ 성능 이슈

❌ 문서화 부족

❌ 버그와 유지보수

TypeORM은 NestJS 전용인가?
❌

### 1-2. Pipe - 문지기 검사

- 요청이 가장 처리하는 과정이 Pipe이다.

**Pipe가 하는일**

- Validation: 데이터 형식이 올바른지 검증한다
- Transformation: 데이터 타입을 변환한다.
- 문제가 없으면 통과하고 문제가 있으면 에러르 발생시킨다.

### 1-3. 분기점(통과 혹은 차단)

✅ 통과 (성공)

- 데이터가 규칙을 모두 만족 하는 지
- 핸들러로 깨끗한 데이터를 전달 했는지
- 비즈니스 로직이 실행되었는지

❌ 차단 (실패)

- 데이터가 규칙을 위반하는 경우
- 즉시 에러 응답을 반환한다.
- 핸들러는 실행되지 않는다.

### 1-4. 핸들러 실행 및 응답

- Pipe를 통과한 검증 된 데이터만 핸들러에 도달한다.
- 핸들러는 안전하게 비즈니스 로직을 처리하고 응답을 반환한다.

---

## 🔧 Pipe의 두 가지 핵심 기능

### 2-1. Data Vaildation(데이터 검증)

- 입력 데이터가 정해진 규칙을 지키는 지 확인한다.

검증 예시

- 필수 항목이 비어있지 않은 지
- 문자열 길이가 범위 내인지
- 이메일 형식이 올바른지
- 숫자가 양수인지

동작 방식

- 규칙 만족 -> 데이터 그대로 전달
- 규칙 위반 -> 400 Bad Request 에러 발생

### 2-2. Data Transformation(데이터 변환)

- 입력 데이터를 원하는 형식으로 자동 변환한다.

변환 예시

- 문자열 "123" -> 숫자 123
- 문자열 "true" -> boolean true
- 문자열 "id" -> UUID 객체

동작 방식

```
URL: /posts/123
→ "123" (문자열)이 들어옴
→ ParseIntPipe가 123 (숫자)으로 변환
→ 핸들러는 숫자 타입으로 받음
```

---

## 🎯 Pipe 적용 레벨 (3단계)

### 3-1. Parameter-level (파라미터 레벨)

- 특정 파라미터 하나에만 적용한다.

**특징**

- 가장 세밀한 제어가 가능하다
- 파라미터마다 다른 Pipe 적용이 가능하다
- 필요한 곳에만 선택적으로 사용이 가능하다.

-> 특정 파라미터만 검증이 필요할 때
-> 파라미터마다 다른 변호나 규칙이 필요할 때
예시

```
id는 숫자로 변환하고
title은 문자열 그대로 받고
status는 특별한 검증을 해야 할 때
```

### 3-2. Handler-level (홴들러 레벨)

- 특정 핸들러의 모든 파라미터에 적용한다.

**특징**

- `@UsePipes()` 데코레이터 사용한다.
- 해당 핸들러의 모든 입력 데이터를 검증한다.
- 메서드 단위 적용한다.

-> 특정 API 엔드포인트 전체를 검증할 때
-> DTO(Data Transfer Object) 검증할 때

예시

```
게시글 생성 API에서
title, description, content 모두 검증
→ 핸들러 레벨에 ValidationPipe 적용
```

### 3-3. Global-level (글로벌 레벨)

- 애플리케이션 전체에 적용한다.

**특징**

- `main.ts` 에서 설정한다.
- 모든 컨트롤러, 모든 핸들러에 자동 적용한다.
- 클라이언트의 모든 요청에 동일한 규칙을 적용한다.

-> 전체 애플리케이션에 일관된 검증 규칙이 필요할 때
-> 공통 데이터 변환이 필요할 때

예시

```
모든 API에서 자동으로
- 빈 값 검증
- 타입 변환
- 기본값 설정
```

---

## 🛠️ Built-in Pipes (내장 파이프)

- NestJS가 기본 제공하는 6가지 Pipe이다.

1. ValidationPipe

- 데이터 유효성을 검증 한다.
  - 동작
    - class-validator 데코리에티와 함께 사용한다.
    - DTO 클래스의 규칙 위반 시 자동 에러가 발생한다.
  - 사용 상황
    - 게시글 작성 시 제목, 내용을 필수로 검증한다.
    - 회원가입 시 이메일, 비밀번호 형식 검증한다.

2. ParseIntPipe

- 문자열을 정수로 변환한다.
  - 동작
    - URL 파라미터는 항상 문자열로 들어온다.
    - 자동으로 숫자로 변환한다.
    - 변환 실패 시 400 에러가 생긴다.
  - 사용 상황
    - "123"을 123으로 변환한다.
    - 숫자 타입으로 사용이 가능하다.

3. ParseBoolPipe

- 문자열으로 불린으로 변환한다.
  - 동작
    - "true", "false" -> true, false 변환한다.
    - "1", "0" -> true, false 변환한다.
  - 사용 상황
    - 퀴리 파라미터: ?published=true.
    - true (불린)으로 변환한다.

4. ParseArrayPipe

- 문자열을 배열로 변환한다.
  - 사용 상황
    - 쿼리 파라미터: ?ids=1, 2, 3.
    - [1, 2, 3] 배열로 변환한다.

5. ParseUUIDPipe

- UUID 형식 검증 및 변환한다.
  - 사용상황
    - UUID 형식을 검증한다.
    - 올바른 형식만 통과한다.

6. DefaultValuePipe

- 값이 없을 때 기본값을 설정한다.
  - 사용 상황
    - 쿼리 파라미터 page가 없으면 -> 자동으로 page=1 설정한다.

---

## 예시

### 예시1. 게시글 작성 API

- 요구사항
  - 제목, 내용 필수
  - 제목은 100자 이하
  - 비어있으면 안된다.

Pipe 활용

1. DTO에 `@IsNotEmpty()`, `@MaxLength()` 데코레이터를 작성한다.
2. 핸들러에 `ValidationPipe`를 활용한다.
3. 규칙 위반 시 자동으로 400 에러를 반환한다.

### 예시2. 게시글 조회 API

- 요구사항
  - URL에서 게시글 ID 받기
  - ID는 숫자여야 한다.
  - 숫자가 이니면 에러가 생긴다.

Pipe 활용

1. ID 파라미터에 `ParseIntPipe` 적용
2. "123" -> 123 자동 변환
3. "abc"같은 문자 입력 시 자동 에러가 발생시킨다.

---

## Pipe 적용 우선순위

```
Parameter-level → Handler-level → Global-level
(가장 구체적인 것이 우선)
```

### ValidationPipe 사용 시 필수 설정

- `class-validator` 패키지 설치 필요하다.
- `class-transformer` 패키지 설치가 필요하다.
- DTO 클래스에 데코레이터 작성이 필요하다.

---

## 📋 정리

- Pipe는 NestJS의 데이터 품질 관리자이다.

✅ 핵심 역할

- 데이터 검증 (Validation)
- 데이터 변환 (Transformation)
- 요청 차단 (에러 발생)

✅ 적용 레벨

- Parameter: 파라미터 하나
- Handler: 핸들러 전체
- Global: 애플리케이션 전체

✅ 대표 내장 Pipe

- ValidationPipe: 데이터 검증
- ParseIntPipe: 숫자 변환
- ParseBoolPipe: 불린 변환

✅ 사용 이유

- 안전한 데이터만 비즈니스 로직에 전달
- 핸들러 코드 간결화
- 일관된 검증 규칙 적용
- 자동화된 에러 처리
