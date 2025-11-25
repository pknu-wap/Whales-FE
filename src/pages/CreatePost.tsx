import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSidebar } from '@/components/common';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { createPost } from '@/services/api';

import cancelIcon from '@/assets/cancel.svg';
import submitIcon from '@/assets/writePost.svg';
import plusIcon from '@/assets/plus.svg';
import pencilIcon from '@/assets/pencil.svg';   // ⭐ 제목/내용 입력창에 들어갈 연필 이미지

export default function CreatePost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [content, setContent] = useState('');

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    try {
      await createPost({ title, content, tags });
      navigate('/');
    } catch (error) {
      console.error('게시글 작성 실패:', error);
    }
  };

  return (
    <div className="bg-background">
      <main className="w-full flex p-6 gap-6 items-start">
      <AppSidebar />
      <section className="flex-1 flex flex-col gap-12">
          <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">게시글 작성</h2>

            <div className="flex flex-col gap-6">

              {/* 🔹 제목 */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">제목</label>

                {/* 연회색 박스 + 입력 + 연필 아이콘 */}
                <div className="rounded-2xl bg-gray-100 px-4 py-2 flex items-center">
                  <Input
                    placeholder="제목을 입력하세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="flex-1 text-base bg-transparent border-none shadow-none p-0
                              focus-visible:ring-0 focus-visible:ring-offset-0"
                  />

                  <img
                    src={pencilIcon}
                    alt="제목 작성"
                    className="w-5 h-5 opacity-60 ml-2"
                  />
                </div>

              </div>

              {/* 🔹 해시태그 */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">해시태그</label>

                {/* 연회색 박스 + 입력 + 플러스 아이콘 */}
                <div className="rounded-2xl bg-gray-100 px-4 py-2 flex items-center">
                  <Input
                    placeholder="해시태그 입력 후 추가 버튼 클릭"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 text-base bg-transparent border-none shadow-none p-0
                              focus-visible:ring-0 focus-visible:ring-offset-0"
                  />

                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="ml-2 flex items-center justify-center cursor-pointer"
                  >
                    <img
                      src={plusIcon}
                      alt="태그 추가"
                      className="w-4 h-4 opacity-70"
                    />
                  </button>
                </div>


                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="rounded-full gap-1 pr-1 bg-blue-200 text-black"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 rounded-full p-0.5 hover:bg-blue-200 transition"
                        >
                          <X className="w-3 h-3 text-black" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* 🔹 내용 */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">내용</label>

                <div className="rounded-2xl bg-gray-100 px-4 py-2 relative">
                <Textarea
                  placeholder="내용을 입력하세요"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] text-base bg-transparent border-none shadow-none p-0
                            resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />

                <img
                  src={pencilIcon}
                  alt="내용 작성"
                  className="w-5 h-5 opacity-60 absolute top-3 right-3"
                  />
                </div>

              </div>

              {/* 액션 버튼 (취소 / 작성) */}
              <div className="flex gap-4 justify-end mt-4">
               <button
  type="button"
  onClick={() => navigate(-1)}
  className="p-2 rounded-full transition cursor-pointer"
>
  <img
    src={cancelIcon}
    alt="취소"
    className="w-20 h-20 transition hover:brightness-90"
  />
</button>

<button
  type="button"
  onClick={handleSubmit}
  className="p-2 rounded-full transition cursor-pointer"
>
  <img
    src={submitIcon}
    alt="게시글 작성"
    className="w-36 h-36 transition hover:brightness-90"
  />
</button>

              </div>

            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
