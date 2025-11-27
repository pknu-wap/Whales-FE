import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  // 🔗 백엔드 연결: POST /auth/login/google
  const handleGoogleLogin = () => {

    const clientId = "672627774587-ng4kk4ds9kql97v5h82judmhfnt6rmah.apps.googleusercontent.com";
    const redirectUri = "http://localhost:5173/auth/callback";
    const scope = "openid email profile";

    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}` +
      `&access_type=online` +
      `&prompt=consent`;

    window.location.href = googleAuthUrl;
  };


  return (
    <div className="w-full min-h-screen bg-background">
      <main className="w-full h-[calc(100vh-80px)] items-center justify-center flex p-6 gap-6 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-6 left-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="w-[450px] max-w-[90vw] flex flex-col px-6 gap-8">
          <div className="flex flex-col gap-3">
            <h1 className="scroll-m-20 text-5xl font-bold tracking-tight">
              로그인
            </h1>
            <p className="text-xl text-muted-foreground">
              구글 로그인으로 바로 시작하기
            </p>
          </div>
          <div className="grid gap-4">
            {/* 🔗 백엔드 연결: 구글 OAuth2 로그인 */}
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="gap-2 h-14 text-lg font-medium"
              onClick={handleGoogleLogin}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              구글 로그인
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}