import React, { useState } from "react";
import {
  Sparkles,
  Award,
  TrendingUp,
  Flame,
  Calendar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Plus,
  RefreshCw,
  Target,
  Zap,
} from "lucide-react";
import {
  TrainingSession,
  PlayerProfile,
  WeeklyActionPlan,
  PlayerGoal,
} from "../types";
import { aggregateAllZones } from "../utils/basketballStats";

interface AICoachHubProps {
  sessions: TrainingSession[];
  profile: PlayerProfile;
  goals: PlayerGoal[];
  onAcceptCoachGoal: (goal: PlayerGoal) => void;
}

export const AICoachHub: React.FC<AICoachHubProps> = ({
  sessions,
  profile,
  goals,
  onAcceptCoachGoal,
}) => {
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyActionPlan | null>(null);
  const [coachGoals, setCoachGoals] = useState<PlayerGoal[]>([
    {
      id: "coach-goal-1",
      title: "Boost 0° Baseline 3PT% to 45% (Left & Right corners)",
      category: "Shooting",
      targetValue: 45,
      currentValue: 38,
      unit: "%",
      isCoachGenerated: true,
      accepted: false,
      completed: false,
    },
    {
      id: "coach-goal-2",
      title: "Complete 50 Weak-Hand Left Layup Drills with <2 mistakes",
      category: "Finishing",
      targetValue: 50,
      currentValue: 24,
      unit: "makes",
      isCoachGenerated: true,
      accepted: false,
      completed: false,
    },
    {
      id: "coach-goal-3",
      title: "Execute 100 Two-Ball Dribble Reps with 0 Turnovers",
      category: "Dribbling",
      targetValue: 100,
      currentValue: 45,
      unit: "makes",
      isCoachGenerated: true,
      accepted: false,
      completed: false,
    },
  ]);

  const latestSession = sessions[sessions.length - 1];
  const zones = aggregateAllZones(sessions);

  // Weak and mid areas identification
  const weakZones = zones
    .filter((z) => z.attempted > 0 && (z.ratingTier === "Needs Work" || z.ratingTier === "Cold"))
    .map((z) => `${z.name} (${z.percentage}%)`);

  // Handle Request for 5-Day Weekly Action Plan
  const handleGenerateWeeklyPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const response = await fetch("/api/ai/weekly-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          weakAreas: weakZones.length > 0 ? weakZones : ["0° Baseline Corner 3s", "Left-Hand Layups"],
          overallStats: {
            totalSessions: sessions.length,
            latestGrade: latestSession?.aiFeedback?.grade || "B+",
          },
        }),
      });

      if (!response.ok) throw new Error("Server error generating plan");
      const data = await response.json();
      setWeeklyPlan({
        title: data.title || "Customized 5-Day Skill Blueprint",
        focus: data.focus || "Weak-Hand Finishing & Perimeter Angles",
        createdAt: new Date().toISOString(),
        days: data.days || [],
      });
    } catch (err) {
      console.error(err);
      // Fallback
      setWeeklyPlan({
        title: "5-Day Weak-Area Intensive Program",
        focus: "Corner 3s & Left-Hand Layup Package",
        createdAt: new Date().toISOString(),
        days: [
          {
            day: "Day 1",
            focus: "0° Baseline Corner 3s & Footwork Dip",
            durationMinutes: 45,
            drills: [
              "Form shooting 5 feet (30 makes)",
              "0° Left Corner 3s (50 makes)",
              "0° Right Corner 3s (50 makes)",
            ],
          },
          {
            day: "Day 2",
            focus: "Weak-Hand Mikan & Reverse Layups",
            durationMinutes: 50,
            drills: [
              "Left-hand Mikan drill (50 makes)",
              "Eurostep finishes from wing (30 makes)",
              "High floaters in paint (30 makes)",
            ],
          },
          {
            day: "Day 3",
            focus: "Ball Handling & Pressure Security",
            durationMinutes: 40,
            drills: [
              "Two-ball pound combos (10 min)",
              "Cone zig-zag crossover pull-ups (20 reps)",
            ],
          },
          {
            day: "Day 4",
            focus: "Mid-Range Off-The-Dribble Pull-ups",
            durationMinutes: 45,
            drills: [
              "Elbow to elbow 1-dribble pull-ups (40 makes)",
              "Lateral slide contest recovery (10 sets)",
            ],
          },
          {
            day: "Day 5",
            focus: "Live Scrimmage Simulation & Pressure FTs",
            durationMinutes: 60,
            drills: [
              "Live 3v3 or 5v5 full court game",
              "10 consecutive FT challenge under fatigue",
            ],
          },
        ],
      });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* Top Banner: Coach Philosophy & Player Archetype */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-orange-950/50 border border-orange-500/30 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-zinc-950 shadow-lg shadow-orange-500/20">
            <Sparkles className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-black text-white">AI Basketball Skills Coach</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30">
                POWERED BY GEMINI
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-1 max-w-xl">
              Personalized analysis calibrated for{" "}
              <strong className="text-orange-400">
                {profile.name} (Age: {profile.age}, {profile.height}, {profile.position})
              </strong>{" "}
              focusing on weak and mid-tier performance areas.
            </p>
          </div>
        </div>

        {/* Generate Action Plan Button */}
        <button
          id="generate-weekly-plan-btn"
          onClick={handleGenerateWeeklyPlan}
          disabled={isGeneratingPlan}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-xs shadow-lg shadow-orange-500/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isGeneratingPlan ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Calendar className="w-4 h-4 stroke-[2.5]" />
          )}
          <span>{isGeneratingPlan ? "Building Plan..." : "Generate 5-Day Weekly Plan"}</span>
        </button>
      </div>

      {/* Latest Session In-Depth Coach Feedback */}
      {latestSession && latestSession.aiFeedback && (
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                Latest Session Review • {new Date(latestSession.date).toLocaleDateString()}
              </span>
              <h3 className="text-lg font-extrabold text-white mt-0.5">{latestSession.title}</h3>
            </div>
            {/* Letter Grade */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-zinc-400 font-medium">Performance Grade:</span>
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 border-2 border-orange-500/40 text-orange-400 flex items-center justify-center text-xl font-black shadow-inner">
                {latestSession.aiFeedback.grade}
              </div>
            </div>
          </div>

          {/* Coach Summary */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 leading-relaxed">
            "{latestSession.aiFeedback.summary}"
          </div>

          {/* Strengths & Weaknesses Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
              <span className="text-xs font-bold uppercase text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Identified Strengths & High Points</span>
              </span>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {latestSession.aiFeedback.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weak / Mid-Tier Areas */}
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
              <span className="text-xs font-bold uppercase text-amber-400 flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>Weak & Mid-Tier Areas to Attack</span>
              </span>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {latestSession.aiFeedback.weaknesses.map((wk, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{wk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Tips & Next Workout Priority */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
            <span className="text-xs font-bold uppercase text-orange-400 flex items-center space-x-1.5">
              <Zap className="w-4 h-4" />
              <span>3 Actionable Technical Tips</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {latestSession.aiFeedback.actionableTips.map((tip, i) => (
                <div key={i} className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 space-y-1">
                  <span className="font-bold text-orange-400 block">Tip #{i + 1}</span>
                  <p className="text-zinc-400 leading-snug">{tip}</p>
                </div>
              ))}
            </div>

            {/* Next Priority Highlight */}
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-400">Next Workout Priority:</span>
              <span className="font-bold text-orange-400">
                {latestSession.aiFeedback.nextWorkoutPriority}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Generated 5-Day Weekly Action Plan */}
      {weeklyPlan && (
        <div className="p-6 rounded-2xl bg-zinc-900 border border-orange-500/40 shadow-2xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                AI Coach Customized 5-Day Schedule
              </span>
              <h3 className="text-lg font-extrabold text-white mt-0.5">{weeklyPlan.title}</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Focus Target: {weeklyPlan.focus}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {weeklyPlan.days.map((day, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-orange-400">{day.day}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                      {day.durationMinutes}m
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1">{day.focus}</h4>
                  <ul className="space-y-1.5 text-[11px] text-zinc-400 mt-2">
                    {day.drills.map((drill, dIdx) => (
                      <li key={dIdx} className="flex items-start space-x-1.5">
                        <span className="text-orange-400">•</span>
                        <span>{drill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coach-Generated Goals */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
              <Target className="w-4 h-4 text-orange-400" />
              <span>Coach-Recommended Target Goals</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Targets constructed by the AI coach based on your recent 0°, 45°, 90° shooting & weak areas
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {coachGoals.map((g) => {
            const alreadyAccepted = goals.some((existing) => existing.title === g.title);
            return (
              <div
                key={g.id}
                className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      {g.category}
                    </span>
                    <span className="text-[10px] text-zinc-500">Coach AI</span>
                  </div>
                  <h4 className="text-xs font-bold text-zinc-200 mt-2">{g.title}</h4>
                  <div className="text-xs text-zinc-400 mt-1">
                    Target:{" "}
                    <strong className="text-orange-400">
                      {g.targetValue}
                      {g.unit}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onAcceptCoachGoal(g)}
                  disabled={alreadyAccepted}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    alreadyAccepted
                      ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                      : "bg-orange-500 hover:bg-orange-400 text-zinc-950 font-black shadow-md shadow-orange-500/20"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{alreadyAccepted ? "Goal Active" : "Accept Goal"}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
