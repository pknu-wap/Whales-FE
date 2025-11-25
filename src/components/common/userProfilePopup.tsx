import { X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;

  initial: string;
  nickname: string;
  bio?: string;  
  levelLabel?: string;

  onStartChat?: () => void;
}

export function UserProfilePopup({
  isOpen,
  onClose,
  initial,
  nickname,
  bio,
  onStartChat,
}: UserProfilePopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      {/* 반투명 배경 */}
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />

      {/* 팝업 카드 */}
      <div className="relative z-50 w-[320px] rounded-[24px] border border-[#c9d8ff] bg-[#eaf2ff] shadow-[0_18px_40px_rgba(15,23,42,0.18)] px-10 py-8">
        {/* 닫기 버튼 */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-500 hover:text-slate-700"
          aria-label="프로필 닫기"
        >
          <X className="h-5 w-5" />
        </button>

        {/* 아바타 */}
        <div className="flex flex-col items-center gap-5">
          <div className="flex items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-3xl font-semibold text-slate-900 ring-[10px] ring-[#e0c9ff]">
              {initial}
            </div>
          </div>

          {/* 닉네임 / 소개 */}
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="text-2xl font-extrabold text-slate-900">
              {nickname}
            </div>
            {bio && (
              <p className="text-sm text-slate-600">
                {bio}
              </p>
            )}
          </div>

      </div>
    </div>
  );
}