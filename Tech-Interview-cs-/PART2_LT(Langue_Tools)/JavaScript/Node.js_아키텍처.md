# 🌐 Node.js 아키텍처

1. **Node.js 개요**
2. **핵심**
3. **아키텍처 패턴**
4. **패턴가이드**

---

## 1. Node.js 개요

**Node.js란?**

- Chrome V8 JavaScript 엔진 위에서 구동되는 JavaScript 런타임 환경이다.

특징:

- 🔄 이벤트 기반(Event-drive)
- ⚡ 논블로킹 I/O (Non-blocking I/O)
- 🧵 단일 스레드 (Single Thread)
- 🚀 높은 동시성 처리

Node.js 서버

```js
// 비동기 방식
fs.readfile("file.txt", (err, data) => {
  console.log(data);
});
console.log("다음 작업");
```

---

## 2. 개념

### 2.1 이벤트 루프 (EventLoop)

Node.js가 단일 스레드지만 높은 동시성을 처리할 수 있다.
이벤트 루프 단계

```
┌───────────────────────────┐
┌─>│       timers              │  setTimeout, setInterval
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │   pending callbacks       │  I/O 콜백
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     idle, prepare         │  내부용
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │        poll               │  새로운 I/O 이벤트
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │        check              │  setImmediate
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──│   close callbacks         │  소켓 종료 등
   └───────────────────────────┘
```

예시

```js
console.log('1. 시작');

setTimeout(() => console.log('2. setTimeout'), 0);
setTimeout(() => console.log('3. setImmediate'));
process.nextTick(() => console.log('4. nextTick'));
Promise.resolve().(() => console.log('5. Promise'));

console.log('6. 종료');

// 출력순서
// 1. 시작
// 6. 종료
// 4. nextTick
// 5. Promise
// 2. setTimeout
// 3. setImmediate
```

우선순위:

```
process.nextTick > Promise (Microtask) > setTimeout > setImmediate
```
