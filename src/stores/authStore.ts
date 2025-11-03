import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  user: any | null;
  setAccessToken: (token: string | null) => void;
  setAuth: (token: string | null, user?: any) => void;
  clearAuth: () => void;
  initializeAuth: () => void;
}

// 🔒 보안: sessionStorage 사용 (localStorage보다 안전 - 탭 닫으면 삭제됨)
const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  
  setAccessToken: (token) => {
    set({ accessToken: token });
    if (token) {
      sessionStorage.setItem('accessToken', token);
    } else {
      sessionStorage.removeItem('accessToken');
    }
  },
  
  setAuth: (token, user) => {
    set({ accessToken: token, user });
    if (token) {
      // 새로고침시에도 유지되도록 sessionStorage에 백업
      sessionStorage.setItem('accessToken', token);
      if (user) {
        sessionStorage.setItem('user', JSON.stringify(user));
      }
    } else {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('user');
    }
  },
  
  clearAuth: () => {
    set({ accessToken: null, user: null });
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
  },
  
  initializeAuth: () => {
    // 앱 시작시 sessionStorage에서 복원
    const token = sessionStorage.getItem('accessToken');
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (token) {
      set({ accessToken: token, user });
    }
  },
}));

export default useAuthStore;
