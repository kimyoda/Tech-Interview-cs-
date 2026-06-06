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

NestJS에서 스케줄 작업(Scheduled Job)은 `@Injectable()` 서비스 클래스 안에 `@Cron()`, `@Interval()`, `@Timeout()` 데코레이터로 선언한다.

| 데코레이터          | 실행 방식                      |
| ------------------- | ------------------------------ |
| `@Cron(expression)` | cron 표현식으로 반복 실행      |
| `@Interval(ms)`     | N 밀리초마다 반복 실행         |
| `@Timeout(ms)`      | 앱 시작후 N 밀리초 뒤 1회 실행 |

---

## 3. 실전 예제 - 사용자 활동 점수 집계 Task

> 매일 자정, 캠페인에 참여한 사용자들의 호라동 포인트를 집계, Redis 캐시 스냅샷을 갱신하는 배치 작업

파일 구조

```
src/
└── batch/
    ├── batch.module.ts
    ├── user-activity/
    │   ├── user-activity-score.task.ts
    │   └── user-activity-score.service.ts
```

Task 클래스

```ts
// user-activity-score.task.ts
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { UserActivityScoreService } from "./user-activity-score.service";

@Injectable()
export class UserActivityScoreTask {
  private readonly logger = new Logger(UserActivityScoreTask.name);

  constructor(
    private readonly activityScoreService: UserActivityScoreService,
  ) {}
}

/**
 * 매일 자정 — 전체 캠페인 활동 점수 집계 및 Redis 스냅샷 갱신
 */
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
async aggregateaAllCampaignScores(): Promise<void> {
  this.logger.log('[시작] 전체 캠페인 활동 점수 집계');

  try {
    const results = await this.activityScoreService.aggregateaAll();

    for (const result of results) {
      this.loggger.log(
        `[완료] campaign_id=${result.campaignId} | score=${result.totalScore}` ,
      );
    }
  } catch (error) {
    this.logger.error('[오류] 캠페인 점수 집계 실패', (error as Error).stack);
  }
}

  /**
   * 특정 캠페인 단건 집계 (외부에서 직접 호출 가능)
   */
  async aggregateByCampaignId(campaignId: number): Promise<void> {
    this.logger.log(`[시작] 캠페인 단건 집계 | campaign_id=${campaignId}`);

    try {
      const result = await this.activityScoreService.aggregateOne(campaignId);
      this.logger.log(`[완료] ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error(
        `[오류] 캠페인 단건 집계 실패 | campaign_id=${campaignId}`,
        (error as Error).stack,
      );
    }
  }
```

Service 클래스

```ts
// user-activity-score.service.ts
import { Injectable } from "@nestjs/common";
import { InjectRedis } from "@nestjs-modules/ioredis";
import Redis from "ioredis";

export interface CampaignScoreResult {
  campaignId: number;
  totalScore: number;
  participantCount: number;
  snapshotUpdatedAt: string;
}

@Injectable()
export class UserActivityScoreService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async aggregateAll(): Promise<CampaignScoreResult[]> {
    // 실제 구현: DB에서 활성 캠페인 목록 조회 후 각각 집계
    const activeCampaignIds = await this.getActiveCampaignIds();

    // ⚠️ 대상이 많아지면 Promise.all()은 DB 쿼리와 Redis 쓰기가 동시에 폭발적으로 증가할 수 있습니다.
    // 운영 환경에서는 아래처럼 chunk 단위로 나누어 순차 처리하는 것이 안전합니다.
    const chunkSize = 10;
    const results: CampaignScoreResult[] = [];

    for (let i = 0; i < activeCampaignIds.length; i += chunkSize) {
      const chunk = activeCampaignIds.slice(i, i + chunkSize);
      const chunkResults = await Promise.all(
        chunk.map((id) => this.aggregateOne(id)),
      );
      results.push(...chunkResults);
    }

    return results;
  }

  async aggregateOne(campaignId: number): Promise<CampaignScoreResult> {
    // 실제 구현: 해당 캠페인의 활동 로그 집계 후 Redis 갱신
    const totalScore = await this.calcTotalScore(campaignId);
    const participantCount = await this.countParticipants(campaignId);
    const snapshotKey = `campaign:score:snapshot:${campaignId}`;

    await this.redis.set(
      snapshotKey,
      JSON.stringify({ totalScore, participantCount }),
      "EX",
      86400, // 24시간 TTL
    );

    return {
      campaignId,
      totalScore,
      participantCount,
      snapshotUpdatedAt: new Date().toISOString(),
    };
  }

  private async getActiveCampaignIds(): Promise<number[]> {
    // DB 조회 로직 (TypeORM / Prisma 등으로 구현)
    return [1, 2, 3];
  }

  private async calcTotalScore(campaignId: number): Promise<number> {
    // 실제 집계 쿼리 자리
    return campaignId * 100;
  }

  private async countParticipants(campaignId: number): Promise<number> {
    // 실제 집계 쿼리 자리
    return campaignId * 10;
  }
}
```

Module 등록

```ts
// batch.module.ts
import { Module } from "@nestjs/common";
import { UserActivityScoreTask } from "./user-activity/user-activity-score.task";
import { UserActivityScoreService } from "./user-activity/user-activity-score.service";

@Module({
  providers: [UserActivityScoreTask, UserActivityScoreService],
})
export class BatchModuel {}
```

---

## 4. 실전 예제 2 - 리그 순위 갱신 Task

> 10분 마다 현재 진행 중인 스포츠 리그 세션의 읿별 순위를 외부 데이터 기반으로 갱신하는 작업

```ts
// league-standings.task.ts
import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRedis } from "@nestjs-modules/ioredis";
import Redis from "ioredis";
import { LeagueSessionService } from "./league-session.service";
import { LeagueStandingsService } from "./league-standings.service";

@Injectable()
export class LeagueStandingsTask {
  private readonly logger = new Logger(LeagueStandingsTask.name);
  private readonly LOCK_KEY = "lock:league:standings:refresh";
  private readonly LOCK_TTL_SEC = 300; // 5분

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly sessionService: LeagueSessionService,
    private readonly standingsService: LeagueStandingsService,
  ) {}

  /**
   * 매 10분마다 — 진행 중인 리그 순위 갱신 (KST 기준)
   *
   * ✅ timeZone: 서버가 UTC로 떠 있어도 한국 시간 기준으로 실행됩니다.
   * ✅ Redis Lock: 다중 인스턴스 환경에서 중복 실행을 방지합니다.
   */
  @Cron("0 */10 * * * *", {
    name: "refreshLeagueStandings",
    timeZone: "Asia/Seoul",
  })
  async refreshDailyStandings(): Promise<void> {
    // Redis Lock 획득 시도 (SET NX EX - 원자적 연산)
    const acquired = await this.redis.set(
      this.LOCK_KEY,
      "1",
      "EX",
      this.LOCK_TTL_SEC,
      "NX",
    );

    if (!acquired) {
      this.logger.warn(
        "[스킵] 다른 인스턴스가 이미 실행 중입니다. (Redis Lock)",
      );
      return;
    }
    try {
      const asession = await this.sessionService.getActiveSession();

      if (!session) {
        this.logger.warn("[경고] 현재 진행 중인 리그 세션이 없습니다.");
        return;
      }
      this.logger.log(`[시작] 리그 순위 갱신 | session_id=${session.id}`);
      await this.standingsService.refreshDailyStandings(session.id);
      this.logger.log(`[완료] 리그 순위 갱신 | session_id=${session.id}`);
    } catch (error) {
      this.logger.error(`[오류] 리그 순위 갱신 실패`, (error as Error).stack);
    } finally {
      // 성공/실패와 무관하게 반드시 lock 해제
      await this.redis.del(this.LOCK_KEY);
    }
  }
}
```

Service 클래스

```ts
// league-standings.service.ts
import { Injectable } from "@nestjs/common";

export interface LeagueSession {
  id: number;
  name: string;
  isActive: boolean;
}

@Injectable()
export class LeagueSessionSevice {
  async getActiveSession(): Promise<LeagueSession | null> {
    // DB에서 isActive=true인 세션 조회
    return { id: 7, name: "2026 Spring League", isActive: true };
  }
}

@Injectable()
export class LeagueStandingsService {
  async refreshDailyStandings(sessionId: number): Promise<void> {
    // 실제 구현: 외부 API 호출 → 순위 계산 → DB/캐시 갱신
    console.log(`Refreshing standings for session ${sessionId}...`);
  }
}
```

---

## 5. Cron 표현식, CronExpression 상수

NestJS의 `@Cron()`은 일반 cron 표현식처럼 5자리로도 사용할 수 있고, 초 필드를 앞에 붙인 **6자리 표현식도 지원한다**
공식 문서 기준으로 seconds 필드는 **optional**이다.

```
[초]  *    *    *    *    *
      ┬    ┬    ┬    ┬    ┬
      │    │    │    │    └─ 요일 (0-7, 0·7=일요일)
      │    │    │    └────── 월 (1-12)
      │    │    └─────────── 일 (1-31)
      │    └──────────────── 시 (0-23)
      └───────────────────── 분 (0-59)

└─ seconds (optional, 0-59) — 붙이면 6자리, 생략하면 5자리
```

자주 쓰는 `CronExpression` 내장 함수 :

| 상수                                 | cron 표현식      | 실행 주기        |
| ------------------------------------ | ---------------- | ---------------- |
| `EVERY_SECOND`                       | `* * * * *`      | 매초             |
| `EVERY_10_SECONDS`                   | `*/10 * * * * *` | 10초마다         |
| `EVERY_MIUTE`                        | `0 * * * * *`    | 매분 정각        |
| `EVERY_HOUR`                         | `0 0 * * * *`    | 매시 정각        |
| `EVERY_DAY_ATMIDNIGHT`               | `0 0 0 * * *`    | 매일 자정        |
| `EVERY_DAY_AT_NOON`                  | `0 0 0 * * 0`    | 매주 일요일 자정 |
| `EVERY_WEEK`                         | `0 0 0 * * 0`    | 매주 일요일 자정 |
| `EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT` | `0 0 0 1 * *`    | 매월 1일 자정    |

---

## 6. Node.js 순수 환경

NestJS없이 node.js 사용하는 호나경이면 `node-cron` 패키지로 동일한 기능을 구현할 수 있다.

```bash
npm install node-cron
npm install --save-dev @types/node-cron
```

```ts
// scheduler.ts

import cron from "node-cron";
import { aggregateAllCampaignScores } from "./services/userActivityScoreService";
import { refreshLeagueStandings } from "./services/leagueStandingsService";

// 매일 자정 - 캠페인 점수 집계
cron.schedule("0 0 * * *", async () => {
  console.log("[시작] 캠페인 점수 집계");
  try {
    await aggregateAllCampaignScores();
    console.log("[완료] 캠페인 점수 집계");
  } catch (err) {
    console.error("[오류] 캠페인 접수 질계 실패:".err);
  }
});

// 매 10분마다 - 리그 순위 갱신
cron.schedule("*/10 * * * * ", async () => {
  console.log("[시작] 리그 순위 갱신");
  try {
    await refreshLeagueStandings();
    console.log("[완료] 리그 순위 갱신");
  } catch (err) {
    console.error("[오류] 리그 순위 갱신 실패:", err);
  }
});

console.log("스케줄러가 시작되었습니다.");
```

> node-cron은 일반적으로 5자리 cron 표현식을 사용하며, 버전에 따라 맨 앞에 초(seconds) 필드를 둔 6자리 표현식도 지원한다. NestJS 예제와 표현식을 혼동하지 않도록 사용하는 패키지 버전의 문법을 반드시 확인해야 한다.

---

## 7. 운영 환경 주의 - 다중 인스턴스와 중복 실행 방지

NestJS 스케줄러는 **애플리케이션 프로세스 내부에서 실행**된다. 즉, 서버 인스턴스(Pod)가 여러 개라면 **동일한 스케줄 작업이 인스턴스 수만큼 중복 실행**될 수 있다.
특히 랭킹 집계, 보상 지급, 시즌 종료 처리, 일일 초기화처럼 **한번만 실행되어야 하는 배치 작업**이 중복 실행되면 데이터 오염이나 장애로 직결된다.

**Laravel과 차이**
Laravel은 이를 위한 옵션을 공식적으로 제공한다

```php
$schedule->command('app:aggregate-user-activity-scores')
    ->daily()
    ->withoutOverlapping()   // 이전 실행이 끝나지 않았으면 스킵
    ->onOneServer();         // 다중 서버 중 단 하나의 서버에서만 실행
```

NestJS는 이와 동등한 기능을 직접 설계해야 한다.

**중복 실행 방지 전략**

| 전략                   | 설명                                             | 적합한 규모                        |
| ---------------------- | ------------------------------------------------ | ---------------------------------- |
| **Redis Lock**         | `SET NX EX`로 원차적 lock 획득, finally에서 해제 | 소-중규모, 빠르게 도입 가능        |
| **DB Lock**            | DB의 행 장금(SELECT FOR UPDATE 등) 활용          | Redis 없는 환경                    |
| **BullMQ**             | 큐 기반으로 단일 워커가 직업 소비                | 중~대규모, 재시도,모니터링 필요 시 |
| **전용 Batch Worker**  | 스케줄 전용 인스턴스를 별도로 띄워 격리          | 작업이 많고 안전성 중요 시         |
| **Kubernetes CronJob** | k8s 레벨에서 단일 Pod로 배치 작업 실행           | k8s 환경, 인프라로 해결 원할 때    |

### Redis Lock 흐름 요약

제 ②(`LeagueStandingsTask`)에서 이미 적용된 패턴의 흐름이다.

```
스케줄 실행
  → Redis에 lock key SET NX EX (원자적 획득 시도)
  → 이미 lock 존재 → 이번 실행 스킵 (warn 로그)
  → lock 획득 성공 → 배치 로직 실행
  → finally: 성공/실패 무관하게 lock 해제 (DEL)
```

## 8. NestJS vs Laravel — 스케줄링 구조 비교

| 항목              | Laravel                                    | NestJS                                   |
| ----------------- | ------------------------------------------ | ---------------------------------------- |
| 실행 단위         | Artisan Command 클래스                     | Injectable 서비스의 메서드               |
| 등록 위치         | `withSchedule()` 또는 `Console/Kernel.php` | `AppModule`에 `ScheduleModule.forRoot()` |
| 실행 방식         | `schedule:run`을 cron이 호출               | 앱 내부 scheduler가 직접 실행            |
| crontab 필요 여부 | ✅ 필요                                    | ❌ 일반적으로 불필요                     |
| cron 표현식       | 보통 5자리 (분~요일)                       | 5자리 또는 초 포함 6자리                 |
| 중복 실행 방지    | `withoutOverlapping()`, `onOneServer()`    | Redis Lock 등 직접 구현 권장             |
| 기본 로거         | `$this->info()` / `$this->error()`         | `new Logger(ClassName.name)`             |

---

## 9. 마무리 — Task 설계 원칙

1. **Task는 얇게** — 비즈니스 로직은 Service에 위임하고, Task는 실행 흐름과 로깅만 담당한다.
2. **에러는 반드시 catch** — 스케줄러에서 uncaught error가 발생하면 이후 실행도 중단될 수 있다.
3. **Logger를 적극 활용** — `new Logger(ClassName.name)`으로 클래스 이름이 태그된 로그를 남겨 디버깅을 쉽게 한다.
4. **null 체크 후 early return** — 의존 데이터 없을 때 warn 로그를 남기고 조용히 종료하면 불필요한 에러 알림을 방지한다.
5. **CronExpression 상수 활용** — 문자열 직접 입력보다 `CronExpression.EVERY_DAY_AT_MIDNIGHT` 같은 상수를 사용하면 가독성과 오타 방지에 유리하다.
6. **timeZone을 명시** — 서버가 UTC로 구동되는 환경에서는 `@Cron()` 옵션에 `timeZone: 'Asia/Seoul'`을 설정해 의도한 한국 시각에 실행되도록 하다.
7. **다중 인스턴스 환경은 Redis Lock 또는 전용 Worker** — 인스턴스가 여럿이라면 중복 실행 방지 전략을 반드시 마련한다.

---

> **참고 문서**
>
> - [NestJS 공식 — Task Scheduling](https://docs.nestjs.com/techniques/task-scheduling)
> - [NestJS 공식 — Lifecycle Events](https://docs.nestjs.com/fundamentals/lifecycle-events)
> - [node-cron npm](https://www.npmjs.com/package/node-cron)
