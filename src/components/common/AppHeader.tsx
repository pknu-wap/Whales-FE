import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button, Input } from "../ui";
import { Search, LogIn, PenSquare } from "lucide-react";
import useAuthStore from "../../stores/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

function AppHeader() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const { user, clearAuth, initializeAuth } = useAuthStore();
  const isLoggedIn = !!user;

  // ✅ 로그인 상태 복원
  useEffect(() => {
    if (typeof initializeAuth === "function") {
      initializeAuth();
    }
  }, [initializeAuth]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/search?query=${encodeURIComponent(q)}`);
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  // ✅ 닉네임 색상 Tailwind 변환 유틸
  const getNicknameColorClass = (color?: string) => {
    if (!color) return "text-gray-700";
    switch (color.toLowerCase()) {
      case "blue":
        return "text-blue-600";
      case "green":
        return "text-green-600";
      case "red":
        return "text-red-600";
      case "purple":
        return "text-purple-600";
      case "gray":
        return "text-gray-600";
      default:
        return "text-gray-700";
    }
  };

  return (
    <header className="w-full border-b border-gray-200 bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center gap-6">
        {/* 로고 */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-15 h-10 rounded-lg bg-linear-to-br from-blue-500 to-sky-500 flex items-center justify-center text-white font-bold text-lg">
            Whales
          </div>
        </div>

        {/* 검색창 */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 cursor-pointer"
            onClick={() => handleSearch()}
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="게시글 검색..."
            className="pl-10 h-11 bg-blue-50 border-blue-200 focus-visible:ring-blue-500"
          />
          <button type="submit" className="hidden" aria-hidden />
        </form>

        {/* 우측 버튼 */}
        <div className="flex items-center gap-3">
          {/* ✅ 글쓰기 버튼: 항상 표시 */}
          <Button
            size="lg"
            className="bg-linear-to-r from-blue-500 to-sky-500 hover:opacity-90 transition-opacity gap-2 text-white"
          >
            <PenSquare className="w-4 h-4" />
            <NavLink to="/create" key="create-link">
              글쓰기
            </NavLink>
          </Button>

          {/* 로그인 상태에 따른 UI */}
          {!isLoggedIn ? (
            <>
              {/* 로그인 버튼 */}
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-blue-400 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
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
                onClick={() => navigate("/mypage")}
              >
                <Avatar className="w-8 h-8 border border-blue-300">
                  {user?.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} alt={user?.displayName ?? ""} />
                  ) : (
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                      {user?.displayName
                        ? user.displayName[0].toUpperCase()
                        : "유"}
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