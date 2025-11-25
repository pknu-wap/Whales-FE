// src/components/common/TopicCard.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageCircle, X } from 'lucide-react';
import { getPost, getPostComments } from '@/services/api';
import RookieBadge from '@/assets/rookie.svg';

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

  // 닉네임 밑 작은 팝업 open 상태
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
