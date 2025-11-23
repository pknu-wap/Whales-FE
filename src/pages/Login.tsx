import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

import WhalesLogo from '@/assets/Whales 로고.svg';
import GoogleLogo from '@/assets/구글 로고.svg';
import TermsCheckIcon from '@/assets/동의 체크.svg';

export default function Login() {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    const clientId =
      '672627774587-ng4kk4ds9kql97v5h82judmhfnt6rmah.apps.googleusercontent.com';
    const redirectUri = 'http://localhost:5173/auth/callback';
    const scope = 'openid email profile';

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
    <div className="fixed inset-0 w-full h-full bg-gradient-to-r from-[#0C59FF] to-[#C3E1FF] flex items-center justify-center">
      {/* 가운데 큰 레이아웃 */}
      <div className="w-full max-w-5xl flex flex-col items-center gap-24 px-6">
        {/* 상단 Whales 로고 영역 */}
        <section className="flex flex-col items-center gap-6">
        <img
          src={WhalesLogo}
          alt="Whales 로고"
          className="
            h-16 w-auto cursor-pointer
            transition-all duration-200
            hover:opacity-90 hover:scale-105
          "
          onClick={() => navigate(-1)}
        />
          <p className="text-xl text-white font-semibold h-3">
            신뢰할 수 있는 정보, 편리한 탐색
          </p>
          <div
            className="
              mt-2
              w-[300px]
              h-6
              rounded-[14px]
              bg-white/35
              border border-white/5
              backdrop-blur-sm
              flex items-center justify-center
              text-white text-sm font-medium
            "
          >
            부경대 학생을 위한 웹 커뮤니티
          </div>
        </section>

        {/* 로그인 영역 */}
        <section className="flex flex-col items-start gap-6 w-full max-w-[560px]">
          <div className="flex flex-col gap-1 text-left">
            <h2 className="text-3xl font-bold text-white h-10">로그인</h2>
            <p className="text-base text-white font-normal">
              구글 로그인으로 바로 시작하기
            </p>
          </div>

          {/* 구글 로그인 버튼 */}
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={handleGoogleLogin}
            className="
              w-full h-14 rounded-full bg-white shadow-lg
              flex items-center justify-start gap-3 px-6
              text-base font-medium text-slate-900 hover:bg-white/90
            "
          >
            <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center">
              <img src={GoogleLogo} alt="Google 로고" className="w-5 h-5" />
            </div>
            <span className="flex-1 text-center text-lg pr-10 font-semibold">
              구글 로그인
            </span>
          </Button>

          {/* 서비스 이용약관 동의 바 */}
          <div
            className="
              mt-2 w-full h-11 rounded-[18px]
              bg-gradient-to-r from-[#FFFFFF73] to-[#FFFFFF1A]
              border border-white/60
              flex items-center justify-between
              px-6 text-sm text-white
            "
          >
            <span>서비스 이용약관 동의 (필수)</span>
            <img
              src={TermsCheckIcon}
              alt="동의 체크 아이콘"
              className="w-5 h-5"
            />
          </div>
        </section>
      </div>
    </div>
  );
}