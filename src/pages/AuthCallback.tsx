import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import useAuthStore from '@/stores/authStore';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore(); // ✅ setAccessToken → setAuth

  useEffect(() => {
    const handleCallback = async () => {
      // console.log('AuthCallback component mounted');
      const code = new URL(window.location.href).searchParams.get('code');

      if (!code) {
        alert('인증 코드가 없습니다.');
        navigate('/login');
        return;
      }

      try {
        const redirectUri = 'http://localhost:5173/auth/callback';

        // ✅ 공통 api 인스턴스 사용
        //    (baseURL 이 http://3.27.115.110:8080/api 라고 가정)
        const response = await api.post('/auth/login/google', {
          code,
          redirectUri,
        });

        const { accessToken, user } = response.data;

        if (!accessToken) {
          throw new Error('Access token이 응답에 없습니다.');
        }

        // ✅ Zustand에 저장 (토큰 + 유저정보)
        setAuth(accessToken, user);

        // ✅ 홈으로 이동
        navigate('/');
        // window.location.reload();
      } catch (err) {
        console.error('로그인 중 오류 발생:', err);
        alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, setAuth]);

  return <p className="text-center mt-10">로그인 중입니다…</p>;
}