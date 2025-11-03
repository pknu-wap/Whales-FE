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
        // 에러 발생 시 샘플 데이터 사용
        setPosts(tempHotTopics);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // --- 백엔드 연동 시 이 부분(임시 데이터)은 삭제하세요 ---
  const tempHotTopics: Topic[] = [
    {
      id: 'hot-1',
      title: '취업 준비생을 위한 면접 팁',
      content:
        '현직 면접관이 알려주는 실전 면접 노하우를 공유합니다. 질문에 대한 답변 방법과 태도...',
      author: '닉네임',
      date: '2025.09.18',
      tags: ['면접', '취업', '팁'],
    },
    {
      id: 'hot-2',
      title: '제목',
      content: '내용......',
      author: '닉네임',
      date: '2025.09.18',
      tags: ['태그1', '태그2', '태그3'],
    },
    {
      id: 'hot-3',
      title: '스타트업에서 배운 것들',
      content: '3년차 스타트업 개발자가 경험한 실무 이야기를 나눕니다...',
      author: '닉네임',
      date: '2025.09.17',
      tags: ['스타트업', '개발', '경험담'],
    },
    {
      id: 'hot-4',
      title: 'UX 디자인 포트폴리오 만들기',
      content: '실무 디자이너가 알려주는 포트폴리오 작성법과 팁...',
      author: '닉네임',
      date: '2025.09.17',
      tags: ['디자인', '포트폴리오', 'UX'],
    },
  ];
  const tempNewTopics: Topic[] = [
    {
      id: 'new-1',
      title: '효과적인 마케팅 전략',
      content: '실전에서 검증된 마케팅 전략과 노하우를 공유합니다...',
      author: '닉네임',
      date: '2025.09.18',
      tags: ['마케팅', '전략'],
    },
    {
      id: 'new-2',
      title: '프로그래밍 언어 선택 가이드',
      content: '2025년 배워야 할 프로그래밍 언어와 선택 기준...',
      author: '닉네임',
      date: '2025.09.18',
      tags: ['프로그래밍', '가이드'],
    },
    {
      id: 'new-3',
      title: '자기계발 루틴 만들기',
      content: '효율적인 자기계발 방법과 습관 형성 팁...',
      author: '닉네임',
      date: '2025.09.18',
      tags: ['자기계발', '루틴'],
    },
    {
      id: 'new-4',
      title: '서비스 기획 첫걸음',
      content: '초보 기획자를 위한 실전 기획 프로세스...',
      author: '닉네임',
      date: '2025.09.18',
      tags: ['기획', '서비스'],
    },
  ];
  // setHotTopics(tempHotTopics);
  // setNewTopics(tempNewTopics);
  // --- 여기까지 삭제 ---

  // 데이터 변환 함수
  const formatPost = (post: any) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    author:
      typeof post.author === 'object'
        ? post.author.name || '익명'
        : post.author || post.authorName || '닉네임',
    date: post.createdAt
      ? new Date(post.createdAt)
          .toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
          .replace(/\. /g, '.')
          .replace('.', '')
      : '',
    tags: Array.isArray(post.tags)
      ? post.tags.map((tag: any) => (typeof tag === 'object' ? tag.name : tag))
      : [],
  });

  const displayPosts = loading
    ? tempHotTopics.map(formatPost)
    : posts.map(formatPost);
  const displayPosts2 = loading
    ? tempNewTopics.map(formatPost)
    : posts.map(formatPost);
  const hotTopics1 = displayPosts.slice(0, 4);
  const newTopics1 = displayPosts2.slice(4, 8);

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
            {newTopics1.map((topic) => (
              <TopicCard key={topic.id} {...topic} />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;
