import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ConfirmDialog from "./ConfirmDialog";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../store/slices/auth.slice";
import { selectAuthUser } from "../../store/selectors/auth.selectors";
import { Menu, X, Bell, Search, Shield, LogOut, UserCircle2 } from "lucide-react";

type TopBarProps = {
  onOpenMobileSidebar: () => void;
  title?: string;
  subtitle?: string;
  onLogout?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

export default function TopBar({
  onOpenMobileSidebar,
  title = "Admin",
  subtitle = "",
  onLogout,
  collapsed = false,
  onToggleCollapse,
  }: TopBarProps) {

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectAuthUser);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleLogoutConfirmed = () => {
    dispatch(logout());
    onLogout?.();
    navigate("/login", { replace: true });
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-gray-800/60 backdrop-blur-xl bg-gradient-to-r from-gray-900/55 to-gray-950/40">

      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile Toggle Button */}
        <button
          className="md:hidden relative p-2 overflow-hidden rounded-xl border border-gray-800 bg-gray-900/40 hover:bg-gray-900/70 transition-all duration-200 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] active:scale-95 cursor-pointer"
          onClick={onOpenMobileSidebar}
          aria-label="Open sidebar"
        >
          <div className="relative w-5 h-5">
            <Menu
              className={[
                "absolute inset-0 w-5 h-5 text-gray-200",
                "transition-all duration-800 ease-in-out",
                collapsed 
                  ? "opacity-0 rotate-90 scale-0" 
                  : "opacity-100 rotate-0 scale-100",
              ].join(" ")}
            />
          </div>
        </button>

        {/* Desktop Toggle Button */}
        <button
          className="hidden md:inline-flex relative p-2.5 overflow-hidden rounded-xl border border-gray-800 bg-gray-900/40 hover:bg-gray-900/70 transition-all duration-200 group hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] active:scale-95 cursor-pointer"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          type="button"
        >
          {/* Hover effect background */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 group-hover:via-cyan-500/10 group-hover:to-cyan-500/5 transition-all duration-300" />
          
          <div className="relative w-5 h-5">
            <Menu
              className={[
                "absolute inset-0 w-5 h-5 text-gray-200",
                "transition-all duration-800 ease-in-out",
                collapsed 
                  ? "opacity-100 rotate-0 scale-100" 
                  : "opacity-0 -rotate-90 scale-0",
              ].join(" ")}
            />
            <X
              className={[
                "absolute inset-0 w-5 h-5 text-gray-200",
                "transition-all duration-800 ease-in-out",
                collapsed 
                  ? "opacity-0 rotate-90 scale-0" 
                  : "opacity-100 rotate-0 scale-100",
              ].join(" ")}
            />
            
            {/* Subtle pulse effect for collapsed state */}
            {collapsed && (
              <div className="absolute -inset-0.5 rounded-full bg-cyan-400/10 blur-sm animate-pulse" />
            )}
          </div>
          
          {/* Tooltip on hover */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            {collapsed ? "Expand sidebar" : "Collapse sidebar"}
          </div>
        </button>

        <div className="leading-tight">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <h1 className="text-white font-semibold">{title}</h1>
          </div>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
      </div>

      {/* Center */}
      <div className="hidden lg:flex items-center w-[520px]">
        <div className="relative w-full group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-0 group-hover:opacity-25 transition duration-300" />
          <div className="relative flex items-center gap-2 bg-gray-900/40 border border-gray-800 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              className="w-full bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-500"
              placeholder="Search branches, queues, tokens..."
            />
            <span className="text-[10px] text-gray-500 border border-gray-700 rounded px-2 py-0.5">
              Search
            </span>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          className="p-2 rounded-xl border border-gray-800 bg-gray-900/40 hover:bg-gray-900/70 transition-all duration-200 group hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] active:scale-95 relative cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-gray-200" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
        </button>
        <button
          onClick={() => navigate("/admin/profile")}
          role="button"
          tabIndex={0}
          className="cursor-pointer"
        >
          <div className="hidden sm:flex items-center gap-2 pl-2">
            <div className="group flex items-center gap-2 p-2 rounded-xl border border-gray-800 bg-gray-900/40 transition-all duration-200 hover:bg-gray-900/70 hover:border-cyan-500/30 hover:shadow-[0_0_18px_rgba(34,211,238,0.15)]">
              <UserCircle2 className="w-5 h-5 text-gray-200 transition group-hover:text-cyan-300" />    
              <div className="leading-tight">
                <div className="text-sm text-white font-medium">
                  {user?.name ?? "Admin"}
                </div>
                <div className="text-xs text-gray-400 transition group-hover:text-gray-300">
                  {user?.email ?? "admin@zeroq.com"}
                </div>
              </div>
            </div>
          </div>
        </button>
        <button
          onClick={() => setConfirmOpen(true)}
          aria-label="Logout"
          type="button"
          className="group p-2 rounded-xl border border-gray-800 bg-gray-900/40 transition-all duration-200 hover:bg-red-500/10 hover:border-red-500/30 hover:shadow-[0_0_18px_rgba(239,68,68,0.2)] active:scale-95 cursor-pointer"
        >
          <LogOut className="w-5 h-5 text-gray-200 transition group-hover:text-red-400" />
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        variant="danger"
        title="Logout?"
        message="Are you sure you want to logout from ZeroQ Admin Console?"
        confirmText="Logout"
        cancelText="Cancel"
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleLogoutConfirmed}
      />

    </header>
  );
}
