// src/stores/tagStore.ts
import { create } from 'zustand';

const STORAGE_KEY = 'subscribedTags';

const loadFromStorage = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((t) => typeof t === 'string');
    }
    return [];
  } catch {
    return [];
  }
};

const saveToStorage = (tags: string[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
};

interface TagState {
  subscribedTags: string[];
  setTags: (tags: string[]) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  hydrate: () => void; // localStorage → store로 복원
}

const useTagStore = create<TagState>((set, get) => ({
  subscribedTags: [],

  hydrate: () => {
    const tags = loadFromStorage();
    set({ subscribedTags: tags });
  },

  setTags: (tags) => {
    set({ subscribedTags: tags });
    saveToStorage(tags);
  },

  addTag: (tag) => {
    const name = tag.trim();
    if (!name) return;
    const current = get().subscribedTags;
    if (current.includes(name)) return;
    const next = [...current, name];
    set({ subscribedTags: next });
    saveToStorage(next);
  },

  removeTag: (tag) => {
    const current = get().subscribedTags;
    const next = current.filter((t) => t !== tag);
    set({ subscribedTags: next });
    saveToStorage(next);
  },
}));

export default useTagStore;
