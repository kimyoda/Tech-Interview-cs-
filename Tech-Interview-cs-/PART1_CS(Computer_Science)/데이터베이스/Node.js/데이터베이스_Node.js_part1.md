# 관계형 데이터베이스 SQL 개념 및 Node.js로 찍어보기

---

## 확인

실무에서 데이터를 좀 뽑아달라는 요청을 받다보면, RDB 개념은 결국 테이블 몇 개를 어떻게 쪼개고 어떻게 연결하느냐의 문제가 생기게 된다. 해당 감각은 글로 읽어서는 체감하기가 어렵다.
각각 MySQL, MongDB를 띄우고 같은 데이터를 각각 어떻게 표현하는지 비교하며 개념을 잡아보고자 한다.

---

## 실습 환경

로컬에 MySQL과 MongDB를 각각 띄워 비교한다. `docker-compose.yml`하나로 둘 다 올린다.

```yaml
# docker-compose.yml
version: "3.9"

services:
  mysql:
    image: mysql:8.0
    container_name: study-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: root1234
      MYSQL_DATABASE: studydb
      MYSQL_USER: studyuser
      MYSQL_PASSWORD: study1234
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql

  mongo:
    image: mongo:7.0
    container_name: study-mongo
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: studyuser
      MONGO_INITDB_ROOT_PASSWORD: study1234
      MONGO_INITDB_DATABASE: studydb
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mysql-data:
  mongo-data:
```

```bash
docker compose up -d
```

Node.js 프로젝트 세팅:

```bash
mkdir db-basics-study && cd db-basics-study
npm init -y
npm install mysql12 mongdb dotenv
```

```bash

```
