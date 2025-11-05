import React, { useEffect, useState } from 'react';
// 1. import 경로를 수정합니다. (src/ 경로를 포함)
import { AppSidebar, TopicCard } from '@/components/common';
import { Flame, Sparkles } from 'lucide-react';
import { getPosts } from '@/services/api';
// Topic 인터페이스 (id 포함)
interface Topic {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  tags: string[];
}

function App() {
  // const [hotTopics, setHotTopics] = useState<Topic[]>([]);
  // const [newTopics, setNewTopics] = useState<Topic[]>([]);
  const [posts, setPosts] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

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

  // 데이터 변환 함수
const formatPost = (post: any) => ({
  id: post.id,
  title: post.title,
  content: post.content,
  author: post.authorName || '익명',
  date: post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : '',
  createdAt: post.createdAt || '', // ✅ 정렬용 원본도 유지
  tags: Array.isArray(post.tags)
    ? post.tags.map((tag: any) => (typeof tag === 'object' ? tag.name : tag))
    : [],
});


  // HOT 토픽: 상단 4개 (기존 순서 유지)
  const hotTopics1 = loading
    ? []
    : posts.slice(0, 4).map(formatPost);

  // NEW 토픽: 최신순으로 정렬 후 4개 표시
  const newTopicsSorted = loading
  ? []
  : posts
      .map(formatPost) // ✅ 먼저 변환
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 4);

  return (
    <main className="w-full h-full min-h-screen flex p-6 gap-6">
      <AppSidebar />
      <section className="flex-1 flex flex-col gap-12">
        {/* Hot Topics Section */}
        <section className="w-full flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                HOT 토픽
              </h2>
            </div>
            <p className="text-gray-600">가장 주목받고 있는 댓글을 보세요</p>
          </div>
          {/* [수정] grid -> flex flex-col (한 줄에 하나씩) */}
          <div className="flex flex-col gap-6">
            {hotTopics1.map((topic) => (
              <TopicCard key={topic.id} {...topic} isHot />
            ))}
          </div>
        </section>

        {/* New Topics Section */}
        <section className="w-full flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                NEW 토픽
              </h2>
            </div>
            <p className="text-gray-600">주목받을 댓글을 작성하세요!</p>
          </div>
          {/* [수정] grid -> flex flex-col (한 줄에 하나씩) */}
          <div className="flex flex-col gap-6">
            {newTopicsSorted.map((topic) => (
              <TopicCard key={topic.id} {...topic} />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;
