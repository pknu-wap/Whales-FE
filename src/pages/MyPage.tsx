import { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getMyProfile, getMyScraps, getPosts } from '@/services/api';

import RookieBadge from '@/assets/Rookie Ver.2.svg';
import LikeIcon from '@/assets/좋아요.svg';
import DislikeIcon from '@/assets/싫어요.svg';
import CommentIcon from '@/assets/댓글.svg';
import EditFieldIcon from '@/assets/글쓰기 수정.svg';
import EditProfileIcon from '@/assets/프로필 수정.svg';
import EditPostIcon from '@/assets/수정하기.svg';

// 탭 타입
type Tab = 'posts' | 'comments' | 'saved';

type TrustLevel =
  | 'basic' // 흰색 : 신규 / 기본
  | 'active' // 회색 : 활동 중 / 검증 전
  | 'trusted' // 초록 : 신뢰 회원
  | 'model' // 파랑 : 검증된 / 모범 회원
  | 'top' // 보라 : 상위 기여자 / 우수 멤버
  | 'legend' // 금색 : 레전드 / 명예 등급
  | 'warning' // 주의 회원
  | 'danger'; // 경고 회원

interface PostReactions {
  likeCount?: number;
  dislikeCount?: number;
}

interface PostItem {
  id: number;
  title: string;
  createdAt: string;
  content?: string;
  tags?: string[];
  reactions?: PostReactions;
  [key: string]: unknown;
}

// 프로필 타입
interface Profile {
  id: number;
  nickname: string;
  displayName?: string;
  email?: string;
  nicknameColor?: string;
  major?: string;
  bio?: string;
  plan?: string;
  intro?: string;
  trustLevel?: TrustLevel;
  [key: string]: unknown;
}

// name 속성이 있는 객체 타입 가드
const hasNameProperty = (val: unknown): val is { name: string } => {
  return (
    typeof val === 'object' &&
    val !== null &&
    'name' in val &&
    typeof (val as { name: unknown }).name === 'string'
  );
};

// ✅ 문자열 변환 유틸
const normalizeValue = (val: unknown): string => {
  if (val == null) return '-';

  if (hasNameProperty(val)) {
    return val.name;
  }

  if (typeof val === 'object') {
    return JSON.stringify(val);
  }

  return String(val);
};

// ✅ 태그 변환
const normalizeTags = (tags: unknown): string[] => {
  if (!Array.isArray(tags)) return [];

  return tags.map((tag) => {
    if (hasNameProperty(tag)) {
      return tag.name;
    }
    if (typeof tag === 'object' && tag !== null) {
      return JSON.stringify(tag);
    }
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

// 회원 신뢰도별 아바타 테두리 색
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

// SVG 아이콘용 리액션 박스
const ReactionBox = ({ icon, value }: { icon: string; value?: number }) => (
  <div className="flex items-center gap-1.5 rounded-2xl bg-[#f3f4f6] px-3 py-1 text-xs text-slate-600">
    <img src={icon} alt="reaction" className="w-4 h-4 opacity-80" />
    <span>{value ?? 0}</span>
  </div>
);

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<Tab>('posts');

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [myPosts, setMyPosts] = useState<PostItem[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  const [myScraps, setMyScraps] = useState<PostItem[]>([]);
  const [scrapsLoading, setScrapsLoading] = useState(true);

  // 프로필 수정 모드
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');

  // 프로필 불러오기
  useEffect(() => {
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

  // 내가 쓴 글 불러오기
  // 프로필에서 화면 표시용 이름/소개 계산
  const profileName =
    (profile?.displayName && profile.displayName !== '-') ||
    (profile?.nickname && profile.nickname !== '-')
      ? profile?.displayName || profile?.nickname || '닉네임'
      : '닉네임';

  const profileBio =
    profile && profile.bio && profile.bio !== '-'
      ? profile.bio
      : '소개 문구가 없습니다.';

  // 프로필 값이 바뀌면 편집용 state 초기화
  useEffect(() => {
    setEditName(profileName);
    setEditBio(profileBio);
  }, [profileName, profileBio]);

  // 내가 쓴 글
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

  // 스크랩
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

  const postsCount = myPosts.length;
  const commentsCount = 0; // 아직 구현 안됨
  const scrapCount = myScraps.length;

  const profileInitial =
    profileName && profileName.length > 0 ? profileName[0] : '유';

  const gradeRingClass = getTrustRingClass(profile?.trustLevel);

  const handleToggleEditProfile = () => {
    if (isEditingProfile) {
      // TODO: PATCH API
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

  // 글 카드 렌더링
  const renderPostCard = (post: PostItem) => {
    const contentText =
      (post.content as string | undefined) ??
      (normalizeValue(post['content']) === '-'
        ? ''
        : normalizeValue(post['content']));

    return (
      <div
        key={post.id}
        className="w-full rounded-2xl border border-[#e2e5ec] bg-[#f7f8fb] px-6 py-5 flex flex-col gap-4 shadow-sm"
      >
        {/* 날짜 + 리액션 */}
        <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-xs text-slate-500">
          <span>{formatDate(post.createdAt)}</span>
          <div className="flex items-center gap-3">
            <ReactionBox icon={LikeIcon} value={post.reactions?.likeCount} />
            <ReactionBox
              icon={DislikeIcon}
              value={post.reactions?.dislikeCount}
            />
            <ReactionBox
              icon={CommentIcon}
              value={post.reactions?.commentCount}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full max-w-7xl mx-auto flex p-6 gap-6">
        <AppSidebar />

        <section className="flex-1 flex flex-col gap-6">
          {/* 상단 프로필 배너 */}
          <Card className="w-full rounded-[24px] border border-[#d0ddff] shadow-sm bg-[#eef3ff]">
            <CardContent className="flex items-center justify-between py-7 px-9">
              {profileLoading ? (
                <div className="text-slate-500">프로필 불러오는 중…</div>
              ) : profile ? (
                <>
                  <div className="flex items-center gap-6">
                    {/* 아바타 */}
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-semibold text-slate-900 border-[7px] ${gradeRingClass}`}
                    >
                      {profileInitial}
                    </div>

                    <div className="flex flex-col gap-2">
                      {/* 보기 모드 / 수정 모드 */}
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
                          {/* 닉네임 박스 */}
                          <div
                            className="
                              inline-flex items-center
                              bg-white
                              rounded-[18px]        
                              h-11                  
                              px-4
                              shadow-sm
                              w-fit
                              min-w-[260px]        
                            "
                          >
                            <input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              aria-label="닉네임"
                              className="
                                flex-1
                                bg-transparent
                                border-none
                                outline-none
                                text-[20px]         
                                font-semibold
                                text-[#9CA3AF]       /* 회색 글자 */
                                placeholder:text-[#d1d5db]
                                mr-2
                              "
                              placeholder="닉네임"
                            />
                            <img
                              src={EditFieldIcon}    // 글쓰기 수정.svg
                              alt="닉네임 수정"
                              className="w-[18px] h-[18px] opacity-80"
                            />
                          </div>

                          >
                    </div>
                  )}
                </>
              ) : (
                <div className="text-slate-500">
                  프로필 정보를 불러올 수 없습니다.
                </div>
              )}
            </CardContent>
          </Card>

          {/* 가운데 카드 (탭 + 글 목록) */}
          <Card className="w-full rounded-[24px] shadow-sm border border-[#e1e4ec] bg-white">
            <CardContent className="pt-6 px-6 pb-8">
              <Tabs
                value={activeTab}
                onValueChange={(val) => setActiveTab(val as Tab)}
                className="w-full"
              >
                {/* 탭 버튼 */}
                <TabsList className="flex gap-3 bg-transparent p-0 mb-6">
                  <TabsTrigger
                    value="posts"
                    className="
                      px-5
                      py-2.5
                      text-sm
                      font-semibold
                      rounded-[14px]
                      bg-[#f3f4f6]
                      text-slate-700
                      shadow-[0_1px_2px_rgba(0,0,0,0.06)]
                      data-[state=active]:bg-[#3b82f6]
                      data-[state=active]:text-white
                    "
                  >
                    내가 쓴 글 ({postsCount})
                  </TabsTrigger>

                  <TabsTrigger
                    value="comments"
                    className="
                      px-5
                      py-2.5
                      text-sm
                      font-semibold
                      rounded-[14px]
                      bg-[#f3f4f6]
                      text-slate-700
                      shadow-[0_1px_2px_rgba(0,0,0,0.06)]
                      data-[state=active]:bg-[#3b82f6]
                      data-[state=active]:text-white
                    "
                  >
                    내가 쓴 댓글 ({commentsCount})
                  </TabsTrigger>

                  <TabsTrigger
                    value="saved"
                    className="
                      px-5
                      py-2.5
                      text-sm
                      font-semibold
                      rounded-[14px]
                      bg-[#f3f4f6]
                      text-slate-700
                      shadow-[0_1px_2px_rgba(0,0,0,0.06)]
                      data-[state=active]:bg-[#3b82f6]
                      data-[state=active]:text-white
                    "
                  >
                    스크랩 ({scrapCount})
                  </TabsTrigger>
                </TabsList>

                {/* 내가 쓴 글 */}
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

                {/* 내가 쓴 댓글 */}
                <TabsContent value="comments" className="mt-2">
                  <div className="text-center py-16 text-slate-400">
                    댓글 목록 기능은 아직 준비 중입니다.
                  </div>
                </TabsContent>

                {/* 스크랩 */}
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
