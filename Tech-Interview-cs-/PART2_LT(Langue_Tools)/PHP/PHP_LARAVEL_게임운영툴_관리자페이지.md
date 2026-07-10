# 🌐 PHP/Laravel 게임 운영툴(관리자 페이지) - 마이그레이션, CRUD, API 적용 등

## 안내 얘기

게임 서버를 개발하며 기획자 및 클라이언트 담당자가 직접 이벤트 값을 넣고 뺄수 있고 관리할 수 있게 해달라는 요청을 자주 듣기에, 관리할 수 있는 관리자 페이지를 따로 만든다.

해당 프로젝트의 운영툴(Admin)에서 **카드 조합 보너스(예시)**라는 작은 예시 기능을 넣을 때
마이그레이션 설계 -> CRUD -> 실제 게임 서버 로직 연동까지 붙이는 과정을 정리하였다.
실무에서 다루는 실제 테이블/컬럼명은 아니지만, 같은 패턴을 재현할 수 있도록 이름 및 컬럼값을 바꾼 예시이니 참고하길 바란다.

```
운영자(기획자)
      │  운영툴에서 "이 카드 4장 중 3장만 있어도 파워 +15" 등록
      ▼
┌─────────────────────┐
│   운영툴 (Laravel)    │   manage DB
│   CardComboBonus     │───────────────┐
└─────────────────────┘               │
                                       │ 읽기 전용 참조 (캐시)
                                       ▼
┌─────────────────────┐        ┌──────────────────┐
│   게임 서버 (API)     │◀───────│  CardComboService  │
└─────────────────────┘        └──────────────────┘
      │  유저가 편성한 카드 목록과 조합 조건을 비교해서
      ▼
   조건 충족 조합의 능력치 보너스를 합산해 최종 능력치에 반영
      │
      ▼
   user_combo_bonus_logs 에 발동 이력 1건 기록
      │
      ▼
[운영툴] 유저별/조합별/기간별 검색 + CSV 내보내기
```

> 운영툴 DB와 게임 서버가 참조하는 DB는 같은 인스턴스라도 커넥션을 분리하는걸 추천한다.
> `manage` (운영, 데이터), `user`/`master`(실제 서비스 데이터)를 나눠, 운영툴 쪽 쿼리가 무겁게 돌아도 실서비스 트래픽에 영향을 덜 준다.

## 테이블 설계와 마이그레이션

### 최초 테이블 생성

해당 명령어를 통해 관련 마이그레이션 생성

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
            $table->text('tier_legend')->nullable()->comment('전설 등급 카드 리스트');
            $table->text('tier_epic')->nullable()->comment('영웅 등급 카드 리스트');
            $table->text('tier_rare')->nullable()->comment('희귀 등급 카드 리스트');

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

해당 테이블을 처음부터 완벽하게 만들진 않았고 아래와 같은 순서로 계속 수정하였다.

### 컬럼 타입 변경 (등급별 분리 칼럼 -> 통합 텍스트 칼럼)

기획 방향이 바뀌며 "등급별로 나눠 저장" 대신 "버프 대상 카드 ID + 카드별 추가 점수를 콤마 문자열로 통째로 저장"하는 쪽으로 변경됐다.

```bash
./vendor/bin/sail artisan make:migration add_buff_columns_to_card_buff_schedules_table --table=card_buff_schedules
```

```php
return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('manage')->table('card_buff_schedules', function (Blueprint $table) {
            $table->text('buff_card_ids')->nullable()->comment('버프 적용 대상 카드 ID 목록');
            $table->text('buff_score')->nullable()->comment('카드별 추가 점수(콤마 구분)');
        });
    }

    public function down(): void
    {
        Schema::connection('manage')->table('card_buff_schedules', function (Blueprint $table) {
            $table->dropColumn(['buff_card_ids', 'buff_score']);
        });
    }
};
```

### 1-3. 컬럼 타입을 varchar → text로 변경

운영자가 카드 ID를 30~40개씩 콤마로 나열하다 보니 `varchar(255)`로는 부족해지는 상황이 생겼습니다.

```bash
./vendor/bin/sail artisan make:migration change_buff_columns_to_text_on_card_buff_schedules_table --table=card_buff_schedules
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
            $table->text('buff_card_ids')->nullable()->comment('버프 적용 대상 카드 ID 목록')->change();
            $table->text('buff_score')->nullable()->comment('카드별 추가 점수(콤마 구분)')->change();
        });
    }

    public function down(): void
    {
        Schema::connection('manage')->table('card_buff_schedules', function (Blueprint $table) {
            $table->unsignedBigInteger('buff_card_ids')->default(0)->change();
            $table->unsignedInteger('buff_score')->default(0)->change();
        });
    }
};
```

> `text` 컬럼 타입을 바꾸는 `->change()` 마이그레이션은 `doctrine/dbal` 패키지가 있어야 동작한다. 마이그레이션 실행 전 `composer require doctrine/dbal`이 필요한지 확인한다.

### 쓰지 않는 컬럼 제거

등금별 컬럼(`tier\_)
