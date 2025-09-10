# 🔧 Git Stash 복구 가이드

> **상황**: Git stash로 임시 저장한 작업물을 실수로 삭제했을 때 복구하는 방법

## 📋 개요

- Git stash는 **임시 커밋**을 생성하는 방식으로 작동합니다
- 실수로 삭제해도 Git 내부에 데이터가 남아있어 **복구가 가능**합니다
- `git stash drop` 또는 `git stash clear` 후에도 복구할 수 있습니다

---

## 🛠️ 복구 방법

### 방법 1: git fsck를 이용한 복구 (권장)

#### 1단계: 삭제된 stash 찾기

```bash
git fsck --no-reflog | awk '/dangling commit/ {print $3}'
```

#### 2단계: stash 내용 확인

```bash
git show <commit-hash>
```

#### 3단계: 작업 공간에 복원

```bash
git stash apply <commit-hash>
```

### 방법 2: git reflog를 이용한 복구

#### 1단계: stash 이력 확인

```bash
git reflog stash
```

#### 2단계: 특정 stash 복구

```bash
git stash apply <stash-name>
```

---

## ⚠️ 주의사항

- **Git은 한번 저장된 변경사항을 바로 삭제하지 않습니다**
- 대부분의 경우 복구가 가능하므로 당황하지 마세요
- 복구 전에 현재 작업 상태를 백업해두는 것이 좋습니다

---

## 💡 추가 팁

- `git stash list`로 현재 stash 목록을 확인할 수 있습니다
- `git stash show -p <stash-name>`으로 stash 내용을 미리 볼 수 있습니다
- 중요한 작업은 stash 대신 별도 브랜치를 만들어 작업하는 것을 권장합니다
