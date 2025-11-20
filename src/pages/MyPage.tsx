import { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getMyProfile, getMyScraps, getPosts } from '@/services/api';

import RookieBadge from '@/assets/Rookie Ver.2.svg';
import EditFieldIcon from '@/assets/글쓰기 수정.svg';
import EditProfileIcon from '@/assets/프로필 수정.svg';

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

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<Tab>('posts');

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [myPosts, setMyPosts] = useState<PostItem[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  const [myScraps, setMyScraps] = useState<PostItem[]>([]);
  const [scrapsLoading, setScrapsLoading] = useState(true);

  // 페이지네이션 상태
  const [postPage, setPostPage] = useState(1);
  const [scrapPage, setScrapPage] = useState(1);
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

  useEffect(() => {
    setPostsLoading(true);
    getPosts()
      .then((data: PostItem[]) => {
        const normalizedPosts: PostItem[] = data.map((p) => ({
          ...p,
          tags: normalizeTags(p.tags),
        }));
        setMyPosts(normalizedPosts);
        setPostPage(1); // 데이터 갱신 시 1페이지로
      })
      .finally(() => setPostsLoading(false));
  }, []);

  // 스크랩 불러오기
  useEffect(() => {
    setScrapsLoading(true);
    getMyScraps()
      .then((data: PostItem[]) => {
        const normalizedScraps: PostItem[] = data.map((p) => ({
          ...p,
          tags: normalizeTags(p.tags),
        }));
        setMyScraps(normalizedScraps);
        setScrapPage(1); // 데이터 갱신 시 1페이지로
      })
      .finally(() => setScrapsLoading(false));
  }, []);

  // 페이지네이션 계산 - 내가 쓴 글
  const postTotalPages = Math.max(1, Math.ceil(myPosts.length / PAGE_SIZE));
  const postStart = (postPage - 1) * PAGE_SIZE;
  const pagedPosts = myPosts.slice(postStart, postStart + PAGE_SIZE);

  // 페이지네이션 계산 - 스크랩
  const scrapTotalPages = Math.max(1, Math.ceil(myScraps.length / PAGE_SIZE));
  const scrapStart = (scrapPage - 1) * PAGE_SIZE;
  const pagedScraps = myScraps.slice(scrapStart, scrapStart + PAGE_SIZE);
  const profileInitial =
    profileName && profileName.length > 0 ? profileName[0] : '유';

  const gradeRingClass = getTrustRingClass(profile?.trustLevel);


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
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* 내가 쓴 글 페이지네이션 */}
                  {postTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={postPage === 1}
                        onClick={() =>
                          setPostPage((p) => Math.max(1, p - 1))
                        }
                      >
                        이전
                      </Button>
                      {Array.from({ length: postTotalPages }).map((_, idx) => {
                        const p = idx + 1;
                        return (
                          <Button
                            key={p}
                            variant={p === postPage ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPostPage(p)}
                          >
                            {p}
                          </Button>
                        );
                      })}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={postPage === postTotalPages}
                        onClick={() =>
                          setPostPage((p) =>
                            Math.min(postTotalPages, p + 1)
                          )
                        }
                      >
                        다음
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  작성한 글이 없습니다.
                </div>
              )}
            </TabsContent>

            {/* 내가 쓴 댓글 - 아직 구현 안 되어 있으니 그대로 둠 */}
            <TabsContent value="comments" className="mt-6">
              <div className="text-center py-12 text-muted-foreground">
                댓글 목록 기능은 아직 준비 중입니다.
              </div>
            </TabsContent>

            {/* 스크랩 */}
            <TabsContent value="saved" className="mt-6">
              {scrapsLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  로딩 중…
                </div>
              ) : pagedScraps.length > 0 ? (
                <>
                  <div className="flex flex-col gap-4">
                    {pagedScraps.map((post) => (
                      <Card
                        key={post.id}
                        className="hover:shadow-lg transition"
                      >
                        <CardContent className="p-6">
                          <h3 className="font-bold text-lg mb-2">
                            {normalizeValue(post.title)}
                          </h3>

                          {Array.isArray(post.tags) && post.tags.length > 0 && (
                            <div className="flex gap-2 mb-3 flex-wrap">
                              {post.tags.map((tag, i) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="rounded-full"
                                >
                                  {normalizeValue(tag)}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              {post.createdAt
                                ? new Date(
                                    post.createdAt
                                  ).toLocaleDateString('ko-KR')
                                : '-'}
                            </span>
                            <span>👍 {post.reactions?.likeCount ?? 0}</span>
                            <span>👎 {post.reactions?.dislikeCount ?? 0}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* 스크랩 페이지네이션 */}
                  {scrapTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={scrapPage === 1}
                        onClick={() =>
                          setScrapPage((p) => Math.max(1, p - 1))
                        }
                      >
                        이전
                      </Button>
                      {Array.from({ length: scrapTotalPages }).map(
                        (_, idx) => {
                          const p = idx + 1;
                          return (
                            <Button
                              key={p}
                              variant={
                                p === scrapPage ? 'default' : 'outline'
                              }
                              size="sm"
                              onClick={() => setScrapPage(p)}
                            >
                              {p}
                            </Button>
                          );
                        }
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={scrapPage === scrapTotalPages}
                        onClick={() =>
                          setScrapPage((p) =>
                            Math.min(scrapTotalPages, p + 1)
                          )
                        }
                      >
                        다음
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  스크랩한 글이 없습니다.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
}
