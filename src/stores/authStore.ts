import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  user: any | null;                      // ❗ 그대로 둠
  isAdmin: boolean;                     // ✅ 추가
  setAccessToken: (token: string | null) => void;
  setAuth: (token: string | null, user?: any) => void;
  clearAuth: () => void;
  initializeAuth: () => void;
}

// 관리자 여부 판별 (user 구조에 맞게 필요하면 수정)
const computeIsAdmin = (user: any | null): boolean => {
  if (!user) return false;

  // 1) 대표적인 케이스들만 지원해 둠
  if (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN') return true;

  if (Array.isArray(user.roles)) {
    if (user.roles.includes('ADMIN') || user.roles.includes('ROLE_ADMIN')) {
      return true;
    }
  }

  if (Array.isArray(user.authorities)) {
    if (user.authorities.includes('ROLE_ADMIN')) {
      return true;
    }
  }

  if (user.isAdmin === true) return true;

  return false;
};

// 🔒 보안: sessionStorage 사용 (localStorage보다 안전 - 탭 닫으면 삭제됨)
const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAdmin: false,   // ✅ 초기값

  setAccessToken: (token) => {
    set({ accessToken: token });
    if (token) {
      sessionStorage.setItem('accessToken', token);
    } else {
      sessionStorage.removeItem('accessToken');
    }
  },

  setAuth: (token, user) => {
    const isAdmin = computeIsAdmin(user ?? null);

    set({ accessToken: token, user, isAdmin });

    if (token) {
      // 새로고침시에도 유지되도록 sessionStorage에 백업
      sessionStorage.setItem('accessToken', token);
      if (user) {
        sessionStorage.setItem('user', JSON.stringify(user)); // 🔹 기존 로직 그대로
      }
    } else {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('user');
    }
  },

  clearAuth: () => {
    set({ accessToken: null, user: null, isAdmin: false });
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
  },

  initializeAuth: () => {
    // 앱 시작시 sessionStorage에서 복원
    const token = sessionStorage.getItem('accessToken');
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const isAdmin = computeIsAdmin(user);

    if (token) {
      set({ accessToken: token, user, isAdmin });
    }
  },
}));

export default useAuthStore;
