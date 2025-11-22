import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button, Input } from '../ui';
import { Search, LogIn, PenSquare, Clock } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

import WhalesLogo from '@/assets/Whales.svg';
import AlarmButton from '@/assets/AlarmButton.svg';
import ChatButton from '@/assets/ChatButton.svg';

import { getSearchHistory } from '@/services/api';
import type { SearchHistoryItem } from '@/services/api';

function AppHeader() {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const navigate = useNavigate();
  const { user, clearAuth, initializeAuth } = useAuthStore();
  const isLoggedIn = !!user;

  useEffect(() => {
    if (typeof initializeAuth === 'function') {
      initializeAuth();
    }
  }, [initializeAuth]);

  // 🔍 검색 실행: keyword 하나로만 넘김
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const keyword = query.trim();
    if (!keyword) return;

    navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
    setShowHistory(false);
  };

  // ✅ 검색창 포커스 시 검색 기록 불러오기
  const handleFocusSearch = async () => {
    setShowHistory(true);

    if (!isLoggedIn) return;

    try {
      const items = await getSearchHistory(); // GET /search/history
      setHistory(items);
    } catch (err) {
      console.error('검색 기록 불러오기 실패', err);
    }
  };

  // ✅ blur 시 바로 닫으면 아이템 클릭이 안 되므로 약간 딜레이 후 닫기
  const handleBlurSearch = () => {
    setTimeout(() => setShowHistory(false), 120);
  };

  // ✅ 검색 기록 클릭: 인풋 채우고 바로 검색 이동
  const handleClickHistoryItem = (keyword: string) => {
    setQuery(keyword);
    setShowHistory(false);
    navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
  };

  // ✅ 현재 입력된 query로 기록 필터링 (앞부분 포함 검색)
  const filteredHistory = history
    .filter((item) =>
      query.trim()
        ? item.keyword.toLowerCase().includes(query.toLowerCase())
        : true
    )
    .slice(0, 5);

  // ✅ 닉네임 색상 Tailwind 변환 유틸
  const getNicknameColorClass = (color?: string) => {
    if (!color) return 'text-gray-700';
    switch (color.toLowerCase()) {
      case 'blue':
        return 'text-blue-600';
      case 'green':
        return 'text-green-600';
      case 'red':
        return 'text-red-600';
      case 'purple':
        return 'text-purple-600';
      case 'gray':
        return 'text-gray-600';
      default:
        return 'text-gray-700';
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const handleWriteClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      navigate('/create');
    }
  };

  return (
    <header className="w-full border-b border-gray-200 bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center gap-6">
        {/* 로고 */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <img src={WhalesLogo} alt="Whales 로고" className="h-10 w-auto" />
        </div>

        {/* 🔍 검색창 + 검색 기록 드롭다운 */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative">
          <div className="relative flex w-full items-center rounded-xl bg-[#E5F1FF] border border-[#A9C8FF] px-4 py-1 shadow-sm">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="게시글 검색하기"
              onFocus={handleFocusSearch}
              onBlur={handleBlurSearch}
              className="
                flex-1 border-none bg-transparent shadow-none
                focus-visible:ring-0 focus-visible:ring-offset-0
                text-sm placeholder:text-[#7BA4F5]
              "
            />
            <button type="submit" className="ml-2">
              <Search className="w-4 h-4 text-[#7BA4F5] cursor-pointer" />
            </button>
          </div>

          {/* 🔽 검색 기록 드롭다운 */}
          {showHistory && (
            <div
              className="
                absolute left-0 right-0 mt-1
                rounded-xl bg-[#E5F1FF] border border-[#A9C8FF]
                shadow-sm overflow-hidden
              "
            >
              {/* 상단 라벨 영역 */}
              <div className="px-4 py-2 text-xs text-[#7BA4F5] border-b border-[#A9C8FF]/60">
                최근 검색 기록
              </div>

              <ul className="max-h-64 overflow-y-auto">
                {filteredHistory.length === 0 ? (
                  <li className="px-4 py-2 text-xs text-[#7BA4F5]/70">
                    최근 검색 기록이 없습니다.
                  </li>
                ) : (
                  filteredHistory.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-[#4B6FBF] hover:bg-[#D7E6FF] cursor-pointer"
                      onMouseDown={(e) => e.preventDefault()} // blur 방지
                      onClick={() => handleClickHistoryItem(item.keyword)}
                    >
                      <Clock className="w-4 h-4 opacity-70" />
                      <span className="truncate">{item.keyword}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </form>

        {/* 우측 버튼 */}
        <div className="flex items-center gap-3">
          {/* ✏️ 글쓰기 버튼 - 파란 그라디언트 + 연한 느낌 */}
          <Button
            size="lg"
            variant="outline"
            onClick={handleWriteClick}
            className="gap-2 rounded-md bg-gradient-to-r from-[#E4EEFF] to-[#C7DBFF] border-[#9AB8FF] text-black hover:opacity-90 transition-opacity"
          >
            <PenSquare className="w-4 h-4" />
            <span>글쓰기</span>
          </Button>

          {/* 로그인 상태에 따른 UI */}
          {!isLoggedIn ? (
            <>
              {/* 🔑 로그인 버튼 - 진한 파란색 그라디언트 */}
              <Button
                size="lg"
                className="gap-2 rounded-md bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-black hover:brightness-110 transition"
              >
                <LogIn className="w-4 h-4" />
                <NavLink to="/login" key="login-link">
                  로그인
                </NavLink>
              </Button>
            </>
          ) : (
            <>
              {/* 프로필 + 닉네임 */}
              <div
                className="flex items-center gap-3 px-3 py-2 rounded-md bg-blue-50 hover:bg-blue-100 cursor-pointer"
                onClick={() => navigate('/mypage')}
              >
                <Avatar className="w-8 h-8 border border-blue-300">
                  {user?.avatarUrl ? (
                    <AvatarImage
                      src={user.avatarUrl}
                      alt={user?.displayName ?? ''}
                    />
                  ) : (
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                      {user?.displayName
                        ? user.displayName[0].toUpperCase()
                        : '유'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span
                  className={`font-semibold ${getNicknameColorClass(
                    user?.nicknameColor
                  )}`}
                >
                  {user?.displayName || user?.email}
                </span>
              </div>

              {/* 로그아웃 버튼 */}
              <Button
                variant="outline"
                size="lg"
                onClick={handleLogout}
                className="gap-2 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                로그아웃
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export { AppHeader };
