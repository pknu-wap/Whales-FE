// src/components/common/TopicCard.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThumbsUp, MessageCircle } from 'lucide-react';
import { getPost, getPostComments } from '@/services/api';

interface Tag {
  id: string;
  name: string;
}

interface Author {
  id: string;
  displayName: string;
}

// ✅ MyPage에서 내려주는 reactions까지 받을 수 있도록 타입 확장
interface TopicCardProps {
  id: string;
  title: string;
  content: string;
  author: Author | string;
  date: string;
  tags: Tag[] | string[];
  isHot?: boolean;
  reactions?: {
    likeCount?: number;
    dislikeCount?: number;
    commentCount?: number;
    myReaction?: 'LIKE' | 'DISLIKE' | null;
  };
}

type ReactionSummary = {
  likeCount: number;
  dislikeCount: number;
  myReaction?: 'LIKE' | 'DISLIKE' | null;
};

export function TopicCard({
  id,
  title,
  content,
  author,
  date,
  tags,
  reactions: initialReactions, // ✅ props에서 넘어온 reactions
}: TopicCardProps) {
  const navigate = useNavigate();

  const displayAuthor =
    typeof author === 'string' ? author : author.displayName;
  const displayTags = tags.map((tag) =>
    typeof tag === 'string' ? tag : tag.name,
  );

  // ✅ 초기값을 props.reactions 기준으로 설정 (없으면 null)
  const [reactions, setReactions] = useState<ReactionSummary | null>(() =>
    initialReactions
      ? {
          likeCount: initialReactions.likeCount ?? 0,
          dislikeCount: initialReactions.dislikeCount ?? 0,
          myReaction: initialReactions.myReaction ?? null,
        }
      : null,
  );

  // 댓글 개수도 props에 commentCount가 있으면 그걸 기본값으로 사용
  const [commentCount, setCommentCount] = useState(
    initialReactions?.commentCount ?? 0,
  );

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const p = await getPost(id);

        // 서버에서 내려오는 reactions를 안전하게 캐스팅
        const r = (p?.reactions ?? null) as
          | {
              likeCount?: number;
              dislikeCount?: number;
              myReaction?: 'LIKE' | 'DISLIKE' | null;
            }
          | null;

        const likeCount = r?.likeCount ?? p?.likes ?? 0;
        const dislikeCount = r?.dislikeCount ?? 0;

        setReactions({
          likeCount,
          dislikeCount,
          myReaction: r?.myReaction ?? null,
        });

        // ❗ props로 commentCount를 안 넘겨줬을 때만 API로 댓글 수 요청
        if (initialReactions?.commentCount == null) {
          const comments = await getPostComments(id);
          const count = Array.isArray(comments) ? comments.length : 0;
          setCommentCount(count);
        }
      } catch (e) {
        console.error('TopicCard 리액션/댓글 수 불러오기 실패:', e);
        setReactions((prev) =>
          prev ?? { likeCount: 0, dislikeCount: 0, myReaction: null },
        );
        if (initialReactions?.commentCount == null) {
          setCommentCount(0);
        }
      }
    };

    // 항상 최신 데이터를 위해 호출 (props.reactions는 초기값 역할)
    fetchCounts();
  }, [id, initialReactions]);

  const previewContent =
    content.length > 40 ? content.substring(0, 40) + '...' : content;

  return (
    <Card
      className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border bg-gradient-to-b from-card to-secondary/30
                 w-full h-60 flex flex-col"
      onClick={() => navigate(`/post/${id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-10 h-10 border-2 border-primary/10">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {displayAuthor[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-sm">{displayAuthor}</p>
            <p className="text-xs text-muted-foreground">{date}</p>
          </div>
        </div>
        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col pt-0">
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-3 overflow-x-auto whitespace-nowrap">
            {displayTags.map((tagName, index) => (
              <Badge key={index} variant="outline" className="shrink-0">
                {tagName}
              </Badge>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            {previewContent}
          </p>
        </div>

        <div
          className="mt-4 flex justify-end gap-3 text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 좋아요 */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
            <ThumbsUp className="w-4 h-4 text-gray-700" />
            <span className="font-medium">{reactions?.likeCount ?? 0}</span>
          </div>

          {/* 싫어요 */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
            <ThumbsUp className="w-4 h-4 rotate-180 text-gray-700" />
            <span className="font-medium">{reactions?.dislikeCount ?? 0}</span>
          </div>

          {/* 댓글 */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
            <MessageCircle className="w-4 h-4 text-gray-700" />
            <span className="font-medium">{commentCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
