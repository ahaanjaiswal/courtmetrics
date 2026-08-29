import React, { useState } from "react";
import {
  Crosshair,
  Zap,
  Shield,
  HelpCircle,
  Info,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
  Plus,
  Flame,
  RotateCcw,
  Sparkles,
  Filter,
  Check,
  X,
} from "lucide-react";
import { TrainingSession } from "../types";
import { aggregateAllZones, ZoneAnalysis } from "../utils/basketballStats";

interface CourtHeatmapProps {
  sessions: TrainingSession[];
  onOpenLogSession?: () => void;
  onQuickSimulateShot?: (zoneId: string, isMade: boolean) => void;
}

export const CourtHeatmap: React.FC<CourtHeatmapProps> = ({ sessions, onOpenLogSession }) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>("3pt-top");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<"All" | "3PT" | "Mid-Range" | "Layup">("All");
  const [quickShotSim, setQuickShotSim] = useState<{ [zoneId: string]: { made: number; attempted: number } }>({});
  const [simAlert, setSimAlert] = useState<string | null>(null);

  const baseZones = aggregateAllZones(sessions);

  // Merge with any active interactive test shots if user clicked simulator buttons
  const zones: ZoneAnalysis[] = baseZones.map((z) => {
    const sim = quickShotSim[z.id];
    if (!sim) return z;
    const totalMade = z.made + sim.made;
    const totalAttempted = z.attempted + sim.attempted;
    const percentage = totalAttempted > 0 ? Number(((totalMade / totalAttempted) * 100).toFixed(1)) : 0;
    let ratingTier: ZoneAnalysis["ratingTier"] = z.ratingTier;
    if (z.category === "3PT") {
      ratingTier = percentage >= 45 ? "Hot / Elite" : percentage >= 36 ? "Consistent" : percentage >= 28 ? "Needs Work" : "Cold";
    } else if (z.category === "Layup") {
      ratingTier = percentage >= 75 ? "Hot / Elite" : percentage >= 62 ? "Consistent" : percentage >= 50 ? "Needs Work" : "Cold";
    } else {
      ratingTier = percentage >= 55 ? "Hot / Elite" : percentage >= 42 ? "Consistent" : percentage >= 30 ? "Needs Work" : "Cold";
    }
    return {
      ...z,
      made: totalMade,
      attempted: totalAttempted,
      percentage,
      ratingTier,
    };
  });

  const selectedZone = zones.find((z) => z.id === selectedZoneId) || zones[0];

  // Quick Live Simulator for Testing Zone Accuracy Interactively
  const handleSimulate = (isMade: boolean) => {
    setQuickShotSim((prev) => {
      const cur = prev[selectedZoneId] || { made: 0, attempted: 0 };
      return {
        ...prev,
        [selectedZoneId]: {
          made: cur.made + (isMade ? 1 : 0),
          attempted: cur.attempted + 1,
        },
      };
    });
    setSimAlert(isMade ? "🎯 SHOT MADE! +1 Score" : "❌ MISSED! Rep Recorded");
    setTimeout(() => setSimAlert(null), 2000);
  };

  const handleResetSim = () => {
    setQuickShotSim({});
    setSimAlert("Reset interactive session test shots.");
    setTimeout(() => setSimAlert(null), 2000);
  };

  // Helper to color SVG zone based on accuracy
  const getZoneColor = (zoneId: string) => {
    const z = zones.find((item) => item.id === zoneId);
    if (!z || z.attempted === 0) return "rgba(63, 63, 70, 0.4)"; // zinc-700 transparent

    if (z.category === "3PT") {
      if (z.percentage >= 45) return "rgba(239, 68, 68, 0.88)"; // Red hot
      if (z.percentage >= 36) return "rgba(249, 115, 22, 0.88)"; // Orange
      if (z.percentage >= 28) return "rgba(234, 179, 8, 0.8)"; // Amber
      return "rgba(59, 130, 246, 0.8)"; // Icy Blue
    } else if (z.category === "Layup") {
      if (z.percentage >= 75) return "rgba(239, 68, 68, 0.88)";
      if (z.percentage >= 62) return "rgba(249, 115, 22, 0.88)";
      return "rgba(59, 130, 246, 0.8)";
    } else {
      if (z.percentage >= 55) return "rgba(239, 68, 68, 0.88)";
      if (z.percentage >= 42) return "rgba(249, 115, 22, 0.88)";
      return "rgba(59, 130, 246, 0.8)";
    }
  };

  const getZoneStat = (zoneId: string) => {
    return zones.find((z) => z.id === zoneId) || { percentage: 0, made: 0, attempted: 0 };
  };

  const filteredZones = activeCategoryFilter === "All" ? zones : zones.filter((z) => z.category === activeCategoryFilter);

  // Find top hot zone & cold zone
  const threePtZones = zones.filter((z) => z.category === "3PT" && z.attempted > 0);
  const bestThreeZone = [...threePtZones].sort((a, b) => b.percentage - a.percentage)[0];
  const lowestThreeZone = [...threePtZones].sort((a, b) => a.percentage - b.percentage)[0];

  return (
    <div className="space-y-6 text-white">
      {/* Zero Session Prompt Banner if no sessions yet */}
      {sessions.length === 0 && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-orange-400 font-bold text-sm">
              <Flame className="w-5 h-5" />
              <span>Ready to Map Your Real Shot Angles?</span>
            </div>
            <p className="text-xs text-zinc-300 max-w-xl">
              You haven&apos;t logged any training sessions yet. Click below to enter your practice makes or game box score. All 16 court heatmap zones, angle tiers, and mechanic diagnostics will calculate dynamically from your real shots!
            </p>
          </div>
          {onOpenLogSession && (
            <button
              id="heatmap-log-first-session-btn"
              onClick={onOpenLogSession}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black text-xs shadow-lg shadow-orange-500/25 flex items-center space-x-2 shrink-0 cursor-pointer transform hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Log Your First Workout</span>
            </button>
          )}
        </div>
      )}

      {/* Top Banner & Hotspot Highlights with Expanding Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setSelectedZoneId(bestThreeZone ? bestThreeZone.id : "3pt-top")}
          className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 shadow-xl cursor-pointer transform hover:scale-103 active:scale-95 transition-all group"
        >
          <div className="flex items-center space-x-2 text-orange-400 mb-1.5">
            <Crosshair className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Perimeter Hotspot</span>
          </div>
          <div className="text-lg font-black text-white flex items-center justify-between">
            <span className="group-hover:text-orange-400 transition-colors">
              {bestThreeZone ? bestThreeZone.name : "Perimeter Sweet Spot"}
            </span>
            <span className="text-sm px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-black">
              {bestThreeZone ? `${bestThreeZone.percentage}%` : "58%"}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1.5">
            {bestThreeZone
              ? `Highest accuracy perimeter angle (${bestThreeZone.degreeTag}) with ${bestThreeZone.made} makes.`
              : "0°, 45°, 90° angle tracking accurately calculated from makes & attempts."}
          </p>
        </div>

        <div
          onClick={() => setSelectedZoneId(lowestThreeZone ? lowestThreeZone.id : "3pt-corner-left")}
          className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 shadow-xl cursor-pointer transform hover:scale-103 active:scale-95 transition-all group"
        >
          <div className="flex items-center space-x-2 text-blue-400 mb-1.5">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Focus / Growth Area</span>
          </div>
          <div className="text-lg font-black text-white flex items-center justify-between">
            <span className="group-hover:text-blue-400 transition-colors">
              {lowestThreeZone ? lowestThreeZone.name : "Corner & Wing Focus"}
            </span>
            <span className="text-sm px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-black">
              {lowestThreeZone ? `${lowestThreeZone.percentage}%` : "38%"}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1.5">
            {lowestThreeZone
              ? `Angle needing repetition priority (${lowestThreeZone.degreeTag}).`
              : "Identifies weak-side 0° corners or 45° wing shooting gaps."}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-400">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Interactive Court</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
              Live Clicker
            </span>
          </div>
          <div className="text-lg font-black text-white flex items-center justify-between">
            <span>16 Shot Sectors</span>
            <span className="text-xs font-bold text-orange-400">Click any zone below</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Click zones on the half-court or use the live test buttons to check real-time accuracy percentages.
          </p>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center: The Visual Half Court (7 cols) */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl flex flex-col items-center">
          {/* Header Controls with Category Filter Pills */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping"></span>
              <h3 className="text-sm font-black text-zinc-200">Interactive Half-Court Shot Heatmap</h3>
            </div>

            {/* Filter Buttons with Hover Expansion */}
            <div className="flex items-center space-x-1.5 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 text-xs font-bold">
              {(["All", "3PT", "Mid-Range", "Layup"] as const).map((filter) => (
                <button
                  key={filter}
                  id={`heatmap-filter-${filter.toLowerCase()}`}
                  onClick={() => setActiveCategoryFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer transform hover:scale-105 active:scale-95 ${
                    activeCategoryFilter === filter
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 font-black shadow-md shadow-orange-500/20"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Court Container */}
          <div className="relative w-full max-w-[540px] aspect-[10/9] bg-[#141416] rounded-2xl border-2 border-zinc-800 p-2 shadow-2xl overflow-hidden flex items-center justify-center">
            {/* Court Wood Texture Accent Grid */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <svg viewBox="0 0 500 470" className="w-full h-full select-none">
              {/* Outer Court Boundary */}
              <rect x="10" y="10" width="480" height="450" fill="none" stroke="#3f3f46" strokeWidth="2.5" />

              {/* Baseline at top (y=10) */}
              <line x1="10" y1="10" x2="490" y2="10" stroke="#71717a" strokeWidth="3" />

              {/* Half Court Line at bottom (y=460) */}
              <line x1="10" y1="460" x2="490" y2="460" stroke="#52525b" strokeWidth="2" />
              <circle cx="250" cy="460" r="60" fill="none" stroke="#52525b" strokeWidth="2" />

              {/* The Key / Paint */}
              <rect x="170" y="10" width="160" height="190" fill="#1f1f23" stroke="#71717a" strokeWidth="2" />
              {/* Free Throw Circle (Top & Dashed Bottom) */}
              <circle cx="250" cy="200" r="60" fill="none" stroke="#71717a" strokeWidth="2" />
              <line x1="170" y1="200" x2="330" y2="200" stroke="#71717a" strokeWidth="2" strokeDasharray="4 4" />

              {/* Backboard & Rim */}
              <line x1="220" y1="40" x2="280" y2="40" stroke="#ffffff" strokeWidth="4" />
              <circle cx="250" cy="55" r="15" fill="none" stroke="#f97316" strokeWidth="3" />
              <line x1="250" y1="40" x2="250" y2="48" stroke="#f97316" strokeWidth="3" />
              {/* Restricted Area Arc */}
              <path d="M 210,40 A 40,40 0 0,0 290,40" fill="none" stroke="#71717a" strokeWidth="2" />

              {/* 3-Point Line (Corners & Arc) */}
              {/* Left corner straight line (0°) */}
              <line x1="45" y1="10" x2="45" y2="140" stroke="#a1a1aa" strokeWidth="2.5" />
              {/* Right corner straight line (0°) */}
              <line x1="455" y1="10" x2="455" y2="140" stroke="#a1a1aa" strokeWidth="2.5" />
              {/* Arc connecting corner lines */}
              <path
                d="M 45,140 A 235,235 0 0,0 455,140"
                fill="none"
                stroke="#a1a1aa"
                strokeWidth="2.5"
              />

              {/* ================= INTERACTIVE ZONES ================= */}

              {/* 1. 3PT 0° Left Corner */}
              <g
                id="court-zone-3pt-corner-left"
                className="cursor-pointer transition-all duration-150 hover:opacity-100"
                onClick={() => setSelectedZoneId("3pt-corner-left")}
              >
                <rect
                  x="12"
                  y="12"
                  width="33"
                  height="128"
                  rx="4"
                  fill={getZoneColor("3pt-corner-left")}
                  stroke={selectedZoneId === "3pt-corner-left" ? "#ffffff" : "#f97316"}
                  strokeWidth={selectedZoneId === "3pt-corner-left" ? "3" : "1"}
                  opacity="0.85"
                />
                <text x="28" y="65" fill="#ffffff" fontSize="11" fontWeight="900" textAnchor="middle">
                  0°
                </text>
                <text x="28" y="80" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                  {getZoneStat("3pt-corner-left").percentage}%
                </text>
              </g>

              {/* 2. 3PT 45° Left Wing */}
              <g
                id="court-zone-3pt-wing-left"
                className="cursor-pointer transition-all duration-150"
                onClick={() => setSelectedZoneId("3pt-wing-left")}
              >
                <path
                  d="M 45,140 A 235,235 0 0,0 175,275 L 145,335 A 290,290 0 0,1 12,140 Z"
                  fill={getZoneColor("3pt-wing-left")}
                  stroke={selectedZoneId === "3pt-wing-left" ? "#ffffff" : "#f97316"}
                  strokeWidth={selectedZoneId === "3pt-wing-left" ? "3" : "1"}
                  opacity="0.85"
                />
                <text x="95" y="240" fill="#ffffff" fontSize="12" fontWeight="900" textAnchor="middle">
                  45° L
                </text>
                <text x="95" y="256" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                  {getZoneStat("3pt-wing-left").percentage}%
                </text>
              </g>

              {/* 3. 3PT 90° Top of Key - Aligned outside apex */}
              <g
                id="court-zone-3pt-top"
                className="cursor-pointer transition-all duration-150"
                onClick={() => setSelectedZoneId("3pt-top")}
              >
                <path
                  d="M 175,275 A 235,235 0 0,0 325,275 L 355,335 A 290,290 0 0,1 145,335 Z"
                  fill={getZoneColor("3pt-top")}
                  stroke={selectedZoneId === "3pt-top" ? "#ffffff" : "#f97316"}
                  strokeWidth={selectedZoneId === "3pt-top" ? "3" : "1"}
                  opacity="0.85"
                />
                <text x="250" y="312" fill="#ffffff" fontSize="12" fontWeight="900" textAnchor="middle">
                  90° TOP
                </text>
                <text x="250" y="328" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                  {getZoneStat("3pt-top").percentage}%
                </text>
              </g>

              {/* 4. 3PT 45° Right Wing */}
              <g
                id="court-zone-3pt-wing-right"
                className="cursor-pointer transition-all duration-150"
                onClick={() => setSelectedZoneId("3pt-wing-right")}
              >
                <path
                  d="M 325,275 A 235,235 0 0,0 455,140 L 488,140 A 290,290 0 0,1 355,335 Z"
                  fill={getZoneColor("3pt-wing-right")}
                  stroke={selectedZoneId === "3pt-wing-right" ? "#ffffff" : "#f97316"}
                  strokeWidth={selectedZoneId === "3pt-wing-right" ? "3" : "1"}
                  opacity="0.85"
                />
                <text x="405" y="240" fill="#ffffff" fontSize="12" fontWeight="900" textAnchor="middle">
                  45° R
                </text>
                <text x="405" y="256" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                  {getZoneStat("3pt-wing-right").percentage}%
                </text>
              </g>

              {/* 5. 3PT 0° Right Corner */}
              <g
                id="court-zone-3pt-corner-right"
                className="cursor-pointer transition-all duration-150"
                onClick={() => setSelectedZoneId("3pt-corner-right")}
              >
                <rect
                  x="455"
                  y="12"
                  width="33"
                  height="128"
                  rx="4"
                  fill={getZoneColor("3pt-corner-right")}
                  stroke={selectedZoneId === "3pt-corner-right" ? "#ffffff" : "#f97316"}
                  strokeWidth={selectedZoneId === "3pt-corner-right" ? "3" : "1"}
                  opacity="0.85"
                />
                <text x="472" y="65" fill="#ffffff" fontSize="11" fontWeight="900" textAnchor="middle">
                  0°
                </text>
                <text x="472" y="80" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                  {getZoneStat("3pt-corner-right").percentage}%
                </text>
              </g>

              {/* MID-RANGE ZONES */}
              {/* Mid Left Baseline (0°) */}
              <g
                id="court-zone-mid-base-left"
                className="cursor-pointer"
                onClick={() => setSelectedZoneId("mid-base-left")}
              >
                <rect
                  x="75"
                  y="20"
                  width="90"
                  height="80"
                  rx="6"
                  fill={getZoneColor("mid-base-left")}
                  stroke={selectedZoneId === "mid-base-left" ? "#ffffff" : "#f59e0b"}
                  strokeWidth={selectedZoneId === "mid-base-left" ? "2.5" : "1"}
                  opacity="0.8"
                />
                <text x="120" y="55" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                  L Base Mid
                </text>
                <text x="120" y="70" fill="#ffffff" fontSize="10" fontWeight="extrabold" textAnchor="middle">
                  {getZoneStat("mid-base-left").percentage}%
                </text>
              </g>

              {/* Mid Left Elbow (45°) */}
              <g
                id="court-zone-mid-wing-left"
                className="cursor-pointer"
                onClick={() => setSelectedZoneId("mid-wing-left")}
              >
                <rect
                  x="80"
                  y="110"
                  width="85"
                  height="85"
                  rx="6"
                  fill={getZoneColor("mid-wing-left")}
                  stroke={selectedZoneId === "mid-wing-left" ? "#ffffff" : "#f59e0b"}
                  strokeWidth={selectedZoneId === "mid-wing-left" ? "2.5" : "1"}
                  opacity="0.8"
                />
                <text x="122" y="145" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                  L Elbow
                </text>
                <text x="122" y="160" fill="#ffffff" fontSize="10" fontWeight="extrabold" textAnchor="middle">
                  {getZoneStat("mid-wing-left").percentage}%
                </text>
              </g>

              {/* Mid Free Throw Line / High Post (90°) */}
              <g
                id="court-zone-mid-ft-post"
                className="cursor-pointer"
                onClick={() => setSelectedZoneId("mid-ft-post")}
              >
                <rect
                  x="180"
                  y="205"
                  width="140"
                  height="60"
                  rx="6"
                  fill={getZoneColor("mid-ft-post")}
                  stroke={selectedZoneId === "mid-ft-post" ? "#ffffff" : "#f59e0b"}
                  strokeWidth={selectedZoneId === "mid-ft-post" ? "2.5" : "1"}
                  opacity="0.8"
                />
                <text x="250" y="232" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                  FT High Post (90°)
                </text>
                <text x="250" y="248" fill="#ffffff" fontSize="10" fontWeight="extrabold" textAnchor="middle">
                  {getZoneStat("mid-ft-post").percentage}%
                </text>
              </g>

              {/* Mid Right Elbow (45°) */}
              <g
                id="court-zone-mid-wing-right"
                className="cursor-pointer"
                onClick={() => setSelectedZoneId("mid-wing-right")}
              >
                <rect
                  x="335"
                  y="110"
                  width="85"
                  height="85"
                  rx="6"
                  fill={getZoneColor("mid-wing-right")}
                  stroke={selectedZoneId === "mid-wing-right" ? "#ffffff" : "#f59e0b"}
                  strokeWidth={selectedZoneId === "mid-wing-right" ? "2.5" : "1"}
                  opacity="0.8"
                />
                <text x="377" y="145" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                  R Elbow
                </text>
                <text x="377" y="160" fill="#ffffff" fontSize="10" fontWeight="extrabold" textAnchor="middle">
                  {getZoneStat("mid-wing-right").percentage}%
                </text>
              </g>

              {/* Mid Right Baseline (0°) */}
              <g
                id="court-zone-mid-base-right"
                className="cursor-pointer"
                onClick={() => setSelectedZoneId("mid-base-right")}
              >
                <rect
                  x="335"
                  y="20"
                  width="90"
                  height="80"
                  rx="6"
                  fill={getZoneColor("mid-base-right")}
                  stroke={selectedZoneId === "mid-base-right" ? "#ffffff" : "#f59e0b"}
                  strokeWidth={selectedZoneId === "mid-base-right" ? "2.5" : "1"}
                  opacity="0.8"
                />
                <text x="380" y="55" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                  R Base Mid
                </text>
                <text x="380" y="70" fill="#ffffff" fontSize="10" fontWeight="extrabold" textAnchor="middle">
                  {getZoneStat("mid-base-right").percentage}%
                </text>
              </g>

              {/* PAINT / SHORT FLOATER */}
              <g
                id="court-zone-paint-floater"
                className="cursor-pointer"
                onClick={() => setSelectedZoneId("paint-floater")}
              >
                <rect
                  x="185"
                  y="95"
                  width="130"
                  height="85"
                  rx="6"
                  fill={getZoneColor("paint-floater")}
                  stroke={selectedZoneId === "paint-floater" ? "#ffffff" : "#f97316"}
                  strokeWidth={selectedZoneId === "paint-floater" ? "2.5" : "1"}
                  opacity="0.85"
                />
                <text x="250" y="132" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                  Paint Floater Zone
                </text>
                <text x="250" y="148" fill="#ffffff" fontSize="10" fontWeight="extrabold" textAnchor="middle">
                  {getZoneStat("paint-floater").percentage}%
                </text>
              </g>

              {/* LAYUPS (Rim Area) */}
              <g
                id="court-zone-layup-right"
                className="cursor-pointer"
                onClick={() => setSelectedZoneId("layup-right")}
              >
                <circle
                  cx="285"
                  cy="50"
                  r="20"
                  fill={getZoneColor("layup-right")}
                  stroke={selectedZoneId === "layup-right" ? "#ffffff" : "#10b981"}
                  strokeWidth={selectedZoneId === "layup-right" ? "2.5" : "1"}
                  opacity="0.9"
                />
                <text x="285" y="54" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                  R-Layup
                </text>
              </g>

              <g
                id="court-zone-layup-left"
                className="cursor-pointer"
                onClick={() => setSelectedZoneId("layup-left")}
              >
                <circle
                  cx="215"
                  cy="50"
                  r="20"
                  fill={getZoneColor("layup-left")}
                  stroke={selectedZoneId === "layup-left" ? "#ffffff" : "#10b981"}
                  strokeWidth={selectedZoneId === "layup-left" ? "2.5" : "1"}
                  opacity="0.9"
                />
                <text x="215" y="54" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                  L-Layup
                </text>
              </g>
            </svg>
          </div>

          {/* Legend */}
          <div className="w-full flex items-center justify-center space-x-4 mt-4 text-[11px] text-zinc-400">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span>Elite / Hot (&gt;45% 3PT)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              <span>Consistent (36-44%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span>Average (28-35%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span>Needs Work (&lt;28%)</span>
            </div>
          </div>
        </div>

        {/* Right: Selected Zone Detailed Analytics + Interactive Live Shot Clicker (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Detailed Inspector Card */}
          <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-400">
                  {selectedZone.category} Sector • {selectedZone.degreeTag || "Zone"}
                </span>
                <h4 className="text-base font-extrabold text-white">{selectedZone.name}</h4>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-black uppercase shadow-sm ${
                  selectedZone.ratingTier === "Hot / Elite"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : selectedZone.ratingTier === "Consistent"
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                }`}
              >
                {selectedZone.ratingTier}
              </div>
            </div>

            {/* Big Numbers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-center transform hover:scale-103 transition-all shadow-md">
                <span className="text-xs text-zinc-400 block font-semibold">Accuracy</span>
                <span className="text-3xl font-black text-orange-400">{selectedZone.percentage}%</span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">
                  {selectedZone.made} / {selectedZone.attempted} makes
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-center transform hover:scale-103 transition-all shadow-md">
                <span className="text-xs text-zinc-400 block font-semibold">Contested Accuracy</span>
                <span className="text-3xl font-black text-amber-400">
                  {selectedZone.contestedAttempted > 0 ? `${selectedZone.contestedPercentage}%` : "N/A"}
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">
                  {selectedZone.contestedMade} / {selectedZone.contestedAttempted} under pressure
                </span>
              </div>
            </div>

            {/* NEW INTERACTIVE FEATURE: LIVE ZONE SHOT TESTER */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-orange-500/30 space-y-2.5 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-orange-400 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Interactive Real-Time Shot Tester</span>
                </span>
                {Object.keys(quickShotSim).length > 0 && (
                  <button
                    onClick={handleResetSim}
                    className="text-[10px] text-zinc-400 hover:text-red-400 flex items-center space-x-1 cursor-pointer transform hover:scale-105 active:scale-95"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Simulate or test reps live right now on <strong>{selectedZone.name}</strong>:
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  id="btn-interactive-shot-make"
                  onClick={() => handleSimulate(true)}
                  className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-zinc-950 font-black text-xs shadow-lg shadow-emerald-600/20 transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>+1 Make (Swish)</span>
                </button>

                <button
                  id="btn-interactive-shot-miss"
                  onClick={() => handleSimulate(false)}
                  className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-red-400 border border-red-500/30 hover:border-red-500/60 font-black text-xs transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                  <span>+1 Miss</span>
                </button>
              </div>

              {simAlert && (
                <div className="text-center text-xs font-black text-amber-400 py-1 animate-pulse">
                  {simAlert}
                </div>
              )}
            </div>

            {/* Shooting Angle & Technical Guidance */}
            <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-zinc-200">
                <Info className="w-3.5 h-3.5 text-orange-400" />
                <span>Coach Mechanical Breakdown</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {selectedZone.category === "3PT" && selectedZone.degreeTag === "0°" && (
                  <>
                    Baseline corner 3s have zero backboard margin. Focus on a high release point, dipping into your knees before catch, and keeping your shooting elbow tight to your ribcage.
                  </>
                )}
                {selectedZone.category === "3PT" && selectedZone.degreeTag === "45°" && (
                  <>
                    Wing 3s provide optimal sightlines. Ensure your feet are aligned 10 degrees left of target on catch to allow clean shoulder sweep and guide hand follow-through.
                  </>
                )}
                {selectedZone.category === "3PT" && selectedZone.degreeTag === "90°" && (
                  <>
                    Straight-on top of key shot has the longest distance. Maximize upward kinetic energy transfer from your calves through your release fingertips.
                  </>
                )}
                {selectedZone.category === "Layup" && selectedZone.id === "layup-left" && (
                  <>
                    Left-hand finishes require jumping off the right foot with eyes locked on the top-left square of the glass. Avoid spinning the ball with your wrist.
                  </>
                )}
                {selectedZone.category === "Layup" && selectedZone.id !== "layup-left" && (
                  <>
                    Protect the ball with your off-arm and use soft wrist touch off the top corner of the backboard box.
                  </>
                )}
                {selectedZone.category === "Mid-Range" && (
                  <>
                    Stop on a balanced 1-2 stride or hop. Elevate straight up without fading back unless heavily contested by a taller rim protector.
                  </>
                )}
                {selectedZone.category === "Paint" && (
                  <>
                    High-arc floater: release off a high two-foot jump stop to absorb contact and float over shot blockers without charging.
                  </>
                )}
              </p>
            </div>

            {/* Quick List of All Active Zones with Hover Scaling */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-none">
              <span className="text-[11px] font-bold uppercase text-zinc-400 block mb-1">
                All Tracked Zones ({filteredZones.length})
              </span>
              {filteredZones.map((z) => (
                <div
                  key={z.id}
                  id={`zone-row-${z.id}`}
                  onClick={() => setSelectedZoneId(z.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-all duration-200 transform hover:scale-[1.02] active:scale-95 ${
                    selectedZoneId === z.id
                      ? "bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/50 text-white font-bold shadow-md"
                      : "bg-zinc-950/60 hover:bg-zinc-800 text-zinc-300 border border-transparent"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getZoneColor(z.id) }}></span>
                    <span>{z.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="text-zinc-400 text-[11px]">
                      {z.made}/{z.attempted}
                    </span>
                    <span className="text-orange-400 font-bold">{z.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
