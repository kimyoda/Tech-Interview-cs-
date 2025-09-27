# 🌐 PHP_Laravel Artisan ommand

- Laravel의 Artisan Command 반복적인 작업을 자동화
- 데이터 마이그레이션, 배치 처리 등의 작업을 효율적으로 수행할 수 있게 한다.

### 1-1. Command란?

- Laravel Command는 CLI(Command Line Interface)를 통해 실행할 수 있는 사용자 정의 명령어이다.
- `php artisan migrate` , `php artisan serve`

### 1-2. Command 생성하기

1. Artisan으로 Command 생성

```bash
php artisan make:command SendEmails
```

- 해당 명령어는 `app/Console/Commands/SendEmails.php` 파일 생성

2. 기본구조

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SendEmails extends Command
{
    protected $signature = 'email:send {user}';
    protected $description = 'Send emails to users';

    public function handle()
    {
        // 실행 로직
    }
}

```

### 1-3. Command의 속성

**$signature 속성**

- 명령어의 이름과 매개변수를 정의한다.

```php
// 기본 명령어
protected $signature = 'email:send';

// 필수 매개변수
protected $signature = 'email:send {user}';

// 선택적 매개변수
protected $signature = 'email:send {user?}';

// 기본값이 있는 매개변수
protected $signature = 'email:send {user=all}';

// 옵션
protected $signature = 'email:send {user} {--queue}';
```

**description**

- 명령어에 대한 설명을 제공한다. `php artisan list` 표시된다.

### 1-4. 실용적인 Command 예

**1. 사용장 통계 생성**

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\UserStats;

class GenerateUserStats extends Command
{
    protected $signature = 'stats:generate {--days=30}';
    protected $description = 'Generate user statistics for the specified period';

    public function handle()
    {
        $days = $this->option('days');
        $this->info("Generating stats for last {$days} days...");

        $users = User::where('created_at', '>=', now()->subDays($days))->get();

        $this->withProgressBar($users, function ($user) {
            UserStats::updateOrCreate(
                ['user_id' => $user->id],
                ['login_count' => $user->logins()->count()]
            );
        });

        $this->newLine();
        $this->info('User statistics generated successfully!');
    }
}
```

**2. 데이터 정리**

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CleanupOldData extends Command
{
    protected $signature = 'cleanup:old-data {--confirm}';
    protected $description = 'Clean up old data from the database';

    public function handle()
    {
        if (!$this->option('confirm') && !$this->confirm('This will delete old data. Continue?')) {
            $this->info('Operation cancelled.');
            return;
        }

        DB::transaction(function () {
            $deleted = DB::table('old_logs')
                ->where('created_at', '<', now()->subMonths(6))
                ->delete();

            $this->info("Deleted {$deleted} old log records.");
        });

        $this->info('Cleanup completed successfully!');
    }
}
```

Command에서 사용할 수 있는 메서드

- 출력 메서드

```php
$this->info('Information message');
$this->error('Error message');
$this->warn('Warning message');
$this->line('Plain text');
```

- 사용자 입력

```php
$name = $this->ask('What is your name?');
$password = $this->secret('What is the password?');
$confirmed = $this->confirm('Do you wish to continue?');
```

- 테이블 출력

```php
$headers = ['Name', 'Email'];
$users = User::all(['name', 'email'])->toArray();

$this->table($headers, $users);
```
