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

interface TopicCardProps {
  id: string;
  title: string;
  content: string;
  author: Author | string;
  date: string;
  tags: Tag[] | string[];
  isHot?: boolean;
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
}: TopicCardProps) {
  const navigate = useNavigate();

  const displayAuthor =
    typeof author === 'string' ? author : author.displayName;
  const displayTags = tags.map((tag) =>
    typeof tag === 'string' ? tag : tag.name,
  );

  const [reactions, setReactions] = useState<ReactionSummary | null>(null);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const p = await getPost(id);

        const r: ReactionSummary | undefined = p?.reactions;
        const likeCount = r?.likeCount ?? p?.likes ?? 0;
        const dislikeCount = r?.dislikeCount ?? 0;

        setReactions({
          likeCount,
          dislikeCount,
          myReaction: r?.myReaction ?? null,
        });

        const comments = await getPostComments(id);
        const count = Array.isArray(comments) ? comments.length : 0;
        setCommentCount(count);
      } catch (e) {
        console.error('TopicCard 리액션/댓글 수 불러오기 실패:', e);
        setReactions((prev) =>
          prev ?? { likeCount: 0, dislikeCount: 0, myReaction: null },
        );
        setCommentCount(0);
      }
    };

    fetchCounts();
  }, [id]);

  return (
    <Card
      className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border bg-gradient-to-b from-card to-secondary/30"
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
        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
          {title}
        </h3>
      </CardHeader>

      <CardContent>
        {/* 🔼 태그를 위로 올림 */}
        <div className="flex flex-wrap gap-2 mb-3">
          {displayTags.map((tagName, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 hover:text-blue-800 transition-colors"
            >
              {tagName}
            </Badge>
          ))}
        </div>

        {/* 내용은 태그 아래로 */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {content}
        </p>

        {/* ✅ 우하단 리액션 */}
        <div
          className="mt-2 flex justify-end gap-3 text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 좋아요 */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
            <ThumbsUp className="w-4 h-4 text-gray-700" />
            <span className="font-medium">
              {reactions?.likeCount ?? 0}
            </span>
          </div>

          {/* 싫어요 */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
            <ThumbsUp className="w-4 h-4 rotate-180 text-gray-700" />
            <span className="font-medium">
              {reactions?.dislikeCount ?? 0}
            </span>
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


