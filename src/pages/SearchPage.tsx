// SearchPage.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppSidebar } from '@/components/common';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getPostsByTags, searchPosts } from '@/services/api';

interface PostSummary {
  id: string;
  title: string;
  tags: string[];
  createdAt: string;
  reactions?: {
    likeCount?: number;
    dislikeCount?: number;
  };
}

const PAGE_SIZE = 4;

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const tag = searchParams.get('tag');      // /search?tag=리액트
  const query = searchParams.get('query');  // /search?query=리액트
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  // 검색 조건(tag/query)이 바뀔 때마다 페이지 1로
  useEffect(() => {
    setPage(1);
  }, [tag, query]);

  useEffect(() => {
    // tag도 query도 없으면 초기화
    if (!tag && !query) {
      setPosts([]);
      return;
    }

    const fetch = async () => {
      try {
        setLoading(true);

        let list: any[] = [];

        if (tag) {
          // ✅ 태그 검색
          const raw = await getPostsByTags([tag]);
          list = Array.isArray(raw)
            ? raw
            : Array.isArray(raw?.content)
            ? raw.content
            : [];
        } else if (query) {
          // ✅ 제목/내용 검색
          const raw = await searchPosts(query);
          list = Array.isArray(raw) ? raw : [];
        }

        const mapped: PostSummary[] = list.map((p: any) => ({
          id: p.id,
          title: p.title ?? '',
          tags: Array.isArray(p.tags)
            ? p.tags.map((t: any) =>
                typeof t === 'string' ? t : t?.name ?? ''
              ).filter(Boolean)
            : [],
          createdAt: p.createdAt ?? new Date().toISOString(),
          reactions: p.reactions,
        }));

        setPosts(mapped);
      } catch (e) {
        console.error('검색 실패:', e);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [tag, query]);

  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pagePosts = posts.slice(start, start + PAGE_SIZE);

  const titleText = tag
    ? `태그: ${tag}`
    : query
    ? `"${query}" 검색 결과`
    : '검색';

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full max-w-[1400px] mx-auto flex p-6 gap-6">
        <AppSidebar />

        <section className="flex-1 flex flex-col gap-4">
          <h1 className="text-2xl font-bold">{titleText}</h1>

          {loading ? (
            <p className="text-muted-foreground">불러오는 중…</p>
          ) : pagePosts.length === 0 ? (
            <p className="text-muted-foreground">
              {tag || query
                ? '해당 조건에 맞는 게시글이 없습니다.'
                : '검색어나 태그를 입력해 주세요.'}
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
                        {post.tags.map((name) => (
                          <Badge key={name} variant="secondary">
                            {name}
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
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
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
