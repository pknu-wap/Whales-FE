// src/components/common/AppHeader.tsx (경로는 프로젝트 구조에 맞게)

import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button, Input } from '../ui';
import { Search, LogIn, PenSquare, Clock } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

import WhalesLogo from '@/assets/Whales.svg';
import AlarmButton from '@/assets/AlarmButton.svg';
import ChatButton from '@/assets/ChatButton.svg';

/** 프론트(localStorage)에서만 관리하는 검색 기록 타입 */
type LocalHistoryItem = {
  id: string; // 유니크 ID
  keyword: string; // 검색어
  searchedAt: string;
};

const LOCAL_HISTORY_KEY = 'whales_local_search_history';
const MAX_HISTORY = 10; // 최대 노출/저장 개수

function loadLocalHistory(): LocalHistoryItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveLocalHistory(items: LocalHistoryItem[]) {
  try {
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(items));
  } catch {
    // 실패해도 크게 상관 없음
  }
}

function AppHeader() {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<LocalHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const navigate = useNavigate();
  const { user, clearAuth, initializeAuth } = useAuthStore();
  const isLoggedIn = !!user;

  const hiddenPaths = ["/login", "/auth/callback"];

  // ✅ 로그인 상태 복원
  useEffect(() => {
    if (typeof initializeAuth === 'function') {
      initializeAuth();
    }
  }, [initializeAuth]);

  // ✅ 첫 렌더 시 localStorage 검색 기록 불러오기
  useEffect(() => {
    const loaded = loadLocalHistory();
    setHistory(loaded);
  }, []);

  // ✅ history 변경 시 localStorage에 저장
  useEffect(() => {
    saveLocalHistory(history);
  }, [history]);

  // 🔍 검색 실행
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const keyword = query.trim();
    if (!keyword) return;

    const now = new Date().toISOString();

    // 1) 새 검색 기록 객체 생성
    const newItem: LocalHistoryItem = {
      id: `${now}-${Math.random()}`,
      keyword,
      searchedAt: now,
    };

    // 2) 기존 history를 Set 기반 중복 제거 Struct로 변환
    const map = new Map<string, LocalHistoryItem>();

    // 기존 기록을 먼저 넣음 (뒤로 밀림)
    history.forEach((item) => {
      map.set(item.keyword, item);
    });

    // 3) 새 검색어는 덮어쓰기 → 결과적으로 최신 검색이 먼저 오도록
    map.set(keyword, newItem);

    // 4) 다시 배열로 만들고 최신순으로 정렬
    const updated = Array.from(map.values())
      .sort((a, b) => (a.searchedAt < b.searchedAt ? 1 : -1))
      .slice(0, MAX_HISTORY); // 최대 개수 유지

    // 5) 상태 업데이트 + 저장
    setHistory(updated);
    saveLocalHistory(updated);

    navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
    setShowHistory(false);
  };

  // ✅ 검색창 포커스/클릭 시 팝업 열기
  const openHistory = () => {
    setShowHistory(true);
  };

  // ✅ blur 시 살짝 딜레이 후 닫기 (클릭 가능하도록)
  const handleBlurSearch = () => {
    setTimeout(() => setShowHistory(false), 120);
  };

  // ✅ 검색 기록 클릭 시
  const handleClickHistoryItem = (keyword: string) => {
    setQuery(keyword);
    setShowHistory(false);
    navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
  };

  // ✅ 필터링 없이 최근 MAX_HISTORY개만 사용 (필요하면 필터 로직 추가 가능)
  const filteredHistory = history.slice(0, MAX_HISTORY);

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

  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

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

        {/* 🔍 검색창 + 검색 기록 팝업 */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative">
          <div className="relative w-full">
            {/* 검색바 */}
            <div
              className={
                'flex w-full items-center bg-[#E5F1FF] border border-[#A9C8FF] px-4 py-1 shadow-sm ' +
                (showHistory
                  ? 'rounded-t-xl rounded-b-none border-b-0'
                  : 'rounded-xl')
              }
            >
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="게시글 검색하기"
                onFocus={openHistory}
                onClick={openHistory} // 포커스 유지 상태에서 다시 클릭해도 열리도록
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

            {/* 검색 기록 팝업 */}
            {showHistory && (
              <div
                className="
                  absolute left-0 right-0 top-full z-40
                  bg-[#E5F1FF] border border-[#A9C8FF] border-t-0
                  rounded-b-xl shadow-sm overflow-hidden
                "
              >
                {/* '최근 검색 기록' + 오른쪽으로 이어지는 구분선 */}
                <div className="flex items-center px-4 py-1 text-[11px] text-[#7BA4F5] border-b border-[#A9C8FF]/40">
                  {/* <span className="mr-2 whitespace-nowrap">최근 검색 기록</span> */}
                  <div className="flex-1 h-px bg-[#A9C8FF]/50" />
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
                        className="
                          flex items-center gap-2 px-4 py-2
                          text-xs sm:text-sm text-[#4B6FBF]
                          hover:bg-[#D7E6FF] cursor-pointer
                        "
                        onMouseDown={(e) => e.preventDefault()} // blur 방지
                        onClick={() => handleClickHistoryItem(item.keyword)}
                      >
                        {/* 이모티콘(Clock)도 반응형 크기로 고정 */}
                        <Clock className="shrink-0 w-3 h-3 sm:w-4 sm:h-4 opacity-70" />
                        <span className="truncate">{item.keyword}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        </form>

        {/* 우측 버튼들 */}
        <div className="flex items-center gap-3">
          {/* ✏️ 글쓰기 버튼 */}
          <Button
            size="lg"
            variant="outline"
            onClick={handleWriteClick}
            className="gap-2 rounded-md bg-gradient-to-r from-[#E4EEFF] to-[#C7DBFF] border-[#9AB8FF] text-black hover:opacity-90 transition-opacity"
          >
            <PenSquare className="w-4 h-4" />
            <span>글쓰기</span>
          </Button>

          {!isLoggedIn ? (
            <>
              {/* 🔑 로그인 버튼 */}
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
