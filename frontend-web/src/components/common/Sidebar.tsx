import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, GitBranch, Layers3, Users, Star, Ticket, BarChart3, Settings, ListOrdered, Radio } from "lucide-react";

export type NavItem = {
  label: string;
  to: string;
  icon: React.ReactNode;
};

type SidebarProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate?: () => void; 
};

export default function Sidebar({ collapsed, onNavigate }: SidebarProps) {
  const navItems = useMemo<NavItem[]>(
    () => [
      { label: "Dashboard", to: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
      { label: "Branches", to: "/admin/branches", icon: <GitBranch className="w-5 h-5" /> },
      { label: "Counters", to: "/admin/counters", icon: <Layers3 className="w-5 h-5" /> },
      { label: "Queues", to: "/admin/queues", icon: <ListOrdered className="w-5 h-5" /> },
      { label: "Live Queues", to: "/admin/queues/live", icon: <Radio className="w-5 h-5" /> },
      { label: "Tokens", to: "/admin/tokens", icon: <Ticket className="w-5 h-5" /> },
      { label: "Ratings", to: "/admin/ratings", icon: <Star className="w-5 h-5" /> },
      { label: "Analytics", to: "/admin/analytics", icon: <BarChart3 className="w-5 h-5" /> },
      { label: "Users", to: "/admin/users", icon: <Users className="w-5 h-5" /> },
      { label: "Settings", to: "/admin/profile", icon: <Settings className="w-5 h-5" /> },
    ],
    []
  );

  return (
    <aside
      className={[
        "h-full",
        "backdrop-blur-xl bg-gradient-to-b from-gray-900/70 to-gray-950/60",
        "border-r border-gray-800/70",
        "shadow-2xl",
        collapsed ? "w-[84px]" : "w-[200px]",
        "transition-all duration-300 ease-in-out",
      ].join(" ")}
    >
      {/* Brand */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-gray-800/60">
        <div className="flex items-center gap-3 overflow-hidden w-full">
          {/* Logo */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur-lg opacity-60" />
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 p-2 rounded-xl border border-gray-700">
              <span className="text-cyan-400 font-bold">
                <img src="/icon.svg" alt="Logo" className="w-6 h-6" />
              </span>
            </div>
          </div>

          {/* Brand Text */}
          <div 
            className={[
              "leading-tight transition-all duration-300 ease-in-out",
              "overflow-hidden", 
              collapsed 
                ? "w-0 opacity-0 -translate-x-4" 
                : "w-auto opacity-100 translate-x-0"
            ].join(" ")}
          >
            <div className="whitespace-nowrap">
              <div className="text-white font-semibold">ZeroQ</div>
              <div className="text-xs text-gray-400">Admin Console</div>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="p-3 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin" || item.to === "/admin/queues"}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                "group flex items-center gap-3 rounded-xl px-3 py-3",
                "transition-all duration-200 ease-in-out",
                isActive
                  ? "bg-gradient-to-r from-cyan-500/15 to-blue-500/10 border border-cyan-500/20"
                  : "hover:bg-gray-900/40 border border-transparent",
              ].join(" ")
            }
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl blur opacity-0 group-hover:opacity-30 transition bg-gradient-to-r from-cyan-500 to-blue-500" />
              <div className="relative text-gray-300 group-hover:text-white transition">
                {item.icon}
              </div>
            </div>

            {!collapsed && (
              <div className="flex-1 text-sm text-gray-300 group-hover:text-white transition">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
