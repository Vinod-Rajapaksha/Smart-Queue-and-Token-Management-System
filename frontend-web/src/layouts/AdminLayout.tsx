import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import TopBar from "../components/common/TopBar";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={closeMobile}
          aria-label="Close sidebar overlay"
        />
      )}

      <div className="flex min-h-screen">
        {/* Sidebar (desktop) */}
        <div className="hidden md:block">
          <Sidebar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((v) => !v)}
          />
        </div>

        {/* Sidebar (mobile drawer) */}
        <div
          className={[
            "fixed z-50 inset-y-0 left-0 md:hidden",
            "transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <Sidebar
            collapsed={false}
            onToggleCollapse={() => {}}
            onNavigate={closeMobile}
          />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <TopBar
            onOpenMobileSidebar={() => setMobileOpen(true)}
            title="Admin Portal"
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((v) => !v)}
          />

          <main className="flex-1 p-4 md:p-6">
            <div className="rounded-2xl border border-gray-800/70 bg-gradient-to-br from-gray-900/40 to-gray-950/20 backdrop-blur-xl shadow-2xl min-h-[calc(100vh-8rem)] p-4 md:p-6">
              <Outlet />
            </div>
          </main>

          <footer className="px-4 md:px-6 py-4 text-center text-xs text-gray-500 border-t border-gray-800/60">
            © 2025 ZeroQ • Audit logging enabled • Secure Admin Console
          </footer>
        </div>
      </div>
    </div>
  );
}
