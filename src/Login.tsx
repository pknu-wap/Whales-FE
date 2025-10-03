// src/Login.tsx
import React from "react";
import "./App.css"; // 기존 스타일 파일 재사용

const Login: React.FC = () => {
  const handleGoogleClick = () => {
    // TODO: 실제 구글 로그인 붙일 때 여기서 처리
    console.log("Google 로그인 클릭");
  };

  return (
    <main className="login-page">
      <section className="login-card" role="dialog" aria-labelledby="login-title">
        <div className="login-logo" aria-hidden>🚀</div>
        <h1 id="login-title" className="login-title">시작하기</h1>
        <p className="login-sub">회원가입 없이 <b>Google</b> 계정으로 로그인</p>

        <button type="button" className="google-btn" onClick={handleGoogleClick}>
          <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden>
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.8 6 29.7 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10 0 19-7.3 19-20 0-1.2-.1-2.4-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.8 6 29.7 4 24 4 16.2 4 9.4 8.4 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5 0 9.7-1.9 13.2-5.1l-6.1-5c-2 1.5-4.6 2.4-7.1 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.7 5.2C9 39.5 16 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.5 5.6-6.3 7.1l.1.1 6.1 5C38.5 37.2 41.5 31.4 41.5 24c0-1.2-.1-2.4-.4-3.5z"/>
          </svg>
          Google로 계속
        </button>

        <p className="login-hint">로그인하면 프로필 이름/이메일만 사용합니다.</p>
      </section>
    </main>
  );
};

export default Login;
