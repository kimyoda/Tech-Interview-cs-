# 🌐 react 기초

1. React란?
   1-1. React의 정의
   - React는 프레임워크가 아니라 라이브러리다.
   - React는 UI라이브러리이다.
   - 사용자 인터페이스를 만들기 위한 JavaScript 라이브러리이다.

```jsx
// React의 핵심 - UI를 컴포넌트로 표현
function Welcome() {
  return <h1>Hello, React!</h1>;
}

// 이것만으로도 React는 작동한다
// 라우팅, 상태관리 등은 별도 라이브러리 필요
```

1-2. 라이브러리, 프레임워크

- 프레임워크 (Framework)
  ├── 전체 애플리케이션 구조를 제공
  ├── 정해진 규칙과 패턴 강제
  ├── 프레임워크가 당신의 코드를 호출 (IoC)
  └── 예: Angular, Next.js, Vue.js

- 라이브러리 (Library)
  ├── 특정 기능만 제공
  ├── 개발자가 필요한 부분만 선택 사용
  ├── 당신이 라이브러리를 호출
  └── 예: React, Lodash, Axios

- React가 라이브러리인 이유:

```jsx
// ❌ React는 이런 것들을 강제하지 않음
// - 폴더 구조
// - 라우팅 방식
// - 상태 관리 도구
// - 스타일링 방법

// ✅ 개발자가 자유롭게 선택
import { BrowserRouter } from "react-router-dom"; // 라우팅
import { Provider } from "react-redux"; // 상태관리
import styled from "styled-components"; // 스타일링
```

---

## 2. React의 탄생 배경

### 2_1. DOM 조작의 어려움

```js
// ❌ 전통적인 방식 (Vanilla JavaScript)
document.getElementById("counter").innerText = count;
document.getElementById("message").style.display = "block";
document.querySelector(".user-name").innerText = user.name;

// 문제점:
// 1. 코드가 복잡하고 읽기 어려움
// 2. DOM 조작이 느림 (브라우저 리플로우/리페인트)
// 3. 상태와 UI의 불일치 가능성
```

### 2_2. React로 해결

```jsx
// ✅ React 방식 - 선언적(Declarative)
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>증가</button>
    </div>
  );
}

// 상태(count)만 변경하면 UI가 자동으로 업데이트
// DOM 조작은 React가 알아서 최적화
```

---

## 3. React 개념

### 3_1. 컴포넌트(Component)

- UI를 독립적이고 재사용 가능한 조각으로 분리한다.

```jsx
// 함수형 컴포넌트 (현대적 방식)
function Button({ text, onClick }) {
  return <button onClick={onClick}>{text}</button>;
}

function App() {
  return (
    <div>
      <Button text="저장" onClick={() => console.log("저장")} />
      <Button text="취소" onClick={() => console.log("취소")} />
    </div>
  );
}

// 컴포넌트 = JavaScript 함수
// Props로 데이터 전달
// 재사용 가능
```

### 3_2. JSX(JavaScript XML)

- JavaScript안에 HTML을 작성하는 문법

```jsx
// JSX 코드
const element = <h1 className="title">Hello, {name}!</h1>;

// ↓ 변환됨 (Babel)

// 실제 JavaScript
const element = React.createElement(
  "h1",
  { className: "title" },
  "Hello, ",
  name,
  "!"
);

// JSX는 문법 설탕(Syntactic Sugar)
// 브라우저는 JSX를 이해 못함 → Babel이 변환
```

### 3_3. Virtual DOM

- React의 핵심 성능 최적화
- 실제 DOM 업데이트 과정:

1단계: Virtual DOM 생성
상태 변경 → 새로운 Virtual DOM 트리 생성

2단계: Diffing Algorithm
이전 Virtual DOM ↔ 새 Virtual DOM 비교
변경된 부분만 찾아냄

3단계: Reconciliation (재조정)
변경된 부분만 실제 DOM에 반영

결과: 최소한의 DOM 조작 = 빠른 성능

```jsx
// 예시: 리스트 업데이트
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}

// todos 배열이 변경되면:
// React가 Virtual DOM으로 차이를 계산
// 변경된 <li>만 실제 DOM에 업데이트
```

---

## 4. React Hooks - 함수형 컴포넌트

### 4_1. useState - 상태 관리

```jsx
function Counter() {
  // [현재값, 변경함수] = useState(초기값)
  const [count, setCount] = useState(0);

  // 상태 변경 → 컴포넌트 리렌더링
  return (
    <div>
      <p>카운트: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount((prev) => prev + 1)}>+1 (함수형)</button>
    </div>
  );
}
```

### 4_2. useEffect - 사이드 이펙트 처리

```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  // 컴포넌트 마운트/업데이트 시 실행
  useEffect(() => {
    // API 호출
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => setUser(data));

    // 클린업 함수 (선택사항)
    return () => {
      console.log("컴포넌트 언마운트");
    };
  }, [userId]); // 의존성 배열: userId 변경 시에만 재실행

  if (!user) return <div>로딩중...</div>;
  return <div>{user.name}</div>;
}
```

### 4_3. 기타 주요 Hooks

```jsx
// useContext - 전역 상태 공유
const theme = useContext(ThemeContext);

// useRef - DOM 접근 또는 값 유지
const inputRef = useRef(null);
inputRef.current.focus();

// useMemo - 비용 큰 계산 결과 메모이제이션
const sortedList = useMemo(() => items.sort((a, b) => a - b), [items]);

// useCallback - 함수 메모이제이션
const handleClick = useCallback(() => {
  console.log("클릭");
}, []);
```

- 해당 Hooks와 관련된 내용은 따로 더 살펴볼 것이다.

---

## 5. React 생태계

### 5_1. 라우팅\_React Router

```jsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">홈</Link>
        <Link to="/about">소개</Link>
      </nav>

      <Routers>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/users/:id" element={<UserDetail />} />
      </Routers>
    </BrowserRouter>
  );
}
```

### 5_2. 상태관리

```jsx
// Context API (내장)
const UserContext = createContext();

function App() {
  const [user, setUser] = useState(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <MyComponent />
    </UserContext.Provider>
  );
}

// Redux (외부 라이브러리)
const store = createStore(reducer);
<Provider store={store}>
  <App />
</Provider>;

// Zustand (경량 라이브러리)
const useStore = create((set) => ({
  count: 0,
  increase: () => set((state) => ({ count: state.count + 1 })),
}));
```
