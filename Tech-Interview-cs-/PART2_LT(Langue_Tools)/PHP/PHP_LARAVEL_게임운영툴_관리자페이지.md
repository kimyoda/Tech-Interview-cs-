# 🌐 PHP/Laravel 게임 운영툴(관리자 페이지) - 마이그레이션, CRUD, API 적용, 검색·CSV 내보내기

## 들어가며

게임 서버를 개발하다 보면 기획자나 클라이언트 담당자가 이벤트 값을 직접 등록하고, 수정하고, 이력을 조회할 수 있는 운영툴이 필요해진다.

이 글은 카드 버프 이벤트를 예시로, 운영툴의 설정 CRUD부터 게임 API 반영, 적용 이력의 검색·CSV 내보내기까지 한 흐름으로 정리한 내용이다. 실제 서비스의 테이블명과 컬럼명은 변경한 예시다.

중요한 전제는 `api`와 `mgmt`가 **같은 `App\Models`를 공유**한다는 점이다. 운영툴이 `manage`에 등록·수정한 `CardBuffSchedule` 행을 API도 같은 Model로 직접 조회해 게임 결과에 반영한다. DTO는 API 응답을 클라이언트에 전달할 때 사용하는 별도 표현 방식이며, 이 데이터 조회 구조와는 분리된다. 즉 `CardBuffSchedule`을 `api`와 `mgmt`에서 따로 복제하지 않고 함께 사용한다.

```text
운영자
  │  카드 버프 설정 등록·수정
  ▼
[mgmt] CardBuffSchedule ────── manage DB (API 적용 원본)
  │
  │  App\Models\CardBuffSchedule 공유
  ▼
[api] CardBuffService
  │  같은 Model로 manage 값을 직접 조회해 카드 점수에 반영
  ├──────────────────────────────► 게임 API 응답
  │
  │  실제 적용 시 이력 1건 기록
  ▼
[api] UserCardBuffLog ───────── user DB
  │
  ▼
[mgmt] 유저·카드·기간 검색 / CSV 내보내기
```

> 카드 버프 설정은 `manage` 커넥션에서 관리하며, 운영툴이 저장한 값이 API 적용의 기준값이다. 유저 카드 목록·적용 이력처럼 별도 유저 관리 운영툴이 다루는 데이터는 `user` 커넥션을 사용한다. 두 Model을 `api`와 `mgmt`가 공유하되, 각 Model의 `$connection`이 접근할 DB를 결정한다.

---

## 전체 처리 흐름: manage 등록 → API 적용 → user 이력 확인

이 예시의 데이터 흐름은 아래 순서다.

| 단계 | 실행 주체       | 사용하는 Model / 커넥션       | 하는 일                                                 |
| ---- | --------------- | ----------------------------- | ------------------------------------------------------- |
| 1    | 운영툴(`mgmt`)  | `CardBuffSchedule` / `manage` | 운영자가 카드 ID, 추가 점수, 적용 기간을 등록·수정한다. |
| 2    | 게임 API(`api`) | `CardBuffSchedule` / `manage` | API가 같은 Model로 현재 활성화된 설정을 직접 조회한다.  |
| 3    | 게임 API(`api`) | `CardBuffService`             | 카드 ID에 해당하는 버프 점수를 찾아 기본 점수에 더한다. |
| 4    | 게임 API(`api`) | `UserCardBuffLog` / `user`    | 버프가 실제로 적용된 건만 유저 카드 이력으로 저장한다.  |
| 5    | 운영툴(`mgmt`)  | `UserCardBuffLog` / `user`    | 유저·카드·기간 조건으로 이력을 검색하고 CSV로 내보낸다. |

즉 `manage`는 **API가 적용할 버프 기준값을 등록·관리하는 곳**이고, `user`는 **그 기준값이 실제 유저 카드에 적용됐는지 확인하는 이력 데이터**를 조회하는 곳이다. `mgmt`와 `api`가 같은 Model을 공유하므로, 운영툴에서 설정을 바꾼 뒤 API가 다른 Model이나 별도 동기화 테이블을 거치지 않고 해당 값을 직접 사용한다.

`CardBuffService::applyBuff()`는 최종 점수를 반환하는 예시다. 실제 게임 점수나 플레이 결과를 DB에 저장하는 코드가 있다면, 해당 처리 지점에서 이 메서드를 호출해야 API 응답과 저장 결과에 같은 버프 점수가 반영된다. 또한 활성 설정은 60초 캐시를 사용하므로, 운영툴에서 수정한 값은 캐시를 별도로 비우지 않는 한 최대 60초 안에 API에 반영된다.

---

## 1. 설정 테이블과 마이그레이션

### 최초 생성

```bash
./vendor/bin/sail artisan make:migration create_card_buff_schedules_table
```

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('manage')->create('card_buff_schedules', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('game_schedule_id')->comment('미니게임 스케줄 ID');
            $table->unsignedTinyInteger('game_type')->comment('미니게임 타입');
            $table->unsignedTinyInteger('status')->default(1)->comment('0=OFF, 1=ON');
            $table->string('memo')->nullable();
            $table->timestamps();

            $table->unique(['game_schedule_id'], 'uni_cbs_schedule');
            $table->index(['game_type', 'status'], 'idx_cbs_type_status');
        });
    }

    public function down(): void
    {
        Schema::connection('manage')->dropIfExists('card_buff_schedules');
    }
};
```

처음에는 등급별 카드 목록을 따로 두었지만, 기획이 바뀌며 `카드 ID 목록`과 `카드별 추가 점수 목록`을 같은 순서의 콤마 문자열로 관리하게 됐다고 가정한다.

```bash
./vendor/bin/sail artisan make:migration add_buff_columns_to_card_buff_schedules_table --table=card_buff_schedules
```

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('manage')->table('card_buff_schedules', function (Blueprint $table) {
            $table->dateTime('start_at')->nullable()->after('game_schedule_id')->comment('시작 일시');
            $table->dateTime('end_at')->nullable()->after('start_at')->comment('종료 일시');
            $table->text('buff_card_ids')->nullable()->comment('버프 적용 카드 ID 목록(콤마 구분)');
            $table->text('buff_score')->nullable()->comment('카드별 추가 점수(콤마 구분)');
        });
    }

    public function down(): void
    {
        Schema::connection('manage')->table('card_buff_schedules', function (Blueprint $table) {
            $table->dropColumn(['start_at', 'end_at', 'buff_card_ids', 'buff_score']);
        });
    }
};
```

처음부터 `text`로 만들었다면 다시 `varchar → text` 변경 마이그레이션을 만들 필요는 없다. 반대로 기존 컬럼이 실제로 `varchar`였다면 그때만 `->change()` 마이그레이션을 추가한다. `up()`과 `down()`은 반드시 서로 원래 상태로 되돌아가게 작성한다.

스케줄 하나에 하나의 설정만 둔 제약도, 시간대를 나눠 여러 설정을 등록해야 한다면 해제할 수 있다.

```php
public function up(): void
{
    Schema::connection('manage')->table('card_buff_schedules', function (Blueprint $table) {
        $table->dropUnique('uni_cbs_schedule');
    });
}

public function down(): void
{
    Schema::connection('manage')->table('card_buff_schedules', function (Blueprint $table) {
        $table->unique(['game_schedule_id'], 'uni_cbs_schedule');
    });
}
```

마이그레이션 명령어는 아래처럼 사용한다.

```bash
# 새 테이블 생성
./vendor/bin/sail artisan make:migration create_xxx_table

# 기존 테이블 변경
./vendor/bin/sail artisan make:migration xxx_action --table=table_name

# 실행 전 SQL 확인
./vendor/bin/sail artisan migrate --pretend

# 실행 / 마지막 배치 롤백
./vendor/bin/sail artisan migrate
./vendor/bin/sail artisan migrate:rollback
```

> 운영 DB에서는 `--pretend`로 실행 SQL을 먼저 확인한다. `migrate:fresh`는 모든 테이블을 지우므로 운영 환경에서 실행하면 안 된다.

---

## 2. 운영툴 CRUD

CRUD 생성 명령어를 사용하면 Model, Controller, Request, Blade 기본 구조를 빠르게 만들 수 있다.

```bash
./vendor/bin/sail artisan make:crud card_buff_schedules tailwind
```

생성 코드에 맞춰 `manage` 커넥션과 실제 입력 필드를 명시한다. `status`는 API가 활성 설정을 조회할 때 사용하는 값이므로, 운영 화면에서 수정할 계획이라면 반드시 `fillable`과 검증 규칙에 포함해야 한다.

### Model

```php
<?php

namespace App\Models;

class CardBuffSchedule extends \Illuminate\Database\Eloquent\Model
{
    protected $connection = 'manage';

    protected $perPage = 20;

    protected $fillable = [
        'game_schedule_id',
        'game_type',
        'status',
        'start_at',
        'end_at',
        'buff_card_ids',
        'buff_score',
        'memo',
    ];

    protected $casts = [
        'game_schedule_id' => 'integer',
        'game_type' => 'integer',
        'status' => 'integer',
        'start_at' => 'datetime',
        'end_at' => 'datetime',
    ];
}
```

### FormRequest

`buff_card_ids`와 `buff_score`는 같은 순서로 묶여 있으므로, 운영 화면에서 두 값의 개수를 일치시키는 검증을 추가하는 편이 안전하다. 아래 기본 규칙은 각 값의 타입과 기간의 선후 관계를 검증한다.

```php
<?php

namespace App\Http\Requests;

class CardBuffScheduleRequest extends \Illuminate\Foundation\Http\FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'game_schedule_id' => ['required', 'integer'],
            'game_type' => ['required', 'integer'],
            'status' => ['required', 'boolean'],
            'start_at' => ['nullable', 'date'],
            'end_at' => ['nullable', 'date', 'after_or_equal:start_at'],
            'buff_card_ids' => ['nullable', 'string'],
            'buff_score' => ['nullable', 'string'],
            'memo' => ['nullable', 'string'],
        ];
    }
}
```

목록에서는 `paginate()` 뒤에 `withQueryString()`을 사용하면 추후 검색 조건을 추가해도 페이지를 넘길 때 조건이 유지된다.

```php
use App\Models\CardBuffSchedule;

public function index($request)
{
    $cardBuffSchedules = CardBuffSchedule::query()
        ->latest('id')
        ->paginate();

    return view('card-buff-schedule.index', compact('cardBuffSchedules'))
        ->with('i', ($request->input('page', 1) - 1) * $cardBuffSchedules->perPage());
}
```

---

## 3. API에서 공유 Model을 직접 조회해 적용하기

API와 운영툴이 Model을 공유하므로 API 서비스는 `CardBuffSchedule`을 직접 사용한다. `protected $connection = 'manage'`가 선언되어 있기 때문에, 운영툴에서 저장한 값은 API 프로젝트에서 실행한 이 조회에도 그대로 사용된다.

```text
관리자 → card_buff_schedules 등록·수정
                         │
                         ▼
[api] CardBuffService::getActiveBuffScoreMap()
  1. shared Model로 manage DB의 활성 설정(운영툴 등록값)을 직접 조회
  2. 카드 ID와 추가 점수를 맵으로 변환
  3. 기본 점수에 버프 점수를 가산
  4. 실제 적용 건은 user DB의 로그 Model로 기록
```

```php
<?php

namespace App\Services;

use App\Models\CardBuffSchedule;
use App\Models\UserCardBuffLog;

class CardBuffService
{
    private const CACHE_KEY_PREFIX = 'card_buff:active:';
    private const CACHE_TTL_SECONDS = 60;

    public function getActiveBuffScoreMap(int $gameScheduleId): array
    {
        return cache()->remember(
            self::CACHE_KEY_PREFIX . $gameScheduleId,
            now()->addSeconds(self::CACHE_TTL_SECONDS),
            function () use ($gameScheduleId): array {
                $schedules = CardBuffSchedule::query()
                    ->where('game_schedule_id', $gameScheduleId)
                    ->where('status', 1)
                    ->where('start_at', '<=', now())
                    ->where('end_at', '>=', now())
                    ->orderBy('id')
                    ->get();

                $buffScoreMap = [];

                foreach ($schedules as $schedule) {
                    $cardIds = $this->toIntegerArray($schedule->buff_card_ids);
                    $scores = $this->toIntegerArray($schedule->buff_score);

                    // ID와 점수 개수가 다르면 잘못된 설정이므로 적용하지 않는다.
                    if (count($cardIds) !== count($scores)) {
                        continue;
                    }

                    foreach ($cardIds as $index => $cardId) {
                        $buffScoreMap[$cardId] = $scores[$index];
                    }
                }

                return $buffScoreMap;
            }
        );
    }

    public function applyBuff(int $userId, int $gameScheduleId, int $cardId, int $baseScore): int
    {
        $buffScore = $this->getActiveBuffScoreMap($gameScheduleId)[$cardId] ?? 0;

        if ($buffScore === 0) {
            return $baseScore;
        }

        // api와 mgmt가 공유하는 Model을 통해 user 커넥션에 직접 기록한다.
        UserCardBuffLog::create([
            'user_id' => $userId,
            'game_schedule_id' => $gameScheduleId,
            'card_id' => $cardId,
            'buff_score' => $buffScore,
            'applied_at' => now(),
        ]);

        return $baseScore + $buffScore;
    }

    private function toIntegerArray(?string $value): array
    {
        if ($value === null || trim($value) === '') {
            return [];
        }

        return collect(explode(',', $value))
            ->map(fn (string $item): string => trim($item))
            ->filter(fn (string $item): bool => $item !== '')
            ->map(fn (string $item): int => (int) $item)
            ->values()
            ->all();
    }
}
```

여기서 API가 Model을 직접 쓰지 않는다는 설명은 맞지 않다. 위 구조에서는 `CardBuffSchedule`과 `UserCardBuffLog` 모두 API가 직접 참조한다. 각각의 `$connection` 값이 조회·기록 대상 DB를 결정한다.

> 동일 카드가 여러 활성 설정에 겹칠 때 어떤 값을 사용할지는 기획 규칙으로 정해야 한다. 예시는 ID 오름차순으로 읽어 마지막 설정이 앞선 값을 덮어쓴다. 합산이 요구사항이라면 대입식 대신 `+=`로 바꾼다. 점수 개수가 맞지 않을 때 마지막 점수를 임의로 채우면 잘못된 운영값이 조용히 적용되므로 피하는 편이 좋다.

> 버프 결과 저장과 로그 저장이 반드시 함께 성공해야 한다면, 실제 플레이 결과를 저장하는 코드와 같은 트랜잭션 또는 멱등 키 정책 안에 둔다. 재시도되는 API에서 단순 `create()`만 호출하면 같은 적용 이력이 중복될 수 있다.

---

## 4. 적용 이력 테이블

설정 테이블은 운영자가 직접 수정하는 CRUD 대상이다. 반면 로그 테이블은 API가 자동으로 쌓는 이력이므로 운영 화면은 보통 목록 조회와 CSV 내보내기만 제공한다.

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('user')->create('user_card_buff_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('user_id')->comment('유저 ID');
            $table->unsignedInteger('game_schedule_id')->comment('미니게임 스케줄 ID');
            $table->unsignedInteger('card_id')->comment('버프가 적용된 카드 ID');
            $table->unsignedInteger('buff_score')->comment('실제 적용된 추가 점수');
            $table->dateTime('applied_at')->comment('버프 적용 시각');
            $table->timestamps();

            $table->index(['user_id', 'applied_at'], 'idx_ucbl_user_applied');
            $table->index(['card_id', 'applied_at'], 'idx_ucbl_card_applied');
        });
    }

    public function down(): void
    {
        Schema::connection('user')->dropIfExists('user_card_buff_logs');
    }
};
```

```php
<?php

namespace App\Models;

class UserCardBuffLog extends \Illuminate\Database\Eloquent\Model
{
    protected $connection = 'user';

    protected $perPage = 20;

    protected $fillable = [
        'user_id',
        'game_schedule_id',
        'card_id',
        'buff_score',
        'applied_at',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'game_schedule_id' => 'integer',
        'card_id' => 'integer',
        'buff_score' => 'integer',
        'applied_at' => 'datetime',
    ];

    public function userCard()
    {
        return $this->belongsTo(UserCard::class, 'card_id', 'card_id');
    }
}
```

`UserCard`는 `user` 커넥션의 별도 유저 카드 관리 테이블을 표현하는 Model이다. 로그 화면에서 카드 상세 정보를 함께 사용한다면 `userCard` 관계를 통해 조회한다.

---

## 5. 검색 필터와 CSV 내보내기

검색 조건은 `user_id`, `card_id`, 시작 일시, 종료 일시다. CSV 내보내기는 대량 데이터가 될 수 있으므로 유저 ID를 필수 조건으로 제한하고, `chunkById()`로 나누어 스트리밍한다.

```php
<?php

namespace App\Http\Controllers;

use App\Models\UserCardBuffLog;

class UserCardBuffLogController extends Controller
{
    private const EXPORT_CHUNK_SIZE = 500;

    public function index($request)
    {
        $filters = $this->validatedFilters($request);

        $userCardBuffLogs = $this->buildFilteredQuery($filters)
            ->orderByDesc('applied_at')
            ->orderByDesc('id')
            ->paginate();

        return view('user-card-buff-log.index', compact('userCardBuffLogs'))
            ->with('i', ($request->input('page', 1) - 1) * $userCardBuffLogs->perPage());
    }

    public function export($request)
    {
        $filters = $this->validatedFilters($request);

        if (empty($filters['user_id'])) {
            return redirect()->route('user-card-buff-logs.index')
                ->with('error', '내보내기를 하려면 User ID를 먼저 지정해야 합니다.');
        }

        $filename = 'user_card_buff_logs_' . now()->format('YmdHis') . '.csv';
        $query = $this->buildFilteredQuery($filters)->orderBy('id');

        return response()->streamDownload(function () use ($query): void {
            $handle = fopen('php://output', 'w');

            // Excel에서 한글 헤더가 깨지지 않도록 UTF-8 BOM을 기록한다.
            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, ['ID', 'User ID', 'Game Schedule ID', 'Card ID', 'Buff Score', 'Applied At']);

            $query->chunkById(self::EXPORT_CHUNK_SIZE, function ($logs) use ($handle): void {
                foreach ($logs as $log) {
                    fputcsv($handle, [
                        $log->id,
                        $log->user_id,
                        $log->game_schedule_id,
                        $log->card_id,
                        $log->buff_score,
                        $log->applied_at?->format('Y-m-d H:i:s'),
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function buildFilteredQuery(array $filters)
    {
        $query = UserCardBuffLog::query()->with('userCard');

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['card_id'])) {
            $query->where('card_id', $filters['card_id']);
        }

        if (!empty($filters['start_datetime'])) {
            $query->where('applied_at', '>=', $filters['start_datetime']);
        }

        if (!empty($filters['end_datetime'])) {
            $query->where('applied_at', '<=', $filters['end_datetime']);
        }

        return $query;
    }

    private function validatedFilters($request): array
    {
        return $request->validate([
            'user_id' => ['nullable', 'integer', 'min:1'],
            'card_id' => ['nullable', 'integer', 'min:1'],
            'start_datetime' => ['nullable', 'date'],
            'end_datetime' => ['nullable', 'date', 'after_or_equal:start_datetime'],
        ]);
    }
}
```

기존 예시의 `Searchable`은 실제로 호출되지 않았고, `Exportable`의 `$modelClass` 인수도 사용되지 않았다. 이 경우 공통 Trait을 억지로 두기보다 필요한 Controller 안에 검색과 내보내기를 명확하게 작성하는 편이 낫다.

또한 목록용 정렬(`applied_at desc`)과 `chunkById()`를 같은 쿼리에 섞으면 청크 경계에서 누락 또는 중복 위험이 생길 수 있다. 그래서 목록은 적용 시각 역순으로, CSV는 `id` 오름차순으로 분리했다.

### 목록 Blade의 검색 영역

```blade
<form method="GET" action="{{ route('user-card-buff-logs.index') }}" class="mt-6">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div>
            <x-input-label for="user_id" :value="__('User ID')" />
            <x-text-input id="user_id" name="user_id" type="text" class="mt-1 block w-full"
                :value="request('user_id')" />
        </div>
        <div>
            <x-input-label for="card_id" :value="__('Card ID')" />
            <x-text-input id="card_id" name="card_id" type="text" class="mt-1 block w-full"
                :value="request('card_id')" />
        </div>
        <div>
            <x-input-label for="start_datetime" :value="__('Start Date')" />
            <x-text-input id="start_datetime" name="start_datetime" type="datetime-local" class="mt-1 block w-full"
                :value="request('start_datetime')" />
        </div>
        <div>
            <x-input-label for="end_datetime" :value="__('End Date')" />
            <x-text-input id="end_datetime" name="end_datetime" type="datetime-local" class="mt-1 block w-full"
                :value="request('end_datetime')" />
        </div>
    </div>

    <div class="mt-4 flex gap-2">
        <x-primary-button type="submit">{{ __('Search') }}</x-primary-button>
        <a href="{{ route('user-card-buff-logs.index') }}"
            class="inline-flex items-center rounded-md bg-gray-800 px-4 py-2 text-sm text-white">
            {{ __('Reset') }}
        </a>
        <a href="{{ route('user-card-buff-logs.export', request()->query()) }}"
            class="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm text-white">
            {{ __('Export CSV') }}
        </a>
    </div>
</form>
```

페이지네이션에는 다음 코드를 사용한다.

```blade
{!! $userCardBuffLogs->withQueryString()->links() !!}
```

### 예시 화면

| No  | User ID | Game Schedule ID | Card ID | Buff Score | Applied At          |
| --- | ------- | ---------------- | ------- | ---------- | ------------------- |
| 1   | 10322   | 101              | 304312  | +50        | 2026-07-08 10:12:03 |
| 2   | 10322   | 101              | 543512  | +60        | 2026-07-08 10:15:41 |

---

## 마무리

이 패턴의 핵심은 다음 세 가지다.

1. 운영툴이 `manage`에 등록한 값을 `api`와 `mgmt`가 공유하는 Model로 API에서 직접 조회해 적용한다.
2. 운영자가 수정하는 설정 데이터와 API가 쌓는 로그 데이터를 분리한다.
3. 로그 화면은 검색 조건을 유지하고, CSV는 필터된 쿼리를 ID 기준으로 청크 처리해 안정적으로 내보낸다.

이렇게 구성하면 운영자는 이벤트 값을 빠르게 변경할 수 있고, 게임 API는 짧은 캐시로 설정을 조회하면서 실제 적용 이력을 운영툴에서 바로 추적할 수 있다.
