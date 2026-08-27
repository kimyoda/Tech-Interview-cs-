## SQL 연산자와 함수

데이터를 단순히 조회하는 것뿐 아니라 연산하고 가공해서 원하는 형태로 만들어야 하는 경우도 많다.

SQL에서는 이를 위해 **연산자(operator)**와 **함수(function)**를 사용한다.

### SQL 연산자

연산자는 값과 값을 조합하거나 비교하기 위해 사용하는 기호 또는 키워드를 말한다.

| 분류        | 대표 연산자                      | 역할                          |
| ----------- | -------------------------------- | ----------------------------- |
| 산술 연산자 | `+`, `-`, `*`, `/`               | 숫자 값끼리 사칙 연산         |
| 비교 연산자 | `=`, `>`, `<`, `>=`, `<=`, `<>`  | 두 값의 크기나 동등 여부 비교 |
| 논리 연산자 | `AND`, `OR`, `NOT`               | 여러 조건식을 조합            |
| 문자열 연결 | MySQL에서는 `CONCAT()` 함수 사용 | 여러 문자열을 하나로 연결     |

---

#### 산술 연산자

숫자 컬럼에 직접 연산을 적용할 수 있다.

```sql
SELECT
    emp_name,
    age,
    age + 1 AS age_next_year
FROM emp03;
```

예를 들어 `age`가 33이라면 `age_next_year`는 34가 된다.

TypeORM QueryBuilder에서도 SQL 표현식을 그대로 사용할 수 있다.

```typescript
this.empRepository
  .createQueryBuilder("e")
  .select(["e.empName", "e.age"])
  .addSelect("e.age + 1", "ageNextYear")
  .getRawMany();
```

---

#### 비교 연산자

비교 연산자는 두 값을 비교해서 TRUE 또는 FALSE 조건을 만든다.

```sql
SELECT *
FROM emp03
WHERE age >= 40;
```

주요 비교 연산자는 다음과 같다.

```text
=    같다
<>   같지 않다
!=   같지 않다
>    크다
<    작다
>=   크거나 같다
<=   작거나 같다
```

---

#### 논리 연산자

여러 조건식을 조합할 때 `AND`, `OR`, `NOT`을 사용한다.

```sql
SELECT *
FROM emp03
WHERE age >= 30
  AND gender = '남성';
```

OR은 여러 조건 중 하나만 TRUE여도 조건을 만족한다.

```sql
SELECT *
FROM emp03
WHERE emp_name = '홍길동'
   OR emp_name = '김유신';
```

NOT은 조건을 반대로 만든다.

```sql
SELECT *
FROM emp03
WHERE NOT age >= 40;
```

복잡한 조건에서는 괄호를 사용해서 우선순위를 명확하게 표현하는 것이 좋다.

```sql
SELECT *
FROM emp03
WHERE gender = '남성'
  AND (
      age >= 40
      OR emp_name = '홍길동'
  );
```

---

#### 문자열 연결

MySQL에서는 문자열을 연결할 때 `CONCAT()` 함수를 사용한다.

```sql
SELECT
    emp_name,
    CONCAT(emp_name, ' / ', age, '세') AS employee_info
FROM emp03;
```

결과는 다음과 같은 형태가 된다.

```text
홍길동 / 33세
김유신 / 44세
강감찬 / 55세
```

> 문자열 연결 방법은 RDBMS마다 차이가 있다.
>
> MySQL에서는 `CONCAT()`을 주로 사용하고, 다른 DB에서는 `||`나 다른 방식을 사용할 수도 있으므로 사용하는 RDBMS의 문법을 확인해야 한다.

---

### 주요 SQL 함수

함수(function)는 매개변수(입력값)를 받아 정해진 로직으로 값을 가공한 뒤 결과를 반환하는 연산 단위다.

SQL 함수는 크게 두 가지 형태로 나눌 수 있다.

- **단일행 함수**
  - 각각의 로우마다 결과를 반환한다.
  - 숫자형 함수
  - 문자형 함수
  - 날짜형 함수
  - 형변환 함수

- **다중행 함수(집계 함수)**
  - 여러 로우를 하나의 집합으로 계산해서 하나의 결과를 반환한다.
  - `COUNT()`
  - `SUM()`
  - `AVG()`
  - `MAX()`
  - `MIN()`

---

### 숫자형 함수

숫자 값을 계산하거나 가공하는 함수다.

| 함수             | 역할                            | 예시                            |
| ---------------- | ------------------------------- | ------------------------------- |
| `ROUND(n, d)`    | 소수점 d자리까지 반올림         | `ROUND(3.14159, 2)` → `3.14`    |
| `TRUNCATE(n, d)` | 소수점 d자리 이후를 절삭        | `TRUNCATE(3.14159, 2)` → `3.14` |
| `MOD(n, m)`      | n을 m으로 나눈 나머지           | `MOD(10, 3)` → `1`              |
| `ABS(n)`         | 절댓값                          | `ABS(-5)` → `5`                 |
| `CEIL(n)`        | 값보다 작지 않은 가장 작은 정수 | `CEIL(3.1)` → `4`               |
| `FLOOR(n)`       | 값보다 크지 않은 가장 큰 정수   | `FLOOR(3.9)` → `3`              |

> MySQL에서는 숫자를 절삭할 때 `TRUNC()`가 아니라 `TRUNCATE()`를 사용한다.

---

#### ROUND

ROUND는 반올림한다.

```sql
SELECT ROUND(3.14159, 2);
```

결과는 다음과 같다.

```text
3.14
```

두 번째 인자를 생략하면 정수 단위로 반올림한다.

```sql
SELECT ROUND(2.5);
```

숫자 리터럴과 같은 exact-value를 기준으로 결과는 다음과 같다.

```text
3
```

---

#### TRUNCATE

TRUNCATE는 반올림하지 않고 지정한 자리 이후를 버린다.

```sql
SELECT TRUNCATE(3.14159, 2);
```

결과는 다음과 같다.

```text
3.14
```

ROUND와 차이를 비교해보자.

```sql
SELECT
    ROUND(2.59, 1) AS rounded,
    TRUNCATE(2.59, 1) AS truncated;
```

결과는 다음과 같다.

```text
rounded   = 2.6
truncated = 2.5
```

> 점수 계산이나 금액 정산처럼 소수점 처리 결과가 중요한 로직에서는 반올림인지 절삭인지 반드시 명확하게 결정해야 한다.

---

#### MOD

MOD는 나머지를 구한다.

```sql
SELECT MOD(10, 3);
```

결과는 다음과 같다.

```text
1
```

나이를 10으로 나눈 나머지를 조회해보자.

```sql
SELECT
    emp_name,
    age,
    MOD(age, 10) AS age_last_digit
FROM emp03;
```

TypeORM에서는 SQL 함수를 QueryBuilder에 그대로 작성할 수 있다.

```typescript
this.empRepository
  .createQueryBuilder("e")
  .select(["e.empName", "e.age"])
  .addSelect("MOD(e.age, 10)", "ageLastDigit")
  .getRawMany();
```

`addSelect()`에 SQL 표현식을 추가하고 `getRawMany()`로 계산 결과를 함께 받을 수 있다.

---

### 문자형 함수

문자열 데이터를 변환하거나 분석할 때 사용한다.

대부분 문자열을 반환하지만 문자열 길이나 위치처럼 숫자를 반환하는 함수도 있다.

| 함수                      | 역할                             | 예시                                          |
| ------------------------- | -------------------------------- | --------------------------------------------- |
| `UPPER(str)`              | 대문자로 변환                    | `UPPER('abc')` → `ABC`                        |
| `LOWER(str)`              | 소문자로 변환                    | `LOWER('ABC')` → `abc`                        |
| `LENGTH(str)`             | 문자열의 바이트 길이 반환        | `LENGTH('abc')` → `3`                         |
| `CHAR_LENGTH(str)`        | 문자열의 문자 개수 반환          | `CHAR_LENGTH('홍길동')` → `3`                 |
| `SUBSTR(str, pos, len)`   | 문자열 일부 추출                 | `SUBSTR('홍길동', 1, 1)` → `'홍'`             |
| `TRIM(str)`               | 문자열 앞뒤 공백 제거            | `TRIM(' SQL ')` → `'SQL'`                     |
| `INSTR(str, substr)`      | 부분 문자열이 처음 나타나는 위치 | `INSTR('ABABAB', 'A')` → `1`                  |
| `CONCAT(str1, str2, ...)` | 문자열 연결                      | `CONCAT('Hello', ' ', 'SQL')` → `'Hello SQL'` |

---

#### LENGTH와 CHAR_LENGTH의 차이

MySQL에서 특히 주의해야 하는 부분이다.

`LENGTH()`는 **문자 개수가 아니라 바이트 수**를 반환한다.

```sql
SELECT LENGTH('abc');
```

결과는 다음과 같다.

```text
3
```

하지만 한글처럼 멀티바이트 문자를 다룰 때 문자 개수를 알고 싶다면 `CHAR_LENGTH()`를 사용해야 한다.

```sql
SELECT CHAR_LENGTH('홍길동');
```

결과는 다음과 같다.

```text
3
```

따라서 사람 이름의 글자 수를 구하는 경우에는 `LENGTH()`보다 `CHAR_LENGTH()`가 의도에 맞는다.

```sql
SELECT
    emp_name,
    CHAR_LENGTH(emp_name) AS name_length
FROM emp03;
```

---

#### SUBSTR

문자열의 일부를 잘라낼 때 사용한다.

```sql
SELECT SUBSTR('홍길동', 1, 1);
```

결과는 다음과 같다.

```text
홍
```

이를 WHERE 조건에서도 사용할 수 있다.

```sql
SELECT *
FROM emp03
WHERE SUBSTR(emp_name, 1, 1) = '홍';
```

즉 성이 '홍'인 사원을 조회할 수 있다.

---

#### TRIM

문자열 앞뒤에 있는 공백을 제거한다.

```sql
SELECT TRIM(' SQL ');
```

결과는 다음과 같다.

```text
SQL
```

사용자 입력이나 외부 데이터를 DB에 저장할 때 의도하지 않은 공백을 처리하는 데 사용할 수 있다.

---

#### INSTR

INSTR은 특정 문자열이 처음 등장하는 위치를 반환한다.

```sql
SELECT INSTR('ABABAB', 'A');
```

결과는 다음과 같다.

```text
1
```

찾는 문자열이 없다면 `0`을 반환한다.

```sql
SELECT INSTR('ABABAB', 'C');
```

결과는 다음과 같다.

```text
0
```

따라서 다음과 같이 문자열 포함 여부를 조건으로 사용할 수도 있다.

```sql
SELECT *
FROM emp03
WHERE INSTR(emp_name, '길') > 0;
```

> `INSTR()`는 검색 결과가 없을 때 NULL이 아니라 `0`을 반환한다는 점을 기억해야 한다.

---

## 날짜형 함수

날짜형 함수는 `DATE`, `DATETIME`, `TIMESTAMP` 같은 날짜/시간 데이터를 계산하거나 가공할 때 사용한다.

실무에서 자주 사용하는 함수들은 다음과 같다.

| 함수                              | 역할                                   |
| --------------------------------- | -------------------------------------- |
| `NOW()`                           | 현재 날짜와 시간                       |
| `CURDATE()`                       | 현재 날짜                              |
| `DATE(datetime)`                  | 날짜/시간 값에서 날짜 부분만 추출      |
| `DATE_ADD(date, INTERVAL ...)`    | 날짜/시간 더하기                       |
| `DATE_SUB(date, INTERVAL ...)`    | 날짜/시간 빼기                         |
| `DATEDIFF(date1, date2)`          | 두 날짜의 일수 차이                    |
| `DATE_FORMAT(date, format)`       | 날짜를 지정한 문자열 형식으로 변환     |
| `TIMESTAMPDIFF(unit, start, end)` | 지정한 단위로 두 날짜/시간의 차이 계산 |

---

### NOW, CURDATE

현재 날짜와 시간을 조회한다.

```sql
SELECT NOW();
```

예를 들면 다음과 같은 형태로 반환된다.

```text
2026-08-26 10:30:00
```

날짜만 필요하다면 `CURDATE()`를 사용할 수 있다.

```sql
SELECT CURDATE();
```

```text
2026-08-26
```

---

### DATE

`DATETIME`이나 `TIMESTAMP`에서 날짜 부분만 가져올 수 있다.

```sql
SELECT DATE('2026-08-26 10:30:00');
```

결과:

```text
2026-08-26
```

오늘 생성된 데이터만 조회한다면 다음과 같이 작성할 수도 있다.

```sql
SELECT *
FROM some_table
WHERE DATE(created_at) = CURDATE();
```

하지만 인덱스가 있는 `created_at` 컬럼에 함수를 직접 적용하면 인덱스를 효율적으로 사용하기 어려울 수 있다.

데이터가 많은 테이블에서는 다음처럼 범위 검색을 사용하는 방법을 고려할 수 있다.

```sql
SELECT *
FROM some_table
WHERE created_at >= CURDATE()
  AND created_at < DATE_ADD(CURDATE(), INTERVAL 1 DAY);
```

즉 다음 범위를 조회하는 것이다.

```text
오늘 00:00:00 이상
~
내일 00:00:00 미만
```

---

### DATE_ADD, DATE_SUB

특정 날짜에서 일정 기간을 더하거나 뺄 수 있다.

7일 후:

```sql
SELECT DATE_ADD('2026-08-26', INTERVAL 7 DAY);
```

결과:

```text
2026-09-02
```

7일 전:

```sql
SELECT DATE_SUB('2026-08-26', INTERVAL 7 DAY);
```

결과:

```text
2026-08-19
```

시간 단위도 사용할 수 있다.

```sql
SELECT DATE_ADD(NOW(), INTERVAL 2 HOUR);
```

이런 계산은 다음과 같은 서버 로직에서도 자주 사용할 수 있다.

```text
미니게임 도전 횟수 회복 시간
아이템 만료 시간
이벤트 종료 시간
보상 수령 가능 시간
쿨다운 종료 시간
```

---

### DATEDIFF

두 날짜 사이의 일수 차이를 구한다.

```sql
SELECT DATEDIFF(
    '2026-08-25',
    '2026-08-20'
);
```

결과:

```text
5
```

`DATEDIFF()`는 날짜 부분을 기준으로 일수 차이를 계산한다.

시간이나 분 단위로 차이를 계산하고 싶다면 `TIMESTAMPDIFF()`를 사용할 수 있다.

```sql
SELECT TIMESTAMPDIFF(
    HOUR,
    '2026-08-25 10:00:00',
    '2026-08-25 22:00:00'
);
```

결과:

```text
12
```

분 단위도 가능하다.

```sql
SELECT TIMESTAMPDIFF(
    MINUTE,
    '2026-08-25 10:00:00',
    '2026-08-25 10:30:00'
);
```

결과:

```text
30
```

---

### DATE_FORMAT

날짜를 원하는 문자열 형식으로 변환한다.

```sql
SELECT DATE_FORMAT(
    '2026-08-25 22:30:00',
    '%Y-%m-%d'
);
```

결과:

```text
2026-08-25
```

시간까지 표현할 수도 있다.

```sql
SELECT DATE_FORMAT(
    '2026-08-25 22:30:00',
    '%Y-%m-%d %H:%i:%s'
);
```

결과:

```text
2026-08-25 22:30:00
```

TypeORM QueryBuilder에서도 SQL 함수를 그대로 사용할 수 있다.

```typescript
this.empRepository
  .createQueryBuilder("e")
  .select("e.empName", "empName")
  .addSelect("DATE_FORMAT(e.hireDate, '%Y-%m-%d')", "hireDate")
  .getRawMany();
```

> `NOW()`, `CURDATE()` 같은 현재 시각 함수는 DB 세션의 타임존 설정과 관련이 있다.
>
> 백엔드 애플리케이션과 DB 서버의 타임존이 다르면 날짜 경계나 이벤트 종료 시각이 달라질 수 있으므로 서버의 타임존 정책을 함께 확인해야 한다.

---

## 형변환 함수

데이터의 타입을 다른 타입으로 변환해야 하는 경우가 있다.

MySQL에서는 대표적으로 `CAST()`와 `CONVERT()`를 사용할 수 있다.

---

### CAST

문자열을 숫자로 변환한다.

```sql
SELECT CAST('123' AS UNSIGNED);
```

결과:

```text
123
```

문자열을 DATE로 변환할 수도 있다.

```sql
SELECT CAST('2026-08-25' AS DATE);
```

숫자를 문자열로 변환할 수도 있다.

```sql
SELECT CAST(123 AS CHAR);
```

TypeORM에서는 별도의 CAST 전용 API를 사용하는 것이 아니라 QueryBuilder 안에 SQL 표현식을 작성할 수 있다.

```typescript
this.empRepository
  .createQueryBuilder("e")
  .select("e.empName", "empName")
  .addSelect("CAST(e.age AS CHAR)", "ageText")
  .getRawMany();
```

---

### CONVERT

`CONVERT()`도 데이터형을 변환할 때 사용할 수 있다.

```sql
SELECT CONVERT('123', UNSIGNED);
```

결과:

```text
123
```

`CAST()`와 비슷한 역할을 한다.

문자셋을 변환할 때도 `CONVERT()`를 사용할 수 있다.

```sql
SELECT CONVERT('hello' USING utf8mb4);
```

> DB가 자동으로 형변환해주는 경우도 있지만, 데이터형을 명시한 코드가 일반적으로 의도를 파악하기 쉽다.
>
> 숫자와 문자열을 혼합해서 비교하는 조건에서는 암묵적 형변환에 지나치게 의존하지 않는 것이 좋다.

---

## NULL 처리 함수

SQL에서 `NULL`은 `0`이나 빈 문자열과 다르다.

`NULL`은 **값이 없거나 알 수 없는 상태**를 의미한다.

따라서 다음과 같이 비교하면 안 된다.

```sql
-- 잘못된 방법
WHERE age = NULL
```

NULL 여부는 `IS NULL` 또는 `IS NOT NULL`로 확인한다.

```sql
SELECT *
FROM emp03
WHERE age IS NULL;
```

```sql
SELECT *
FROM emp03
WHERE age IS NOT NULL;
```

---

### IFNULL

첫 번째 값이 NULL이면 두 번째 값을 반환한다.

```sql
SELECT IFNULL(NULL, 0);
```

결과:

```text
0
```

컬럼에도 사용할 수 있다.

```sql
SELECT
    emp_name,
    IFNULL(age, 0) AS age
FROM emp03;
```

TypeORM:

```typescript
this.empRepository
  .createQueryBuilder("e")
  .select("e.empName", "empName")
  .addSelect("IFNULL(e.age, 0)", "age")
  .getRawMany();
```

---

### COALESCE

`COALESCE()`는 전달한 값 중 **가장 먼저 등장하는 NULL이 아닌 값**을 반환한다.

```sql
SELECT COALESCE(
    NULL,
    NULL,
    100,
    200
);
```

결과:

```text
100
```

예를 들어 닉네임이 없으면 이름을 보여주고, 이름도 없으면 기본 문자열을 보여줄 수 있다.

```sql
SELECT
    COALESCE(
        nickname,
        emp_name,
        '이름 없음'
    ) AS display_name
FROM emp03;
```

`IFNULL()`은 두 값을 처리할 때 간단하고, `COALESCE()`는 여러 후보 값 중 하나를 선택할 때 편리하다.

---

## 조건에 따라 값을 반환하는 CASE

SQL에서도 조건에 따라 다른 값을 반환할 수 있다.

```sql
SELECT
    emp_name,
    age,
    CASE
        WHEN age >= 50 THEN '50대 이상'
        WHEN age >= 40 THEN '40대'
        WHEN age >= 30 THEN '30대'
        ELSE '30대 미만'
    END AS age_group
FROM emp03;
```

예를 들어 다음과 같은 결과가 나온다.

```text
홍길동   33   30대
김유신   44   40대
강감찬   55   50대 이상
```

TypeORM에서도 CASE 표현식을 그대로 사용할 수 있다.

```typescript
this.empRepository
  .createQueryBuilder("e")
  .select("e.empName", "empName")
  .addSelect("e.age", "age")
  .addSelect(
    `
    CASE
      WHEN e.age >= 50 THEN '50대 이상'
      WHEN e.age >= 40 THEN '40대'
      WHEN e.age >= 30 THEN '30대'
      ELSE '30대 미만'
    END
    `,
    "ageGroup",
  )
  .getRawMany();
```

CASE는 실무에서 다음과 같은 데이터 가공에 자주 사용할 수 있다.

```text
상태 코드 → 화면에 표시할 상태명
점수 → 등급
가격 → 가격 구간
NULL 여부 → 기본 표시값
랭킹 → 특정 순위 구간
```

---

## 다중행 함수(집계 함수)

지금까지의 함수는 각각의 로우를 하나씩 처리하는 단일행 함수였다.

집계 함수는 여러 로우를 하나의 집합으로 보고 하나의 결과를 계산한다.

| 함수                     | 역할                            |
| ------------------------ | ------------------------------- |
| `COUNT(*)`               | 전체 로우 수                    |
| `COUNT(column)`          | 해당 컬럼이 NULL이 아닌 로우 수 |
| `COUNT(DISTINCT column)` | 중복을 제거한 값의 개수         |
| `SUM(column)`            | 합계                            |
| `AVG(column)`            | 평균                            |
| `MAX(column)`            | 최댓값                          |
| `MIN(column)`            | 최솟값                          |

---

### COUNT

전체 사원 수를 구한다.

```sql
SELECT COUNT(*)
FROM emp03;
```

`COUNT(*)`는 조회된 **로우 자체의 개수**를 센다.

특정 컬럼을 지정할 수도 있다.

```sql
SELECT COUNT(age)
FROM emp03;
```

이 경우 `age`가 NULL인 로우는 개수에서 제외된다.

따라서 다음 두 쿼리는 결과가 다를 수 있다.

```sql
SELECT COUNT(*)
FROM emp03;

SELECT COUNT(age)
FROM emp03;
```

중복을 제거한 값의 개수를 구할 수도 있다.

```sql
SELECT COUNT(DISTINCT gender)
FROM emp03;
```

---

### SUM, AVG

나이의 합계를 구한다.

```sql
SELECT SUM(age)
FROM emp03;
```

평균을 구한다.

```sql
SELECT AVG(age)
FROM emp03;
```

한 번에 여러 집계 결과를 가져올 수도 있다.

```sql
SELECT
    COUNT(*) AS employee_count,
    SUM(age) AS total_age,
    AVG(age) AS average_age,
    MAX(age) AS max_age,
    MIN(age) AS min_age
FROM emp03;
```

TypeORM에서는 다음과 같이 작성할 수 있다.

```typescript
this.empRepository
  .createQueryBuilder("e")
  .select("COUNT(*)", "employeeCount")
  .addSelect("SUM(e.age)", "totalAge")
  .addSelect("AVG(e.age)", "averageAge")
  .addSelect("MAX(e.age)", "maxAge")
  .addSelect("MIN(e.age)", "minAge")
  .getRawOne();
```

집계 함수로 계산된 값은 Entity에 정의된 컬럼이 아니므로 `getRawOne()`이나 `getRawMany()`를 사용하는 경우가 많다.

```text
getRawOne()
→ 집계 결과가 한 건
getRawMany()
→ GROUP BY 등으로 집계 결과가 여러 건
```

---

### GROUP BY와 함께 사용

집계 함수는 전체 데이터에 사용할 수도 있지만 `GROUP BY`와 함께 사용하면 특정 기준으로 데이터를 묶어서 계산할 수 있다.

성별로 사원 수를 계산해보자.

```sql
SELECT
    gender,
    COUNT(*) AS employee_count
FROM emp03
GROUP BY gender;
```

예를 들어 결과는 다음과 같다.

```text
gender   employee_count

남성     3
여성     2
```

TypeORM에서는 다음과 같이 작성할 수 있다.

```typescript
this.empRepository
  .createQueryBuilder("e")
  .select("e.gender", "gender")
  .addSelect("COUNT(*)", "employeeCount")
  .groupBy("e.gender")
  .getRawMany();
```

> `SUM()`, `AVG()`, `MAX()`, `MIN()` 같은 일반적인 집계 함수는 NULL 값을 제외하고 계산한다.
>
> `COUNT(*)`는 특정 컬럼을 계산하는 것이 아니라 로우 자체의 개수를 세기 때문에 컬럼의 NULL 여부와 관계없이 로우 수를 센다.

`GROUP BY`, `HAVING`, 여러 집계 함수를 조합하는 방법은 **7장 데이터 집계**에서 더 자세히 다룬다.

---

## 정리 내용

- SQL 연산자는 산술, 비교, 논리 연산 등을 수행한다.
- MySQL에서 문자열을 연결할 때 `CONCAT()`을 사용할 수 있다.
- `CONCAT()`은 인자 중 하나가 NULL이면 결과도 NULL이 될 수 있으므로 주의해야 한다.
- 숫자형 함수에는 `ROUND()`, `TRUNCATE()`, `MOD()`, `ABS()`, `CEIL()`, `FLOOR()` 등이 있다.
- MySQL 숫자 절삭 함수는 `TRUNCATE()`다.
- `ROUND()`는 반올림하고 `TRUNCATE()`는 지정한 자리 이후를 절삭한다.
- `MOD()`는 나머지를 계산한다.
- `LENGTH()`는 문자열의 바이트 길이를 반환한다.
- 실제 문자 개수가 필요하다면 `CHAR_LENGTH()`를 사용한다.
- `SUBSTR()`는 문자열 일부를 추출한다.
- `TRIM()`은 문자열 앞뒤의 공백을 제거한다.
- `INSTR()`는 문자열 위치를 반환하며 찾지 못하면 `0`을 반환한다.
- 날짜형 함수에는 `NOW()`, `CURDATE()`, `DATE_ADD()`, `DATE_SUB()`, `DATEDIFF()`, `DATE_FORMAT()`, `TIMESTAMPDIFF()` 등이 있다.
- 날짜/시간 컬럼에 함수를 직접 적용하면 인덱스를 효율적으로 활용하지 못할 수 있으므로 범위 조건을 고려할 수 있다.
- `CAST()`와 `CONVERT()`를 사용하면 데이터형을 명시적으로 변환할 수 있다.
- NULL은 `= NULL`이 아니라 `IS NULL`, `IS NOT NULL`로 확인한다.
- `IFNULL()`은 NULL일 때 사용할 기본값을 지정할 수 있다.
- `COALESCE()`는 여러 값 중 첫 번째 NULL이 아닌 값을 반환한다.
- `CASE` 표현식을 사용하면 조건에 따라 서로 다른 값을 반환할 수 있다.
- 집계 함수에는 `COUNT()`, `SUM()`, `AVG()`, `MAX()`, `MIN()` 등이 있다.
- `COUNT(*)`와 `COUNT(column)`은 NULL 처리 방식에 차이가 있다.
- `COUNT(DISTINCT column)`을 사용하면 중복되지 않는 값의 개수를 구할 수 있다.
- 집계 함수는 `GROUP BY`와 함께 사용하면 특정 기준별 통계를 계산할 수 있다.
- TypeORM에서는 DB 함수를 별도 메서드로 감싸기보다 QueryBuilder의 `select()`, `addSelect()` 안에 SQL 표현식을 직접 사용하는 경우가 많다.
- 집계 결과처럼 Entity에 직접 존재하지 않는 값을 조회할 때는 `getRawOne()` 또는 `getRawMany()`를 사용할 수 있다.
