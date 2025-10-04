import { AppFooter, AppHeader } from "@/components/common";
import { Outlet } from "react-router";

export default function RootLayout() {
  return (
    <div className="page">
      <AppHeader />
      <div className="container">
        <Outlet />
      </div>
      <AppFooter />
    </div>
  );
}

