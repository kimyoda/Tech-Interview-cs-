# 데이터와 데이터 베이스

### 데이터 (Data)

데이터는 관찰하거나 측정한 사실을 표현한 값이다

- 정형 데이터(Structured Data): 행과 열처럼 구조가 고정된 데이터
- 반정형 데이터(Semi-structured Data): JSON, XML처럼 구조 표시는 있지만 형태가 유연한 데이터
- 비정형 데이터(Unstructured Data): 이미지, 영상, 음성, 자연어 문서 등

### 데이터베이스(Database)

데이터베이스는 관련된 데이터를 일정한 규칙에 따라 저장, 여러 사용자가 안전하고 효율적으로 활용할 수 있도록 구성한 데이터 집합

단순한 파일 저장과 비교하면 다음 기능이 중요하다

| 기능                | 설명                                       |
| ------------------- | ------------------------------------------ |
| 무결성 (Integrity)  | 잘못되거나 모순된 데이터의 저장을 방지한다 |
| 동시성(Concurrency) | 여러 사용자가 동시에 접근할 수 있게 한다   |
| 보안(Security)      | 사용자별 권한을 제어한다                   |
| 복구(Recovery)      | 장애가 발생했을 때 데이터를 복원한다       |
| 질의(Query)         | 필요한 데이터를 조건에 맞게 빠르게 찾는다  |

## DBMS, RDBMS

RDBMS는 데이터를 테이블(Table) 형태로 저장, 테이블 사이의 관계(Relationship)를 키(Key)로 표현하는 DBMS다

- MySQL, PostgreSQL, Oracle Database: 관계형 DBMS
- MongDB: 문서 지향(Document-oriented) NoSQL DBMS

> 모든 RDBMS는 DBMS이나, 모든 DBMS가 RDBMS은 아니다

## 관계형 데이터베이스 기본 구조

다음 `players` 테이블을 기준으로 용어를 보자

|  id | nickname | level | guild   |
| --: | -------- | ----: | ------- |
|   1 | Neo      |    42 | Knights |
|   2 | Mina     |    35 | Mages   |

| 관계형용어              | 일반 표현       | 설명                               |
| ----------------------- | --------------- | ---------------------------------- |
| 릴레이션(Relation)      | 테이블          | 행과 열로 구성된 데이터 집합       |
| 튜플(Tuple)             | 행(Row), 레코드 | 한 대상에 관한 데이터 묶음         |
| 속성(Attribute)         | 열(Column)      | 대상이 가진 하나의 특성            |
| 도메인(Domain)          | 값의 범위       | 한 속성에 들어갈 수 있는 값의 집합 |
| 차수(Degree)            | 열의 개수       | 테이블의 속성 수                   |
| 카디널리티(Cardinality) | 행의 개수       | 테이블의 튜플 수                   |

관계형 모델에서 행의 물리적 순서는 의미가 없다. 결과 순서가 필요하면 `ORDER BY`로 명시해야 한다

## 키(Key)

키는 행을 식별하거나 테이블 사이의 관계를 표현하는 속성

| 키                      | 의미                                           |
| ----------------------- | ---------------------------------------------- |
| 슈퍼키(Super Key)       | 행을 유일하게 식별할 수 있는 속성의 집합       |
| 후보키(Candidate Key)   | 최소성을 만족하는 슈퍼키                       |
| 기본키(Primary Key, PK) | 후보키 중 대표로 선택한 키                     |
| 대체키(Alternate Key)   | 기본키로 선택되지 않은 후보키                  |
| 외래키(Foreign Key, FK) | 다른 테이블의 기본키 또는 고유키를 참조하는 키 |
| 복합키(Composite Key)   | 둘 이상의 열로 구성된 키                       |

기본키는 다음 조건을 만족해야 한다

- 중복될 수 없다
- `NULL`일 수 없다
- 가능한 한 자주 변경되지 않아야 한다

```sql
CREATE TABLE players (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nickname VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE
);
```

## 무결성 제약조건

| 종류          | 의미                                           | 대표 수단                   |
| ------------- | ---------------------------------------------- | --------------------------- |
| 개체 무결성   | 각 행은 유일하게 식별되어야 한다               | `PRIMARY KEY`               |
| 참조 무결성   | 외래키는 참조 가능한 값이어야 한다             | `FOREIGN KEY`               |
| 도메인 무결성 | 열에는 허용된 형식과 범위의 값만 들어가야 한다 | 자료형, `NOT NULL`, `CHECK` |
| 고유성        | 특정 열의 값이 중복되지 않아야 한다            | `UNIQUE`                    |

```sql
CREATE TABLE guilds (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE players (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nickname VARCHAR(50) NOT NULL,
  level INT UNSIGNED NOT NULL DEFAULT 1,
  guild_id BIGINT UNSIGNED NULL,
  CONSTRAINT fk_players_guild
    FOREIGN KEY (guild_id) REFERENCES guilds(id)
);
```

## SQL 역할

SQL(Structured Query Language)은 관계형 데이터베이스와 소통하기 위한 표준 언어

| 분류                              | 목적              | 대표 명령어                            |
| --------------------------------- | ----------------- | -------------------------------------- |
| DDL(Data Definition Language)     | 구조 정의         | `CREATE`, `ALTER`, `DROP`, `TRUNCATE`  |
| DML(Data Manipulation Language)   | 데이터 조회, 변경 | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
| DCL(Data Control Language)        | 권한 제어         | `GRANT`, `REVOKE`                      |
| TCL(Transaction Control Language) | 트랜잭션 제어     | `COMMIT`, `ROLLBACK`, `SAVEPOINT`      |

### 첫번째 조회

```sql
SELECT nickname, level
FROM players
WHERE level >= 30
ORDER BY level DESC;
```

SQL 키워드는 대소문자를 구분하지 않는 경우가 많으나, 가독성을 위해 키워드는 대문자로 작성하는 관례가 있다. 문자열은 작은따옴표로 감싼다

## MySQL, MongDB 개념비교

| 관계형 데티어베이스    | Mong DB                |
| ---------------------- | ---------------------- |
| 데이터베이스(Database) | 데이터베이스(Database) |
| 테이블(Table)          | 컬렉션(Collection)     |
| 행(Row)                | 문서(Documnet)         |
| 열(Column)             | 필드(Field)            |
| 기본키(Primary Key)    | 일반적으로 `_id`       |
| JOIN                   | `$lookup` 또는 조합    |

```js
db.players.insertOne({
  nickname: "Neo",
  level: 42,
  guild: "knights",
});

db.players
  .find({ level: { $gte: 30 } }, { _id: 0, nickname: 1, level: 1 })
  .sort({ level: -1 });
```

MongDB는 스키마가 유연, 데이터 규칙이 필요 없다는 뜻은 아니다. 컬렉션 스키마 검증 등을 통해 일관성을 관리해야 한다

## 정리

- DBMS는 데이터의 저장, 조회, 보안, 복구 등을 관리한다
- RDBMS는 데이터를 테이블로 저장하고 키를 이용해 관계를 표현한다
- 기본키는 행을 식별, 외래키는 테이블 사이의 관계를 표현한다
- 제약조건은 데이터 무결성을 데이터베이스 차원에서 지킨다
- SQL은 구조 정의, 데이터 처리, 권한 및 트랜잭션 제어에 사용된다
- MongoDB는 문서 모델을 사용 관계형 데이터베이스와 용어와 설계 방식이 다르다

## 복습 문제 해설

### 1. DB, DBMS, RDBMS의 차이

#### 문제

DB, DBMS, RDBMS의 차이를 설명하시오.

#### 정답

- **DB(Database)**: 데이터를 체계적으로 저장해 놓은 데이터의 집합
- **DBMS(Database Management System)**: 데이터베이스를 생성, 조회, 수정, 삭제하고 보안, 동시성, 복구 등을 관리하는 소프트웨어
- **RDBMS(Relational Database Management System)**: 데이터를 테이블 형태로 저장하고, 키(Key)를 이용하여 테이블 사이의 관계를 표현하는 관계형 DBMS

```text
DB
└── 실제 데이터가 저장되는 데이터 집합

DBMS
└── DB를 관리하는 소프트웨어

RDBMS
└── 관계형 데이터 모델을 사용하는 DBMS
```

### 2. RDBMS가 데이터를 표현하는 기본 단위

- 테이블(Table), 즉 관계형 모델의 릴레이션(Relation)이다.

```text
Database
   ↓
Table
   ↓
Row
   ↓
Column
```

### 3. 후보키와 기본키의 차이

- 후보키는 행을 유일하게 식별할 수 있으면서 최소성을 만족하는 키이고, 기본키는 후보키 중 대표로 선택된 하나의 키다.

후보키의 중요한 조건

후보키는 두 가지 조건을 만족해야 한다.

1. 유일성(Uniqueness)
   - 각 행을 유일하게 구분할 수 있어야 한다.

2. 최소성(Minimality)
   - 불필요한 속성을 제거해도 식별할 수 있다면 후보키가 될 수 없다.

### 4. 외래키가 보장하는 무결성

- 참조 무결성(Referential Integrity)을 보장한다. 외래키는 다른 테이블에 존재하는 값을 참조하도록 제한한다.

### 5. `CRATE`, `SELECT`, `GRANT`, `ROLLBACK` 각각 분류

- DDL - CREATE
- DML - SELECT
- DCL - GRANT
- TCL - ROLLBACK

```text
CREATE
→ DDL

SELECT
→ DML

GRANT
→ DCL

ROLLBACK
→ TCL
```

### 6. MySQL 테이블, 행, 열에 대응하는 MongDB 용어

```text
Database → Database
Table → Collection
Row → Document
Column → Field
Primary Key → _id
```
