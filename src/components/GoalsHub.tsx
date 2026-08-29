import React, { useState } from "react";
import {
  Target,
  Plus,
  Minus,
  CheckCircle2,
  Trash2,
  Sparkles,
  TrendingUp,
  Award,
  Flame,
} from "lucide-react";
import { PlayerGoal } from "../types";

interface GoalsHubProps {
  goals: PlayerGoal[];
  onAddGoal: (goal: PlayerGoal) => void;
  onToggleGoal: (id: string) => void;
  onDeleteGoal: (id: string) => void;
  onUpdateGoalProgress?: (id: string, newCurrent: number) => void;
}

export const GoalsHub: React.FC<GoalsHubProps> = ({
  goals,
  onAddGoal,
  onToggleGoal,
  onDeleteGoal,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<PlayerGoal["category"]>("Shooting");
  const [newTarget, setNewTarget] = useState(50);
  const [newCurrent, setNewCurrent] = useState(0);
  const [newUnit, setNewUnit] = useState("%");
  const [localGoals, setLocalGoals] = useState<PlayerGoal[]>(goals);

  // Sync if goals prop updates
  React.useEffect(() => {
    setLocalGoals(goals);
  }, [goals]);

  const completedCount = localGoals.filter((g) => g.completed).length;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const goal: PlayerGoal = {
      id: `goal-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      targetValue: newTarget,
      currentValue: newCurrent,
      unit: newUnit,
      isCoachGenerated: false,
      accepted: true,
      completed: newCurrent >= newTarget,
    };

    onAddGoal(goal);
    setNewTitle("");
    setShowAddForm(false);
  };

  const handleAdjustValue = (id: string, delta: number) => {
    setLocalGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const updatedVal = Math.max(0, g.currentValue + delta);
          const isComplete = updatedVal >= g.targetValue;
          return {
            ...g,
            currentValue: updatedVal,
            completed: isComplete,
          };
        }
        return g;
      })
    );
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800/80 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase text-orange-400 tracking-wider flex items-center space-x-1.5">
            <Target className="w-4 h-4" />
            <span>Player Milestones &amp; Objectives</span>
          </span>
          <h2 className="text-xl font-black text-white mt-1">Basketball Training Goals</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Track self-assigned benchmarks and accepted AI Coach recommendations with live progress adjusters
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-center shadow-inner">
            <span className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">Completed</span>
            <span className="text-base font-black text-green-400">
              {completedCount} / {localGoals.length}
            </span>
          </div>

          <button
            id="open-add-goal-btn"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black text-xs shadow-lg shadow-orange-500/25 transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Custom Goal</span>
          </button>
        </div>
      </div>

      {/* Add Custom Goal Modal / Inline Drawer */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-2xl">
          <h3 className="text-sm font-black text-orange-400">Set New Basketball Milestone</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Goal title (e.g. 50% 3PT from wings, 80% FTs, 5 Steals/Game)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="sm:col-span-2 p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-orange-500"
              required
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className="p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-bold text-white focus:outline-none focus:border-orange-500"
            >
              <option value="Shooting">Shooting</option>
              <option value="Finishing">Finishing</option>
              <option value="Dribbling">Dribbling</option>
              <option value="Defense">Defense</option>
              <option value="Matches">Matches</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1 font-semibold">Target Value</label>
              <input
                type="number"
                value={newTarget}
                onChange={(e) => setNewTarget(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1 font-semibold">Starting Current Value</label>
              <input
                type="number"
                value={newCurrent}
                onChange={(e) => setNewCurrent(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1 font-semibold">Unit Metric</label>
              <select
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-bold text-white"
              >
                <option value="%">% (Percentage)</option>
                <option value="makes">makes</option>
                <option value="sessions">sessions</option>
                <option value="ppg">PPG</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black text-xs shadow-md shadow-orange-500/20 transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              Save Goal
            </button>
          </div>
        </form>
      )}

      {/* Goal Cards Grid with Interactive Value Adjusters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {localGoals.map((g) => {
          const pct = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
          return (
            <div
              key={g.id}
              className={`p-5 rounded-3xl border transition-all duration-200 transform hover:scale-[1.02] shadow-xl ${
                g.completed
                  ? "bg-zinc-900/80 border-green-500/40 shadow-green-500/5"
                  : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-orange-400 border border-zinc-700">
                      {g.category}
                    </span>
                    {g.isCoachGenerated && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center space-x-1 border border-amber-500/30">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>AI Coach Goal</span>
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-extrabold text-white mt-2">{g.title}</h4>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onToggleGoal(g.id)}
                    className={`p-2 rounded-xl border transition-all transform hover:scale-110 active:scale-95 cursor-pointer ${
                      g.completed
                        ? "bg-green-500/20 border-green-500 text-green-400 shadow-md shadow-green-500/20"
                        : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteGoal(g.id)}
                    className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-950 transition-all transform hover:scale-110 active:scale-95 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Interactive Value Progress Bar & Quick Adjusters */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-medium">
                    Current: <strong className="text-white font-bold">{g.currentValue} {g.unit}</strong> / Target: {g.targetValue} {g.unit}
                  </span>
                  <span className="font-black text-orange-400">{pct}%</span>
                </div>

                <div className="w-full h-2.5 rounded-full bg-zinc-950 overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      g.completed ? "bg-gradient-to-r from-emerald-500 to-green-400" : "bg-gradient-to-r from-orange-500 to-amber-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Direct Interactive +/- Buttons on Each Goal Card */}
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-zinc-500 font-medium">Live progress stepper:</span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleAdjustValue(g.id, -1)}
                      className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all transform hover:scale-110 active:scale-95 cursor-pointer font-black"
                      title="Decrease by 1"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleAdjustValue(g.id, 1)}
                      className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-orange-400 hover:text-orange-300 border border-orange-500/30 transition-all transform hover:scale-110 active:scale-95 cursor-pointer font-black"
                      title="Increase by 1"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleAdjustValue(g.id, 5)}
                      className="px-2 py-1 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/40 text-[10px] font-black transition-all transform hover:scale-110 active:scale-95 cursor-pointer"
                      title="Increase by 5"
                    >
                      +5
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
