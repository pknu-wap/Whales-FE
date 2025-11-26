import axios from 'axios';
import useAuthStore from '@/stores/authStore';

// 프론트는 항상 Netlify → /api → EC2 로 proxy됨
const API_BASE_URL = '/api';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,   // cookie(RefreshToken) 자동 전송
});

// =========================
// 요청 인터셉터 (Bearer 자동 추가)
// =========================
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (err) => Promise.reject(err)
);

// =========================
// 응답 인터셉터 (401 → 자동 재발급)
// =========================
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

// GET /me - 내 프로필 조회
export const getMyProfile = async () => {
  const response = await api.get('/me');
  return response.data;
};

// PUT /me - 내 프로필 수정
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

// GET /posts - 게시글 목록 조회
export const getPosts = async () => {
  const response = await api.get('/posts');
  return response.data;
};

// GET /posts/{id} - 단건 조회
export const getPost = async (id: string) => {
  const response = await api.get(`/posts/${id}`);
  return response.data;
};

// POST /posts - 작성 + 태그 추가 가능
export const createPost = async (data: {
  title: string;
  content: string;
  tags?: string[];
}) => {
  const response = await api.post('/posts', data);
  return response.data;
};

// PATCH /posts/{id} - 수정 + 태그 교체
export const updatePost = async (
  id: string,
  data: {
    title?: string;
    content?: string;
    tags?: string[];
  }
) => {
  const response = await api.patch(`/posts/${id}`, data);
  return response.data;
};

// DELETE /posts/{id} - 작성자만 삭제
export const deletePost = async (id: string) => {
  const response = await api.delete(`/posts/${id}`);
  return response.data;
};

export const searchPosts = async (query: string) => {
  const response = await api.get(`/posts/search`, { params: { query } });

  type ApiTag = string | { name: string };

  type ApiPost = {
    tags?: ApiTag[] | null;
    [key: string]: unknown; // 나머지 필드는 뭐가 오든 허용
  };

  return response.data.map((post: ApiPost) => ({
    ...post,
    tags: Array.isArray(post.tags)
      ? post.tags.map((t) =>
          typeof t === 'object' && t !== null ? t.name : t
        )
      : [],
  }));
};

// ========================================
// 🔗 Tags(Post) API
// ========================================

// GET /posts/{postId}/tags - 포스트의 태그 목록
export const getPostTags = async (postId: string) => {
  const response = await api.get(`/posts/${postId}/tags`);
  return response.data;
};

// POST /posts/{postId}/tags - 여러 개 추가(중복 무시)
export const addPostTags = async (postId: string, tags: string[]) => {
  const response = await api.post(`/posts/${postId}/tags`, { tags });
  return response.data;
};

// POST /posts/{postId}/tags/one - 단건 추가
export const addPostTag = async (postId: string, name: string) => {
  const response = await api.post(`/posts/${postId}/tags/one`, { name });
  return response.data;
};

// DELETE /posts/{postId}/tags/{tagId} - 단건 제거
export const deletePostTag = async (postId: string, tagId: string) => {
  const response = await api.delete(`/posts/${postId}/tags/${tagId}`);
  return response.data;
};

// PUT /posts/{postId}/tags - 전체 교체
export const replacePostTags = async (postId: string, tags: string[]) => {
  const response = await api.put(`/posts/${postId}/tags`, { tags });
  return response.data;
};

// ========================================
// 🔗 Tags API
// ========================================

// GET /posts/by-tags - 모든 태그 포함(AND) 검색
export const getPostsByTags = async (names: string[]) => {
  const params = new URLSearchParams();
  names.forEach((name) => params.append('names', name));
  const response = await api.get(`/posts/by-tags?${params.toString()}`);
  return response.data;
};

// GET /tags/autocomplete - prefix + 인기순 정렬
export const getTagAutocomplete = async (keyword: string, limit: number = 5) => {
  const response = await api.get('/tags/autocomplete', {
    params: { keyword, limit },
  });
  return response.data;
};

// ========================================
// 🔗 Comments API
// ========================================

// GET /posts/{postId}/comments - 포스트 댓글 목록
export const getPostComments = async (postId: string) => {
  const response = await api.get(`/posts/${postId}/comments`);
  return response.data;
};

// GET /comments/{id} - 댓글 단건
export const getComment = async (id: string) => {
  const response = await api.get(`/comments/${id}`);
  return response.data;
};

// POST /posts/{postId}/comments - 댓글 작성
export const createComment = async (postId: string, body: string) => {
  const response = await api.post(`/posts/${postId}/comments`, { body });
  return response.data;
};

// PATCH /comments/{id} - 작성자만 수정
export const updateComment = async (id: string, body: string) => {
  const response = await api.patch(`/comments/${id}`, { body });
  return response.data;
};

// DELETE /comments/{id} - 작성자만 삭제 / soft 또는 hard
export const deleteComment = async (id: string, hard: boolean = false) => {
  const response = await api.delete(`/comments/${id}`, {
    params: { hard },
  });
  return response.data;
};

// GET /comments/me - 내가 쓴 댓글 조회  ← ★ 새로 추가된 기능
export interface CommentReactions {
  likeCount: number;
  dislikeCount: number;
  myReaction: 'LIKE' | 'DISLIKE' | null;
}

export interface CommentAuthor {
  id: string;
  displayName: string;
  email: string;
  nicknameColor: string;
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

// POST /posts/{postId}/like - 좋아요 토글
export const togglePostLike = async (postId: string) => {
  const response = await api.post(`/posts/${postId}/like`);
  return response.data;
};

// POST /posts/{postId}/dislike - 싫어요 토글
export const togglePostDislike = async (postId: string) => {
  const response = await api.post(`/posts/${postId}/dislike`);
  return response.data;
};

// POST /comments/{commentId}/like - 댓글 좋아요 토글
export const toggleCommentLike = async (commentId: string) => {
  const response = await api.post(`/comments/${commentId}/like`);
  return response.data;
};

// POST /comments/{commentId}/dislike - 댓글 싫어요 토글
export const toggleCommentDislike = async (commentId: string) => {
  const response = await api.post(`/comments/${commentId}/dislike`);
  return response.data;
};

// ========================================
// 🔗 Scrap API
// ========================================

// POST /posts/{postId}/scrap - 게시글 스크랩 토글
export const togglePostScrap = async (postId: string) => {
  const response = await api.post(`/posts/${postId}/scrap`);
  return response.data;
};

// GET /me/scraps - 내가 스크랩한 게시글 목록
export const getMyScraps = async () => {
  const response = await api.get(`/posts/scraps`);
  return response.data;
};

// GET /posts/{postId}/scrap - 스크랩 여부
export const getIsScraped = async (postId: string) => {
  const response = await api.get(`/posts/${postId}/scrap`);
  return response.data;
};

// api 추가
// ========================================
// 🔗 Favorite Tags API (내 즐겨찾기 태그)
// ========================================



// ========================================
// 🔗 Search API (/api/search)
// ========================================

// 백엔드 SearchHistoryResponse 그대로 매핑
export interface SearchHistoryItem {
  id: string;        // UUID
  keyword: string;   // 사용자가 검색한 원본 키워드
  searchedAt: string;
}

// GET /api/search/history - 내 검색 기록 조회
export const getSearchHistory = async (): Promise<SearchHistoryItem[]> => {
  const res = await api.get("/search/history");
  // console.log("[getSearchHistory] /search/history 응답:", res.data);
  return res.data;
};

// 🔴 DELETE /api/search/history - 검색 기록 전체 삭제
export const deleteAllSearchHistory = async (): Promise<void> => {
  await api.delete("/search/history");
};

// 🔴 DELETE /api/search/history/{historyId} - 검색 기록 단일 삭제
export const deleteSearchHistoryItem = async (historyId: string): Promise<void> => {
  await api.delete(`/search/history/${historyId}`);
};

// GET /api/search?keyword=... - 검색 + 검색기록 자동 저장
// (기존 /posts/search 를 건드리지 않기 위해 이름 다르게)
export const searchPostsByKeyword = async (keyword: string) => {
  const res = await api.get("/search", { params: { keyword } });

  // PostResponse 안의 tags 정규화 (기존 searchPosts랑 로직 맞추기)
  return res.data.map((post: any) => ({
    ...post,
    tags: Array.isArray(post.tags)
      ? post.tags.map((t: any) => (typeof t === "object" ? t.name : t))
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

// GET /notifications - 내 알림 전체 조회
export const getNotifications = async (): Promise<NotificationItem[]> => {
  const res = await api.get('/notifications');
  return res.data;
};

// GET /notifications/unread - 내가 안 읽은 알림 조회
export const getUnreadNotifications = async (): Promise<NotificationItem[]> => {
  const res = await api.get('/notifications/unread');
  return res.data;
};

// GET /notifications/unread-count - 안 읽은 알림 개수
export const getUnreadNotificationCount = async (): Promise<number> => {
  const res = await api.get('/notifications/unread-count');
  // 응답이 숫자라고 문서에 적혀 있으니 그대로 반환
  return res.data;
};

// PATCH /notifications/{id}/read - 단일 알림 읽음 처리
export const markNotificationRead = async (id: string) => {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data;
};

// PATCH /notifications/read/unread - 읽지 않은 알림 모두 읽음 처리
export const markAllNotificationsRead = async () => {
  const res = await api.patch('/notifications/read/unread');
  return res.data;
};




export default api;

// ✅ 게시글 리액션(좋아요/싫어요) 카운트 조회 – 로그인 필요 없는 공개 API
export const getPostReactions = async (postId: string) => {
  const response = await api.get(`/posts/${postId}/reactions`);
  //  ↑ 여기!!  /posts/${postId} 가 아니라 /posts/${postId}/reactions 여야 해
  return response.data;   // { likeCount, dislikeCount, myReaction }
};


// 댓글 리액션 조회 (로그인 필요 없음)
export const getCommentReactions = async (commentId: string) => {
  const res = await api.get(`/comments/${commentId}/reactions`);
  return res.data; // { likeCount, dislikeCount, myReaction }
};

// 댓글 좋아요
export const likeComment = async (commentId: string) => {
  const res = await api.post(`/comments/${commentId}/like`);
  return res.data;
};

// 댓글 싫어요
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

// 게시글 신고하기 API
export async function reportPost(postId: string, data: ReportRequestBody) {
  await api.post(`/reports/posts/${postId}`, data);
}

// 댓글 신고하기 API
export async function reportComment(commentId: string, data: ReportRequestBody) {
  await api.post(`/reports/comments/${commentId}`, data);
}