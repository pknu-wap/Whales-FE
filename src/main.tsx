import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from "react-router";
import './index.css'

import App from './pages/' // 메인 페이지
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

// 🔽 관리자 페이지들 import (경로는 실제 파일 위치에 맞게 수정!)
import AdminDashboard from "./pages/AdminDashboard.tsx";
import ModerationPage from "./pages/ModerationPage.tsx";
import ReportListPage from "./pages/ReportListPage.tsx";
import ReportDetailPage from "./pages/ReportDetailPage.tsx";
import UserBanPage from "./pages/UserBanPage.tsx";

// 🔽 방금 만든 AdminRoute
import AdminRoute from "./routes/AdminRoute.tsx";

useAuthStore.getState().initializeAuth();

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      {/* ✅ 일반 유저용: RootLayout을 타는 라우트들 */}
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

      {/* ✅ 관리자 전용 비밀 라우트 (/admin 이하 전부 가드) */}
      <Route path="/admin" element={<AdminRoute />}>
        {/* /admin → 대시보드 */}
        <Route index element={<AdminDashboard />} />

        {/* /admin/moderation → 게시글/댓글 관리 */}
        <Route path="moderation" element={<ModerationPage />} />

        {/* /admin/reports → 신고 리스트 */}
        <Route path="reports" element={<ReportListPage />} />

        {/* /admin/reports/123 → 신고 상세 */}
        <Route path="reports/:id" element={<ReportDetailPage />} />

        {/* /admin/users → 유저 제재 페이지 */}
        <Route path="users" element={<UserBanPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
