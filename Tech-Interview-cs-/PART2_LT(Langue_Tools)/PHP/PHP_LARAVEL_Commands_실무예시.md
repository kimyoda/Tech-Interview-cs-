# 🌐 PHP_Laravel Artisan Console Commands 실전 활용

> Laravel 공식 문서 기반 | 스케줄링 + 커스턴 커맨드 패턴 정리

---

## 1. Artisan Console?

Laravel에는 Artisan이라는 CLI(Command Line Interface)가 내장되어 있다.
프로젝트 루트의 `artisan` 스크립트를 통해 실행, 개발과 운영 자동화에 필요한 다양한 명령어를 제공한다.

```bash
# 사용 가능한 모든 커맨드 목록
php artisan list

# 특정 커맨드의 도움말 확인
php artisan help app:your-command
```

> 📌 공식 문서: https://laravel.com/docs/13.x/artisan

커스텀 커맨드는 기본적으로 `app/Console/Commands` 디렉터리에 위치, Laravel이 해당 디렉터리를 자동스로 스캔하여 Artisan에 등록한다.

```bash
# 커맨드 클래스 생성
php artisan make:command YourCommandName
```

---

## 2. 커맨드의 기본 구조

모든 Artisan 커맨드는 `Illuminate\Console\Command`를 상속, 핵심 프로퍼티 두 가지와 `handle()` 메서드로 구성된다.

| 구성 요소      | 역할                               |
| -------------- | ---------------------------------- |
| `$signature`   | 커맨드 이름 및 인자/옵션 정의      |
| `$description` | `php artisan list`에 표시되는 설명 |
| `handle()`     | 실행 시 호출되는 핵심 로직         |

---

## 3. 실전 예시 - 유저 활동 점수 집계 커맨드

> 특정 캠페인 기간 동안 쌓인 사용자 활동 포인트를 집계, Redis 캐시를 갱신하는 배치 작업

### 커맨드 클래스

```php
<?php

namespace App\Console\Commands;

use App\Services\Campaign\CampaignScoreServiceFactory;
use App\Services\CoreService;
use Illuminate\Console\Command;
use Throwable;

class  AggregateUserActivityScores extends Command
{
    protected $signature = 'app:aggregate-user-activity-scores {campaign_id?}';

    protected $description = '캠페인별 유저 활동 점수를 집계하고 Redis 캐시 스냅샷을 갱신한다.';

    public function handle(): int
    {
        CoreService::init();

        try {
            $campaignId = (int)($this->argument('campaign_id') ?? 0);
            $scoreService = CampaignScoreServiceFactory::getInstance();

            $results = $campaignId > 0 ? [$scoreService->aggregateScores($campaignId)] : $scoreService->aggregateAllCampaignScores();

            foreach ($results as $result) {
                $this->info('[완료] 캠페인 점수 집계 결과:' . json_encode($result));
            }

            return self::SUCCESS;
        } catch (Throwable $e) {
            $this->error('[오류] 캠페인 점수 집계 실패: ' . $e->getMessage());

            return self::FALURE;
        }
    }
}
```

**확인사항**
`$signature`에서 `{campaign_id?}` - 물음표(`?`)는 **선택적 인자**를 의미한다. 없으면 전체 캠페인을 일괄 처리한다.

```bash
# 특정 캠페이만 집계
php artisan app:aggregate-user-activity-scores 42

# 전체 캠페인 일괄 집계
php artisan app:aggregate-user-activity-scores
```

반환값 `self::SUCCESS` / `self::FAILURE` - 정수 종료 코드, CI/CD 파이프라인이나 쉘 스크립트에서 성공/실패 여부를 판단할 때 활용된다.

---

## 4. 실전예제 2 - 리그 순위 갱신 커맨드

> 현재 진행 중인 스포츠 리그의 일별 순위를 외부 데이터 기반으로 갱신하는 작업

### 커맨드 클래스

```php
<?php

namespace App\Console\Commands;

use App\Services\League\LeagueSessionService;
use App\SharedService\LeagueStandingsService;
use Illuminate\Console\Command;

class RefreshLeagueStandings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:refresh-league-standings';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '진행 중인 리그의 일별 순위를 갱신한다.';


    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $session = LeagueSessionService::getActiveSession();

        if ($session === null) {
            $this->warn('[경고] 현재 진행 중인 리그 세션이 없습니다.');
            return;
        }

        $this->info('[시작] 리그 순위 갱신. session_id: ' . $session->id);

        $standingsService = new LeagueStandingsService();
        $standingsService->refreshDailyStandings($session->id);

        $this->info('[완료] 리그 순위 갱신. session_id: ' . $session->id);
    }
}
```

`$this->warn()` - 노란색 경고 메시지, 오류는 아니지만 처리가 스킵되는 경우에 사용한다.
`null` **체크 후 early return** - 의존 데이터가 없을 때 조용히 종료하는 패턴, 스케줄링 환경에서 불필요한 에러 로그를 방지한다.

| 출력 메서드      | 색상 | 사용 용도      |
| ---------------- | ---- | -------------- |
| `$this->info()`  | 초록 | 일반 진행 상황 |
| `$this->warn()`  | 노랑 | 주의 필요 상황 |
| `$this->error()` | 빨강 | 오류 발생      |
| `$this->line()`  | 기본 | 일반 텍스트    |

---

## 5. 스케줄링 등록

커맨드를 만든뒤에 `bootstrap/app.php` 또는 `app/Console/Kernel.php`의 `schedule` 메서드에 등록한다.

```php
// bootstrap/app.php (Laravel 11+)
->withSchedule(function (Schedule $schedule) {

    // 캠페인 점수 집계 - 매일 저장 실행
    $schedule->command('app:aggregate-user-activity-scores')->daily();
    // 리그 순위 갱신 - 매 10분 마다 실행
    $schedule->command('app:refresh-league-standings')->everyTenMinutes();
})
```

스케줄러를 동작시키려면 서버 crontab에 아래 한줄을 등록해야 한다

```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

**주요 스케줄 메서드**
| 메서드 | 실행 주기 |
|--------|-----------|
| `->everyMinute()` | 매분 |
| `->everyTenMinutes()` | 10분마다 |
| `->hourly()` | 매시 정각 |
| `->daily()` | 매일 자정 |
| `->dailyAt('13:00')` | 매일 지정 시각 |
| `->weekly()` | 매주 일요일 자정 |
| `->monthly()` | 매월 1일 자정 |

---

## 6. 마무리 - 커맨드 설계 원칙

실무에서 Artisan 커맨드를 작성할 때 지키면 좋은 것들이다.

1. **커맨드는 얇게 유지** - 비지니스 로직은 Service 클래스로 위임, 커맨드는 입출력과 흐름 제어만 담당한다.
2. **반환 코드를 명시** - `self::SUCCESS` / `self::FAILURE` 로 자동화 파이프라인과의 연동을 고려한다.
3. **선택적 인자 활용** - `{id?}` 패턴으로 단건 처리와 전체 처리를 하나의 커맨드로 통합한다.
4. **의미 있는 로그 출력** - 스케줄러 환경에서 로그가 유일한 디버깅 수단, 시작/완료/경고/오류 메세지를 명확히 남긴다.

---

> **참고 문서**
>
> - [Laravel 13.x — Artisan Console](https://laravel.com/docs/13.x/artisan)
> - [Laravel 13.x — Task Scheduling](https://laravel.com/docs/13.x/scheduling)
