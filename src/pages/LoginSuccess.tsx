// src/pages/LoginSuccess.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '@/stores/authStore';

export default function LoginSuccess() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { setAccessToken } = useAuthStore();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      setAccessToken(token);
      navigate('/');
    } else {
      navigate('/login');
    }
  }, [params, navigate, setAccessToken]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <p>로그인 완료 중…</p>
    </div>
  );
}
