import React from "react";
import {
  Crosshair,
  Layers,
  BarChart3,
  Sparkles,
  Target,
  Activity,
  Home,
  Plus,
  Flame,
  User,
  Shield,
  ChevronRight,
  TrendingUp,
  Award,
} from "lucide-react";
import { PlayerProfile, PlayerAttributes } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: PlayerProfile;
  attributes?: PlayerAttributes;
  onOpenProfile: () => void;
  onOpenNewSession: () => void;
  onGoHome?: () => void;
  sessionsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  attributes,
  onOpenProfile,
  onOpenNewSession,
  onGoHome,
  sessionsCount,
}) => {
  const primaryNavItems = [
    {
      id: "court",
      label: "Court & Heatmap",
      description: "16 Angle Zones & Geometry",
      icon: Crosshair,
      badge: "Visual Shot Map",
      badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    },
    {
      id: "deepdive",
      label: "Progress Deep-Dive",
      description: "3PT, Mid-Range & Layups",
      icon: Layers,
      badge: "Equal 3-Tier",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    },
    {
      id: "analytics",
      label: "Trends & Charts",
      description: "Shooting Progress & Radar",
      icon: BarChart3,
      badge: "Analytics",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    },
  ];

  const secondaryNavItems = [
    {
      id: "aicoach",
      label: "AI Coach & 5-Day Plan",
      description: "Actionable Feedback & Drills",
      icon: Sparkles,
      badge: "AI Powered",
      badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    },
    {
      id: "goals",
      label: "Goals & Milestones",
      description: "Track Benchmarks",
      icon: Target,
      badge: "Targets",
      badgeColor: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    },
    {
      id: "history",
      label: "History & Box Scores",
      description: "All Logged Sessions",
      icon: Activity,
      badge: `${sessionsCount} logged`,
      badgeColor: "bg-zinc-800 text-zinc-300 border-zinc-700",
    },
  ];

  return (
    <aside className="w-64 lg:w-72 hidden md:flex flex-col shrink-0 h-screen sticky top-0 bg-zinc-950/95 backdrop-blur-xl border-r border-zinc-800/80 p-4 justify-between z-30 select-none">
      {/* Top Brand & Logo */}
      <div className="space-y-4">
        <div
          id="sidebar-court-metrics-logo"
          onClick={() => {
            if (onGoHome) onGoHome();
            else setActiveTab("home");
          }}
          className="flex items-center space-x-3 p-2 rounded-2xl hover:bg-zinc-900/80 border border-transparent hover:border-zinc-800 transition-all duration-200 cursor-pointer transform hover:scale-[1.02] active:scale-95 group"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/25 ring-2 ring-orange-400/40 group-hover:ring-orange-300 transition-all duration-300 shrink-0">
            <Flame className="w-6 h-6 text-zinc-950 stroke-[2.5]" />
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-base tracking-tight bg-gradient-to-r from-orange-400 via-amber-300 to-white bg-clip-text text-transparent truncate">
                Court Metrics
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                AI
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-medium truncate">
              Basketball Progress Engine
            </p>
          </div>
        </div>

        {/* Quick Action: Log Session Button */}
        <button
          id="sidebar-log-session-btn"
          onClick={onOpenNewSession}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black text-xs shadow-lg shadow-orange-500/25 transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer ring-1 ring-orange-400/50"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Log Workout / Game</span>
        </button>

        {/* Home Screen Button */}
        <button
          id="sidebar-nav-home"
          onClick={() => {
            if (onGoHome) onGoHome();
            else setActiveTab("home");
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 transform hover:scale-102 active:scale-95 cursor-pointer border ${
            activeTab === "home"
              ? "bg-gradient-to-r from-zinc-800 to-zinc-900 text-orange-400 border-orange-500/40 shadow-md"
              : "bg-zinc-900/40 hover:bg-zinc-900 text-zinc-400 hover:text-white border-zinc-900 hover:border-zinc-800"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className={`p-1.5 rounded-xl ${activeTab === "home" ? "bg-orange-500/20 text-orange-400" : "bg-zinc-800 text-zinc-400"}`}>
              <Home className="w-4 h-4" />
            </div>
            <span>Home &amp; Setup</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
        </button>

        {/* Core Navigation Stack Label */}
        <div className="pt-2">
          <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider px-2">
            Main Analytics Stack
          </span>
        </div>

        {/* The 3 Core Stacked Navigation Items requested */}
        <div className="space-y-1.5">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex flex-col p-3 rounded-2xl text-left transition-all duration-200 transform hover:scale-103 active:scale-95 cursor-pointer border relative overflow-hidden group shadow-sm ${
                  isActive
                    ? "bg-gradient-to-r from-orange-500/20 via-zinc-900 to-zinc-900 text-white border-orange-500/60 ring-1 ring-orange-500/40 shadow-orange-500/10"
                    : "bg-zinc-900/70 hover:bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800/80 hover:border-zinc-700"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-orange-400 to-amber-500 rounded-r-full" />
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`p-2 rounded-xl transition-colors ${
                        isActive
                          ? "bg-orange-500 text-zinc-950 shadow-md shadow-orange-500/30 font-black"
                          : "bg-zinc-800/90 text-zinc-300 group-hover:bg-zinc-700 group-hover:text-orange-400"
                      }`}
                    >
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div>
                      <span className={`text-xs font-black block ${isActive ? "text-white" : "text-zinc-200 group-hover:text-white"}`}>
                        {item.label}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium block">
                        {item.description}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Secondary Training Tools Label */}
        <div className="pt-2">
          <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider px-2">
            AI Training &amp; History
          </span>
        </div>

        {/* Secondary Stacked Items */}
        <div className="space-y-1.5">
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-all duration-200 transform hover:scale-102 active:scale-95 cursor-pointer border group ${
                  isActive
                    ? "bg-zinc-900 text-white border-orange-500/50 ring-1 ring-orange-500/30"
                    : "bg-zinc-900/40 hover:bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800/60 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`p-1.5 rounded-xl transition-colors ${
                      isActive ? "bg-orange-500/20 text-orange-400" : "bg-zinc-800/80 text-zinc-400 group-hover:text-zinc-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-bold ${isActive ? "text-white font-black" : "text-zinc-300"}`}>
                    {item.label}
                  </span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Profile Quick Card */}
      <div className="pt-4 border-t border-zinc-800/80">
        <div
          id="sidebar-player-profile-card"
          onClick={onOpenProfile}
          className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-orange-500/40 transition-all duration-200 cursor-pointer transform hover:scale-102 active:scale-95 flex items-center justify-between group shadow-lg"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-red-600 flex items-center justify-center font-black text-zinc-950 text-sm shadow-md shadow-orange-500/20 group-hover:scale-110 transition-transform">
              {profile.name ? profile.name.charAt(0).toUpperCase() : "P"}
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold text-white truncate group-hover:text-orange-400 transition-colors">
                  {profile.name || "Player Profile"}
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 block truncate">
                {profile.position} • {profile.height || "185"}cm
              </span>
            </div>
          </div>
          <div className="px-2 py-1 rounded-lg bg-zinc-950 border border-orange-500/30 text-center">
            <span className="text-[9px] text-orange-400 font-bold block">OVR</span>
            <span className="text-xs font-black text-white">{attributes?.overallRating ?? 70}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
