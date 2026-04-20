## PHP에서 Redis 기본, 실전 예시

# PHP에서 Redis 기본과 실전 사용 정리

> Laravel + Redis 입문 문서  
> 실제 `RedisService`, `PlayingPredictionService`, `GetRedisHandler` 예시 기반

---

## 📌 목차

1. [Redis란 무엇인가](#1-redis란-무엇인가)
2. [PHP Laravel에서 Redis를 왜 쓰는가](#2-php-laravel에서-redis를-왜-쓰는가)
3. [Laravel에서 Redis 연결하고 사용하는 방식](#3-laravel에서-redis-연결하고-사용하는-방식)
4. [Redis 자료구조 기초](#4-redis-자료구조-기초)
5. [실제 프로젝트 코드에서 Redis가 쓰이는 방식](#5-실제-프로젝트-코드에서-redis가-쓰이는-방식)
6. [RedisService 코드로 보는 핵심 개념](#6-redisservice-코드로-보는-핵심-개념)
7. [PlayingPredictionService 코드로 보는 실전 활용](#7-playingpredictionservice-코드로-보는-실전-활용)
8. [GetRedisHandler 코드로 보는 헬스체크](#8-getredishandler-코드로-보는-헬스체크)
9. [PHP에서 자주 쓰는 Redis 명령어 정리](#9-php에서-자주-쓰는-redis-명령어-정리)
10. [실무에서 꼭 기억할 포인트](#10-실무에서-꼭-기억할-포인트)
11. [핵심 한 줄 정리](#11-핵심-한-줄-정리)

---

## 1. Redis란 무엇인가

Redis는 **메모리 기반 Key-Value 저장소**다.
데이터를 아주 빠르게 읽고 쓰기 위한 저장소다.

보통 MySQL, PostgreSQL 같은 DB는 영구 저장에 강하다
Redis는 당므 같은 상황에서 특히 강력하다

- 자주 조회되는 데이터 캐싱
- 로그인 세션 저장
- 랭킹 점수 저장
- 실시간 상태값 저장
- 중복 요청 방지
- Pub/Sub 메시지
- 큐 처리의 기반 저장소

Redis는 영구 저장용이 아니라 **빠르게 꺼내 써야 하는 데이터**를 다루는데 특화되어 있다.

---

## 2. PHP Laravel에서 Redis를 쓰는 이유

Laravel 프로젝트에서 Redis를 쓰는 이유는

### 1. DB 부하를 줄일 수 있다

### 2. 응답 속도가 빨라진다
