import { create } from 'zustand';

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  // 👇 백엔드에서 실제로 오는 필드에 맞게 하나 골라 쓰면 됨
  role?: string;          // 예: 'USER' | 'ADMIN'
  roles?: string[];       // 예: ['USER', 'ADMIN']
  isAdmin?: boolean;      // 예: true / false
  nicknameColor?: string;
}

interface AuthState {
  accessToken: string | null;
  user: AppUser | null;
  setAccessToken: (token: string | null) => void;
  setAuth: (token: string | null, user?: AppUser) => void;
  clearAuth: () => void;
  initializeAuth: () => void;
}

// ✅ 공통 admin 판별 함수
export const isAdminUser = (user: AppUser | null | undefined): boolean => {
  if (!user) return false;

  // 1) isAdmin 플래그
  if (user.isAdmin === true) return true;

  // 2) role 필드
  if (user.role === 'ADMIN') return true;

  // 3) roles 배열
  if (Array.isArray(user.roles) && user.roles.includes('ADMIN')) return true;
  if (Array.isArray(user.roles) && user.roles.includes('ROLE_ADMIN')) return true;

  return false;
};

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
    set({ accessToken: token ?? null, user: user ?? null });

    if (token) {
      sessionStorage.setItem('accessToken', token);
    } else {
      sessionStorage.removeItem('accessToken');
    }

    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('user');
    }
  },

  clearAuth: () => {
    set({ accessToken: null, user: null });
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
  },

  initializeAuth: () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const rawUser = sessionStorage.getItem('user');

      if (token && rawUser) {
        const parsed: AppUser = JSON.parse(rawUser);
        set({ accessToken: token, user: parsed });
      }
    } catch {
      set({ accessToken: null, user: null });
    }
  },
}));

export default useAuthStore;
