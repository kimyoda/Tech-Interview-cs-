# 업데이트 시 점검없이 마스터 데이터 교체를 위한 이중화 DB 구조와 마이그레이션

게임 서버 쪽 작업을 하다보면, 밸런스 데이터나 기타 등등 때문에 Manage 데이터를 업데이트 해야하는 경우가 종종 있다. 다만, 보통 점검 때 진행하기에 점검을 걸고 하기에 애매한 부분들도 전부 점검에 포함시켜야 한다. 해당 부분은 분리된 두개의 Manage DB와 런타임 커넥션 스위칭으로 푸는 구조, 실제로 겪은 마이그레이션 이슈에 관해 정리해봤다.
다만, 회사 이슈로 예시 코드를 사용하였다.

## DB를 두 개로 나누는 이유는

운영툴에서 게임 밸런스/기획 데이터를 업로드 하는 기능이 있다. 해당 데이터는 서비스 전역에서 실시간으로 참조되어, 업로드 도중 스키마가 바뀌거나 데이터가 반쯤 들어간 상태로 조회되면 장애로 이어질 수 있다.

단순한 해결은 새 데이터를 별도 DB에 미리 올리고 검증까지 끝낸 뒤, 트래픽이 바라보는 대상만 한 번에 스위치하는 것이다. 그래서 실제 서비스가 참조하는 커넥션(`manage`)은 하나지만, 뒤에는 완전히 분리된 두개의 DB로 처리 할 수 있다.

```
Application (요청) -> DB:connection('manage')

-> 1순위 Redis, DB Fallback

-> activeDbName {manage_c, manage_d }
1. manage_c DB: 지금 활성(예)
2. manage_d DB: 대기
```

`manage_c`, `manage_d` 둘 중 하나가 항상 "활성(active)"이고 나머지 "대기(standby)"상태이다. 새 데이터는 항상 standby 쪽에 먼저 업로드 되고 검증 한 뒤, 활성 플래그만 뒤집어서 스위칭한다. 트래픽은 끊기지 않는다.

## 활성 DB를 체크, Redis 먼저, DB는 폴백

서비스 코드에서 `manage`이름의 커넥셔만 알면 된다. 어느 물리 DB로 연결할지는 `AppServiceProvider`의 시점에서 결정한다.

```php
// app/Providers/AppServiceProvider.php

public function boot(): void
{
   $runningCommand = app()->runningInConsole() ? ($_SERVER['argv'][1] ?? '')

   // manage:migrate 커맨드느 뒤에서 설명
   // 해당 동적 전호나 로직에서 제외
   $isManageMigrateCommand = $runningCommand && str_start_with($runningCommand, 'manage:migrate');

    if (!$isManageMigrateCommand) {
        $this->resolveManageConnection();
    }

    // 큐 워커는 요청 단위로 재부팅되지 않아, 잡을 처리하기 직전마다 다시 한번 활성 DB를 확인
    Queue::before(function (JobProcessing $event) {
      $this->resolveManageConnection();
    });
}

   private function resolveManageConnection(): void
   {
      $activeDbName = null;

      // Redis에서 활성 DB 이름을 읽는다
      try {
         $activeDbName = Redis::connection('control')->get('active_manage_db');
      } catch (\Throwable $e) {
         Log::warnking('[AppServiceProvider] Redis 조회 실패: ' . $e->getMessage());
      }

      // Redis 장애 시 컨트롤 DB의 플래그 테이블로 폴백한다
      if (!$activeDbName) {
         try {
            $row = DB::connection('control')
                  ->table('active_manage_dbs')
                  ->where('active_flag', true)
                  ->first();
            $activeDbName = $row?->database_name;
         } catch (\Throwable $e) {
            Log::warnking('[AppServiceProvider] 풀백 조회 실패: ' . $e->getMessgae());
         }
      }

      // 유효한 값이 나왔을 때만 커넥션 설정을 재연결한다
      if ($activeDbName && in_array($activeDbName, ['manage_c', 'manage_d'], true)) {
         $targetConfig = Config::get("database.connections.{$activeDbName}");
         if ($targetConfig) {
            Config::set('database.connections.manage', $targetConfig);
            DB::purge('manage'); // 기존 커넥션 캐시를 버려야 새 설정이 적용된다
         }
      }
   }
```

> Redis. 우선 조회 DB 롤백.

워커 프로세스는 한번 떠서 계속 잡을 처리하기 때문에 활성 DB를 확인하면 그 이후 스위칭이 얼어나도 워커는 계속 옛날 DB를 바라보게 된다. 그래서 `Queue::before` 훅으로 잡 처리 직전마다 재확이하는 로직이 따로 필요하다

## 마이그레이션은 별도 커맨드가 필요하다

일반적인 `php artisan migrate`는 **순간 활성 커넥션으로 잡혀 있는 DB 하나에만** 적용된다. 해당 구조가 성립되려면 `manage_c`와 `manage_d`는 항상 동일한 스키마를 유지해야 한다. `manage_c`가 활성이라고 일반 마이그레이션을 돌리면, standby인 `manage_d`는 스키마가 밀린 채로 남는다. 나중에 스위칭이 일어나고 해당 운영툴로 데이터를 업데이트 하면 이슈가 생긴다.

이중화 대상 테이블은 그래서 `php artisan manage:migrate`로 처리하면 두 가지 마이그레이션이 적용되어 작동된다.

```php
// app/Console/Commands/ManageMigrateCommand.php
class ManageMigrateCommand extends Command
{
   protected $signature = 'manage:migrate';
   protected $description = '이중화된 manage DB(manage_c, manage_d)에 마이그레이션을 순서대로 적용한다.';

   public function handle(): int
   {
      foreach (['manage_c', 'manage_d'] as $connection) {
          $this->info('========================================');
          $this->info(" Target Database: {$connection}");
          $this->info(' Action: migrate');
          $this->info('========================================');

          Artisan::call('migrate', [
              '--database' => $connection,
              '--path'     => 'database/migrations/manage',
              '--force'    => true,
          ]);

          $this->line(Artisan::output());
          $this->info("Successfully completed migrate on {$connection}.");
      }

      return self::SUCCESS;
   }
}

```

- 마이그레이션 파일은 `database/migrations/manage` 라는 **별도 경로**에 둔다. 기본 `migrate` 명령이 로드하는 경로에는 포함시키지 않는다.
- 각 DB마다 `--database` 옵션으로 커넥션을 명시하여, 커맨드는 위에서 만든 동적 스위칭 로직과 아예 무관하게 동작한다.

해당 DB에 마이그레이션을 적용하면, 그 DB 자체의 `migrations` 테이블에 실행 이력이 각각 남는다. 즉 `manage_c`와 `manage_d`는 마이그레이션 이력까지 서로 독립적으로 관리된다

## 실제 작업 진행

정리하면 해당 작업 순서는 아래와 같다

```
1. 개발 브랜치에서 평소처럼 마이그레이션 파일 생성
2. develop/test 브랜치에 머지
3. 마이그레이션 파일을 database/migrations/manage로 이동 후 풀/커밋/푸쉬
4. 운영툴(배포 대상 서버) 패치 혹으 빌드
5. php artisan manage:migrate 실행 -> manage_c, manage_d 양쪽에 순서대로 테이블 생성, 각 DB의 migrations 테이블에 이력이 기록된다.
```

| 구분              | 일반 `migrate`                | `manage:migrate`                        |
| ----------------- | ----------------------------- | --------------------------------------- |
| 적용 대상         | 그 순간의 활성 커넥션 테이블  | `manage_c`, `manage_d` 양쪽 전부        |
| 마이그레이션 경로 | 기본 migrations 경로          | `database/migrations/manage` (별도)     |
| 이력 저장 위치    | 해당 DB의 `migrations` 테이블 | 각 DB 자신의 `migrations` 테이블 (독립) |
| 언제              | 이중화 대상이 아닌 테이블     | 이중화 대상(manage) 테이블              |

## 이슈 사례

실제로 겪은 상황에 대해 설명한다

1. 새 테이블 마이그레이션 파일을 만들었고, `database/migrations/manage`로 옮기는 걸 잊고 **기본 경로에 그대로 둔** `php artisan migrate`를 진행했다.
2. 활성이었던 `manage_c`에만 테이블이 생기고, `manage_d`에는 생기지 않았다
3. 다음 스위칭이 일어나기 전에 발견하여 다행히 이슈는 없었지만, 해당 스위칭되면 `manage_d`에 해당 테이블이 없어 에러가 생긴다.

복구 순서는 아래와 같다.

```
1. 마이그레이션 파일을 database/migrations/manage로 이동
2. manage_c에 이미 생성된 테이블 DROP
3. tool DB의 migrtaions 테이블에 해당 마이그레이션 기록 삭제 (반디스 필요한 건 아니지만, 이력을 깔끔하게 맞추기 위해)
4. 운영툴 재패치 (관리자 페이지)
5. php artisan manage:migrate 재실행 -> manage_c, manage_d 양쪽 모두 테이블 생성 + 각자 migrations에 테이블 기록
```

> 3번 단계(이력 삭제)를 안해도 되는 건, 마이그레이션 파일명 자체가 다시 실행될 때 기록이 있으면 스킵되기 떄문이다. 기록상으로는 실행되었으나 실제로는 한쪽에만 반영한 상태가 되어 이력을 지우고 꺠끗하게 재실행하는 편이 낫다고 생각했다

## 마무리

해당 구조는 서비스가 바라보는 커넥션은 하나로 고정, 그 뒤에 실제 물리 DB를 갈아끼운다는 것이다.
패턴 자체는 무중단 배포/블루-그린 배포와 같은 아이디어를 DB로 옮겨온 것이라고 생각한다

이 구조를 쓰면서, 이중화 대상 테이블의 마이그레이션은 전용 경로, 전용 커맨드를 거쳐야 한다.
