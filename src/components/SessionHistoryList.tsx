import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Activity,
  Flame,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Trophy,
  Target,
  Shield,
  Zap,
  Plus,
  Filter,
  Eye,
  Award,
} from "lucide-react";
import { TrainingSession } from "../types";

interface SessionHistoryListProps {
  sessions: TrainingSession[];
  onSelectSession?: (session: TrainingSession) => void;
  onOpenLogSession?: () => void;
  onViewAIEval?: (session: TrainingSession) => void;
}

export const SessionHistoryList: React.FC<SessionHistoryListProps> = ({
  sessions,
  onOpenLogSession,
  onViewAIEval,
}) => {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "practice" | "match">("all");

  const toggleExpand = (id: string) => {
    setExpandedSessionId(expandedSessionId === id ? null : id);
  };

  const filteredSessions = sessions.filter((s) => {
    if (filterType === "practice") return s.type === "practice";
    if (filterType === "match") return s.type === "match";
    return true;
  });

  // Sort descending by date
  const sortedSessions = [...filteredSessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sessions.length === 0) {
    return (
      <div className="p-12 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
          <Activity className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">No Training Sessions Logged Yet</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Your workout logs, drill aims vs actuals, mistakes, exertion ratings, and game box scores will appear here.
          </p>
        </div>
        {onOpenLogSession && (
          <button
            onClick={onOpenLogSession}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black text-xs shadow-lg shadow-orange-500/25 transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Log Your First Workout</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5 text-white">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800 shadow-md">
        <div>
          <h3 className="text-sm font-extrabold uppercase text-orange-400 tracking-wider flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Logged Workouts &amp; Match History ({sortedSessions.length})</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">Click any card to expand full box score and shot breakdowns</p>
        </div>

        {/* Quick Filter Buttons with Hover Expansion */}
        <div className="flex items-center space-x-1.5">
          {(["all", "practice", "match"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer ${
                filterType === t
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 font-black shadow-md shadow-orange-500/20"
                  : "bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              {t === "all" ? "All Sessions" : t === "practice" ? "Drills" : "Matches"}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-3.5">
        {sortedSessions.map((session) => {
          const isExpanded = expandedSessionId === session.id;
          const isMatch = session.type === "match";
          const dateStr = new Date(session.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <div
              key={session.id}
              className={`p-5 rounded-3xl bg-zinc-900 border transition-all duration-200 transform hover:scale-[1.01] shadow-xl ${
                isExpanded ? "border-orange-500/60 ring-1 ring-orange-500/30" : "border-zinc-800 hover:border-orange-500/40"
              }`}
            >
              {/* Header Row */}
              <div
                onClick={() => toggleExpand(session.id)}
                className="flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center space-x-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shadow-md transition-transform duration-200 hover:scale-110 ${
                      isMatch
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    }`}
                  >
                    {isMatch ? <Trophy className="w-6 h-6 stroke-[2.2]" /> : <Target className="w-6 h-6 stroke-[2.2]" />}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-black text-white hover:text-orange-400 transition-colors">
                        {session.title}
                      </h4>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                          isMatch
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                        }`}
                      >
                        {isMatch ? "MATCH" : "DRILLS"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-zinc-400 mt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{dateStr}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{session.durationMinutes} mins</span>
                      </span>
                      <span>•</span>
                      <span>Intensity: <strong className="text-orange-400">{session.exhaustion}/10</strong></span>
                    </div>
                  </div>
                </div>

                {/* Key Stat Badges & Actions */}
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-black text-orange-400 block">
                      {session.shootingStats.threePt.percentage.toFixed(0)}% 3PT
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      {session.shootingStats.overall.totalMade}/{session.shootingStats.overall.totalAttempted} FG
                    </span>
                  </div>

                  {session.aiFeedback && (
                    <div
                      title={`AI Grade: ${session.aiFeedback.grade}`}
                      className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500/25 to-amber-500/25 text-orange-400 border border-orange-500/40 font-black text-xs flex items-center justify-center shadow-inner hover:scale-110 transition-transform"
                    >
                      {session.aiFeedback.grade}
                    </div>
                  )}

                  <div className="w-8 h-8 rounded-xl bg-zinc-950 flex items-center justify-center text-zinc-400 hover:text-white border border-zinc-800">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded Detailed Box Score */}
              {isExpanded && (
                <div className="mt-5 pt-5 border-t border-zinc-800/80 space-y-4">
                  {/* AI Feedback Banner with Quick Evaluation Trigger */}
                  {session.aiFeedback && (
                    <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/90 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-orange-400 flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Coach Analysis &amp; Letter Grade</span>
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-white bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
                            Grade: <strong className="text-orange-400">{session.aiFeedback.grade}</strong>
                          </span>
                          {onViewAIEval && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewAIEval(session);
                              }}
                              className="px-3 py-1 rounded-lg bg-orange-500 hover:bg-orange-400 text-zinc-950 text-xs font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer"
                            >
                              Open Full AI Report
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {session.aiFeedback.summary}
                      </p>
                    </div>
                  )}

                  {/* Equal 4-Column Shot Breakdown Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-center transform hover:scale-105 transition-all">
                      <span className="text-[10px] text-zinc-400 block font-semibold">3-Pointers</span>
                      <span className="text-base font-black text-orange-400">
                        {session.shootingStats.threePt.percentage.toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-zinc-500 block">
                        {session.shootingStats.threePt.totalMade}/{session.shootingStats.threePt.totalAttempted}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-center transform hover:scale-105 transition-all">
                      <span className="text-[10px] text-zinc-400 block font-semibold">Mid-Range</span>
                      <span className="text-base font-black text-amber-400">
                        {session.shootingStats.midRange.percentage.toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-zinc-500 block">
                        {session.shootingStats.midRange.totalMade}/{session.shootingStats.midRange.totalAttempted}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-center transform hover:scale-105 transition-all">
                      <span className="text-[10px] text-zinc-400 block font-semibold">Layups</span>
                      <span className="text-base font-black text-emerald-400">
                        {session.shootingStats.layups.percentage.toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-zinc-500 block">
                        {session.shootingStats.layups.totalMade}/{session.shootingStats.layups.totalAttempted}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-center transform hover:scale-105 transition-all">
                      <span className="text-[10px] text-zinc-400 block font-semibold">Free Throws</span>
                      <span className="text-base font-black text-purple-400">
                        {session.shootingStats.freeThrows.percentage.toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-zinc-500 block">
                        {session.shootingStats.freeThrows.made}/{session.shootingStats.freeThrows.attempted}
                      </span>
                    </div>
                  </div>

                  {/* Match Box Score stats if match */}
                  {session.matchData && (
                    <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                      <span className="text-[11px] font-black uppercase text-amber-400 block">
                        Match Traditional Box Score
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                        <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                          <span className="text-[10px] text-zinc-400 block font-medium">Points</span>
                          <span className="font-black text-orange-400 text-sm">{session.matchData.calculatedPoints}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                          <span className="text-[10px] text-zinc-400 block font-medium">Assists</span>
                          <span className="font-black text-white text-sm">{session.matchData.assists}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                          <span className="text-[10px] text-zinc-400 block font-medium">Rebounds</span>
                          <span className="font-black text-white text-sm">{session.matchData.totalRebounds}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                          <span className="text-[10px] text-zinc-400 block font-medium">Steals</span>
                          <span className="font-black text-white text-sm">{session.matchData.steals}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                          <span className="text-[10px] text-zinc-400 block font-medium">Blocks</span>
                          <span className="font-black text-white text-sm">{session.matchData.blocks}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                          <span className="text-[10px] text-zinc-400 block font-medium">Turnovers</span>
                          <span className="font-black text-red-400 text-sm">{session.matchData.turnovers}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Practice Drills list if practice */}
                  {session.drills && session.drills.length > 0 && (
                    <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                      <span className="text-[11px] font-black uppercase text-orange-400 block">
                        Drills Executed ({session.drills.length})
                      </span>
                      <div className="space-y-1.5">
                        {session.drills.map((d) => (
                          <div
                            key={d.id}
                            className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-zinc-900 border border-zinc-800"
                          >
                            <span className="font-semibold text-zinc-200">{d.name}</span>
                            <span className="text-zinc-400 text-[11px]">
                              Aim: {d.aim} &rarr; Result: <strong className="text-orange-400">{d.actualResult}</strong>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
