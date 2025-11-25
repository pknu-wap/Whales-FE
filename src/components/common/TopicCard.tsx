// src/components/common/TopicCard.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageCircle, X } from 'lucide-react';
import { getPostComments } from '@/services/api';
import RookieBadge from '@/assets/rookie.svg';

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
  // 닉네임 밑 작은 팝업 open 상태
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
        {/* 닉네임 & 팝업 묶는 영역을 relative로 */}
        <div className="relative mb-3 flex items-center gap-3">
          {/* 아바타 - 클릭 시 팝업 열기 */}
          <Avatar
            className="h-10 w-10 cursor-pointer border-2 border-primary/10"
            onClick={(e) => {
              e.stopPropagation();
              setIsProfileOpen((prev) => !prev);
            }}
          >
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {displayAuthor[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            {/* 닉네임 - 클릭 시 팝업 열기 */}
            <button
              type="button"
              className="block text-left text-base font-semibold hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                setIsProfileOpen((prev) => !prev);
              }}
            >
              {displayAuthor}
            </button>
            <p className="text-xs text-muted-foreground">{date}</p>
          </div>
          {/* 닉네임 아래에 작게 뜨는 팝업 */}
          {isProfileOpen && (
            <div
              className="absolute left-0 top-full z-20 mt-2 w-56 rounded-2xl border border-[#c9d8ff] bg-[#eaf2ff] px-4 py-4 shadow-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 상단 X 버튼 */}
              <button
                type="button"
                className="ml-auto mb-1 flex h-5 w-5 items-center justify-center text-slate-500 hover:text-slate-700"
                onClick={() => setIsProfileOpen(false)}
                aria-label="프로필 닫기"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex flex-col items-center gap-3">
                {/* 작은 아바타 */}
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl font-semibold text-slate-900 ring-[11px] ring-[#D89BFF] mb-4">
                  {displayAuthor[0]}
                </div>

                <div className="flex flex-col items-center gap-1 text-center">
                  <div className="text-xl font-extrabold text-slate-900">
                    {displayAuthor}
                  </div>
                  <p className="text-xs text-slate-600">
                    자기소개를 준비 중입니다.
                  </p>
                </div>

                <img
                  src={RookieBadge}
                  alt="Rookie 등급 배지"
                  className="h-6 w-auto"
                />

                <Button
                  size="sm"
                  className="mt-2 flex h-9 w-full items-center justify-center gap-1 rounded-[12px] text-xs font-semibold bg-[#2f6bff] hover:bg-[#2557d4]"
                  onClick={() => {
                    // 채팅 페이지로 이동
                    if (typeof author !== 'string') {
                      navigate(`/chat/${author.id}`);
                    } else {
                      navigate('/chat');
                    }
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>채팅하기</span>
                </Button>
              </div>
            </div>
          )}
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
