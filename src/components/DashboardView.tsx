/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Task, Mentor, MentorId, UserStats } from "../types";
import { Play, Pause, RotateCcw, AlertOctagon, Sparkles, Plus, Trash2, Edit2, CheckCircle, ShieldAlert, Zap, Award, Flame, Star, ShieldX } from "lucide-react";

interface DashboardViewProps {
  userStats: UserStats;
  setUserStats: React.Dispatch<React.SetStateAction<UserStats>>;
  mentor: Mentor;
  mainGoal: string;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onOpenTaskManager: () => void;
  onOpenAnalytics: () => void;
  onAddLog: (log: string) => void;
  equippedThemeId?: string;
}

export default function DashboardView({
  userStats,
  setUserStats,
  mentor,
  mainGoal,
  tasks,
  setTasks,
  onOpenTaskManager,
  onOpenAnalytics,
  onAddLog,
  equippedThemeId = "default"
}: DashboardViewProps) {
  // Pomodoro & Focus State
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // App Blocker Simulation State
  const [showDistractionSim, setShowDistractionSim] = useState(false);
  const [simulatingApp, setSimulatingApp] = useState<string | null>(null);
  const [reminderTicks, setReminderTicks] = useState(mentor.remindersCount);
  const [distractionMsg, setDistractionMsg] = useState("");
  const [distractionFlash, setDistractionFlash] = useState(false);

  // Quick Task Addition
  const [quickTitle, setQuickTitle] = useState("");
  const [quickCategory, setQuickCategory] = useState<Task["category"]>("Study");
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Timer Tick Engine
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds((prev) => prev - 1);
        } else if (timerMinutes > 0) {
          setTimerMinutes((prev) => prev - 1);
          setTimerSeconds(59);
        } else {
          // Focus Session Finished!
          setIsActive(false);
          setIsFocusMode(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          
          // Apply KP and streaks
          const gainedKp = Math.round(150 * userStats.multiplier);
          setUserStats((prev) => ({
            ...prev,
            kp: prev.kp + gainedKp,
            pomodoroSessions: prev.pomodoroSessions + 1,
            totalFocusedMinutes: prev.totalFocusedMinutes + 25
          }));
          onAddLog(`Focus session complete! Gained ${gainedKp} KP.`);
          alert(`🏆 Session Completed! Gained ${gainedKp} KP!`);
          
          setTimerMinutes(25);
          setTimerSeconds(0);
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timerMinutes, timerSeconds, userStats.multiplier]);

  // Handle Focus Mode toggles
  const toggleFocusMode = () => {
    if (!isFocusMode) {
      setIsFocusMode(true);
      setIsActive(true);
      setReminderTicks(mentor.remindersCount);
      onAddLog(`Focus mode started with ${mentor.name}. Blocker active.`);
    } else {
      setIsFocusMode(false);
      setIsActive(false);
      onAddLog("Focus session paused.");
    }
  };

  const handleResetTimer = () => {
    setIsActive(false);
    setIsFocusMode(false);
    setTimerMinutes(25);
    setTimerSeconds(0);
  };

  // Simulate opening a distraction app
  const triggerDistractionSimulation = (app: string) => {
    if (!isFocusMode) return;
    setSimulatingApp(app);
    setShowDistractionSim(true);
    setReminderTicks(mentor.remindersCount);
    
    // Set dynamic message based on mentor and reminders
    evaluateDistractionStep(app, mentor.remindersCount);
  };

  const evaluateDistractionStep = (app: string, currentReminders: number) => {
    if (mentor.id === MentorId.COOL_BROTHER) {
      if (currentReminders === 3) {
        setDistractionMsg(`"Hey bro! Just opened ${app}? No sweat, we've got goals to crush today. Put it away so we can keep the streak going! 👍"`);
      } else if (currentReminders === 2) {
        setDistractionMsg(`"Uh oh, opening ${app} again? Let's stay disciplined. I know it's tempting, but your future self is counting on you!"`);
      } else if (currentReminders === 1) {
        setDistractionMsg(`"Bro, last warning. If you keep scrolling ${app}, I'm going to have to lock the dashboard. Let's finish the focus timer!"`);
      } else {
        setDistractionMsg(`"Dojo Rules: Too many distractions. Force-closing ${app} now. Back to the scroll, buddy!"`);
      }
    } else if (mentor.id === MentorId.SAVAGE_SISTER) {
      if (currentReminders === 2) {
        setDistractionMsg(`"Oh look, the slacker is opening ${app} again. Did your goals finish themselves, or are you just waiting for a miracle? 🙄"`);
      } else if (currentReminders === 1) {
        setDistractionMsg(`"Seriously? Still on ${app}? Put down the phone before I tell Dad you're wasting your life. Last warning!"`);
      } else {
        setDistractionMsg(`"Savage sister mode: Termination! Closing ${app} now. You're losing multiplier points, slacker! 😤"`);
      }
    } else if (mentor.id === MentorId.STRICT_FATHER) {
      if (currentReminders === 1) {
        setDistractionMsg(`"Opening ${app} is a sign of weakness. Your focus has shattered. I am giving you exactly ONE reminder to return to duty."`);
      } else {
        setDistractionMsg(`"DISCIPLINE BEATS TALENT. No further warnings. Closing ${app} instantly. Multiplier reduced. Stand tall and return."`);
      }
    } else if (mentor.id === MentorId.ENFORCER_MOM) {
      setDistractionMsg(`"DID I SAY YOU COULD SCROLL ${app}?! WORK! NO DISTRACTIONS ALLOWED IN MY HOUSE. CLOSED INSTANTLY! 😡🔥"`);
    } else if (mentor.id === MentorId.STEVEN_HE) {
      setDistractionMsg(`"EMOTIONAL DAMAGE!!! You opened ${app} laa?! Timmy already built 4 rocket ships at your age, and you can't even close a tab! One more touch and I call Jesus! 🩴"`);
    }
  };

  const proceedDistractionSimulation = () => {
    if (reminderTicks > 0) {
      const nextTick = reminderTicks - 1;
      setReminderTicks(nextTick);
      evaluateDistractionStep(simulatingApp || "Social App", nextTick);
    } else {
      // Hard block / force close occurs!
      setDistractionFlash(true);
      setTimeout(() => {
        setDistractionFlash(false);
        setShowDistractionSim(false);
        setSimulatingApp(null);
        
        // Apply penalties
        let lostKp = 0;
        let lostMult = 0;
        if (mentor.id === MentorId.COOL_BROTHER) {
          // No penalty
        } else if (mentor.id === MentorId.SAVAGE_SISTER) {
          lostMult = 0.1;
        } else if (mentor.id === MentorId.STRICT_FATHER) {
          lostKp = 10;
          lostMult = 0.1;
        } else if (mentor.id === MentorId.ENFORCER_MOM) {
          lostKp = 20;
          lostMult = userStats.multiplier - 1.0; // Reset to 1.0
        } else if (mentor.id === MentorId.STEVEN_HE) {
          lostKp = 15;
          lostMult = 0.25;
        }

        setUserStats((prev) => ({
          ...prev,
          kp: Math.max(0, prev.kp - lostKp),
          multiplier: Math.max(1.0, Number((prev.multiplier - lostMult).toFixed(2))),
          distractionsBlocked: prev.distractionsBlocked + 1
        }));

        onAddLog(`Blocked ${simulatingApp}. Penalty: -${lostKp} KP, -${lostMult.toFixed(2)}x Multiplier.`);
      }, 1000);
    }
  };

  const handleAddQuickTask = () => {
    if (!quickTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: quickTitle,
      priority: "high",
      category: quickCategory,
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      completed: false,
      createdAt: new Date().toISOString()
    };
    setTasks((prev) => [newTask, ...prev]);
    setQuickTitle("");
    setShowAddTaskModal(false);
    onAddLog(`Added high priority task: "${newTask.title}"`);
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextState = !t.completed;
          if (nextState) {
            // Earn rewards
            const gainedKp = Math.round(50 * userStats.multiplier);
            setUserStats((stats) => ({
              ...stats,
              kp: stats.kp + gainedKp,
              tasksCompleted: stats.tasksCompleted + 1,
              multiplier: Math.min(mentor.maxMultiplier, Number((stats.multiplier + 0.05).toFixed(2)))
            }));
            onAddLog(`Completed task! Gained ${gainedKp} KP & +0.05x Multiplier.`);
          }
          return { ...t, completed: nextState };
        }
        return t;
      })
    );
  };

  // Top 3 tasks sorting
  const topTasks = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => (a.priority === "high" ? -1 : 1))
    .slice(0, 3);

  // Formatted Timer String
  const formatTime = (min: number, sec: number) => {
    const m = min < 10 ? `0${min}` : min;
    const s = sec < 10 ? `0${sec}` : sec;
    return `${m}:${s}`;
  };

  const isCyberTheme = equippedThemeId === "r1";
  const isStevenTheme = equippedThemeId === "r8";

  return (
    <div id="dashboard-container" className={`flex flex-col h-full overflow-y-auto px-5 py-5 text-white space-y-5 pb-24 relative dot-grid transition-colors duration-500 ${
      isCyberTheme ? "bg-black" : isStevenTheme ? "bg-[#0c0803]" : ""
    }`}>
      <div className="absolute top-20 right-5 w-24 h-24 bg-[#7B2EFF]/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Floating slipper background decorations for Steven He Theme */}
      {isStevenTheme && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-15">
          <div className="absolute top-10 left-10 text-xl animate-bounce" style={{ animationDuration: "3s" }}>🩴</div>
          <div className="absolute bottom-20 right-10 text-2xl animate-bounce" style={{ animationDuration: "5.5s" }}>🩴</div>
          <div className="absolute top-1/3 right-1/4 text-lg animate-pulse" style={{ animationDuration: "4s" }}>🩴</div>
          <div className="absolute bottom-1/3 left-1/3 text-2xl animate-bounce" style={{ animationDuration: "4.5s" }}>🩴</div>
        </div>
      )}

      {/* Neon laser border animations for Cyber Theme */}
      {isCyberTheme && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-pink-500 to-transparent animate-pulse"></div>
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse"></div>
          <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-pink-500 to-transparent animate-pulse"></div>
          <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-gradient-to-b from-transparent via-cyan-500 to-transparent animate-pulse"></div>
        </div>
      )}

      {/* Hero Welcome banner */}
      <div className="flex items-center justify-between relative z-10">
        <div>
          <span className="text-xxs font-mono text-white/40 uppercase tracking-widest block font-bold">
            {isStevenTheme ? "Welcome back, Failure" : isCyberTheme ? "Welcome back, Netrunner" : "Welcome back, Legend"}
          </span>
          <h2 className="text-lg font-black tracking-tight text-white purple-text-glow">
            {isStevenTheme ? "Slipper Training Facility 🩴" : isCyberTheme ? "Neuro-Link Dojo 🧬" : "Focus Chamber"}
          </h2>
        </div>
        <div className={`flex items-center gap-2 border rounded-xl px-3 py-1.5 font-mono text-xs shadow-md transition-all ${
          isStevenTheme 
            ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
            : isCyberTheme 
              ? "bg-pink-500/10 border-pink-500/30 text-pink-400" 
              : "bg-[#7B2EFF]/10 border-[#7B2EFF]/25 text-white"
        }`}>
          <Zap className={`w-3.5 h-3.5 animate-pulse ${isStevenTheme ? "text-amber-500" : isCyberTheme ? "text-pink-500" : "text-[#7B2EFF]"}`} />
          <span className="font-black">{userStats.kp} <span className={`text-[10px] ${isStevenTheme ? "text-amber-500" : isCyberTheme ? "text-pink-500" : "text-[#7B2EFF]"}`}>KP</span></span>
        </div>
      </div>

      {/* Compact Active Mentor Leveling Status Widget */}
      <div className={`glass border border-white/5 rounded-2xl p-3.5 flex items-center justify-between shadow-lg relative overflow-hidden group ${mentor.glowingBorder}`}>
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
            <img
              src={mentor.avatar}
              alt={mentor.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute bottom-0 right-0 bg-[#7B2EFF] text-white text-[8px] px-1 rounded-tl-sm font-mono font-black">
              Lvl {mentor.level || 1}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white">{mentor.name}</span>
              <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-[#7B2EFF]/10 border border-[#7B2EFF]/20 text-purple-300 uppercase tracking-wider font-bold">
                {mentor.levelTitle || "Sensei"}
              </span>
            </div>
            <p className="text-[10px] italic text-white/60 font-mono truncate max-w-[190px] mt-0.5">
              "{mentor.quote}"
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[8px] font-mono text-[#7B2EFF] uppercase tracking-widest block font-black mb-1">
            {mentor.level === 5 ? "MAX LEVEL" : `${mentor.exp || 0} / ${mentor.nextLevelExp || 100} XP`}
          </span>
          {mentor.level !== 5 ? (
            <div className="w-16 bg-white/10 h-1.5 rounded-full overflow-hidden inline-block">
              <div
                className="bg-gradient-to-r from-[#7B2EFF] to-indigo-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, ((mentor.exp || 0) / (mentor.nextLevelExp || 100)) * 100)}%` }}
              ></div>
            </div>
          ) : (
            <span className="text-[8px] font-mono text-yellow-500 uppercase tracking-wider font-bold animate-pulse">
              🏆 MASTER
            </span>
          )}
        </div>
      </div>

      {/* Goal Progress Ring Panel */}
      <motion.div
        whileTap={{ scale: 0.99 }}
        onClick={onOpenAnalytics}
        className="glass border border-[#7B2EFF]/20 rounded-2xl p-4 shadow-xl flex items-center justify-between cursor-pointer relative overflow-hidden group purple-glow"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#7B2EFF]/40"></div>
        
        <div className="space-y-1 pr-4 max-w-[65%]">
          <span className="text-xxs font-mono text-white/40 uppercase tracking-widest block font-bold">Active 12-Week Sprint</span>
          <h3 className="text-xs font-bold font-sans line-clamp-1 group-hover:text-[#7B2EFF] transition-colors text-white">
            {mainGoal || "Configure primary objective"}
          </h3>
          <p className="text-xxxs text-white/40 font-mono mt-0.5 flex items-center gap-1 font-semibold uppercase">
            <Award className="w-3 h-3 text-[#7B2EFF]" /> Progression level: Steady
          </p>
        </div>

        {/* Circular Progress Representation */}
        <div className="relative flex items-center justify-center w-14 h-14 bg-black/60 rounded-full border border-white/5">
          <svg className="w-12 h-12 transform -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="3.5"
              fill="transparent"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="#7B2EFF"
              strokeWidth="3.5"
              fill="transparent"
              strokeDasharray="125.6"
              strokeDashoffset="37.6" // 70% complete representation
              className="transition-all duration-1000"
            />
          </svg>
          <span className="absolute text-[10px] font-mono font-black text-white purple-text-glow">70%</span>
        </div>
      </motion.div>

      {/* Pomodoro Timer and Distraction Apps */}
      <div className="glass border border-[#7B2EFF]/20 rounded-2xl p-5 shadow-xl space-y-4 relative purple-glow">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#7B2EFF]/40"></div>
        <div className="flex justify-between items-center">
          <span className="text-xxs font-mono text-white/40 uppercase tracking-widest flex items-center gap-1 font-bold">
            <Flame className="w-3.5 h-3.5 text-[#7B2EFF]" /> Pomodoro Engine
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase border border-[#7B2EFF]/30 bg-[#7B2EFF]/10 text-[#7B2EFF] flex items-center gap-1 scale-[0.9] font-bold">
            <CheckCircle className="w-3 h-3" /> Focus Blocker
          </span>
        </div>

        <div className="text-center space-y-4 py-2">
          {/* Display Timer */}
          <div className="text-5xl font-mono font-black tracking-tighter text-white purple-text-glow">
            {formatTime(timerMinutes, timerSeconds)}
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex justify-center items-center gap-3">
            <button
              id="pomo-reset-btn"
              onClick={handleResetTimer}
              className="w-10 h-10 rounded-xl bg-black/40 hover:bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              id="pomo-toggle-btn"
              onClick={toggleFocusMode}
              className={`px-6 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider flex items-center gap-2 transition-all ${
                isActive
                  ? "bg-red-950/20 border border-red-500/30 text-red-400 hover:bg-red-950/35"
                  : "bg-[#7B2EFF] hover:brightness-110 border-white/10 text-white shadow-[0_5px_15px_rgba(123,46,255,0.4)]"
              }`}
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4 fill-current" /> Pause Focus
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Start Focus
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic Multiplier Bar */}
        <div className="border-t border-white/5 pt-3 flex justify-between items-center text-xxs font-mono">
          <span className="text-white/40 uppercase tracking-widest font-bold">Multiplier Status</span>
          <span className="text-[#7B2EFF] font-black flex items-center gap-1 purple-text-glow">
            <Star className="w-3.5 h-3.5 fill-[#7B2EFF]/20" /> {userStats.multiplier.toFixed(2)}x / {mentor.maxMultiplier}.0x
          </span>
        </div>

        {/* DISTRACTION SIMULATION BLOCK (Visible only during focus mode) */}
        {isFocusMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="border-t border-white/5 pt-3.5 space-y-2 overflow-hidden"
          >
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block font-bold">Simulate Distraction Triggers</span>
            <div className="flex flex-wrap gap-1.5">
              {["Instagram", "TikTok", "YouTube", "Reddit"].map((app) => (
                <button
                  key={app}
                  id={`sim-trigger-${app}`}
                  onClick={() => triggerDistractionSimulation(app)}
                  className="bg-[#7B2EFF]/10 hover:bg-[#7B2EFF]/20 border border-[#7B2EFF]/20 text-purple-300 text-[10px] font-mono px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 font-bold"
                >
                  <AlertOctagon className="w-2.5 h-2.5 text-[#7B2EFF]" /> Open {app}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-white/30 italic font-mono">
              *Tests how {mentor.name.split(" ")[0]} acts as an app blocker!
            </p>
          </motion.div>
        )}
      </div>

      {/* Priority Tasks List Widget */}
      <div className="glass border border-[#7B2EFF]/20 rounded-2xl p-5 shadow-xl space-y-4 purple-glow">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#7B2EFF]/40"></div>
        <div className="flex justify-between items-center">
          <span className="text-xxs font-mono text-white/40 uppercase tracking-widest font-bold">Priority Milestones</span>
          <button
            id="dash-add-task-btn"
            onClick={() => setShowAddTaskModal(true)}
            className="text-xxs font-mono text-[#7B2EFF] hover:text-[#7B2EFF]/80 flex items-center gap-0.5 font-bold uppercase"
          >
            <Plus className="w-3.5 h-3.5" /> Quick Add
          </button>
        </div>

        {/* Top 3 tasks displaying */}
        <div className="space-y-2">
          {topTasks.length === 0 ? (
            <div className="text-center py-4 border border-dashed border-white/10 rounded-xl">
              <p className="text-xxs text-white/40 font-mono font-bold uppercase">No active high-priority tasks in dōjō.</p>
            </div>
          ) : (
            topTasks.map((task) => (
              <div
                key={task.id}
                className="bg-black/35 border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3 group hover:border-[#7B2EFF]/30 transition-all shadow-sm"
              >
                <div className="flex items-start gap-2.5">
                  <button
                    id={`complete-task-btn-${task.id}`}
                    onClick={() => toggleTaskComplete(task.id)}
                    className="mt-0.5 w-4 h-4 rounded border border-[#7B2EFF]/40 flex items-center justify-center hover:bg-[#7B2EFF]/10 transition-colors cursor-pointer"
                  >
                    {task.completed && <span className="w-2.5 h-2.5 bg-[#7B2EFF] rounded-sm"></span>}
                  </button>
                  <div>
                    <h4 className="text-xs font-bold font-sans text-white/90 group-hover:text-white transition-colors">
                      {task.title}
                    </h4>
                    <span className="text-[9.5px] font-mono text-[#7B2EFF] bg-[#7B2EFF]/10 px-1.5 py-0.5 rounded border border-[#7B2EFF]/10 mt-1 inline-block font-bold uppercase">
                      {task.category}
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-red-400 uppercase tracking-widest bg-red-950/20 border border-red-500/20 px-1.5 py-0.5 rounded font-bold">
                  High Priority
                </span>
              </div>
            ))
          )}
        </div>

        {/* Full Task Manager Trigger */}
        <button
          id="dash-open-task-manager"
          onClick={onOpenTaskManager}
          className="w-full bg-black/40 hover:bg-white/5 border border-white/10 text-white/80 py-2.5 rounded-xl text-xxs font-mono font-bold uppercase transition-all flex items-center justify-center gap-1"
        >
          Manage All Tasks & Sprints ({tasks.length})
        </button>
      </div>

      {/* QUICK ADD TASK MODAL */}
      <AnimatePresence>
        {showAddTaskModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md z-40 flex items-center justify-center p-6"
          >
            <div className="glass border border-[#7B2EFF]/35 rounded-2xl p-5 w-full max-w-sm space-y-4 purple-glow relative overflow-hidden dot-grid">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#7B2EFF]/50"></div>
              <h3 className="text-sm font-black font-mono text-[#7B2EFF] purple-text-glow uppercase tracking-wider">Add High-Priority Sprint</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-bold">Task Title</label>
                  <input
                    id="modal-task-title-input"
                    type="text"
                    placeholder="Describe your execution target..."
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 focus:border-[#7B2EFF] rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-bold">Category</label>
                  <select
                    id="modal-task-category-input"
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value as Task["category"])}
                    className="w-full bg-black/50 border border-white/10 focus:border-[#7B2EFF] rounded-xl px-3 py-2 text-xs text-white outline-none font-mono font-bold"
                  >
                    {["Study", "Coding", "Fitness", "Design", "Life"].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  id="modal-cancel-task"
                  onClick={() => setShowAddTaskModal(false)}
                  className="flex-1 bg-black/40 hover:bg-white/5 py-2 rounded-xl text-xxs font-mono text-white/60 border border-white/10 font-bold uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="modal-submit-task"
                  onClick={handleAddQuickTask}
                  className="flex-1 bg-[#7B2EFF] hover:brightness-110 py-2 rounded-xl text-xxs font-mono text-white font-black uppercase shadow-[0_5px_15px_rgba(123,46,255,0.4)]"
                >
                  Lock Task
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL SCREEN DISTRACTION MOCK BLOCKER */}
      <AnimatePresence>
        {showDistractionSim && simulatingApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 z-50 flex flex-col justify-between p-6 overflow-hidden ${
              distractionFlash ? "bg-red-600" : "bg-black/95 dot-grid"
            } transition-colors duration-200`}
          >
            {/* Funny Steven He Flashing Intervention */}
            {distractionFlash && mentor.id === MentorId.STEVEN_HE && (
              <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-red-950/95 text-white border-4 border-amber-500 rounded-none sm:rounded-[36px] overflow-hidden">
                <motion.div 
                  animate={{ rotate: [0, -20, 20, -20, 20, 0], scale: [1, 1.2, 1.2, 1] }} 
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-7xl mb-4"
                >
                  🩴
                </motion.div>
                <h1 className="text-3xl font-black font-sans tracking-widest text-amber-500 text-center uppercase drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] animate-pulse px-4">
                  EMOTIONAL DAMAGE!
                </h1>
                <p className="text-xs text-white/80 font-mono mt-4 uppercase tracking-wider font-extrabold max-w-[280px] text-center bg-black/60 px-3 py-1.5 rounded-lg border border-white/10">
                  "Timmy is doing neurosurgery while cooking rice, what are you doing? Failure!"
                </p>
              </div>
            )}
            {/* Mock Header overlay mimicking native device */}
            <div className="flex justify-between items-center text-white/30 font-mono text-[10px] border-b border-white/5 pb-3">
              <span className="font-bold uppercase tracking-widest">ALERT: SYSTEM INTERFERENCE</span>
              <span className="text-red-500 flex items-center gap-1 font-black animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5 animate-bounce" /> APP DETECTED: {simulatingApp.toUpperCase()}
              </span>
            </div>

            {/* Mentor Face & Warning Popup */}
            <div className="my-auto text-center space-y-6">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-red-500 shadow-lg shadow-red-500/40 mx-auto">
                  <img
                    src={mentor.avatar}
                    alt={mentor.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover filter brightness-[0.85] contrast-[1.1]"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-red-600 rounded-full p-1.5 border-2 border-black shadow-md">
                  <ShieldX className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-md font-black text-red-500 font-mono uppercase tracking-wider animate-pulse">
                  {mentor.name.split(" ")[0]} Intervenes!
                </h3>
                {/* Dialogue cloud style */}
                <div className="bg-black/60 border border-red-500/30 p-4 rounded-2xl max-w-sm mx-auto text-xs font-mono text-white/90 shadow-lg">
                  {distractionMsg}
                </div>
              </div>

              {/* Reminders Count Badge */}
              <div className="font-mono">
                {mentor.remindersCount > 0 ? (
                  <div className="text-xxs text-white/40 font-bold uppercase tracking-wider">
                    Reminders Remaining:{" "}
                    <span className="text-red-500 font-black text-sm">{reminderTicks}</span> / {mentor.remindersCount}
                  </div>
                ) : (
                  <div className="text-xxs text-red-500 font-black tracking-widest uppercase animate-pulse">
                    🚨 NO REMINDERS ALLOWED (INSTANT DISCIPLINE)
                  </div>
                )}
              </div>
            </div>

            {/* Simulated actions */}
            <div className="space-y-2.5">
              <button
                id="distraction-sim-try-close"
                onClick={proceedDistractionSimulation}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-black py-3 rounded-xl border border-red-400/20 active:scale-[0.98] transition-all shadow-lg shadow-red-600/30 uppercase tracking-widest"
              >
                {mentor.id === MentorId.STEVEN_HE
                  ? (reminderTicks > 0 ? "Scroll anyway (Risk Flying Slipper 🩴)" : "Accept Enforcement (Yes, I am Failure laa)")
                  : (reminderTicks > 0 ? "Ignore and try scrolling anyway" : "Accept enforcement (Force Close)")}
              </button>
              <button
                id="distraction-sim-back-focus"
                onClick={() => {
                  setShowDistractionSim(false);
                  setSimulatingApp(null);
                  onAddLog(
                    mentor.id === MentorId.STEVEN_HE
                      ? "Saved your pride! Closed distraction and returned to work."
                      : `Closed ${simulatingApp} and returned to Dojo study session.`
                  );
                }}
                className="w-full bg-white/5 hover:bg-white/10 text-white/60 font-mono text-[10px] py-2 rounded-xl transition-colors uppercase font-bold border border-white/5"
              >
                {mentor.id === MentorId.STEVEN_HE ? "Sorry Steven, I am returning to work!" : "Yes Sensei, I'm returning to work!"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
