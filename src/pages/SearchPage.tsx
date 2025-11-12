// SearchPage.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppSidebar } from '@/components/common';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getPostsByTags } from '@/services/api';

interface TagData {
  id?: string;
  name: string;
}

interface PostSummary {
  id: string;
  title: string;
  tags: TagData[];
  createdAt: string;
  reactions?: {
    likeCount: number;
    dislikeCount: number;
  };
}

const PAGE_SIZE = 4;

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const tag = searchParams.get('tag'); // /search?tag=리액트 → "리액트"
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  // 태그가 바뀔 때마다 1페이지로 리셋
  useEffect(() => {
    setPage(1);
  }, [tag]);

  useEffect(() => {
    if (!tag) {
      setPosts([]);
      return;
    }
    setLoading(true);
    getPostsByTags([tag])
      .then((data) => {
        const mapped: PostSummary[] = data.map((p: any) => ({
          id: p.id,
          title: p.title,
          tags: Array.isArray(p.tags)
            ? p.tags.map((t: any) =>
                typeof t === 'string' ? { name: t } : { id: t.id, name: t.name }
              )
            : [],
          createdAt: p.createdAt,
          reactions: p.reactions,
        }));
        setPosts(mapped);
      })
      .finally(() => setLoading(false));
  }, [tag]);

  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pagePosts = posts.slice(start, start + PAGE_SIZE);

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full max-w-[1400px] mx-auto flex p-6 gap-6">
        <AppSidebar />

        <section className="flex-1 flex flex-col gap-4">
          <h1 className="text-2xl font-bold">
            {tag ? `태그: ${tag}` : '검색'}
          </h1>

          {loading ? (
            <p className="text-muted-foreground">불러오는 중…</p>
          ) : pagePosts.length === 0 ? (
            <p className="text-muted-foreground">
              {tag ? '해당 태그의 게시글이 없습니다.' : '태그를 선택해 주세요.'}
            </p>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                {pagePosts.map((post) => (
                  <Card
                    key={post.id}
                    className="hover:shadow-lg transition cursor-pointer"
                    onClick={() => navigate(`/post/${post.id}`)}
                  >
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {post.tags.map((t) => (
                          <Badge key={t.id ?? t.name} variant="secondary">
                            {t.name}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                        <span>👍 {post.reactions?.likeCount ?? 0}</span>
                        <span>👎 {post.reactions?.dislikeCount ?? 0}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    이전
                  </Button>
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const p = idx + 1;
                    return (
                      <Button
                        key={p}
                        variant={p === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    다음
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
