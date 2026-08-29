import React, { useState, useEffect, useMemo } from "react";
import {
  Flame,
  Plus,
  Target,
  Sparkles,
  TrendingUp,
  Award,
  Shield,
  Activity,
  Layers,
  Calendar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Dumbbell,
  Clock,
  User,
  RotateCcw,
  Play,
  Crosshair,
} from "lucide-react";
import {
  PlayerProfile,
  TrainingSession,
  PlayerGoal,
  PlayerAttributes,
} from "./types";
import {
  defaultEmptyProfile,
  demoPlayerProfile,
  initialProfile,
  sampleSessions,
  sampleGoals,
} from "./data/mockData";
import { aggregateAllZones, calculateAttributeRatings } from "./utils/basketballStats";
import { generateInstantCoachReport } from "./utils/aiFeedbackGenerator";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { HomeScreen } from "./components/HomeScreen";
import { OnboardingModal } from "./components/OnboardingModal";
import { CourtHeatmap } from "./components/CourtHeatmap";
import { CategoryDeepDive } from "./components/CategoryDeepDive";
import { ProgressAnalytics } from "./components/ProgressAnalytics";
import { AICoachHub } from "./components/AICoachHub";
import { GoalsHub } from "./components/GoalsHub";
import { SessionHistoryList } from "./components/SessionHistoryList";
import { LogSessionModal } from "./components/LogSessionModal";
import { AIEvaluationModal } from "./components/AIEvaluationModal";

export default function App() {
  // Local state initialized with fallback from localStorage
  const [profile, setProfile] = useState<PlayerProfile>(() => {
    const saved = localStorage.getItem("bball_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultEmptyProfile;
      }
    }
    return defaultEmptyProfile;
  });

  const [sessions, setSessions] = useState<TrainingSession[]>(() => {
    const saved = localStorage.getItem("bball_sessions");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [goals, setGoals] = useState<PlayerGoal[]>(() => {
    const saved = localStorage.getItem("bball_goals");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState<string>("court");
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAIEvalModalOpen, setIsAIEvalModalOpen] = useState(false);
  const [evaluatedSession, setEvaluatedSession] = useState<TrainingSession | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("bball_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("bball_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("bball_goals", JSON.stringify(goals));
  }, [goals]);

  // Aggregate stats across all sessions dynamically
  const courtZones = useMemo(() => aggregateAllZones(sessions), [sessions]);
  const attributes = useMemo(() => calculateAttributeRatings(sessions), [sessions]);

  // Calculate Quick Top-level KPIs
  const quickStats = useMemo(() => {
    let total3M = 0;
    let total3A = 0;
    let totalFGM = 0;
    let totalFGA = 0;
    let totalSteals = 0;
    let totalPoints = 0;
    let matchCount = 0;

    sessions.forEach((s) => {
      if (!s) return;
      total3M += s.shootingStats?.threePt?.totalMade ?? 0;
      total3A += s.shootingStats?.threePt?.totalAttempted ?? 0;
      totalFGM += s.shootingStats?.overall?.totalMade ?? 0;
      totalFGA += s.shootingStats?.overall?.totalAttempted ?? 0;
      totalSteals += s.defenseStats?.steals || 0;
      if (s.matchData) {
        matchCount++;
        totalPoints += s.matchData.calculatedPoints || 0;
      }
    });

    const threePct = total3A > 0 ? ((total3M / total3A) * 100).toFixed(1) : "0.0";
    const fgPct = totalFGA > 0 ? ((totalFGM / totalFGA) * 100).toFixed(1) : "0.0";
    const ppg = matchCount > 0 ? (totalPoints / matchCount).toFixed(1) : "--";

    return { threePct, fgPct, ppg, totalSteals, sessionsCount: sessions.length };
  }, [sessions]);

  // Handle saving profile from Home / Setup Screen
  const handleSaveProfile = (updatedProfile: PlayerProfile) => {
    setProfile(updatedProfile);
  };

  // Quick Demo Player Load
  const handleLoadDemoData = () => {
    setProfile(demoPlayerProfile);
    setSessions(sampleSessions);
    setGoals(sampleGoals);
  };

  // Reset to Fresh State
  const handleResetProfile = () => {
    setProfile(defaultEmptyProfile);
    setSessions([]);
    setGoals([]);
    localStorage.removeItem("bball_profile");
    localStorage.removeItem("bball_sessions");
    localStorage.removeItem("bball_goals");
  };

  // Handler for logging a new session + AI auto-feedback trigger
  const handleSaveSession = async (newSession: TrainingSession) => {
    // 1. Generate instant comprehensive AI coach feedback immediately
    const instantFeedback = generateInstantCoachReport(newSession, profile);
    const sessionWithAI: TrainingSession = {
      ...newSession,
      aiFeedback: instantFeedback,
    };

    // Add immediately to real user state
    const updated = [sessionWithAI, ...sessions];
    setSessions(updated);

    // 2. Open the AI Coach Evaluation modal right away so the user immediately sees their report!
    setEvaluatedSession(sessionWithAI);
    setIsAIEvalModalOpen(true);

    // 3. Call server AI endpoint in background to further enrich if online
    try {
      const resp = await fetch("/api/ai/coach-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session: sessionWithAI,
          profile,
          recentSessions: sessions.slice(0, 5),
        }),
      });

      if (resp.ok) {
        const enhancedFeedback = await resp.json();
        setSessions((prev) =>
          prev.map((s) => (s.id === newSession.id ? { ...s, aiFeedback: enhancedFeedback } : s))
        );
        setEvaluatedSession((prev) => (prev?.id === newSession.id ? { ...prev, aiFeedback: enhancedFeedback } : prev));
      }
    } catch (err) {
      console.log("Using instant basketball heuristic AI feedback engine.");
    }
  };

  // Goal handlers
  const handleAddGoal = (newGoal: PlayerGoal) => {
    setGoals([newGoal, ...goals]);
  };

  const handleToggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    );
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handleAcceptCoachGoal = (coachGoal: PlayerGoal) => {
    const accepted: PlayerGoal = {
      ...coachGoal,
      id: `goal-${Date.now()}`,
      accepted: true,
    };
    setGoals([accepted, ...goals]);
  };

  // If user has not completed their profile setup, show the Home Setup Screen first!
  if (!profile.isProfileCompleted || !profile.name) {
    return (
      <HomeScreen
        initialData={profile}
        onSaveProfile={(p) => {
          handleSaveProfile(p);
          setActiveTab("court");
        }}
        onLoadDemoData={() => {
          handleLoadDemoData();
          setActiveTab("court");
        }}
        onEnterDashboard={() => setActiveTab("court")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-orange-500 selection:text-zinc-950 flex flex-col md:flex-row">
      {/* LEFT VERTICAL NAVIGATION SIDEBAR (Tabs stacked on the left side of the screen) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        attributes={attributes}
        onOpenProfile={() => setIsOnboardingOpen(true)}
        onOpenNewSession={() => setIsLogModalOpen(true)}
        onGoHome={() => setActiveTab("home")}
        sessionsCount={sessions.length}
      />

      {/* RIGHT MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Mobile Navigation Header */}
        <div className="md:hidden">
          <Navbar
            profile={profile}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            attributes={attributes}
            onOpenNewSession={() => setIsLogModalOpen(true)}
            onOpenProfile={() => setIsOnboardingOpen(true)}
            onGoHome={() => setActiveTab("home")}
          />
        </div>

        {/* When active tab is Home */}
        {activeTab === "home" ? (
          <HomeScreen
            initialData={profile}
            onSaveProfile={(p) => {
              handleSaveProfile(p);
              setActiveTab("court");
            }}
            onLoadDemoData={() => {
              handleLoadDemoData();
              setActiveTab("court");
            }}
            onEnterDashboard={() => setActiveTab("court")}
          />
        ) : (
          /* Main Container for Selected Tab */
          <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Top Quick Status & Key Metrics Banner with Interactive Hover Expansion */}
            <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800/80 shadow-2xl flex flex-wrap items-center justify-between gap-4 transition-all duration-200">
              <div className="flex items-center space-x-4">
                <div
                  id="topbar-avatar-btn"
                  onClick={() => setIsOnboardingOpen(true)}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-red-600 flex items-center justify-center font-black text-zinc-950 text-xl shadow-lg shadow-orange-500/25 cursor-pointer transform hover:scale-110 active:scale-95 transition-transform"
                >
                  {profile.name.charAt(0) || "P"}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-base font-extrabold text-white">{profile.name}</h1>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-orange-400 font-bold border border-zinc-700">
                      {profile.playstyle}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-medium">
                      {profile.position}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-zinc-400 mt-1">
                    <span>Age: {profile.age}</span>
                    <span>•</span>
                    <span>{profile.height || "185"} cm</span>
                    <span>•</span>
                    <span>{profile.weight || "80"} kg</span>
                    <span>•</span>
                    <span className="text-orange-400 font-semibold">{profile.level || "High School"}</span>
                  </div>
                </div>
              </div>

              {/* KPI Stat Blocks with Hover Expansion */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-center transform hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-md">
                  <span className="text-[10px] text-zinc-500 block font-semibold">3-Point %</span>
                  <span className="text-sm font-black text-orange-400">{quickStats.threePct}%</span>
                </div>
                <div className="px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-center transform hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-md">
                  <span className="text-[10px] text-zinc-500 block font-semibold">Field Goal %</span>
                  <span className="text-sm font-black text-white">{quickStats.fgPct}%</span>
                </div>
                <div className="px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-center transform hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-md">
                  <span className="text-[10px] text-zinc-500 block font-semibold">Match PPG</span>
                  <span className="text-sm font-black text-emerald-400">{quickStats.ppg}</span>
                </div>
                <div className="px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-center transform hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-md">
                  <span className="text-[10px] text-zinc-500 block font-semibold">Sessions</span>
                  <span className="text-sm font-black text-amber-400">{quickStats.sessionsCount}</span>
                </div>
                <div className="px-3.5 py-2 rounded-2xl bg-gradient-to-tr from-orange-500/20 to-amber-500/20 border border-orange-500/40 text-center transform hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-md">
                  <span className="text-[10px] text-orange-400 block font-bold">2K OVR</span>
                  <span className="text-sm font-black text-orange-300">{attributes?.overallRating ?? 70}</span>
                </div>
              </div>
            </div>

            {/* Global Zero Sessions Helper Banner */}
            {sessions.length === 0 && (
              <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold shrink-0 border border-orange-500/30">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">
                      Welcome to Court Metrics, {profile.name}! Log your first basketball workout
                    </h3>
                    <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                      You are tracking real shot makes and attempts. Click <strong>&quot;+ Log Workout&quot;</strong> anytime on the left sidebar to input your 0° baseline 3s, 45° wings, top of key, layups, free throws, steals, and assists.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 w-full md:w-auto">
                  <button
                    id="banner-log-first-btn"
                    onClick={() => setIsLogModalOpen(true)}
                    className="flex-1 md:flex-initial flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black text-xs shadow-lg shadow-orange-500/25 cursor-pointer transform hover:scale-105 active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>+ Log First Workout</span>
                  </button>
                  <button
                    id="banner-sample-data-btn"
                    onClick={handleLoadDemoData}
                    className="flex-1 md:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-semibold cursor-pointer transform hover:scale-105 active:scale-95 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Load Sample Data</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab Content Rendering */}

            {/* 1. COURT & HEATMAP */}
            {activeTab === "court" && (
              <div className="space-y-6">
                <CourtHeatmap
                  sessions={sessions}
                  onOpenLogSession={() => setIsLogModalOpen(true)}
                />
              </div>
            )}

            {/* 2. PROGRESS DEEP DIVE (Equal emphasis on 3PT, Mid-Range, and Layups) */}
            {activeTab === "deepdive" && (
              <div className="space-y-6">
                <CategoryDeepDive
                  sessions={sessions}
                  profile={profile}
                  onOpenLogSession={() => setIsLogModalOpen(true)}
                  onNavigateToHeatmap={() => setActiveTab("court")}
                />
              </div>
            )}

            {/* 3. TRENDS & CHARTS */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <ProgressAnalytics sessions={sessions} attributes={attributes} />
              </div>
            )}

            {/* 4. AI COACH */}
            {activeTab === "aicoach" && (
              <div className="space-y-6">
                <AICoachHub
                  sessions={sessions}
                  profile={profile}
                  goals={goals}
                  onAcceptCoachGoal={handleAcceptCoachGoal}
                />
              </div>
            )}

            {/* 5. GOALS & MILESTONES */}
            {activeTab === "goals" && (
              <div className="space-y-6">
                <GoalsHub
                  goals={goals}
                  onAddGoal={handleAddGoal}
                  onToggleGoal={handleToggleGoal}
                  onDeleteGoal={handleDeleteGoal}
                />
              </div>
            )}

            {/* 6. SESSION HISTORY */}
            {activeTab === "history" && (
              <div className="space-y-6">
                <SessionHistoryList
                  sessions={sessions}
                  onOpenLogSession={() => setIsLogModalOpen(true)}
                  onViewAIEval={(s) => {
                    setEvaluatedSession(s);
                    setIsAIEvalModalOpen(true);
                  }}
                />
              </div>
            )}
          </main>
        )}
      </div>

      {/* Log Session Modal */}
      <LogSessionModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSaveSession={handleSaveSession}
        profile={profile}
      />

      {/* Onboarding & Profile Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        profile={profile}
        onSaveProfile={setProfile}
        onResetProfile={handleResetProfile}
        onLoadDemoData={handleLoadDemoData}
      />

      {/* Instant Post-Session AI Coach Evaluation Modal */}
      <AIEvaluationModal
        isOpen={isAIEvalModalOpen}
        onClose={() => setIsAIEvalModalOpen(false)}
        session={evaluatedSession}
        profile={profile}
      />
    </div>
  );
}
