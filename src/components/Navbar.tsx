import React from "react";
import {
  Flame,
  PlusCircle,
  BarChart3,
  Crosshair,
  Sparkles,
  Target,
  Home,
  User,
  Activity,
  Layers,
} from "lucide-react";
import { PlayerProfile, PlayerAttributes } from "../types";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: PlayerProfile;
  attributes?: PlayerAttributes;
  onOpenProfile: () => void;
  onOpenNewSession: () => void;
  onGoHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  attributes,
  onOpenProfile,
  onOpenNewSession,
  onGoHome,
}) => {
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "court", label: "Court & Heatmap", icon: Crosshair },
    { id: "deepdive", label: "Progress Deep-Dive", icon: Layers },
    { id: "analytics", label: "Trends & Charts", icon: BarChart3 },
    { id: "aicoach", label: "AI Coach & Plan", icon: Sparkles },
    { id: "goals", label: "Goals", icon: Target },
    { id: "history", label: "History", icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80 text-white shadow-2xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Logo */}
          <div
            id="brand-court-metrics-logo"
            className="flex items-center space-x-3 cursor-pointer group transition-transform duration-200 hover:scale-105 active:scale-95"
            onClick={() => {
              if (onGoHome) onGoHome();
              else setActiveTab("home");
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/25 ring-2 ring-orange-400/40 group-hover:ring-orange-300 transition-all duration-300">
              <Flame className="w-6 h-6 text-zinc-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-orange-400 via-amber-300 to-white bg-clip-text text-transparent">
                  Court Metrics
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
                  TRAINING AI
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium hidden sm:block">
                Basketball Progress Engine &bull; Training AI
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs - Completely Horizontal & Expanding on Hover */}
          <nav className="hidden xl:flex items-center space-x-1.5 bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-800/80 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer transform hover:scale-105 active:scale-95 ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 font-black shadow-md shadow-orange-500/25 scale-102"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/80"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isActive ? "text-zinc-950 stroke-[2.5]" : "text-zinc-400 group-hover:text-orange-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action & Player Profile Badge */}
          <div className="flex items-center space-x-2.5">
            {/* Quick Log Session Button with Hover Expansion */}
            <button
              id="quick-log-session-btn"
              onClick={onOpenNewSession}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black text-xs shadow-lg shadow-orange-500/30 transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer ring-1 ring-orange-400/40"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.8]" />
              <span className="hidden sm:inline">Log Session</span>
              <span className="sm:hidden">Log</span>
            </button>

            {/* Player Profile Quick Card with Hover Expansion */}
            <button
              id="player-profile-badge-btn"
              onClick={onOpenProfile}
              className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-orange-500/40 text-left transition-all duration-200 transform hover:scale-105 active:scale-95 group cursor-pointer shadow-md"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center text-zinc-950 font-extrabold text-xs shadow-inner">
                {profile.name ? profile.name.slice(0, 2).toUpperCase() : "PL"}
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-zinc-200 group-hover:text-white">
                    {profile.name || "Player"}
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    OVR {attributes?.overallRating ?? 70}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 flex items-center space-x-1">
                  <span>{profile.position ? profile.position.split(" ")[0] : "PG"}</span>
                  <span>•</span>
                  <span>{profile.dominantHand || "Right"} Hand</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Bar for Laptops / Tablets / Mobile */}
        <div className="xl:hidden flex items-center space-x-1.5 overflow-x-auto py-2.5 border-t border-zinc-900 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 font-black shadow-md shadow-orange-500/20"
                    : "text-zinc-400 hover:text-zinc-200 bg-zinc-900/80 hover:bg-zinc-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

