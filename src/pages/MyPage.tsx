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
} from '@/services/api';

import RookieBadge from '@/assets/rookie.svg';
import EditFieldIcon from '@/assets/글쓰기 수정.svg';
import EditProfileIcon from '@/assets/프로필 수정.svg';

type Tab = 'posts' | 'comments' | 'saved';

// 등급 테두리 색상
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
  author: {
    id: string;
    displayName: string;
    email: string;
    nicknameColor: string;
  };
}

interface Profile {
  id: number;
  nickname: string;
  displayName?: string;
  nicknameColor?: string;
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
      // 기본값은 파란색으로 두었음
      return 'border-[#2563eb] bg-white';
  }
};

export default function MyPage() {
  // 상단 탭 상태 (내가 쓴 글 / 댓글 / 스크랩)
  const [activeTab, setActiveTab] = useState<Tab>('posts');

  // 프로필 상태
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // 내가 쓴 글 목록
  const [myPosts, setMyPosts] = useState<PostItem[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  // 내가 스크랩한 글 목록
  const [myScraps, setMyScraps] = useState<PostItem[]>([]);
  const [scrapsLoading, setScrapsLoading] = useState(true);

  // 내가 남긴 댓글 목록 상태
  const [myComments, setMyComments] = useState<MyComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);

  // 프로필 인라인 편집 모드 상태
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');

  // 프로필 정보 불러오기
  useEffect(() => {
    setProfileLoading(true);
    getMyProfile()
      .then((data: Profile) => {
        // 서버에서 오는 값들을 화면용 문자열로 정규화
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

  // 화면에 보여줄 이름 (displayName 우선, 없으면 nickname)
  const profileName =
    (profile?.displayName && profile.displayName !== '-') ||
    (profile?.nickname && profile.nickname !== '-')
      ? profile?.displayName || profile?.nickname || '닉네임'
      : '닉네임';

  // 화면에 보여줄 소개 문구 (없으면 기본 문구)
  const profileBio =
    profile && profile.bio && profile.bio !== '-'
      ? profile.bio
      : '소개 문구가 없습니다.';

  // 프로필 데이터가 바뀔 때 인라인 편집 인풋 초기값 동기화
  useEffect(() => {
    setEditName(profileName);
    setEditBio(profileBio);
  }, [profileName, profileBio]);

  // 내가 쓴 글 목록 불러오기
  useEffect(() => {
    setPostsLoading(true);
    getPosts()
      .then((data: PostItem[]) => {
        const normalizedPosts: PostItem[] = data.map((p) => ({
          ...p,
          tags: normalizeTags(p.tags),
        }));
        setMyPosts(normalizedPosts);
      })
      .finally(() => setPostsLoading(false));
  }, []);

  // 스크랩한 글 목록 불러오기
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

  // 내가 쓴 댓글 조회 (추후 페이징/무한스크롤 생기면 이쪽에서 로직 확장)
  useEffect(() => {
    setCommentsLoading(true);
    getMyComments()
      .then((data: MyComment[]) => {
        setMyComments(data);
      })
      .finally(() => setCommentsLoading(false));
  }, []);

  // 각 탭별 카운트
  const postsCount = myPosts.length;
  const commentsCount = myComments.length;
  const scrapCount = myScraps.length;

  // 프로필 이니셜 (이름 없을 때 대비해서 '유' 기본값)
  const profileInitial =
    profileName && profileName.length > 0 ? profileName[0] : '유';

  // 등급에 따른 아바타 테두리 클래스
  const gradeRingClass = getTrustRingClass(profile?.trustLevel);

  // 프로필 수정 버튼 토글 + 저장 로직
  const handleToggleEditProfile = () => {
    if (isEditingProfile) {
      // TODO: API 붙이면 여기서 PATCH 호출해서 프로필 업데이트
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              displayName: editName,
              bio: editBio,
            }
          : prev,
      );
    }
    setIsEditingProfile((prev) => !prev);
  };

  // TopicCard에 내려줄 author 정보 정규화
  const getPostAuthor = (
    post: PostItem,
  ): string | { id: string; displayName: string } => {
    const rawAuthor = post.author;

    if (!rawAuthor) return profileName;

    if (typeof rawAuthor === 'string') {
      return rawAuthor;
    }

    const id = rawAuthor.id ?? rawAuthor.userId ?? '';
    const displayName = rawAuthor.displayName ?? rawAuthor.nickname ?? profileName;

    return {
      id: String(id),
      displayName,
    };
  };

  // 공통 글 카드 렌더러 (내 글 + 스크랩에서 재사용)
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
        reactions={post.reactions} // 게시글에 달린 반응 정보 그대로 전달
      />
    );
  };

  // 내가 쓴 댓글 카드 (postId 기준으로 원본 글 상세로 이동)
  const renderCommentCard = (comment: MyComment) => {
    return (
      <TopicCard
        key={comment.id}
        id={comment.postId} // TopicCard 클릭 시 /post/{postId}로 이동
        title="내가 댓글을 단 글"
        content={comment.content}
        author={comment.author.displayName}
        date={formatDate(comment.createdAt)}
        tags={[]} // 댓글 API에 태그 정보 없음 → 일단 빈 배열
        reactions={{
          likeCount: comment.reactions?.likeCount ?? 0,
          dislikeCount: comment.reactions?.dislikeCount ?? 0,
          // 댓글에는 commentCount 없음
        }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="className=w-full max-w-7xl mx-auto flex p-6 gap-6 items-start">
      <AppSidebar />
      <section className="flex-1 flex flex-col gap-12">
          {/* 상단 프로필 영역 */}
          <Card className="w-full rounded-[24px] border border-[#d0ddff] shadow-sm bg-[#eef3ff]">
            <CardContent className="flex items-center justify-between py-7 px-9">
              {profileLoading ? (
                <div className="text-slate-500">프로필 불러오는 중…</div>
              ) : profile ? (
                <>
                  <div className="flex items-center gap-6">
                    {/* 프로필 이니셜 + 등급 링 */}
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
                          <p className="text-sm text-slate-700">{profileBio}</p>
                        </>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {/* 닉네임 인라인 편집 인풋 */}
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

                          {/* 소개 문구 인라인 편집 인풋 */}
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

                  {/* 프로필 수정 토글 버튼 */}
                  <Button
                    type="button"
                    onClick={handleToggleEditProfile}
                    className="p-0 bg-transparent hover:bg-gray-100 rounded-xl"
                    aria-label="프로필 수정"
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

          {/* 가운데 카드: 탭 + 목록 영역 */}
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
                    내가 쓴 댓글 ({commentsCount})
                  </TabsTrigger>

                  <TabsTrigger
                    value="saved"
                    className="px-5 py-2.5 text-sm font-semibold rounded-[14px] bg-[#f3f4f6] text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.06)] data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white"
                  >
                    스크랩 ({scrapCount})
                  </TabsTrigger>
                </TabsList>

                {/* 내가 쓴 글 탭 */}
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

                {/* 내가 쓴 댓글 탭 */}
                <TabsContent value="comments" className="mt-2">
                  {commentsLoading ? (
                    <div className="text-center py-16 text-slate-400">
                      로딩 중…
                    </div>
                  ) : myComments.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                      작성한 댓글이 없습니다.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {myComments.map((comment) => renderCommentCard(comment))}
                    </div>
                  )}
                </TabsContent>

                {/* 스크랩 탭 */}
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