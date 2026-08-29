import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  BarChart3,
  Calendar,
  Filter,
  TrendingUp,
  Award,
  Sparkles,
  Activity,
  Flame,
  Zap,
} from "lucide-react";
import { TrainingSession, PlayerAttributes } from "../types";
import { calculateAttributeRatings } from "../utils/basketballStats";

interface ProgressAnalyticsProps {
  sessions: TrainingSession[];
  attributes?: PlayerAttributes;
}

export const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({ sessions, attributes }) => {
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d" | "all">("all");
  const [sessionTypeFilter, setSessionTypeFilter] = useState<"all" | "practice" | "match">("all");
  const [selectedMetrics, setSelectedMetrics] = useState<{
    threePt: boolean;
    midRange: boolean;
    layups: boolean;
    freeThrows: boolean;
    overallFg: boolean;
  }>({
    threePt: true,
    midRange: true,
    layups: true,
    freeThrows: false,
    overallFg: true,
  });

  // Filter sessions by timeframe and type
  const filteredSessions = useMemo(() => {
    let result = [...sessions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    if (sessionTypeFilter !== "all") {
      result = result.filter((s) => s.type === sessionTypeFilter);
    }

    if (timeframe !== "all") {
      const now = new Date().getTime();
      const days = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90;
      const cutoff = now - days * 24 * 60 * 60 * 1000;
      result = result.filter((s) => new Date(s.date).getTime() >= cutoff);
    }

    return result;
  }, [sessions, timeframe, sessionTypeFilter]);

  // Format data for Recharts
  const chartData = useMemo(() => {
    return filteredSessions.map((s) => {
      const dateObj = new Date(s.date);
      const dateLabel = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
      return {
        id: s.id,
        date: dateLabel,
        fullDate: dateObj.toLocaleDateString(),
        title: s.title,
        type: s.type === "match" ? "Match" : "Practice",
        threePtPct: Number((s.shootingStats?.threePt?.percentage ?? 0).toFixed(1)),
        midRangePct: Number((s.shootingStats?.midRange?.percentage ?? 0).toFixed(1)),
        layupPct: Number((s.shootingStats?.layups?.percentage ?? 0).toFixed(1)),
        ftPct: Number((s.shootingStats?.freeThrows?.percentage ?? 0).toFixed(1)),
        overallFgPct: Number((s.shootingStats?.overall?.fieldGoalPercentage ?? 0).toFixed(1)),
        exhaustion: s.exhaustion,
        points: s.matchData?.calculatedPoints || Math.round((s.shootingStats?.overall?.totalPoints ?? 0) / 5),
        assists: s.matchData?.assists || 0,
        steals: s.defenseStats?.steals || 0,
      };
    });
  }, [filteredSessions]);

  // Radar Data for Attributes
  const radarData = [
    { subject: "Shooting", value: attributes?.shooting ?? 70, fullMark: 99 },
    { subject: "Finishing", value: attributes?.finishing ?? 70, fullMark: 99 },
    { subject: "Handling", value: attributes?.ballHandling ?? 70, fullMark: 99 },
    { subject: "Defense", value: attributes?.defense ?? 70, fullMark: 99 },
    { subject: "Rebounding", value: attributes?.rebounding ?? 65, fullMark: 99 },
    { subject: "Stamina", value: attributes?.stamina ?? 75, fullMark: 99 },
  ];

  return (
    <div className="space-y-6 text-white">
      {/* Top Filter Bar with Interactive Hover Expansion */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl">
        {/* Timeframe selector */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-black text-zinc-300">Timeframe:</span>
          <div className="flex items-center space-x-1 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 text-xs">
            {[
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "90d", label: "3 Months" },
              { id: "all", label: "All Time" },
            ].map((t) => (
              <button
                key={t.id}
                id={`timeframe-btn-${t.id}`}
                onClick={() => setTimeframe(t.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all duration-200 cursor-pointer transform hover:scale-105 active:scale-95 ${
                  timeframe === t.id
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 font-black shadow-md shadow-orange-500/25"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Session Type Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-black text-zinc-300">Type:</span>
          <div className="flex items-center space-x-1 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 text-xs">
            {[
              { id: "all", label: "All Sessions" },
              { id: "practice", label: "Drills Only" },
              { id: "match", label: "Matches Only" },
            ].map((f) => (
              <button
                key={f.id}
                id={`session-type-filter-${f.id}`}
                onClick={() => setSessionTypeFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all duration-200 cursor-pointer transform hover:scale-105 active:scale-95 ${
                  sessionTypeFilter === f.id
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 font-black shadow-md shadow-orange-500/25"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Scoring Percentages Line Chart (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-black text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-orange-400" />
                <span>Scoring Percentages Over Time</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Multi-metric accuracy tracking across all logged workouts
              </p>
            </div>

            {/* Metric Toggle Chips with Hover Scaling */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
              <button
                onClick={() => setSelectedMetrics((m) => ({ ...m, threePt: !m.threePt }))}
                className={`px-3 py-1 rounded-xl border transition-all duration-200 cursor-pointer transform hover:scale-105 active:scale-95 ${
                  selectedMetrics.threePt
                    ? "bg-orange-500/20 border-orange-500 text-orange-400 shadow-sm"
                    : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                ● 3PT %
              </button>
              <button
                onClick={() => setSelectedMetrics((m) => ({ ...m, midRange: !m.midRange }))}
                className={`px-3 py-1 rounded-xl border transition-all duration-200 cursor-pointer transform hover:scale-105 active:scale-95 ${
                  selectedMetrics.midRange
                    ? "bg-amber-500/20 border-amber-500 text-amber-400 shadow-sm"
                    : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                ● Mid-Range %
              </button>
              <button
                onClick={() => setSelectedMetrics((m) => ({ ...m, layups: !m.layups }))}
                className={`px-3 py-1 rounded-xl border transition-all duration-200 cursor-pointer transform hover:scale-105 active:scale-95 ${
                  selectedMetrics.layups
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-sm"
                    : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                ● Layups %
              </button>
              <button
                onClick={() => setSelectedMetrics((m) => ({ ...m, freeThrows: !m.freeThrows }))}
                className={`px-3 py-1 rounded-xl border transition-all duration-200 cursor-pointer transform hover:scale-105 active:scale-95 ${
                  selectedMetrics.freeThrows
                    ? "bg-purple-500/20 border-purple-500 text-purple-400 shadow-sm"
                    : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                ● Free Throws %
              </button>
              <button
                onClick={() => setSelectedMetrics((m) => ({ ...m, overallFg: !m.overallFg }))}
                className={`px-3 py-1 rounded-xl border transition-all duration-200 cursor-pointer transform hover:scale-105 active:scale-95 ${
                  selectedMetrics.overallFg
                    ? "bg-blue-500/20 border-blue-500 text-blue-400 shadow-sm"
                    : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                ● Overall FG%
              </button>
            </div>
          </div>

          {/* Chart Rendering */}
          <div className="w-full h-72">
            {chartData.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 text-xs">
                <span>No sessions match the selected timeframe filters.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} domain={[20, 100]} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "#27272a",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "#fff",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                    }}
                  />
                  {selectedMetrics.threePt && (
                    <Line
                      type="monotone"
                      dataKey="threePtPct"
                      name="3-Point %"
                      stroke="#f97316"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#f97316" }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                  {selectedMetrics.midRange && (
                    <Line
                      type="monotone"
                      dataKey="midRangePct"
                      name="Mid-Range %"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: "#f59e0b" }}
                    />
                  )}
                  {selectedMetrics.layups && (
                    <Line
                      type="monotone"
                      dataKey="layupPct"
                      name="Layup %"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: "#10b981" }}
                    />
                  )}
                  {selectedMetrics.freeThrows && (
                    <Line
                      type="monotone"
                      dataKey="ftPct"
                      name="Free Throw %"
                      stroke="#a855f7"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 3, fill: "#a855f7" }}
                    />
                  )}
                  {selectedMetrics.overallFg && (
                    <Line
                      type="monotone"
                      dataKey="overallFgPct"
                      name="Field Goal %"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#3b82f6" }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right: 2K-Style NBA Attribute Radar (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-orange-400 tracking-wider">
                NBA 2K Skill Matrix
              </span>
              <h3 className="text-sm font-black text-white">Player Archetype Radar</h3>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-black border border-orange-500/30">
              OVR {attributes?.overallRating ?? 70}
            </div>
          </div>

          <div className="w-full h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#27272a" />
                <PolarAngleAxis dataKey="subject" stroke="#a1a1aa" fontSize={11} tickLine={false} />
                <PolarRadiusAxis angle={30} domain={[0, 99]} stroke="#52525b" fontSize={9} />
                <Radar
                  name="Player Stats"
                  dataKey="value"
                  stroke="#f97316"
                  fill="#f97316"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Sub-Scores */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 transform hover:scale-105 transition-all">
              <span className="text-[10px] text-zinc-500 block">Shooting</span>
              <span className="font-black text-orange-400">{attributes?.shooting ?? 70}</span>
            </div>
            <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 transform hover:scale-105 transition-all">
              <span className="text-[10px] text-zinc-500 block">Finishing</span>
              <span className="font-black text-emerald-400">{attributes?.finishing ?? 70}</span>
            </div>
            <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 transform hover:scale-105 transition-all">
              <span className="text-[10px] text-zinc-500 block">Defense</span>
              <span className="font-black text-blue-400">{attributes?.defense ?? 70}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Production Volume & Fatigue Correlation Chart */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-black text-white flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-orange-400" />
              <span>Session Production &amp; Defensive Hustle</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Comparison of Points Scored, Assists, and Steals per logged basketball workout / match
            </p>
          </div>
        </div>

        <div className="w-full h-64">
          {chartData.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
              <span>No session data available.</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#27272a",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Bar dataKey="points" name="Points Scored" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="assists" name="Assists" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="steals" name="Steals" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
