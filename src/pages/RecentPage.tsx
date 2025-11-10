import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/common";
import { TopicCard } from "@/components/common";
import { Clock } from "lucide-react";
import { getPosts } from "@/services/api";

interface Topic {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  tags: string[];
  createdAt?: string;
}

export default function RecentPage() {
  const [posts, setPosts] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const data = await getPosts();
        // 최신순 정렬
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setPosts(sorted);
      } catch (error) {
        console.error("최근 게시글 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPosts();
  }, []);

  // 데이터 변환
  const formatPost = (post: any) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    author:
      typeof post.author === "object"
        ? post.author.name || "익명"
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
    tags: Array.isArray(post.tags)
      ? post.tags.map((t: any) => (typeof t === "object" ? t.name : t))
      : [],
  });

  const formattedPosts = posts.map(formatPost);

  return (
    <main className="w-full h-full min-h-screen flex p-6 gap-6">
      <AppSidebar />
      <section className="flex-1 flex flex-col gap-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            최근 게시글
          </h2>
        </div>
        <p className="text-gray-600">최신순으로 정렬된 게시글을 확인해보세요</p>

        {loading ? (
          <div className="text-center text-muted-foreground py-8">
            불러오는 중...
          </div>
        ) : formattedPosts.length > 0 ? (
          <div className="flex flex-col gap-6">
            {formattedPosts.map((topic) => (
              <TopicCard key={topic.id} {...topic} />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            게시글이 없습니다.
          </div>
        )}
      </section>
    </main>
  );
}