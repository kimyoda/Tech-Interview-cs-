## 2. ORM이란?

### 📌 ORM(Object-Relational Mapping)이란?

- ORM은 객체 지향 프로그래밍 언어와 관계형 데이터 베이스 사이의 데이터를 변환해주는 기술이다.

- ORM이 필요한 이유

  - 객체와 테이블의 패러다임 불일치를 해결한다. 객체지향 프로그래밍과 데이터베이스는 데이터를 다루는 방식이 다르다.
  - 생산성향상: SQL 쿼리를 직접 작성안하고 객체 메소드로 데이터를 다룬다.
  - 유지보수가 용이하다.
  - 데이터베이스 독립성: 특정 DB에 종속되지 않는다.

- ORM의 단점
  - 성능이슈: 복잡한 쿼리에서는 성능이 떨어진다.
  - 복잡한 쿼리 작성 어려움: 통계, 집계 등 복잡한 쿼리는 복잡하고 심도 깊은 quey문이 필요하다.

---

### 🌍 언어별 주요 ORM

**Node.js(TypeScript, JavaScript)**

1. TypeORM

2. Sequelize

3. Prisma

**JPA(Java Persistence API) + hIBERNATE**

**PHP(Laravel-EloquentORM)**

---
