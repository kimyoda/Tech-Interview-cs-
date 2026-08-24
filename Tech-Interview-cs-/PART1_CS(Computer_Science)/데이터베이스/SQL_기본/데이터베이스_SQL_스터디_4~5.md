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
