import React, { useState, useMemo } from "react";
import {
  X,
  Flame,
  Plus,
  Trash2,
  Sparkles,
  Award,
  Shield,
  Clock,
  Activity,
  Zap,
  Target,
  Trophy,
  CheckCircle2,
} from "lucide-react";
import {
  TrainingSession,
  ShootingSummary,
  DrillItem,
  MatchStats,
  PlayerProfile,
} from "../types";

interface LogSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSession: (session: TrainingSession) => void;
  profile: PlayerProfile;
}

export const LogSessionModal: React.FC<LogSessionModalProps> = ({
  isOpen,
  onClose,
  onSaveSession,
  profile,
}) => {
  const [sessionType, setSessionType] = useState<"practice" | "match">("practice");
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [exhaustion, setExhaustion] = useState<number>(6); // 1-10

  // 3-Pointers (with 0°, 45°, 90° degrees)
  const [threePt, setThreePt] = useState({
    corner0Left: { made: 10, attempted: 20, contestedMade: 0, contestedAttempted: 0 },
    wing45Left: { made: 12, attempted: 20, contestedMade: 0, contestedAttempted: 0 },
    top90: { made: 14, attempted: 20, contestedMade: 0, contestedAttempted: 0 },
    wing45Right: { made: 11, attempted: 20, contestedMade: 0, contestedAttempted: 0 },
    corner0Right: { made: 9, attempted: 20, contestedMade: 0, contestedAttempted: 0 },
  });

  // Mid-Range
  const [midRange, setMidRange] = useState({
    baselineLeft: { made: 6, attempted: 10, contestedMade: 0, contestedAttempted: 0 },
    wingLeft: { made: 7, attempted: 10, contestedMade: 0, contestedAttempted: 0 },
    freeThrowHighPost: { made: 8, attempted: 10, contestedMade: 0, contestedAttempted: 0 },
    wingRight: { made: 6, attempted: 10, contestedMade: 0, contestedAttempted: 0 },
    baselineRight: { made: 5, attempted: 10, contestedMade: 0, contestedAttempted: 0 },
  });

  // Paint Floater
  const [paintShort, setPaintShort] = useState({
    paintFloater: { made: 8, attempted: 12, contestedMade: 0, contestedAttempted: 0 },
  });

  // Layups Package - Strictly Right Hand and Left Hand
  const [layups, setLayups] = useState({
    rightHand: { made: 15, attempted: 16, contestedMade: 0, contestedAttempted: 0 },
    leftHand: { made: 9, attempted: 14, contestedMade: 0, contestedAttempted: 0 },
  });

  // Free Throws
  const [freeThrows, setFreeThrows] = useState({ made: 18, attempted: 20 });

  // Handling & Defense Stats
  const [handlingRating, setHandlingRating] = useState<number>(4); // 1-5
  const [handlingMistakes, setHandlingMistakes] = useState<number>(1);
  const [handlingBobbles, setHandlingBobbles] = useState<number>(1);

  const [defensiveIntensity, setDefensiveIntensity] = useState<number>(8); // 1-10
  const [steals, setSteals] = useState<number>(2);
  const [blocks, setBlocks] = useState<number>(1);
  const [defMistakes, setDefMistakes] = useState<number>(1);

  // Match specific stats
  const [matchFormat, setMatchFormat] = useState<MatchStats["format"]>("5v5 Full Court");
  const [matchResult, setMatchResult] = useState<MatchStats["result"]>("Win");
  const [assists, setAssists] = useState<number>(6);
  const [oReb, setOReb] = useState<number>(2);
  const [dReb, setDReb] = useState<number>(4);
  const [turnovers, setTurnovers] = useState<number>(2);
  const [fouls, setFouls] = useState<number>(2);
  const [violations, setViolations] = useState<number>(0);
  const [passesMade, setPassesMade] = useState<number>(25);
  const [matchNotes, setMatchNotes] = useState<string>("");

  // Practice Drills
  const [drills, setDrills] = useState<DrillItem[]>([
    {
      id: "drill-1",
      name: "Spot-Up 3PT Series (0°, 45°, 90°)",
      category: "Shooting",
      durationMinutes: 20,
      intensity: 7,
      aim: "Make 50 total 3s",
      actualResult: "56 makes achieved",
      mistakes: 2,
    },
    {
      id: "drill-2",
      name: "Cone Zig-Zag Crossover & Finishing",
      category: "Dribbling",
      durationMinutes: 15,
      intensity: 8,
      aim: "0 ball losses through 5 sets",
      actualResult: "5 sets completed with 1 bobble",
      mistakes: 1,
    },
  ]);

  // New Drill inputs
  const [newDrillName, setNewDrillName] = useState("");
  const [newDrillCat, setNewDrillCat] = useState<DrillItem["category"]>("Custom");
  const [newDrillAim, setNewDrillAim] = useState("");
  const [newDrillResult, setNewDrillResult] = useState("");
  const [newDrillMins, setNewDrillMins] = useState(15);
  const [newDrillIntensity, setNewDrillIntensity] = useState(7);
  const [newDrillMistakes, setNewDrillMistakes] = useState(0);

  // 1. CALCULATE AUTOMATIC POINTS from entered shots!
  const calculatedPoints = useMemo(() => {
    const total3Made =
      threePt.corner0Left.made +
      threePt.wing45Left.made +
      threePt.top90.made +
      threePt.wing45Right.made +
      threePt.corner0Right.made;

    const totalMidMade =
      midRange.baselineLeft.made +
      midRange.wingLeft.made +
      midRange.freeThrowHighPost.made +
      midRange.wingRight.made +
      midRange.baselineRight.made;

    const totalPaintMade = paintShort.paintFloater.made;

    const totalLayupMade =
      layups.rightHand.made +
      layups.leftHand.made;

    const ftMade = freeThrows.made;

    // 3s = 3 pts, 2s (mid, paint, layups) = 2 pts, FT = 1 pt
    return total3Made * 3 + (totalMidMade + totalPaintMade + totalLayupMade) * 2 + ftMade * 1;
  }, [threePt, midRange, paintShort, layups, freeThrows]);

  if (!isOpen) return null;

  const handleAddDrill = () => {
    if (!newDrillName.trim()) return;
    const drill: DrillItem = {
      id: `drill-${Date.now()}`,
      name: newDrillName,
      category: newDrillCat,
      durationMinutes: newDrillMins,
      intensity: newDrillIntensity,
      aim: newDrillAim || "Improve execution",
      actualResult: newDrillResult || "Completed",
      mistakes: newDrillMistakes,
    };
    setDrills([...drills, drill]);
    setNewDrillName("");
    setNewDrillAim("");
    setNewDrillResult("");
    setNewDrillMistakes(0);
  };

  const handleRemoveDrill = (id: string) => {
    setDrills(drills.filter((d) => d.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Aggregate Shooting
    const total3Made =
      threePt.corner0Left.made +
      threePt.wing45Left.made +
      threePt.top90.made +
      threePt.wing45Right.made +
      threePt.corner0Right.made;
    const total3Att =
      threePt.corner0Left.attempted +
      threePt.wing45Left.attempted +
      threePt.top90.attempted +
      threePt.wing45Right.attempted +
      threePt.corner0Right.attempted;

    const totalMidMade =
      midRange.baselineLeft.made +
      midRange.wingLeft.made +
      midRange.freeThrowHighPost.made +
      midRange.wingRight.made +
      midRange.baselineRight.made;
    const totalMidAtt =
      midRange.baselineLeft.attempted +
      midRange.wingLeft.attempted +
      midRange.freeThrowHighPost.attempted +
      midRange.wingRight.attempted +
      midRange.baselineRight.attempted;

    const totalPaintMade = paintShort.paintFloater.made;
    const totalPaintAtt = paintShort.paintFloater.attempted;

    const totalLayupMade =
      layups.rightHand.made +
      layups.leftHand.made;
    const totalLayupAtt =
      layups.rightHand.attempted +
      layups.leftHand.attempted;

    const totalFGM = total3Made + totalMidMade + totalPaintMade + totalLayupMade;
    const totalFGA = total3Att + totalMidAtt + totalPaintAtt + totalLayupAtt;

    const shootingStats: ShootingSummary = {
      threePt: {
        corner0Left: threePt.corner0Left,
        wing45Left: threePt.wing45Left,
        top90: threePt.top90,
        wing45Right: threePt.wing45Right,
        corner0Right: threePt.corner0Right,
        totalMade: total3Made,
        totalAttempted: total3Att,
        percentage: total3Att > 0 ? (total3Made / total3Att) * 100 : 0,
      },
      midRange: {
        baselineLeft: midRange.baselineLeft,
        wingLeft: midRange.wingLeft,
        freeThrowHighPost: midRange.freeThrowHighPost,
        wingRight: midRange.wingRight,
        baselineRight: midRange.baselineRight,
        totalMade: totalMidMade,
        totalAttempted: totalMidAtt,
        percentage: totalMidAtt > 0 ? (totalMidMade / totalMidAtt) * 100 : 0,
      },
      paintShort: {
        paintFloater: paintShort.paintFloater,
        totalMade: totalPaintMade,
        totalAttempted: totalPaintAtt,
        percentage: totalPaintAtt > 0 ? (totalPaintMade / totalPaintAtt) * 100 : 0,
      },
      layups: {
        rightHand: layups.rightHand,
        leftHand: layups.leftHand,
        totalMade: totalLayupMade,
        totalAttempted: totalLayupAtt,
        percentage: totalLayupAtt > 0 ? (totalLayupMade / totalLayupAtt) * 100 : 0,
      },
      freeThrows: {
        made: freeThrows.made,
        attempted: freeThrows.attempted,
        percentage: freeThrows.attempted > 0 ? (freeThrows.made / freeThrows.attempted) * 100 : 0,
      },
      overall: {
        totalMade: totalFGM,
        totalAttempted: totalFGA,
        fieldGoalPercentage: totalFGA > 0 ? (totalFGM / totalFGA) * 100 : 0,
        effectiveFgPercentage: totalFGA > 0 ? ((totalFGM + 0.5 * total3Made) / totalFGA) * 100 : 0,
        totalPoints: calculatedPoints,
      },
    };

    const session: TrainingSession = {
      id: `session-${Date.now()}`,
      date: new Date().toISOString(),
      type: sessionType,
      title:
        title.trim() ||
        (sessionType === "match"
          ? `${matchFormat} Match (${matchResult})`
          : "Basketball Skills & Shooting Practice"),
      durationMinutes,
      exhaustion,
      shootingStats,
      handlingStats: {
        rating: handlingRating,
        mistakes: handlingMistakes,
        bobbles: handlingBobbles,
      },
      defenseStats: {
        intensity: defensiveIntensity,
        steals,
        blocks,
        mistakesOrBlowBys: defMistakes,
      },
      drills: sessionType === "practice" ? drills : undefined,
      matchData:
        sessionType === "match"
          ? {
              format: matchFormat,
              result: matchResult,
              durationMinutes,
              exhaustion,
              defensiveIntensity,
              ballHandlingRating: handlingRating,
              calculatedPoints,
              assists,
              offensiveRebounds: oReb,
              defensiveRebounds: dReb,
              totalRebounds: oReb + dReb,
              steals,
              blocks,
              turnovers,
              foulsCommitted: fouls,
              violations,
              passesMade,
              matchNotes,
            }
          : undefined,
    };

    onSaveSession(session);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-950/30 flex items-center justify-center border border-white/20">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Log Basketball Session</h2>
              <p className="text-xs text-orange-100 font-medium">
                Record shots by zone & degree, drills or match box score, with automated points
              </p>
            </div>
          </div>

          <button
            id="close-log-session-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-950/30 hover:bg-zinc-950/50 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-white max-h-[80vh] overflow-y-auto">
          {/* Top Session Type Switcher */}
          <div className="grid grid-cols-2 gap-3 p-1.5 rounded-xl bg-zinc-950 border border-zinc-800">
            <button
              type="button"
              id="type-drills-btn"
              onClick={() => setSessionType("practice")}
              className={`py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                sessionType === "practice"
                  ? "bg-orange-500 text-zinc-950 shadow-md shadow-orange-500/20 font-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Practice & Drills</span>
            </button>
            <button
              type="button"
              id="type-match-btn"
              onClick={() => setSessionType("match")}
              className={`py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                sessionType === "match"
                  ? "bg-orange-500 text-zinc-950 shadow-md shadow-orange-500/20 font-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Match Play & Box Score</span>
            </button>
          </div>

          {/* General Session Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Session Title / Tag</label>
              <input
                type="text"
                placeholder={sessionType === "match" ? "e.g. 5v5 Rec League Game" : "e.g. Morning 3PT Shooting"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                <span>Duration (Minutes)</span>
              </label>
              <input
                type="number"
                min="5"
                max="240"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <Activity className="w-3.5 h-3.5 text-orange-400" />
                  <span>Exhaustion / RPE</span>
                </span>
                <span className="text-orange-400 font-bold">{exhaustion}/10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={exhaustion}
                onChange={(e) => setExhaustion(Number(e.target.value))}
                className="w-full accent-orange-500 mt-2"
              />
            </div>
          </div>

          {/* Match specifics if match selected */}
          {sessionType === "match" && (
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
              <span className="text-xs font-bold uppercase text-orange-400 tracking-wider">
                Match Details & Format
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Match Format</label>
                  <select
                    value={matchFormat}
                    onChange={(e) => setMatchFormat(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs"
                  >
                    <option value="5v5 Full Court">5v5 Full Court</option>
                    <option value="3v3 Half Court">3v3 Half Court</option>
                    <option value="1v1">1v1 King of Court</option>
                    <option value="Pickup Scrimmage">Pickup Scrimmage</option>
                    <option value="Official League Game">Official League Game</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Result</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["Win", "Loss"] as const).map((res) => (
                      <button
                        type="button"
                        key={res}
                        onClick={() => setMatchResult(res)}
                        className={`py-2 rounded-lg text-xs font-bold ${
                          matchResult === res
                            ? res === "Win"
                              ? "bg-green-500 text-zinc-950 font-black"
                              : "bg-red-500 text-white font-black"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Defensive Intensity</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={defensiveIntensity}
                      onChange={(e) => setDefensiveIntensity(Number(e.target.value))}
                      className="w-full accent-orange-500"
                    />
                    <span className="text-xs font-bold text-orange-400">{defensiveIntensity}/10</span>
                  </div>
                </div>
              </div>

              {/* Match Traditional Box-score Stats */}
              <div className="pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-300">Box Score Traditional Metrics</span>
                  {/* Automated Points Callout */}
                  <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-xs font-black">
                      Total Calculated Points: {calculatedPoints} PTS
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">Assists (AST)</label>
                    <input
                      type="number"
                      min="0"
                      value={assists}
                      onChange={(e) => setAssists(Number(e.target.value) || 0)}
                      className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">Off Reb (OREB)</label>
                    <input
                      type="number"
                      min="0"
                      value={oReb}
                      onChange={(e) => setOReb(Number(e.target.value) || 0)}
                      className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">Def Reb (DREB)</label>
                    <input
                      type="number"
                      min="0"
                      value={dReb}
                      onChange={(e) => setDReb(Number(e.target.value) || 0)}
                      className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">Steals (STL)</label>
                    <input
                      type="number"
                      min="0"
                      value={steals}
                      onChange={(e) => setSteals(Number(e.target.value) || 0)}
                      className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">Blocks (BLK)</label>
                    <input
                      type="number"
                      min="0"
                      value={blocks}
                      onChange={(e) => setBlocks(Number(e.target.value) || 0)}
                      className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">Turnovers (TO)</label>
                    <input
                      type="number"
                      min="0"
                      value={turnovers}
                      onChange={(e) => setTurnovers(Number(e.target.value) || 0)}
                      className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">Fouls / Violations</label>
                    <input
                      type="number"
                      min="0"
                      value={fouls}
                      onChange={(e) => setFouls(Number(e.target.value) || 0)}
                      className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= SECTION: 3-POINT SHOTS WITH DEGREES ================= */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-orange-400 tracking-wider">
                3-Point Shooting By Angle & Degrees (0°, 45°, 90°)
              </span>
              <span className="text-[11px] text-zinc-400">Made / Attempted</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {[
                { key: "corner0Left", label: "Left Corner", deg: "0° L" },
                { key: "wing45Left", label: "Left Wing", deg: "45° L" },
                { key: "top90", label: "Top of Key", deg: "90° Top" },
                { key: "wing45Right", label: "Right Wing", deg: "45° R" },
                { key: "corner0Right", label: "Right Corner", deg: "0° R" },
              ].map((zone) => {
                const val = (threePt as any)[zone.key];
                return (
                  <div key={zone.key} className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-orange-400">{zone.deg}</span>
                      <span className="text-[10px] text-zinc-400">{zone.label}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div>
                        <span className="text-[9px] text-zinc-500 block">Made</span>
                        <input
                          type="number"
                          min="0"
                          value={val.made}
                          onChange={(e) =>
                            setThreePt({
                              ...threePt,
                              [zone.key]: { ...val, made: Number(e.target.value) || 0 },
                            })
                          }
                          className="w-full p-1.5 rounded bg-zinc-950 border border-zinc-700 text-xs font-bold text-center text-orange-400"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 block">Attempted</span>
                        <input
                          type="number"
                          min="0"
                          value={val.attempted}
                          onChange={(e) =>
                            setThreePt({
                              ...threePt,
                              [zone.key]: { ...val, attempted: Number(e.target.value) || 0 },
                            })
                          }
                          className="w-full p-1.5 rounded bg-zinc-950 border border-zinc-700 text-xs font-bold text-center"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= SECTION: MID-RANGE ZONES ================= */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-amber-400 tracking-wider">
                Mid-Range Shooting By Zone (0° Baseline, 45° Elbows, 90° FT Post)
              </span>
              <span className="text-[11px] text-zinc-400">Made / Attempted</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {[
                { key: "baselineLeft", label: "L Baseline (0°)" },
                { key: "wingLeft", label: "L Elbow (45°)" },
                { key: "freeThrowHighPost", label: "FT High Post (90°)" },
                { key: "wingRight", label: "R Elbow (45°)" },
                { key: "baselineRight", label: "R Baseline (0°)" },
              ].map((zone) => {
                const val = (midRange as any)[zone.key];
                return (
                  <div key={zone.key} className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
                    <span className="text-[10px] font-bold text-zinc-300 block">{zone.label}</span>
                    <div className="grid grid-cols-2 gap-1">
                      <input
                        type="number"
                        min="0"
                        placeholder="M"
                        value={val.made}
                        onChange={(e) =>
                          setMidRange({
                            ...midRange,
                            [zone.key]: { ...val, made: Number(e.target.value) || 0 },
                          })
                        }
                        className="w-full p-1.5 rounded bg-zinc-950 border border-zinc-700 text-xs font-bold text-center text-amber-400"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="A"
                        value={val.attempted}
                        onChange={(e) =>
                          setMidRange({
                            ...midRange,
                            [zone.key]: { ...val, attempted: Number(e.target.value) || 0 },
                          })
                        }
                        className="w-full p-1.5 rounded bg-zinc-950 border border-zinc-700 text-xs font-bold text-center"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= SECTION: LAYUPS (RIGHT & LEFT HAND ONLY) ================= */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
                Layups (Right & Left Hand Finishing)
              </span>
              <span className="text-[11px] text-zinc-400">Made / Attempted</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: "rightHand", label: "Right Hand Layup", desc: "Dominant side finishes" },
                { key: "leftHand", label: "Left Hand Layup", desc: "Off-hand / weak-side finishes" },
              ].map((zone) => {
                const val = (layups as any)[zone.key];
                return (
                  <div key={zone.key} className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-200">{zone.label}</span>
                      <span className="text-[10px] text-zinc-500">{zone.desc}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-zinc-400 block mb-1">Made</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="Made"
                          value={val.made}
                          onChange={(e) =>
                            setLayups({
                              ...layups,
                              [zone.key]: { ...val, made: Number(e.target.value) || 0 },
                            })
                          }
                          className="w-full p-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-bold text-center text-emerald-400"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 block mb-1">Attempted</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="Att"
                          value={val.attempted}
                          onChange={(e) =>
                            setLayups({
                              ...layups,
                              [zone.key]: { ...val, attempted: Number(e.target.value) || 0 },
                            })
                          }
                          className="w-full p-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-bold text-center text-zinc-200"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= SECTION: FREE THROWS & HANDLING STATS ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Free Throws */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <span className="text-xs font-bold uppercase text-purple-400 tracking-wider block">
                Free Throws
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">FTs Made</label>
                  <input
                    type="number"
                    min="0"
                    value={freeThrows.made}
                    onChange={(e) => setFreeThrows({ ...freeThrows, made: Number(e.target.value) || 0 })}
                    className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-bold text-center text-purple-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">FTs Attempted</label>
                  <input
                    type="number"
                    min="0"
                    value={freeThrows.attempted}
                    onChange={(e) => setFreeThrows({ ...freeThrows, attempted: Number(e.target.value) || 0 })}
                    className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-bold text-center"
                  />
                </div>
              </div>
            </div>

            {/* Dribbling & Ball Handling Control */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <span className="text-xs font-bold uppercase text-amber-400 tracking-wider block">
                Dribbling & Ball Security
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Handling (1-5)</label>
                  <select
                    value={handlingRating}
                    onChange={(e) => setHandlingRating(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-center font-bold"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} / 5
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Bobbles / Slips</label>
                  <input
                    type="number"
                    min="0"
                    value={handlingBobbles}
                    onChange={(e) => setHandlingBobbles(Number(e.target.value) || 0)}
                    className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Drill Mistakes</label>
                  <input
                    type="number"
                    min="0"
                    value={handlingMistakes}
                    onChange={(e) => setHandlingMistakes(Number(e.target.value) || 0)}
                    className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ================= SECTION: DRILLS LIST & CUSTOM DRILL CREATOR ================= */}
          {sessionType === "practice" && (
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-orange-400 tracking-wider">
                  Logged Practice Drills & Custom Drill Creator
                </span>
                <span className="text-[11px] text-zinc-400">
                  {drills.length} drill{drills.length === 1 ? "" : "s"} logged
                </span>
              </div>

              {/* List of Current Drills */}
              <div className="space-y-2">
                {drills.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">{d.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                          {d.category}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-[11px] mt-0.5">
                        Aim: <strong className="text-zinc-300">{d.aim}</strong> → Achieved:{" "}
                        <strong className="text-orange-400">{d.actualResult}</strong> ({d.mistakes} mistakes)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDrill(d.id)}
                      className="text-zinc-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Custom Drill Form */}
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
                <span className="text-xs font-bold text-zinc-200 block">
                  + Add Drill (Preset or Custom)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Drill name (e.g. Figure-8 Dribble, Mikan Drill, Lateral Slides)"
                    value={newDrillName}
                    onChange={(e) => setNewDrillName(e.target.value)}
                    className="sm:col-span-2 p-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs"
                  />
                  <select
                    value={newDrillCat}
                    onChange={(e) => setNewDrillCat(e.target.value as any)}
                    className="p-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-medium"
                  >
                    <option value="Dribbling">Dribbling</option>
                    <option value="Shooting">Shooting</option>
                    <option value="Defense">Defense</option>
                    <option value="Finishing">Finishing</option>
                    <option value="Conditioning">Conditioning</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Target / Aim (e.g. Make 30 in 5 min)"
                    value={newDrillAim}
                    onChange={(e) => setNewDrillAim(e.target.value)}
                    className="p-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Actual Result (e.g. 28 makes)"
                    value={newDrillResult}
                    onChange={(e) => setNewDrillResult(e.target.value)}
                    className="p-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Mistakes"
                      min="0"
                      value={newDrillMistakes}
                      onChange={(e) => setNewDrillMistakes(Number(e.target.value) || 0)}
                      className="w-20 p-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-center"
                    />
                    <button
                      type="button"
                      id="add-drill-btn"
                      onClick={handleAddDrill}
                      className="flex-1 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-orange-500 hover:text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
            <div className="text-xs text-zinc-400">
              ⚡ Saving triggers automatic AI Coach analysis & skill ratings update.
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="save-session-btn"
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-bold text-sm shadow-lg shadow-orange-500/25 transition-all active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Save & Generate AI Feedback</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
