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
