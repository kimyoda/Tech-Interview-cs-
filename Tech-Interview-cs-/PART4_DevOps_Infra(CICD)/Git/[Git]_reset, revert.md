# 🌐 Git Reset, Revert

## 1. Git Reset, Revert 개념

- Git에서 과거의 커밋을 되돌리는 방법은 크게 두가지다. `git reset`과 `git revert`다.
- 두 명령어는 과거로 돌아간다는건 같지만, **동작방식과 작동이 다르다**.

1. git reset: 시간을 되돌린다 (역사 수정)

- HEAD를 과거 커밋으로 이동시켜 커밋 히스토리 자체를 수정한다.
- 과거로 아예 돌아가서 수정하는 것

2. git revert: 실수를 만회하는 커밋을 생성한다(보존)

- 과거 커밋의 변경사항을 취소하는 새로운 커밋을 생성한다.
- 기록을 바로 잡는 것을 기록으로 남긴다.

---

## 2. Reset과 Revert를 구분하는 이유

#### 2-1. 협업 환경에서 안전성

1. Reset의 위험

   - 이미 push된 커밋을 reset하면 다른 개발자의 작업에 영향을 줄 수 있다.
   - 강제 push(-f)를 하면 팀원의 커밋이 날라갈 수 있다.
   - 이에 공유 브랜치에서는 사용하면 안돼고 되도록 본인의 브랜치에서는 해야한다.

2. Revert의 안전성
   - 모든 변경 이력이 커밋으로 남아 추적이 가능하다.
   - 다른 개발자의 작업에 영향을 주지 않는다.

#### 2-2. 히스토리 관리

Reset: 해당 커밋은 없었던 일로

- 로컬에서 실험적인 커밋을 정리할 때
- 깔끔한 히스토리를 유지할 때

Revert: 커밋이 문제였으니 되돌리는 기록을 남긴다.

- 배포된 코드의 버그를 수정할 때
- 추적이 필요한 프로젝트
- 팀원들에게 변경 사유를 전달할 때

---

3. Reset, Revert 동작 차이

#### 3-1. 동작 방식 차이

Reste의 경우

```bash
Before:
A -- B -- C -- D (HEAD)

After: git reset HEAD-2
A -- B (HEAD)
-> C, D 커밋이 히스토리에서 사라진다.
```

Revert의 경우

```bash
Before:
A -- B -- C -- D (HEAD)

After: git revert C
A -- B -- C -- D -- D' (HEAD)

-> C의 변경사항을 취소하는 D' 커밋 추가
-> C는 히스토리에 남아있다
```

#### 3-2 명령어 비교

Reset 예제

```bash
# 최근 커밋 1개를 되돌리기
git reset --hard HEAD~1

# 확인
git log --oneline
# 출력:
# def5678 Second commit
# ghi9012 First commit
# → Third commit이 사라짐!

cat file.txt
# 출력:
# first
# second
# → third도 사라짐!
```

Revert 예제

```bash
# 다시 Third commit 추가
echo "third" >> file.txt && git add . && git commit -m "Third commit"

# Second commit을 revert
git revert 예제

# 커밋 메시지 편집기가 열림 (기본: "Revert 'Second commit'")
# 저장하고 닫기

# 확인
git log --oneline
# 출력:
# xyz3456 Revert "Second commit"
# abc1234 Third commit
# def5678 Second commit
# ghi9012 First commit
# → 모든 커밋이 남아있고, revert 커밋이 추가됨!

cat file.txt
# 출력:
# first
# third
# → second만 사라짐 (revert의 효과)

```

---

### Reset의 3가지 모드

`--soft` 커밋만 취소

```bash
git reset --soft HEAD~1
```

- Staging Area에 보존
- 그대로 유지, 커밋 메시지를 수정하거나 여러 커밋을 하나로 합친다.

```bash
git add file.txt
git commit -m "잘못된 커밋 메시지"
git reset --soft HEAD~1
# 파일은 여전히 staged 상태 → 다시 커밋 가능
git commit -m "올바른 커밋 메시지"
```

`--mixed` 커밋 + Staging 취소

```bash
git reset HEAD~1

# 또는
git reset --mixed HEAD~1
```

- Working Directory에 보존, unstaged
- Staging Area: 초기화
- 커밋과 stage를 되돌리고 싶지만 코드는 유지

```bash
echo "new" >> file.txt
git add file.txt
git commit -m "New commit"
git reset HEAD~1
# file.txt의 변경사항은 남아있지만 unstaged 상태
git status
# modified: file.txt (unstaged)
```

`--hard`: 모든것을 되돌린다(위험하다)

```bash
git reset --hard HEAD~1
```

- 완전히 삭제
- 초기화
- 변경사항을 완전히 버리고 싶을 때

```bash
echo "temp" >> file.txt
git add file.txt
git commit -m "Temp commit"
git reset --hard HEAD~1
# file.txt의 모든 변경사항이 사라짐
cat file.txt
# "temp"가 없음
```

---

1. Rest: 히스토리를 수정하는 위험하지만 강력한 도구다.

   - 로컬 작업에만 사용한다
   - 3가지 모드: `--soft`, `--mixed`, `--hard`

2. Revert: 히스토리를 보존하는 안전한 도구이다.
   - 협업 환경에서 사용한다.
   - 모든 변경이 추적된다.
