import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import useAuthStore from '@/stores/authStore';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      console.log('AuthCallback component mounted');
      const code = new URL(window.location.href).searchParams.get('code');

      if (!code) {
        alert('인증 코드가 없습니다.');
        navigate('/login');
        return;
      }

      try {
        // ✅ redirectUri: 프론트 주소 기반
        // 로컬:   http://localhost:5173/auth/callback
        // 배포:   https://네-넷리파이-도메인/auth/callback
        // 'https://whales-team6.netlify.app/auth/callback'
        const redirectUri = 'http://localhost:5173/auth/callback';

        // ✅ 여기서 api는 이미 baseURL = 'http://3.27.115.110:8080/api' 사용
        // 로컬: 'http://localhost:8080/api/auth/login/google'
        // 백엔드  const response = await api.post('http://3.27.115.110:8080/api/auth/login/google'
        const response = await api.post(
          'http://localhost:8080/api/auth/login/google',
          {
            code,
            redirectUri,
          }
        );

        const { accessToken, user } = response.data;

        if (!accessToken) {
          throw new Error('Access token이 응답에 없습니다.');
        }

        setAuth(accessToken, user);
        navigate('/');
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
