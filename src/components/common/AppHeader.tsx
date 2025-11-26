// src/components/common/AppHeader.tsx

import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Button, Input } from '../ui';
import { Search, LogIn, PenSquare, Clock, LogOut, X } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
// import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

import WhalesLogo from '@/assets/Whales.svg';
import AlarmButton from '@/assets/AlarmButton.svg';
import ChatButton from '@/assets/ChatButton.svg';

// Search API
import type { SearchHistoryItem } from '@/services/api';
import type { NotificationItem } from '@/services/api';
import {
  getSearchHistory,
  getUnreadNotificationCount,
  getUnreadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteAllSearchHistory,       // 🔴 추가
  deleteSearchHistoryItem,
} from '@/services/api';

function AppHeader() {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0); // 🔔 안 읽은 알림 개수

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  // 🔔 알림 드롭다운용
  const [isAlarmOpen, setIsAlarmOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const alarmMenuRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const { user, clearAuth, initializeAuth } = useAuthStore();
  const isLoggedIn = !!user;

  const hiddenPaths = ['/login', '/auth/callback'];

  // ✅ 로그인 상태 복원
  useEffect(() => {
    if (typeof initializeAuth === 'function') {
      initializeAuth();
    }
  }, [initializeAuth]);

  // ✅ 로그인 상태일 때 알림 개수 가져오기
  useEffect(() => {
    if (!isLoggedIn) {
      setUnreadCount(0);
      return;
    }

    const fetchUnread = async () => {
      try {
        const count = await getUnreadNotificationCount();
        setUnreadCount(count);
      } catch (e) {
        console.error('unread notifications 불러오기 실패', e);
      }
    };

    fetchUnread();
  }, [isLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      // 프로필 메뉴 안이면 무시
      if (profileMenuRef.current?.contains(target)) return;
      // 알림 메뉴 안이면 무시
      if (alarmMenuRef.current?.contains(target)) return;

      setIsProfileMenuOpen(false);
      setIsAlarmOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🔍 검색 실행 (/search?keyword=...)
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const keyword = query.trim();
    if (!keyword) return;

    navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
    setShowHistory(false);
  };

  // ✅ 검색창 포커스/클릭 시 기록 팝업 + history 호출
  const openHistory = async () => {
    setShowHistory(true);
    if (!isLoggedIn) return;

    try {
      const items = await getSearchHistory();
      setHistory(items);
    } catch (err) {
      console.error('검색 기록 불러오기 실패', err);
    }
  };

  // ✅ blur 시 살짝 딜레이 후 닫기
  const handleBlurSearch = () => {
    setTimeout(() => setShowHistory(false), 120);
  };

  // ✅ 검색 기록 클릭 시
  const handleClickHistoryItem = (keyword: string) => {
    setQuery(keyword);
    setShowHistory(false);
    navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
  };

  // ✅ 입력된 키워드를 토큰으로 쪼개서 태그/텍스트 칩 표시
  const keywordParts = query.trim().length
    ? query.trim().split(/\s+/).filter(Boolean)
    : [];

  const handleDeleteHistoryItem = async (id: string) => {
    try {
      await deleteSearchHistoryItem(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error('검색 기록 단일 삭제 실패', err);
    }
  };

  // 🔴 검색 기록 전체 삭제
  const handleClearAllHistory = async () => {
    try {
      await deleteAllSearchHistory();
      setHistory([]);
    } catch (err) {
      console.error('검색 기록 전체 삭제 실패', err);
    }
  };


  // ✅ 닉네임 색상 Tailwind 변환
  // 프로필 동그라미 테두리 색 (회원 등급용)
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

  // 🔔 알림 버튼 클릭 – 일단 알림 페이지로 이동(추후 드롭다운으로 바꿔도 됨)
  const handleAlarmClick = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    // 이미 열려 있으면 닫기
    if (isAlarmOpen) {
      setIsAlarmOpen(false);
      return;
    }

    // 열면서 알림 불러오기
    setIsAlarmOpen(true);
    try {
      // 내 글/댓글에 달린 댓글 알림은 백엔드에서 필터해 주는 걸 전제로 함
      const list = await getUnreadNotifications(); // 또는 getNotifications()
      setNotifications(list);

      // 열면서 모두 읽음 처리 (원하면 주석 처리해도 됨)
      if (list.length > 0) {
        await markAllNotificationsRead();
        setUnreadCount(0);
      }
    } catch (e) {
      console.error('알림 불러오기 실패', e);
    }
  };

  const handleClickNotification = async (item: NotificationItem) => {
    try {
      if (!item.read) {
        await markNotificationRead(item.id);
      }
    } catch (e) {
      console.error('알림 읽음 처리 실패', e);
    }

    setIsAlarmOpen(false);

    // 내 댓글에 달린 댓글이니까 해당 게시글로 이동
    // 필요하면 #comment-아이디 같은 앵커는 나중에 댓글 컴포넌트에서 맞춰주면 됨
    navigate(`/post/${item.postId}`);
  };

  // 💬 채팅 버튼 클릭 – 지금은 이미지만, 나중에 /chat 같은 라우트 연결 가능
  const handleChatClick = () => {
    // 예: navigate('/chat');
    console.log('chat button clicked');
  };

  // 로그인 페이지 등에서는 헤더 숨김
  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <header className="w-full border-b border-gray-200 bg-gray-100 shadow-sm fixed left-0 top-0 z-50">
      {/* ✅ 전체 폭 1080px + 좌/우 정렬 */}
      <div className="max-w-[1300px] mx-auto px-6 py-3 flex items-center justify-between gap-6">
        {/* 로고 - 항상 왼쪽 */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <img src={WhalesLogo} alt="Whales 로고" className="h-10 w-auto" />
        </div>

        {/* 오른쪽 영역(검색 + 버튼들) */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          {/* 🔍 검색창 + 검색 기록 팝업 */}
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-[600px] relative"
          >
            <div className="relative w-full">
              {/* 검색바, U를 뒤집은 것 ㅅ을 꾸미기 */}
              <div
                className={
                  'flex w-full items-center bg-[#E5F1FF] border border-[#7BA4F5] px-4 py-1 ' +
                  (showHistory
                    ? 'rounded-t-xl rounded-b-none border-b-transparent'
                    : 'rounded-xl')
                }
              >
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="게시글 검색하기"
                  onFocus={openHistory}
                  onClick={openHistory}
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

              {/* 검색 기록 팝업, U 페이지 검색바 아래 꾸미기 */}
              {showHistory && (
                <div
                  className="
                  absolute left-0 right-0 top-full z-40
                  bg-[#E5F1FF] border border-[#7BA4F5] border-t-0
                  rounded-b-xl overflow-hidden
                "
                >
                  {/* 상단: 입력 중인 키워드 태그/텍스트 칩 */}
                  {keywordParts.length > 0 && (
                    <div className="px-4 pt-2 pb-1 flex flex-wrap gap-2 text-xs">
                      {keywordParts.map((part, idx) => {
                        const isTag = part.startsWith('#') && part.length > 1;
                        const label = isTag ? part.slice(1) : part;
                        return (
                          <span
                            key={`${part}-${idx}`}
                            className={
                              'px-2 py-0.5 rounded-full border ' +
                              (isTag
                                ? 'bg-[#C7DBFF] border-[#9AB8FF] text-[#1D4ED8] font-medium'
                                : 'bg-white border-[#CBD5F5] text-[#4B6FBF]')
                            }
                          >
                            {isTag ? `#${label}` : label}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* 🔴 헤더: 최근 검색 기록 + 전체 삭제 버튼 */}
                  <div className="px-4 pt-1 pb-1 flex items-center justify-between text-[11px] text-[#4B6FBF]">
                    <span className="font-semibold">최근 검색 기록</span>
                    {history.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAllHistory}
                        className="text-[11px] text-[#7BA4F5] hover:text-[#1D4ED8] hover:underline"
                      >
                        전체 삭제
                      </button>
                    )}
                  </div>

                  {/* 구분선 */}
                  <div className="mx-4 mt-1 mb-1 h-px bg-[#7BA4F5]" />

                  {/* 최근 검색 기록 리스트 */}
                  <ul className="max-h-64 overflow-y-auto">
                    {history.length === 0 ? (
                      <li className="px-4 py-2 text-xs text-[#7BA4F5]/70">
                        최근 검색 기록이 없습니다.
                      </li>
                    ) : (
                      history.map((item) => (
                        <li
                          key={item.id}
                          className="
          flex items-center px-4 py-2
          text-xs sm:text-sm text-[#4B6FBF]
          hover:bg-[#D7E6FF] cursor-pointer
        "
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleClickHistoryItem(item.keyword)}
                        >
                          {/* 왼쪽: 시계 + 키워드 (flex-1로 영역 차지) */}
                          <div className="flex items-center gap-2 flex-1">
                            <Clock className="shrink-0 w-3 h-3 sm:w-4 sm:h-4 opacity-70" />
                            <span className="truncate">{item.keyword}</span>
                          </div>

                          {/* 오른쪽: X 버튼 (오른쪽 정렬) */}
                          <button
                            type="button"
                            className="p-1 rounded-full hover:bg-[#C7DBFF]"
                            onMouseDown={(e) => e.preventDefault()} // blur 방지
                            onClick={(e) => {
                              e.stopPropagation();          // 검색 실행 막기
                              handleDeleteHistoryItem(item.id);
                            }}
                          >
                            <X className="w-3 h-3 text-[#7BA4F5]" />
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>
          </form>

          {/* 우측 영역: 글쓰기 + Chat + Alarm + My + 프로필/로그인 */}
          <div className="flex items-center gap-3">
            {/* ✏️ 글쓰기 버튼 */}
            <Button
              size="lg"
              variant="outline"
              onClick={handleWriteClick}
              className="
  gap-2
  px-6 py-2
  rounded-md
  border border-[#9AB8FF]
  bg-gradient-to-r from-[#80aaf8] via-[#bcd4ff] to-[#E4EEFF]
  font-bold text-black
  shadow-sm
  hover:brightness-105
  transition
"
            >
              <PenSquare className="w-4 h-4" />
              <span>글쓰기</span>
            </Button>

            {/* 💬 Chat 아이콘 */}
            <button
              type="button"
              onClick={handleChatClick}
              className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-blue-50"
            >
              <img src={ChatButton} alt="채팅" className="w-8 h-8" />
            </button>

            {/* 🔔 Alarm 아이콘 + 드롭다운 */}
            <div ref={alarmMenuRef} className="relative">
              <button
                type="button"
                onClick={handleAlarmClick}
                className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-blue-50"
              >
                <img src={AlarmButton} alt="알림" className="w-8 h-8" />
                {unreadCount > 0 && (
                  <span
                    className="
                    absolute -top-1 -right-1
                    min-w-[16px] h-4 px-1
                    rounded-full bg-red-500 text-white
                    text-[10px] flex items-center justify-center
                  "
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isAlarmOpen && (
                <div
                  className="
                  absolute right-0 mt-2 w-80
                  rounded-2xl bg-white
                  shadow-lg border border-gray-100
                  py-2 z-50
                "
                >
                  <div className="px-3 pb-2 text-xs font-semibold text-gray-500">
                    알림
                  </div>
                  <ul className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <li className="px-3 py-3 text-xs text-gray-400">
                        새 알림이 없습니다.
                      </li>
                    ) : (
                      notifications.map((n) => (
                        <li
                          key={n.id}
                          onClick={() => handleClickNotification(n)}
                          className="
                          px-3 py-2 cursor-pointer
                          hover:bg-gray-50
                          flex flex-col gap-0.5
                        "
                        >
                          <div className="text-xs text-gray-500">
                            {n.senderName}
                          </div>
                          <div className="text-sm text-gray-900">
                            {n.message}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {new Date(n.createdAt).toLocaleString('ko-KR')}
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* 로그인 상태에 따른 UI */}
            {!isLoggedIn ? (
              <Button
                size="lg"
                className="gap-2 rounded-md bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-black hover:brightness-110 transition"
              >
                <LogIn className="w-4 h-4" />
                <NavLink to="/login" key="login-link">
                  로그인
                </NavLink>
              </Button>
            ) : (
              <>
                {/* 🔽 프로필(웨) + 드롭다운 메뉴 */}
                <div ref={profileMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                    className={`
      flex items-center justify-center
      w-10 h-10 rounded-full
      border-[5px] ${getProfileBorderClass(
                      user?.nicknameColor
                    )}  /* ✅ 테두리 색 동적 적용 */
      bg-white text-gray-900 font-black text-[1.3rem]
      shadow-sm hover:bg-gray-50
    `}
                  >
                    {user?.displayName
                      ? user.displayName[0]
                      : user?.email
                        ? user.email[0].toUpperCase()
                        : '유'}
                  </button>

                  {isProfileMenuOpen && (
                    <div
                      className="
                      absolute left-0 mt-2 w-40
                      rounded-2xl bg-white
                      shadow-lg border border-gray-100
                      py-2 z-50
                    "
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          navigate('/mypage');
                        }}
                        className="
                        flex w-full items-center
                        px-4 py-2 text-sm text-gray-800
                        hover:bg-gray-50
                      "
                      >
                        <span
                          className="
                          mr-2
    inline-flex items-center justify-center  /* 가운데 정렬 */
    
    w-5 h-5                                  /* 정사각형 크기 */
    text-[8px]
    border-[1.6px] border-gray-900          /* 진한 테두리 */
    rounded-md                              
    font-semibold
    bg-white
                        "
                        >
                          My
                        </span>
                        <span>마이페이지</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="
                        flex w-full items-center
                        px-3 py-2 text-sm text-gray-800
                        hover:bg-gray-50
                      "
                      >
                        <LogOut className="mr-2 w-6 h-4" />
                        <span>로그아웃</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export { AppHeader };
