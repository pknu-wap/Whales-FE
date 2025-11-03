import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'; // ✅ useNavigate 추가
import { searchPosts } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get('query') || '';
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ✅ 네비게이션 훅

  useEffect(() => {
    if (!query) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await searchPosts(query);
        // ✅ tags가 객체일 수 있으므로 안전하게 문자열만 남김
        const normalized = data.map((p: any) => ({
          ...p,
          tags: Array.isArray(p.tags)
            ? p.tags.map((t: any) => (typeof t === 'object' ? t.name : t))
            : [],
        }));
        setPosts(normalized);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [query]);

  return (
    <div className="max-w-5xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">검색 결과: "{query}"</h1>
      {loading ? (
        <p>검색 중...</p>
      ) : posts.length === 0 ? (
        <p>검색 결과가 없습니다.</p>
      ) : (
        posts.map((post) => (
          <Card
            key={post.id}
            className="mb-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/post/${post.id}`)} // ✅ 클릭 시 상세 페이지로 이동
          >
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <p className="text-gray-600 mb-2 line-clamp-2">{post.content}</p>
              <div className="flex gap-2 flex-wrap">
                {post.tags?.map((t: string, i: number) => (
                  <Badge key={i} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}