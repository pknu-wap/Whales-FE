// src/components/common/UserProfilePopup.tsx

import { X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// 🔽 여기 경로/파일명은 실제 저장한 이름에 맞게 수정하세요.
import RookieBadge from '@/assets/Rookie Ver.2.svg';
import MemberBadge from '@/assets/Member Ver.2.svg';
import ExpertBadge from '@/assets/Expert Ver.2.svg';
import WhalesBadge from '@/assets/Whales Ver.2.svg';

interface UserProfilePopupProps {
  name: string;
  initial: string;
  nicknameColor?: string;   // gray / blue / gold ...
  className?: string;       // 위치 조정용
  intro?: string;           // 한 줄 소개 (옵션)
  onClose: () => void;
}

// 등급 타입
type Tier = 'ROOKIE' | 'MEMBER' | 'EXPERT' | 'WHALES' | 'WARN' | 'UNKNOWN';

/** 닉네임 색상 -> 등급 매핑 */
const getTierByColor = (color?: string): Tier => {
  if (!color) return 'ROOKIE'; // 정보 없으면 기본 Rookie 취급

  switch (color.toLowerCase()) {
    // Rookie 구간: gray ~ (기본 회원)
    case 'white':
    case 'gray':
      return 'ROOKIE';

    // Member 구간: black / green / emerald
    case 'black':
    case 'green':
    case 'emerald':
      return 'MEMBER';

    // Expert 구간: blue / purple
    case 'blue':
    case 'purple':
      return 'EXPERT';

    // Whales 구간: gold / yellow
    case 'gold':
    case 'yellow':
      return 'WHALES';

    // 경고 구간: orange / red
    case 'orange':
    case 'red':
      return 'WARN';

    default:
      return 'UNKNOWN';
  }
};

/** 테두리 색상 */
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

/** 등급 → 배지 이미지/라벨 */
const getTierBadge = (tier: Tier) => {
  switch (tier) {
    case 'ROOKIE':
      return { img: RookieBadge, label: 'Rookie' };
    case 'MEMBER':
      return { img: MemberBadge, label: 'Member' };
    case 'EXPERT':
      return { img: ExpertBadge, label: 'Expert' };
    case 'WHALES':
      return { img: WhalesBadge, label: 'Whales' };

    // WARN/UNKNOWN 은 별도 배지 없이 텍스트만 보여주거나 생략
    default:
      return null;
  }
};

export function UserProfilePopup({
  name,
  initial,
  nicknameColor,
  className = '',
  intro,
  onClose,
}: UserProfilePopupProps) {
  const tier = getTierByColor(nicknameColor);
  const badge = getTierBadge(tier);

  const introText = intro || '소개 문구가 없습니다.'; // 기본 문구는 원하시는 걸로 교체 가능

  return (
    <div
      className={`
        ${className}
        z-30 w-50
        rounded-2xl bg-white shadow-xl
        border border-[#A9C8FF]
        px-5 py-4
      `}
    >
      {/* 닫기 버튼 */}
      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* 아바타 + 이름 */}
      <div className="flex flex-col items-center gap-2 mb-3">
        <div
          className={`
            w-20 h-20 rounded-full
            flex items-center justify-center bg-white
            border-[6px] ${getProfileBorderClass(nicknameColor)}
          `}
        >
          <span className="text-xl font-bold text-gray-900">
            {initial}
          </span>
        </div>

        <div className="text-center mt-1">
          <p className="font-bold text-base">{name}</p>
          <p className="text-xs text-gray-500 mt-1">{introText}</p>
        </div>

        {/* 등급 배지 – 경고(WARN)는 배지를 안 보여주고 나중에 따로 처리해도 됨 */}
        {badge && (
          <div className="mt-1 flex items-center justify-center">
            <img
              src={badge.img}
              alt={badge.label}
              className="h-6 object-contain"
            />
          </div>
        )}

        {/* WARN 등급일 때 예시 텍스트 (원하면 삭제해도 됨) */}
        {tier === 'WARN' && (
          <p className="mt-1 text-[11px] text-red-500 font-medium">
            경고 회원입니다. 활동 내역을 확인해 주세요.
          </p>
        )}
      </div>

      {/* 채팅 버튼 */}
      <Button
        type="button"
        className="mt-2 w-full h-9 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium flex items-center justify-center gap-2"
      >
        <MessageCircle className="w-4 h-4" />
        채팅하기
      </Button>
    </div>
  );
}
