import React, { useState } from "react";
import { X, User, Trophy, Flame, Shield, Target, Award, Sparkles, CheckCircle2, RotateCcw, Play } from "lucide-react";
import { PlayerProfile, Playstyle, PrimaryPosition, DominantHand } from "../types";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  onSaveProfile: (updated: PlayerProfile) => void;
  onResetProfile?: () => void;
  onLoadDemoData?: () => void;
  isFirstTime?: boolean;
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
    desc: "High basketball IQ, vision, handle, and transition pace.",
    icon: "🧠",
  },
  {
    id: "3-and-D Wing",
    label: "3-and-D Wing",
    desc: "Perimeter lockdown defense and corner 3-point accuracy.",
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
    desc: "Paint presence, mid-range fades, and rim protection.",
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

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onResetProfile,
  onLoadDemoData,
  isFirstTime = false,
}) => {
  const [name, setName] = useState(profile.name || "");
  const [age, setAge] = useState<number>(Number(profile.age) || 18);
  const [heightCm, setHeightCm] = useState<number>(
    typeof profile.height === "number" ? profile.height : parseInt(String(profile.height)) || 185
  );
  const [weightKg, setWeightKg] = useState<number>(
    typeof profile.weight === "number" ? profile.weight : parseInt(String(profile.weight)) || 80
  );
  const [position, setPosition] = useState<PrimaryPosition>(profile.position || "Point Guard (PG)");
  const [dominantHand, setDominantHand] = useState<DominantHand>(profile.dominantHand || "Right");
  const [selectedPlaystyles, setSelectedPlaystyles] = useState<Playstyle[]>(() => {
    if (profile.playstyles && profile.playstyles.length > 0) {
      return profile.playstyles.slice(0, 3);
    }
    return ["Sharpshooter / Perimeter Specialist"];
  });
  const [goals, setGoals] = useState<string>(
    profile.goals || "Lead my team in 3PT%, master weak-hand finishing, and maintain an 8+ defensive rating."
  );
  const [level, setLevel] = useState<PlayerProfile["level"]>(profile.level || "High School");

  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formattedPlaystyle = selectedPlaystyles
      .map((s) => s.split("/")[0].trim())
      .join(" • ");

    onSaveProfile({
      ...profile,
      name: name.trim(),
      age: Math.round(age),
      height: Math.round(heightCm), // Integer in cm
      weight: Math.round(weightKg), // Integer in kg
      position,
      dominantHand,
      playstyle: formattedPlaystyle,
      playstyles: selectedPlaystyles,
      goals: goals.trim(),
      level,
      isProfileCompleted: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header Graphic */}
        <div className="relative bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-950/30 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                <Trophy className="w-6 h-6 text-yellow-300 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-white">
                  {isFirstTime ? "Welcome to Swish Basketball" : "Player Profile & Style"}
                </h2>
                <p className="text-xs font-semibold text-orange-100">
                  Calibrate your physical metrics, playstyles, and long-term targets
                </p>
              </div>
            </div>
            {!isFirstTime && (
              <button
                id="close-profile-modal-btn"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-zinc-950/40 hover:bg-zinc-950/60 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-white max-h-[75vh] overflow-y-auto custom-scrollbar">
          {validationError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
              ⚠️ {validationError}
            </div>
          )}

          {/* Section 1: Basic Identity */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center space-x-2">
              <User className="w-4 h-4 text-orange-400" />
              <span>Player Identity & Physical Metrics</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">First Name / Nickname</label>
                <input
                  id="profile-name-input"
                  type="text"
                  required
                  placeholder="e.g. Ashish, Steph..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Age (Years)</label>
                <input
                  id="profile-age-input"
                  type="number"
                  min="6"
                  max="80"
                  value={age || ""}
                  onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>Height (in Centimeters only)</span>
                  <span className="text-orange-400 font-bold text-xs">cm</span>
                </label>
                <div className="relative">
                  <input
                    id="profile-height-input"
                    type="number"
                    min="100"
                    max="240"
                    step="1"
                    placeholder="e.g. 185"
                    value={heightCm || ""}
                    onChange={(e) => setHeightCm(parseInt(e.target.value) || 0)}
                    className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                  <span className="absolute right-4 top-2.5 text-xs font-bold text-zinc-400 pointer-events-none">
                    cm
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>Weight (in Kilograms only)</span>
                  <span className="text-orange-400 font-bold text-xs">kg</span>
                </label>
                <div className="relative">
                  <input
                    id="profile-weight-input"
                    type="number"
                    min="30"
                    max="200"
                    step="1"
                    placeholder="e.g. 80"
                    value={weightKg || ""}
                    onChange={(e) => setWeightKg(parseInt(e.target.value) || 0)}
                    className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                  <span className="absolute right-4 top-2.5 text-xs font-bold text-zinc-400 pointer-events-none">
                    kg
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Position & Dominant Hand */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-orange-400" />
              <span>Position & Dominant Hand</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Primary Court Position</label>
                <select
                  id="profile-position-select"
                  value={position}
                  onChange={(e) => setPosition(e.target.value as PrimaryPosition)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  {POSITIONS.map((pos) => (
                    <option key={pos} value={pos} className="bg-zinc-900 text-white">
                      {pos}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Dominant Hand</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Right", "Left", "Ambidextrous"] as DominantHand[]).map((hand) => (
                    <button
                      type="button"
                      key={hand}
                      id={`profile-hand-btn-${hand}`}
                      onClick={() => setDominantHand(hand)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        dominantHand === hand
                          ? "bg-orange-500 text-zinc-950 shadow-md shadow-orange-500/20"
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

          {/* Section 3: Playstyles (Select Up to 3) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center space-x-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>How Do You Play? (Choose up to 3)</span>
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-700 text-orange-400">
                {selectedPlaystyles.length} of 3 Selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PLAYSTYLES.map((style) => {
                const isSelected = selectedPlaystyles.includes(style.id);
                return (
                  <div
                    key={style.id}
                    id={`profile-playstyle-${style.id}`}
                    onClick={() => togglePlaystyle(style.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 select-none ${
                      isSelected
                        ? "bg-orange-500/15 border-orange-500 shadow-md shadow-orange-500/10 ring-1 ring-orange-500/50"
                        : "bg-zinc-950 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900"
                    }`}
                  >
                    <span className="text-xl">{style.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-xs font-bold ${isSelected ? "text-orange-400" : "text-zinc-200"}`}>
                          {style.label}
                        </h4>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-snug mt-0.5">{style.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Long-Term Ambition */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center space-x-2">
              <Target className="w-4 h-4 text-orange-400" />
              <span>Long-Term Basketball Ambition / Target</span>
            </h3>
            <textarea
              id="profile-goals-input"
              rows={2}
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="e.g. 45%+ 3PT shooting, ambidextrous rim finishes, starting varsity role..."
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              {onResetProfile && (
                <button
                  type="button"
                  id="reset-profile-btn"
                  onClick={() => {
                    onResetProfile();
                    onClose();
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Data</span>
                </button>
              )}
              {onLoadDemoData && (
                <button
                  type="button"
                  id="modal-load-demo-btn"
                  onClick={() => {
                    onLoadDemoData();
                    onClose();
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-amber-400 hover:bg-amber-500/10 border border-amber-500/20 transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-amber-400" />
                  <span>Load Sample</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="save-profile-btn"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black text-xs shadow-lg shadow-orange-500/25 transition-all cursor-pointer active:scale-95"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
