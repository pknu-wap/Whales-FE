import { AppHeader } from "@/components/common/AppHeader";
import { AppFooter } from "@/components/common/AppFooter";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="app-layout flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}