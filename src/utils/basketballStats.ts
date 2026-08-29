import { TrainingSession, PlayerAttributes } from "../types";

export function calculateAttributeRatings(sessions: TrainingSession[]): PlayerAttributes {
  if (!sessions || !Array.isArray(sessions) || sessions.length === 0) {
    return {
      shooting: 70,
      finishing: 70,
      ballHandling: 70,
      defense: 70,
      rebounding: 65,
      stamina: 75,
      overallRating: 70,
    };
  }

  let total3PM = 0;
  let total3PA = 0;
  let totalMidM = 0;
  let totalMidA = 0;
  let totalLayupM = 0;
  let totalLayupA = 0;
  let totalFTM = 0;
  let totalFTA = 0;
  let totalHandlingRating = 0;
  let totalDefenseIntensity = 0;
  let totalSteals = 0;
  let totalBlocks = 0;
  let totalRebounds = 0;
  let totalMinutes = 0;
  let totalExhaustion = 0;
  let matchCount = 0;
  let validSessionCount = 0;

  sessions.forEach((s) => {
    if (!s) return;
    validSessionCount++;
    total3PM += s.shootingStats?.threePt?.totalMade || 0;
    total3PA += s.shootingStats?.threePt?.totalAttempted || 0;
    totalMidM += s.shootingStats?.midRange?.totalMade || 0;
    totalMidA += s.shootingStats?.midRange?.totalAttempted || 0;
    totalLayupM += s.shootingStats?.layups?.totalMade || 0;
    totalLayupA += s.shootingStats?.layups?.totalAttempted || 0;
    totalFTM += s.shootingStats?.freeThrows?.made || 0;
    totalFTA += s.shootingStats?.freeThrows?.attempted || 0;

    if (s.handlingStats) {
      totalHandlingRating += s.handlingStats.rating || 3;
    }
    if (s.defenseStats) {
      totalDefenseIntensity += s.defenseStats.intensity || 5;
      totalSteals += s.defenseStats.steals || 0;
      totalBlocks += s.defenseStats.blocks || 0;
    }
    if (s.matchData) {
      matchCount++;
      totalRebounds += s.matchData.totalRebounds || 0;
    }
    totalMinutes += s.durationMinutes || 0;
    totalExhaustion += s.exhaustion || 5;
  });

  const count = validSessionCount || 1;
  const threePct = total3PA > 0 ? (total3PM / total3PA) * 100 : 40;
  const midPct = totalMidA > 0 ? (totalMidM / totalMidA) * 100 : 50;
  const layupPct = totalLayupA > 0 ? (totalLayupM / totalLayupA) * 100 : 65;
  const ftPct = totalFTA > 0 ? (totalFTM / totalFTA) * 100 : 75;

  // Scale into realistic 2K-style rating (50 - 99)
  const shootingScore = Math.min(99, Math.max(50, Math.round(threePct * 0.9 + midPct * 0.4 + ftPct * 0.2)));
  const finishingScore = Math.min(99, Math.max(50, Math.round(layupPct * 1.05 + 15)));
  
  const avgHandling = count > 0 ? totalHandlingRating / count : 3.5;
  const handlingScore = Math.min(99, Math.max(50, Math.round(avgHandling * 16 + 15)));

  const avgDefIntensity = count > 0 ? totalDefenseIntensity / count : 6;
  const defenseScore = Math.min(99, Math.max(50, Math.round(avgDefIntensity * 7 + (totalSteals / count) * 4 + 30)));

  const avgReb = matchCount > 0 ? totalRebounds / matchCount : 4;
  const reboundingScore = Math.min(99, Math.max(50, Math.round(avgReb * 6 + 48)));

  const avgExhaustion = count > 0 ? totalExhaustion / count : 6;
  const avgMins = count > 0 ? totalMinutes / count : 45;
  const staminaScore = Math.min(99, Math.max(50, Math.round((avgMins / 60) * 30 + avgExhaustion * 5 + 40)));

  const overallRating = Math.round(
    shootingScore * 0.25 +
    finishingScore * 0.20 +
    handlingScore * 0.20 +
    defenseScore * 0.15 +
    reboundingScore * 0.10 +
    staminaScore * 0.10
  );

  return {
    shooting: shootingScore || 70,
    finishing: finishingScore || 70,
    ballHandling: handlingScore || 70,
    defense: defenseScore || 70,
    rebounding: reboundingScore || 65,
    stamina: staminaScore || 75,
    overallRating: overallRating || 70,
  };
}

export interface ZoneAnalysis {
  id: string;
  name: string;
  category: "3PT" | "Mid-Range" | "Paint" | "Layup";
  degreeTag?: string;
  angleDirection?: string;
  made: number;
  attempted: number;
  percentage: number;
  contestedMade: number;
  contestedAttempted: number;
  contestedPercentage: number;
  ratingTier: "Hot / Elite" | "Consistent" | "Needs Work" | "Cold";
}

export function aggregateAllZones(sessions: TrainingSession[]): ZoneAnalysis[] {
  const zoneMap: Record<
    string,
    { name: string; category: "3PT" | "Mid-Range" | "Paint" | "Layup"; degreeTag?: string; angleDirection?: string; made: number; attempted: number; contestedMade: number; contestedAttempted: number }
  > = {
    "3pt-corner-left": { name: "Left Corner 3PT", category: "3PT", degreeTag: "0°", angleDirection: "Left Baseline", made: 0, attempted: 0, contestedMade: 0, contestedAttempted: 0 },
    "3pt-wing-left": { name: "Left Wing 3PT", category: "3PT", degreeTag: "45°", angleDirection: "Left 45° Angle", made: 0, attempted: 0, contestedMade: 0, contestedAttempted: 0 },
    "3pt-top": { name: "Top of the Key 3PT", category: "3PT", degreeTag: "90°", angleDirection: "Straight-On Center", made: 0, attempted: 0, contestedMade: 0, contestedAttempted: 0 },
    "3pt-wing-right": { name: "Right Wing 3PT", category: "3PT", degreeTag: "45°", angleDirection: "Right 45° Angle", made: 0, attempted: 0, contestedMade: 0, contestedAttempted: 0 },
    "3pt-corner-right": { name: "Right Corner 3PT", category: "3PT", degreeTag: "0°", angleDirection: "Right Baseline", made: 0, attempted: 0, contestedMade: 0, contestedAttempted: 0 },

    "mid-base-left": { name: "Left Baseline Mid-Range", category: "Mid-Range", degreeTag: "0°", angleDirection: "Left Baseline Mid", made: 0, attempted: 0, contestedMade: 0, contestedAttempted: 0 },
    "mid-wing-left": { name: "Left Wing / Elbow Mid", category: "Mid-Range", degreeTag: "45°", angleDirection: "Left Elbow", made: 0, attempted: 0, contestedMade: 0, contestedAttempted: 0 },
    "mid-ft-post": { name: "Free Throw Line / High Post", category: "Mid-Range", degreeTag: "90°", angleDirection: "Free Throw Line", made: 0, attempted: 0, contestedMade: 0, contestedAttempted: 0 },
    "mid-wing-right": { name: "Right Wing / Elbow Mid", category: "Mid-Range", degreeTag: "45°", angleDirection: "Right Elbow", made: 0, attempted: 0, contestedMade: 0, contestedAttempted: 0 },
    "mid-base-right": { name: "Right Baseline Mid-Range", category: "Mid-Range", degreeTag: "0°", angleDirection: "Right Baseline Mid", made: 0, attempted: 0, contestedMade: 0, contestedAttempted: 0 },

    "paint-floater": { name: "In-The-Paint Floater Zone", category: "Paint", made: 0, attempted: 0, contestedMade: 0, contestedAttempted: 0 },

    "layup-right": { name: "Right Hand Layup", category: "Layup", made: 0, attempted: 0, contestedMade: 0, contestedAttempted: 0 },
    "layup-left": { name: "Left Hand Layup", category: "Layup", made: 0, attempted: 0, contestedMade: 0, contestedAttempted: 0 },
  };

  sessions.forEach((s) => {
    const st = s.shootingStats;
    if (!st) return;
    if (st.threePt) {
      zoneMap["3pt-corner-left"].made += st.threePt.corner0Left.made || 0;
      zoneMap["3pt-corner-left"].attempted += st.threePt.corner0Left.attempted || 0;
      zoneMap["3pt-corner-left"].contestedMade += st.threePt.corner0Left.contestedMade || 0;
      zoneMap["3pt-corner-left"].contestedAttempted += st.threePt.corner0Left.contestedAttempted || 0;

      zoneMap["3pt-wing-left"].made += st.threePt.wing45Left.made || 0;
      zoneMap["3pt-wing-left"].attempted += st.threePt.wing45Left.attempted || 0;
      zoneMap["3pt-wing-left"].contestedMade += st.threePt.wing45Left.contestedMade || 0;
      zoneMap["3pt-wing-left"].contestedAttempted += st.threePt.wing45Left.contestedAttempted || 0;

      zoneMap["3pt-top"].made += st.threePt.top90.made || 0;
      zoneMap["3pt-top"].attempted += st.threePt.top90.attempted || 0;
      zoneMap["3pt-top"].contestedMade += st.threePt.top90.contestedMade || 0;
      zoneMap["3pt-top"].contestedAttempted += st.threePt.top90.contestedAttempted || 0;

      zoneMap["3pt-wing-right"].made += st.threePt.wing45Right.made || 0;
      zoneMap["3pt-wing-right"].attempted += st.threePt.wing45Right.attempted || 0;
      zoneMap["3pt-wing-right"].contestedMade += st.threePt.wing45Right.contestedMade || 0;
      zoneMap["3pt-wing-right"].contestedAttempted += st.threePt.wing45Right.contestedAttempted || 0;

      zoneMap["3pt-corner-right"].made += st.threePt.corner0Right.made || 0;
      zoneMap["3pt-corner-right"].attempted += st.threePt.corner0Right.attempted || 0;
      zoneMap["3pt-corner-right"].contestedMade += st.threePt.corner0Right.contestedMade || 0;
      zoneMap["3pt-corner-right"].contestedAttempted += st.threePt.corner0Right.contestedAttempted || 0;
    }

    if (st.midRange) {
      zoneMap["mid-base-left"].made += st.midRange.baselineLeft.made || 0;
      zoneMap["mid-base-left"].attempted += st.midRange.baselineLeft.attempted || 0;

      zoneMap["mid-wing-left"].made += st.midRange.wingLeft.made || 0;
      zoneMap["mid-wing-left"].attempted += st.midRange.wingLeft.attempted || 0;

      zoneMap["mid-ft-post"].made += st.midRange.freeThrowHighPost.made || 0;
      zoneMap["mid-ft-post"].attempted += st.midRange.freeThrowHighPost.attempted || 0;

      zoneMap["mid-wing-right"].made += st.midRange.wingRight.made || 0;
      zoneMap["mid-wing-right"].attempted += st.midRange.wingRight.attempted || 0;

      zoneMap["mid-base-right"].made += st.midRange.baselineRight.made || 0;
      zoneMap["mid-base-right"].attempted += st.midRange.baselineRight.attempted || 0;
    }

    if (st.paintShort) {
      zoneMap["paint-floater"].made += st.paintShort.paintFloater.made || 0;
      zoneMap["paint-floater"].attempted += st.paintShort.paintFloater.attempted || 0;
    }

    if (st.layups) {
      zoneMap["layup-right"].made += st.layups.rightHand?.made || 0;
      zoneMap["layup-right"].attempted += st.layups.rightHand?.attempted || 0;

      zoneMap["layup-left"].made += st.layups.leftHand?.made || 0;
      zoneMap["layup-left"].attempted += st.layups.leftHand?.attempted || 0;
    }
  });

  return Object.entries(zoneMap).map(([id, z]) => {
    const percentage = z.attempted > 0 ? Number(((z.made / z.attempted) * 100).toFixed(1)) : 0;
    const contestedPercentage = z.contestedAttempted > 0 ? Number(((z.contestedMade / z.contestedAttempted) * 100).toFixed(1)) : 0;

    let ratingTier: "Hot / Elite" | "Consistent" | "Needs Work" | "Cold" = "Consistent";
    if (z.category === "3PT") {
      if (percentage >= 45) ratingTier = "Hot / Elite";
      else if (percentage >= 36) ratingTier = "Consistent";
      else if (percentage >= 28) ratingTier = "Needs Work";
      else ratingTier = "Cold";
    } else if (z.category === "Layup") {
      if (percentage >= 75) ratingTier = "Hot / Elite";
      else if (percentage >= 62) ratingTier = "Consistent";
      else if (percentage >= 50) ratingTier = "Needs Work";
      else ratingTier = "Cold";
    } else {
      if (percentage >= 55) ratingTier = "Hot / Elite";
      else if (percentage >= 44) ratingTier = "Consistent";
      else if (percentage >= 35) ratingTier = "Needs Work";
      else ratingTier = "Cold";
    }

    return {
      id,
      name: z.name,
      category: z.category,
      degreeTag: z.degreeTag,
      angleDirection: z.angleDirection,
      made: z.made,
      attempted: z.attempted,
      percentage,
      contestedMade: z.contestedMade,
      contestedAttempted: z.contestedAttempted,
      contestedPercentage,
      ratingTier,
    };
  });
}
