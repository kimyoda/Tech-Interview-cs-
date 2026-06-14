# 🌐 NestJS — Controller-Service 구조와 의존성 주입 흐름 이해

## NestJS의 기본 계층 구조

NestJS는 역할을 명확하게 분리하는 **계층형 아키텍처**를 권장한다

```
클라이언트 요청
      ↓
  Controller     ← 요청/응답 처리 (라우팅)
      ↓
   Service       ← 비즈니스 로직
      ↓
  Repository     ← DB 접근 (TypeORM, Prisma 등)
      ↓
   Database
```

각 계층은 자신의 역할만 수행, 다른 계층에 의존할 때는 **직접 생성하지 않고 주입받는다**

---

## Controller란?

Controller는 **HTTP 요청을 받아 적절한 Service 메서드를 호출하고 응답을 반환**하는 역할을 한다
비지니스 로직은 여기서 처리하지 않는다.

```ts
// user.controller.ts
import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.userService.findOne(+id);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
}
```

### Controller의 책임 범위

| 해야 할 일                | 하지 말아야 할 일  |
| ------------------------- | ------------------ |
| 라우팅 경로 정의          | DB 쿼리 직접 실행  |
| 요청 파라미터 파싱        | 복잡한 데이터 가공 |
| DTO 바인딩                | 외부 API 직접 호출 |
| Service 호출 및 응답 반환 | 비즈니스 규칙 처리 |

### Service

Service는 **비지니스 로직을 처리**하는 계층이다.
`@Injectable()` 데코레이터를 붙이면 NestJS의 IoC 컨테이너가 이 클래스를 관리한다

```ts
// user.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, // Repository도 주입받음
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!User) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }
}
```

Service 책임 범위

| 해야 할 일                       | 하지 말아야 할 일         |
| -------------------------------- | ------------------------- |
| 비즈니스 규칙 처리               | HTTP 요청/응답 직접 조작  |
| 데이터 가공 및 변환              | `@Req()`, `@Res()` 사용   |
| 예외 처리 (NotFoundException 등) | 라우팅 관련 로직          |
| Repository 호출                  | 다른 Controller 직접 참조 |

---

## 의존성 주입(DI)

#### 의존성 주입이란?

의존성 주입(Dependency Injection)이란 **객체가 필요로 하는 의존성(다른 객체)을 외부에서 제공받는 패턴**이다.

```ts
// 의존성 주입 없이 직접 생성
export class UserController {
  private userService = new UserService(); // 강한 결합, 테스트 어려움
}

// 의존성 주입 사용
export class UserController {
  constructor(private readonly userService: UserService) {} // 외부에서 주입
}
```

#### NestJS의 컨테이너

NestJS는 내부적으로 **IoC(Inversion of Control)컨테이너** 를 가진다.
`@Injectable()` 붙은 클래스를 컨테이너가 직접 인스턴스하고 생명주기를 관리한다.

```
[ IoC 컨테이너 ]
      │
      ├── UserService 인스턴스 생성 및 보관
      ├── UserRepository 인스턴스 생성 및 보관
      └── UserController 생성 시 → UserService 자동 주입
```

#### 주입 방식 3가지

**1. 생성자 주입(Constructor Injection)**

```ts
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
  ) {}
}
```

가장 일반적이고, 의존성이 명확하게 드러나고 테스트 시 Mock으로 교체하기 쉽다.

**2. 속성 주입(Property Injection)**

```ts
@Injectable()
export class UserService {
  @Inject(MailService)
  private readonly mailService: MailService;
}
```

순환 의존성 문제를 우회할 때 드물게 사용한다

**3. 커스텀 프로바이더**

```ts
// 인터페이스 기반 주입 — 구현체를 교체하기 쉬움
{
  provide: 'USER_REPOSITORY',
  useClass: UserRepository,
}

// 값 주입
{
  provide: 'APP_CONFIG',
  useValue: { timeout: 3000 },
}

// 팩토리 함수로 생성
{
  provide: 'DB_CONNECTION',
  useFactory: async (config: ConfigService) => {
    return createConnection(config.get('DATABASE_URL'));
  },
  inject: [ConfigService],
}
```

---

## Module

NestJS에서 Controller, Service, Repository는 Module 단위로 묶여 관리된다
Module은 해당 기능에 필요한 모든 구성 요소를 선언, 다른 Module에 노출할 범위를 결정한다

```ts
// user.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { User } from "./entities/user.entity";

@Module({
  import: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModuel {}
```

Module 간 의존성 관계

```
AppModule
  ├── UserModule
  │     ├── UserController
  │     ├── UserService  (exports로 외부 공개)
  │     └── UserRepository
  │
  └── OrderModule
        ├── OrderController
        ├── OrderService
        └── imports: [UserModule]  ← UserService를 주입받아 사용 가능
```

---

## 요청 흐름 정리

실제 `GET/users/1` 요청이 들어왔을 때 내부 흐름을 정리해봤다.

```
1. 클라이언트 -> GET /users/1

2. NestJS 라우터
   └── @Controller('users') + @Get(':id') 매칭
   └── UserController.findOne(id = '1') 호출

3. UserController.findOne()
   └── this.userService.findOne(1) 호출
       (userService는 생성자에서 주입된 인스턴스)

4. UserService.findOne(1)
   └── this.userRepository.findOne({ where: { id: 1 } }) 호출
   └── 결과 없으면 NotFoundException 던짐
   └── 결과 있으면 User 엔티티 반환

5. UserController
   └── Service에서 받은 User 객체를 JSON으로 직렬화하여 응답

6. 클라이언트  ←  200 OK { id: 1, name: "...", ... }
```

---

## new를 쓰지 않는 이유

직접 `new`를 인스턴스를 생성하면 다음 이슈가 있다.

**1. 테스트가 어렵다**

```ts
// 직접 생성 — 테스트 시 실제 DB가 필요함
export class UserController {
  private userService = new UserService(new UserRepository(...));
}

// 주입 — 테스트 시 Mock으로 교체 가능
describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: { findAll: jest.fn().mockResolvedValue([]) },  // Mock 주입
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });
});
```

**2. 싱글톤 보장이 어렵다**
NestJS의 IoC 컨테이너는 기본적으로 Provider를 싱글톤으로 관리한다
`new`를 쓰면 호출마다 새 인스턴스가 생성되어 상태 공유나 메모리 낭비가 발생한다

**3. 의존성 변경 시 수정 범위가 커진다**

```ts
// UserService 생성자가 바뀌면 new하는 모든 곳을 수정해야 함
private userService = new UserService(dep1, dep2, dep3);

// 주입 방식은 컨테이너가 알아서 처리
constructor(private readonly userService: UserService) {}
```

---

| 구성 요소      | 역할                               | 핵심 데코레이터 |
| -------------- | ---------------------------------- | --------------- |
| **Controller** | HTTP 요청 수신 및 응답 반환        | `@Controller()` |
| **Service**    | 비즈니스 로직 처리                 | `@Injectable()` |
| **Module**     | 구성 요소 묶음 및 의존성 범위 선언 | `@Module()`     |

```
핵심 원칙
  ├── Controller는 얇게 (Thin Controller)
  ├── Service는 두껍게 (Fat Service)
  ├── 의존성은 항상 주입받아라 (new 금지)
  └── Module 단위로 캡슐화하라
```

의존성 주입을 제대로 활용하면 **테스트 용이성**, **결합도 감소**, **유지보수성 향상** 세 가지를 동시에 얻을 수 있다.
