import { useEffect, useState } from "react";
import { AppSidebar, TopicCard } from "@/components/common";
import { TrendingUp } from "lucide-react";
import { getPosts } from "@/services/api";
import { Button } from "@/components/ui/button";

// 백엔드 응답 타입
interface PostResponse {
  id: string;
  title: string;
  content: string;
  author?: { name?: string } | string;
  authorName?: string;
  createdAt?: string;
  tags?: ({ id: string; name: string } | string)[];
  reactions?: {
    likeCount?: number;
  };
}

// UI에서 사용하는 Topic 타입
interface Topic {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  tags: string[];
  reactions?: {
    likeCount?: number;
  };
  createdAt?: string;
}

const PAGE_SIZE = 4;

export default function TrendingPage() {
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchTrendingPosts = async () => {
      try {
        const data = await getPosts();
        const sorted = [...data].sort(
          (a, b) => (b.reactions?.likeCount ?? 0) - (a.reactions?.likeCount ?? 0)
        );
        setPosts(sorted);
      } catch (error) {
        console.error("인기 게시글 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingPosts();
  }, []);

  const formatPost = (post: PostResponse): Topic => ({
    id: post.id,
    title: post.title,
    content: post.content,
    author:
      typeof post.author === "object"
        ? post.author?.name || "익명"
        : post.author || post.authorName || "닉네임",
    date: post.createdAt
      ? new Date(post.createdAt)
          .toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
          .replace(/\. /g, ".")
          .replace(".", "")
      : "",
    createdAt: post.createdAt,
    tags: Array.isArray(post.tags)
      ? post.tags.map((t) => (typeof t === "object" ? t.name : t))
      : [],
    reactions: post.reactions,
  });

  if (loading) {
    return (
      <main className="w-full flex p-6 gap-6 items-start pt-24">
      <AppSidebar />
      <section className="flex-1 flex flex-col gap-12">
          <div className="text-center text-muted-foreground py-8 ">
            불러오는 중...
          </div>
        </section>
      </main>
    );
  }

  const formattedPosts = posts.map(formatPost);
  const totalPages = Math.max(1, Math.ceil(formattedPosts.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pagePosts = formattedPosts.slice(start, start + PAGE_SIZE);

  return (
    <main className="w-full flex p-6 gap-6 items-start pt-24">
      <AppSidebar />
      <section className="flex-1 flex flex-col gap-6">
        <div>
  <div className="flex items-center gap-3 mb-1">
    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-orange-500 to-red-500 flex items-center justify-center">
      <TrendingUp className="w-5 h-5 text-white" />
    </div>
    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
      인기 게시글
    </h2>
  </div>

  <p className="mt-1 text-gray-600">
    가장 주목받고 있는 댓글을 보세요
  </p>
</div>

        {pagePosts.length > 0 ? (
          <>
            <div className="flex flex-col gap-6">
              {pagePosts.map((topic) => (
                <TopicCard key={topic.id} {...topic} isHot />
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
                      variant={p === page ? "default" : "outline"}
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
        ) : (
          <div className="text-center text-muted-foreground py-8">
            게시글이 없습니다.
          </div>
        )}
      </section>
    </main>
  );
}
