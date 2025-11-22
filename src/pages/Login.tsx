import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import WhalesLogo from '@/assets/Whales 로고.svg';
import GoogleLogo from '@/assets/구글 로고.svg';
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
    <div className="fixed inset-0 w-full h-full bg-gradient-to-r from-[#0066FF] to-[#9BD8FF] flex items-center justify-center">
        <section className="flex flex-col items-center gap-4">
          <img src={WhalesLogo} alt="Whales 로고" className="h-16 w-auto" />
          <p className="text-lg text-white/90">신뢰할 수 있는 정보, 편리한 탐색</p>
          <div className="mt-1 inline-flex items-center rounded-full px-4 py-1 bg-white/20 text-xs text-white tracking-wide">
            부경대 학생을 위한 웹 커뮤니티
          </div>
        </section>

              구글 로그인으로 바로 시작하기
            </p>
          </div>

          {/* 구글 로그인 버튼: 섹션 폭 전체 사용 */}
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={handleGoogleLogin}
            className="
              w-full
              h-14
              rounded-full
              bg-white
              shadow-lg
              flex items-center
              justify-start
              gap-3
              px-6
              text-base
              font-medium
              text-slate-900
              hover:bg-white/90
            "
          >
            <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center">
              <img src={GoogleLogo} alt="Google 로고" className="w-5 h-5" />
            </div>
            <span className="flex-1 text-center pr-10">구글 로그인</span>
          </Button>

          </div>
        </div>
      </main>
    </div>
  );
}
