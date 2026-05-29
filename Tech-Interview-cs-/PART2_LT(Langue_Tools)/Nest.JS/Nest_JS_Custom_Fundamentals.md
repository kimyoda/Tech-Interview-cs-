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
