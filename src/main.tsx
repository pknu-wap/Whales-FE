
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from "react-router";
import './index.css'
//파일 경로를 줄여서 써도 동작하는 건 바로 모듈 해석(Module Resolution) 규칙
import App from './pages/' // 메인 페이지
// 그러나 회원가입 페이지는 필요가 없다
// import SignIn from "./pages/sign-in" // 회원가입 페이지
import RootLayout from "./pages/layout.tsx";
import CreatePost from "./pages/CreatePost.tsx";
import PostDetail from "./pages/PostDetail.tsx";
import MyPage from "./pages/MyPage.tsx";
import Login from "./pages/Login.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import useAuthStore from './stores/authStore.ts';
import RecentPage from "./pages/RecentPage";
import TrendingPage from "./pages/TrendingPage";
import SearchPage from "./pages/SearchPage";
import TagSettings from './pages/TagSettings.tsx';
import ReportPage from "./pages/ReportPage.tsx";

// App.tsx -> index.tsx로 수정하였고 -> pages 폴더에 넣어서 관리하고 있다

useAuthStore.getState().initializeAuth();

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<App />} />
          <Route path="/report/post/:postId" element={<ReportPage />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recent" element={<RecentPage />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/settings/tags" element={<TagSettings />} />
        </Route>

        {/* ✅ RootLayout을 타지 않는 완전 독립 라우트 */}
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </BrowserRouter>
);

