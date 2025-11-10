import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '@/stores/authStore';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setAccessToken } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const code = new URL(window.location.href).searchParams.get('code');
      if (!code) {
        navigate('/login');
        return;
      }

      try {
        const redirectUri = 'http://localhost:5173/auth/callback';

        // 백엔드로 code 전달 (백엔드가 JWT 발급)
        const response = await axios.post(
          'http://localhost:8080/api/auth/login/google',
          { code, redirectUri }
        );
        const { accessToken } = response.data;

        setAccessToken(accessToken);
        navigate('/'); // 로그인 후 메인으로 이동
      } catch (err) {
        console.error('Google login failed:', err);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, setAccessToken]);

  return <p className="text-center mt-10">로그인 중입니다…</p>;
}
