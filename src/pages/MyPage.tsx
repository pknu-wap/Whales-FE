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
  getPost,              // ⭐ 추가: postId로 게시글 불러오기
} from '@/services/api';

import RookieBadge from '@/assets/Rookie Ver.2.svg';
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

  // ⭐ 내가 댓글 단 게시물 목록 (TopicCard로 보여줄 것)
  const [myCommentPosts, setMyCommentPosts] = useState<PostItem[]>([]);

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
// 내가 쓴 글 목록 불러오기 (내 글만 필터링)
useEffect(() => {
  // 아직 프로필을 못 불러왔으면 그냥 전체 글도 안 불러옴
  if (!profile) return;

  setPostsLoading(true);

  getPosts()
    .then((data: PostItem[]) => {
      // 1) 태그 정규화
      const normalizedPosts: PostItem[] = data.map((p) => ({
        ...p,
        tags: normalizeTags(p.tags),
      }));

      // 2) 내 이름 (displayName 우선, 없으면 nickname)
      const myName =
        profile.displayName ||
        profile.nickname ||
        '';

      // 3) 작성자 "이름" 기준으로 내 글만 필터링
      const onlyMyPosts = normalizedPosts.filter((post) => {
        const rawAuthor = post.author as any;

        // ✅ 리스트 응답에 자주 있는 authorName / writerName 도 같이 본다
        const authorNameField =
          typeof (post as any).authorName === 'string'
            ? (post as any).authorName
            : typeof (post as any).writerName === 'string'
            ? (post as any).writerName
            : undefined;

        // author가 문자열인 경우
        if (typeof rawAuthor === 'string') {
          return rawAuthor === myName;
        }

        // authorName 필드가 있는 경우
        if (authorNameField) {
          return authorNameField === myName;
        }

        // author가 객체인 경우
        if (rawAuthor && typeof rawAuthor === 'object') {
          const displayName =
            rawAuthor.displayName ??
            rawAuthor.nickname ??
            rawAuthor.name;
          if (!displayName) return false;

          return displayName === myName;
        }

        // 어떤 경우에도 매칭 안 되면 내 글이 아님
        return false;
      });

      setMyPosts(onlyMyPosts);
    })
    .finally(() => setPostsLoading(false));
}, [profile]);



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

  // ⭐ 내가 쓴 댓글 + 그 댓글이 달린 게시물 목록 불러오기
  useEffect(() => {
    const fetchCommentsAndPosts = async () => {
      setCommentsLoading(true);
      try {
        // 1) 내 댓글 목록
        const comments = await getMyComments();
        setMyComments(comments);

        // 2) postId만 모아서 중복 제거
        const postIds = Array.from(
          new Set(
            comments
              .map((c) => c.postId)
              .filter((id): id is string => !!id),
          ),
        );

        if (postIds.length === 0) {
          setMyCommentPosts([]);
          return;
        }

        // 3) 각 postId에 대한 게시글 데이터 가져오기
        const posts = await Promise.all(postIds.map((pid) => getPost(pid)));

        // 4) TopicCard에서 쓰기 좋은 PostItem 형태로 정규화
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

  // 각 탭별 카운트
  const postsCount = myPosts.length;
  const commentsCount = myComments.length;  // 🔸 카운트는 "내 댓글 개수"
  const scrapCount = myScraps.length;

  // 프로필 이니셜
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
  // TopicCard에 내려줄 author 정보 정규화
const getPostAuthor = (
  post: PostItem,
): string | { id: string; displayName: string } => {
  const rawAuthor = post.author;

  // 1️⃣ post.author 가 있는 경우 (단건 조회 getPost 응답 등)
  if (rawAuthor) {
    // 문자열이면 그대로 사용
    if (typeof rawAuthor === 'string') {
      return rawAuthor;
    }

    // 객체이면 id + displayName 구성
    const id = rawAuthor.id ?? rawAuthor.userId ?? '';
    const displayName =
      rawAuthor.displayName ??
      rawAuthor.nickname ??
      '작성자';

    return {
      id: String(id),
      displayName,
    };
  }

  // 2️⃣ post.author 는 없고 authorName 만 있는 경우 (getPosts, getMyScraps 응답)
  const authorName =
    (post as any).authorName ??
    (post as any).writerName ??
    (post as any).author_nickname;

  if (typeof authorName === 'string' && authorName.trim().length > 0) {
    // TopicCard 는 author 가 string 이어도 되니까 그대로 넘김
    return authorName;
  }

  // 3️⃣ 진짜 아무 정보도 없으면 마지막 fallback
  return '작성자';
};


  // 공통 글 카드 렌더러 (내 글 + 스크랩 + 내가 댓글 단 글)
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

  // ⭐ 댓글 탭에서 쓸 카드: 사실 renderPostCard 재사용
  const renderCommentCard = (post: PostItem) => renderPostCard(post);

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full flex p-6 gap-6 items-start">
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
                          <p className="text-sm text-slate-700">
                            {profileBio}
                          </p>
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
                    className="px-5 py-2.5 text-sm font-semibold rounded-[14px] bg-[#f3f4f6] text-slate-700 shadow-[0_1px_2px_rgqa(0,0,0,0.06)] data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white"
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

                {/* 내가 댓글 쓴 글 탭 – ⭐ 이제 "댓글 내용"이 아니라 내가 댓글 단 게시물 TopicCard */}
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
