# 📚 Tech Interview - NestJS

NestJS의 계층 구조와 요청 처리 과정부터 데이터베이스, API 문서화, 스케줄링까지 실무에서 자주 쓰는 주제를 정리한 문서 모음입니다.

> 아래 제목을 클릭하면 GitHub에서 해당 문서로 이동합니다.

## 문서 구성

### [기초 개념과 애플리케이션 구조](./Nest.JS.md)

- [NestJS 기본 개념](./Nest.JS.md) — NestJS의 특징, 모듈 기반 구조, 기본 사용 흐름을 정리.
- [Controller-Service 구조와 의존성 주입](./Nest_JS_Controller-Service구조이해.md) — 요청이 Controller에서 Service로 전달되는 흐름과 DI의 역할정리.
- [의존성 주입](./Nest.JS_의존성%20주입.md) — Provider를 주입하고 결합도를 낮추는 기본 원리를 정리.
- [Custom Providers](./Nest_JS_Custom_Fundamentals.md) — 커스텀 Provider 구성과 NestJS의 핵심 기반 기능을 정리.
- [Node.js에서 NestJS로](./Node.js_Nestjs.md) — Node.js와 NestJS의 발전 과정 및 프레임워크 도입 배경을 정리.

### [요청 처리와 공통 관심사]

- [Middleware](./Nest.JS_Middleware.md) — 요청 전·후에 공통 로직을 적용하는 미들웨어의 역할과 사용 정리.
- [Pipes](./Nest.JS_Pipes.md) — 요청 데이터의 검증과 변환을 담당하는 Pipe를 정리.
- [Guards](./Nest_JS_Guards.md) — 인증·인가처럼 라우트 접근 여부를 제어하는 Guard를 설명.
- [Interceptors](./Nest_JS_Interceptors.md) — 응답 변환, 로깅, 캐싱 등 요청·응답을 가로채는 Interceptor를 정리.
- [Exception Filters](./Nest_JS_Exception_Filters.md) — 예외를 일관된 HTTP 응답으로 처리하는 Filter를 정리.
- [Custom Decorators](./Nest_JS_Custom_Decorators.md) — 반복되는 메타데이터와 요청 값을 재사용하는 데코레이터 작성법.
- [Request Lifecycle](./Nest_JS_Request_Lifecycle.md) — Middleware부터 Exception Filter까지 이어지는 NestJS 요청 생명주기를 확인.

### [데이터베이스 · API · 운영]

- [TypeORM과 ORM 비교](./Nest.JS_TypeORM.md) — ORM의 개념과 TypeORM, Sequelize, Prisma, JPA, Eloquent의 특징을 비교.
- [CRUD 구현](./Node.js_CRUD.md) — NestJS 기본 요청 흐름을 바탕으로 CRUD API를 구현하는 과정을 정리.
- [Swagger CLI 플러그인](./Nest_JS_Swagger_설치.md) — Swagger 문서화를 위한 CLI 플러그인 설치와 적용 방법을 안내.
- [Task Scheduling](./NestJS_Task_Scheduling.md) — Cron 작업 등 반복·예약 작업을 구현하는 방법을 다룬다.

### [프롬프트 예시](./NestJS_프롬프트_예시.md)

- NestJS 관련 프로젝트를 설계하거나 구현할 때 활용할 수 있는 프롬프트 예시를 제공.
