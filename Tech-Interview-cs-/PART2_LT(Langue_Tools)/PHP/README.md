# 📚 Tech Interview - PHP · Laravel

Laravel의 기본 구조와 Artisan 활용부터 관리자 도구, Redis·WebSocket 기반 실시간 기능, 테스트와 운영 장애 해결까지 정리한 문서 모음입니다.

> 아래 제목을 클릭하면 GitHub에서 해당 문서로 이동합니다.

## 문서 구성

### [Laravel 기초와 개발 도구]

- [Laravel 기본 개념](./PHP_LARAVEL_기본.md) — Laravel의 핵심 개념과 프레임워크 기본 구조를 정리.
- [Laravel 가이드](./PHP_LARAVEL_guide.md) — Laravel을 시작하기 위한 배경 지식과 주요 기능을 소개.
- [Artisan 명령어](./PHP_LARAVEL_Commands.md) — Laravel Artisan Console Command의 개념과 기본 사용법을 설명.
- [Artisan 실무 예시](./PHP_LARAVEL_Commands_실무예시.md) — 반복 업무를 자동화하는 Artisan Command의 실전 활용 사례를 다룬다.
- [Service Factory 의존성 관리](./PHP_LARAVEL_Service_Factory_의존성관리패턴.md) — Service Factory 패턴으로 서비스 의존성을 구성하고 관리하는 방법을 정리.

### [관리자 페이지와 화면 구현]

- [게임 운영툴·관리자 페이지](./PHP_LARAVEL_게임운영툴_관리자페이지.md) — 마이그레이션, CRUD API, 검색, CSV 내보내기를 포함한 운영 도구 구현 사례.
- [Blade·Tailwind CSS](./PHP_LARAVEL_Blade_운영툴_TailWindCss.md) — Blade 템플릿과 Tailwind CSS로 운영 화면을 구성하는 방법을 정리.

### [캐시와 실시간 기능]

- [Redis 기본](./PHP_LARAVEL_Redis_Basic.md) — Redis의 자료 구조와 Laravel에서의 기본 활용을 설명.
- [Redis 예제 활용](./PHP_LARAVEL_Redis_예제활용.md) — 캐시·데이터 처리에 Redis를 적용하는 예제를 정리.
- [PHP와 WebSocket의 난점](./PHP_LARAVEL_PHP_WebSocket이%20어려운이유.md) — PHP 환경에서 WebSocket을 구현할 때 고려할 제약과 어려움을 설명.
- [실시간 채팅 구현](./PHP_LARAVEL_실시간채팅_구현_WebSocket.md) — WebSocket 기반 채팅의 구성 요소와 실무 구현 흐름을 다룬다.
- [이벤트 브로드캐스팅 채팅](./PHP_LARAVEL_이벤트_브로드캐스팅_채팅.md) — Laravel 이벤트와 브로드캐스팅을 활용한 실시간 메시지 전달 구조를 정리.

### [테스트와 운영 트러블슈팅]

- [Laravel 테스트 코드](./PHP_LARAVEL_테스트코드.md) — 테스트의 목적, Laravel 테스트 작성 흐름과 주요 개념을 정리.
- [테스트 코드 보충 자료](./PHP_LARAVEL_테스트코드_블로그.md) — PHP/Laravel 테스트 코드의 필요성과 활용 예시를 보충.
- [MySQL Error 1701 해결](./PHP_LARAVEL_MysqlError_해결.md) — 테스트 DB 초기화 중 외래 키 제약으로 발생하는 오류의 원인과 해결 방법을 다룬다.
- [`env()`가 `null`을 반환하는 문제](./PHP_LARAVEL_운영환경배포_env%28%29함수_null반환해결.md) — 캐시된 설정으로 인한 배포 환경 변수 문제를 정리.

### [프롬프트 예시](./PHP_LARAVEL_프롬프트_예시.md)

- Laravel 프로젝트 기획·구현 시 활용할 수 있는 프롬프트 예시를 제공.
