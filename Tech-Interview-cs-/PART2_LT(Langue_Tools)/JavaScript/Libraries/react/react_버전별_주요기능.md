# 🌐 리액트의 진화, 버전별 주요기능과 React 19기능

## 도입

- React는 2013년 오픈소스로 공개된 이후 지속적으로 업데이트 했다.
- 웹 개발의 패러다임 자체를 바꾸는 기능 업데이트를 주로 하였다.
- 2024년 React 19가 공개 되면서 큰 변화가 일어났다.
- React19를 이해하기 위해 그동안 어떤 과정을 통해 발전했는 지 확인해야 한다.

## React의 버전별 역사

**React 0.x ~ 14.x: 기반(2013-2015)**

- React 0.3(2013년 5월) - 시작
  -> React가 처음 나왔던 시기이다. JSConfUS2013에 발표되며 개발자 커뮤니티에 큰 반향을 일으켰다.
  - **JSX 문법 도입**: HTML과 비슷하나 JavaScript 안에서 작동하는 문법
  - **Virtual DOM**: 실제 DOM 조작을 최소화하는 혁신적인 개념
  - **단방향 데이터 흐름**: props를 통한 명확한 데이터 전달 방식

**React 0.14(2015년 10월) - 분리의 시작**

- React의 구조 변경이 생성되었음.
  - **react와 react-dom 패키지 분리**: React의 핵심 로직과 DOM 렌더링을 분리했다. React native의 발판이 되었다.
  - **Stateless Functional Components**: 함수형 컴포넌트가 등장하였다. 나중에 Hooks의 토대가 되었다.
  - **refs 개선**: DOM요소에 접근하는 방식이 더 명확해졌다.

**React 15.x: 안정화 시기(2016)**

- React 15.0(2016년 4월) - 내부 검토
  -> React 내부 구조 개선
  - **SVG 속성 지원 개선**: SVG를 React로 다리기 쉬워짐.
  - 더 나은 경ㄹ고 메시지: 개발자 경험 향상 상승
  - **document.createElement 대신 innerHTML 개선**: 보안과 성능 개선이 이루어짐

**React 16.x: Fiber의 시대(2017-2019)**

- React 16.0(2017년 9월) - Fiber 렌더링 엔진
- Fiber가 해결한 문제: React는 렌더링을 시작하면 중단할 수 없었다. 복잡한 컴포넌트 트리를 렌더링 하는 동안 UI가 멈추는 문제가 생겼다.
- Fiber는 렌더링 작업을 작은 단위로 나누고, 우선순위를 정하고, 필요하면 중단하고 재개할 수 있도록 하였다.
  - **Error Boundaries**: 컴포넌트 트리의 일부에서 에러가 발생해도 전체 앱이 죽지 않는다.
  - **Portals**: 부모 컴포넌트의 DOM 계층 외부에 자석을 렌더링 할 수 있다.(모달, 툴팁에 유용하다)
  - **향상된 서버 사이드 렌더링**: 스트리밍 SSR 지원으로 개선되었다.
  - **Fragment 지원**: 불필요한 래퍼 div없이 여러 요소를 반환할 수 있다.

```jsx
// Error Boundary 예시
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.log("Error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <h1>문제가 발생했습니다.</h1>;
    }
    return this.props.children;
  }
}

// Portal 예시
const Modal = ({ children }) => {
  return ReactDOM.createPortal(children, document.getElementById("modal-root"));
};
```

**React 16.3(2018년 3월) - 새로운 생명주기와 Context**

- **새로운 Context API**: 이전의 실험적 Context를 대체하는 공식 API
- 생명주기 메서드 변경: `componentWillMount`, `componentWillReceiveProps`, `componentWillUpdate`가 deprecated되고, `getDerivedStateFromProps`,`getSnapshotBeforeUpdate`가 추가되었다.
- **createRefAPI**: ref를 더 명확하게 관리할 수 있다.

**React 16.6(2018년 10월) - 코드 분할과 메모이제이션**

- **React.memo**: 함수형 컴포넌트의 메모이제이션을 위한 HOC
- **React.lazy**: 동적 import를 통한 컴포넌트 지연로딩
- **Suspense**: 비동기 컴포넌트 로딩 중 UI

```jsx
// lazy와 Suspense 예시
const LazyComponenet = React.lazy(() => import("./LazyComponent"));

function App() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

**React 16.8(2019년 2월) - Hooks 등장**

- React 역사상 가장 중요한 업데이트다.
- 함수형 컴포넌트에서 상태와 생명주기 기능을 사용할 수 있게 되었다.
- 핵심 Hooks
  - `useState`: 함수형 컴포넌트에 상태 추가
  - `useEffect`: 부수 효과 처리 (생명주기를 통합)
  - `useContext`: Context를 더 쉽게 소비한다
  - `useReducer`: 복잡한 상태 로직 관리
  - `useCallback`, `useMemo`: 성능 최적화
  - `useRef`: 값 참조와 DOM 접근

- Hooks의 등장으로 클래스 컴포넌트 없이 모든 React 기능을 사용할 수 있게 되었고, 로직 재사용이 쉬워졌다.

```jsx
// Hooks를 사용한 간결한 컴포넌트
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `클릭 ${count}번`;
  }, [count]);

  return <button onClick={() => setCount(count + 1)}>클릭: {count}</button>;
}
```

**React 17.x: 기반 전환 (2020)**

- React 17.0(2020년 10월) - 새 기능없는 릴리즈, 점진적 업그레이드
- **새로운 JSX Transform**: `import React from 'react'`를 매번 쓰지 않아도 된다.
- **이벤트 위임 변경**: 이벤트가 `document`가 아닌 React루트에 연결된다.
- **Effect 정리 타이밍 변경**: 일관성 있는 타이밍을 보장한다.

**React 18.x: 동시성의 시대(2022)**

- React 18.0 - 동시성 렌더링
- React의 중요한 업데이트. 동시성(Concurrency)기능이 출시 되었다.
- 동시성이란?
  - React가 여러 작업을 동시에 진행하는 것처럼 보이게 만드는 것이다. 실제로는 작업을 작은 단위로 나누고, 우선순위에 따라 중단하고 재개하며 사용자 경험을 개선한다.

- 핵심기능
  1. **Automatic Batching(자동 배칭)**: 여러 상태 업데이트를 하나로 묶어 불필요한 리렌더링을 줄인다.

  ```jsx
  // React 17: 2번 렌더링
  functionhandleClick() {
    setCount(c => c + 1);
    setFlag(f => !f); // 각각 리렌더링
  }

  // React 18: 1번 렌더링
  function handleClick() {
    setCount(c => c + 1);
    setFlag(f => !f); // 자동 매칭
  }
  ```

  2. **Transitions(트랜지션)**: 긴급하지 않은 업데이트를 백그라운드에서 처리한다.

  ```jsx
  import { useTransition } from 'react';

  function TabContainer() {
    const [isPending, startTransition] = useTransition();
    const [tab, setTab] = useState('home');

    function selectTab(nextTab) {
      startTransition(() => {
        setTab(nextTab); // 업데이트는 덜 긴급한 느낌
      };)
    }

    return (
      <>
        {isePending && <Spinner />}
        <Tabs onSelect={selectTab} />
      </Spinner>
    );
  }
  ```

  3. **Suspense 개선**: 서버 사이드 렌더링에서도 Suspens를 사용할 수 있게 되었다.
  4. 새로운 Hooks
  - `useId`: 고유 ID 생성(SSR에서도 안전)
  - `useTransition`: 논블로킹 업데이트
  - `useDeferredValue`: 급하지 않은 값 지연
  - `useSyncExternalStore`: 외부 store 구독
  - `useInsertionEffect`: CSS-in-JS 라이브러리
  5. **Streaming SSR**: 서버에서 HTML을 청크 단위로 보내고, 클라이언트는 반는 대로 렌더링 한다. 전체 페이지가 준비될때까지 기다리지 않아도 된다.

- React18이 중요한 이유
  - React18은 단순히 새 기능을 추가한 것이 아니라, React의 렌더링 모델 자체를 업그레이드했다.

**React19: 새로운 시대의 시작 (2024)**

- 2024년 12월, React19가 출시 되었다. "Actions", "Server Components", 향상된 에셋 로딩 등 기능들이 포함되어있다.
