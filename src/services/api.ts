import axios from 'axios';
import useAuthStore from '@/stores/authStore';

// const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// 로컬 설정

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://3.27.115.110:8080/api';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ✅ refresh 쿠키 포함
});

// 요청 인터셉터 – AccessToken 자동 첨부
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// 응답 인터셉터 – 401 시 refresh 시도
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refreshRes = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken, user } = refreshRes.data;
        useAuthStore.getState().setAuth(accessToken, user);

        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  }
);

// =========================
// Auth API
// =========================

export const loginWithGoogle = async (code: string, redirectUri: string) => {
  const res = await api.post('/auth/login/google', { code, redirectUri });
  return res.data;
};

// ========================================
// 🔗 Users API
// ========================================

export const getMyProfile = async () => {
  const response = await api.get('/me');
  return response.data;
};

export const updateMyProfile = async (data: {
  displayName?: string;
  avatarUrl?: string;
}) => {
  const response = await api.put('/me', data);
  return response.data;
};

// ========================================
// 🔗 Posts API
// ========================================

export const getPosts = async () => {
  const response = await api.get('/posts');
  return response.data;
};

export const getPost = async (id: string) => {
  const response = await api.get(`/posts/${id}`);
  return response.data;
};

export const createPost = async (data: {
  title: string;
  content: string;
  tags?: string[];
}) => {
  const response = await api.post('/posts', data);
  return response.data;
};

export const updatePost = async (
  id: string,
  data: {
    title?: string;
    content?: string;
    tags?: string[];
  },
) => {
  const response = await api.patch(`/posts/${id}`, data);
  return response.data;
};

export const deletePost = async (id: string) => {
  const response = await api.delete(`/posts/${id}`);
  return response.data;
};

export const searchPosts = async (query: string) => {
  const response = await api.get(`/posts/search`, { params: { query } });

  type ApiTag = string | { name: string };

  type ApiPost = {
    tags?: ApiTag[] | null;
    [key: string]: unknown;
  };

  return response.data.map((post: ApiPost) => ({
    ...post,
    tags: Array.isArray(post.tags)
      ? post.tags.map((t) =>
          typeof t === 'object' && t !== null ? t.name : t,
        )
      : [],
  }));
};

// ========================================
// 🔗 Tags(Post) API
// ========================================

export const getPostTags = async (postId: string) => {
  const response = await api.get(`/posts/${postId}/tags`);
  return response.data;
};

export const addPostTags = async (postId: string, tags: string[]) => {
  const response = await api.post(`/posts/${postId}/tags`, { tags });
  return response.data;
};

export const addPostTag = async (postId: string, name: string) => {
  const response = await api.post(`/posts/${postId}/tags/one`, { name });
  return response.data;
};

export const deletePostTag = async (postId: string, tagId: string) => {
  const response = await api.delete(`/posts/${postId}/tags/${tagId}`);
  return response.data;
};

export const replacePostTags = async (postId: string, tags: string[]) => {
  const response = await api.put(`/posts/${postId}/tags`, { tags });
  return response.data;
};

// ========================================
// 🔗 Tags API
// ========================================

export const getPostsByTags = async (names: string[]) => {
  const params = new URLSearchParams();
  names.forEach((name) => params.append('names', name));
  const response = await api.get(`/posts/by-tags?${params.toString()}`);
  return response.data;
};

export const getTagAutocomplete = async (
  keyword: string,
  limit: number = 5,
) => {
  const response = await api.get('/tags/autocomplete', {
    params: { keyword, limit },
  });
  return response.data;
};

// ========================================
// 🔗 Comments API
// ========================================

export const getPostComments = async (postId: string) => {
  const response = await api.get(`/posts/${postId}/comments`);
  return response.data;
};

export const getComment = async (id: string) => {
  const response = await api.get(`/comments/${id}`);
  return response.data;
};

export const createComment = async (postId: string, body: string) => {
  const response = await api.post(`/posts/${postId}/comments`, { body });
  return response.data;
};

export const updateComment = async (id: string, body: string) => {
  const response = await api.patch(`/comments/${id}`, { body });
  return response.data;
};

export const deleteComment = async (id: string, hard: boolean = false) => {
  const response = await api.delete(`/comments/${id}`, {
    params: { hard },
  });
  return response.data;
};

// GET /comments/me - 내가 쓴 댓글 조회

export interface CommentReactions {
  likeCount: number;
  dislikeCount: number;
  myReaction: 'LIKE' | 'DISLIKE' | null;
}

// ✅ 백엔드: author 안에 badgeColor + trustLevel 이 내려오므로
//    프론트에선 nicknameColor 와 badgeColor 둘 다 받을 수 있게 확장
export interface CommentAuthor {
  id: string;
  displayName: string;
  email: string;
  nicknameColor?: string; // 구 버전 호환
  badgeColor?: string; // 새 컬러 필드
  trustLevel?: 'ROOKIE' | 'MEMBER' | 'EXPERT' | 'WHALE' | string;
}

export interface MyComment {
  id: string;
  postId: string;
  content: string;
  status: 'ACTIVE' | 'DELETED';
  createdAt: string;
  updatedAt: string;
  reactions: CommentReactions;
  author: CommentAuthor;
}

export const getMyComments = async (): Promise<MyComment[]> => {
  const response = await api.get('/comments/me');
  return response.data;
};

// ========================================
// 🔗 Reactions API
// ========================================

export const togglePostLike = async (postId: string) => {
  const response = await api.post(`/posts/${postId}/like`);
  return response.data;
};

export const togglePostDislike = async (postId: string) => {
  const response = await api.post(`/posts/${postId}/dislike`);
  return response.data;
};

export const toggleCommentLike = async (commentId: string) => {
  const res = await api.post(`/comments/${commentId}/like`);
  return res.data;
};

export const toggleCommentDislike = async (commentId: string) => {
  const res = await api.post(`/comments/${commentId}/dislike`);
  return res.data;
};

// ========================================
// 🔗 Scrap API
// ========================================

export const togglePostScrap = async (postId: string) => {
  const response = await api.post(`/posts/${postId}/scrap`);
  return response.data;
};

export const getMyScraps = async () => {
  const response = await api.get(`/posts/scraps`);
  return response.data;
};

export const getIsScraped = async (postId: string) => {
  const response = await api.get(`/posts/${postId}/scrap`);
  return response.data;
};

// ========================================
// 🔗 Search API (/api/search)
// ========================================

export interface SearchHistoryItem {
  id: string;
  keyword: string;
  searchedAt: string;
}

export const getSearchHistory = async (): Promise<SearchHistoryItem[]> => {
  const res = await api.get('/search/history');
  return res.data;
};

export const deleteAllSearchHistory = async (): Promise<void> => {
  await api.delete('/search/history');
};

export const deleteSearchHistoryItem = async (
  historyId: string,
): Promise<void> => {
  await api.delete(`/search/history/${historyId}`);
};

export const searchPostsByKeyword = async (keyword: string) => {
  const res = await api.get('/search', { params: { keyword } });

  return res.data.map((post: any) => ({
    ...post,
    tags: Array.isArray(post.tags)
      ? post.tags.map((t: any) => (typeof t === 'object' ? t.name : t))
      : [],
  }));
};

// ========================================
// 🔗 Notifications API
// ========================================

export interface NotificationItem {
  id: string;
  postId: string | null;
  commentId: string | null;
  senderName: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const getNotifications = async (): Promise<NotificationItem[]> => {
  const res = await api.get('/notifications');
  return res.data;
};

export const getUnreadNotifications = async (): Promise<NotificationItem[]> => {
  const res = await api.get('/notifications/unread');
  return res.data;
};

export const getUnreadNotificationCount = async (): Promise<number> => {
  const res = await api.get('/notifications/unread-count');
  return res.data;
};

export const markNotificationRead = async (id: string) => {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await api.patch('/notifications/read/unread');
  return res.data;
};

export default api;

// ✅ 게시글 리액션(좋아요/싫어요) 카운트 조회 – 로그인 필요 없는 공개 API
export const getPostReactions = async (postId: string) => {
  const response = await api.get(`/posts/${postId}/reactions`);
  return response.data; // { likeCount, dislikeCount, myReaction }
};

export const getCommentReactions = async (commentId: string) => {
  const res = await api.get(`/comments/${commentId}/reactions`);
  return res.data;
};

export const likeComment = async (commentId: string) => {
  const res = await api.post(`/comments/${commentId}/like`);
  return res.data;
};

export const dislikeComment = async (commentId: string) => {
  const res = await api.post(`/comments/${commentId}/dislike`);
  return res.data;
};

// 신고 타입 정의
export type ReportReason =
  | 'SPAM'
  | 'ABUSE'
  | 'HATE'
  | 'ILLEGAL'
  | 'SEXUAL'
  | 'VIOLENCE'
  | 'MISINFORMATION'
  | 'OTHER';

export interface ReportRequestBody {
  reason: ReportReason;
  detail: string;
}

export async function reportPost(postId: string, data: ReportRequestBody) {
  await api.post(`/reports/posts/${postId}`, data);
}

export async function reportComment(
  commentId: string,
  data: ReportRequestBody,
) {
  await api.post(`/reports/comments/${commentId}`, data);
}
