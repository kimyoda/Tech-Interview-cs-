# 테스트 코드, NestJS / Node.js 실제적용

> [!NOTE]
> TDD를 이용한 개발, 코드 변경에 대한 안전한 방지

---

## 테스트 코드란?

테스트 코드(Test Code)는 **개발한 소프트웨어가 예상대로 동작하는지 자동으로 검증하는 코드**다.

`console.log()` 눈으로 확인하는 방식과 가장 큰 차이는 **반복 실행 가능성**과 **자동 회귀 감지**다.

```
내가 짠 코드 -> 호출 -> 테스트 코드 -> 비교 -> 기대값 === 실제값
PASS / FAIL 둘중 하나
```

코드를 수정할 때마다 직접 브라우저를 열고 클릭해서 확인할 필요 없이, 커맨드 하나로 전체 동작을 자동 검증하여 코드의 안정성을 높일 수 있다.

```bash
# NestJS / Node.js 테스트 실행
npm run test # 전체 테스트
npm run test:watch # 파일 변경 감지, 자동 재실행
npm run test:cov # 커버리지 리포트 생성
```

---

## 테스트의 3가지 종류

테스트는 일반적으로 **단위 테스트 -> 통합 테스트 -> 기능(E2E) 테스트** 순으로 범위가 넓어지고 보통은 단위테스트 위주로 진행한다.

```

단위 테스트 - 빠름, 독립적
통합 테스트 - 보통
E2E - 느림, 실제 환경 느낌
```

### 단위 테스트 (Unit Test)

프로그램의 **개별 단위(함수, 메서드, 클래스)**가 정상 동작하는 지 검증한다.
외부 의존성(DB, 네트워크)은 Mock 객체로 대체해서 해당 로직만 격리하여 테스트한다.
가장 많이 활용되는 테스트코드다

| 특징      | 설명                       |
| --------- | -------------------------- |
| 실행 속도 | 매우 빠름                  |
| 의존성    | 없음 (Mocking 활용)        |
| 목적      | 함수/메서드 단위 로직 검증 |
| 도구      | Jest, Vitest, Mocha        |

### 통합 테스트 (Integration Test)

**여러 모듈이 함꼐 올바르게 동작하는지** 검증한다. 실제 DB, 외부 API, 파일 시스템 등 실제 환경과의 연동을 포함한다

| 특징      | 설명                             |
| --------- | -------------------------------- |
| 실행 속도 | 보통                             |
| 의존성    | 있음 (실제 DB, API)              |
| 목적      | 모듈 간 연동 검증                |
| 도구      | Jest + Supertest, TestContainers |

### 기능 테스트 / E2E 테스트 (End-to-End Test)

**애플리케이션 전체 흐름**을 실제 사용자 관점에서 검증한다.
로그인 -> 데이터 조회 -> 결제 같은 흐름 전체를 시뮬레이션 한다

| 특징      | 설명                                  |
| --------- | ------------------------------------- |
| 실행 속도 | 느림                                  |
| 의존성    | 실제 운영 환경과 유사                 |
| 목적      | 전체 사용자 플로우 검증               |
| 도구      | Jest + Supertest, Playwright, Cypress |

---

## 테스트 코드 작성 시 주의사항

### 단일 책임 원칙 - 하나의 테스트는 하나만 검증

하나의 테스트에 여러 기능을 동시에 검증하면, 어디서 실패했는지 파악하기 어렵다.

```ts
// 하나의 테스트에 너무 많은 검증
if (
  ("유저 서비스 테스트",
  async () => {
    const user = await userService.create({
      email: "a@a.com",
      password: "1234",
    });
    expect(user).toBeDefined();

    const found = await userService.findById(user.id);
    expect(found.email).toBe("a@a.com");

    await userService.delete(user.id);
    const deleted = await userService.findById(user.id);
    expect(deleted).toBeNull();
  })
);

// 하나의 테스트
if (
  ("유저를 정상적으로 생성한다",
  async () => {
    const user = await userService.create({
      email: "a@a.com",
      password: "1234",
    });

    expect(user).toBeDefined();
    expect(user.email).toBe("a@a.com");
  })
);

if (
  ("존재하지 않은 유저 조회 시 null을 반화한다",
  async () => {
    const found = await userService.findById(999);
    expect(found).toBeNull();
  })
);
```

### 테스트 격리 - 각 테스트는 독립적으로 실행

이전 테스트 결과에 의존하거나 공유 상태를 변경, 테스트 실행 순서에 따라 결과가 달라진다

```ts
// beforeEach로 각 테스트 전 상태 초기화
desribe("UserService", () => {
  beforeEach(async () => {
    await userRepository.clear(); // DB 초기화
    jest.clearAllMocks(); // Mock 상태 초기화
  });
});
```

### 테스트 메소드명으로 이해되기 쉽도록 하기

메소드명만 읽어도 어떤 조건에서 어떤 결과를 기대하는지 파악 가능해야 한다

```ts
// 어떤 테스트인지 모른다
it('score test', () => { ...});

// 조건과 기대 결과가 이름에 담겨 있다
it('PRACTICE 모드 점수는 글로벌 미션 집계에서 제외된다', () => { ... });
it('활성 스케줄이 없을 때 커맨드는 성공(exit code 0)으로 종료된다', () => { ... });
it('비참여 유저에게는 글로벌 미션 보상을 지급하지 않는다', () => { ... });
```

---

## AAA 패턴 - Arrange / Act / Assert

---
