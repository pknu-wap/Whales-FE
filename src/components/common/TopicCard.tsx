// src/components/common/TopicCard.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThumbsUp, MessageCircle } from 'lucide-react';
import { getPostReactions, getPostComments } from '@/services/api';
import { UserProfilePopup } from '@/components/common/UserProfilePopup'; 

// 등급 뱃지 (학사모) import
import RookieBadge from '@/assets/Rookie Ver.2.svg';
import MemberBadge from '@/assets/Member Ver.2.svg';
import ExpertBadge from '@/assets/Expert Ver.2.svg';
import WhalesBadge from '@/assets/Whales Ver.2.svg';

// ✅ 닉네임 색상 → 프로필 테두리
const getProfileBorderClass = (color?: string) => {
  if (!color) return 'border-gray-300';

  switch (color.toLowerCase()) {
    case 'white':
    case 'gray':
      return 'border-gray-300';
    case 'black':
      return 'border-neutral-800';
    case 'green':
    case 'emerald':
      return 'border-emerald-400';
    case 'blue':
      return 'border-blue-400';
    case 'purple':
      return 'border-purple-400';
    case 'gold':
    case 'yellow':
      return 'border-yellow-400';
    case 'orange':
      return 'border-orange-400';
    case 'red':
      return 'border-red-400';
    default:
      return 'border-gray-300';
  }
};

// ✅ 닉네임 색상 → 등급(Tier)
type Tier = 'ROOKIE' | 'MEMBER' | 'EXPERT' | 'WHALES' | 'WARN' | 'UNKNOWN';

const getTierByColor = (color?: string): Tier => {
  if (!color) return 'ROOKIE';

  switch (color.toLowerCase()) {
    case 'white':
    case 'gray':
      return 'ROOKIE';
    case 'black':
    case 'green':
    case 'emerald':
      return 'MEMBER';
    case 'blue':
    case 'purple':
      return 'EXPERT';
    case 'gold':
    case 'yellow':
      return 'WHALES';
    case 'orange':
    case 'red':
      return 'WARN';
    default:
      return 'UNKNOWN';
  }
};

const getTierInfo = (tier: Tier) => {
  switch (tier) {
    case 'ROOKIE':
      return { label: 'Rookie', img: RookieBadge };
    case 'MEMBER':
      return { label: 'Member', img: MemberBadge };
    case 'EXPERT':
      return { label: 'Expert', img: ExpertBadge };
    case 'WHALES':
      return { label: 'Whales', img: WhalesBadge };
    default:
      return null;
  }
};

interface Tag {
  id: string;
  name: string;
}

interface Author {
  id: string;
  displayName: string;
  nicknameColor?: string;
}

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
  
  const authorColor =
    typeof author === 'string' ? undefined : author.nicknameColor;

  // ✅ 리액션 상태 관리
  const [reactions, setReactions] = useState<ReactionSummary>({
    likeCount: initialReactions?.likeCount ?? 0,
    dislikeCount: initialReactions?.dislikeCount ?? 0,
    myReaction: initialReactions?.myReaction ?? null,
  });

  const [commentCount, setCommentCount] = useState(
    initialReactions?.commentCount ?? 0,
  );

  // ✅ 프로필 팝업 상태 (중복 제거됨)
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchCounts = async () => {
      try {
        const r = await getPostReactions(id);

        if (!cancelled) {
          setReactions({
            likeCount: r.likeCount ?? 0,
            dislikeCount: r.dislikeCount ?? 0,
            myReaction: r.myReaction ?? null,
          });
        }

        if (!initialReactions?.commentCount) {
          const comments = await getPostComments(id);
          if (!cancelled) {
            setCommentCount(Array.isArray(comments) ? comments.length : 0);
          }
        }
      } catch (e) {
        console.error('리액션/댓글 카운트 로드 실패:', e);
        if (!cancelled) {
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
  }, [id, initialReactions]);

  const previewContent =
    content.length > 30 ? content.substring(0, 30) + '...' : content;

  const tier = getTierByColor(authorColor);
  const tierInfo = getTierInfo(tier);

  // 프로필 클릭 핸들러 (이벤트 전파 방지 포함)
  const handleAvatarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation(); // 카드 이동 방지
    setShowProfilePopup((prev) => !prev);
  };

  const handleCloseProfile = () => {
    setShowProfilePopup(false);
  };

  return (
    <Card
      className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border bg-white
                 w-full h-60 flex flex-col"
      onClick={() => navigate(`/post/${id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3 mb-3">
          {/* 아바타 + 프로필 팝업 */}
          <div
            className="relative"
            onMouseLeave={handleCloseProfile} // 마우스 나가면 닫기 기능 유지 (HEAD)
          >
            <Avatar
              className={`
                w-12 h-12 rounded-full cursor-pointer
                border-[5px] ${getProfileBorderClass(authorColor)}
                bg-white text-gray-900 font-bold
                shadow-sm group-hover:bg-gray-50
              `}
              onClick={handleAvatarClick}
            >
              <AvatarFallback className="text-sm font-semibold">
                {displayAuthor[0]}
              </AvatarFallback>
            </Avatar>

            {showProfilePopup && (
              <div
                className="absolute left-0 top-12 z-30"
                onClick={(e) => e.stopPropagation()}
              >
                <UserProfilePopup
                  name={displayAuthor}
                  initial={displayAuthor[0]}
                  nicknameColor={authorColor}
                  onClose={handleCloseProfile}
                />
              </div>
            )}
          </div>

          {/* 닉네임 / 등급 / 날짜 */}
          <div className="flex-1">
            {/* 1줄: 닉네임 */}
            <p className="font-semibold text-sm">{displayAuthor}</p>

            {/* 2줄: 뱃지(아이콘) + 날짜 */}
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              {/* 등급 아이콘 */}
              {tierInfo && (
                <div className="inline-flex items-center gap-1">
                  <div className="w-16 h-7 flex items-center justify-center">
                    <img
                      src={tierInfo.img}
                      alt={tierInfo.label}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
              )}

              {/* 날짜 */}
              <span className="text-[11px] text-muted-foreground">
                {date}
              </span>
            </div>
          </div>
        </div>

        {/* 제목 */}
        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col pt-0">
        <div className="flex-1 flex flex-col">
          {/* 태그 영역 */}
          <div className="flex items-center gap-2 mb-3 overflow-x-auto whitespace-nowrap">
            {displayTags.map((tagName, index) => (
              <Badge
                key={index}
                variant="outline"
                className="shrink-0 bg-[#C3D7FF] border-none text-xs px-3 py-1"
              >
                {tagName}
              </Badge>
            ))}
          </div>

          {/* 내용 프리뷰 */}
          <p className="text-sm text-muted-foreground">
            {previewContent}
          </p>
        </div>

        {/* 하단: 좋아요/싫어요/댓글 */}
        <div
          className="mt-4 flex justify-end gap-3 text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
            <ThumbsUp className="w-4 h-4 text-gray-700" />
            <span className="font-medium">{reactions.likeCount}</span>
          </div>

          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
            <ThumbsUp className="w-4 h-4 rotate-180 text-gray-700" />
            <span className="font-medium">{reactions.dislikeCount}</span>
          </div>

          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
            <MessageCircle className="w-4 h-4 text-gray-700" />
            <span className="font-medium">{commentCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}