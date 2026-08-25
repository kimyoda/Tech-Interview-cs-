# SQL 스터디*1~2장*데이터, 데이터베이스, DBMS, 관계형 데이터베이스

---

## 데이터, 데이터베이스, DBMS

SQL을 치기 전 '데이터가 뭔지', 데이터베이스와 DBMS가 어떻게 다른지 인지하는 것이다.

### 데이터란?

`데이터(data)`와 `정보(information)`은 흔히 같은 말처럼 쓰지만 다른 개념이다.

- **데이터**: 가공되지 않은 순수한 사실이나 값 그 자체다. 예를들어 `1994`, `서울`, `홍길동` 같은 날개의 값
- **정보**: 데이터를 목적에 맞게 가공하고 해석해서 의미를 부여한 결과물이다. `홍길동`, `1994`, `서울` 세 값을 묶어서 "홍길동 님은 1994년 생이고 서울에 거주한다"로 정리하고 그때부터 정보가 된다.

```
데이터(가공전)
홍길동, 1994, 서울
->
정보 (가공 후)
홍길동 님은 1994년생이며 서울에 거주하고 있다.
```

> DB에 쌓인 로그 테이블 그 자체는 '데이터'일 뿐이고, 그걸 집계,가공해서 대시보드나 랭킹으로 보여줄 때 비로소 '정보'가 된다. 원시 플레이 로그를 의미있는 랭킹,달성률로 바꾸는 작업이있다.

### 데이터베이스와 DBMS

`데이터베이스(DB)`와 `DBMS`도 자주 혼용되나 역할이 다르다.

- **데이터베이스(Database)**: 데이터가 실제로 저장되어 있는 공간, 즉 데이터의 집합 그 자체
- **DBMS(Database Management System)**: 데이터베이스를 관리해주는 소프트웨어. 데이터를 저장,조회,수정,삭제하고, 여러 사용자가 동시에 접근해도 문제가 없도록 제어하는 역할을 한다.
  즉, DB는 창고, DBMS는 창고를 관리하는 시스템에 가깝다. 오라클, MySQL이 DBMS다.

```
서버 애플리케이션 (SQL 요청) -> DBMS(관리 소프트웨어, 오라클, MySQL, PostgreSQL 등) -> Database -> 실제 데이터가 저장된 공간
```

NestJS 아키텍처에 그대로 적용하면 이렇게 대응된다.

```
Controller -> Service -> Respository(TypeORM) -> DBMS(MySQL 등) -> Database
```

> TypeORM에서 `DataSource`를 설정할 때 `type: mysql`이라고 지정하는 한 줄이 바로 어떤 DBMS를 정하는 부분이다. type만 바꾸면 DBMS가 교체된다.

---

## 관계형 데이터베이스란

DBMS는 데이터를 저장하는 방식에 따라 여러 종류로 나뉜다. 데이터를 테이블(표) 형태로 저장, 테이블 간의 '관계'를 이용해 데이터를 다루는 방식을 관계형 데이터 베이스(RDB)라고 부른다. 우리가 흔히 쓰는 오라클, MySQL, PostgreSQL 등이 RDB 계열이다.

### 관계형 데이터베이스 개념과 특징

RDB를 RDB답게 만드는 특징은 크게 네 가지이다.

1. 테이블: 데이터를 담는 그릇
2. 관계: 테이블끼리 이어주는 것
3. 키: 로우를 유일하게 식별하는
4. 트랜잭션: 변경작업의 정합성을 지켜주는 것

#### 데이터 저장소인 테이블

테이블은 결국 우리가 흔히 아는 표다. 가로 방향을 로우(row), 세로 방향을 컴럼(column)이라고 부르고, 컬럼 하나하나는 데이터의 속성(attritbute)를 의미한다

| emp_id | emp_name | gender |
| ------ | -------- | ------ |
| 1      | 홍길동   | M      |
| 2      | 김유신   | F      |

> "열/행" 대신 "컬럼/로우"라는 용어가 실무에서 많이 쓰인다. 스키마 설계 회의에서 이 컬럼은 왜있는지 물어보는 편이다.

#### 관계 맺기

RDB의 핵심은 하나의 거대한 테이블에 모든 데이터를 우겨넣는게 아닌, 데이터 성격에 맞춰 여러 개의 테이블로 쪼갠 다음, 테이블 사이를 연결하는 컬럼(주로 다른 테이블의 기본 키를 가리키는 값)을 두어 서로 관계를 맺는다는 데 있다.

```
 회원정보 테이블                     주소 테이블
┌─────┬────────┬──────────┐        ┌─────┬─────────────────┐
│ id  │ name   │ addr_id  │──────▶│ id  │ address          │
├─────┼────────┼──────────┤        ├─────┼─────────────────┤
│ 1   │ 홍길동   │ 10       │        │ 10  │ 서울시 중구 XX동    │
│ 2   │ 김유신   │ 10       │        │ 11  │ 부산시 해운대구 YY동 │
└─────┴────────┴──────────┘        └─────┴─────────────────┘
     (addr_id가 연결고리 컬럼 = 외래 키)
```

이렇게 어떤 테이블을 몇 개로 나누고 어떻게 관계를 맺을 지 설계하는 작업을 데이터베이스 모델링이라고 하고, 정답이 정해져 있다기보다 시스템 성격에 따라 매번 다르게 설계해야 하는 것이다. NestJS + TypeORM에서 관계가 데코레이터로 표현된다.

```ts
@Entity("address")
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;
}

@Entity("memeber")
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // 회원정보 테이블의 addr_id 컬럼 = 주소 테이블과의 관계
  @ManyToOne(() => Address)
  @JoinColumn({ name: "addr_id" })
  address: Address;
}
```

> 유저 테이블, 플레이 기록 테이블, 랭킹 테이블을 나눠 `user_id`라는 연결고리 컬럼으로 관계를 매ㅑㅈ는다. 하나의 테이블에 모든 컬럼을 몰아넣고 싶을 수 있으나, 데이터 중복과 정합성 문제가 생겨 테이블을 나누는것이 중요하다.

#### 키(Key) 컬럼

같은 이름을 가진 사람이 여러 명 있을 수 있듯, 테이블에도 겉보기엔 비슷한 로우가 여러 개 있을 수 있다. 이떄 특정 로우 하나를 정확히 집어낼 수 있게 해주는, 테이블 전체에서 값이 겹치지 않는(unique) 컬럼을 기본 키(Primary Key)라고 부른다.
이런 특성 때문에 키 컬럼에 보통 일련번호 형태의 숫자를 많이 사용한다.

| RDBMS           | 키 값 자동 생성 방식               | TypeORM 대응                |
| --------------- | ---------------------------------- | --------------------------- |
| Oracle          | SEQUENCE 객체를 별도로 만들어 사용 | -                           |
| MySQL / MariaDB | AUTO_INCREMENT 속성                | `@PrimaryGeneratedColumn()` |
| PostgreSQL      | SERIAL / SEQUENCE                  | `@PrimaryGeneratedColumn()` |

> Oracle은 시퀀스라는 별도 객체로 키 값을 채번하고, MySQL은 컬럼 속성(AUTO_INCREMENT) 하나로 끝난다. TypeORM을 쓰면 `@PrimaryGeneratedColumn()` 데코레이터 하나로 이 차이를 신경 쓸 필요 없이 추상화해준다.

### TRUNCATE TABLE, DELETE

같은 테이블 데이터 지우기처럼 보이지만, TRUNCATE TABEL은 DDL, DELETE는 DML이다

| 구분          | TRUNCATE TABLE     | DELETE                       |
| ------------- | ------------------ | ---------------------------- |
| 분류          | DDL                | DML                          |
| 조건절(WHERE) | 불가 - 전체 삭제만 | 가능 - 원하는 행만 선별 삭제 |
| 되돌리기      | 불가능(즉시 확정)  | 가능(ROLLBACK으로 복원 가능) |
| 속도          | 빠름               | TRUNCATE보다 느림            |

```sql
-- TRUNCATE: 전체를 날리고 되돌릴 수 없다
TRUNCATE TABLE emp03;

-- DELETE: 조건을 걸 수 있고, 실수해도 ROLLBACK으로 구제 가능
DELETE FROM emp03 WHERE emp_id = 1001;
```

> 운영 DB에서 TRUNCATE는 신중하게 사용해야 한다. 보통 조건절이 있는 DELETE + Artisan/스케줄러 잡으로 처리한다.

---

## TCL - COMMIT, ROLLBACK, 트랜잭션

INSERT, UPDATE, DELETE, MERGE로 데이터를 바꿔도 그 자체로 DB에 확정되는 건 아니다. COMMIT을 실행해야 최종 반영, 실수했으면 COMMIT 전까지 ROLLBACK으로 되돌리 수 있다.

```sql
BEGIN; -- 트랜잭션 시작 (RDBMS마다 표기가 다르다)

UPDATE emp03 SET age = 30 WHERE emp_id = 1001;
DELETE FROM emp03 WHERE emp_id = 9999;

-- 여기까지 문제가 없으면
COMMIT;

-- 문제가 생긴다면
-- ROLLBACK;
```

NestJS + TypeORM에서 해당 개념이 `transaction()` 블록으로 그대로 대응된다

```ts
// TCL(COMMIT/ROLLBACK)을 TypeORM 트랜잭션으로 표현
await this.dataSource.transaction(async (manager) => {
  await manager.update(Emp, { empId: 1001 }, { age: 30 });
  await manager.delete(Emp, { empId: 9999 });

  // 콜백이 정상 종료되면 자동으로 COMMIT
  // 콜백 내부에서 예외가 던져지면 자동으로 ROLLBACK
});
```

> 점수 계산 로직처럼 여러 테이블을 동시에 건드리면 중간에 하나라도 실패하면 전부 무효화되어야 하는 케이스다. 랭킹갱신 + 유저 재화 차감을 한 트랜잭션으로 묶지 않으면, 재화는 깍였는데 랭킹은 안 올라가는 정합성이 깨질수도 있다. Redis 분산 락은 동시성 제어를 담당, DB 트랜잭션은 원자성 보장을 담당하는걸 구분

---

## DCL - 평소에 잘 쓰진 않지만 알아야 하는것

DCL은 사용자(user)에게 권한을 주거나(GRANT) 회수하는(REVOKE) 명령어다.

```sql
-- game_admin 계정에게 emp03 테이블 조회/입력 권한 부여
GRANT SELECT, INSERT ON emp03 TO game_admin;

-- 권한 회수
REVOKE INSERT ON emp03 FROM game_admin;
```

| 명령어 | 역할                               |
| ------ | ---------------------------------- |
| GRANT  | 객체(테이블 등)에 대한 권한을 부여 |
| REVOKE | 부여된 권한을 회수                 |

DCL을 쓰려면 먼저 RDBMS에 사용자 계정이 생성, 그 계정으로 로그인. DBA나 인프라 담당자가 계정/권한을 세팅하는 부분

> QA 환경/운영 환경별로 DB 계정 권한이 다르게 세팅되어 있는 부분에서 확인할 수 있다. DCL로 세팅된 DB 계정 권한을 확인해봐야한다.

---

## 테이블 생성 확인

### 기본 구문

```sql
CRATE TABLE table_name (
   column_name1 datatype [NOT] NULL,
   column_name2 datatype [NOT] NULL,
   ...
   PRIMARY KEY ( column_list )
);
```

- `table_name`: 테이블 이름
- `column_name`: 컬럼 이름
- `datatype`: 컬럼이 담을 데이터의 유ㅜ형
- `[NOT] NULL`: 값이 없어도 되는 지 여부 (생략하면 기본값은 NULL 허용)

이 SQL 문과 NestJS TypeORM의 Entity는 사실 같은 걸 표현한다

```ts
// CREATE TABLE과 대응되는 TypeORM Entitiy
@Entity("emp03")
export class Emp {
  @primaryColumn({ name: "emp_id", type: "int" })
  empId: number;

  @Column({ name: "emp_name", type: "varchar", length: 100, nullable: false })
  empName: string;

  @Column({ type: "varchar", length: 10, nullable: true })
  gender: string;

  @Column({ type: "int", nullable: true })
  age: number;
}
```

### 컬럼 데이터형

| 분류           | Oracle                      | MySQL                            | TypeORM 컬럼 타입             | 비고                                                 |
| -------------- | --------------------------- | -------------------------------- | ----------------------------- | ---------------------------------------------------- |
| 고정 길이 문자 | `CHAR(n)` 최대 2000byte     | `CHAR(n)`                        | `type: 'char', length: n`     | 짧고 길이가 일정한 코드값에 적합                     |
| 가변 길이 문자 | `VARCHAR2(n)` 최대 4000byte | `VARCHAR(n)`                     | `type: 'varchar', length: n`  | 오라클만 VARCHAR2, MySQL VARCHAR                     |
| 숫자           | `NUMBER(p, s)`              | `INT`, `DECIMAL(p, s)`, `BIGINT` | `type: 'int'`, `'decimal'` 등 | Orcal은 정수/소수를 NUMBER 통일, MySQL은 세분화      |
| 날짜/시간      | `DATE` (년~초 까지 포함)    | `DATE`, `DATETIME`, `TIMESTAMP`  | `type: 'date'`, `'datetime'`  | MySQL은 날짜 전용(DATE)과 날짜+시간(DATETIME)이 분리 |

> Orcale / MySQL VARCHAR 차이 및 NUMBER 사용 차이 유의

### NULL과 NOT NULL

- `NULL`: 값이 없어도 된다는 의미. 아무것도 명시하지 않으면 기본적으로 NULL 허용으로 처리된다.
- `NOT NULL`: 값이 반드시 있어야 한다는 의미. 값 없이 입력을 시도하면 에러가 나고 입력은 취소된다.

TypeORM에서 `@Column()` 데코레이터의 `nullable` 옵션이 같다.

```ts
@Column( {nullable: false }) // NOT NULL
empName: string;

@Column({ nullable: true }) // NULL 허용 (기본값)
etc: string;
```

### 기본키 (Primary Key)

기본 키는 테이블에 각 행을 유일하게 식별하는 컬럼, 테이블당 딱 1개만 지정할 수 있다. 컬럼 1개로 만들 수도 있고, 여러 컬럼을 묶어 복합키로 만들 수도 있다.

```sql
-- 단일 컬럼을 기본 키로 지정하는 두 가지 방법

-- 방법 1: 컬럼 정의 시 바로 지정
emp_id NUMBER NOT NULL PRIMARY KEY,

-- 방법 2: 모든 컬럼 정의 후 마지막에 지정 (복합키도 해당 방식)
PRIMARY KEY ( emp_id )
```

기본 키 컬럼에는 반드시 NOT NULL이 붙어야 하고, 중복된 값을 넣으면 에러가 난다. 또한 기본 키를 생성하면 RDBMS가 자동으로 해당 컬럼에 유일(unique) 인덱스를 만들어준다

```ts
// TypeORM에서 기본 키
@PrimaryColumn() // 값을 직접 넣는 기본 키
empId: number;

@PrimaryGeneratedColumn() // 자동 증가하는 기본 키 (AUTO_INCREMENT 대응)
id: number;
```

> 유저별 일일 데이터가 쌓이는 테이블은 `(user_id, play_date)` 같은 복합 키를 자주 쓴다. 기본 키는 1개 컬럼은 기본 키 제약조건은 테이블당 1개, 컬럼 개수가 1개라는 뜻이 아니다.

---

## 적용 - 사원정보 테이블

| 컬럼명    | 설명     | 데이터형(Oracle) | 데이터형(MySQL) | NULL 여부 | 기본 키 |
| --------- | -------- | ---------------- | --------------- | --------- | ------- | --- |
| emp_id    | 사원번호 | NUMBER           | INT             | NOT NULL  | Y       |     |
| emp_name  | 사원명   | VARCHAR2(100)    | VARCHAR(100)    | NOT NULL  |         |
| gender    | 성별     | VARCHAR2(10)     | VARCHAR(10)     | NULL      |         |
| age       | 나이     | NUMBER           | INT             | NULL      |         |
| hire_date | 입사일자 | DATE             | DATE            | NULL      |         |
| etc       | 기타     | VARCHAR2(300)    | VARCHAR(300)    | NULL      |         |

`emp_id`는 기본 키이기 NOT NULL, `emp_name`은 기본 키는 아니지만 이름 없는 사원은 없기에 NOT NULL로 정의
위와 같은 판단은 테이블을 설계하는 사람이 담당하여 작업하면 된다.

```sql
-- MySQL 기준 DDL
CREATE TABLE emp03 (
   emp_id INT NOT NULL,
   emp_name VARCHAR(100) NOT NULL,
   gender VARCHAR(10) NULL,
   age INT NULL,
   hire_date DATE NULL,
   etc VARCHAR(300) NULL,
   PRIMARY KEY (emp_id)
);
```

```ts
// 동일한 구조 NestJS TypeORM Entity
@Entity("emp03")
export class Emp {
  @PrimaryColumn({ name: "emp_id", type: "int" })
  empId: number;

  @Column({ name: "emp_name", type: "varchar", length: 100, nullable: false })
  empName: string;

  @Column({ type: "varchar", length: 10, nullalbe: true })
  age: number;

  @Column({ type: "hire_date", type: "date", nullable: true })
  hireDate: Date;

  @Column({ type: "varchar", length: 300, nullable: true })
  etc: string;
}
```
