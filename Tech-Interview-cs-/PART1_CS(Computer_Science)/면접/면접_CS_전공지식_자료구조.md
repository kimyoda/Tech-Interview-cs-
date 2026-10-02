# 자료구조

---

## 복잡도

### 시간 복잡도

시간 복잡도는 입력 크기 n이 증가할 때 알고리즘의 실행 횟수가 어떻게 증가하는지 나타낸다
실제 실행 시간은 하드웨어와 런타임에 따라 달라져, 보통 가장 빠르게 증가하는 항만 남기는 빅오 표기법으로 표현한다

| 표기       | 의미                               | 예시                              |
| ---------- | ---------------------------------- | --------------------------------- |
| O(1)       | 입력 크기와 관계없이 일정          | 배열 인덱스 접근, Map 조회의 일반 |
| O(log n)   | 탐색 범위를 반복해서 절반으로 줄임 | 이진 탐색, 균형 이진 탐색 트리    |
| O(n)       | 모든 원소를 한 번에 확인           | 선형 탐색                         |
| O(n log n) | 로그 단계마다 전체 원소를 처리     | 효율적인 비교 정렬                |
| O(n²)      | 이중 반복문으로 모든 쌍을 비교     | 단순한 중복 비교                  |
| O(2ⁿ)      | 선택마다 경우의 수가 두 배로 증가  | 부분집합 완전 탐색                |
| O(n!)      | 모든 순열을 확인                   | 순열 완전 탐색                    |

일반적으로 입력이 충분히 클 때 증가율을 설명

```ts
function first<T>(values: T[]): T | undefined {
  return values[0];
}
// O(1)

function contains<T>(values: T[], target: T): boolean {
  for (const value of values) {
    if (value === target) {
      return true;
    }
  }

  return false;
}
// O(n)

function printPairs<T>(values: T[]): void {
  for (const left of values) {
    for (const right of values) {
      console.log(left, right);
    }
  }
}
// O(n²)
```

#### 최선, 평균, 최악

같은 알고리즘도 입력 상태에 따라 실행 시간이 달라질 수 있음

- 선형 탐색에서 첫 원소가 정답이면 최선 O(1)
- 정답이 마지막에 있거나 없으면 최악 O(n)
- 면접에서 별도 조건이 없다면 보통 최악 시간 복잡도, 필요하면 평균을 덧붙인다

#### 상수와 낮은 차수 생략

```text

```

n이 커질수록 n 항이 증가율을 지배 상수 계수와 낮은 차수의 항은 생략한다. 다만 실무 성능에서 상수 비용, 메모리 접근 패턴, 네트워크와 DB I/O도 중요

#### 상환 시간 복잡도

동적 배열의 push는 대부분 O(1)지만 내부 용량이 부족하면 더 큰 공간을 확보하고 기존 값을 복사해야 하므로 한 번의 연산은 O(n)이 될 수 있다. 여러 번의 push 전체 비용을 평균 내면 일반적으로 상환 O(1)로 설명한다

#### 게임 서버

- 방 안의 모든 플레이어를 매 틱마다 서로 비교
- 사용자 ID로 세션을 조회할 때 Map을 사용하면 일반적으로 배열 선형 탐색보다 유리
- 랭킹 전체를 매 요청마다 정렬하면 O(n log n)의 비용이 반복된다
- 네트워크, DB, Redis 호출이 포함되면 자료 구조의 복잡도만으로 실제 응답 시간을 단정할 수 없다

---

### 공간 복잡도

공간 복잡도는 입력 크기 n에 따라 알고리즘이 사용하는 메모리의 증가량을 나타낸다. 보통 입력 자체를 제외한 추가 공간을 중심으로 설명한다

```ts
function sum(values: number[]): number {
  let total = 0;

  for (const value of values) {
    total += value;
  }

  return total;
}
// 추가 공간 O(1)

function doubled(values: number[]): number[] {
  return values.map((value) => value * 2);
}
// 결과 배열에 추가 공간 O(n)
```

재귀 함수는 호출 스택도 공간으로 계산

```ts
function factorial(n: number): number {
  if (n <= 1) {
    return 1;
  }

  return n * factorial(n - 1);
}
// 시간 O(n), 호출 스택 O(n)
```

Node.js 서버는 아래를 고려한다

- 크기 제한 없는 Map과 배열
- 제거하지 않은 이벤트 리스너와 타이머
- 연결이 종료된 뒤에 남아 있는 세션 참조
- TTL이나 최대 크기가 없는 인메모리 캐시
- 대용량 JSON을 한 번에 역직렬화할 때 생기는 순간 메모리

시간과 공간은 서로 교환되는 경우가 많음. 캐시를 사용하면 메모리를 더 쓰는 대신 반복 계산이나 외부 I/O를 줄일 수 있음

---

### 자료 구조의 일반적인 시간 복잡도

대표적인 구현을 전제로 한 일반 값. JavaScript 명세가 Map과 Set 내부 구현을 특정 해시 테이블로 강제하는 것이 아니라, 무조건 O(1)이라고 단정하기보다 일반적인 구현에서 평균적으로 상수 시간에 가깝다

| 자료 구조           |                접근 |                 탐색 |                      삽입 |                  삭제 |
| ------------------- | ------------------: | -------------------: | ------------------------: | --------------------: |
| 배열                |                O(1) |                 O(n) | 끝: 상환 O(1), 중간: O(n) |  끝: O(1), 중간: O(n) |
| 단일 연결 리스트    |                O(n) |                 O(n) |          위치를 알면 O(1) | 이전 노드를 알면 O(1) |
| 해시 기반 Map, Set  |           해당 없음 | 평균적으로 매우 빠름 |      평균적으로 매우 빠름 |  평균적으로 매우 빠름 |
| 균형 이진 탐색 트리 |            O(log n) |             O(log n) |                  O(log n) |              O(log n) |
| 이진 힙             | 최솟값, 최댓값 O(1) |                 O(n) |                  O(log n) |    루트 삭제 O(log n) |
| 스택                |          맨 위 O(1) |                 O(n) |                      O(1) |                  O(1) |
| 큐                  |          맨 앞 O(1) |                 O(n) |                      O(1) |                  O(1) |

> 배열에서 shift를 반복하면 원소 재배치에 비효율적일 수 있음. 성능이 중요한 큐는 head 인덱스나 별도 큐 구현을 사용

---

## 선형 자료 구조

선형 자료 구조는 원소가 논리적으로 한 줄로 연결되는 구조

### 연결 리스트

연결 리스트는 각 노드가 값과 다음 노드에 대한 참조를 저장하는 구조

| 종류             | 노드의 참조                    |
| ---------------- | ------------------------------ |
| 단일 연결 리스트 | 다음 노드                      |
| 이중 연결 리스트 | 이전 노드와 다음 노드          |
| 원형 연결 리스트 | 마지막 노드가 처음 노드를 참조 |

```ts
class ListNode<T> {
  constructor(
    public value: T,
    public next: ListNode<T> | null = null,
  ) {}
}

class SinglyLinkedList<T> {
  private head: ListNode<T> | null = null;

  prepend(value: T): void {
    this.head = new ListNode(value, this.head);
  }

  find(predicate: (value: T) => boolean): T | undefined {
    let current = this.head;

    while (current) {
      if (predicate(current.value)) {
        return current.value;
      }

      current = current.next;
    }

    return undefined;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;

    while (current) {
      result.push(current.value);
      current = current.next;
    }

    return result;
  }
}
```

장점은 노드 위치를 알고 있을 때 연결만 바꾸어 삽입, 삭제할 수 있다. 단점은 임의 인덱스 접근이 O(n)이고, 각 노드의 참조를 위한 추가 메모리가 필요, 배열보다 캐시 지역성이 떨어질 수 있다는 점

> 연결 리스트는 각 노드가 값과 다음 노드의 참조를 저장하는 선형 자료 구조. 배열과 달리 연속된 메모리를 전제로 하지 않고, 대상 노드와 이전 노드를 알고 있으면 연결 변경만으로 삽입과 삭제를 수행할 수 있다. 반면 특정 인덱스에 접근하려면 처음부터 순회해야 하므로 O(n)이다.

---

### 배열

배열은 인덱스로 원소에 접근하는 선형 자료 구조. 일반적인 저수준 배열은 크기의 원소가 연속된 메모리에 저장, JavaScript의 Array는 동적이고 구현 최적화에 따라 내부 표현이 달라질 수 있음

```ts
type Player = {
  id: string;
  score: number;
};

const players: Player[] = [
  { id: "p1", score: 100 },
  { id: "p2", score: 250 },
];

console.log(players[1]); // 인덱스 접근
players.push({ id: "p3", score: 100 });
```

#### 배열 메서드 복잡도

| 메서드              |                복잡도 | 이유                              |
| ------------------- | --------------------: | --------------------------------- |
| push, pop           |       상환 O(1), O(1) | 배열 끝에서 처리                  |
| shift, unshift      |                  O(n) | 기존 원소를 이동할 수 있음        |
| find, includes      |                  O(n) | 순차 탐색                         |
| map, filter, reduce |                  O(n) | 모든 원소 순회                    |
| sort                | 일반적으로 O(n log n) | 엔진 구현과 입력에 따라 세부 차이 |

#### 희소 배열 주의

```ts
const values: number[] = [];
values[1_000_000] = 1;
```

큰 인덱스를 바로 사용하여 빈 슬롯이 많은 희소 배열이 된다. ID를 키로 조회하는 목적이면 Map이나 객체가 더 명확하다

---

### 벡터와 JavaScript 동적 배열

벡터는 크기가 자동으로 늘어나는 동적 배열을 뜻한다. JavaScript의 Array 크기를 동적으로 변경할 수 있어 사용 관점에서 벡터와 유사, C++의 vector 내부 메모리 모델이 같다고 설명하면 안 된다

```ts
const roomPlayerIds: string[] = [];

roomPlayerIds.push("player-1");
roomPlayerIds.push("player-2");
roomPlayerIds.pop();
```

TypedArray는 고정 길이의 숫자형 버퍼가 필요할 때 사용

```ts
const positions = new Float32Array(6);

positions[0] = 10.5;
positions[1] = 3.2;
positions[2] = -7.1;
```

TypedArray는 바이너리 프로토콜, 파일, 그래픽 수치 데이터 처리에 유용하나 생성 후 길이를 바꿀 수 없는 경우가 일반적

---

### 스택

스택은 마지막에 들어간 값이 먼저 나오는 LIFO 구조

```ts
class Stack<T> {
  private readonly values: T[] = [];

  push(value: T): void {
    this.values.push(value);
  }

  pop(): T | undefined {
    return this.values.pop();
  }

  peek(): T | undefined {
    return this.values[this.values.length - 1];
  }

  get size(): number {
    return this.values.length;
  }
}
```

활용 예시

- 함수 호출 스택
- 괄호 검사
- 실행 취소
- 깊이 우선 탐색, 파서와 계단식 처리

```ts
function isBalanced(text: string): boolean {
  const stack: string[] = [];
  const pair: Record<string, string> = {
    ")": "(",
    "]": "[",
    "}": "{",
  };

  for (const char of text) {
    if (char === "(" || char === "[" || char === "{") {
      stack.push(char);
      continue;
    }

    if (char in pair && stack.pop() !== pair[char]) {
      return false;
    }
  }

  return stack.length === 0;
}
```

---

### 큐

큐는 먼저 들어간 값이 먼저 나오는 FIFO 구조

Array의 shift는 반복 사용 시 비효율적일 수 있어 head 인덱스를 사용할 수 있음

```ts
class Queue<T> {
  private readonly values: T[] = [];
  private head = 0;

  enqueue(value: T): void {
    this.values.push(value);
  }

  dequeue(): T | undefined {
    if (this.head >= this.values.length) {
      return undefined;
    }

    const value = this.values[this.head];
    this.head += 1;

    if (this.head > 1024 && this.head * 2 > this.values.length) {
      this.values.splice(0, this.head);
      this.head = 0;
    }

    return value;
  }

  get size(): number {
    return this.values.length - this.head;
  }
}
```

#### NestJS 작업 큐 서비스

단일 프로세스 메모리 안의 교육용 큐다. 프로세스가 종료되면 작업이 사라지고, 여러 Pod가 하나의 큐를 공유하지 않음. 비동기 작업은 Redis 기반 작업 큐나 메시지 브로커를 검토

```ts
import { Injectable } from "@nestjs/common";

type MatchJob = {
  playerId: string;
  enqueuedAt: number;
};

@Injectable()
export class MatchQueueService {
  private readonly queue = new Queue<MatchJob>();

  enqueue(playerId: string): void {
    this.queue.enqueue({
      playerId,
      enqueuedAt: Date.now(),
    });
  }

  dequeue(): MatchJob | undefined {
    return this.queue.dequeue();
  }

  getSize(): number {
    return this.queue.size;
  }
}
```

---

## 비선형 자료 구조

비선형 자료 구조는 원소가 계층이나 네트워크 형태로 연결되는 구조

### 그래프

그래프는 정점 Vertex, 간선 Edge로 구성

| 구분          | 설명                         |
| ------------- | ---------------------------- |
| 방향 그래프   | 간선에 방향이 있음           |
| 무방향 그래프 | 간선에 방향이 없음           |
| 가중치 그래프 | 간선에 비용이나 거리가 있음  |
| 연결 그래프   | 모든 정점 사이에 경로가 있음 |

#### 인접 행렬과 인접 리스트

| 표현        |     공간 |              간선 확인 | 모든 이웃 순회 | 적합한 경우        |
| ----------- | -------: | ---------------------: | -------------: | ------------------ |
| 인접 행렬   |    O(V²) |                   O(1) |           O(V) | 간선이 많은 그래프 |
| 인접 리스트 | O(V + E) | 일반적으로 차수에 비례 |      O(degree) | 희소 그래프        |

```ts
class Graph<T> {
  private readonly adjacency = new Map<T, Set<T>>();

  addVertex(vertex: T): void {
    if (!this.adjacency.has(vertex)) {
      this.adjacency.set(vertex, new Set());
    }
  }

  addUndirectedEdge(left: T, right: T): void {
    this.addVertex(left);
    this.addVertex(right);
    this.adjacency.get(left)!.add(right);
    this.adjacency.get(right)!.add(left);
  }

  neighbors(vertex: T): T[] {
    return [...(this.adjacency.get(vertex) ?? [])];
  }
}
```

#### BFS

BFS는 가까운 정점부터 탐색하여 큐를 사용. 가중치가 없는 그래프의 최단 경로에 사용할 수 있다

```ts
function bfs<T>(graph: Map<T, T[]>, start: T): T[] {
  const visited = new Set<T>([start]);
  const queue = new Queue<T>();
  const order: T[] = [];

  queue.enqueue(start);

  while (queue.size > 0) {
    const current = queue.dequeue()!;
    order.push(current);

    for (const next of graph.get(current) ?? []) {
      if (visited.has(next)) {
        continue;
      }

      visited.add(next);
      queue.enqueue(next);
    }
  }

  return order;
}
```

#### DFS

DFS는 한 경로를 깊게 탐색, 스택 또는 재귀를 사용

```ts
function dfs<T>(graph: Map<T, T[]>, current: T, visited = new Set<T>()): T[] {
  visited.add(current);
  const order: T[] = [current];

  for (const next of graph.get(current) ?? []) {
    if (!visited.has(next)) {
      order.push(...dfs(graph, next, visited));
    }
  }

  return order;
}
```

BFS, DFS의 시간 복잡도는 인접 리스트 기준 O(V + E)다

게임 서버에 친구 관계, 월드 경로, 퀘스트 선행 조건 등 그래프로 표현할 수 있음

---

### 트리

트리는 사이클이 없는 계층적 구조. 루트, 부모, 자식, 리프, 깊이, 높이 등의 용어를 사용

이진 트리는 각 노드가 최대 두 개의 자식을 가진다. 이진 탐색 트리 BST는 왼쪽 서브트리에 더 작은 값, 오른쪽 서브트리에 더 큰 값을 배치

```ts
class TreeNode {
  left: TreeNode | null = null;
  right: TreeNode | null = null;

  constructor(public value: number) {}
}

class BinarySearchTree {
  private root: TreeNode | null = null;

  insert(value: number): void {
    const node = new TreeNode(value);

    if (!this.root) {
      this.root = node;
      return;
    }

    let current = this.root;

    while (true) {
      if (value < current.value) {
        if (!current.left) {
          current.left = node;
          return;
        }

        current = current.left;
      } else {
        if (!current.right) {
          current.right = node;
          return;
        }

        current = current.right;
      }
    }
  }

  has(value: number): boolean {
    let current = this.root;

    while (current) {
      if (value === current.value) {
        return true;
      }

      current = value < current.value ? current.left : current.right;
    }

    return false;
  }
}
```

균형이 잡힌 BST의 탐색, 삽입, 삭제는 O(log n)이나, 값이 정렬된 순서로 들어가 한쪽으로 치우치면 연결 리스트처럼 되어 O(n)이 될 수 있다. 해당 이슈를 완화하는 구조가 AVL 트리, 레드-블랙 트리

#### 트리 순회

| 순회      | 순서                   | 활용                        |
| --------- | ---------------------- | --------------------------- |
| 전위      | 루트 -> 왼쪽 -> 오른쪽 | 구조 복사, 직렬화           |
| 중위      | 왼쪽 -> 루트 -> 오른쪽 | BST에 정렬된 순서           |
| 후위      | 왼쪽 -> 오른쪽 -> 루트 | 하위 노드 처리 후 상위 처리 |
| 레벨 순회 | 깊이별 순서            | BFS                         |

---

### 힙

힙은 완전 이진 트리 형태의 자료 구조

- 최소 힙: 부모가 자식보다 작거나 같음
- 최대 힙: 부모가 자식보다 크거나 같음
- 루트의 최솟값 또는 최댓값 확인은 O(1)
- 삽입과 루트 삭제는 O(log n)
- 임의의 값 탐색은 일반적으로 O(n)

```ts
class MinHeap {
  private readonly values: number[] = [];

  push(value: number): void {
    this.values.push(value);
    this.bubbleUp(this.values.length - 1);
  }

  pop(): number | undefined {
    if (this.values.length === 0) {
      return undefined;
    }

    if (this.values.length === 1) {
      return this.values.pop();
    }

    const min = this.values[0];
    this.values[0] = this.values.pop()!;
    this.bubbleDown(0);
    return min;
  }

  peek(): number | undefined {
    return this.values[0];
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);

      if (this.values[parent] <= this.values[index]) {
        return;
      }

      [this.values[parent], this.values[index]] = [
        this.values[index],
        this.values[parent],
      ];
      index = parent;
    }
  }

  private bubbleDown(index: number): void {
    while (true) {
      const left = index * 2 + 1;
      const right = index * 2 + 2;
      let smallest = index;

      if (
        left < this.values.length &&
        this.values[left] < this.values[smallest]
      ) {
        smallest = left;
      }

      if (
        right < this.values.length &&
        this.values[right] < this.values[smallest]
      ) {
        smallest = right;
      }

      if (smallest === index) {
        return;
      }

      [this.values[index], this.values[smallest]] = [
        this.values[smallest],
        this.values[index],
      ];
      index = smallest;
    }
  }
}
```

---

### 우선 순위 큐

우선순위 큐는 들어온 순서가 아닌 우선순위가 높은 원소를 먼저 꺼내는 추상 자료형. 힙은 우선순위 큐를 구현하는 대표적 방법

```ts
type ScheduledJob = {
  id: string;
  executeAt: number;
};

class JobPriorityQueue {
  private readonly heap: ScheduledJob[] = [];

  enqueue(job: ScheduledJob): void {
    this.heap.push(job);
    this.up(this.heap.length - 1);
  }

  dequeue(): ScheduledJob | undefined {
    if (this.heap.length <= 1) {
      return this.heap.pop();
    }

    const first = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.down(0);
    return first;
  }

  private up(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);

      if (this.heap[parent].executeAt <= this.heap[index].executeAt) {
        break;
      }

      [this.heap[parent], this.heap[index]] = [
        this.heap[index],
        this.heap[parent],
      ];
      index = parent;
    }
  }

  private down(index: number): void {
    while (true) {
      const left = index * 2 + 1;
      const right = index * 2 + 2;
      let next = index;

      if (
        left < this.heap.length &&
        this.heap[left].executeAt < this.heap[next].executeAt
      ) {
        next = left;
      }

      if (
        right < this.heap.length &&
        this.heap[right].executeAt < this.heap[next].executeAt
      ) {
        next = right;
      }

      if (next === index) {
        return;
      }

      [this.heap[index], this.heap[next]] = [this.heap[next], this.heap[index]];
      index = next;
    }
  }
}
```

예약 작업, 타임아웃 관리, 매칭 후보 우선 처리다

---

### Map

Map은 키와 값을 연결해 저장. 객체도 문자열, 심벌 키를 이용한 사전처럼 사용할 수 있으나, Map은 키-값 컬렉션을 위한 명확한 API, size, 반복 기능을 제공하고 객체 자체도 키로 사용할 수 있음

```ts
type Session = {
  socketId: string;
  connectedAt: number;
};

const sessions = new Map<string, Session>();

sessions.set("player-1", {
  socketId: "socket-a",
  connectedAt: Date.now(),
});

const session = sessions.get("player-1");
sessions.delete("player-1");
```

#### NestJS 세션 저장소 예

```ts
import { Injectable } from "@nestjs/common";

@Injectable()
export class SessionStore {
  private readonly sessions = new Map<string, Session>();

  set(playerId: string, session: Session): void {
    this.sessions.set(playerId, session);
  }

  get(playerId: string): Session | undefined {
    return this.sessions.get(playerId);
  }

  remove(playerId: string): boolean {
    return this.sessions.delete(playerId);
  }
}
```

해당 저장소는 Node.js 프로세스 안에서만 공유된다. Cluster, 여러 Pod, 여러 서버에 각각 다른 Map이 생성되어 전역 세션 저장소가 필요하면 외부 저장소를 검토

### Set

Set은 중복되지 않은 값 집합

```ts
const connectedPlayerIds = new Set<string>();

connectedPlayerIds.add("player-1");
connectedPlayerIds.add("player-1");

console.log(connectedPlayerIds.size); // 1
console.log(connectedPlayerIds.has("player-1")); // true
```

배열의 중복 제거도 사용할 수 있다

```ts
const values = [1, 1, 2, 3, 3];
const uniqueValues = [...new Set(values)];
```

게임 서버에 방 참가자 ID, 이미 처리한 이벤트 ID, 권한 집합, 관심 영역 객체 집합 등에 활용할 수 있음

---

### 해시 테이블

해시 테이블은 키를 해시 함수로 변환해 저장 위치를 정하는 자료 구조다

```text
키 -> 해시 함수 -> 버킷 인덱스 -> 값
```

서로 다른 키가 같은 버킷을 가리키는 현상을 충돌

| 충돌 해결   | 설명                         |
| ----------- | ---------------------------- |
| 체이닝      | 같은 버킷에 여러 항목을 연결 |
| 개방 주소법 | 다른 빈 버킷을 찾아 저장     |

해시 테이블의 탐색, 삽입, 삭제는 평균적으로 빠르나, 충돌이 심하거나 구현 상태가 나쁘면 최악 O(n)이 될 수 있다

#### 체이닝 예시

```ts
type Entry<V> = {
  key: string;
  value: V;
};

class SimpleHashTable<V> {
  private readonly buckets: Array<Array<Entry<V>>>;

  constructor(bucketCount = 16) {
    this.buckets = Array.from({ length: bucketCount }, () => []);
  }

  set(key: string, value: V): void {
    const bucket = this.buckets[this.hash(key)];
    const entry = bucket.find((item) => item.key === key);

    if (entry) {
      entry.value = value;
      return;
    }

    bucket.push({ key, value });
  }

  get(key: string): V | undefined {
    return this.buckets[this.hash(key)].find((item) => item.key === key)?.value;
  }

  private hash(key: string): number {
    let result = 0;

    for (const char of key) {
      result = (result * 31 + char.charCodeAt(0)) >>> 0;
    }

    return result % this.buckets.length;
  }
}
```

해당 코드는 학습용, 전용 비밀번호 해싱 알고리즘 사용

---

## 자료 구조 선택 기준

| 요구사항                       | 구조            |
| ------------------------------ | --------------- |
| 순서대로 저장, 인덱스로 접근   | 배열            |
| 마지막 항목을 먼저 처리        | 스택            |
| 먼저 들어온 항목을 먼저 처리   | 큐              |
| 가장 높은 우선순위를 먼저 처리 | 우선순위 큐, 힙 |
| 키로 값을 빠르게 조회          | Map             |
| 중복 없는 값과 포함 여부 확인  | Set             |
| 계층 구조                      | 트리            |
| 관계와 경로                    | 그래프          |

자료구조는 접근 패턴을 기준으로 선택

- 어떤 연산이 가장 자주 발생
- 입력 크기는 어느 정도인지
- 순서 보존이 필요한지
- 중복을 허용하는지
- 메모리 제한이 있는지
- 한 프로세스 안의 상태, 여러 서버가 공유해야 하는 상태인지
- 영속성과 장애 복구가 필요한지

---

## Node.js, NestJS 주의

### 인메모리 자료 구조는 프로세스 로컬 상태

Map, Set, Array에 저장한 값은 현재 프로세스에 존재, 여러 프로세스, Worker, Pod가 자동으로 공유하지 않음

### 이벤트 루프를 오래 막지 않는다

큰 배열 정렬, 거대한 그래프 탐색, 대량 JSON 처리처럼 CPU를 오래 사용하는 동기 작업은 같은 프로세스의 다른 요청 처리를 지연시킬 수 있음. 작업 분할, Worker Thread, 별도 작업 프로세스 등을 검토

### 캐시는 제한을 둔다

- 최대 항목 수
- TTL
- 제거 정책
- 메모리 사용량
- 캐시 미스와 적중률
- 원본 데이터 변경 시 무효화 정책

### 자료 구조와 외부 저장소를 구분

Redis의 List, Set, Sorted Set도 자료 구조 API를 제공, 네트워크 I/O, 영속성 설정, 복제, 장애 처리까지 고려한다. 프로세스 내부의 Set과 Redis Set은 같은 문제를 해결하지 않음

---

## 질문, 답변

### 배열과 연결 리스트의 차이는?

> 배열은 인덱스로 O(1)에 접근할 수 있고 캐시 지역성이 좋으나, 중간 삽입과 삭제 시 원소 이동이 필요해 O(n)일 수 있다. 연결 리스트는 임의 접근이 O(n)이지만 대상 위치를 알고 있으면 참조 변경으로 삽입과 삭제를 수행할 수 있다

### 스택과 큐의 차이는

> 스택은 마지막에 들어온 값이 먼저 나오는 LIFO 구조, 큐는 먼저 들어온 값이 먼저 나오는 FIFO 구조다. 스택은 실행 취소나 DFS, 큐는 작업 대기열이나 BFS에 활용할 수 있다

### BFS, DFS의 차이는

> BFS는 큐로 가까운 정점부터 탐색하고 가중치가 없는 그래프의 최단 경로에 적합하다. DFS는 스택이나 재귀로 한 경로를 깊게 탐색하며 경로 탐색, 사이클 검사, 백트래킹에 자주 사용한다. 인접 리스트 기준 둘 다 O(V + E)이다.

### 힙과 이진 탐색 트리의 차이는

> 힙은 최솟값이나 최댓값을 빠르게 꺼내는 데 적합하나 전체가 정렬된 것은 아니므로 임의 값 탐색은 일반적으로 O(n)이다. 균형 이진 탐색 트리는 탐색, 삽입, 삭제를 O(log n)에 수행하고 중위 순회로 정렬된 순서를 얻을 수 있다

### Map, Object 중 무엇을 사용하는지

> 고정된 필드를 가진 도메인 객체는 일반 객체와 타입을 사용, 런타임에 키가 계속 추가, 삭제되는 키-값 컬렉션은 Map을 우선 검토한다. Map은 size와 반복 API, 객체도 키로 사용할 수 있다

### JavaScript, Map 조회는 무조건 O(1)인지?

> 이렇게 하면 정확하지 않다. JavaScript 명세는 평균 접근 시간이 원소 수보다 나은 구현을 요구하나 특정 내부 구조를 강제하지 않는다.

---

## 참고 자료

- MDN JavaScript 데이터 타입과 자료 구조: https://developer.mozilla.org/docs/Web/JavaScript/Guide/Data_structures
- MDN Keyed collections: https://developer.mozilla.org/docs/Web/JavaScript/Guide/Keyed_collections
- MDN Map: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map
- MDN Set: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set
- Node.js 공식 문서: https://nodejs.org/docs/latest/api/
- NestJS Providers: https://docs.nestjs.com/providers
