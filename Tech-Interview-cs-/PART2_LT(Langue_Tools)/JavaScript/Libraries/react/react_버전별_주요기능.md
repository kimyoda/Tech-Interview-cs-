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
