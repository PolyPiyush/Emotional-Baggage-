/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Task, Note, MicroGoal, UserStats, Mentor, MentorId } from "./types";

// Import Onboarding Screens
import AuthScreen from "./components/AuthScreen";
import GoalSetupScreen from "./components/GoalSetupScreen";
import DailyCommitmentScreen from "./components/DailyCommitmentScreen";
import MentorSelectionScreen, { MENTORS_DATA } from "./components/MentorSelectionScreen";
import { enhanceMentorWithLevel } from "./utils";

// Import Main App Views
import DashboardView from "./components/DashboardView";
import TaskManagerView from "./components/TaskManagerView";
import MicroGoalsView from "./components/MicroGoalsView";
import RewardsView from "./components/RewardsView";
import AIChatBuddyView from "./components/AIChatBuddyView";
import NotesView from "./components/NotesView";
import AnalyticsView from "./components/AnalyticsView";
import ProfileSettingsView from "./components/ProfileSettingsView";

// Icons
import {
  Home,
  CheckSquare,
  Sparkles,
  Zap,
  MessageSquare,
  BookOpen,
  BarChart2,
  Settings,
  Bell,
  Clock,
  ChevronRight,
  Flame,
  Award,
  BookText
} from "lucide-react";

// Initial tasks list seed
const INITIAL_TASKS: Task[] = [
  {
    id: "t1",
    title: "Synthesize React algorithms & memory hooks",
    priority: "high",
    category: "Coding",
    dueDate: "2026-07-02",
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "t2",
    title: "10-mile training run & breathing stamina",
    priority: "normal",
    category: "Fitness",
    dueDate: "2026-07-03",
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "t3",
    title: "Refactor core UI layout & wireframe designs",
    priority: "high",
    category: "Design",
    dueDate: "2026-07-05",
    completed: true,
    createdAt: new Date().toISOString()
  }
];

// Initial subgoals seed
const INITIAL_MICRO_GOALS: MicroGoal[] = [
  { id: "mg1", title: "Complete Month 1 Milestone: Secure core layout structure", timeframe: "monthly", completed: false },
  { id: "mg2", title: "Review Weekly Goal: Setup TypeScript definitions", timeframe: "weekly", completed: true },
  { id: "mg3", title: "Execute Daily Habit: Code 3 hours minimum", timeframe: "daily", completed: false },
  { id: "mg4", title: "Pass Micro Task: Clear inbox backlog", timeframe: "micro", completed: true }
];

// Initial study notes seed
const INITIAL_NOTES: Note[] = [
  {
    id: "n1",
    title: "12-Week Year Philosophy",
    content: "The core rule is condensing a full calendar year into a hyper-focused 12 weeks. Every week is treated as a standalone month, multiplying urgency and eliminating end-of-year procrastination slumps.",
    category: "Study",
    pinned: true,
    createdAt: "2026-06-30",
    updatedAt: "2026-06-30"
  },
  {
    id: "n2",
    title: "Weekly Checklist Goals",
    content: "Prepare 12-week blueprint and share with my sensei mentor. Implement Daily Hour Slider and start blocking Instagram immediately.",
    category: "Brainstorm",
    pinned: false,
    checklist: [
      { text: "Confirm 3hr daily minimum commitment", checked: true },
      { text: "Integrate Gemini secret API key", checked: false },
      { text: "Spend KP points on Cyber Dojo skin", checked: false }
    ],
    createdAt: "2026-06-30",
    updatedAt: "2026-06-30"
  }
];

export default function App() {
  // Navigation State
  const [step, setStep] = useState<"AUTH" | "GOAL_SETUP" | "COMMITMENT" | "MENTOR_SELECTION" | "APP">("AUTH");
  const [activeTab, setActiveTab] = useState<"dashboard" | "tasks" | "micro_goals" | "rewards" | "chat" | "notes" | "analytics" | "profile">("dashboard");

  // Core User Variables
  const [userEmail, setUserEmail] = useState("");
  const [mainGoal, setMainGoal] = useState("Build a production-ready Web App with AI integration");
  const [goalDescription, setGoalDescription] = useState("Focus heavily on building and deploying a complete 12-week year project roadmap.");
  const [expectedOutcome, setExpectedOutcome] = useState("Complete hackathon-ready mobile prototype with anime style gamification.");
  const [dailyCommitment, setDailyCommitment] = useState(4); // default 4 hrs
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  // Mentor Levels State (Level starts at 1, EXP starts at 0)
  const [mentorProgress, setMentorProgress] = useState<Record<MentorId, { level: number; exp: number }>>(() => {
    const saved = localStorage.getItem("kinetic_mentor_progress");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      [MentorId.COOL_BROTHER]: { level: 1, exp: 0 },
      [MentorId.SAVAGE_SISTER]: { level: 1, exp: 0 },
      [MentorId.STRICT_FATHER]: { level: 1, exp: 0 },
      [MentorId.ENFORCER_MOM]: { level: 1, exp: 0 },
      [MentorId.STEVEN_HE]: { level: 1, exp: 0 }
    };
  });

  // Rewards, Interface Skins & Custom Themes State
  const [unlockedRewardIds, setUnlockedRewardIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("kinetic_unlocked_rewards");
    return saved ? JSON.parse(saved) : ["default"];
  });

  const [equippedThemeId, setEquippedThemeId] = useState<string>(() => {
    return localStorage.getItem("kinetic_equipped_theme") || "default";
  });

  const [equippedSkinId, setEquippedSkinId] = useState<string>(() => {
    return localStorage.getItem("kinetic_equipped_skin") || "default";
  });

  useEffect(() => {
    localStorage.setItem("kinetic_unlocked_rewards", JSON.stringify(unlockedRewardIds));
  }, [unlockedRewardIds]);

  useEffect(() => {
    localStorage.setItem("kinetic_equipped_theme", equippedThemeId);
  }, [equippedThemeId]);

  useEffect(() => {
    localStorage.setItem("kinetic_equipped_skin", equippedSkinId);
  }, [equippedSkinId]);

  const gainMentorExp = (amount: number, overrideMentorId?: MentorId) => {
    const activeId = overrideMentorId || selectedMentor?.id;
    if (!activeId) return;

    setMentorProgress((prev) => {
      const current = prev[activeId] || { level: 1, exp: 0 };
      let newExp = current.exp + amount;
      let currentLevel = current.level;

      const getNextLevelThreshold = (lvl: number) => {
        if (lvl === 1) return 100;
        if (lvl === 2) return 250;
        if (lvl === 3) return 450;
        if (lvl === 4) return 700;
        return Infinity; // Level 5 is max
      };

      let leveledUp = false;
      while (newExp >= getNextLevelThreshold(currentLevel) && currentLevel < 5) {
        newExp -= getNextLevelThreshold(currentLevel);
        currentLevel += 1;
        leveledUp = true;
      }

      const updated = {
        ...prev,
        [activeId]: { level: currentLevel, exp: newExp }
      };
      localStorage.setItem("kinetic_mentor_progress", JSON.stringify(updated));

      if (leveledUp) {
        const mName = activeId === MentorId.COOL_BROTHER ? "The Cool Brother" :
                      activeId === MentorId.SAVAGE_SISTER ? "The Savage Sister" :
                      activeId === MentorId.STRICT_FATHER ? "The Strict Father" :
                      activeId === MentorId.STEVEN_HE ? "Steven He (The Failure Enforcer)" : "The Enforcer Mom";
        
        addDojoLog(`🎉 LEVEL UP! ${mName} reached Level ${currentLevel}!`);
        
        // Trigger Canvas Confetti
        import("canvas-confetti").then((confetti) => {
          confetti.default({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
          });
        }).catch(() => {});
      } else {
        const mName = activeId === MentorId.COOL_BROTHER ? "The Cool Brother" :
                      activeId === MentorId.SAVAGE_SISTER ? "The Savage Sister" :
                      activeId === MentorId.STRICT_FATHER ? "The Strict Father" :
                      activeId === MentorId.STEVEN_HE ? "Steven He" : "The Enforcer Mom";
        addDojoLog(`✨ ${mName} gained +${amount} EXP!`);
      }

      return updated;
    });
  };

  const getActiveMentorWithSkins = () => {
    if (!selectedMentor) return null;
    const baseMentor = enhanceMentorWithLevel(selectedMentor, mentorProgress[selectedMentor.id]?.level || 1, mentorProgress[selectedMentor.id]?.exp || 0);
    
    // Skin custom overlays
    if (baseMentor.id === MentorId.COOL_BROTHER && equippedSkinId === "r3") {
      baseMentor.avatar = "https://images.unsplash.com/photo-1541562232579-512a21360020?auto=format&fit=crop&w=300&q=80";
      baseMentor.name = "Hiro (Summer Outing 🌊)";
    } else if (baseMentor.id === MentorId.STEVEN_HE && equippedSkinId === "r7") {
      baseMentor.avatar = "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=300&q=80";
      baseMentor.name = "Steven He (Golden Slipper 🩴)";
    }
    
    return baseMentor;
  };

  const activeMentor = getActiveMentorWithSkins();

  // States lists
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [microGoals, setMicroGoals] = useState<MicroGoal[]>(INITIAL_MICRO_GOALS);
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [blockedApps, setBlockedApps] = useState<string[]>(["Instagram", "TikTok", "Reddit"]);

  // Gamification Metrics
  const [userStats, setUserStats] = useState<UserStats>({
    kp: 180, // Kinetics points
    level: 2,
    multiplier: 1.15,
    tasksCompleted: 4,
    pomodoroSessions: 1,
    totalFocusedMinutes: 45,
    distractionsBlocked: 3,
    dailyStreak: 3,
    weeklyStreak: 1,
    monthlyStreak: 0
  });

  // Aesthetic State (Light/Dark mode)
  const [isLightMode, setIsLightMode] = useState(false);

  // Notification Feed Logs
  const [dojoLogs, setDojoLogs] = useState<string[]>([
    "Dōjō system synchronized successfully.",
    "Selected Cool Brother Hiro as initial companion."
  ]);

  const addDojoLog = (message: string) => {
    setDojoLogs((prev) => [`[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] ${message}`, ...prev.slice(0, 15)]);
  };

  // AI Chat History State
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  // Automatically update level as KP rises
  useEffect(() => {
    const calculatedLevel = Math.max(2, Math.floor(userStats.kp / 200) + 1);
    if (calculatedLevel !== userStats.level) {
      setUserStats((prev) => ({ ...prev, level: calculatedLevel }));
      addDojoLog(`🎉 LEVEL UP! You achieved Dojo Level ${calculatedLevel}!`);
    }
  }, [userStats.kp]);

  // Ref to track previous stats for mentor experience gains
  const prevStatsRef = useRef({
    tasksCompleted: userStats.tasksCompleted,
    pomodoroSessions: userStats.pomodoroSessions
  });

  useEffect(() => {
    const prev = prevStatsRef.current;
    let expToGain = 0;

    if (userStats.tasksCompleted > prev.tasksCompleted) {
      const diff = userStats.tasksCompleted - prev.tasksCompleted;
      expToGain += diff * 20; // 20 EXP per completed goal/task
    }

    if (userStats.pomodoroSessions > prev.pomodoroSessions) {
      const diff = userStats.pomodoroSessions - prev.pomodoroSessions;
      expToGain += diff * 50; // 50 EXP per completed Pomodoro focus session
    }

    if (expToGain > 0 && selectedMentor) {
      gainMentorExp(expToGain);
    }

    // Keep ref in sync
    prevStatsRef.current = {
      tasksCompleted: userStats.tasksCompleted,
      pomodoroSessions: userStats.pomodoroSessions
    };
  }, [userStats.tasksCompleted, userStats.pomodoroSessions, selectedMentor]);

  // Set chat greeting when mentor is selected
  useEffect(() => {
    if (activeMentor) {
      let greeting = `Hey bro! Let's conquer our priorities today. How's your current sprint looking?`;
      if (activeMentor.id === MentorId.SAVAGE_SISTER) {
        greeting = `Oh, look who decided to show up. Ready to stop being a slacker and actually get some tasks completed? Let's hear it.`;
      } else if (activeMentor.id === MentorId.STRICT_FATHER) {
        greeting = `Discipline is the foundation of all accomplishments. Report your 12-week milestones immediately. No excuses.`;
      } else if (activeMentor.id === MentorId.ENFORCER_MOM) {
        greeting = `HELLOOO! Have you done your minimum 3 hours of focused studies today?! Tell me right now! No fibbing!`;
      }

      if (activeMentor.level >= 2) {
        greeting += ` (Level ${activeMentor.level} "${activeMentor.levelTitle}" active)`;
      }

      setChatHistory([
        {
          id: "g1",
          sender: "mentor",
          text: greeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [selectedMentor]);

  return (
    <div
      id="root-app-layout"
      className={`min-h-screen w-full flex items-center justify-center transition-colors duration-500 p-0 sm:p-4 md:p-6 select-none ${
        isLightMode ? "bg-zinc-100 text-zinc-950" : "bg-black text-white"
      }`}
    >
      {/* Interactive Mobile Device Frame Container */}
      <div
        id="device-frame"
        className={`w-full max-w-md h-full sm:h-[840px] rounded-none sm:rounded-[36px] overflow-hidden border transition-all duration-500 ${
          equippedThemeId === "r1"
            ? "bg-black border-pink-500 shadow-[0_0_40px_rgba(236,72,153,0.3)]"
            : equippedThemeId === "r8"
              ? "bg-[#0c0803] border-amber-600 shadow-[0_0_40px_rgba(245,158,11,0.2)]"
              : isLightMode
                ? "bg-white border-zinc-200 shadow-2xl"
                : "bg-[#050505] border-zinc-900 shadow-[0_0_50px_rgba(123,46,255,0.06)]"
        } flex flex-col relative`}
      >
        {/* Device Status Notch bar */}
        <div className="bg-black text-white text-[10px] font-mono px-6 py-2.5 flex justify-between items-center select-none shrink-0 border-b border-zinc-900">
          <span className="font-semibold text-purple-400">DOJO CELLULAR</span>
          <div className="flex gap-2 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[9.5px]">LTE / GPS ON</span>
          </div>
        </div>

        {/* Dynamic Route Screen Transitions */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          <AnimatePresence mode="wait">
            {step === "AUTH" && (
              <motion.div
                key="auth"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="absolute inset-0"
              >
                <AuthScreen
                  onSuccess={(email) => {
                    setUserEmail(email);
                    setStep("GOAL_SETUP");
                    addDojoLog(`User logged in as ${email}.`);
                  }}
                />
              </motion.div>
            )}

            {step === "GOAL_SETUP" && (
              <motion.div
                key="goal"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute inset-0"
              >
                <GoalSetupScreen
                  onComplete={(data) => {
                    setMainGoal(data.mainGoal);
                    setGoalDescription(data.goalDescription);
                    setExpectedOutcome(data.expectedOutcome);
                    setStep("COMMITMENT");
                    addDojoLog("Configured 12-Week Year Targets.");
                  }}
                />
              </motion.div>
            )}

            {step === "COMMITMENT" && (
              <motion.div
                key="commitment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute inset-0"
              >
                <DailyCommitmentScreen
                  onComplete={(hours) => {
                    setDailyCommitment(hours);
                    setStep("MENTOR_SELECTION");
                    addDojoLog(`Committed to ${hours} hours daily.`);
                  }}
                />
              </motion.div>
            )}

            {step === "MENTOR_SELECTION" && (
              <motion.div
                key="mentor"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute inset-0"
              >
                <MentorSelectionScreen
                  onSelect={(mentorId) => {
                    const foundMentor = MENTORS_DATA.find(m => m.id === mentorId);
                    if (foundMentor) {
                      setSelectedMentor(foundMentor);
                      setStep("APP");
                      addDojoLog(`Partnered with ${foundMentor.name} for 12-week sprint.`);
                    }
                  }}
                  mentorProgress={mentorProgress}
                />
              </motion.div>
            )}

            {step === "APP" && selectedMentor && (
              <motion.div
                key="app"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex flex-col h-full"
              >
                {/* Main Workspace Frame rendering based on activeTab */}
                <div className="flex-1 overflow-hidden relative">
                  {activeTab === "dashboard" && (
                    <DashboardView
                      userStats={userStats}
                      setUserStats={setUserStats}
                      mentor={activeMentor!}
                      mainGoal={mainGoal}
                      tasks={tasks}
                      setTasks={setTasks}
                      onOpenTaskManager={() => setActiveTab("tasks")}
                      onOpenAnalytics={() => setActiveTab("analytics")}
                      onAddLog={addDojoLog}
                      equippedThemeId={equippedThemeId}
                    />
                  )}

                  {activeTab === "tasks" && (
                    <TaskManagerView
                      tasks={tasks}
                      setTasks={setTasks}
                      userStats={userStats}
                      setUserStats={setUserStats}
                      mentor={activeMentor!}
                      onAddLog={addDojoLog}
                    />
                  )}

                  {activeTab === "micro_goals" && (
                    <MicroGoalsView
                      microGoals={microGoals}
                      setMicroGoals={setMicroGoals}
                      mainGoal={mainGoal}
                      goalDescription={goalDescription}
                      expectedOutcome={expectedOutcome}
                      userStats={userStats}
                      setUserStats={setUserStats}
                      onAddLog={addDojoLog}
                    />
                  )}

                  {activeTab === "rewards" && (
                    <RewardsView
                      userStats={userStats}
                      setUserStats={setUserStats}
                      mentor={activeMentor!}
                      onAddLog={addDojoLog}
                      unlockedRewardIds={unlockedRewardIds}
                      onUnlockReward={(id) => setUnlockedRewardIds((prev) => [...prev, id])}
                      equippedThemeId={equippedThemeId}
                      onEquipTheme={setEquippedThemeId}
                      equippedSkinId={equippedSkinId}
                      onEquipSkin={setEquippedSkinId}
                    />
                  )}

                  {activeTab === "chat" && (
                    <AIChatBuddyView
                      mentor={activeMentor!}
                      chatHistory={chatHistory}
                      setChatHistory={setChatHistory}
                    />
                  )}

                  {activeTab === "notes" && (
                    <NotesView
                      notes={notes}
                      setNotes={setNotes}
                      onAddLog={addDojoLog}
                    />
                  )}

                  {activeTab === "analytics" && (
                    <AnalyticsView
                      userStats={userStats}
                      mentor={activeMentor!}
                    />
                  )}

                  {activeTab === "profile" && (
                    <ProfileSettingsView
                      userStats={userStats}
                      mentor={activeMentor!}
                      isLightMode={isLightMode}
                      setIsLightMode={setIsLightMode}
                      blockedApps={blockedApps}
                      setBlockedApps={setBlockedApps}
                    />
                  )}
                </div>

                {/* Glassmorphic Mobile Bottom-Navigation Bar */}
                <div
                  id="mobile-bottom-nav"
                  className={`absolute bottom-0 left-0 right-0 py-3.5 px-4 flex justify-between items-center border-t backdrop-blur-lg z-30 shrink-0 ${
                    isLightMode
                      ? "bg-white/85 border-zinc-200"
                      : "bg-[#060606]/85 border-zinc-900"
                  }`}
                >
                  <button
                    id="nav-tab-dashboard"
                    onClick={() => setActiveTab("dashboard")}
                    className={`flex flex-col items-center gap-1 transition-colors ${
                      activeTab === "dashboard" ? "text-purple-500 font-bold" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <Home className="w-5 h-5" />
                    <span className="text-[9px] font-mono">Dōjō</span>
                  </button>

                  <button
                    id="nav-tab-tasks"
                    onClick={() => setActiveTab("tasks")}
                    className={`flex flex-col items-center gap-1 transition-colors ${
                      activeTab === "tasks" ? "text-purple-500 font-bold" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <CheckSquare className="w-5 h-5" />
                    <span className="text-[9px] font-mono">Sprints</span>
                  </button>

                  <button
                    id="nav-tab-micro"
                    onClick={() => setActiveTab("micro_goals")}
                    className={`flex flex-col items-center gap-1 transition-colors ${
                      activeTab === "micro_goals" ? "text-purple-500 font-bold" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span className="text-[9px] font-mono">AI Goals</span>
                  </button>

                  <button
                    id="nav-tab-rewards"
                    onClick={() => setActiveTab("rewards")}
                    className={`flex flex-col items-center gap-1 transition-colors ${
                      activeTab === "rewards" ? "text-purple-500 font-bold" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <Zap className="w-5 h-5" />
                    <span className="text-[9px] font-mono">Vault</span>
                  </button>

                  <button
                    id="nav-tab-chat"
                    onClick={() => setActiveTab("chat")}
                    className={`flex flex-col items-center gap-1 transition-colors ${
                      activeTab === "chat" ? "text-purple-500 font-bold" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-[9px] font-mono">Chat</span>
                  </button>

                  <button
                    id="nav-tab-notes"
                    onClick={() => setActiveTab("notes")}
                    className={`flex flex-col items-center gap-1 transition-colors ${
                      activeTab === "notes" ? "text-purple-500 font-bold" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <BookText className="w-5 h-5" />
                    <span className="text-[9px] font-mono">Notes</span>
                  </button>

                  <button
                    id="nav-tab-analytics"
                    onClick={() => setActiveTab("analytics")}
                    className={`flex flex-col items-center gap-1 transition-colors ${
                      activeTab === "analytics" ? "text-purple-500 font-bold" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <BarChart2 className="w-5 h-5" />
                    <span className="text-[9px] font-mono">Stats</span>
                  </button>

                  <button
                    id="nav-tab-profile"
                    onClick={() => setActiveTab("profile")}
                    className={`flex flex-col items-center gap-1 transition-colors ${
                      activeTab === "profile" ? "text-purple-500 font-bold" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                    <span className="text-[9px] font-mono">Setup</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
