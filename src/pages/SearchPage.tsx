// SearchPage.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppSidebar } from '@/components/common';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPosts } from '@/services/api'; // ✅ 전체 글 가져오는 기존 함수 사용

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

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const tag = searchParams.get('tag'); // /search?tag=리액트 → "리액트"
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!tag) {
      setPosts([]);
      return;
    }

    setLoading(true);
    getPosts()
      .then((data) => {
        const filtered = data.filter((p: any) => {
          if (!Array.isArray(p.tags)) return false;

          // 태그 이름 배열로 정규화
          const tagNames = p.tags
            .map((t: any) =>
              typeof t === 'string' ? t : t?.name
            )
            .filter(Boolean) as string[];

          // ✅ 클릭한 태그를 실제로 포함한 글만 남김
          return tagNames.includes(tag);
        });

        const mapped: PostSummary[] = filtered.map((p: any) => ({
          id: p.id,
          title: p.title,
          tags: Array.isArray(p.tags)
            ? p.tags.map((t: any) =>
                typeof t === 'string'
                  ? { name: t }
                  : { id: t.id, name: t.name }
              )
            : [],
          createdAt: p.createdAt,
          reactions: p.reactions,
        }));

        setPosts(mapped);
      })
      .finally(() => setLoading(false));
  }, [tag]);

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
          ) : posts.length === 0 ? (
            <p className="text-muted-foreground">
              해당 태그의 게시글이 없습니다.
            </p>
          ) : (
            posts.map((post) => (
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
            ))
          )}
        </section>
      </main>
    </div>
  );
}
