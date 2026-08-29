import React, { useState, useRef } from "react";
import {
  Flame,
  User,
  Shield,
  Target,
  Sparkles,
  ArrowRight,
  Trophy,
  Dumbbell,
  Crosshair,
  CheckCircle2,
  Play,
  Layers,
  BarChart3,
  Zap,
  Activity,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";
import { PlayerProfile, Playstyle, PrimaryPosition, DominantHand } from "../types";

interface HomeScreenProps {
  initialData?: PlayerProfile;
  onSaveProfile: (profile: PlayerProfile) => void;
  onLoadDemoData: () => void;
  onEnterDashboard?: () => void;
}

const PLAYSTYLES: { id: Playstyle; label: string; desc: string; icon: string }[] = [
  {
    id: "Sharpshooter / Perimeter Specialist",
    label: "Sharpshooter",
    desc: "Deadly catch-and-shoot, 0° corner 3s, and floor spacing.",
    icon: "🎯",
  },
  {
    id: "Slasher / Rim Finisher",
    label: "Slasher & Finisher",
    desc: "Explosive downhill drives, ambidextrous layups, and floaters.",
    icon: "⚡",
  },
  {
    id: "Playmaker / Floor General",
    label: "Playmaker",
    desc: "High basketball IQ, court vision, tight handle, and transition pace.",
    icon: "🧠",
  },
  {
    id: "3-and-D Wing",
    label: "3-and-D Wing",
    desc: "Lockdown perimeter defense and high-efficiency corner 3s.",
    icon: "🛡️",
  },
  {
    id: "Lockdown Defender & Hustle",
    label: "Lockdown Defender",
    desc: "On-ball pressure, steals, deflections, and boxouts.",
    icon: "🔒",
  },
  {
    id: "Post Scorer & Anchor",
    label: "Post & Paint Anchor",
    desc: "Paint dominance, mid-range fades, and rim protection.",
    icon: "🏰",
  },
  {
    id: "All-Around Balanced",
    label: "All-Around Balanced",
    desc: "Complete skillset across scoring, playmaking, and defense.",
    icon: "🌟",
  },
];

const POSITIONS: PrimaryPosition[] = [
  "Point Guard (PG)",
  "Shooting Guard (SG)",
  "Small Forward (SF)",
  "Power Forward (PF)",
  "Center (C)",
  "Combo Guard (PG/SG)",
  "Wing (SG/SF)",
  "Big (PF/C)",
];

const SKILL_LEVELS = [
  "Middle School",
  "High School",
  "College",
  "Rec / Amateur",
  "Semi-Pro / Pro",
] as const;

export const HomeScreen: React.FC<HomeScreenProps> = ({
  initialData,
  onSaveProfile,
  onLoadDemoData,
  onEnterDashboard,
}) => {
  const formRef = useRef<HTMLDivElement>(null);
  const [showCalibrationForm, setShowCalibrationForm] = useState(false);

  // Height & Weight as integers in centimeters & kilograms
  const [name, setName] = useState(initialData?.name || "Ashish");
  const [age, setAge] = useState<number>(Number(initialData?.age) || 18);
  const [heightCm, setHeightCm] = useState<number>(
    typeof initialData?.height === "number"
      ? initialData.height
      : parseInt(String(initialData?.height || "185")) || 185
  );
  const [weightKg, setWeightKg] = useState<number>(
    typeof initialData?.weight === "number"
      ? initialData.weight
      : parseInt(String(initialData?.weight || "80")) || 80
  );
  const [position, setPosition] = useState<PrimaryPosition>(
    initialData?.position || "Point Guard (PG)"
  );
  const [dominantHand, setDominantHand] = useState<DominantHand>(
    initialData?.dominantHand || "Right"
  );
  const [selectedPlaystyles, setSelectedPlaystyles] = useState<Playstyle[]>(() => {
    if (initialData?.playstyles && initialData.playstyles.length > 0) {
      return initialData.playstyles.slice(0, 3);
    }
    return ["Sharpshooter / Perimeter Specialist"];
  });

  const [longTermGoal, setLongTermGoal] = useState<string>(
    initialData?.goals ||
      "Lead my league in true shooting percentage (above 42% 3PT), master weak-hand finishing, and maintain an 8+ defensive hustle rating."
  );
  const [level, setLevel] = useState<PlayerProfile["level"]>(
    initialData?.level || "High School"
  );

  const [validationError, setValidationError] = useState<string | null>(null);

  const togglePlaystyle = (styleId: Playstyle) => {
    if (selectedPlaystyles.includes(styleId)) {
      if (selectedPlaystyles.length === 1) return;
      setSelectedPlaystyles(selectedPlaystyles.filter((s) => s !== styleId));
    } else {
      if (selectedPlaystyles.length >= 3) {
        setValidationError("You can choose up to 3 playstyles at a time.");
        return;
      }
      setValidationError(null);
      setSelectedPlaystyles([...selectedPlaystyles, styleId]);
    }
  };

  const handleGetStartedClick = () => {
    setShowCalibrationForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError("Please enter your player name or nickname to continue.");
      return;
    }
    if (!heightCm || heightCm < 100 || heightCm > 240) {
      setValidationError("Please enter a valid height in centimeters (e.g. 185 cm).");
      return;
    }
    if (!weightKg || weightKg < 30 || weightKg > 200) {
      setValidationError("Please enter a valid weight in kilograms (e.g. 80 kg).");
      return;
    }

    setValidationError(null);

    const formattedPlaystyle = selectedPlaystyles
      .map((s) => s.split("/")[0].trim())
      .join(" • ");

    onSaveProfile({
      name: name.trim(),
      age: Math.round(age),
      height: Math.round(heightCm), // INTEGER IN CM ONLY
      weight: Math.round(weightKg), // INTEGER IN KG ONLY
      position,
      dominantHand,
      playstyle: formattedPlaystyle,
      playstyles: selectedPlaystyles,
      goals: longTermGoal.trim(),
      level,
      avatarColor: "from-orange-500 to-amber-600",
      isProfileCompleted: true,
    });

    if (onEnterDashboard) {
      onEnterDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between selection:bg-orange-500 selection:text-zinc-950">
      {/* Top Ambient Glow & Accent Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-red-600 shadow-lg shadow-orange-500/20"></div>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-12">
        {/* ================= HERO INTRO SECTION ================= */}
        <div className="relative text-center space-y-6 pt-4">
          {/* Animated Ambient Light Spheres */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-tr from-orange-600/15 via-amber-500/10 to-red-600/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse"></div>

          {/* Subtitle Badge */}
          <div className="inline-flex items-center space-x-2 px-5 py-2 rounded-full bg-zinc-900/90 border border-orange-500/30 text-orange-400 text-xs font-black tracking-wider uppercase shadow-xl hover:scale-105 transition-transform duration-200 cursor-default">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping"></span>
            <span>Basketball Progress Engine &bull; Training AI</span>
          </div>

          {/* Master Name: COURT METRICS */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-7xl font-black tracking-tight text-white uppercase drop-shadow-2xl">
              <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
                Court{" "}
              </span>
              <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-red-500 bg-clip-text text-transparent">
                Metrics
              </span>
            </h1>
            <p className="text-zinc-400 text-sm sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              Spatial shot accuracy diagnostic across <strong className="text-zinc-200">0° baseline</strong>,{" "}
              <strong className="text-zinc-200">45° wings</strong>, <strong className="text-zinc-200">90° top 3s</strong>,{" "}
              <strong className="text-zinc-200">mid-range elbows</strong>, and{" "}
              <strong className="text-zinc-200">weak-hand layups</strong> with instant AI coaching.
            </p>
          </div>

          {/* Main Action Buttons: GET STARTED (Expanding on Hover) */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              id="hero-get-started-btn"
              onClick={handleGetStartedClick}
              className="group flex items-center space-x-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black text-base shadow-2xl shadow-orange-500/30 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-orange-400/50"
            >
              <Flame className="w-6 h-6 stroke-[2.8] text-zinc-950 group-hover:rotate-12 transition-transform duration-300" />
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 stroke-[2.8] group-hover:translate-x-1.5 transition-transform duration-300" />
            </button>

            <button
              id="hero-explore-demo-btn"
              onClick={onLoadDemoData}
              className="flex items-center space-x-2.5 px-6 py-4 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-zinc-200 hover:text-white font-bold text-sm shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Explore Demo Player (Ashish)</span>
            </button>
          </div>

          {/* Live Metric Pills (Interactive Micro-Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-3xl mx-auto">
            <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-orange-500/40 hover:bg-zinc-900 transition-all duration-200 transform hover:scale-105 cursor-default shadow-md text-left">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Shot Angles</span>
              <span className="text-sm font-black text-orange-400 mt-0.5 block">0°, 45°, 90° Geometry</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-emerald-500/40 hover:bg-zinc-900 transition-all duration-200 transform hover:scale-105 cursor-default shadow-md text-left">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Finishing</span>
              <span className="text-sm font-black text-emerald-400 mt-0.5 block">Right &amp; Left Hand</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-sky-500/40 hover:bg-zinc-900 transition-all duration-200 transform hover:scale-105 cursor-default shadow-md text-left">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Rating Engine</span>
              <span className="text-sm font-black text-sky-400 mt-0.5 block">NBA 2K Attributes</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-amber-500/40 hover:bg-zinc-900 transition-all duration-200 transform hover:scale-105 cursor-default shadow-md text-left">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">AI Feedback</span>
              <span className="text-sm font-black text-amber-400 mt-0.5 block">Instant Post-Session</span>
            </div>
          </div>
        </div>

        {/* ================= INTERACTIVE FEATURE HIGHLIGHTS GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-orange-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl space-y-3 group cursor-default">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform duration-200">
              <Crosshair className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-black text-zinc-100 group-hover:text-orange-400 transition-colors">
              Spatial Court Heatmap
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Interactive 16-zone half court visualizing exact hot and cold spots across perimeter 3s, mid-range pull-ups, and rim finishes.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl space-y-3 group cursor-default">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform duration-200">
              <Dumbbell className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-black text-zinc-100 group-hover:text-amber-400 transition-colors">
              Balanced 3-Tier Scoring
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Equal performance tracking across 3-Pointers, Mid-Range elbows, and Right/Left weak-hand layups without bias.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-sky-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl space-y-3 group cursor-default">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform duration-200">
              <Sparkles className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-black text-zinc-100 group-hover:text-sky-400 transition-colors">
              Instant AI Coaching
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Generates letter grades, mechanic diagnoses, weak-area attack plans, and 5-day customized workout regimens.
            </p>
          </div>
        </div>

        {/* ================= CALIBRATION & PLAYER SETUP FORM ================= */}
        <div
          ref={formRef}
          id="player-setup-section"
          className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden transition-all"
        >
          {/* Ambient Glow in Card */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-orange-400">
                Player Profile &amp; Archetype Setup
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Calibrate Your Court Metrics Profile
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Set your physical metrics, position, playstyles, and targets
              </p>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs text-zinc-400 font-semibold">Ready to Train</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 pt-6 relative z-10">
            {validationError && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center space-x-2">
                <span>⚠️ {validationError}</span>
              </div>
            )}

            {/* Step 1: Bio & Physical Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-black text-xs border border-orange-500/30">
                  1
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center space-x-2">
                  <User className="w-4 h-4 text-orange-400" />
                  <span>Player Bio &amp; Physical Metrics</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Player Name / Nickname <span className="text-orange-400">*</span>
                  </label>
                  <input
                    id="home-player-name-input"
                    type="text"
                    required
                    placeholder="e.g. Ashish, Steph, Kobe..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Age (Years)</label>
                  <input
                    id="home-player-age-input"
                    type="number"
                    min="6"
                    max="80"
                    placeholder="e.g. 18"
                    value={age || ""}
                    onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span>Height (in Centimeters only)</span>
                    <span className="text-orange-400 font-bold">cm</span>
                  </label>
                  <div className="relative">
                    <input
                      id="home-player-height-input"
                      type="number"
                      min="100"
                      max="240"
                      step="1"
                      required
                      placeholder="e.g. 185"
                      value={heightCm || ""}
                      onChange={(e) => setHeightCm(parseInt(e.target.value) || 0)}
                      className="w-full pl-4 pr-12 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                    />
                    <span className="absolute right-4 top-3 text-xs font-bold text-zinc-400 pointer-events-none">
                      cm
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span>Weight (in Kilograms only)</span>
                    <span className="text-orange-400 font-bold">kg</span>
                  </label>
                  <div className="relative">
                    <input
                      id="home-player-weight-input"
                      type="number"
                      min="30"
                      max="200"
                      step="1"
                      required
                      placeholder="e.g. 80"
                      value={weightKg || ""}
                      onChange={(e) => setWeightKg(parseInt(e.target.value) || 0)}
                      className="w-full pl-4 pr-12 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                    />
                    <span className="absolute right-4 top-3 text-xs font-bold text-zinc-400 pointer-events-none">
                      kg
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Competition / Skill Level</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {SKILL_LEVELS.map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      id={`level-btn-${lvl}`}
                      onClick={() => setLevel(lvl)}
                      className={`py-2.5 px-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer transform hover:scale-105 active:scale-95 ${
                        level === lvl
                          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 font-black shadow-md shadow-orange-500/20"
                          : "bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: Position & Dominant Hand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-black text-xs border border-orange-500/30">
                  2
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-orange-400" />
                  <span>Court Position &amp; Dominant Hand</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Primary Court Position</label>
                  <select
                    id="home-position-select"
                    value={position}
                    onChange={(e) => setPosition(e.target.value as PrimaryPosition)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium cursor-pointer"
                  >
                    {POSITIONS.map((pos) => (
                      <option key={pos} value={pos} className="bg-zinc-900 text-white">
                        {pos}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Dominant Shooting Hand</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Right", "Left", "Ambidextrous"] as DominantHand[]).map((hand) => (
                      <button
                        type="button"
                        key={hand}
                        id={`home-hand-btn-${hand}`}
                        onClick={() => setDominantHand(hand)}
                        className={`py-3 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer transform hover:scale-105 active:scale-95 ${
                          dominantHand === hand
                            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 font-black shadow-md shadow-orange-500/20"
                            : "bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
                        }`}
                      >
                        {hand}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Playstyles Multi-Select */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-black text-xs border border-orange-500/30">
                    3
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center space-x-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span>How Do You Play? (Choose up to 3)</span>
                  </h3>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-orange-400">
                  {selectedPlaystyles.length} of 3 Selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PLAYSTYLES.map((style) => {
                  const isSelected = selectedPlaystyles.includes(style.id);
                  return (
                    <div
                      key={style.id}
                      id={`home-playstyle-${style.id}`}
                      onClick={() => togglePlaystyle(style.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 flex items-start space-x-3 select-none transform hover:scale-105 active:scale-95 ${
                        isSelected
                          ? "bg-orange-500/15 border-orange-500 ring-1 ring-orange-500/50 shadow-lg shadow-orange-500/15"
                          : "bg-zinc-950 border-zinc-800/90 hover:border-zinc-700 hover:bg-zinc-900"
                      }`}
                    >
                      <span className="text-2xl mt-0.5">{style.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-xs font-black ${isSelected ? "text-orange-400" : "text-zinc-200"}`}>
                            {style.label}
                          </h4>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-orange-500 text-zinc-950 flex items-center justify-center text-[10px] font-black shrink-0">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-snug mt-1">{style.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Long-Term Ambition */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-black text-xs border border-orange-500/30">
                  4
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center space-x-2">
                  <Target className="w-4 h-4 text-orange-400" />
                  <span>Long-Term Basketball Ambition / Target</span>
                </h3>
              </div>

              <div>
                <textarea
                  id="home-goals-textarea"
                  rows={2}
                  placeholder="e.g. Shoot 45%+ from 3PT, master weak-hand finishing, earn starting point guard spot on varsity team, and maintain 8+ defensive rating..."
                  value={longTermGoal}
                  onChange={(e) => setLongTermGoal(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                />
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                id="load-demo-data-btn"
                onClick={onLoadDemoData}
                className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 cursor-pointer shadow-md"
              >
                <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Load Sample Data (Ashish)</span>
              </button>

              <button
                type="submit"
                id="start-tracking-btn"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black text-sm shadow-xl shadow-orange-500/25 transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer ring-1 ring-orange-400/50"
              >
                <Sparkles className="w-5 h-5 stroke-[2.5]" />
                <span>Save Profile &amp; Launch Court Tracker</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-zinc-900 text-center text-xs text-zinc-500">
        Court Metrics &bull; Basketball Progress Engine &bull; Training AI
      </footer>
    </div>
  );
};
