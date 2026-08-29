import React from "react";
import {
  X,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Target,
  Dumbbell,
  Shield,
  Activity,
} from "lucide-react";
import { TrainingSession, AIFeedbackReport, PlayerProfile } from "../types";

interface AIEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: TrainingSession | null;
  profile: PlayerProfile;
  onViewAICoachTab?: () => void;
}

export const AIEvaluationModal: React.FC<AIEvaluationModalProps> = ({
  isOpen,
  onClose,
  session,
  profile,
  onViewAICoachTab,
}) => {
  if (!isOpen || !session) return null;

  const feedback = session.aiFeedback;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl overflow-hidden text-zinc-100 max-h-[90vh] flex flex-col">
        {/* Header with High-Impact Gradient */}
        <div className="relative p-6 bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/40 text-amber-200 border border-white/10">
                  AI Coach Debrief
                </span>
                <span className="text-xs text-white/80 font-medium">
                  {session.type === "match" ? "Match Analysis" : "Practice Breakdown"}
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white mt-0.5">
                Session Evaluation for {profile.name || "Player"}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Close debrief"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Top Grade & Summary Card */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                Performance Rating
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {feedback?.summary || "Workout performance indexed and analyzed against your playstyle profile."}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/30 shrink-0">
              <span className="text-[10px] font-bold text-orange-400 uppercase">Grade</span>
              <span className="text-3xl font-black text-orange-400">
                {feedback?.grade || "A-"}
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 font-bold block">FG%</span>
              <span className="text-sm font-black text-emerald-400">
                {session.shootingStats?.overall?.fieldGoalPercentage.toFixed(1) || "0.0"}%
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 font-bold block">3PT%</span>
              <span className="text-sm font-black text-orange-400">
                {session.shootingStats?.threePt?.percentage.toFixed(1) || "0.0"}%
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 font-bold block">Layups</span>
              <span className="text-sm font-black text-sky-400">
                {session.shootingStats?.layups?.percentage.toFixed(1) || "0.0"}%
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 font-bold block">Fatigue</span>
              <span className="text-sm font-black text-amber-400">
                {session.exhaustion}/10
              </span>
            </div>
          </div>

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths (Green) */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/20 space-y-2.5">
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span className="text-xs font-bold uppercase tracking-wider">Key Strengths</span>
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {feedback?.strengths && feedback.strengths.length > 0 ? (
                  feedback.strengths.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5 leading-snug">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-zinc-500">Solid shooting repetition volume and intensity maintained.</li>
                )}
              </ul>
            </div>

            {/* Weaknesses / Incomplete / Needs Work (Red) */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-red-500/20 space-y-2.5">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                <span className="text-xs font-bold uppercase tracking-wider">Targeted Fixes</span>
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {feedback?.weaknesses && feedback.weaknesses.length > 0 ? (
                  feedback.weaknesses.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5 leading-snug">
                      <span className="text-red-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-zinc-500">Focus on weak-hand layup angles and 0° corner arc elevation.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Actionable Coach Tips (Blue) */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-sky-500/20 space-y-2.5">
            <div className="flex items-center space-x-2 text-sky-400">
              <Activity className="w-4 h-4 stroke-[2.5]" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Immediate Mechanical & Drill Adjustments
              </span>
            </div>
            <div className="space-y-2">
              {feedback?.actionableTips?.map((tip, idx) => (
                <div key={idx} className="flex items-start space-x-2.5 text-xs text-zinc-300 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Next Workout Priority */}
          <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-start space-x-3">
            <Target className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-400">
                Next Workout Focus Priority
              </span>
              <p className="text-xs font-semibold text-zinc-200">
                {feedback?.nextWorkoutPriority || "Weak-hand layup repetition and 0° baseline shooting angles."}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition-colors cursor-pointer"
          >
            Done / Close
          </button>

          {onViewAICoachTab && (
            <button
              onClick={() => {
                onClose();
                onViewAICoachTab();
              }}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black text-xs shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
            >
              <span>View Full AI Coach Hub</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
