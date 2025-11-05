import { useState } from 'react';
import { AppSidebar } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function MyPage() {
  const [activeTab, setActiveTab] = useState('posts');

  const myPosts = [
    {
      id: 1,
      title: 'C언어 형식',
      category: '자연과학',
      tags: ['컴퓨터'],
      date: '2025.9.1',
      likes: 3,
      comments: 0,
    },
    {
      id: 2,
      title: '저급 언어',
      category: '자연',
      tags: ['컴퓨터', '과제'],
      date: '2025.8.19',
      likes: 5,
      comments: 0,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full max-w-7xl mx-auto flex p-6 gap-6">
        <AppSidebar />

        <section className="flex-1 flex flex-col gap-6">
          {/* 프로필 카드 */}
          <Card className="bg-gradient-to-b from-card to-secondary/30 border-border">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <Avatar className="w-20 h-20 border-4 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                    자
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">유저 닉네임</h2>
                  <p className="text-sm text-muted-foreground mb-2">
                    컴퓨터공학
                  </p>
                  <div className="flex gap-2 mb-3">
                    <Badge variant="secondary" className="rounded-full">
                      전공 : 컴퓨터공학
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">이메일</span>
                    <span>@ pukyong.ac.kr</span>
                  </div>
                </div>
                <Button variant="outline">프로필 수정</Button>
              </div>
            </CardHeader>
          </Card>

          {/* 활동 통계 */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="text-center">
              <CardContent className="pt-6">
                <p className="text-3xl font-bold text-primary">가입 일자</p>
                <p className="text-sm text-muted-foreground mt-2">2025/06/22</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <p className="text-3xl font-bold text-primary">계획</p>
                <p className="text-sm text-muted-foreground mt-2">
                  아무것도 안하기
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <p className="text-3xl font-bold text-primary"> 소개 </p>
                <p className="text-sm text-muted-foreground mt-2">
                  대한민국은 자연과학에 대한 투자가 필요하다
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 탭 영역 */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger
                value="posts"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                내가 쓴 글 (2)
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                내가 쓴 댓글 (2)
              </TabsTrigger>
              <TabsTrigger
                value="saved"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                스크랩 (5)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-6">
              <div className="flex flex-col gap-4">
                {myPosts.map((post) => (
                  <Card
                    key={post.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-2">
                            {post.title}
                          </h3>
                          <div className="flex gap-2 mb-3">
                            {post.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="rounded-full"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{post.category}</span>
                            <span>•</span>
                            <span>{post.date}</span>
                            <span>•</span>
                            <span>👍 {post.likes}</span>
                            <span>💬 {post.comments}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="comments" className="mt-6">
              <div className="text-center py-12 text-muted-foreground">
                내가 쓴 댓글이 여기에 표시됩니다
              </div>
            </TabsContent>

            <TabsContent value="saved" className="mt-6">
              <div className="text-center py-12 text-muted-foreground">
                스크랩한 글이 여기에 표시됩니다
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
}
