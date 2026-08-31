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
