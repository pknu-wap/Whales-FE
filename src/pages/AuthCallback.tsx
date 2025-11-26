import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle } from '@/services/api';
import useAuthStore from '@/stores/authStore';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const handle = async () => {
      const code = new URL(window.location.href).searchParams.get('code');

      if (!code) {
        alert('인증 코드가 없습니다.');
        navigate('/login');
        return;
      }

      try {
        const redirectUri = window.location.origin + '/auth/callback';

        // Netlify proxy 로 API를 호출
        const data = await loginWithGoogle(code, redirectUri);

        setAuth(data.accessToken, data.user);
        navigate('/');
      } catch (err) {
        console.error('Google 로그인 실패:', err);
        alert('로그인 중 오류가 발생했습니다.');
        navigate('/login');
      }
    };

    handle();
  }, [navigate, setAuth]);

  return <p className="text-center mt-10">로그인 중입니다…</p>;
}