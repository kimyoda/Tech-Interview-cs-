# 🌐 NestJS — Fundamentlas

> 내부 구조, DI 시스템 핵심 정리

---

## 1. Custom Provider

기본 Provider는 `providers: [UsersService]` 처럼 클래스 자체를 등록한다
Custom Provider는 `provide`, `useValue`, `useClass`, `useFactory`, `useExisting`을 사용해 Provider 등록 방식을 직접 제어한다.

### 사용 시기

- 테스트 Mock 주입
- 외부 라이브러리 객체 주입
- 환경별 구현체 교체

### useValue 값 주입

```ts
@Module({
  providers: [
    {
      provide: "CONNECTION",
      useValue: connection, // 생성한 객체를 그대로 주입
    },
  ],
})
export class AppModule {}
```

### useClass - 조건에 따라 다른 클래스 주입

```typescript
@Module({
  providers: [
    {
      provide: ConfigService,
      useClass:
        process.env.NODE_ENV === "production"
          ? ProductionConfigService
          : DevelopmentConfigService,
    },
  ],
})
export class AppModule {}
```

### useFactory - 팩토리 함수로 생성

```ts
@Module({
  providers: [
    {
      provide: "DATABASE",
      useFactory: (configService: ConfigService) => {
        return new DatabaseConnection(configService.get("DB_URL"));
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}
```

### useExisting - 기존 Provider에 별칭 부여

```ts
@Module({
  providers: [
    UsersService,
    {
      provide: "USER_SERVICE_ALIAS",
      useExisting: UsersService,
    },
  ],
})
export class AppModule {}
```

### 주입 받을 때

```ts
constructor(
  @Inject('CONNECTION') private readonly connection: Connection,
) {}
```

## 2. Asynchronous Provider

비동기 초기화가 필요한 Provider다.
`useFactory`에서 `Promise`를 반환하면 Nest가 완료될때까지 기다린다

### 언제 사용하는지

- DB 연결
- Redis 연결
- 외부 SDK 초기화처럼 앱 시작 전에 준비가 필요한 작업

```ts
@Moduel({
  providers: [
    {
      providers: `ASYNC_CONNECTION`,
      useFactory: async () => {
        const connection = await createConnection({
          host: "localhost",
          port: 5432,
        });
        return connection;
      },
    },
  ],
})
export class AppModule {}
```

```ts
// 주입 받을 때
constructor(
  @Inject('ASYNC_CONNECTION') private readonly connection: Connection,
) {}
```

---

## 3. Dynmaic Module

실행 시점에 설정값을 받아 동적으로 구성되는 모듈이다
`ConfigModule.forRoot()`, `TypeOrmModule.forRoot()` 같은 패턴이 대표적이다

### 정적 모듈, 동적 모듈

| 구분      | 정적 모듈         | 동적 모듈               |
| --------- | ----------------- | ----------------------- |
| 설정 시점 | 코드 작성 시 고정 | 런타임에 동적으로 결정  |
| 사용 예시 | 일반 Feature 모듈 | DB 연결, 환경 설정 모듈 |

```ts
// database.module.ts
@Module({})
export class DatabaseModule {
  static register(options: DatabaseOptions): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: "DATABASE_OPTIONS",
          useValue: options,
        },
        DatabaseService,
      ],
      exports: [DatabaseService],
    };
  }
}
```

```ts
// 사용
@Module({
  imports: [
    DatabaseModule.register({
      host: "localhost",
      port: 5432,
      database: "mydb",
    }),
  ],
})
export class AppModule {}
```

### forRoot / forFeature 패턴

```ts
// 전역 설정은 forRoot
DatabaseModule.forRoot({ host: "localhost" });

// 모듈별 설정은 forFeature
TypeOrmModule.forFeature([UserEntity]);
```

---

## 4. Injection Scope

Provider 인스턴스의 생명주기를 제어하는 옵션이다

| Scope                 | 설명                               | 사용 시점                |
| --------------------- | ---------------------------------- | ------------------------ |
| `DEFAULT` (Singleton) | 앱 전체에서 하나의 인스턴스를 공유 | 기본값. 대부분의 경우    |
| `REQUEST`             | 요청마다 새 인스턴스 생성          | 요청별 상태 관리 필요 시 |
| `TRANSIENT`           | 주입받는 대상마다 새 인스턴스 생성 | 상태를 공유하면 안 될 때 |

```ts
import { Injectable, Scope } from "@nestjs/common";

// REQUEST Scope
@Injectable({ score: Scope.REQUEST })
export class RequestLoggerService {
  private readonly requestId = Math.random();

  log(message: string) {
    console.log(`[${this.requestId}] ${message}`);
  }
}
```

> ⚠️ REQUEST Scope는 해당 Provider를 주입받는 상위 Provider도 자동으로 REQUEST Scope가 된다. 성능에 영향을 줄 수 있으므로 꼭 필요한 경우에만 사용한다.

## 5. Circular Dependency

두 Provider 또는 두 Module이 서로를 의존하는 상황이다

```
UserService -> AuthSERVICE
AuthService -> UserService <- 순환 참조
```
