// src/components/common/TopicCard.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThumbsUp, MessageCircle } from 'lucide-react';
import { getPostReactions, getPostComments } from '@/services/api';
import { UserProfilePopup } from '@/components/common';


// ✅ 프로필 테두리 색 유틸 함수 추가
const getProfileBorderClass = (color?: string) => {
  if (!color) return 'border-gray-300'; // 기본: 흰색/기본 회원

  switch (color.toLowerCase()) {
    case 'white': // 신규 / 기본
    case 'gray':
      return 'border-gray-300';

    case 'black': // 활동 중 / 검증 전
      return 'border-neutral-800';

    case 'green': // 초록 - 신뢰 회원
    case 'emerald':
      return 'border-emerald-400';

    case 'blue': // 파랑 - 검증된 / 모범 회원
      return 'border-blue-400';

    case 'purple': // 보라 - 상위 기여자 / 우수 멤버
      return 'border-purple-400';

    case 'gold': // 금색 - 레전드 / 명예 등급
    case 'yellow':
      return 'border-yellow-400';

    case 'orange': // 주황 - 주의 회원
      return 'border-orange-400';

    case 'red': // 빨강색 - 경고 회원
      return 'border-red-400';

    default:
      return 'border-gray-300';
  }
};

interface Tag {
  id: string;
  name: string;
}

// ✅ 작성자에 색 정보 필드 추가 (백엔드에서 내려준다고 가정)
interface Author {
  id: string;
  displayName: string;
  nicknameColor?: string; // 🔹 여기에 색 정보
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
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  // ✅ 작성자 프로필 색 (문자열 author일 땐 색 없음)
  const authorColor =
    typeof author === 'string' ? undefined : author.nicknameColor;

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
        {/* ✅ 프로필 + 팝업 래퍼 */}
        <div className="relative">
          <Avatar
            className={`
              w-10 h-10 rounded-full cursor-pointer
              border-[5px] ${getProfileBorderClass(authorColor)}
              bg-white text-gray-900 font-bold
              shadow-sm group-hover:bg-gray-50
            `}
            onClick={(e) => {
              e.stopPropagation();          // 카드 클릭으로 글 상세로 넘어가지 않게 막기
              setShowProfilePopup((v) => !v);
            }}
          >
            <AvatarFallback className="text-sm font-semibold">
              {displayAuthor[0]}
            </AvatarFallback>
          </Avatar>

          {/* 🔥 아바타 클릭 시 뜨는 팝업 */}
              {showProfilePopup && (
                <div
                  className="absolute left-0 top-12 z-20"
                  onClick={(e) => e.stopPropagation()}   // ✅ 팝업 내부 클릭은 카드로 안 올라가게 막기
                >
                  <UserProfilePopup
                    className="" // 필요하면 여기다 width, padding 등 스타일 추가
                    name={displayAuthor}
                    initial={displayAuthor[0]}
                    nicknameColor={authorColor}
                    onClose={() => setShowProfilePopup(false)}
                  />
                </div>
              )}
        </div>

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
