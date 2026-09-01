# 7장

### GROUP BY 절과 집계 함수

#### GROUP BY 절

`GROUP BY`는 지정한 컬럼의 값이 같은 로우끼리 하나의 그룹으로 묶는다

다음과 같은 데이터가 있을 시

```text
id station_name passenger_number record_date
1   선릉            850                2026-07-01
2   잠실            1200               2026-07-01
3   선릉            920                2026-07-02
4   잠실            1350               2026-07-02
5   선릉            880                2026-07-03
```

`station_name`으로 GROUP BY하면 같은 역끼리 하나의 그룹으로 묶인다

```sql
SELECT station_name FROM subway_statistics GROUP BY station_name;
```

결과는 다음과 같다

```text
선릉 잠실
```

실제로 GROUP BY는 `COUNT`, `SUM`, `AVG` 같은 집계 함수와 함께 사용하는 경우가 많다.

---

### SQL의 작성 순서와 처리 순서

SQL은 우리가 작성하는 순서와 논리적으로 처리되는 순서가 다르다

```text
작성 순서                       논리적 처리 순서
┌────────────┐                ┌────────────┐
│ SELECT     │                │ FROM       │  ① 대상 테이블 결정
│ FROM       │                │ WHERE      │  ② 로우 단위 필터링
│ WHERE      │      ≠         │ GROUP BY   │  ③ 그룹 생성
│ GROUP BY   │                │ HAVING     │  ④ 그룹 단위 필터링
│ HAVING     │                │ SELECT     │  ⑤ 조회 컬럼 계산
│ ORDER BY   │                │ ORDER BY   │  ⑥ 결과 정렬
└────────────┘                └────────────┘
```

다음과 같이 정리할 수 있다

```text
  FROM
    │
    ▼
  WHERE
    │
    ▼
  GROUP BY
    │
    ▼
  HAVING
    │
    ▼
  SELECT
    │
    ▼
  ORDER BY
```

해당 순서를 이해하면 왜 WHERE, HAVING의 역할이 다른지도 이해하기 쉽다

다음처럼 집계 함수를 WHERE에서 사용할 수 없다

```sql
-- 잘못된 예
SELECT station_name, SUM(passenger_number) AS total_passenger FROM subway_statistics WHERE SUM(passenger_number) >= 2000 GROUP BY station_name;
```

WHERE가 실행되는 시점에 아직 GROUP BY가 실행되지 않았다. 집계 결과를 조건으로 사용하려면 `HAVING`을 사용해야 한다

```sql
SELECT station_name, SUM(passenger_number) AS total_passeneger FROM subway_statistics GROUP BY station_name HAVING SUM(passenger_number) >= 20000;
```

### TypeORM에서 GROUP BY 사용

SQL:

```sql
SELECT station_name, SUM(passenger_number) AS total_passenger FROM subway_statistics GROUP BY station_name;
```

TypeORM QueryBuilder:

```ts
const result = await this.subwayRepository
  .createQueryBuilder("s")
  .select("s.stationName", "stationName")
  .addSelect("SUM(s.passengerNumber)", "totalPassenger")
  .groupBy("s.stationName")
  .getRawMany();
```

결과는 다음과 같은 집계 데이터

```ts
[
  {
    stationName: "선릉",
    totalPassenger: "2650",
  },
  {
    stationName: "잠실",
    totalPassenger: "2550",
  },
];
```

집계 결과처럼 Entity에 존재하지 않는 값을 조회할 때 `getMany()` 보다 `getRawMany()`를 사용하는 경우가 많다

```text
getMany()
-> Entity 형태 조회

getRawMany()
-> SUM, COUNT, AVG처럼 계산된 값을 조회할 때
```

DB Driver의 반환 형식에 따라 집계값이 문자열로 반환되는 경우가 있어 Service에서 원하는 타입으로 변환해주는 것도 좋다

```ts
const rows = await this.subwayRepository
  .createQueryBuilder("s")
  .select("s.stationName", "stationName")
  .addSelect("SUM(s.passengerNumber)", "totalPassenger")
  .groupBy("s.stationName")
  .getRawMany();

return rows.map((row) => {
  stationName: row.stationName,
  totalPassenger: Number(row.totalPassenger),
})
```

### 여러 컬럼으로 GROUP BY

GROUP BY는 여러 컬럼을 사용할 수 있다

**역 + 날짜별 승객 수**를 집계

```sql
SELECT station_name, record_date, SUM(passenger_number) AS total_passenger FROM subway_statistics GROUP BY station_name, record_date ORDER BY record_date ASC, total_passenger DESC;
```

TypeORM에 첫 컬럼에 `groupBy()`를 사용, 이후 컬럼은 `addGroupBy()`로 추가할 수 있다.

```ts
const result = await this.subwayRepository
  .createQueryBuilder("s")
  .select("s.stationName", "stationName")
  .addSelect("s.recordDate", "recordDate")
  .addSelect("SUM(s.passengerNumber")", "totalPassenger"*)*
  .groupBy("s.stationName")
  .addGroupBy("s.recordDate")
  .orderBy("s.recordDate", "ASC")
  .addOrderBy("totalPassenger", "DESC")
  .getRawMany();
```

Service 메서드로 만들면 다음과 가다

```ts
async getStationDailyStatistics() {
  const rows = await this.subwayRepository
    .createQueryBuilder("s")
    .select("s.stationName", "stationName")
    .addSelect("s.recordDate", "recordDate")
    .addSelect("SUM(s.passengerNumber)", "totalPassenger")
    .groupBy("s.stationName")
    .addGroupBy("s.recordDate")
    .orderBy("s.recordDate", "ASC")
    .addOrderBy("totalPassenger", "DESC")
    .getRawMany();

  return rows.map((row) => ({
    stationName: row.stationName,
    recordDate: row.recordDate,
    totalPassenger: Number(row.totalPassenger),
  }));
}
```

> `groupBy()`를 여러 번 호출하면 기존 GROUP BY 조건이 덮어질 수 있다. 여러 컬럼을 그룹화할때 첫 번째만 `groupBy()`로 지정, 이후는 `addGroupBy()`를 사용

---

#### 집계 함수

집계 함수는 GROUP BY로 묶인 그룹을 하나의 값으로 요약

GROUP BY가 없으면 조회된 전체 로우를 하나의 그룹처럼 보고 계산한다

| 함수            | 역할                            |
| --------------- | ------------------------------- |
| `COUNT(*)`      | 전체 로우 수                    |
| `COUNT(column)` | 해당 컬럼이 NULL이 아닌 로우 수 |
| `SUM(column)`   | 합계                            |
| `AVG(column)`   | 평균                            |
| `MIN(column)`   | 최솟값                          |
| `MAX(column)`   | 최댓값                          |

### COUNT

전체 데이터 개수를 구한다

```sql
SELECT COUNT(*) FROM subway_statistics;
```

단순한 개수 조회면 TypeORM Repository의 `count()`를 사용할 수 있다

```ts
const count = await this.subwayRepository.count();
```

조건도 넣을 수 있다

```ts
const count = await this.subwayRepository.count({
  where: {
    stationName: "선릉",
  },
});
```

SQL로 표현하면

```sql
SELECT COUNT(*) FROM subway_statistics WHERE station_name = '선릉';
```

GROUP BY가 필요한 COUNT는 QueryBuilder를 사용하는 것이 자연스럽다

```sql
SELECT station_name, COUNT(*) AS record_count FROM subway_statistics GROUP BY station_name;
```

```ts
const result = await this.subwayRepository
  .createQueryBuilder("s")
  .select("s.stationName", "stationName")
  .addSelect("COUNT(*)", "recordCount")
  .groupBy("s.stationName")
  .getRawMany();
```

---

### COUNT(\*)와 COUNT(column)의 차이

`COUNT(*)`는 로우 자체를 세어 NULL 여부와 관계없이 모든 로우를 계산한다

```sql
SELECT COUNT(*) FROM subway_statistics;
```

or

```sql
SELECT COUNT(passenger_number) FROM subway_statistics;
```

는 `passenger_number`가 NULL인 로우를 제외한다

예로

```text
station_name passenger_number
선릉            850
선릉            920
선릉            NULL
```

결과는

```text
COUNT(*)                  = 3
COUNT(passenger_number)   = 2
```

```text
COUNT(*) -> 전체 이벤트 참여 로우 수
COUNT(score) -> 실제 점수가 기록된 로우 수
```

### SUM

합계를 계산한다

```sql
SELECT SUM(passeneger_number) FROM subway_statistics;
```

총 승객수를 조회하면

```sql
SELECT station_name, SUM(passenger_number) AS total_passenger FROM subway_statistics GROUP BY station_name;
```

TypeORM:

```ts
const result = await this.subwayRepository
  .createQueryBuilder("s")
  .select("s.stationName", "stationName")
  .addSelect("SUM(s.passengerNumber)", "totalPassenger")
  .groupBy("s.stationName")
  .getRawMany();
```

---

### AVG

평균을 계산한다

```sql
SELECT station_name, AVG(passenger_number) AS average_passenger FROM subway_statistics GROUP BY staion_name;
```

TypeORM:

```ts
const result = await this.subwayRepository
  .createQueryBuilder("s")
  .select("s.stationName", "stationName")
  .addSelect("AVG(s.passengerNumber)", "averagePassenger")
  .groupBy("s.stationName")
  .getRawMany();
```

Service에서 숫자로 변환

```ts
return result.map((row) => ({
  stationName: row.stationName,
  averagePassenger: Number(row.averagePassenger),
}));
```

### MIN / MAX

최솟값과 최댓값을 계산한다

```sql
SELECT station_name, MIN(passenger_number) AS min_passenger, MAX(passenger_number) AS max_passenger FROM subway_statistics GROUP BY station_naem;
```

TypeORM:

```ts
const result = await this.subwayRepository
  .createQueryBuilder("s")
  .select("s.stationName", "stationName")
  .addSelect("MIN(s.passengerNumber)", "minPassenger")
  .addSelect("MAX(s.passengerNumber)", "maxPassenger")
  .groupBy("s.stationName")
  .getRawMany();
```

### 여러 집계 함수를 한 번에 사용

하나의 SELECT에 여러 집계 함수를 사용할 수 있다

```sql
SELECT
  station_name, COUNT(*) AS record_count,
  MIN(passenger_number) AS min_value,
  MAX(passenger_number) AS max_value,
  SUM(passenger_number) AS sum_value,
  AVG(passenger_number) AS avg_value
FROM subway_statistics
GROUP BY station_name
ORDER BY sum_value DESC;
```

TypeORM:

```ts
const result = await this.subwayRepository
  .createQueryBuilder("s")
  .select("s.stationName", "stationName")
  .addSelect("COUNT(*)", "recordCount")
  .addSelect("MIN(s.passengerNumber)", "minValue")
  .addSelect("MAX(s.passengerNumber)", "maxValue")
  .addSelect("SUM(s.passengerNumber)", "sumValue")
  .addSelect("AVG(s.passengerNumber)", "avgValue")
  .groupBy("s.stationName")
  .orderBy("sumValue", "DESC")
  .getRawMany();
```

Serrvice 메서드로 정리하면 아래와 같다

```ts
async getStationSummary() {
  const rows = await this.subwayRepository
    .createQueryBuilder("s")
    .select("s.stationName", "stationName")
    .addSelect("COUNT(*)", "recordCount")
    .addSelect("MIN(s.passengerNumber)", "minValue")
    .addSelect("MAX(s.passengerNumber)", "maxValue")
    .addSelect("SUM(s.passengerNumber)", "sumValue")
    .addSelect("AVG(s.passengerNumber)", "avgValue")
    .groupBy("s.stationName")
    .orderBy("sumValue", "DESC")
    .getRawMany();

  return rows.map((row) => ({
    stationName: row.stationName,
    recordCount: Number(row.recordCount),
    minValue: Number(row.minValue),
    maxValue: Number(row.maxvalue),
    sumValue: Number(row.sumValue),
    avgValue: Number(row.avgValue),
  }));
}
```

> `COUNT(*)`, `COUNT(column)`의 차이를 정확히 아는것이 중요
> `COUNT(*)`는 NULL 여부와 관계없이 로우 개수를 세나, `COUNT(column)` 해당 컬럼이 NULL인 로우를 제외한다

### WHERE + GROUP BY

`GROUP BY`만 사용하기보다 `WHERE`로 필요한 데이터를 줄인 뒤 집계하는 경우가 많다.

2026년 7월 데이터만 대상으로 승객 수를 집계한다.

```sql
SELECT
    station_name,
    SUM(passenger_number) AS total_passenger
FROM subway_statistics
WHERE record_date >= '2026-07-01'
  AND record_date < '2026-08-01'
GROUP BY station_name
ORDER BY total_passenger DESC;
```

TypeORM은 다음과 같다.

```ts
const result = await this.subwayRepository
  .createQueryBuilder("s")
  .select("s.stationName", "stationName")
  .addSelect("SUM(s.passengerNumber)", "totalPassenger")
  .where("s.recordDate >= :startDate", {
    startDate: "2026-07-01",
  })
  .andWhere("s.recordDate < :endDate", {
    endDate: "2026-08-01",
  })
  .groupBy("s.stationName")
  .orderBy("totalPassenger", "DESC")
  .getRawMany();
```

실제 Service에서는 날짜를 파라미터로 받을 수 있다.

```ts
async getStationStatistics(
  startDate: string,
  endDate: string,
) {
  const rows = await this.subwayRepository
    .createQueryBuilder("s")
    .select("s.stationName", "stationName")
    .addSelect("SUM(s.passengerNumber)", "totalPassenger")
    .where("s.recordDate >= :startDate", {
      startDate,
    })
    .andWhere("s.recordDate < :endDate", {
      endDate,
    })
    .groupBy("s.stationName")
    .orderBy("totalPassenger", "DESC")
    .getRawMany();

  return rows.map((row) => ({
    stationName: row.stationName,
    totalPassenger: Number(row.totalPassenger),
  }));
}
```

사용자가 전달한 값을 SQL 문자열에 직접 붙이지 않는 것이 중요하다.

```ts
// 피하는 것이 좋다.
.where(`s.recordDate >= '${startDate}'`);
```

파라미터 바인딩을 사용한다.

```ts
.where("s.recordDate >= :startDate", {
  startDate,
});
```

### HAVING 절

`WHERE`는 `GROUP BY` **전**에 로우를 필터링한다.

`HAVING`은 `GROUP BY` **후**에 만들어진 그룹이나 집계 결과를 필터링한다.

```text
WHERE  -> 어떤 로우를 집계 대상으로 포함할 것인가?
HAVING -> 집계가 끝난 그룹 중 어떤 그룹을 보여줄 것인가?
```

역별 총 승객 수가 2000명 이상인 역만 조회한다.

```sql
SELECT
    station_name,
    SUM(passenger_number) AS total_passenger
FROM subway_statistics
GROUP BY station_name
HAVING SUM(passenger_number) >= 2000
ORDER BY total_passenger DESC;
```

TypeORM:

```ts
const result = await this.subwayRepository
  .createQueryBuilder("s")
  .select("s.stationName", "stationName")
  .addSelect("SUM(s.passengerNumber)", "totalPassenger")
  .groupBy("s.stationName")
  .having("SUM(s.passengerNumber) >= :minPassenger", {
    minPassenger: 2000,
  })
  .orderBy("totalPassenger", "DESC")
  .getRawMany();
```

### BETWEEN과 HAVING

집계 결과가 특정 범위 안에 있는 그룹만 조회한다.

```sql
SELECT
    station_name,
    SUM(passenger_number) AS total_passenger
FROM subway_statistics
GROUP BY station_name
HAVING SUM(passenger_number) BETWEEN 2000 AND 3000
ORDER BY total_passenger DESC;
```

TypeORM:

```ts
const result = await this.subwayRepository
  .createQueryBuilder("s")
  .select("s.stationName", "stationName")
  .addSelect("SUM(s.passengerNumber)", "totalPassenger")
  .groupBy("s.stationName")
  .having("SUM(s.passengerNumber) BETWEEN :min AND :max", {
    min: 2000,
    max: 3000,
  })
  .orderBy("totalPassenger", "DESC")
  .getRawMany();
```

### WHERE, HAVING 함께 사용

다음을 고려해보자.

```text
1. 2026년 7월 데이터만 대상
2. 역별로 승객 수를 합산
3. 합계가 2000명 이상인 역만 조회
```

```sql
SELECT
    station_name,
    SUM(passenger_number) AS total_passenger
FROM subway_statistics
WHERE record_date >= '2026-07-01'
  AND record_date < '2026-08-01'
GROUP BY station_name
HAVING SUM(passenger_number) >= 2000
ORDER BY total_passenger DESC;
```

각 절의 역할은 다음과 같다.

```text
WHERE    -> 7월 데이터만 남김
GROUP BY -> 역별 그룹 생성
SUM      -> 역별 승객 수 합산
HAVING   -> 합계 2000 이상 그룹만 남김
ORDER BY -> 합계가 높은 순으로 정렬
```

TypeORM:

```ts
const result = await this.subwayRepository
  .createQueryBuilder("s")
  .select("s.stationName", "stationName")
  .addSelect("SUM(s.passengerNumber)", "totalPassenger")
  .where("s.recordDate >= :startDate", {
    startDate: "2026-07-01",
  })
  .andWhere("s.recordDate < :endDate", {
    endDate: "2026-08-01",
  })
  .groupBy("s.stationName")
  .having("SUM(s.passengerNumber) >= :minPassenger", {
    minPassenger: 2000,
  })
  .orderBy("totalPassenger", "DESC")
  .getRawMany();
```

### andHaving / orHaving

`WHERE`에 `andWhere()`, `orWhere()`가 있는 것처럼 `HAVING`에도 `andHaving()`, `orHaving()`을 사용할 수 있다.

```sql
SELECT
    station_name,
    SUM(passenger_number) AS total_passenger,
    AVG(passenger_number) AS average_passenger
FROM subway_statistics
GROUP BY station_name
HAVING SUM(passenger_number) >= 2000
   AND AVG(passenger_number) >= 800;
```

TypeORM:

```ts
const result = await this.subwayRepository
  .createQueryBuilder("s")
  .select("s.stationName", "stationName")
  .addSelect("SUM(s.passengerNumber)", "totalPassenger")
  .addSelect("AVG(s.passengerNumber)", "averagePassenger")
  .groupBy("s.stationName")
  .having("SUM(s.passengerNumber) >= :minTotal", {
    minTotal: 2000,
  })
  .andHaving("AVG(s.passengerNumber) >= :minAverage", {
    minAverage: 800,
  })
  .getRawMany();
```

> `having()`을 여러 번 호출하기보다는 추가 조건에 `andHaving()`, `orHaving()`을 사용하는 것이 좋다.

### DISTINCT

`DISTINCT`는 `SELECT` 결과의 중복된 값을 제거한다.

```sql
SELECT DISTINCT station_name
FROM subway_statistics;
```

다음 `GROUP BY`도 같은 형태의 결과가 나온다.

```sql
SELECT station_name
FROM subway_statistics
GROUP BY station_name;
```

하지만 목적은 다르다.

```text
DISTINCT -> SELECT 결과의 중복 제거

GROUP BY -> 같은 값을 그룹으로 묶어 집계하기 위한 기능
```

중복 제거가 목적이면 `DISTINCT`가 의도를 더 잘 표현한다.

```ts
const result = await this.subwayRepository
  .createQueryBuilder("s")
  .select("s.stationName", "stationName")
  .distinct(true)
  .getRawMany();
```

---

### 예제 - 랭킹 집계

`GROUP BY`는 게임 서버 랭킹이나 이벤트 통계에서도 자주 사용한다.

```text
user_example_results

id
user_id
example_schedule_id
score
created_at
```

특정 예제 게임에서 사용자별 누적 점수를 계산한다.

```sql
SELECT
    user_id,
    SUM(score) AS total_score
FROM user_example_results
WHERE example_schedule_id = 11111
GROUP BY user_id
ORDER BY total_score DESC;
```

TypeORM:

```ts
const rankings = await this.userExampleResultRepository
  .createQueryBuilder("r")
  .select("r.userId", "userId")
  .addSelect("SUM(r.score)", "totalScore")
  .where("r.exampleScheduleId = :exampleScheduleId", {
    exampleScheduleId: 11111,
  })
  .groupBy("r.userId")
  .orderBy("totalScore", "DESC")
  .getRawMany();
```

점수가 12,000점 이상인 사용자만 포함하려면 `HAVING`을 추가한다.

```ts
const rankings = await this.userExampleResultRepository
  .createQueryBuilder("r")
  .select("r.userId", "userId")
  .addSelect("SUM(r.score)", "totalScore")
  .where("r.exampleScheduleId = :exampleScheduleId", {
    exampleScheduleId: 11111,
  })
  .groupBy("r.userId")
  .having("SUM(r.score) >= :minimumScore", {
    minimumScore: 12000,
  })
  .orderBy("totalScore", "DESC")
  .getRawMany();
```

Service 메서드:

```ts
async getExampleRanking(
  exampleScheduleId: number,
  minimumScore = 0,
) {
  const rows = await this.userExampleResultRepository
    .createQueryBuilder("r")
    .select("r.userId", "userId")
    .addSelect("SUM(r.score)", "totalScore")
    .where(
      "r.exampleScheduleId = :exampleScheduleId",
      {
        exampleScheduleId,
      },
    )
    .groupBy("r.userId")
    .having(
      "SUM(r.score) >= :minimumScore",
      {
        minimumScore,
      },
    )
    .orderBy("totalScore", "DESC")
    .getRawMany();

  return rows.map((row, index) => ({
    rank: index + 1,
    userId: Number(row.userId),
    totalScore: Number(row.totalScore),
  }));
}
```

> `"WHERE는 행 필터, HAVING은 그룹 필터"`라고 기억하면 이해하기 쉽다.
>
> `example_schedule_id = 11111`처럼 집계하기 전에 필요 없는 로우를 제거하는 조건은 `WHERE`에 들어간다.
>
> 반면 `SUM(score) >= 12000`처럼 집계 후 만들어지는 값을 조건으로 사용할 때는 `HAVING`을 사용한다.

---

## 정리 내용

- `GROUP BY`는 같은 값을 가진 로우들을 하나의 그룹으로 묶는다.
- SQL의 논리적 처리 순서는 다음과 같이 이해한다.

```text
FROM
-> WHERE
-> GROUP BY
-> HAVING
-> SELECT
-> ORDER BY
```

- `WHERE`는 그룹화 전에 로우를 필터링한다.
- `HAVING`은 `GROUP BY` 이후 만들어진 그룹이나 집계 결과를 필터링한다.
- `"WHERE는 행 필터, HAVING은 그룹 필터"`라고 기억하면 된다.
- 대표적인 집계 함수는 다음과 같다.

```text
COUNT
SUM
AVG
MIN
MAX
```

- `COUNT(*)`는 전체 로우를 세고, `COUNT(column)`은 해당 컬럼이 NULL인 로우를 제외한다.
- TypeORM에서 집계 쿼리를 만들 때 `QueryBuilder`를 많이 사용한다.

```ts
.select()
.addSelect()
.where()
.andWhere()
.groupBy()
.addGroupBy()
.having()
.andHaving()
.orderBy()
.getRawMany()
```

- Entity에 없는 집계 결과를 받을 때 `getRawOne()`이나 `getRawMany()`를 사용하는 경우가 많다.
- `DISTINCT`는 `SELECT` 결과의 중복을 제거하는 기능이고, `GROUP BY`는 데이터를 그룹으로 묶어 집계하기 위한 기능이다.
