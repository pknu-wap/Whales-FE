
# 참고한 사이트
https://ui.shadcn.com/docs/components/separator
https://ui.shadcn.com/docs/components/skeleton
https://ui.shadcn.com/docs/components/button
https://ui.shadcn.com/docs/components/input
---
# Whales-FE
2025-2 WAP 웹 6팀

---

# 🐋 Whales Project

> **태그 기반 커뮤니티 플랫폼**
> 관심사에 맞춘 게시판, 채팅, 알림을 제공하는 웹 프로젝트

---

## 📌 프로젝트 개요

Whales는 **대학생 맞춤형 태그 기반 커뮤니티**로,
사용자가 원하는 태그를 기준으로 게시글을 검색/정렬하고,
관심사에 따라 게시판과 채팅방을 즐겨찾기할 수 있도록 지원합니다.

---

## ✨ 주요 기능

* 🔑 **인증**

  * 구글 OAuth2 로그인 (@pukyong.ac.kr 이메일 제한)
  * JWT 기반 인증/인가
* 📝 **게시판 & 댓글**

  * 게시글 CRUD
  * 댓글, 좋아요/싫어요, 스크랩
* 🏷 **태그 기반 기능**

  * 게시판 사용자화 (태그별 즐겨찾기)
  * 태그 기반 게시글 목록 조회
  * 태그별 채팅방 생성
* 🔔 **알림 시스템**

  * 댓글/좋아요 실시간 알림
* 📷 **파일 업로드 (확장 예정)**

  * AWS S3 이미지 업로드 지원

---

## 🛠 기술 스택

### Frontend

* React, TypeScript

### Backend

* Spring Boot 3.x
* Spring Security (JWT + OAuth2)
* JPA (Hibernate)
* PostgreSQL
* Redis
* Websocket

### Infra & DevOps

* Docker / Docker Compose
* AWS EC2 (서버 배포), AWS S3 (이미지 저장)
* GitHub Actions (CI/CD)

### Tools

* GitHub
* Notion
* Swagger
* Figma

---

## 🗂 프로젝트 구조 (예정)

```
whales/
├── frontend/       # React + TypeScript
├── backend/        # Spring Boot + PostgreSQL
├── docs/           # 문서 (ERD, API 명세 등)
└── docker-compose.yml
```

---

## 🛠 실행 방법

### 프론트엔드

```bash
cd frontend
npm install
npm run dev
```

### 백엔드

```bash
cd backend
./gradlew bootRun
```

### Docker (전체 실행)

```bash
docker-compose up --build
```

---

## 🗃 데이터베이스 ERD (예시)

👉 [ERD Diagram](docs/erd.png)

(📌 실제 ERD 이미지 첨부 예정)

---

## 📑 API 문서

👉 Swagger UI 실행 후 확인 가능

```
http://localhost:8080/swagger-ui/index.html
```

---

## 📅 개발 일정

| 기간               | 목표       | 상세                           |
| ---------------- | -------- | ---------------------------- |
| 9월 2주 \~ 3주      | 초기 세팅    | GitHub, Docker, DB 설계        |
| 9월 4주 \~ 10월 3주  | MVP 개발   | 로그인/회원가입, 게시판 CRUD, 태그 기반 검색 |
| 10월 4주 \~ 11월 1주 | 배포 및 테스트 | 배포 환경 세팅, QA 진행              |
| 11월 1주           | 중간 발표    | MVP 기능 시연                    |
| 11월 2주 \~ 11월 5주 | 확장 기능    | 태그별 채팅, 실시간 알림, 이미지 업로드      |

---

## 🤝 협업 규칙

### Git 브랜치 전략

* `main`: 배포용
* `develop`: 개발 통합 브랜치
* `feature/*`: 기능 단위 개발
* `hotfix/*`: 긴급 수정

### 커밋 컨벤션 (Conventional Commits)

* `feat:` 새로운 기능 추가
* `fix:` 버그 수정
* `docs:` 문서 수정
* `style:` 코드 포맷팅 (기능 변화 없음)
* `refactor:` 리팩토링
* `test:` 테스트 코드

---
