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

```
