import { useEffect, useState } from 'react';
import { AppSidebar, TopicCard } from '@/components/common';
import { Clock, TrendingUp } from 'lucide-react';
import { getPosts } from '@/services/api';
import { Button } from '@/components/ui/button';

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
    dislikeCount?: number;
  };
}

// 화면에서 사용하는 Topic 타입
interface Topic {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  tags: string[];
  createdAt?: string;
}

const HOT_PAGE_SIZE = 2;
const NEW_PAGE_SIZE = 2;

function App() {
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [hotPage, setHotPage] = useState(1);
  const [newPage, setNewPage] = useState(1);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        setPosts(data);
      } catch (error) {
        console.error('게시글 목록 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const formatPost = (post: PostResponse): Topic => ({
    id: post.id,
    title: post.title,
    content: post.content,
    author:
      typeof post.author === 'object'
        ? post.author?.name || '익명'
        : post.author || post.authorName || '익명',
    date: post.createdAt
      ? new Date(post.createdAt).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
      : '',
    createdAt: post.createdAt,
    tags: Array.isArray(post.tags)
      ? post.tags.map((tag) => (typeof tag === 'object' ? tag.name : tag))
      : [],
  });

  // 🔹 로딩 화면
  if (loading) {
    return (
      // ✅ 수정됨: pt-24를 추가하여 헤더 높이만큼 내용을 아래로 밀어줌
      <main className="w-full flex p-6 gap-6 items-start pt-24">
        <AppSidebar />
        <section className="flex-1 flex flex-col gap-12">
          <div className="text-center text-muted-foreground py-8">
            불러오는 중...
          </div>
        </section>
      </main>
    );
  }

  const formatted = posts.map(formatPost);

  // HOT: 기존 순서, 2개씩
  const hotTotalPages = Math.max(1, Math.ceil(formatted.length / HOT_PAGE_SIZE));
  const hotStart = (hotPage - 1) * HOT_PAGE_SIZE;
  const hotTopics = formatted.slice(hotStart, hotStart + HOT_PAGE_SIZE);

  // NEW: 최신순 정렬, 2개씩
  const newSorted = [...formatted].sort(
    (a, b) =>
      new Date(b.createdAt || '').getTime() -
      new Date(a.createdAt || '').getTime()
  );
  const newTotalPages = Math.max(
    1,
    Math.ceil(newSorted.length / NEW_PAGE_SIZE)
  );
  const newStart = (newPage - 1) * NEW_PAGE_SIZE;
  const newTopics = newSorted.slice(newStart, newStart + NEW_PAGE_SIZE);

  // 🔹 실제 화면
  return (
    // ✅ 수정됨: pt-24 (padding-top: 6rem) 추가
    // 헤더 높이가 보통 h-14(3.5rem) ~ h-16(4rem) 정도이므로,
    // 기존 패딩(p-6)과 겹치지 않게 넉넉히 pt-24나 pt-28 정도를 주면 자연스럽습니다.
    <main className="w-full flex p-6 gap-6 items-start pt-24">
      <AppSidebar />
      <section className="flex-1 flex flex-col gap-12">
        {/* HOT 토픽 */}
        <section className="w-full flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                인기 게시글
              </h2>
            </div>
            <p className="text-gray-600">가장 주목받고 있는 댓글을 보세요</p>
          </div>

          <div className="flex flex-col gap-6">
            {hotTopics.map((topic) => (
              <TopicCard key={topic.id} {...topic} isHot />
            ))}
          </div>

          {/* HOT 페이지네이션 */}
          {hotTotalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={hotPage === 1}
                onClick={() => setHotPage((p) => Math.max(1, p - 1))}
              >
                이전
              </Button>
              {Array.from({ length: hotTotalPages }).map((_, idx) => {
                const page = idx + 1;
                return (
                  <Button
                    key={page}
                    variant={page === hotPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setHotPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                disabled={hotPage === hotTotalPages}
                onClick={() =>
                  setHotPage((p) => Math.min(hotTotalPages, p + 1))
                }
              >
                다음
              </Button>
            </div>
          )}
        </section>

        {/* NEW 토픽 */}
        <section className="w-full flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-sky-500 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                최근 게시글
              </h2>
            </div>
            <p className="text-gray-600">주목받을 댓글을 작성하세요!</p>
          </div>

          <div className="flex flex-col gap-6">
            {newTopics.map((topic) => (
              <TopicCard key={topic.id} {...topic} />
            ))}
          </div>

          {/* NEW 페이지네이션 */}
          {newTotalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={newPage === 1}
                onClick={() => setNewPage((p) => Math.max(1, p - 1))}
              >
                이전
              </Button>
              {Array.from({ length: newTotalPages }).map((_, idx) => {
                const page = idx + 1;
                return (
                  <Button
                    key={page}
                    variant={page === newPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                disabled={newPage === newTotalPages}
                onClick={() =>
                  setNewPage((p) => Math.min(newTotalPages, p + 1))
                }
              >
                다음
              </Button>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default App;