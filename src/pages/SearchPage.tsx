// SearchPage.tsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppSidebar } from '@/components/common';
import { Button } from '@/components/ui/button';
import {
  getPostsByTags,
  searchPosts,
  searchPostsByKeyword,
} from '@/services/api';
import { TopicCard } from '@/components/common/TopicCard';

interface SearchResultPost {
  id: string;
  title: string;
  content: string;
  authorName: string;
  tags: string[];
  createdAt: string;
  reactions?: {
    likeCount?: number;
    dislikeCount?: number;
    commentCount?: number;
    myReaction?: 'LIKE' | 'DISLIKE' | null;
  };
}

const PAGE_SIZE = 4;

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const tag = searchParams.get('tag'); // /search?tag=리액트
  const query = searchParams.get('query'); // /search?query=리액트
  const keyword = searchParams.get('keyword'); // /search?keyword=...
  const [posts, setPosts] = useState<SearchResultPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  // const navigate = useNavigate();

  // 검색 조건(tag/query/keyword)이 바뀔 때마다 페이지 1로
  useEffect(() => {
    setPage(1);
  }, [tag, query, keyword]);

  useEffect(() => {
    // 아무 검색 조건도 없으면 초기화
    if (!tag && !query && !keyword) {
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
        } else if (keyword) {
          // ✅ /api/search?keyword=... (백엔드 SearchService 사용)
          const raw = await searchPostsByKeyword(keyword);
          list = Array.isArray(raw) ? raw : [];
        } else if (query) {
          // ✅ 제목/내용 검색 (기존 /posts/search)
          const raw = await searchPosts(query);
          list = Array.isArray(raw) ? raw : [];
        }

        const mapped: SearchResultPost[] = list.map((p: any) => {
          // author 이름 추출 (백엔드 구조에 따라 보정)
          const authorName =
            typeof p.author === 'string'
              ? p.author
              : p.author?.displayName ??
                p.authorName ??
                p.writer ??
                '알 수 없음';

          const tags = Array.isArray(p.tags)
            ? p.tags
                .map((t: any) => (typeof t === 'string' ? t : t?.name ?? ''))
                .filter(Boolean)
            : [];

          return {
            id: p.id,
            title: p.title ?? '',
            content: p.content ?? '',
            authorName,
            tags,
            createdAt: p.createdAt ?? new Date().toISOString(),
            reactions: p.reactions,
          };
        });

        setPosts(mapped);
      } catch (e) {
        console.error('검색 실패:', e);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [tag, query, keyword]);

  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pagePosts = posts.slice(start, start + PAGE_SIZE);

  // ✅ 제목 텍스트
  const titleText = tag
    ? `태그: ${tag}`
    : keyword
    ? `"${keyword}" 검색 결과`
    : query
    ? `"${query}" 검색 결과`
    : '검색';

  return (
    <div>
      <main className="w-full flex px-6 pb-6 pt-24 gap-6 items-start">
      <AppSidebar />
      <section className="flex-1 flex flex-col gap-12">
          <h1 className="text-2xl font-bold">{titleText}</h1>

          {loading ? (
            <p className="text-muted-foreground">불러오는 중…</p>
          ) : pagePosts.length === 0 ? (
            <p className="text-muted-foreground">
              {tag || keyword || query
                ? '해당 조건에 맞는 게시글이 없습니다.'
                : '검색어나 태그를 입력해 주세요.'}
            </p>
          ) : (
            <>
              {/* ✅ TopicCard를 사용하는 영역 */}
              <div className="flex flex-col gap-4">
                {pagePosts.map((post) => (
                  <TopicCard
                    key={post.id}
                    id={post.id}
                    title={post.title}
                    content={post.content}
                    author={post.authorName}
                    date={new Date(post.createdAt).toLocaleDateString('ko-KR')}
                    tags={post.tags}
                    reactions={post.reactions}
                  />
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
