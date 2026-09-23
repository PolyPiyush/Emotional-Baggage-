/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MicroGoal, UserStats, Mentor } from "../types";
import { Brain, Sparkles, CheckCircle2, Circle, Trash2, Plus, Edit2, Loader2, Award, Zap } from "lucide-react";

interface MicroGoalsViewProps {
  microGoals: MicroGoal[];
  setMicroGoals: React.Dispatch<React.SetStateAction<MicroGoal[]>>;
  mainGoal: string;
  goalDescription: string;
  expectedOutcome: string;
  userStats: UserStats;
  setUserStats: React.Dispatch<React.SetStateAction<UserStats>>;
  onAddLog: (log: string) => void;
}

export default function MicroGoalsView({
  microGoals,
  setMicroGoals,
  mainGoal,
  goalDescription,
  expectedOutcome,
  userStats,
  setUserStats,
  onAddLog
}: MicroGoalsViewProps) {
  const [loading, setLoading] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customTimeframe, setCustomTimeframe] = useState<MicroGoal["timeframe"]>("micro");
  
  // Custom Edit state
  const [editingGoal, setEditingGoal] = useState<MicroGoal | null>(null);

  // Trigger Gemini-powered Goal breakdown
  const handleAIBreakdown = async () => {
    setLoading(true);
    onAddLog("Initiated AI-powered 12-Week Year breakdown...");
    try {
      const response = await fetch("/api/generate-micro-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mainGoal,
          goalDescription,
          expectedOutcome
        })
      });

      if (!response.ok) {
        throw new Error("Failed to contact Gemini");
      }

      const data = await response.json();
      if (data.goals && Array.isArray(data.goals)) {
        const formattedGoals: MicroGoal[] = data.goals.map((g: any, index: number) => ({
          id: `ai-${Date.now()}-${index}`,
          title: g.title,
          timeframe: g.timeframe,
          completed: false
        }));
        setMicroGoals(formattedGoals);
        onAddLog("Successfully compiled AI goal breakdown!");
      }
    } catch (error) {
      console.error("AI Goal Breakdown error:", error);
      onAddLog("Gemini breakdown error. Applied dōjō standard fallback goals.");
    } finally {
      setLoading(false);
    }
  };

  const toggleGoalComplete = (id: string) => {
    setMicroGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const nextState = !g.completed;
          if (nextState) {
            // Give KP rewards
            let kpValue = 30; // base micro
            if (g.timeframe === "monthly") kpValue = 120;
            else if (g.timeframe === "weekly") kpValue = 70;
            else if (g.timeframe === "daily") kpValue = 40;

            const finalKp = Math.round(kpValue * userStats.multiplier);
            setUserStats((prevStats) => ({
              ...prevStats,
              kp: prevStats.kp + finalKp,
              tasksCompleted: prevStats.tasksCompleted + 1
            }));
            onAddLog(`Completed AI ${g.timeframe} target! Credited +${finalKp} KP.`);
          }
          return { ...g, completed: nextState };
        }
        return g;
      })
    );
  };

  const handleAddCustomGoal = () => {
    if (!customTitle.trim()) return;
    const newGoal: MicroGoal = {
      id: `custom-${Date.now()}`,
      title: customTitle,
      timeframe: customTimeframe,
      completed: false
    };
    setMicroGoals((prev) => [...prev, newGoal]);
    setCustomTitle("");
    onAddLog(`Added custom ${customTimeframe} task: "${newGoal.title}"`);
  };

  const handleDeleteGoal = (id: string) => {
    setMicroGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handleUpdateGoal = () => {
    if (!editingGoal || !editingGoal.title.trim()) return;
    setMicroGoals((prev) =>
      prev.map((g) => (g.id === editingGoal.id ? editingGoal : g))
    );
    setEditingGoal(null);
  };

  // Group goals by timeframe
  const monthly = microGoals.filter((g) => g.timeframe === "monthly");
  const weekly = microGoals.filter((g) => g.timeframe === "weekly");
  const daily = microGoals.filter((g) => g.timeframe === "daily");
  const micro = microGoals.filter((g) => g.timeframe === "micro");

  // Calculate local progress percentage
  const totalCount = microGoals.length;
  const completedCount = microGoals.filter((g) => g.completed).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div id="micro-goals-container" className="flex flex-col h-full overflow-y-auto px-5 py-5 text-white space-y-4 pb-24 relative dot-grid">
      <div className="absolute top-1/4 right-5 w-32 h-32 bg-[#7B2EFF]/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xxs font-mono text-[#7B2EFF] uppercase tracking-widest block font-bold">AI Decomposition Engine</span>
          <h2 className="text-lg font-black tracking-tight text-white purple-text-glow">Micro Goals</h2>
        </div>

        <button
          id="ai-decompose-btn"
          onClick={handleAIBreakdown}
          disabled={loading}
          className="bg-[#7B2EFF]/10 hover:bg-[#7B2EFF]/25 border border-[#7B2EFF]/40 text-[#7B2EFF] text-[10px] font-mono font-black py-1.5 px-3 rounded-xl flex items-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(123,46,255,0.2)] uppercase tracking-wider cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7B2EFF]" /> Splitting...
            </>
          ) : (
            <>
              <Brain className="w-3.5 h-3.5 animate-pulse text-[#7B2EFF]" /> Split via AI
            </>
          )}
        </button>
      </div>

      {/* Goal Summary Header */}
      <div className="glass border border-white/5 rounded-2xl p-4 shadow-xl space-y-3 purple-glow">
        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block font-bold">Core Target Objective</span>
        <h3 className="text-xs font-bold font-sans text-white/90">
          {mainGoal || "Primary objective not set"}
        </h3>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xxs font-mono text-white/40 font-bold uppercase">
            <span>Progress Breakdown</span>
            <span className="text-[#7B2EFF] font-black">{progressPercent}% Completed</span>
          </div>
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div
              className="bg-[#7B2EFF] h-full transition-all duration-500 shadow-[0_0_10px_#7B2EFF]"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* SKELETON LOADER DURING GEMINI SPRINT GENERATION */}
      {loading ? (
        <div className="space-y-4 py-4 animate-pulse">
          <p className="text-xxs font-mono text-[#7B2EFF] text-center animate-pulse font-bold uppercase tracking-widest">
            🔮 Consulting Anime Mentor Sensei... breaking down target...
          </p>
          {[1, 2, 3].map((val) => (
            <div key={val} className="glass border border-white/5 rounded-xl p-4 space-y-2">
              <div className="w-24 h-2 bg-white/5 rounded"></div>
              <div className="w-full h-3 bg-white/5 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        /* GOAL GRID CHANNELS */
        <div className="space-y-4 flex-1">
          {/* MONTHLY MILESTONE */}
          <div className="space-y-2">
            <h4 className="text-xxs font-mono uppercase tracking-widest text-emerald-400 font-bold">
              ✦ Monthly Milestone (+120 KP)
            </h4>
            {monthly.length === 0 ? (
              <p className="text-[10px] text-white/30 italic font-mono pl-2">No monthly objectives set.</p>
            ) : (
              monthly.map((g) => (
                <div
                  key={g.id}
                  className="glass border border-emerald-500/10 rounded-xl p-3 flex items-center justify-between gap-3 group hover:border-[#7B2EFF]/20 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <button
                      id={`toggle-micro-${g.id}`}
                      onClick={() => toggleGoalComplete(g.id)}
                      className="text-white/40 hover:text-white transition-colors cursor-pointer"
                    >
                      {g.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-500/10" />
                      ) : (
                        <Circle className="w-4 h-4 text-white/20" />
                      )}
                    </button>
                    <span className={`text-xs font-bold font-sans ${g.completed ? 'line-through text-white/30 font-medium' : 'text-white/90'}`}>
                      {g.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      id={`edit-micro-${g.id}`}
                      onClick={() => setEditingGoal(g)}
                      className="p-1 text-white/40 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`delete-micro-${g.id}`}
                      onClick={() => handleDeleteGoal(g.id)}
                      className="p-1 text-white/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* WEEKLY SPRINT */}
          <div className="space-y-2">
            <h4 className="text-xxs font-mono uppercase tracking-widest text-[#7B2EFF] font-bold">
              ✦ Weekly Goals (+70 KP)
            </h4>
            {weekly.length === 0 ? (
              <p className="text-[10px] text-white/30 italic font-mono pl-2">No weekly targets.</p>
            ) : (
              weekly.map((g) => (
                <div
                  key={g.id}
                  className="glass border border-[#7B2EFF]/10 rounded-xl p-3 flex items-center justify-between gap-3 group hover:border-[#7B2EFF]/20 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <button
                      id={`toggle-micro-${g.id}`}
                      onClick={() => toggleGoalComplete(g.id)}
                      className="text-white/40 hover:text-white transition-colors cursor-pointer"
                    >
                      {g.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#7B2EFF] fill-[#7B2EFF]/10" />
                      ) : (
                        <Circle className="w-4 h-4 text-white/20" />
                      )}
                    </button>
                    <span className={`text-xs font-bold font-sans ${g.completed ? 'line-through text-white/30 font-medium' : 'text-white/90'}`}>
                      {g.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      id={`edit-micro-${g.id}`}
                      onClick={() => setEditingGoal(g)}
                      className="p-1 text-white/40 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`delete-micro-${g.id}`}
                      onClick={() => handleDeleteGoal(g.id)}
                      className="p-1 text-white/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* DAILY HABITS */}
          <div className="space-y-2">
            <h4 className="text-xxs font-mono uppercase tracking-widest text-indigo-400 font-bold">
              ✦ Daily Habits (+40 KP)
            </h4>
            {daily.length === 0 ? (
              <p className="text-[10px] text-white/30 italic font-mono pl-2">No daily routines.</p>
            ) : (
              daily.map((g) => (
                <div
                  key={g.id}
                  className="glass border border-indigo-500/10 rounded-xl p-3 flex items-center justify-between gap-3 group hover:border-[#7B2EFF]/20 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <button
                      id={`toggle-micro-${g.id}`}
                      onClick={() => toggleGoalComplete(g.id)}
                      className="text-white/40 hover:text-white transition-colors cursor-pointer"
                    >
                      {g.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-indigo-400 fill-indigo-500/10" />
                      ) : (
                        <Circle className="w-4 h-4 text-white/20" />
                      )}
                    </button>
                    <span className={`text-xs font-bold font-sans ${g.completed ? 'line-through text-white/30 font-medium' : 'text-white/90'}`}>
                      {g.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      id={`edit-micro-${g.id}`}
                      onClick={() => setEditingGoal(g)}
                      className="p-1 text-white/40 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`delete-micro-${g.id}`}
                      onClick={() => handleDeleteGoal(g.id)}
                      className="p-1 text-white/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* MICRO TASKS */}
          <div className="space-y-2">
            <h4 className="text-xxs font-mono uppercase tracking-widest text-white/40 font-bold">
              ✦ Micro Tasks (+30 KP)
            </h4>
            {micro.length === 0 ? (
              <p className="text-[10px] text-white/30 italic font-mono pl-2">No micro tasks compiled.</p>
            ) : (
              micro.map((g) => (
                <div
                  key={g.id}
                  className="glass border border-white/5 rounded-xl p-3 flex items-center justify-between gap-3 group hover:border-[#7B2EFF]/20 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <button
                      id={`toggle-micro-${g.id}`}
                      onClick={() => toggleGoalComplete(g.id)}
                      className="text-white/40 hover:text-white transition-colors cursor-pointer"
                    >
                      {g.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-white/60 fill-white/5" />
                      ) : (
                        <Circle className="w-4 h-4 text-white/10" />
                      )}
                    </button>
                    <span className={`text-xs font-bold font-sans ${g.completed ? 'line-through text-white/30 font-medium' : 'text-white/90'}`}>
                      {g.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      id={`edit-micro-${g.id}`}
                      onClick={() => setEditingGoal(g)}
                      className="p-1 text-white/40 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`delete-micro-${g.id}`}
                      onClick={() => handleDeleteGoal(g.id)}
                      className="p-1 text-white/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* QUICK ADD CUSTOM GOAL FORM */}
      <div className="glass border border-[#7B2EFF]/15 rounded-2xl p-4 shadow-xl space-y-3 mt-4 purple-glow">
        <span className="text-[10px] font-mono text-[#7B2EFF] uppercase tracking-widest block font-bold">Add Custom Micro Task</span>
        
        <div className="flex gap-2">
          <input
            id="custom-goal-input"
            type="text"
            placeholder="E.g. Code 2 utility hooks..."
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono font-bold placeholder-white/20 focus:border-[#7B2EFF]"
          />
          <select
            id="custom-goal-timeframe"
            value={customTimeframe}
            onChange={(e) => setCustomTimeframe(e.target.value as MicroGoal["timeframe"])}
            className="bg-black/50 border border-white/10 rounded-xl px-2.5 py-2 text-xxs font-mono text-white/80 font-bold uppercase outline-none w-24 focus:border-[#7B2EFF]"
          >
            <option className="bg-zinc-950" value="monthly">Monthly</option>
            <option className="bg-zinc-950" value="weekly">Weekly</option>
            <option className="bg-zinc-950" value="daily">Daily</option>
            <option className="bg-zinc-950" value="micro">Micro</option>
          </select>
        </div>
        
        <button
          id="add-custom-goal-btn"
          onClick={handleAddCustomGoal}
          className="w-full bg-[#7B2EFF] hover:brightness-110 py-2.5 rounded-xl text-xxs font-mono font-black transition-all text-white uppercase shadow-[0_5px_15px_rgba(123,46,255,0.4)] cursor-pointer"
        >
          Inject Custom Target
        </button>
      </div>

      {/* EDIT MODAL SHIELD */}
      <AnimatePresence>
        {editingGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-5"
          >
            <div className="glass border border-[#7B2EFF]/35 rounded-2xl p-5 w-full max-w-sm space-y-4 purple-glow relative overflow-hidden dot-grid">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#7B2EFF]/50"></div>
              <h3 className="text-sm font-black font-mono text-[#7B2EFF] purple-text-glow uppercase tracking-wider">Edit Target</h3>
              
              <div className="space-y-3 font-sans">
                <input
                  id="edit-goal-title"
                  type="text"
                  value={editingGoal.title}
                  onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 focus:border-[#7B2EFF] rounded-xl px-3 py-2.5 text-xs text-white outline-none font-mono font-bold"
                />

                <select
                  id="edit-goal-timeframe"
                  value={editingGoal.timeframe}
                  onChange={(e) => setEditingGoal({ ...editingGoal, timeframe: e.target.value as MicroGoal["timeframe"] })}
                  className="w-full bg-black/50 border border-white/10 focus:border-[#7B2EFF] rounded-xl px-3 py-2.5 text-xs text-white outline-none font-mono font-bold"
                >
                  <option className="bg-zinc-950" value="monthly">Monthly Milestone</option>
                  <option className="bg-zinc-950" value="weekly">Weekly Goal</option>
                  <option className="bg-zinc-950" value="daily">Daily Habit</option>
                  <option className="bg-zinc-950" value="micro">Micro Task</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  id="cancel-edit-goal"
                  onClick={() => setEditingGoal(null)}
                  className="flex-1 bg-black/40 hover:bg-white/5 py-2 rounded-xl text-xxs font-mono text-white/60 border border-white/10 font-bold uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="submit-edit-goal"
                  onClick={handleUpdateGoal}
                  className="flex-1 bg-[#7B2EFF] hover:brightness-110 py-2 rounded-xl text-xxs font-mono text-white font-black uppercase shadow-[0_5px_15px_rgba(123,46,255,0.4)]"
                >
                  Save changes
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
