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


   }
```
