# Budget Book - Frontend

React + Vite 기반의 Budget Book 프론트엔드입니다.

## 기술 스택

- **React 19.2.0** - UI 라이브러리
- **Vite 7.2.4** - 빌드 도구 및 개발 서버
- **React Router DOM** - 라우팅
- **Axios** - HTTP 클라이언트

## 프로젝트 구조

```
frontend/
├── src/
│   ├── api/              # API 클라이언트
│   │   ├── client.js     # Axios 설정
│   │   └── categories.js # Category API 함수들
│   ├── components/       # 재사용 가능한 컴포넌트
│   │   ├── CategoryList.jsx
│   │   ├── CategoryList.css
│   │   ├── CategoryForm.jsx
│   │   └── CategoryForm.css
│   ├── pages/           # 페이지 컴포넌트
│   │   ├── Categories.jsx
│   │   └── Categories.css
│   ├── App.jsx          # 메인 앱 컴포넌트
│   ├── App.css
│   └── main.jsx         # 엔트리 포인트
├── public/
└── package.json
```

## 설치 및 실행

### 1. 의존성 설치
```bash
cd frontend
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

개발 서버는 `http://localhost:5173`에서 실행됩니다.

### 3. 빌드
```bash
npm run build
```

## 기능

### Category Management

#### 카테고리 목록 조회
- `/categories` 페이지에서 모든 카테고리 확인
- 카드 형태로 카테고리 표시
- 각 카테고리의 이름과 설명 표시

#### 카테고리 생성
- "New Category" 버튼 클릭
- 이름 (필수, 1-50자)
- 설명 (선택, 최대 200자)
- 폼 제출 시 즉시 목록에 반영

#### 카테고리 수정
- 각 카테고리 카드의 "Edit" 버튼 클릭
- 기존 데이터가 폼에 자동 입력
- 수정 후 저장

#### 카테고리 삭제
- 각 카테고리 카드의 "Delete" 버튼 클릭
- 확인 다이얼로그 표시
- 삭제 확인 시 즉시 목록에서 제거

## API 연동

백엔드 API는 `http://localhost:8000/api`를 기본으로 사용합니다.

### API 엔드포인트

- `GET /api/categories/` - 전체 카테고리 조회
- `GET /api/categories/{id}` - 특정 카테고리 조회
- `POST /api/categories/` - 카테고리 생성
- `PUT /api/categories/{id}` - 카테고리 수정
- `DELETE /api/categories/{id}` - 카테고리 삭제

## 개발 가이드

### API 클라이언트 사용

```javascript
import { categoryApi } from './api/categories';

// 전체 조회
const categories = await categoryApi.getAll();

// 생성
const newCategory = await categoryApi.create({
  name: "Food",
  description: "Food expenses"
});

// 수정
const updated = await categoryApi.update(1, {
  name: "Updated Name"
});

// 삭제
await categoryApi.delete(1);
```

### 새 컴포넌트 추가

1. `src/components/` 또는 `src/pages/`에 `.jsx` 파일 생성
2. 스타일이 필요한 경우 `.css` 파일도 생성
3. `App.jsx`에서 라우트 추가 (페이지인 경우)

## 문제 해결

### CORS 에러
백엔드 서버가 실행 중이고 CORS 설정이 올바른지 확인하세요.

### API 연결 실패
- 백엔드 서버가 `http://localhost:8000`에서 실행 중인지 확인
- 네트워크 탭에서 요청/응답 확인

### 포트 충돌
다른 서비스가 5173 포트를 사용 중이면 Vite가 자동으로 다른 포트를 할당합니다.
