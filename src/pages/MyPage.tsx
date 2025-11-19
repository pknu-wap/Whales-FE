// MyPage.tsx
import { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getMyProfile, getMyScraps, getPosts } from '@/services/api';

const PAGE_SIZE = 4;

// 탭 타입
type Tab = 'posts' | 'comments' | 'saved';

// 포스트 타입
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

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full max-w-7xl mx-auto flex p-6 gap-6">
        <AppSidebar />

        <section className="flex-1 flex flex-col gap-6">
          {/* 프로필 카드 */}
          <Card className="bg-gradient-to-b from-card to-secondary/30 border-border">
            <CardHeader className="pb-4">
              {profileLoading ? (
                <div className="p-6">로딩 중…</div>
              ) : profile ? (
                <div className="flex items-start gap-4">
                  <Avatar className="w-20 h-20 border-4 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                      {profile.displayName
                        ? profile.displayName[0]
                        : profile.nickname
                        ? profile.nickname[0]
                        : '유'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-1">
                      {normalizeValue(profile.displayName ?? profile.nickname)}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-2">
                      {normalizeValue(profile.bio)}
                    </p>
                    <div className="flex gap-2 mb-3">
                      {profile.major && (
                        <Badge variant="secondary" className="rounded-full">
                          전공자: {normalizeValue(profile.major)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">이메일</span>
                      <span>{profile.email ?? '-'}</span>
                    </div>
                  </div>
                  <Button variant="outline">프로필 수정</Button>
                </div>
              ) : (
                <div className="p-6 text-muted-foreground">
                  프로필 정보를 불러올 수 없습니다.
                </div>
              )}
            </CardHeader>
          </Card>

          {/* 탭 영역 */}
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as Tab)}
            className="w-full"
          >
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger value="posts">내가 쓴 글</TabsTrigger>
              <TabsTrigger value="comments">내가 쓴 댓글</TabsTrigger>
              <TabsTrigger value="saved">스크랩</TabsTrigger>
            </TabsList>

            {/* 내가 쓴 글 */}
            <TabsContent value="posts" className="mt-6">
              {postsLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  로딩 중…
                </div>
              ) : pagedPosts.length > 0 ? (
                <>
                  <div className="flex flex-col gap-4">
                    {pagedPosts.map((post) => (
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
