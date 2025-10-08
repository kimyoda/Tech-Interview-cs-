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

- 공식 지원이 된다.
- 설정이 간단하다.
- 데코레이터 스타일이 일관성이 있다.

✅ TypeScript 친화적

- 타입 추론이 좋다
- 컴파일 시점에 에러를 발견할 수 있다.

✅ 마이그레이션 자동 생성

- 스키마 변경을 자동으로 추적한다
- 마이그레이션 파일이 자동으로 생성된다.

**TypeORM의 단점**
❌ 성능 이슈

- 복잡한 쿼리에서 느리다.
- N+1 문제가 발생이 가능하다.

❌ 문서화 부족

- 공식 문서가 빈약하다.
- 예시가 부족하다.

❌ 버그와 유지보수

- 이슈 해결이 느리다.

TypeORM은 NestJS 전용인가?

- Express.js 프로젝트
- 순수 Node.js 프로젝트
- React Native에서도 사용 가능하다.

NestJS 연관성

- NestJS가 공식적으로 통합 지원하였다.
- 가장 많이 사용된다.

---

## 📚 Sequelize

언어: JavaScript / TypeScript: ORM, Promise 기반

### 특징

1. 오래 사용했던 Node.js ORM

- 2011년 부터 개발되었다.
- 안정성이 검증되었고 방대한 레퍼런스를 보유했다.

2. JavaScript 네이티브

   - 원래 JavaScrfipt용으로 개발하였다.
   - TypeScript는 나중에 추가로 지원하였다.
   - 타입 정의가 완벽하지 않는다.

3. Model 기반

   - `sequelize.define()` 방식
   - 클래스 문법도 지원하였다.

4. 트랜잭션 관리가 강력하다.
   - 복잡한 트랜잭션 처리가 우수하다.
   - 락 기능을 지원한다.

### Sequelize의 장점

✅ 풍부한 플러그인

- 다양한 확장 기능
- 서드파티 라이브러리가 많다
  ✅ 트랜잭션 처리
- 복잡한 비즈니스 로직에 강하다
- 분산 트랜잭션을 지원한다.

### Sequelize의 단점

❌ TypeScript 지원 부족

- 타입 정의가 불완전하다.
- 자동 완성이 약하다.
- 타입 에러가 자주 발생한다.
  ❌ 구식 문법
- 최신 JavaScript 문법과 맞지 않는다.
- 콜백 지옥으로 이루어질 수 있고, 코드가 장황하다.
  ❌ 성능
- 쿼리 최적화가 어렵다.

---

## ⚡ Prisma

언어: TypeScript / JavaScript: Schema-first

### 주요 특징

1. Schema-first 접근

- `schema.prisma`파일에 모델을 정의한다.
- 자동으로 타입을 생성한다.
- 데이터베이스와 코드를 동기화한다.

2. Prisma Client 자동 생성

- 스키마 기반으로 타입 안전한 클라이언트를 자동 생성한다.
- 100% 타입이 안전하다.
- 자동 완성 기능이 좋다.

3. Prisma Studio

- GUI 데이터베이스 관리 도구다.
- 브라우저에서 데이터 조회 및 수정한다.
- 개발 생산성을 극대화한다.

4. 마이그레이션 시스템

- Git과 유사한 마이그레이션.
- 롤백을 지원한다.
- 비전 관리가 우수하다.

**Prisma의 장점**
✅ 최고의 타입 안정성

- 컴파일 시점에 거의 모든 에러를 발견한다.
- 자동완성이 좋고 리팩토링이 안전한다.

✅ 성능

- 쿼리 취적화가 뛰어나다.
- ORM동작이 엄청 빠르다.

✅ 개발자 경험 (DX)

- 직관적인 API다.
- 학습 곡선이 낮다.
- 디버깅이 쉽다.

**Prisma의 단점**
❌ 러닝 커브

- Schema-first 방식이 생소할 수 있다.
- 기존 ORM과 다른 패러다임이다.
  ❌ Raw SQL 작성 불편
- 복잡한 쿼리는 raw SQL이 필요하다.
- ORM의 장점이 줄어든다.

---

## ☕ JPA (Java Persistence API)

언어: Java, 표준 API, 구현체는 별도다.

### 주요 특징

1. Java 표준 스택

   - JPA는 인터페이스 / 명세일 뿐이다
   - 실제 구현은 Hibernate, EclipseLink 등
   - Hibernate가 사실상 표준 구현체이다.

2. 어노테이션 기반

   - `@Entity`, `@Table`, `@Colun`
   - TypeORM과 매우 유사한 방식이다.
   - Java의 어노테이션을 활용한다.

3. JPQL(Java Persistence Query Language)

   - 객체 지향 쿼리 언어이다.
   - SQL과 유사하나 엔티티 대상이다.
   - 데이터베이스가 독립적이다.

4. 캐싱 시스템
   - 1차 캐시(영속성 컨텍스트)
   - 2차 캐시(애플리케이션 레벨)
   - 성능 최적화가 우수하다.

**JPA의 장점**
✅ 표준화

- 모든 Java 개발자가 사용한다.
- 학습자료가 많다.

✅ 복잡한 관계 처리

- 복잡한 연관관계 매핑이 우수하다.
- OneToMany, ManyToMany 등
- 상속 관계를 지원한다.

✅ 트랜잭션 관리

- Spring과 통합하다.
- 선언적 트랜잭션(`@Transactional`)
- 롤백, 커밋을 자동 관리한다.

**JPA의 단점**
❌ 복잡성

- 학습 곡선이 높다.
- 영속성 컨텍스트를 이해해야 한다.

❌ 성능 튜닝 어려움

- 잘못 사용하면 매우 느리다.
- 쿼리 최적화 경험이 필요하다.
- 내부 동작이 불투명하다.
- 디버깅이 어렵다.

---

## 🐘 Eloquent (Laravel)

언어: PHP(Laravel)

### 주요 특징

1. Active Record 패턴

   - 모델이 직접 데이터베이스를 조작한다.
   - `$user->save()` 처럼 직관적이다.
   - 객체와 테이블이 1:1 매핑이다.

2. Eloquent Relationships

   - 관계 정의가 매우 쉽다.
   - `hasMany`, `belongsTo` 등.
   - 메서드 체이닝으로 조회한다.

3. Laravel 생태계와 통합

   - Artisan CLI로 모델을 생성한다.
   - 마이그레이션을 자동 생성한다.
   - Seeder, Factory 통합.

4. 컬렉션 API
   - `map`, `filter`, `reduce` 등.
   - 함수형 프로그래밍 스타일이다.

**Eloquent의 장점**
✅ 직관성

- 가장 배우기 쉬운 ORM
- 문법이 자연스럽고 초보자들도 쉽게 이용할 수 있다.

✅ Laravel과 완벽한 통합

- 프레임워크에 적합하다.
- 설정이 거의 없고 모든 기능이 잘 연동된다.

✅ 컬렉션 API

- 데이터 조작이 편하고 체이닝이 좋다.
- 코드 가독성이 좋다.

**단점**
❌ Laravel 종속

- Laravel 없이 사용이 불가능 하다.
- 프레임워크를 강제로 결합한다.

❌ 성능

- 대용량 데이터 처리에 약하다.
- 복잡한 쿼리에 비효율적이다.

❌ 타입 안정성 부족

- 런타임 에러 가능성이 높다.

---
