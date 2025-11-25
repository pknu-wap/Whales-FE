// TagSettings.tsx
import { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/common';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import useTagStore from '@/stores/tagStore';

export default function TagSettings() {
  const [input, setInput] = useState('');
  const { subscribedTags, addTag, removeTag, hydrate } = useTagStore();

  // 처음 진입 시 localStorage → store 복원
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handleAddTag = () => {
    const name = input.trim();
    if (!name) return;
    addTag(name);
    setInput('');
  };

  const handleRemoveTag = (tag: string) => {
    removeTag(tag);
  };

  return (
    <div>
      <main className="w-full flex p-6 gap-6 items-start">
      <AppSidebar />
      <section className="flex-1 flex flex-col gap-12">
          <header className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">구독 태그 설정</h1>
            <p className="text-sm text-muted-foreground">
              자주 보는 태그를 구독하면 사이드바 즐겨찾기에 최대 4개까지
              노출됩니다.
            </p>
          </header>

          {/* 입력 영역 */}
          <div className="flex gap-2 max-w-md">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="추가할 태그를 입력하세요 (예: 리액트)"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button onClick={handleAddTag} disabled={!input.trim()}>
              추가
            </Button>
          </div>

          {/* 태그 목록 */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">구독 중인 태그</h2>
            {subscribedTags.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                아직 구독 중인 태그가 없습니다. 위에서 태그를 추가해보세요.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {subscribedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1 px-3 py-1"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-gray-500 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
