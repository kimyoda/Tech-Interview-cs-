# 데이터 입력,삭제(INSERT/DELETE)부터 SELECT 문 기초(NestJS)

---

## 데이터 입력과 삭제

DML 중에서 데이터를 밀어 넣는 역할은 INSERT, 지우는 건 DELETE가 전담한다

### 데이터 입력, INSERT

DML 문장 중에 데이터를 입력하는 기능은 INSERT 문이다. 기본 구문은 다음과 같다

```sql
INSERT INTO 테이블명 (column1, column2, column3, ... )
VALUES ( 값1, 값2, 값3, ...);
```

INSERT 문에 필요한 정보는 세 가지 - **테이블명**, **컬럼명과 개수**, **컬럼에 들어갈 값**이다.

- 괄호 안 컬럼 순서와 VALUES 괄호 안 값 순서가 반드시 일치해야 한다.
- 컬럼의 데이터형과 넣으려는 값의 형이 서로 맞아야 한다.

```sql
INSERT INTO emp03 (emp_id, emp_name, gender, age, hire_date)
VALUES (1, '홍길동', '남성', 33, '2018-01-01');

INSERT INTO emp03 (emp_id, emp_name, gender, age, hire_date)
VALUES (2, '김유신', '남성', 44, '2018-01-01');

INSERT INTO emp03 (emp_id, emp_name, gender, age, hire_date)
VALUES (3, '강감찬', '남성', 55, '2018-01-01');
```

여기서 규칙을 지키지 않으면 에러가 발생한다. NOT NULL로 지정한 `emp_id`를 빼고 넣으면 NULL을 넣을 수 없다 에러가 나오고, 이미 존재하는 `emp_id` 값을 다시 넣으면 기본 키 중복 에러가 난다.

NestJS, TypeORM에 이 INSERT. 문이 Repository의 `save()`또는 `insert()` 메서드로 대응된다

```ts
// 1건 입력 - INSERT 구문과 1:1 대응
await this.empRepository.save({
  empId: 1,
  empName: "홍길동",
  gender: "남성",
  age: 33,
  hireDate: "2018-01-01",
});

// 여러 건 한 번에 입력
await this.empRepository.save([
  {
    empId: 2,
    empName: "김유신",
    gender: "남성",
    age: 44,
    hireDate: "2018-01-01",
  },
  {
    empId: 3,
    empName: "강감찬",
    gender: "남성",
    age: 55,
    hireDate: "2018-01-01",
  },
]);
```

> `save()`는 내부적으로 기본 키 존재 여부를 보고 INSERT/UPDATE를 결정, `insert()`는 무조건 INSERT만 시도한다. 플레이 로그처럼 무조건 새로 쌓이기만 하는 데이터는 `insert()`를 써서 의도치 않은 UPDATE를 하지않도록 하면 실수를 줄일 수 있다.

### 데이터 삭제, DELETE 문

INSERT의 반대는 DELETE다.

```sql
DELETE [FROM] 테이블명 WHERE 조건;
```

DELETE 다음에 지울 대상 테이블을 쓰고 WHERE 절에 어떤 로우를 지울 지 조건을 명시한다. `FROM`은 생략 가능하다. 그리고 **WHERE 절을 생략하면 테이블의 모든 데이터가 삭제된다** 가장 조심해야 한다.

```sql
-- emp_id가 3인 강감찬 데이터만 삭제
DELETE FROM emp03 WHERE emp_id = 3;
```

DELETE는 DML이기에, 지우고 나서 문제가 없으면 COMMIT으로 확장, 잘못 지웠다면 COMMIT 전까지 ROLLBACK으로 되돌릴 수 있다

```sql
DELETE FROM emp03 WHERE emp_id = 3;
-- 확인해보니 잘못 지웠으면
ROLLBACK;
```

TypeORM에서 `delete()` 또는 `softDelete()`가 해당 역할을 한다

```ts
// WHERE emp_id = 3에 해당하는 DELETE
await this.empRepository.delte({ empID: 3 });

// 물리 삭제 대신 삭제 시각만 기록하는 소프트 삭제
await this.empRepository.softDelete({ empId: 3 });
```

> 사실 DELETE는 개발환경, QA에서 정도에서나 쓰이지, 라이브 즉 운영 단계에서는 거의 사용할일이 없다. 사용한다 하더라도 테스트계정 및 테스트 계정에 남아있는 랭킹 순위 및 점수 등에 해당하지, 웬만하면 DELETE 대신 ALTER를 사용하여 정리하기에 작업하기 전 반드시 확인해야 한다.

### 테이블 생성과 데이터 입력 확인

CREATE TABLE + INSERT 지하철역별 인원 통계 테이블 생성

| 컬럼명           | 설명           | 데이터형    | NULL 여부 |
| ---------------- | -------------- | ----------- | --------- |
| station_name     | 역명           | VARCHAR(50) | NOT NULL  |
| passenger_number | 승하차 인원 수 | INT         | NULL      |
| record_date      | 집계 일자      | DATE        | NULL      |

```sql
CREATE TABLE subway_statistics (
  station_name VARCHAR(50) NOT NULL,
  passenger_number INT NULL,
  record_date DATE NULL
);

INSERT INTO subway_statistics (station_name, passenger_number, record_date)
VALUES (`선릉`, 850, '2026-07-01');

INSERT INTO subway_statistics (station_name, passenger_number, record_date)
VALUES (`선릉`, 850, '2026-07-01');

INSERT INTO subway_statistics (station_name, passenger_number, record_date)
VALUES (`선릉`, 850, '2026-07-01');
```

```ts
@Entity("subway_statistics")
export class SubwayStatistics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: "station_name",
    type: "varchar",
    length: 50,
    nullable: false,
  })
  stationName: string;

  @Column({ name: "passenger_number", type: "int", nullable: true })
  passengerNumber: number;

  @Column({ name: "record_date", type: "date", nullable: true })
  recordDate: string;
}
```

---

## 데이터 조회, SELECT 문

SELECT 문의 활용과 원하는 데이터만 골라내는 조건 연산자들을 다룬다.

### SELECT 문 기본 구문

SELECT 문 기본

```sql
SELECT 컬럼/표현식 -- 무엇을 보여주는지
FROM 테이블명 -- 어디서 가져올건지
WHERE 조건 -- 어떤 로우만 가져올건지 (생략 가능)
ORDER BY 컬럼 -- 어떤 순서로 보여줄 지 (생략 가능)
```

```
SELECT 절 (무엇을 보여주는 지) -> station_name, passenger_number
FROM 절 (어디서 가져오는지) -> subway_statistics
WHERE 절 (어떤 로우만) -> station_name LIKE '선릉%'
ORDER BY 절 (어떤 순서로) -> passeneger_number DESC
```

#### SELECT 절

SELECT절에 조회할 컬럼이나 표현식을 나열한다. 컬럼명 대신 `*`을 쓰면 테이블에 정의된 순서대로 전체 컬럼을 가져온다. 표현식은 값, 연산자, 함수가 결합된 식을 말한다. `passenger_number * 2`처럼 컬럼끼리 연산한 결과도 그대로 조회할 수 있다.

```sql
SELECT station_name, passenger_number
FROM subway_statistics;
```

```ts
// QueryBuilder select()
this.subwayRepository
  .createQueryBuilder("s")
  .slect(["s.stationName", "s.passengerNumber"]);
```

#### FROM절

FROM 절에 조회할 테이블을 명시한다. 테이블을 하나만 지정하나, 여러 테이블을 콤마로 나열해 결합하는 것도 가능하다

```sql
SELECT * FROM subway_statistics
WHERE station_name = '선릉';
```

```ts
this.subwayRepository
  .createQueryBUilder("s")
  .where("s.stationName = :name", { name: "선릉" });
```

#### WHERE 절

WHERE 절은 FROM 절에서 가져온 로우 중 **조건식의 결과가 TRUE인 로우만 조회**한다.

SELECT뿐 아니라 UPDATE, DELETE에서도 같은 역할로 사용된다.

```sql
SELECT *
FROM subway_statistics
WHERE station_name = '선릉';
```

TypeORM QueryBuilder에서는 `where()`를 사용할 수 있다.

```typescript
this.subwayRepository.createQueryBuilder("s").where("s.stationName = :name", {
  name: "선릉",
});
```

`:name`처럼 파라미터를 사용하면 값을 SQL 문자열에 직접 이어 붙이는 것보다 안전하게 조건을 전달할 수 있다.

---

#### ORDER BY 절

ORDER BY 절은 조회 결과를 정렬한다.

ORDER BY를 생략하면 데이터가 어떤 순서로 반환될지 보장되지 않는다.

오름차순은 `ASC`, 내림차순은 `DESC`를 사용한다.

```sql
SELECT station_name, passenger_number
FROM subway_statistics
ORDER BY passenger_number DESC;
```

`ASC`는 기본값이므로 생략할 수 있다.

```sql
SELECT station_name, passenger_number
FROM subway_statistics
ORDER BY passenger_number;
```

TypeORM에서는 `orderBy()`를 사용할 수 있다.

```typescript
this.subwayRepository
  .createQueryBuilder("s")
  .orderBy("s.passengerNumber", "DESC");
```

> ORDER BY 없이 "최근 데이터가 먼저 나올 것"이라고 가정해서는 안 된다.
> 랭킹, 최근 목록, 로그처럼 순서가 중요한 데이터라면 반드시 ORDER BY를 명시해야 한다.

---

### 조건에 맞는 데이터 조회하기

WHERE 절에는 다양한 조건 연산자를 사용할 수 있다.

### 조건 연산자

가장 기본적인 비교 연산자는 다음과 같다.

| 연산자     | 의미        | TypeORM 대응                     |
| ---------- | ----------- | -------------------------------- |
| `=`        | 같다        | `Equal()` 또는 QueryBuilder 조건 |
| `>`        | 크다        | `MoreThan()`                     |
| `<`        | 작다        | `LessThan()`                     |
| `>=`       | 크거나 같다 | `MoreThanOrEqual()`              |
| `<=`       | 작거나 같다 | `LessThanOrEqual()`              |
| `<>`, `!=` | 같지 않다   | `Not(Equal())`                   |

예를 들어 승하차 인원이 1000명 이상인 역만 조회한다.

```sql
SELECT *
FROM subway_statistics
WHERE passenger_number >= 1000;
```

TypeORM Repository에서는 다음과 같이 표현할 수 있다.

```typescript
import { MoreThanOrEqual } from "typeorm";

this.subwayRepository.find({
  where: {
    passengerNumber: MoreThanOrEqual(1000),
  },
});
```

---

#### LIKE 연산자

LIKE는 값이 정확히 일치하는지를 비교하는 것이 아니라 문자열의 특정 패턴을 검색할 때 사용한다.

`%`는 0개 이상의 임의의 문자열을 의미한다.

| 패턴       | 의미                   |
| ---------- | ---------------------- |
| `'선릉%'`  | '선릉'으로 시작하는 값 |
| `'%선릉'`  | '선릉'으로 끝나는 값   |
| `'%선릉%'` | '선릉'을 포함하는 값   |

예를 들어 '선릉'으로 시작하는 역을 조회한다.

```sql
SELECT *
FROM subway_statistics
WHERE station_name LIKE '선릉%';
```

TypeORM에서는 `Like()`를 사용할 수 있다.

```typescript
import { Like } from "typeorm";

this.subwayRepository.find({
  where: {
    stationName: Like("선릉%"),
  },
});
```

> 일반적인 B-Tree 인덱스를 기준으로 `LIKE '선릉%'`처럼 검색어 앞부분이 고정된 조건은 인덱스를 활용할 가능성이 있다.
> 반면 `LIKE '%선릉'`이나 `LIKE '%선릉%'`처럼 패턴 앞에 `%`가 붙으면 일반적으로 인덱스를 효율적으로 사용하기 어렵다.
> 실제 인덱스 사용 여부는 인덱스 구성, Collation, 데이터 분포, 옵티마이저 판단 등에 따라 달라질 수 있다.

---

#### IN 연산자

여러 값 중 하나라도 일치하는 데이터를 조회하고 싶을 때 IN을 사용한다.

```sql
SELECT *
FROM subway_statistics
WHERE station_name IN ('선릉', '잠실', '강남');
```

위 쿼리는 다음과 같은 OR 조건과 같은 의미다.

```sql
SELECT *
FROM subway_statistics
WHERE station_name = '선릉'
   OR station_name = '잠실'
   OR station_name = '강남';
```

TypeORM에서는 `In()`을 사용할 수 있다.

```typescript
import { In } from "typeorm";

this.subwayRepository.find({
  where: {
    stationName: In(["선릉", "잠실", "강남"]),
  },
});
```

---

#### BETWEEN 연산자

BETWEEN은 특정 범위 안의 값을 조회할 때 사용한다.

```sql
컬럼 BETWEEN 하한값 AND 상한값
```

BETWEEN은 **양쪽 경계값을 모두 포함한다.**

즉 다음 조건은

```sql
WHERE passenger_number BETWEEN 500 AND 1000
```

다음 조건과 같은 의미다.

```sql
WHERE passenger_number >= 500
  AND passenger_number <= 1000
```

실제로 조회해보자.

```sql
SELECT *
FROM subway_statistics
WHERE passenger_number BETWEEN 500 AND 1000;
```

TypeORM에서는 `Between()`을 사용할 수 있다.

```typescript
import { Between } from "typeorm";

this.subwayRepository.find({
  where: {
    passengerNumber: Between(500, 1000),
  },
});
```

> BETWEEN은 양쪽 값을 포함하기 때문에 `500 초과 1000 미만`처럼 경계를 제외해야 한다면 `>`와 `<`를 직접 사용해야 한다.

날짜를 다룰 때는 데이터형을 특히 주의해야 한다.

`DATE` 컬럼이라면 다음과 같은 조건은 `2026-07-09` 날짜까지 정상적으로 포함한다.

```sql
WHERE record_date BETWEEN '2026-07-01' AND '2026-07-09'
```

하지만 `DATETIME`이나 `TIMESTAMP` 컬럼에서 다음과 같이 작성하면

```sql
WHERE created_at BETWEEN '2026-07-01' AND '2026-07-09'
```

상한값은 사실상 다음과 같이 해석될 수 있다.

```text
2026-07-09 00:00:00
```

따라서 `2026-07-09` 하루 전체를 조회하려는 목적이라면 다음처럼 **다음 날 미만** 조건을 사용하는 방법이 안전하다.

```sql
WHERE created_at >= '2026-07-01 00:00:00'
  AND created_at < '2026-07-10 00:00:00';
```

이런 형태를 반개구간(Half-open interval) 방식이라고 생각하면 이해하기 쉽다.

---

### 데이터 정렬하기

ORDER BY는 하나의 컬럼뿐 아니라 여러 컬럼을 기준으로 정렬할 수도 있다.

앞에 작성한 컬럼의 우선순위가 더 높다.

```sql
-- 승하차 인원이 많은 순
-- 같은 인원이면 역명 오름차순
SELECT station_name, passenger_number
FROM subway_statistics
ORDER BY passenger_number DESC, station_name ASC;
```

TypeORM에서는 `orderBy()` 뒤에 `addOrderBy()`를 추가한다.

```typescript
this.subwayRepository
  .createQueryBuilder("s")
  .orderBy("s.passengerNumber", "DESC")
  .addOrderBy("s.stationName", "ASC");
```

실무에서는 랭킹 정렬에서 자주 사용하는 패턴이다.

예를 들어 다음과 같은 요구사항이 있다고 하자.

```text
1순위: 점수가 높은 사용자
2순위: 같은 점수라면 먼저 달성한 사용자
```

SQL에서는 다음과 같이 표현할 수 있다.

```sql
ORDER BY score DESC, achieved_at ASC;
```

TypeORM에서는 다음과 같다.

```typescript
queryBuilder
  .orderBy("ranking.score", "DESC")
  .addOrderBy("ranking.achievedAt", "ASC");
```

---

## 오늘 정리한 내용 요약

- INSERT 문은 테이블명, 컬럼명, 값으로 구성된다.
- INSERT의 컬럼 순서와 VALUES의 값 순서는 반드시 일치해야 한다.
- TypeORM의 `save()`는 데이터 존재 여부에 따라 INSERT 또는 UPDATE를 수행할 수 있고, `insert()`는 새로운 데이터를 INSERT한다.
- MySQL DELETE의 기본 형태는 `DELETE FROM 테이블명 WHERE 조건`이다.
- WHERE 없는 DELETE는 테이블의 모든 데이터를 삭제하므로 특히 주의해야 한다.
- 트랜잭션 안에서 실행한 DELETE는 COMMIT 전이라면 ROLLBACK할 수 있다.
- SELECT 문의 기본 구조는 SELECT - FROM - WHERE - ORDER BY로 이해할 수 있다.
- ORDER BY를 생략하면 조회 결과의 순서는 보장되지 않는다.
- LIKE는 문자열 패턴 검색에 사용한다.
- IN은 여러 값 중 하나와 일치하는 조건을 간결하게 표현한다.
- BETWEEN은 양쪽 경계값을 모두 포함한다.
- DATETIME/TIMESTAMP 범위 조회에서는 종료일 처리에 주의해야 한다.
- 여러 컬럼을 정렬할 때는 `ORDER BY 컬럼1, 컬럼2` 형태를 사용하며 TypeORM에서는 `orderBy()`와 `addOrderBy()`를 사용할 수 있다.
