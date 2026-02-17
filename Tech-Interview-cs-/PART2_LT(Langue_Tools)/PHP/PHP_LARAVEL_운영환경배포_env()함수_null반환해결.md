# 🌐 Laravel 배포 트러블 슈팅: `env()` 가 null을 반환할 때

### 📚 목차

- [🌐 Laravel 배포 트러블 슈팅: `env()` 가 null을 반환할 때](#-laravel-배포-트러블-슈팅-env-가-null을-반환할-때)
    - [📚 목차](#-목차)
  - [1. 문제 요약](#1-문제-요약)
  - [2. 왜 env()가 NULL이 되는가?](#2-왜-env가-null이-되는가)
  - [3. 재현 방법 (로컬, 캐시 후)](#3-재현-방법-로컬-캐시-후)
- [운영 환경](#운영-환경)
  - [4. 해결 전략:  env() -\> config()](#4-해결-전략--env---config)
  - [5. 예제 코드](#5-예제-코드)
    - [배포, 운영 체크](#배포-운영-체크)
---

## 1. 문제 요약
  - `env()` 및 관련 파일을 수정하여 aws s3에 새롭게 업로드하여 파일 경로를 변경하기 위해 `env`안에 있는 경로 루트를 수정하고 `php artisan cofnig:cache, clear` 라는 명령어 등을 통해 원활히 작동할 수 있도록 로컬에서 진행하고 반영한뒤 배포가 끝난 후 이미지를 업로드할 때, 지정해둔 경로는 아예 보이지 않고 이미지 파일 업로드 된 이슈를 확인했었다. 아래는 이 과정을 해결하고 어떻게 해결했는 지 기록으로 남겨두었다.
  - Laravel은 `.env`로 환경별 설정을 관리한다.
  - 하지만 운영(또는 개발 서버)에서 배포 스크립트에 `php artisan config:cache`가 포함되어 있으면, 애플리케이션 코드(컨트롤러/서비스/뷰 등)에서 `env()`를 호출할 때 `null`이 반환되는 현상을 경험할 수 있다.
```php
$iamgeUrl = env('CDN_BASE_URL') . '/images/example.jpg';
```

## 2. 왜 env()가 NULL이 되는가?

   - 운영 환경 성능을 위해 `php artisan config:cache` 명령을 실행, 모든 설정 파일(`config/*.php`)와 `.env` 변수를 하나의 PHP 파일로 캐싱한다.
   - 배포 스크립트에 위의 명령어를 포함한다. 해당 명령어가 실행되면 라라벨은 `conifg/` 디렉터리에 있는 모든 파일을 하나로 묶어서 `boostrap/cache/config.php` 라는 하나의 PHP 파일로 만든다. 해당 파일만 로드한다.

   > **Laravel 공식 문서**
   > “If you execute the config:cache  command during your deployment process, you should be sure that you are only calling the env function from within your configuration files.”
   > 배포 과정에서 `config:cache`를 실행하면, `env()` 호출은 반드시 설정 파일(`config`)내부에서만 해야한다. 라는 내용을 확인할 수 있었다.

   - 설정이 캐싱된 이후 `.env` 파일이 로드되지 않고 `env()` 함수는 외부 시스템 변수만 반환한다고 한다.
   `config:cache` 실행 후 .`env` 파일에서 로드한 환경 변수들이 더 이상 읽히지 않고, 애플리케이션 곳곳에서 `env()`를 호출하면 NULL이 반환된다.

   > 환경 변수가 `.env` 파일에서 로드되는 것은 캐시된 설정 파일 없을 때, 한번 `config:cache` 를 실행하면 Laravel은 더 이상 `.env` 파일을 로드하지 않는다. 이때 애플리케이션 `env()` 헬퍼를 호출하면 기본값 `null` 을 반환하게 된다.

   - 캐싱이 되는 순간, `env` 는 로드되지 않아 설정 파일(`config/*.php`) 내부를 제외한 코드(컨트롤러, 서비스, 뷰 등)에서 호출하는 `env()`는 전부 `NULL`을 반환하게 된다ㅏ.

## 3. 재현 방법 (로컬, 캐시 후)

```bash
# 로컬 환경
php artisan config:clear
php artisan tinker
>>> env('CDN_BASE_URL')
=> "https://date.app.example.jp/"
```
- `.env`값이 정상 출력된다.

# 운영 환경 
```bash
php artisan config:cache
php artisan tinker
>>> env('CDN_BASE_URL')
=> null
```
- 하지만 `config()`로 접근하면 값이 나온다.
```bash
>>> config('app.cdn.base_url')

>>> config('filesystems.cdn_base_url') // 프로젝트에 따라 매핑 위치가 다르다.
```

## 4. 해결 전략:  env() -> config()
- `.env`에 있는 값은 `config/*.php`에 매핑한다.
- 애플리케이션 코드는 `env()`가 아니라 `config()`로 읽는다.

-> `config:cache` 이후에
  - 설정 값은 캐시(`bootstrap/cache/config.php`)를 통해 제공된다.
  - `config()`는 캐시된 설정을 안정적으로 읽을 수 있기 때문이다.


---

## 5. 예제 코드

5-1 .env 예시
```php
APP_ENV_NAME="dev-example"
CDN_BASE_URL="https://data.app.example.jp/"
CDN_IMAGE_DIR="/html/examples"
CDN_IMAGE_INFO_DIR="/example_banner"
```

5-2. Before: 컨트롤러에서 env() 직접 사용
```php
// 파일 업로드 부분만
if ($request->file('file')) {
  $appEnvName = '/' . env('APP_ENV_NAME'. "dev-exmaple-2026");
  $imageUrl = $appEnvName . env('CDN_IMAGE_DIR');
  $bannerImageUrl = $imageUrl . env('CDN_IMAGE_INFO_DIR');
};

$fileUrl = env('CDN_BASE_URL') . $filePath;
```

5-3. config/app.php에 CDN 설정 매핑 추가
> env()는 여기(config 파일)에서 사용한다.
```php
// coonfig/app.php

return [
    // 프로젝트 사용 중인 env_name
    'env_name' => env('APP_ENV_NAME', 'dev-example-2026'),

    // CDN 관련설정
    'cdn' => [
      'base_url' => env('CDN_BASE_URL', 'http://localhost'),
      'image_dir' => env('CDN_IMAGE_DIR', ''),
      'image_info_dir' => env('CDN_IMAGE_INFO_DIR');
    ],
  ];
```

5-4. After: 컨트롤러에서 config()사용
```php
// 파일 업로드 부분만
if ($request->file('file')) {
  $appEnvName = '/' . config('app.env_name'. "dev-exmaple-2026");
  $imageUrl = $appEnvName . config('app.cdn.base_url', '');
  $bannerImageUrl = $imageUrl . config('app.cdn.image_info_dir', '');
};

$fileUrl = $baseUrl . $filePath;
```

- 앞으로는 환경 변수는 `config` 폴더 내 파일 등 매핑에서 사용하는 것을 권유한다.


---

### 배포, 운영 체크

- **배포 파이프라인에서 캐시 생성**: `php artisan config:cache`는 성능상 권장한다. 개발 환경에서는 자주 설정을 변경하여 캐싱을 사용하지 않거나 변경 후 캐시를 지워야 한다.
- 단, config 파일 밖에서 env() 호출하는건 지양한다.

- **캐시 제거 명령어 활용**: `php arttisan cofnig:clear`, `php artisan optimize:clear` 라는 명령어를 입력한다.
- **`env()` 사용 범위 제한**: `env()`는 설정 파일내에서 사용, 그 외 코드에서는 항상 `config()`를 통해 값을 가져오도록 한다.

   

