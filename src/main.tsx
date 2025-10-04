import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from "react-router";
import './index.css'
//파일 경로를 줄여서 써도 동작하는 건 바로 모듈 해석(Module Resolution) 규칙
import App from './pages/' // 메인 페이지
// 그러나 회원가입 페이지는 필요가 없다
import SignIn from "./pages/sign-in" // 회원가입 페이지
import SignUp from "./pages/sign-up" // 로그인 페이지
import RootLayout from "./pages/layout.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<App />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/sign-in" element={<SignIn />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
