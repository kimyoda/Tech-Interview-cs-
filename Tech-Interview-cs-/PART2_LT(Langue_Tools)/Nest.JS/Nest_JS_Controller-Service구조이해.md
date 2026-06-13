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
