import { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getMyProfile, getMyScraps, getPosts } from '@/services/api';

export default function MyPage() {
  const [activeTab, setActiveTab] = useState('posts');
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [myScraps, setMyScraps] = useState<any[]>([]);
  const [scrapsLoading, setScrapsLoading] = useState(true);

  // ✅ 문자열 변환 유틸
  const normalizeValue = (val: any) => {
    if (val == null) return '-';
    if (typeof val === 'object') return val.name ?? JSON.stringify(val);
    return val;
  };

  // ✅ 태그 변환
  const normalizeTags = (tags: any[]) =>
    Array.isArray(tags)
      ? tags.map((tag) =>
          typeof tag === 'object' ? tag.name ?? JSON.stringify(tag) : tag
        )
      : [];

  useEffect(() => {
    getMyProfile()
      .then((data) => {
        const normalized = {
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

  useEffect(() => {
    setPostsLoading(true);
    getPosts()
      .then((data) => {
        const normalizedPosts = data.map((p: any) => ({
          ...p,
          tags: normalizeTags(p.tags),
        }));
        setMyPosts(normalizedPosts);
      })
      .finally(() => setPostsLoading(false));
  }, []);

  useEffect(() => {
    setScrapsLoading(true);
    getMyScraps()
      .then((data) => {
        const normalizedScraps = data.map((p: any) => ({
          ...p,
          tags: normalizeTags(p.tags),
        }));
        setMyScraps(normalizedScraps);
      })
      .finally(() => setScrapsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full max-w-7xl mx-auto flex p-6 gap-6">
        <AppSidebar />

        <section className="flex-1 flex flex-col gap-6">
          {/* 프로필 카드 */}
          <Card className="bg-linear-to-b from-card to-secondary/30 border-border">
            <CardHeader className="pb-4">
              {profileLoading ? (
                <div className="p-6">로딩 중…</div>
              ) : profile ? (
                <div className="flex items-start gap-4">
                  <Avatar className="w-20 h-20 border-4 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                      {profile.displayName ? profile.displayName[0] : '유'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-1">
                      {normalizeValue(profile.displayName)}
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
            onValueChange={setActiveTab}
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
              ) : myPosts.length > 0 ? (
                myPosts.map((post) => (
                  <Card key={post.id} className="hover:shadow-lg transition">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg mb-2">
                        {normalizeValue(post.title)}
                      </h3>
                      <div className="flex gap-2 mb-3">
                        {post.tags.map((tag: string, i: number) => (
                          <Badge key={i} variant="secondary" className="rounded-full">
                            {normalizeValue(tag)}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                        <span>👍 {post.reactions?.likeCount ?? 0}</span>
                        <span>👎 {post.reactions?.dislikeCount ?? 0}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  작성한 글이 없습니다.
                </div>
              )}
            </TabsContent>

            {/* 스크랩 */}
            <TabsContent value="saved" className="mt-6">
              {scrapsLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  로딩 중…
                </div>
              ) : myScraps.length > 0 ? (
                myScraps.map((post) => (
                  <Card key={post.id} className="hover:shadow-lg transition">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg mb-2">
                        {normalizeValue(post.title)}
                      </h3>
                      <div className="flex gap-2 mb-3">
                        {post.tags.map((tag: string, i: number) => (
                          <Badge key={i} variant="secondary" className="rounded-full">
                            {normalizeValue(tag)}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                        <span>👍 {post.reactions?.likeCount ?? 0}</span>
                        <span>👎 {post.reactions?.dislikeCount ?? 0}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
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