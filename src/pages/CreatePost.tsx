import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSidebar } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { createPost } from '@/services/api'; // ✅ axios API 함수 사용

export default function CreatePost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [content, setContent] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    try {
      await createPost({ title, content, tags }); // ✅ axios 요청 (http://localhost:8080/api/posts)
      navigate('/');
    } catch (error) {
      console.error('게시글 작성 실패:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full max-w-7xl mx-auto flex p-6 gap-6">
        <AppSidebar />
        <section className="flex-1 flex flex-col gap-6">
          <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">게시글 작성</h2>

            <div className="flex flex-col gap-6">
              {/* 제목 */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">제목</label>
                <Input
                  placeholder="게시글 제목을 입력하세요"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-base"
                />
              </div>

              {/* 해시태그 */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">해시태그</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="해시태그 입력 후 추가 버튼 클릭"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className="text-base"
                  />
                  <Button onClick={handleAddTag} variant="secondary">
                    추가
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="rounded-full gap-1 pr-1">
                        #{tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:bg-background/50 rounded-full p-0.5"
                          aria-label={`${tag} 태그 삭제`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* 내용 */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">내용</label>
                <Textarea
                  placeholder="내용을 입력하세요"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[300px] text-base"
                />
              </div>

              {/* 버튼들 */}
              <div className="flex gap-3 justify-end mt-4">
                <Button variant="outline" onClick={() => navigate(-1)}>
                  취소
                </Button>
                <Button onClick={handleSubmit}>게시글 작성</Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}