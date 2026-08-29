import { TrainingSession, PlayerProfile, AIFeedbackReport } from "../types";

export function generateInstantCoachReport(
  session: TrainingSession,
  profile: PlayerProfile,
  recentSessions: TrainingSession[] = []
): AIFeedbackReport {
  const threePt = session.shootingStats?.threePt;
  const midRange = session.shootingStats?.midRange;
  const layups = session.shootingStats?.layups;
  const ft = session.shootingStats?.freeThrows;
  const overall = session.shootingStats?.overall;

  const threePct = threePt && threePt.totalAttempted > 0 ? (threePt.totalMade / threePt.totalAttempted) * 100 : 0;
  const midPct = midRange && midRange.totalAttempted > 0 ? (midRange.totalMade / midRange.totalAttempted) * 100 : 0;
  const layupPct = layups && layups.totalAttempted > 0 ? (layups.totalMade / layups.totalAttempted) * 100 : 0;
  const ftPct = ft && ft.attempted > 0 ? (ft.made / ft.attempted) * 100 : 0;

  const rightLayupPct = layups?.rightHand && layups.rightHand.attempted > 0 
    ? (layups.rightHand.made / layups.rightHand.attempted) * 100 
    : 100;
  const leftLayupPct = layups?.leftHand && layups.leftHand.attempted > 0 
    ? (layups.leftHand.made / layups.leftHand.attempted) * 100 
    : 0;

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const actionableTips: string[] = [];

  // Grade calculation
  let gradePoints = 80;

  if (threePct >= 45) {
    strengths.push(`Sensational perimeter marksmanship (${threePct.toFixed(1)}% 3PT on ${threePt?.totalAttempted} attempts).`);
    gradePoints += 8;
  } else if (threePct >= 36) {
    strengths.push(`Solid 3PT baseline efficiency at ${threePct.toFixed(1)}%.`);
    gradePoints += 4;
  } else if (threePt && threePt.totalAttempted > 10) {
    weaknesses.push(`Perimeter 3PT conversion (${threePct.toFixed(1)}%) dropped below target threshold.`);
    gradePoints -= 5;
  }

  // Corner 0° vs 90° top evaluation
  if (threePt) {
    const leftCornerPct = threePt.corner0Left.attempted > 0 ? (threePt.corner0Left.made / threePt.corner0Left.attempted) * 100 : 0;
    const rightCornerPct = threePt.corner0Right.attempted > 0 ? (threePt.corner0Right.made / threePt.corner0Right.attempted) * 100 : 0;
    const top90Pct = threePt.top90.attempted > 0 ? (threePt.top90.made / threePt.top90.attempted) * 100 : 0;

    if (top90Pct >= 45) {
      strengths.push(`90° Top of Key shot mechanics were fluid and on-target (${top90Pct.toFixed(0)}%).`);
    }
    if (leftCornerPct < 35 && threePt.corner0Left.attempted >= 5) {
      weaknesses.push(`Left Corner 0° baseline release showed flat arc (${leftCornerPct.toFixed(0)}%).`);
      actionableTips.push("On 0° left baseline shots, hold follow-through high without fading toward the baseline.");
    }
    if (rightCornerPct < 35 && threePt.corner0Right.attempted >= 5) {
      weaknesses.push(`Right Corner 0° baseline shots struggled under repetition fatigue.`);
      actionableTips.push("Ensure your dominant guide hand remains steady on right baseline corner catches.");
    }
  }

  // Layup Weak vs Strong Hand evaluation
  if (layups && layups.totalAttempted > 0) {
    if (rightLayupPct >= 75) {
      strengths.push(`Dominant Right Hand layup finishing was clinical (${rightLayupPct.toFixed(0)}%).`);
    }
    if (leftLayupPct < 55 && layups.leftHand.attempted >= 4) {
      weaknesses.push(`Left Hand layup conversion was ${leftLayupPct.toFixed(0)}%, showing weak-side hesitation.`);
      actionableTips.push("Incorporate 40 off-glass Left Hand Mikan layup reps at high speed before shooting drills.");
      gradePoints -= 4;
    } else if (leftLayupPct >= 65) {
      strengths.push(`Great ambidextrous balance: Left Hand layup conversion hit ${leftLayupPct.toFixed(0)}%.`);
      gradePoints += 5;
    }
  }

  // Free throws
  if (ft && ft.attempted >= 5) {
    if (ftPct >= 80) {
      strengths.push(`Automatic at the charity stripe (${ftPct.toFixed(0)}% FT).`);
      gradePoints += 4;
    } else if (ftPct < 65) {
      weaknesses.push(`Free throw rhythm faltered under fatigue (${ftPct.toFixed(0)}%).`);
      actionableTips.push("Shoot 10 pressure free throws after every high-exhaustion drill sequence.");
      gradePoints -= 4;
    }
  }

  // Defense & Handling
  if (session.defenseStats) {
    if (session.defenseStats.steals >= 3) {
      strengths.push(`Disruptive active hands: logged ${session.defenseStats.steals} steals and high deflection pressure.`);
      gradePoints += 5;
    }
    if (session.defenseStats.intensity >= 8) {
      strengths.push(`Elite defensive energy score (${session.defenseStats.intensity}/10).`);
    }
  }

  if (session.handlingStats && session.handlingStats.mistakes >= 3) {
    weaknesses.push(`High turnover/bobble count (${session.handlingStats.mistakes} handling errors).`);
    actionableTips.push("Work on low-dribble pound crossovers against active closeouts to tighten handle.");
    gradePoints -= 4;
  }

  // Match specific
  if (session.matchData) {
    if (session.matchData.assists >= 5) {
      strengths.push(`Superb floor vision with ${session.matchData.assists} assists created.`);
    }
    if (session.matchData.turnovers >= 4) {
      weaknesses.push(`Careless passing turnovers (${session.matchData.turnovers} TOs) under traps.`);
      actionableTips.push("Use jump stops and ball fakes when driving into help defense rather than throwing off balance.");
    }
  }

  // Default fallbacks if lists are sparse
  if (strengths.length === 0) {
    strengths.push("Committed workout volume and full session completion.");
    strengths.push("Solid baseline conditioning through target duration.");
  }
  if (weaknesses.length === 0) {
    weaknesses.push("Need faster transition into quick-release jumpers after deceleration.");
  }
  if (actionableTips.length === 0) {
    actionableTips.push(`Align training with your long-term ambition: "${profile.goals || 'Master all-around scoring and defense'}".`);
    actionableTips.push("Focus on high-speed deceleration into your pull-up jumper.");
    actionableTips.push("Maintain low stance on defensive slides without crossing feet.");
  }

  // Calculate Letter Grade
  let grade = "B+";
  if (gradePoints >= 93) grade = "A+";
  else if (gradePoints >= 88) grade = "A";
  else if (gradePoints >= 83) grade = "A-";
  else if (gradePoints >= 78) grade = "B+";
  else if (gradePoints >= 73) grade = "B";
  else if (gradePoints >= 68) grade = "B-";
  else grade = "C+";

  const nextWorkoutPriority = weaknesses[0] 
    ? `Direct focus on: ${weaknesses[0]} (combine with 0° and 45° angle mechanics).`
    : `Elevate high-intensity reps targeting your long-term ambition: ${profile.goals || 'All-Around Dominance'}.`;

  const summary = `Workout completed with an overall grade of ${grade}. Overall Field Goal: ${overall?.fieldGoalPercentage.toFixed(1) || '60'}% across ${session.durationMinutes} minutes with an exhaustion rating of ${session.exhaustion}/10.`;

  return {
    summary,
    grade,
    strengths: strengths.slice(0, 3),
    weaknesses: weaknesses.slice(0, 3),
    actionableTips: actionableTips.slice(0, 3),
    nextWorkoutPriority,
    generatedAt: new Date().toISOString(),
  };
}
