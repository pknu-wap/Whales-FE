import React, { useState } from 'react'; // 1. useState를 import 합니다.
import {
  Home,
  TrendingUp,
  Plus,
  Clock,
  Tag,
  Settings,
  Menu, // 2. 토글 버튼용 'Menu' 아이콘을 import 합니다.
} from 'lucide-react';
import { NavLink } from 'react-router';

// ... (TailwindSeparator 함수는 변경 없음) ...
function TailwindSeparator(): React.ReactElement {
  return <hr className="my-3 border-gray-200" />;
}

export function AppSidebar(): React.ReactElement {
  // 3. 사이드바의 "열림/닫힘" 상태를 관리합니다. (기본값: true)
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const navLinkBaseStyle =
    'flex items-center gap-3 font-medium w-full px-3 py-2 rounded-md transition-colors';
  const navLinkActiveStyle = 'bg-blue-100 text-blue-700';
  const navLinkInactiveStyle =
    'text-gray-600 hover:bg-gray-100 hover:text-gray-900';

  const tagLinkBaseStyle =
    'flex items-center gap-2 text-sm w-full px-3 py-1.5 rounded-md transition-colors';
  const tagLinkActiveStyle = 'font-semibold text-blue-600 bg-blue-50';
  const tagLinkInactiveStyle =
    'text-gray-500 hover:bg-gray-100 hover:text-gray-800';

  return (
    // 4. 전체를 감싸는 부모 div를 만들고, 이 부모가 sticky가 되도록 합니다.
    // 이 div는 버튼과 사이드바 패널을 가로로 정렬합니다.
    <div className="sticky top-24 h-[calc(100vh-6rem)] flex gap-2">
      {/* 5. 토글 버튼 */}
      {/* 이 버튼은 항상 보이며, 사이드바 패널의 상태를 변경합니다. */}
      <div className="flex flex-col">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* 6. 사이드바 패널 (기존 <aside> 코드) */}
      {/* 이 <aside>는 'isOpen' 상태에 따라 너비, 패딩, 테두리가 변경됩니다. */}
      <aside
        className={`
          flex flex-col gap-4 h-full overflow-y-auto bg-white rounded-lg shadow-sm
          transition-all duration-300 ease-in-out
          ${
            isOpen
              ? 'min-w-60 w-60 p-4 border border-gray-200' // 열렸을 때
              : 'w-0 min-w-0 p-0 border-0 opacity-0' // 닫혔을 때 (애니메이션)
          }
        `}
        // 7. 닫혔을 때 스크롤바 등이 보이지 않도록 overflow-hidden을 추가합니다.
        style={{ overflow: isOpen ? 'auto' : 'hidden' }}
      >
        {/* 로고 */}
        <div>
          <NavLink to="/">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-sky-500 bg-clip-text text-transparent">
              카테고리
            </h2>
          </NavLink>
        </div>

        {/* 홈, 최근, 인기 메뉴 */}
        <div className="flex flex-col gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${navLinkBaseStyle} ${
                isActive ? navLinkActiveStyle : navLinkInactiveStyle
              }`
            }
          >
            <Home className="w-5 h-5" />
            <span>홈</span>
          </NavLink>

          <NavLink
            to="/recent"
            className={({ isActive }) =>
              `${navLinkBaseStyle} ${
                isActive ? navLinkActiveStyle : navLinkInactiveStyle
              }`
            }
          >
            <Clock className="w-5 h-5" />
            <span>최근</span>
          </NavLink>

          <NavLink
            to="/trending"
            className={({ isActive }) =>
              `${navLinkBaseStyle} ${
                isActive ? navLinkActiveStyle : navLinkInactiveStyle
              }`
            }
          >
            <TrendingUp className="w-5 h-5" />
            <span>인기</span>
          </NavLink>
        </div>

        <TailwindSeparator />

        {/* 즐겨찾기 */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-gray-800">즐겨찾기</h3>
          <div className="flex flex-col gap-1">
            <NavLink
              to="/search?tag=리액트"
              className={({ isActive }) =>
                `${tagLinkBaseStyle} ${
                  isActive ? tagLinkActiveStyle : tagLinkInactiveStyle
                }`
              }
            >
              <Tag className="w-4 h-4" />
              <span>리액트</span>
            </NavLink>
            <NavLink
              to="/search?tag=스프링부트"
              className={({ isActive }) =>
                `${tagLinkBaseStyle} ${
                  isActive ? tagLinkActiveStyle : tagLinkInactiveStyle
                }`
              }
            >
              <Tag className="w-4 h-4" />
              <span>스프링부트</span>
            </NavLink>
            <NavLink
              to="/search?tag=채용"
              className={({ isActive }) =>
                `${tagLinkBaseStyle} ${
                  isActive ? tagLinkActiveStyle : tagLinkInactiveStyle
                }`
              }
            >
              <Tag className="w-4 h-4" />
              <span>채용</span>
            </NavLink>
          </div>
        </div>

        <TailwindSeparator />

        {/* 구독 태그 설정 */}
        <NavLink
          to="/settings/tags"
          className={({ isActive }) =>
            `${navLinkBaseStyle} ${
              isActive ? navLinkActiveStyle : navLinkInactiveStyle
            }`
          }
        >
          <Settings className="w-5 h-5" />
          <span>구독 태그 설정</span>
        </NavLink>

        <TailwindSeparator />

        {/* 새 게시판 만들기 */}
        <NavLink
          to="/create-board"
          className={({ isActive }) =>
            `flex items-center justify-center gap-2 w-full px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors ${
              isActive
                ? 'bg-blue-100 text-blue-700 border-blue-300 font-medium'
                : ''
            }`
          }
        >
          <Plus className="w-4 h-4" />
          <span>새 게시판 만들기</span>
        </NavLink>
      </aside>
    </div>
  );
}
