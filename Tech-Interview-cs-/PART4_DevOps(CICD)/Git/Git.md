# 🌐 Git 기초개념

## 1. Git 개념

### 1-1.Git이란?

- Git은 분산버전 관리 시스템, 소스코드의 변경 이력을 추적하고 여러 개발자가 협업할 수 있게 해주는 필수 도구이다.

1. 분산 저장소 방식: 로컬저장소(PC, Git) / 원격 저장소(GitHub) 양쪽에서 관리 가능
2. 변경 이력 추적: 모든 수정사항을 시간순으로 기록
3. 브랜치 기반 개발: 기능별로 독립적인 개발 환경 제공한다

---

## 2. Git을 사용하는 구체적인 이유?

1. **버전 관리가 필요하다**

- 특정 시점에 저장된 버전과 비교할 수 있고 특정한 것을 개발했을 당시로 돌아갈 수 있다.
- 잘못된 코드가 들어갈 때 변경된 내역을 관리햐야한다.
- Git을 통해 내 코드 혹은 다른 개발자의 코드가 변경된 이력을 쉽게 확인할 수 있다.

2. **협업에 도움이 된다.**

- 내 코드와 다른 사람의 코드를 합치는 과정이 편리하다.
- 코드가 충돌할 때 경고 메세지를 통해 어느 부분에서 충돌이 생겼는지 확인한다.
- 브랜치 기능을 통해 독립적인 개발환경을 제공하고 사전에 문제를 예방할 수 있다.

---

## 3. Git 워크플로우와 명령어

### 2-1. Git 기본 순서

1. 로컬 저장소 생성: `git init` (새로운 시작)
2. 원격 저장소 연결: `git remote add origin <해당 Git 주소>`
3. 전체 내용 복제: `git clone <해당 Git 주소>`
4. 변경사항 가져오기: `git fetch`(일부 변경된 내용)
5. 다른 저장소 복사: `git fork`(다른 서버 내용 가져올 수 있음)
6. 브랜치 작업: `git checkout -b <branch-name, 대부분 main-develop-feat/브랜치>` 로 세팅한다.
7. 스테이징: `git add` 변경 내용을 추가한다.
8. 커밋: `git commit` 안전하게 추가했다면 로컬에 반영한다.
9. 푸쉬: `git push` 해당 변경이나 추가된 부분을 원격에 추가한다.
10. 브랜치 병합: `git merge` 추가한 작업이 완성되면 병합한다.

**주요 명령어**

```bash
# 원격 저장소 작업
git pull origin main    # 원격저장소를 로컬 브랜치로 가져와 병합
git push origin main    # 지정한 로컬 브랜치를 원격 저장소로 push

# 스테이징과 커밋
git add .              # 모든 변경사항을 스테이징 영역에 추가
git commit -m "message" # 스테이징된 변경사항을 로컬 저장소에 기록
```

---

## 4. Git 협업 워크 플로우

### 4.1 Gitflow workflow와 Forking workflow의 차이점

**성공적인 workflow의 조건**

- 워크플로우는 팀 규모에 따라 확장이 가능한가?
- 워크플로우는 실수와 오류를 쉽게 실행 취소할 수 있는가?

### 4.2 Gitflow Workflow 브랜치 전략

1. main(master)브랜치: 최종 배포 브랜치
2. develop: 개발브랜치
3. feature: 기능브랜치
   - feature브랜치의 name은 해당 기능, 무엇을 구현하는지 기능명으로 만든다.(search, homeBanner 등)
4. hotfix: 급한 수정을 위한 브랜치

**브랜치 생명주기**

- feature 브랜치의 생명주기는 develop 브랜치에 병합되는 순간 끝난다(delete로 제거)
- pull-request란 A와 B의 커밋을 Merge하는 것을 허락해달라고 요청하는 행동이다.
- feature 구현이 끝나면 develop에 병합되고 반드시 delete를 해야한다.
  -> 그래야 차후에 다른 팀원들이 보기에도 헷갈리지 않는다.

⚠️ feature를 바로 main(master) 브랜치에 직접 적용시키는 일은 절대 없어야 한다. 항상 해당 명령을 했으면 한번 더 더블체크 해야 한다.

**브랜치 생성과정**

```bash
기능 브랜치 생성 방법:
bash# gitflow workflow 확장이 없는 경우
git checkout develop
git checkout -b feature_branch

# gitflow-workflow 확장을 사용할 경우
git flow feature start feature_branch
Gitflow 브랜치 다이어그램:
main(배포) ──────●────────●────────●
                 │        │        │
develop(개발) ───●────●───●────●───●
                 │    │        │
feature1 ────────●────●
feature2 ─────────────●────●
```

---
