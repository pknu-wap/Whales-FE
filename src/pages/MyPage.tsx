// src/pages/MyPage.tsx
import { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { TopicCard } from '@/components/common/TopicCard';

import {
  getMyProfile,
  getMyScraps,
  getPosts,
  getMyComments,
  getPost,
  updateMyProfile, // 🔹 실제 업데이트 API
} from '@/services/api';

import RookieBadge from '@/assets/Rookie Ver.2.svg';
import EditFieldIcon from '@/assets/글쓰기 수정.svg';
import EditProfileIcon from '@/assets/프로필 수정.svg';

type Tab = 'posts' | 'comments' | 'saved';

// 등급 테두리 색상 (마이페이지 전용)
type TrustLevel =
  | 'basic'
  | 'active'
  | 'trusted'
  | 'model'
  | 'top'
  | 'legend'
  | 'warning'
  | 'danger';

interface PostReactions {
  likeCount?: number;
  dislikeCount?: number;
  commentCount?: number;
  myReaction?: 'LIKE' | 'DISLIKE' | null;
}

type AuthorLike = {
  id?: number | string;
  userId?: number | string;
  displayName?: string;
  nickname?: string;
  nicknameColor?: string;
  badgeColor?: string;
  trustLevel?: string;
};

interface PostItem {
  id: number;
  title: string;
  createdAt: string;
  content?: string;
  tags?: string[];
  reactions?: PostReactions;
  author?: AuthorLike | string;
  [key: string]: unknown;
}

interface MyComment {
  id: string;
  postId: string;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  reactions?: {
    likeCount?: number;
    dislikeCount?: number;
    myReaction?: 'LIKE' | 'DISLIKE' | null;
  };
  // ✅ badgeColor, trustLevel도 함께 보관
  author: {
    id: string;
    displayName: string;
    email: string;
    nicknameColor?: string;
    badgeColor?: string;
    trustLevel?: 'ROOKIE' | 'MEMBER' | 'EXPERT' | 'WHALE' | string;
  };
}

interface Profile {
  id: number;
  nickname: string;
  displayName?: string;
  nicknameColor?: string;
  // 백엔드에서 badgeColor 내려오면 여기에도 들어 있음
  badgeColor?: string;
  major?: string;
  bio?: string;
  plan?: string;
  intro?: string;
  trustLevel?: TrustLevel;
  [key: string]: unknown;
}

const hasNameProperty = (val: unknown): val is { name: string } => {
  return (
    typeof val === 'object' &&
    val !== null &&
    'name' in val &&
    typeof (val as { name: unknown }).name === 'string'
  );
};

const normalizeValue = (val: unknown): string => {
  if (val == null) return '-';
  if (hasNameProperty(val)) return val.name;
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
};

const normalizeTags = (tags: unknown): string[] => {
  if (!Array.isArray(tags)) return [];
  return tags.map((tag) => {
    if (hasNameProperty(tag)) return tag.name;
    if (typeof tag === 'object' && tag !== null) return JSON.stringify(tag);
    return String(tag);
  });
};

const formatDate = (value?: string) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
};

const getTrustRingClass = (trustLevel?: TrustLevel): string => {
  switch (trustLevel) {
    case 'basic':
      return 'border-[#e5e7eb] bg-white';
    case 'active':
      return 'border-[#4b5563] bg-white';
    case 'trusted':
      return 'border-[#22c55e] bg-white';
    case 'model':
      return 'border-[#2563eb] bg-white';
    case 'top':
      return 'border-[#a855f7] bg-white';
    case 'legend':
      return 'border-[#facc15] bg-white';
    case 'warning':
      return 'border-[#f97316] bg-white';
    case 'danger':
      return 'border-[#ef4444] bg-white';
    default:
      return 'border-[#2563eb] bg-white';
  }
};

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<Tab>('posts');

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [myPosts, setMyPosts] = useState<PostItem[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  const [myScraps, setMyScraps] = useState<PostItem[]>([]);
  const [scrapsLoading, setScrapsLoading] = useState(true);

  const [myComments, setMyComments] = useState<MyComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);

  const [myCommentPosts, setMyCommentPosts] = useState<PostItem[]>([]);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [savingProfile, setSavingProfile] = useState(false); // 🔹 저장 중 표시

  // 프로필 불러오기
  useEffect(() => {
    setProfileLoading(true);
    getMyProfile()
      .then((data: Profile) => {
        const normalized: Profile = {
          ...data,
          nicknameColor: normalizeValue(data.nicknameColor),
          major: normalizeValue(data.major),
          bio: normalizeValue(data.bio),
          plan: normalizeValue(data.plan),
          intro: normalizeValue(data.intro),
        };
        setProfile(normalized);
      })
      .finally(() => setProfileLoading(false));
  }, []);

  const profileName =
    (profile?.displayName && profile.displayName !== '-') ||
    (profile?.nickname && profile.nickname !== '-')
      ? profile?.displayName || profile?.nickname || '닉네임'
      : '닉네임';

  const profileBio =
    profile && profile.bio && profile.bio !== '-'
      ? profile.bio
      : '소개 문구가 없습니다.';

  useEffect(() => {
    setEditName(profileName);
    setEditBio(profileBio);
  }, [profileName, profileBio]);

  // 내가 쓴 글 목록 (내 글만 필터)
  useEffect(() => {
    if (!profile) return;

    setPostsLoading(true);

    getPosts()
      .then((data: PostItem[]) => {
        const normalizedPosts: PostItem[] = data.map((p) => ({
          ...p,
          tags: normalizeTags(p.tags),
        }));

        const myName = profile.displayName || profile.nickname || '';

        const onlyMyPosts = normalizedPosts.filter((post) => {
          const rawAuthor = post.author as any;

          const authorNameField =
            typeof (post as any).authorName === 'string'
              ? (post as any).authorName
              : typeof (post as any).writerName === 'string'
              ? (post as any).writerName
              : undefined;

          if (typeof rawAuthor === 'string') {
            return rawAuthor === myName;
          }

          if (authorNameField) {
            return authorNameField === myName;
          }

          if (rawAuthor && typeof rawAuthor === 'object') {
            const displayName =
              rawAuthor.displayName ?? rawAuthor.nickname ?? rawAuthor.name;
            if (!displayName) return false;

            return displayName === myName;
          }

          return false;
        });

        setMyPosts(onlyMyPosts);
      })
      .finally(() => setPostsLoading(false));
  }, [profile]);

  // 스크랩 글
  useEffect(() => {
    setScrapsLoading(true);
    getMyScraps()
      .then((data: PostItem[]) => {
        const normalizedScraps: PostItem[] = data.map((p) => ({
          ...p,
          tags: normalizeTags(p.tags),
        }));
        setMyScraps(normalizedScraps);
      })
      .finally(() => setScrapsLoading(false));
  }, []);

  // 내가 쓴 댓글 + 댓글이 달린 게시글 목록
  useEffect(() => {
    const fetchCommentsAndPosts = async () => {
      setCommentsLoading(true);
      try {
        const comments = await getMyComments();
        setMyComments(comments);

        const postIds = Array.from(
          new Set(comments.map((c) => c.postId).filter(Boolean)),
        );

        if (postIds.length === 0) {
          setMyCommentPosts([]);
          return;
        }

        const posts = await Promise.all(postIds.map((pid) => getPost(pid)));

        const normalizedCommentPosts: PostItem[] = posts.map((p: any) => ({
          ...p,
          tags: normalizeTags(p.tags),
        }));

        setMyCommentPosts(normalizedCommentPosts);
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchCommentsAndPosts();
  }, []);

  const postsCount = myPosts.length;
  const commentsCount = myComments.length;
  const scrapCount = myScraps.length;

  const profileInitial =
    profileName && profileName.length > 0 ? profileName[0] : '유';

  const gradeRingClass = getTrustRingClass(profile?.trustLevel);

  // 🔹 프로필 수정/저장 토글 + 실제 업데이트
  const handleToggleEditProfile = async () => {
    // 편집 모드로 진입
    if (!isEditingProfile) {
      setIsEditingProfile(true);
      return;
    }

    // 편집 모드에서 다시 누르면 "저장"
    try {
      setSavingProfile(true);

      await updateMyProfile({
        displayName: editName || undefined,
        bio: editBio || undefined, // 백엔드가 bio 받으면 같이 보냄
      });

      // 프론트 상태도 동기화
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              displayName: editName,
              bio: editBio,
            }
          : prev,
      );

      setIsEditingProfile(false);
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      alert('프로필을 저장하는 데 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSavingProfile(false);
    }
  };

  // TopicCard 에 넘길 author 정규화
  const getPostAuthor = (
    post: PostItem,
  ):
    | string
    | {
        id: string;
        displayName: string;
        nicknameColor?: string;
        badgeColor?: string;
        trustLevel?: string;
      } => {
    const rawAuthor = post.author as any;

    if (rawAuthor) {
      if (typeof rawAuthor === 'string') {
        return rawAuthor;
      }

      const id = rawAuthor.id ?? rawAuthor.userId ?? '';
      const displayName =
        rawAuthor.displayName ?? rawAuthor.nickname ?? '작성자';

      return {
        id: String(id),
        displayName,
        nicknameColor: rawAuthor.nicknameColor ?? undefined,
        badgeColor: rawAuthor.badgeColor ?? undefined,
        trustLevel: rawAuthor.trustLevel ?? undefined,
      };
    }

    const authorName =
      (post as any).authorName ??
      (post as any).writerName ??
      (post as any).author_nickname;

    if (typeof authorName === 'string' && authorName.trim().length > 0) {
      return authorName;
    }

    return '작성자';
  };

  const renderPostCard = (post: PostItem) => {
    const rawContent =
      (post.content as string | undefined) ??
      (normalizeValue(post['content']) === '-'
        ? ''
        : normalizeValue(post['content']));

    const contentText = rawContent ?? '';

    return (
      <TopicCard
        key={post.id}
        id={String(post.id)}
        title={normalizeValue(post.title)}
        content={contentText}
        author={getPostAuthor(post)}
        date={formatDate(post.createdAt)}
        tags={post.tags ?? []}
        reactions={post.reactions}
      />
    );
  };

  const renderCommentCard = (post: PostItem) => renderPostCard(post);

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full flex p-6 gap-6 items-start">
        <AppSidebar />
        <section className="flex-1 flex flex-col gap-12">
          <Card className="w-full rounded-[24px] border border-[#d0ddff] shadow-sm bg-[#eef3ff]">
            <CardContent className="flex items-center justify-between py-7 px-9">
              {profileLoading ? (
                <div className="text-slate-500">프로필 불러오는 중…</div>
              ) : profile ? (
                <>
                  <div className="flex items-center gap-6">
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-semibold text-slate-900 border-[9px] ${gradeRingClass}`}
                    >
                      {profileInitial}
                    </div>

                    <div className="flex flex-col gap-2">
                      {!isEditingProfile ? (
                        <>
                          <h1 className="text-2xl font-bold text-slate-900">
                            {profileName}
                          </h1>
                          <p className="text-sm text-slate-700">
                            {profileBio}
                          </p>
                        </>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div className="inline-flex items-center bg-white rounded-[14px] h-[2.2rem] px-3 shadow-sm w-fit">
                            <div className="grid items-center mr-1">
                              <span className="invisible col-start-1 row-start-1 text-2xl font-bold px-1 whitespace-pre">
                                {editName || '닉네임'}
                              </span>
                              <input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                aria-label="닉네임 수정"
                                placeholder="닉네임"
                                size={1}
                                className="col-start-1 row-start-1 w-full min-w-0 bg-transparent border-none outline-none text-2xl font-bold text-[#9CA3AF] placeholder:text-[#d1d5db] px-1"
                              />
                            </div>
                            <img
                              src={EditFieldIcon}
                              alt="닉네임 수정 아이콘"
                              className="w-4 h-4 opacity-80 ml-0"
                            />
                          </div>

                          <div className="inline-flex items-center bg-white rounded-[14px] h-[1.7rem] px-4 shadow-sm w-fit">
                            <div className="grid items-center">
                              <span className="invisible col-start-1 row-start-1 text-sm whitespace-pre">
                                {editBio || '소개 문구가 없습니다.'}
                              </span>
                              <input
                                value={editBio}
                                onChange={(e) => setEditBio(e.target.value)}
                                aria-label="소개 문구 수정"
                                placeholder="소개 문구가 없습니다."
                                size={1}
                                className="col-start-1 row-start-1 w-full min-w-0 bg-transparent border-none outline-none text-sm text-[#9CA3AF] placeholder:text-[#d1d5db]"
                              />
                            </div>
                            <img
                              src={EditFieldIcon}
                              alt="소개 수정"
                              className="w-4 h-4 opacity-80 ml-1"
                            />
                          </div>
                        </div>
                      )}

                      <div className="mt-1">
                        <img
                          src={RookieBadge}
                          alt="Rookie Badge"
                          className="h-7 w-auto"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleToggleEditProfile}
                    disabled={savingProfile}
                    className="p-0 bg-transparent hover:bg-gray-100 rounded-xl disabled:opacity-60"
                    aria-label={isEditingProfile ? '프로필 저장' : '프로필 수정'}
                  >
                    <img
                      src={EditProfileIcon}
                      alt="프로필 수정"
                      className="w-[118px] h-auto"
                    />
                  </Button>
                </>
              ) : (
                <div className="text-slate-500">
                  프로필 정보를 불러올 수 없습니다.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="w-full rounded-[24px] shadow-sm border border-[#e1e4ec] bg-white">
            <CardContent className="pt-6 px-6 pb-8">
              <Tabs
                value={activeTab}
                onValueChange={(val) => setActiveTab(val as Tab)}
                className="w-full"
              >
                <TabsList className="bg-transparent p-0 mb-6 gap-3 justify-start">
                  <TabsTrigger
                    value="posts"
                    className="px-5 py-2.5 text-sm font-semibold rounded-[14px] bg-[#f3f4f6] text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.06)] data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white"
                  >
                    내가 쓴 글 ({postsCount})
                  </TabsTrigger>

                  <TabsTrigger
                    value="comments"
                    className="px-5 py-2.5 text-sm font-semibold rounded-[14px] bg-[#f3f4f6] text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.06)] data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white"
                  >
                    내가 댓글 쓴 글 ({commentsCount})
                  </TabsTrigger>

                  <TabsTrigger
                    value="saved"
                    className="px-5 py-2.5 text-sm font-semibold rounded-[14px] bg-[#f3f4f6] text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.06)] data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white"
                  >
                    스크랩 ({scrapCount})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="posts" className="mt-2">
                  {postsLoading ? (
                    <div className="text-center py-16 text-slate-400">
                      로딩 중…
                    </div>
                  ) : myPosts.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                      작성한 글이 없습니다.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {myPosts.map((post) => renderPostCard(post))}
                    </div>
                  )}
                </TabsContent>

                {/* 내가 댓글 쓴 글 탭 – 댓글이 달린 게시글 TopicCard */}
                <TabsContent value="comments" className="mt-2">
                  {commentsLoading ? (
                    <div className="text-center py-16 text-slate-400">
                      로딩 중…
                    </div>
                  ) : myCommentPosts.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                      댓글을 단 게시글이 없습니다.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {myCommentPosts.map((post) => renderCommentCard(post))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="saved" className="mt-2">
                  {scrapsLoading ? (
                    <div className="text-center py-16 text-slate-400">
                      로딩 중…
                    </div>
                  ) : myScraps.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                      스크랩한 글이 없습니다.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {myScraps.map((post) => renderPostCard(post))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
