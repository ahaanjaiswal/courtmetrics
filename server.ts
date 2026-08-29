import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini SDK with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Using fallback coach logic.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API: Generate Session Coach Feedback
app.post("/api/ai/coach-analysis", async (req, res) => {
  try {
    const { session, profile, historySummary } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback structured coaching response if API key is not yet configured
      return res.json({
        summary: `Great effort completing this ${session.type === "match" ? "match" : "practice session"}! Based on your ${profile.playstyle || "all-around"} playstyle, here is your breakdown.`,
        grade: "B+",
        strengths: [
          session.shootingStats?.threePt?.percentage > 40
            ? "Solid perimeter shooting efficiency above 40%"
            : "Strong commitment to drill repetitions and high hustle",
          "Maintained focus through high exhaustion level",
        ],
        weaknesses: [
          "Lower shooting accuracy on contested attempts and weak-side baseline shots",
          session.handlingStats?.mistakes > 2
            ? "Ball handling bobbles during rapid transitions"
            : "Contested shot decision-making under defensive pressure",
        ],
        actionableTips: [
          "Focus next workout on form shooting from 0° corners before speeding up into game-speed pull-ups.",
          "Perform 50 weak-hand layup reps with high glass touch point to reduce missed finishes.",
          "Keep your defensive chest square on closeouts without lunging forward.",
        ],
        nextWorkoutPriority: "0° Corner 3s & Weak-Hand Finishing under fatigue",
      });
    }

    const prompt = `You are an elite NBA-level basketball skills trainer and player development coach.
Analyze the following player's basketball session and provide sharp, realistic, highly actionable feedback.

PLAYER PROFILE:
- Name: ${profile?.name || "Player"}
- Age: ${profile?.age || "N/A"}
- Height: ${profile?.height || "N/A"}
- Weight: ${profile?.weight || "N/A"}
- Primary Position: ${profile?.position || "Guard"}
- Dominant Hand: ${profile?.dominantHand || "Right"}
- Playstyle: ${profile?.playstyle || "Balanced"}
- Player's Goal: ${profile?.goals || "Improve shooting and in-game impact"}

RECENT 10-SESSION HISTORY SUMMARY:
${JSON.stringify(historySummary || {}, null, 2)}

CURRENT SESSION DETAILS:
${JSON.stringify(session, null, 2)}

Provide your response in valid JSON format with the following schema:
{
  "summary": "2-3 concise sentences summarizing their performance today in the context of their profile and recent trends",
  "grade": "Letter grade e.g. A, A-, B+, B, C+",
  "strengths": ["string", "string"],
  "weaknesses": ["string (focus on weak and mid-tier areas)", "string"],
  "actionableTips": ["3 specific, technical drills/mechanics tips for immediate improvement"],
  "nextWorkoutPriority": "1 clear sentence on what to focus on next session"
}
Ensure the output is ONLY valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text.trim());
    return res.json(parsed);
  } catch (error) {
    console.error("Error generating coach analysis:", error);
    return res.status(500).json({
      error: "Failed to generate coach feedback",
      message: (error as Error).message,
    });
  }
});

// API: Generate Weekly Action Plan
app.post("/api/ai/weekly-plan", async (req, res) => {
  try {
    const { profile, weakAreas, overallStats } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        title: "Targeted 5-Day Basketball Improvement Plan",
        focus: weakAreas?.join(", ") || "Shooting Accuracy & Weak-Hand Layups",
        days: [
          {
            day: "Day 1",
            focus: "Spot-Up Shooting & Corner 3s (0°)",
            durationMinutes: 45,
            drills: [
              "Form shooting 5 feet from rim (30 makes)",
              "0° Baseline Corner 3s (50 makes left, 50 makes right)",
              "Free Throws under fatigue (20 makes)",
            ],
          },
          {
            day: "Day 2",
            focus: "Weak-Hand Finishing & Floaters",
            durationMinutes: 50,
            drills: [
              "Mikan Drill (50 makes each hand)",
              "Eurostep & Reverse Layups from 45° wing (40 reps)",
              "High-arc floaters in paint (30 makes)",
            ],
          },
          {
            day: "Day 3",
            focus: "Ball Handling & Pressure Control",
            durationMinutes: 40,
            drills: [
              "Two-Ball Dribble Combos (10 min)",
              "Cone Zig-Zag Crossover to pull-up (15 reps)",
              "Full court speed dribble against invisible defender",
            ],
          },
          {
            day: "Day 4",
            focus: "Mid-Range Off-The-Dribble & Footwork",
            durationMinutes: 45,
            drills: [
              "Elbow-to-Elbow 1-dribble pull-ups (40 makes)",
              "Step-back separation shooting from 45°",
              "Defensive slide closeout to contest recovery",
            ],
          },
          {
            day: "Day 5",
            focus: "Simulated Match Play / Scrimmage & Pressure FTs",
            durationMinutes: 60,
            drills: [
              "Live 3v3 or 5v5 full court game",
              "Track contested vs uncontested shooting",
              "End-of-workout 10 consecutive FT challenge",
            ],
          },
        ],
      });
    }

    const prompt = `You are a premier basketball skills trainer.
Create a structured 5-Day Weekly Action Plan specifically targeting this player's weak and mid-tier performance areas.

PLAYER PROFILE:
- Name: ${profile?.name || "Player"}
- Age: ${profile?.age || "N/A"}
- Height: ${profile?.height || "N/A"}
- Weight: ${profile?.weight || "N/A"}
- Position: ${profile?.position || "Guard"}
- Dominant Hand: ${profile?.dominantHand || "Right"}
- Playstyle: ${profile?.playstyle || "Balanced"}
- Goals: ${profile?.goals || "Overall Improvement"}

IDENTIFIED WEAK / MID AREAS:
${JSON.stringify(weakAreas || [], null, 2)}

OVERALL RECENT STATS:
${JSON.stringify(overallStats || {}, null, 2)}

Generate a response in JSON format matching this schema:
{
  "title": "Short catchy title for the plan",
  "focus": "Key tactical focus area",
  "days": [
    {
      "day": "Day 1",
      "focus": "Primary workout focus",
      "durationMinutes": 45,
      "drills": ["Drill 1 with rep counts and technical cues", "Drill 2", "Drill 3"]
    }
  ]
}
Include exactly 5 days. Ensure output is purely valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text.trim());
    return res.json(parsed);
  } catch (error) {
    console.error("Error generating weekly plan:", error);
    return res.status(500).json({
      error: "Failed to generate weekly plan",
      message: (error as Error).message,
    });
  }
});

// API: Custom Drill Follow-up & Evaluation
app.post("/api/ai/drill-evaluation", async (req, res) => {
  try {
    const { drill, profile } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        coachFeedback: `Solid execution on ${drill.name}! Aiming for ${drill.aim} and achieving ${drill.actualResult} with ${drill.mistakes} mistakes shows good baseline discipline.`,
        followUpQuestions: [
          `Did you feel your balance deteriorating toward the final reps?`,
          `Were your eyes up scanning the floor during this drill?`,
        ],
        nextTargetRecommendation: `Increase target reps by 15% next session and aim for under ${Math.max(0, drill.mistakes - 1)} mistakes.`,
      });
    }

    const prompt = `You are a basketball skills development coach evaluating a custom practice drill just performed by a player.

PLAYER: ${profile?.name || "Player"} (${profile?.position || "Guard"}, ${profile?.playstyle || "Balanced"})
DRILL DETAILS:
- Drill Name: ${drill.name}
- Category: ${drill.category}
- Duration: ${drill.durationMinutes} minutes
- Intensity (1-10): ${drill.intensity}
- Player's Target/Aim: ${drill.aim}
- Actual Result: ${drill.actualResult}
- Mistakes / Times Done Wrong: ${drill.mistakes}
- User Drill Notes: ${drill.notes || "None"}

Provide JSON output:
{
  "coachFeedback": "2-3 sentences evaluating the drill quality, technique, and effort",
  "followUpQuestions": ["2 reflective questions specific to this drill to help them assess feel and mechanics"],
  "nextTargetRecommendation": "Concrete target benchmark for their next session on this drill"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text.trim());
    return res.json(parsed);
  } catch (error) {
    console.error("Error evaluating drill:", error);
    return res.status(500).json({
      error: "Failed to evaluate drill",
      message: (error as Error).message,
    });
  }
});

// Setup Vite middleware for development or static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Basketball Progress Tracker server running on port ${PORT}`);
  });
}

startServer();
