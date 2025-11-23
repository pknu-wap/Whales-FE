import { create } from 'zustand';

const STORAGE_KEY = 'subscribedTags';

// localStorage 에서 태그 배열 불러오기
const loadFromStorage = (): string[] => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // 문자열만 필터링
      return parsed.filter((t): t is string => typeof t === 'string');
    }
    return [];
  } catch {
    return [];
  }
};

// localStorage 에 저장
const saveToStorage = (tags: string[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
};

// ✅ AppSidebar 에서 사용할 스토어 상태 타입
export interface TagStoreState {
  /** 구독된 태그 리스트 */
  subscribedTags: string[];

  /** 태그 하나 추가 */
  subscribeTag: (tag: string) => void;

  /** 태그 하나 제거 */
  unsubscribeTag: (tag: string) => void;

  /** 전부 비우기 */
  clearSubscribedTags: () => void;

  /** localStorage 값으로 상태 다시 동기화 */
  hydrate: () => void;
}

// ✅ zustand 스토어 생성
export const useTagStore = create<TagStoreState>((set, get) => ({
  subscribedTags: loadFromStorage(),

  hydrate: () => {
    const loaded = loadFromStorage();
    set({ subscribedTags: loaded });
  },

  subscribeTag: (tag) => {
    const current = get().subscribedTags;
    const next = Array.from(new Set([...current, tag])); // 중복 제거

    saveToStorage(next);
    set({ subscribedTags: next });
  },

  unsubscribeTag: (tag) => {
    const current = get().subscribedTags;
    const next = current.filter((t) => t !== tag);

    saveToStorage(next);
    set({ subscribedTags: next });
  },

  clearSubscribedTags: () => {
    saveToStorage([]);
    set({ subscribedTags: [] });
  },
}));
