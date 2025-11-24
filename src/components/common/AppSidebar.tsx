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
import useTagStore from '@/stores/tagStore';

function TailwindSeparator(): React.ReactElement {
  return <hr className="my-3 border-gray-300" />;
}

export function AppSidebar(): React.ReactElement {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTag = searchParams.get('tag');

  const { subscribedTags, hydrate } = useTagStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // 🔥 디폴트 태그 제거 → 유저가 구독한 태그만 사용
  const favoriteTags = subscribedTags.slice(0, 4);

  const navLinkBaseStyle =
    'flex items-center gap-3 font-medium w-full px-3 py-2 rounded-md transition-colors';
  const navLinkActiveStyle = 'bg-blue-200 text-black';
  const navLinkInactiveStyle =
    'text-black/80 hover:bg-blue-100 hover:text-black';

  const tagLinkBaseStyle =
    'flex items-center gap-2 text-sm w-full px-3 py-1.5 rounded-md transition-colors';
  const tagLinkActiveStyle = 'bg-blue-200 text-black';
  const tagLinkInactiveStyle =
    'text-black/70 hover:bg-blue-100 hover:text-black';

  return (
    <div className="sticky top-24 flex gap-2">
      {/* 토글 버튼 */}
      <div className="flex flex-col">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md text-black/80 hover:bg-gray-200 hover:text-black"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* 사이드바 */}
      <aside
        className={`flex flex-col gap-4 rounded-lg shadow-sm transition-all duration-300 ease-in-out
        ${
          isOpen
            ? 'min-w-52 w-52 p-4 border border-gray-300 bg-gray-100'
            : 'w-0 min-w-0 p-0 border-0 opacity-0 overflow-hidden'
        }`}
      >
        {/* 로고 */}
        <div>
          <NavLink to="/">
            <h2 className="text-xl font-bold text-black">카테고리</h2>
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

        {/* ⭐ 즐겨찾기 - 항상 표시, 태그 없으면 안내 문구 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-black">
              즐겨찾기
            </h3>

            <NavLink
              to="/settings/tags"
              className={({ isActive }) =>
                `rounded-md transition-colors flex items-center justify-center
                ${
                  isActive
                    ? 'bg-blue-200 text-black'
                    : 'text-black/80 hover:bg-blue-100 hover:text-black'
                } px-2 py-1`
              }
              aria-label="구독 태그 설정"
            >
              <Settings className="w-6 h-6" />
            </NavLink>
          </div>

          {favoriteTags.length === 0 ? (
            // ✅ 구독한 태그가 없을 때
            <button
              onClick={() => {
                // 필요하면 여기서도 페이지 이동
                // navigate('/settings/tags') 같은 거 쓸 수도 있음
              }}
              className="text-xs text-black/60 px-0 py-1 rounded-md bg-gray-100"
            >
              아직 즐겨찾기 태그가 없습니다.{' '}
              <span className="underline">태그 설정에서 추가해 보아요.</span>
            </button>
          ) : (
            // ✅ 구독한 태그가 있을 때
            <div className="flex flex-col gap-1">
              {favoriteTags.map((tag) => (
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
          )}
        </div>
      </aside>
    </div>
  );
}
