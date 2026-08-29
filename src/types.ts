export type Playstyle =
  | "Sharpshooter / Perimeter Specialist"
  | "Slasher / Rim Finisher"
  | "Playmaker / Floor General"
  | "Lockdown Defender & Hustle"
  | "3-and-D Wing"
  | "Post Scorer & Anchor"
  | "All-Around Balanced";

export type PrimaryPosition =
  | "Point Guard (PG)"
  | "Shooting Guard (SG)"
  | "Small Forward (SF)"
  | "Power Forward (PF)"
  | "Center (C)"
  | "Combo Guard (PG/SG)"
  | "Wing (SG/SF)"
  | "Big (PF/C)";

export type DominantHand = "Right" | "Left" | "Ambidextrous";

export interface PlayerProfile {
  name: string;
  age: number;
  height: number; // In Centimeters (cm) ONLY (e.g. 185)
  weight: number; // In Kilograms (kg) ONLY (e.g. 78)
  position: PrimaryPosition;
  dominantHand: DominantHand;
  playstyle: string; // Formatted summary or single playstyle
  playstyles?: Playstyle[]; // Up to 3 selected playstyles
  goals: string; // Long-term basketball ambition / target
  level?: "Middle School" | "High School" | "College" | "Rec / Amateur" | "Semi-Pro / Pro";
  avatarColor?: string;
  isProfileCompleted?: boolean;
}

export interface ZoneShotData {
  made: number;
  attempted: number;
  contestedMade?: number;
  contestedAttempted?: number;
}

export interface ShootingSummary {
  // 3-Pointers with Degree tags
  threePt: {
    corner0Left: ZoneShotData; // 0° Left Corner Baseline
    wing45Left: ZoneShotData;   // 45° Left Wing
    top90: ZoneShotData;        // 90° Top of Key
    wing45Right: ZoneShotData;  // 45° Right Wing
    corner0Right: ZoneShotData; // 0° Right Corner Baseline
    totalMade: number;
    totalAttempted: number;
    percentage: number;
  };
  // Mid-Range Zones
  midRange: {
    baselineLeft: ZoneShotData;
    wingLeft: ZoneShotData;
    freeThrowHighPost: ZoneShotData;
    wingRight: ZoneShotData;
    baselineRight: ZoneShotData;
    totalMade: number;
    totalAttempted: number;
    percentage: number;
  };
  // Short Range / Paint Floater
  paintShort: {
    paintFloater: ZoneShotData;
    totalMade: number;
    totalAttempted: number;
    percentage: number;
  };
  // Layups (Strictly Right Hand and Left Hand only)
  layups: {
    rightHand: ZoneShotData;
    leftHand: ZoneShotData;
    totalMade: number;
    totalAttempted: number;
    percentage: number;
  };
  // Free Throws
  freeThrows: {
    made: number;
    attempted: number;
    percentage: number;
  };
  // Overall Totals
  overall: {
    totalMade: number;
    totalAttempted: number;
    fieldGoalPercentage: number;
    effectiveFgPercentage: number;
    totalPoints: number;
  };
}

export interface DrillItem {
  id: string;
  name: string;
  category: "Dribbling" | "Shooting" | "Defense" | "Finishing" | "Conditioning" | "Custom";
  durationMinutes: number;
  intensity: number; // 1-10
  aim: string; // Target benchmark (e.g. "Make 20 3s in 5 min" or "0 ball losses")
  actualResult: string; // What they achieved (e.g. "18 makes" or "32 reps")
  mistakes: number; // Times done wrong / mistakes
  bobblesOrTurnovers?: number;
  notes?: string;
  aiFeedback?: {
    coachFeedback: string;
    followUpQuestions: string[];
    nextTargetRecommendation: string;
  };
}

export interface MatchStats {
  format: "5v5 Full Court" | "3v3 Half Court" | "1v1" | "Pickup Scrimmage" | "Official League Game";
  result: "Win" | "Loss" | "Practice Scrimmage";
  durationMinutes: number;
  exhaustion: number; // 1-10
  defensiveIntensity: number; // 1-10
  ballHandlingRating: number; // 1-5
  // Box score stats
  calculatedPoints: number; // Automated calculation: 3s*3 + 2s/mid/layups*2 + FTs*1
  assists: number;
  offensiveRebounds: number;
  defensiveRebounds: number;
  totalRebounds: number;
  steals: number;
  blocks: number;
  turnovers: number;
  foulsCommitted: number;
  violations: number; // travel, double dribble, 3 sec
  passesMade?: number;
  matchNotes?: string;
}

export interface AIFeedbackReport {
  summary: string;
  grade: string;
  strengths: string[];
  weaknesses: string[];
  actionableTips: string[];
  nextWorkoutPriority: string;
  generatedAt: string;
}

export interface TrainingSession {
  id: string;
  date: string; // ISO date string e.g. "2026-08-28T18:30:00.000Z"
  type: "practice" | "match";
  durationMinutes: number;
  exhaustion: number; // 1-10
  title: string;
  shootingStats: ShootingSummary;
  handlingStats?: {
    mistakes: number;
    rating: number; // 1-5
    bobbles: number;
  };
  defenseStats?: {
    intensity: number; // 1-10
    steals: number;
    blocks: number;
    deflections?: number;
    mistakesOrBlowBys?: number;
  };
  drills?: DrillItem[];
  matchData?: MatchStats;
  aiFeedback?: AIFeedbackReport;
}

export interface WeeklyPlanDay {
  day: string;
  focus: string;
  durationMinutes: number;
  drills: string[];
}

export interface WeeklyActionPlan {
  title: string;
  focus: string;
  createdAt: string;
  days: WeeklyPlanDay[];
}

export interface PlayerGoal {
  id: string;
  title: string;
  category: "Shooting" | "Finishing" | "Dribbling" | "Defense" | "Volume" | "Conditioning";
  targetValue: number;
  currentValue: number;
  unit: "%" | "makes" | "sessions" | "rating" | "steals";
  targetDate?: string;
  isCoachGenerated: boolean;
  accepted: boolean;
  completed: boolean;
}

export interface PlayerAttributes {
  shooting: number;    // 0-99
  finishing: number;   // 0-99
  ballHandling: number;// 0-99
  defense: number;     // 0-99
  rebounding: number;  // 0-99
  stamina: number;     // 0-99
  overallRating: number;
}
