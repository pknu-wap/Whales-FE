// src/components/common/TopicCard.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThumbsUp, MessageCircle } from 'lucide-react';
import { getPostReactions, getPostComments } from '@/services/api';

interface Tag {
  id: string;
  name: string;
}

interface Author {
  id: string;
  displayName: string;
}

interface TopicCardProps {
  id: string;
  title: string;
  content: string;
  author: Author | string;
  date: string;
  tags: Tag[] | string[];
  isHot?: boolean;
  // (마이페이지 등에서 이미 내려주는 경우를 위한 옵션)
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
  myReaction: 'LIKE' | 'DISLIKE' | null;
};

export function TopicCard({
  id,
  title,
  content,
  author,
  date,
  tags,
  reactions: initialReactions,
}: TopicCardProps) {
  const navigate = useNavigate();

  const displayAuthor =
    typeof author === 'string' ? author : author.displayName;
  const displayTags = tags.map((tag) =>
    typeof tag === 'string' ? tag : tag.name,
  );

  // 기본값은 props -> 없으면 0
  const [reactions, setReactions] = useState<ReactionSummary>({
    likeCount: initialReactions?.likeCount ?? 0,
    dislikeCount: initialReactions?.dislikeCount ?? 0,
    myReaction: initialReactions?.myReaction ?? null,
  });

  const [commentCount, setCommentCount] = useState(
    initialReactions?.commentCount ?? 0,
  );

  useEffect(() => {
    let cancelled = false;

    const fetchCounts = async () => {
      try {
        // ✅ 이 엔드포인트는 Auth: No 이므로 로그인 상관 없음
        const r = await getPostReactions(id);

        if (!cancelled) {
          setReactions({
            likeCount: r.likeCount ?? 0,
            dislikeCount: r.dislikeCount ?? 0,
            myReaction: r.myReaction ?? null,
          });
        }

        // 댓글 수를 props로 안 받은 경우에만 서버에서 조회
        if (!initialReactions?.commentCount) {
          const comments = await getPostComments(id);
          if (!cancelled) {
            setCommentCount(Array.isArray(comments) ? comments.length : 0);
          }
        }
      } catch (e) {
        console.error('리액션/댓글 카운트 로드 실패:', e);
        if (!cancelled) {
          // 실패해도 최소한 0으로 표시
          setReactions((prev) => ({
            likeCount: prev.likeCount ?? 0,
            dislikeCount: prev.dislikeCount ?? 0,
            myReaction: prev.myReaction ?? null,
          }));
          if (!initialReactions?.commentCount) {
            setCommentCount(0);
          }
        }
      }
    };

    fetchCounts();
    return () => {
      cancelled = true;
    };
  }, [id]); // ✅ 로그인 여부 같은 건 의존성에 넣지 않음

  const previewContent =
    content.length > 30 ? content.substring(0, 30) + '...' : content;

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
            <span className="font-medium">{reactions.likeCount}</span>
          </div>

          {/* 싫어요 */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
            <ThumbsUp className="w-4 h-4 rotate-180 text-gray-700" />
            <span className="font-medium">{reactions.dislikeCount}</span>
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
