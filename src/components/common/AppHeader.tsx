import { NavLink } from "react-router";
import { Button, Input } from '../ui';
import { Search, LogIn, PenSquare, User } from 'lucide-react';

// 이 컴포넌트는 Tailwind의 기본 클래스(bg-blue-500 등)를 직접 사용합니다.

function AppHeader() {
  return (
    // 1. 헤더: 흰색 배경에 연한 회색 테두리를 줍니다. (동일)
    <header className="w-full border-b border-gray-200 bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center gap-6">
        {/* 2. 로고: 파란색-하늘색 그라데이션을 적용합니다. */}
        <div className="flex items-center gap-2">
          <div className="w-15 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center text-white font-bold text-lg">
            Whales
          </div>
        </div>

        {/* 3. 검색창: 연한 파란색 배경을 줍니다. */}
        <div className="flex-1 max-w-2xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="게시글 검색..."
            // shadcn/ui의 Input 스타일을 덮어쓰기 위해 bg와 border를 직접 지정합니다.
            className="pl-10 h-11 bg-blue-50 border-blue-200 focus-visible:ring-blue-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* 4. 로그인 버튼: 파란색 테두리 버튼으로 만듭니다. */}
          <Button
            variant="outline" // 기본 'outline' 스타일을 사용하되, 색상을 덮어씌웁니다.
            size="lg"
            className="gap-2 border-blue-400 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          >
            <LogIn className="w-4 h-4" />
            <NavLink to={'/login'}>로그인</NavLink>
          </Button>

          {/* 5. 글쓰기 버튼: 메인 그라데이션을 적용합니다. */}
          <Button
            size="lg"
            // shadcn/ui의 Button 스타일을 덮어쓰기 위해 bg와 text를 직접 지정합니다.
            className="bg-gradient-to-r from-blue-500 to-sky-500 hover:opacity-90 transition-opacity gap-2 text-white"
          >
            <PenSquare className="w-4 h-4" />
            <NavLink to={'/create'}>글쓰기</NavLink>
          </Button>

          {/* 6. 닉네임 버튼: 연한 파란색 배경 버튼으로 만듭니다. */}
          <Button
            variant="secondary" // 기본 'secondary' 스타일을 사용하되, 색상을 덮어씌웁니다.
            size="lg"
            className="gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200"
          >
            <User className="w-4 h-4" />
            <NavLink to={'/mypage'}>닉네임</NavLink>
          </Button>
        </div>
      </div>
    </header>
  );
}

export { AppHeader };
