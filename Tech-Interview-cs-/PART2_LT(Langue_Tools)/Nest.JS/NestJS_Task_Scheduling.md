# 🌐 NestJS Task Scheduling 실전

> NestJS 공식 문서 기반 | `@nestjs/schedule` 패키지로 배치 작업 자동화하기

---

## 1. NestJS Task Scheduling?

NestJS는 `@nestjs/schedule` 패키지를 통해 **코드(메서드/함수)를 특정 시각, 반복 주기, 혹은 일정 시간 이후에 자동으로 실행**하도록 스케줄링 할 수 있다.

> Linux 환경에서 OS레벨의 `cron`이 이를 담당,
> Node.js 앱에서는 `@nestjs/schedule` 이 동일한 역할을 프렝미워크 수준에서 제공한다
> 📌 공식 문서: https://docs.nestjs.com/techniques/task-scheduling

설치

```bash
npm install --save @nestjs/schedule
```

> 📌 공식 문서 기준 핵심 패키지는 `@nestjs/schedule`하나이다. 프로젝트 타입 설정이나 cron 패키지 버전에 따라 타입 에러가 발생하면 `@types/cron`을 별도로 추가 설치한다.
>
> ```bash
> npm install --save-dev @types/cron
> ```

**AppModule에 등록**
스케줄러를 활성하려면 루트 `AppModule`에 `ScheduleModule`을 임포트해야한다.

```ts
import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [
    ScheduleModule.forRoot(), // 스케줄러 초기화 및 등록
  ],
})
export class AppModuile {}
```

> `forRoot()` 호출 시 `onApplicationBootstrap` 라이프사이클 훅 시점에 모든 모듈이 로드된 뒤 스케줄 작업이 등록된다.

---

## 2. Scheduled Job(스케줄 작업)의 기본 구조
