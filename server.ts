import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Mentor personalities mapping for System Instructions
const mentorSystemInstructions: Record<string, string> = {
  cool_brother: `You are Hiro, the Cool Brother anime mentor. 
Personality: Highly supportive, relaxed, friendly, and motivational. You call the user "bro", "buddy", or "friend". You talk like an easygoing sibling who believes in them.
Quote: "Small wins become great victories."
Style: Encouraging, chill, warm. You focus on incremental progress and remind them that setbacks are okay. Keep responses relatively concise and highly positive.`,

  savage_sister: `You are Sayuri, the Savage Sister anime mentor.
Personality: Sassy, strict, playful, and teasing. You love banter, calling out the user's laziness, and challenging them. You use teasing language ("Don't tell me you're slacking again?", "Are you actually studying or just staring at the screen?").
Quote: "Excuses won't finish your goals."
Style: Sharp, quick-witted, slightly mocking but fundamentally wanting them to succeed. Keep responses sassy and provocative.`,

  strict_father: `You are Kenji, the Strict Father anime mentor.
Personality: Cold, highly serious, formal, intimidating, and disciplined. You value duty, honor, and raw effort. You do not tolerate excuses. You speak with gravity and authority.
Quote: "Discipline beats talent."
Style: Command-like, concise, serious, demanding absolute focus. You respect action, not words. Keep responses brief, direct, and authoritative.`,

  enforcer_mom: `You are Ryoko, the Enforcer Mom anime mentor.
Personality: Uncompromising, angry, extremely strict, and hyper-protective about their success. You yell (using caps occasionally) and demand immediate compliance. You have zero patience for distractions.
Quote: "You either work or watch others succeed."
Style: Highly dramatic, intense, protective but extremely aggressive about work ethic. You might ask if they have washed their face or finished their homework. Keep responses fiery, direct, and protective.`,

  steven_he: `You are Steven He, the ultimate "Failure Enforcer" anime mentor.
Personality: Extremely disappointed, deeply sarcastic, meme-fueled, and hilarious. You frequently yell "EMOTIONAL DAMAGE!", say "Failure!", and compare the user to "my cousin Timmy" who is 9 and has 4 PhDs, started 3 multi-million dollar corporations, and can cook rice with his mind. You speak with a heavy, highly exaggerated Asian dad accent transcribed in text (e.g., using "laa", "haah?", "so slow", "what are you doing?").
Quote: "I will send you to Jesus! My cousin Timmy is 9 and already has 4 PhDs, and what are you doing? Slacking on Instagram!"
Style: Sarcastic, highly dramatic, throwing virtual slippers ("🩴"), and dealing "EMOTIONAL DAMAGE!" for even minor slackings. Remind them of their failure in the most comical, humorous, high-energy way possible. Keep responses punchy, witty, and deeply funny.`
};

// API Route: AI Mentor Chat
app.post("/api/chat", async (req, res) => {
  try {
    const { message, mentorId, chatHistory } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const mentorKey = mentorId || "cool_brother";
    const systemInstruction = mentorSystemInstructions[mentorKey] || mentorSystemInstructions.cool_brother;

    // Convert past messages into contents format if provided, or simple text string
    const contents = chatHistory && chatHistory.length > 0 
      ? chatHistory.map((ch: any) => ({
          role: ch.sender === "user" ? "user" : "model",
          parts: [{ text: ch.text }]
        })).concat({ role: "user", parts: [{ text: message }] })
      : message;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Chat API Error:", error);
    res.status(500).json({ error: "Failed to communicate with your mentor. Please check your Secrets or try again." });
  }
});

// API Route: AI Micro Goals Generator
app.post("/api/generate-micro-goals", async (req, res) => {
  try {
    const { mainGoal, goalDescription, expectedOutcome } = req.body;

    if (!mainGoal) {
      return res.status(400).json({ error: "Main goal is required." });
    }

    const prompt = `Break down this 12-week goal into a detailed, highly actionable, gamified set of sub-goals.
Main Goal: ${mainGoal}
Description: ${goalDescription || "No description provided"}
Expected Outcome: ${expectedOutcome || "No outcome provided"}

You must return a list of exactly 10 tasks categorised by timeframe:
- Exactly 1 Monthly Milestone (timeframe: "monthly")
- Exactly 2 Weekly Goals (timeframe: "weekly")
- Exactly 3 Daily Routines (timeframe: "daily")
- Exactly 4 Micro Tasks (timeframe: "micro")

Respond ONLY with a valid JSON array of objects. Do not write markdown, codeblocks, or explanatory text.
The JSON schema must be exactly an array of:
{
  "title": "Clear actionable task title",
  "timeframe": "monthly" | "weekly" | "daily" | "micro"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "The concrete task title."
              },
              timeframe: {
                type: Type.STRING,
                enum: ["monthly", "weekly", "daily", "micro"],
                description: "When this task should be completed."
              }
            },
            required: ["title", "timeframe"]
          }
        }
      }
    });

    const goalsText = response.text || "[]";
    const goalsList = JSON.parse(goalsText.trim());
    res.json({ goals: goalsList });
  } catch (error: any) {
    console.error("Gemini Goals Generator Error:", error);
    // Return sensible defaults if Gemini fails or is not configured
    res.json({
      goals: [
        { title: "Define the core milestones and finish Stage 1 of the 12-week program", timeframe: "monthly" },
        { title: "Review technical blueprints & draft layout concepts", timeframe: "weekly" },
        { title: "Complete focus sessions for high-priority coding modules", timeframe: "weekly" },
        { title: "Maintain a clean daily study log with category tags", timeframe: "daily" },
        { title: "Complete at least 2 Pomodoro focus sessions", timeframe: "daily" },
        { title: "Do a 15-minute quick flash review of previous notes", timeframe: "daily" },
        { title: "Write out the core index outline for active sprint", timeframe: "micro" },
        { title: "Audit distraction triggers on your mobile dashboard", timeframe: "micro" },
        { title: "Log and organize notes under the appropriate categories", timeframe: "micro" },
        { title: "Spend 5 minutes planning tomorrow's prioritized roadmap", timeframe: "micro" }
      ]
    });
  }
});

// Vite Middleware & Static Serves
const startServer = async () => {
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
