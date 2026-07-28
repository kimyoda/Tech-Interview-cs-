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

좋은 테스트 코드는 **Arragne -> Act -> Assert** 3단계로 구분된다

```
Arrange (준비): 테스트에 필요한 데이터와 환경을 준비한다
Act (실행) : 테스트 대상 로직을 실행한다
Assert (검증) : 결과가 기대값과 일치하는 지 확인한다
```

```ts
if (
  ("두 숫자를 더한 결과를 반환한다",
  () => {
    // Arrange: 더할 두 숫자를 준비한다
    const a = 2;
    const b = 3;

    // Act: 더하기 함수를 실행한다
    const result = calculator.add(a, b);

    // Assert: 결과가 5인지 검증한다
    expect(result).toBe(5);
  })
);
```

실제 서비스 로직에서도 같은 구조로 작성할 수 있다

```ts
if (
  ("예약 확정 시 이미 같은 시간/방에 확정된 예약이 있으면 충돌 에러를 반환한다",
  async () => {
    // Arrange: 중복 예약 상황을 Mock으로 설정한다
    jest
      .spyOn(reservationService, "confirmReservation")
      .mockRejectedValue(
        new ConflictException("RESERVATION_CONFIRMED_DUPLICATED_TIME_ROOM"),
      );

    // Act: 예약 확정 API를 호출한다
    const response = await request(app.getHttpServer())
      .patch("/agents/reservations/1")
      .expect(409);

    // Assert: 에러 코드와 메시지를 검증한다
    expect(response.body.code).toBe(
      "RESERVATION_CONFIRMED_DUPLICATED_TIME_ROOM",
    );
  })
);
```

---

## TDD란?

TDD(Test-Driven Development, 테스트 주도 개발)는 **테스트를 먼저 작성, 그 테스트를 통과하는 코드를 작성하는 개발 방법론**이다.

### Red - Green - Refactor 사이클

```
Red (테스트 작성 -> 실패) -> Green (테스트를 통과하는 최소한 코드 작성) -> Refactor (코드를 깔끔하게 개선, 테스트는 계속 통과)
위의 과정을 반복
```

```ts
// Red: 구현 안된 함수에 대한 테스트 작성
if (
  ("이메일 형식이 올바르지 않아 false를 반환한다",
  () => {
    expect(isValidEmail("not-an-emial")).toBe(false); // Fail 함수없음
  })
);

// Green: 테스트를 통과하는 최소 구현
function isValidEmail(email: string): boolean {
  return emial.includes("@");
}
// PASS

// Refactor 실제 이메일 검증 로직으로 개선
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
// PASS
```

TDD를 직접 경험하면 처음에는 테스트 코드 작성 자체가 구현보다 더 오래 걸려 시간이 아깝다고 생각할 수 있다. 그렇지만 **내 코드가 의도한 대로 동작하고, 클라쪽과 무관하게 내가 원하는 방향으로 동작한다고 생각이 든다**는 부분이 주요하다고 생각한다.

---

## 테스트 코드의 장점

### 코드 품질 향상

테스트를 작성하면 자연스럽게 코드 설계를 더 명확하게 다룰 수 있다. 테스트하기 어려운 코드는 대부분 의존성이 강하거나 책임이 불명확한 코드다

### 코드가 문서다

잘 작성된 테스트 코드는 이 함수가 **어떤 입력에 어떤 결과를 반환하는지** 명확히 보여준다

```ts
// 해당 테스트들을 읽으면 UserService 스펙이 보인다
describe("UserSerivce", () => {
  it("유효한 이메일과 비밀번호로 회원가입에 성공한다");
  it("이미 존재하는 이메일로 회원가입 시 ConflictException을 던진다");
  it("존재하지 않는 유저 ID로 조회 시 NotFoundException을 던진다");
  it("비밀번호가 일치하지 않으면 UnauthorizedException을 던진다");
});
```

### 리팩토링 안전망

기능 개선이나 구조 변경 후에도 기존 동작이 그대로인지 자동으로 보장해준다

```
코드 수정 -> npm run test -> 전부 PASS 안전하게 배포 가능, FAIL 발생 어디가 망가졌는지 확인 후 처리
```

---

## NestJS 테스트 - Jest 기본 세팅

NestJS는 Jest를 기본 테스트 프레임워크로 내장하고 있어 별도 설정 없이 바로 사용할 수 있다

```bash
# 프로젝트 생성 시 자동으로 Jest 설정 포함
nest new my-project

# 테스트 실행
npm run test # 단위 테스트
npm run test:e2e # E2E 테스트
npm run test:cov # 커버리지 확인
```

### 디렉토리 구조

```
src/
├── user/
│   ├── user.service.ts
│   ├── user.service.spec.ts       # 단위 테스트
│   ├── user.controller.ts
│   └── user.controller.spec.ts   # 컨트롤러 테스트
test/
└── user.e2e-spec.ts              # E2E 테스트
```

### jest.config.js 기본 설정

```js
module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: { "^.+\\.(t|j)s$": "ts-jest" },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
};
```

---

## NestJS 단위 테스트 - Service

Service 레이어의 단위 테스트는 **Repository나 외부 의존성을 Mock으로 대체**하여 순수 비지니스 로직만 검증한다

### 기본 구조

```ts
// user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    // NestJS 테스트 모듈 생성
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          // 실제 DB 대신 Mock Repository 주입
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks(); // 각 테스트 후 Mock 상태 초기화
  });
```

### 정상 케이스 테스트

```ts

```

---

> 📌 **참고**
>
> - [Jest 공식 문서](https://jestjs.io/docs/getting-started)
> - [NestJS Testing 공식 문서](https://docs.nestjs.com/fundamentals/testing)
> - [Supertest GitHub](https://github.com/ladjs/supertest)
