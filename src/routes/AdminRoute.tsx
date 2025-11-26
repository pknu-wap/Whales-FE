
import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "@/stores/authStore";

export default function AdminRoute() {
  const { user, isAdmin } = useAuthStore();

  // 로그인 안 된 경우 → 로그인 페이지로
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 로그인은 했지만 관리자가 아닌 경우 → 메인으로
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 통과하면 자식 라우트 렌더링
  return <Outlet />;
}
