# 🌐 Laravel 배포 트러블 슈팅: `env()` 가 null을 반환할 때

### 📚 목차

1. [배포 후 설정이 읽히지 않는다](#1-문제-요약)
2. [왜 env()가 NULL이 되는가?](#2-왜-env가-null이-되는가)
3. [재현 방법 (로컬 vs 캐시 후)](#3-재현-방법-로컬-vs-캐시-후)
4. [해결 전략: env() → config()](#4-해결-전략-env--config)
5. [예제 코드 (Before / After)](#5-예제-코드-before--after)
4. [예제](#)
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


    
   

