// AppSidebar.tsx
import React, { useState, useEffect } from 'react';
import {
  Home,
  TrendingUp,
  Clock,
  Tag,
  Settings,
  Menu,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTagStore } from '@/stores/tagStore'; // ✅ 추가

function TailwindSeparator(): React.ReactElement {
  return <hr className="my-3 border-gray-200" />;
}

export function AppSidebar(): React.ReactElement {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTag = searchParams.get('tag');

  // ✅ 전역 태그 스토어에서 구독
  const { subscribedTags, hydrate } = useTagStore();

  // 처음 마운트될 때 localStorage → store 로 복원
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const defaultFavoriteTags = ['리액트', '스프링부트', '채용'];

  // ✅ 실제 즐겨찾기: 구독 태그 있으면 그걸, 없으면 기본. 최대 4개
  const favoriteTags = (subscribedTags.length > 0
    ? subscribedTags
    : defaultFavoriteTags
  ).slice(0, 4);

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
    <div className="sticky top-24 h-[calc(100vh-6rem)] flex gap-2">
      {/* 토글 버튼 */}
      <div className="flex flex-col">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* 사이드바 패널 */}
      <aside
        className={`
          flex flex-col gap-4 h-full overflow-y-auto bg-white rounded-lg shadow-sm
          transition-all duration-300 ease-in-out
          ${
            isOpen
              ? 'min-w-60 w-60 p-4 border border-gray-200'
              : 'w-0 min-w-0 p-0 border-0 opacity-0'
          }
        `}
        style={{ overflow: isOpen ? 'auto' : 'hidden' }}
      >
        {/* 로고 */}
        <div>
          <NavLink to="/">
            <h2 className="text-2xl font-bold bg-linear-to-r from-blue-500 to-sky-500 bg-clip-text text-transparent">
              카테고리
            </h2>
          </NavLink>
        </div>

        {/* 홈 / 최근 / 인기 */}
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
        {favoriteTags.length > 0 && (
          <>
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-gray-800">
                즐겨찾기
              </h3>
              <div className="flex flex-col gap-1">
                {favoriteTags.map((tag: string) => (
                  <NavLink
                    key={tag}
                    to={`/search?tag=${encodeURIComponent(tag)}`}
                    className={() =>
                      `${tagLinkBaseStyle} ${
                        activeTag === tag
                          ? tagLinkActiveStyle
                          : tagLinkInactiveStyle
                      }`
                    }
                  >
                    <Tag className="w-4 h-4" />
                    <span>{tag}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            <TailwindSeparator />
          </>
        )}

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
        {/* 추후에 논의 하겠음 */}
        {/*<NavLink
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
        </NavLink>*/}
      </aside>
    </div>
  );
}
