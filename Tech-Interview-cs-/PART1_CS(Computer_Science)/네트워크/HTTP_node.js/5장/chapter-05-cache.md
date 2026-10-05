# 5장 HTTP 캐시

## 캐시와 신선도

HTTP 캐시는 이전 응답을 저장, 재사용하여 지연 시간과 네트워크 사용량을 줄인다
서버는 `Cache-Control`로 저장 기능 여부와 신선한 기간을 지정한다

```http
Cache-Control: public, max-age=60
```

`max-age=60`은 응답이 생성된 뒤 60초 동안 신선하다는 뜻. 시간이 지나면 캐시가 무조건 삭제된다는 뜻은 아니고, 보통 서버에 재검증한 뒤 재사용하거나 새 응답을 받는다

## 주요 지시어

| 지시어                     | 의미                                                           |
| -------------------------- | -------------------------------------------------------------- |
| `max-age=N`                | 응답이 N초 동안 신선함                                         |
| `no-cache`                 | 저장 가능하나 사용 전 재검증 필요                              |
| `no-store`                 | 응답을 저장하지 않도록 지시                                    |
| `public`                   | 공유 캐시에도 저장 가능                                        |
| `private`                  | 개인 브라우저 캐시에만 저장 가능                               |
| `must-revalidate`          | 만료된 응답을 오리진 확인 없이 재사용하지 않음                 |
| `stale-while-revalidate=N` | 만료 후 N초 동안 오래된 응답을 제공하며 백그라운드 재검증 가능 |

`no-cache`는 캐시하지말라가 아닌, 이름과 달리 저장은 허용하되 매번 재검증 하라는 뜻

## 조건부 요청

캐시는 `ETag` 또는 `Last-Modified` 검증자를 이용해 리소스가 바뀌었는지 물을 수 있다

```http
If-None-Match: "v1"
```

변경되지 않았다면 서버는 본문 없이 `304 Not Modified` 를 반환 전체 본문을 다시 전송하는 비용을 줄인다

## 실습

| 파일                               | 내용                          |
| ---------------------------------- | ----------------------------- |
| [cache.js](cache.js)               | `max-age`와 `must-revalidate` |
| [cacheNoCache.js](cacheNoCache.js) | 저장 후 항상 재검증           |
| [cacheNoStore.js](cacheNoStore.js) | 저장 공지                     |
| [cachePublic.js](cachePublic.js)   | 공유 캐시 허용                |
| [cacheSWR.js](cacheSWR.js)         | stale-while-revalidate        |

```bash
node cache.js
curl -i http://localhost:8080
```

브라우저 개발자 도구에 Disable cache 옵션이 켜져 있으면 실습 결과가 달라 질 수 있음

## 면접

- `no-cache`, `no-store` 의 차이는
- 강한 ETag와 약한 ETag는 어떻게 다른지
- `304` 응답에 본문이 없는 이유는?
- 개인 캐시와 공유 캐시의 차이는?

### Postman으로 TypeScript 캐시 예제 확인하기

먼저 `HTTP_node.js` 폴더에서 원하는 TypeScript 서버 하나를 실행한다. npm 스크립트가 해당 `.ts` 파일을 컴파일한 뒤 생성된 `dist/5장/*.js`를 실행한다.

```bash
npm run start:ts:cache
```

서버가 실행된 터미널은 종료하지 않는다. Postman에서 다음과 같이 요청한다.

- Method: `GET`
- URL: `http://localhost:8080/`
- Body: `none`

**응답의 Headers 탭**에서 `Cache-Control`을 확인한다. Postman **요청의 Headers 탭**에 `Cache-Control`을 직접 입력하는 실습이 아니다.

| 실행 명령                         | 예상 상태 | 응답의 `Cache-Control` 헤더                            |
| --------------------------------- | --------- | ------------------------------------------------------ |
| `npm run start:ts:cache`          | `200 OK`  | `max-age=6, must-revalidate`                           |
| `npm run start:ts:cache-no-cache` | `200 OK`  | `no-cache`                                             |
| `npm run start:ts:cache-no-store` | `200 OK`  | `no-store`                                             |
| `npm run start:ts:cache-public`   | `200 OK`  | `public, max-age=604800`                               |
| `npm run start:ts:cache-swr`      | `200 OK`  | `public, max-age=604800, stale-while-revalidate=86400` |

각 예제는 다음 순서로 확인한다.

1. 터미널에서 서버 하나를 실행한다.
2. Postman에서 `GET http://localhost:8080/` 요청을 보낸다.
3. 응답 상태가 `200 OK`인지 확인한다.
4. 응답의 **Body**에서 해당 예제의 안내 문구를 확인한다.
5. 응답의 **Headers**에서 `Cache-Control` 값을 확인한다.
6. 터미널에서 `Ctrl+C`로 서버를 종료한 뒤 다음 예제를 실행한다.

예를 들어 `no-store`를 확인하려면 다음 서버를 실행한다.

```bash
npm run start:ts:cache-no-store
```

Postman에서 다시 `GET http://localhost:8080/`을 보내면 응답 헤더에 다음 값이 보여야 한다.

```http
Cache-Control: no-store
```

`cache-public` 실행 명령은 실제 파일명인 `cacheNoPublic.ts`를 컴파일한다. 파일명에는 `No`가 들어 있지만 이 예제의 실제 지시어는 `public`이다.

**확인 범위:** 이 실습은 서버가 올바른 `Cache-Control` 응답 헤더를 보내는지 확인한다. Postman에 `200 OK`와 헤더가 표시됐다는 사실만으로 응답이 실제 캐시에 저장됐는지, 6초 후 재검증됐는지, `stale-while-revalidate`가 백그라운드에서 수행됐는지까지 확인한 것은 아니다. 현재 예제에는 `ETag`·`Last-Modified` 검사나 `304 Not Modified` 응답 로직도 없다.
