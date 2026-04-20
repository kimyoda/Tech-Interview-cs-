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
