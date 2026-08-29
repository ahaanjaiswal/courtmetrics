import React, { useState } from "react";
import {
  Crosshair,
  Shield,
  Zap,
  Activity,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Award,
  Layers,
  Plus,
  Compass,
} from "lucide-react";
import { TrainingSession, PlayerProfile } from "../types";
import { aggregateAllZones } from "../utils/basketballStats";

interface CategoryDeepDiveProps {
  sessions: TrainingSession[];
  profile: PlayerProfile;
  onOpenLogSession?: () => void;
  onNavigateToHeatmap?: () => void;
}

type DeepDiveCategory =
  | "All Scoring Spectrum"
  | "3-Pointers (3PT)"
  | "Mid-Range (2PT)"
  | "Layups & Rim Finishing"
  | "Defense & Steals"
  | "Scoring & Efficiency"
  | "Playmaking & Assists"
  | "Ball Handling";

export const CategoryDeepDive: React.FC<CategoryDeepDiveProps> = ({
  sessions,
  profile,
  onOpenLogSession,
  onNavigateToHeatmap,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<DeepDiveCategory>("All Scoring Spectrum");
  const zones = aggregateAllZones(sessions);

  const categories: { id: DeepDiveCategory; label: string; icon: string; badge: string }[] = [
    { id: "All Scoring Spectrum", label: "Full Scoring Spectrum", icon: "⚡", badge: "3PT • Mid • Layups" },
    { id: "3-Pointers (3PT)", label: "3-Pointers", icon: "🎯", badge: "0°, 45°, 90° Angles" },
    { id: "Mid-Range (2PT)", label: "Mid-Range", icon: "🏀", badge: "Elbows & Baselines" },
    { id: "Layups & Rim Finishing", label: "Layups & Finishing", icon: "🎪", badge: "Right & Left Weak Hand" },
    { id: "Defense & Steals", label: "Defense & Steals", icon: "🔒", badge: "On-Ball & Hustle" },
    { id: "Scoring & Efficiency", label: "Scoring & Points", icon: "🔥", badge: "eFG%, TS%, PPG" },
    { id: "Playmaking & Assists", label: "Assists & Vision", icon: "🧠", badge: "AST:TO & Creation" },
    { id: "Ball Handling", label: "Ball Handling", icon: "🌪️", badge: "Combos & Security" },
  ];

  // Helper calculations for balanced 3 scoring levels
  const threeZones = zones.filter((z) => z.category === "3PT" && z.attempted > 0);
  const bestThreeZone = [...threeZones].sort((a, b) => b.percentage - a.percentage)[0];
  const lowestThreeZone = [...threeZones].sort((a, b) => a.percentage - b.percentage)[0];

  const midZones = zones.filter((z) => z.category === "Mid-Range" && z.attempted > 0);
  const bestMidZone = [...midZones].sort((a, b) => b.percentage - a.percentage)[0];
  const lowestMidZone = [...midZones].sort((a, b) => a.percentage - b.percentage)[0];

  const layupZones = zones.filter((z) => z.category === "Layup" && z.attempted > 0);
  const bestLayup = [...layupZones].sort((a, b) => b.percentage - a.percentage)[0];
  const lowestLayup = [...layupZones].sort((a, b) => a.percentage - b.percentage)[0];

  // Aggregated totals
  let totalSteals = 0;
  let totalBlocks = 0;
  let totalAssists = 0;
  let totalTurnovers = 0;
  let totalPoints = 0;
  let totalFGM = 0;
  let totalFGA = 0;
  let total3PM = 0;
  let total3PA = 0;
  let totalMidM = 0;
  let totalMidA = 0;
  let totalLayM = 0;
  let totalLayA = 0;
  let totalHandlingBobbles = 0;
  let matchCount = 0;

  sessions.forEach((s) => {
    if (s.defenseStats) {
      totalSteals += s.defenseStats.steals || 0;
      totalBlocks += s.defenseStats.blocks || 0;
    }
    if (s.handlingStats) {
      totalHandlingBobbles += s.handlingStats.bobbles || s.handlingStats.mistakes || 0;
    }
    if (s.matchData) {
      matchCount++;
      totalAssists += s.matchData.assists || 0;
      totalTurnovers += s.matchData.turnovers || 0;
      totalPoints += s.matchData.calculatedPoints || 0;
    }
    totalFGM += s.shootingStats.overall.totalMade || 0;
    totalFGA += s.shootingStats.overall.totalAttempted || 0;
    total3PM += s.shootingStats.threePt.totalMade || 0;
    total3PA += s.shootingStats.threePt.totalAttempted || 0;
    totalMidM += s.shootingStats.midRange?.totalMade || 0;
    totalMidA += s.shootingStats.midRange?.totalAttempted || 0;
    totalLayM += (s.shootingStats.layups?.rightHandMade || 0) + (s.shootingStats.layups?.leftHandMade || 0);
    totalLayA += (s.shootingStats.layups?.rightHandAttempted || 0) + (s.shootingStats.layups?.leftHandAttempted || 0);
  });

  const overall3Pct = total3PA > 0 ? ((total3PM / total3PA) * 100).toFixed(1) : "0.0";
  const overallMidPct = totalMidA > 0 ? ((totalMidM / totalMidA) * 100).toFixed(1) : "0.0";
  const overallLayPct = totalLayA > 0 ? ((totalLayM / totalLayA) * 100).toFixed(1) : "0.0";
  const overallFGPct = totalFGA > 0 ? ((totalFGM / totalFGA) * 100).toFixed(1) : "0.0";
  const ppg = matchCount > 0 ? (totalPoints / matchCount).toFixed(1) : "N/A";
  const apg = matchCount > 0 ? (totalAssists / matchCount).toFixed(1) : "N/A";
  const spg = sessions.length > 0 ? (totalSteals / sessions.length).toFixed(1) : "0.0";

  return (
    <div className="space-y-6 text-white">
      {/* Category Picker Tabs (Horizontal, Sleek, Expanding on Hover) */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              id={`deepdive-tab-${cat.id.replace(/\s+/g, "-")}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl whitespace-nowrap text-xs font-bold transition-all duration-200 cursor-pointer transform hover:scale-105 active:scale-95 shadow-md ${
                isSelected
                  ? "bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 text-zinc-950 shadow-orange-500/25 font-black scale-102 ring-1 ring-orange-400"
                  : "bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isSelected ? "bg-zinc-950/20 text-zinc-950 font-bold" : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {cat.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ================= 0. EQUAL BALANCED 3-TIER SCORING SPECTRUM (OVERVIEW) ================= */}
      {selectedCategory === "All Scoring Spectrum" && (
        <div className="space-y-6">
          {/* Balanced Diagnostic Header */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-950/30 border border-zinc-800 hover:border-orange-500/40 shadow-2xl transition-all duration-300 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black uppercase tracking-wider text-orange-400">
                    Balanced 3-Tier Scoring Diagnostics
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    Equal Emphasis
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  3-Pointers, Mid-Range Pull-Ups &amp; Weak-Hand Layups
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-3xl leading-relaxed">
                  To build a complete offensive threat, Court Metrics tracks your shooting across all three scoring tiers with equal weight. For spatial coordinate heatmaps and shot angle charts, see the dedicated Court &amp; Heatmap tab.
                </p>
              </div>

              {onNavigateToHeatmap && (
                <button
                  id="deepdive-goto-heatmap-btn"
                  onClick={onNavigateToHeatmap}
                  className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-orange-500/40 hover:border-orange-400 text-orange-400 hover:text-white text-xs font-bold shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <Compass className="w-4 h-4" />
                  <span>View Court Heatmap</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Equal 3-Column Scoring Cards: 3PT, Mid-Range, Layups */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. 3-Pointers Card */}
            <div
              onClick={() => setSelectedCategory("3-Pointers (3PT)")}
              className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 shadow-xl transition-all duration-200 transform hover:scale-105 cursor-pointer space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold">
                    🎯
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white group-hover:text-orange-400 transition-colors">
                      3-Point Perimeter
                    </h4>
                    <span className="text-[10px] text-zinc-400 font-semibold">0°, 45°, 90° Geometry</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-orange-400">{overall3Pct}%</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-800/80 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Sweet Spot:</span>
                  <span className="font-bold text-emerald-400">
                    {bestThreeZone ? bestThreeZone.name : "Top 90°"} ({bestThreeZone ? bestThreeZone.percentage : 58}%)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Growth Focus:</span>
                  <span className="font-bold text-red-400">
                    {lowestThreeZone ? lowestThreeZone.name : "Corner 0°"} ({lowestThreeZone ? lowestThreeZone.percentage : 38}%)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Total Makes:</span>
                  <span className="font-bold text-white">
                    {total3PM} / {total3PA} shots
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-orange-400 font-bold">
                <span>Explore 3PT breakdown &rarr;</span>
              </div>
            </div>

            {/* 2. Mid-Range Card */}
            <div
              onClick={() => setSelectedCategory("Mid-Range (2PT)")}
              className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 shadow-xl transition-all duration-200 transform hover:scale-105 cursor-pointer space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                    🏀
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white group-hover:text-amber-400 transition-colors">
                      Mid-Range Pull-Ups
                    </h4>
                    <span className="text-[10px] text-zinc-400 font-semibold">Elbows, Baselines &amp; Post</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-400">{overallMidPct}%</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-800/80 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Sweet Spot:</span>
                  <span className="font-bold text-emerald-400">
                    {bestMidZone ? bestMidZone.name : "Free Throw Elbow"} ({bestMidZone ? bestMidZone.percentage : 68}%)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Growth Focus:</span>
                  <span className="font-bold text-red-400">
                    {lowestMidZone ? lowestMidZone.name : "Left Baseline Mid"} ({lowestMidZone ? lowestMidZone.percentage : 42}%)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Total Makes:</span>
                  <span className="font-bold text-white">
                    {totalMidM} / {totalMidA} shots
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-amber-400 font-bold">
                <span>Explore Mid-Range breakdown &rarr;</span>
              </div>
            </div>

            {/* 3. Layups & Rim Finishing Card */}
            <div
              onClick={() => setSelectedCategory("Layups & Rim Finishing")}
              className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 shadow-xl transition-all duration-200 transform hover:scale-105 cursor-pointer space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                    🎪
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors">
                      Layups &amp; Rim Finishing
                    </h4>
                    <span className="text-[10px] text-zinc-400 font-semibold">Right &amp; Left Hand</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-400">{overallLayPct}%</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-800/80 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Strong Hand (Right):</span>
                  <span className="font-bold text-emerald-400">
                    {zones.find((z) => z.id === "layup-right")?.percentage || 85}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Weak Hand (Left):</span>
                  <span className="font-bold text-sky-400">
                    {zones.find((z) => z.id === "layup-left")?.percentage || 58}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Total Layups:</span>
                  <span className="font-bold text-white">
                    {totalLayM} / {totalLayA} finishes
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-emerald-400 font-bold">
                <span>Explore Layups breakdown &rarr;</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 1. 3-POINTERS DEEP DIVE ================= */}
      {selectedCategory === "3-Pointers (3PT)" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-orange-400">
                Perimeter Arc Accuracy &bull; 0°, 45°, 90° Geometry
              </span>
              <span className="text-2xl font-black text-orange-400">{overall3Pct}%</span>
            </div>
            <h3 className="text-xl font-black text-white">3-Point Perimeter Breakdown</h3>
            <p className="text-xs text-zinc-300">
              Perimeter efficiency across 0° baseline corners, 45° left/right wings, and 90° top of the key.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {threeZones.map((z) => (
              <div
                key={z.id}
                className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-orange-500/40 transition-all duration-200 transform hover:scale-105 space-y-2 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-zinc-800 text-orange-400 border border-orange-500/30">
                    {z.degreeTag}
                  </span>
                  <span className="text-xs font-black text-white">{z.percentage}%</span>
                </div>
                <h4 className="text-xs font-bold text-zinc-200">{z.name}</h4>
                <p className="text-[11px] text-zinc-400">
                  {z.made} makes / {z.attempted} shots
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 2. MID-RANGE DEEP DIVE ================= */}
      {selectedCategory === "Mid-Range (2PT)" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                Mid-Range Pull-Up &bull; 15-18ft Elbows &amp; Baselines
              </span>
              <span className="text-2xl font-black text-amber-400">{overallMidPct}%</span>
            </div>
            <h3 className="text-xl font-black text-white">Mid-Range &amp; High-Post Accuracy</h3>
            <p className="text-xs text-zinc-300">
              Clean separation off dribble pull-ups, face-ups, and baseline step-backs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {midZones.map((z) => (
              <div
                key={z.id}
                className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition-all duration-200 transform hover:scale-105 space-y-2 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">{z.degreeTag || "Mid"}</span>
                  <span className="text-xs font-black text-white">{z.percentage}%</span>
                </div>
                <h4 className="text-xs font-bold text-zinc-200">{z.name}</h4>
                <p className="text-[11px] text-zinc-400">
                  {z.made} makes / {z.attempted} shots
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 3. LAYUPS & RIM FINISHING ================= */}
      {selectedCategory === "Layups & Rim Finishing" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Ambidextrous Finishing &bull; Right Hand vs Left Hand Weak-Side
              </span>
              <span className="text-2xl font-black text-emerald-400">{overallLayPct}%</span>
            </div>
            <h3 className="text-xl font-black text-white">Layups &amp; Rim Finishing</h3>
            <p className="text-xs text-zinc-300">
              Eliminate weak-hand deficiencies around the rim against rim protectors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {layupZones.map((z) => (
              <div
                key={z.id}
                className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 transition-all duration-200 transform hover:scale-105 space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {z.id === "layup-right" ? "Strong Hand" : "Weak Hand Focus"}
                  </span>
                  <span className="text-2xl font-black text-white">{z.percentage}%</span>
                </div>
                <h4 className="text-sm font-bold text-zinc-200">{z.name}</h4>
                <p className="text-xs text-zinc-400">
                  {z.made} makes out of {z.attempted} attempts
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 4. DEFENSE & STEALS ================= */}
      {selectedCategory === "Defense & Steals" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-orange-400">
              Defensive Disruptions &amp; Hustle
            </span>
            <h3 className="text-xl font-black text-white">Steals, Blocks &amp; Pressure</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-center transform hover:scale-105 transition-all shadow-md">
              <span className="text-xs text-zinc-400 font-semibold">Total Steals</span>
              <div className="text-3xl font-black text-orange-400 mt-1">{totalSteals}</div>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-center transform hover:scale-105 transition-all shadow-md">
              <span className="text-xs text-zinc-400 font-semibold">Total Blocks</span>
              <div className="text-3xl font-black text-amber-400 mt-1">{totalBlocks}</div>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-center transform hover:scale-105 transition-all shadow-md">
              <span className="text-xs text-zinc-400 font-semibold">Steals / Match</span>
              <div className="text-3xl font-black text-emerald-400 mt-1">{spg}</div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 5. SCORING & EFFICIENCY ================= */}
      {selectedCategory === "Scoring & Efficiency" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-orange-400">
              Scoring Production
            </span>
            <h3 className="text-xl font-black text-white">Points Per Game &amp; FG%</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-center transform hover:scale-105 transition-all shadow-md">
              <span className="text-xs text-zinc-400 font-semibold">Field Goal %</span>
              <div className="text-3xl font-black text-white mt-1">{overallFGPct}%</div>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-center transform hover:scale-105 transition-all shadow-md">
              <span className="text-xs text-zinc-400 font-semibold">3-Point %</span>
              <div className="text-3xl font-black text-orange-400 mt-1">{overall3Pct}%</div>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-center transform hover:scale-105 transition-all shadow-md">
              <span className="text-xs text-zinc-400 font-semibold">Points / Match</span>
              <div className="text-3xl font-black text-emerald-400 mt-1">{ppg} PPG</div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 6. PLAYMAKING & ASSISTS ================= */}
      {selectedCategory === "Playmaking & Assists" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-orange-400">
              Floor General
            </span>
            <h3 className="text-xl font-black text-white">Assists &amp; Assist-to-Turnover Ratio</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-center transform hover:scale-105 transition-all shadow-md">
              <span className="text-xs text-zinc-400 font-semibold">Total Assists</span>
              <div className="text-3xl font-black text-orange-400 mt-1">{totalAssists}</div>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-center transform hover:scale-105 transition-all shadow-md">
              <span className="text-xs text-zinc-400 font-semibold">Assists / Match</span>
              <div className="text-3xl font-black text-amber-400 mt-1">{apg} APG</div>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-center transform hover:scale-105 transition-all shadow-md">
              <span className="text-xs text-zinc-400 font-semibold">AST : TO Ratio</span>
              <div className="text-3xl font-black text-emerald-400 mt-1">
                {totalTurnovers > 0 ? (totalAssists / totalTurnovers).toFixed(1) : totalAssists}:1
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 7. BALL HANDLING ================= */}
      {selectedCategory === "Ball Handling" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-orange-400">
              Ball Security
            </span>
            <h3 className="text-xl font-black text-white">Dribble Precision &amp; Mistakes</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 transform hover:scale-105 transition-all shadow-md">
              <span className="text-xs text-zinc-400 font-semibold">Total Drill Bobbles / Mistakes</span>
              <div className="text-3xl font-black text-orange-400 mt-1">{totalHandlingBobbles}</div>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-xs font-bold text-zinc-200">Coach Dribble Cue</span>
              <p className="text-xs text-zinc-400">
                Pound the ball below knee height on crossovers to keep defenders from digging into your pocket.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
