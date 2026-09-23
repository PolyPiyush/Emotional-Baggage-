/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Task, UserStats, Mentor, MentorId } from "../types";
import { Plus, Search, ArrowUpDown, Trash2, Edit2, CheckCircle, ShieldAlert, Zap, X, Star, Calendar, Sparkles } from "lucide-react";

interface TaskManagerViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  userStats: UserStats;
  setUserStats: React.Dispatch<React.SetStateAction<UserStats>>;
  mentor: Mentor;
  onAddLog: (log: string) => void;
}

export default function TaskManagerView({
  tasks,
  setTasks,
  userStats,
  setUserStats,
  mentor,
  onAddLog
}: TaskManagerViewProps) {
  // Filters and Actions
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"date" | "priority">("priority");

  // Add Task Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"high" | "normal">("normal");
  const [category, setCategory] = useState<Task["category"]>("Study");
  const [dueDate, setDueDate] = useState("2026-07-02");

  // Edit Task State
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Penalty Simulation State
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [missedTasksList, setMissedTasksList] = useState<Task[]>([]);
  const [penaltyLog, setPenaltyLog] = useState("");

  const handleAddTask = () => {
    if (!title.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      priority,
      category,
      dueDate,
      completed: false,
      createdAt: new Date().toISOString()
    };
    setTasks((prev) => [newTask, ...prev]);
    setTitle("");
    setShowAddModal(false);
    onAddLog(`Created task: "${newTask.title}"`);
  };

  const handleUpdateTask = () => {
    if (!editingTask || !editingTask.title.trim()) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === editingTask.id ? editingTask : t))
    );
    setEditingTask(null);
    onAddLog(`Updated task: "${editingTask.title}"`);
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (taskToDelete) {
      onAddLog(`Deleted task: "${taskToDelete.title}"`);
    }
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextState = !t.completed;
          if (nextState) {
            // Earn rewards
            const baseGains = t.priority === "high" ? 100 : 50;
            const gainedKp = Math.round(baseGains * userStats.multiplier);
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

  // Simulate missing High Priority task deadlines (Apply mentor penalties!)
  const triggerPenaltySimulation = () => {
    const unfinishedHigh = tasks.filter((t) => !t.completed && t.priority === "high");
    setMissedTasksList(unfinishedHigh);
    setShowPenaltyModal(true);

    if (unfinishedHigh.length === 0) {
      setPenaltyLog(`"Excellent work, warrior! No unfinished high-priority tasks found. Your discipline is impeccable. Keep climbing!"`);
      return;
    }

    // Evaluate penalty based on mentor
    let logMsg = "";
    let lostKp = 0;
    let lostMult = 0;

    if (mentor.id === MentorId.COOL_BROTHER) {
      logMsg = `"Hey bro, I see you missed some key targets (${unfinishedHigh.length} tasks). Don't beat yourself up over it! Let's hit the dojo hard tomorrow and make it right. No penalties this time, bro!"`;
    } else if (mentor.id === MentorId.SAVAGE_SISTER) {
      lostMult = 0.1 * unfinishedHigh.length;
      logMsg = `"Hahaha! Wow, someone's lazy streak is acting up. You missed ${unfinishedHigh.length} High-Priority tasks. Did you forget we have things to achieve? Multiplier penalized: -${lostMult.toFixed(2)}x!"`;
    } else if (mentor.id === MentorId.STRICT_FATHER) {
      lostKp = 10 * unfinishedHigh.length;
      lostMult = 0.1 * unfinishedHigh.length;
      logMsg = `"Incompetence will not be tolerated. You missed ${unfinishedHigh.length} High-Priority milestones. Excuses are useless. Gained penalty: -${lostKp} KP and -${lostMult.toFixed(2)}x Multiplier reduction."`;
    } else if (mentor.id === MentorId.ENFORCER_MOM) {
      lostKp = 20 * unfinishedHigh.length;
      lostMult = userStats.multiplier - 1.0; // Reset to 1.0
      logMsg = `"YOU MISSED ${unfinishedHigh.length} CRITICAL HIGH-PRIORITY TASKS?! MY DISAPPOINTMENT IS IMMEASURABLE! Penalty: -${lostKp} KP, and your focus multiplier is completely RESET to 1.0x!"`;
    }

    setPenaltyLog(logMsg);

    // Apply the structural penalties to user stats
    setUserStats((prev) => ({
      ...prev,
      kp: Math.max(0, prev.kp - lostKp),
      multiplier: Math.max(1.0, Number((prev.multiplier - lostMult).toFixed(2)))
    }));

    onAddLog(`End-Of-Day scan: Missed ${unfinishedHigh.length} High Priorities. Penalized by ${mentor.name.split(" ")[0]}.`);
  };

  // Filter & Sort tasks
  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "All" || task.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "priority") {
        if (a.priority === b.priority) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return a.priority === "high" ? -1 : 1;
      } else {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
    });

  const highPriorityTasks = filteredTasks.filter((t) => !t.completed && t.priority === "high");
  const normalPriorityTasks = filteredTasks.filter((t) => !t.completed && t.priority === "normal");
  const completedTasks = filteredTasks.filter((t) => t.completed);

  return (
    <div id="task-manager-container" className="flex flex-col h-full overflow-y-auto px-5 py-5 text-white space-y-4 pb-24 relative dot-grid">
      <div className="absolute top-20 right-5 w-24 h-24 bg-[#7B2EFF]/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Top action bar */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xxs font-mono text-[#7B2EFF] uppercase tracking-widest block font-bold">Active Dojo Board</span>
          <h2 className="text-lg font-black tracking-tight text-white purple-text-glow">Sprint Manager</h2>
        </div>
        <button
          id="task-manager-add-btn"
          onClick={() => setShowAddModal(true)}
          className="bg-[#7B2EFF] hover:brightness-110 border border-white/10 rounded-xl px-3 py-2 font-mono text-xs font-black flex items-center gap-1 shadow-[0_5px_15px_rgba(123,46,255,0.4)] transition-all uppercase"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
          <input
            id="task-search"
            type="text"
            placeholder="Search active sprints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-[#7B2EFF]/20 focus:border-[#7B2EFF] rounded-xl py-2 pl-10 pr-4 text-xs text-white outline-none font-mono font-bold placeholder-white/30"
          />
        </div>

        <div className="flex gap-2">
          {/* Category Filter */}
          <select
            id="task-category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl py-1.5 px-3 text-xxs font-mono text-white/80 font-bold uppercase outline-none flex-1 transition-colors hover:bg-white/5"
          >
            <option className="bg-zinc-950" value="All">All Categories</option>
            {["Study", "Coding", "Fitness", "Design", "Life"].map((cat) => (
              <option className="bg-zinc-950" key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Sort selection */}
          <button
            id="task-sort-toggle"
            onClick={() => setSortBy(sortBy === "priority" ? "date" : "priority")}
            className="bg-black/40 border border-white/10 rounded-xl py-1.5 px-3 text-xxs font-mono text-white/80 font-bold flex items-center justify-center gap-1 hover:bg-white/5 transition-colors flex-1 uppercase"
          >
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort: {sortBy === "priority" ? "Priority" : "Due Date"}
          </button>
        </div>
      </div>

      {/* DISCIPLINARY SIMULATION SHORTCUT */}
      <div className="glass border border-[#7B2EFF]/20 rounded-xl p-3 flex items-center justify-between purple-glow">
        <div className="space-y-0.5">
          <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest block font-bold">Dōjō Test Centre</span>
          <p className="text-[10px] text-white/40 font-sans font-semibold">Simulate the day's end to enforce pending penalties.</p>
        </div>
        <button
          id="simulate-day-end"
          onClick={triggerPenaltySimulation}
          className="bg-[#7B2EFF]/10 hover:bg-[#7B2EFF]/25 border border-[#7B2EFF]/30 text-[#7B2EFF] text-[10px] font-mono font-bold py-1.5 px-2.5 rounded-lg transition-colors flex items-center gap-1 shrink-0 uppercase"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-[#7B2EFF]" /> Simulate Day End
        </button>
      </div>

      {/* TASK LIST SECTIONS */}
      <div className="space-y-4 flex-1">
        {/* High Priority Tasks */}
        <div className="space-y-2">
          <h3 className="text-xxs font-mono uppercase tracking-widest text-red-400 flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> High Priority Sprints ({highPriorityTasks.length})
          </h3>
          <div className="space-y-2">
            {highPriorityTasks.length === 0 ? (
              <p className="text-xxs text-white/30 font-mono italic pl-2">No active high priority tasks.</p>
            ) : (
              highPriorityTasks.map((task) => (
                <div
                  key={task.id}
                  className="glass border border-red-500/20 rounded-xl p-3 flex items-center justify-between gap-3 group hover:border-[#7B2EFF]/30 transition-all shadow-sm"
                >
                  <div className="flex items-start gap-2.5">
                    <button
                      id={`complete-task-high-${task.id}`}
                      onClick={() => toggleTaskComplete(task.id)}
                      className="mt-0.5 w-4 h-4 rounded border border-[#7B2EFF]/40 flex items-center justify-center hover:bg-[#7B2EFF]/10 transition-colors shrink-0 cursor-pointer"
                    >
                      {task.completed && <span className="w-2.5 h-2.5 bg-[#7B2EFF] rounded-sm"></span>}
                    </button>
                    <div>
                      <h4 className="text-xs font-bold text-white/90 group-hover:text-white transition-colors leading-tight font-sans">
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9.5px] font-mono text-[#7B2EFF] bg-[#7B2EFF]/10 px-1.5 py-0.5 rounded border border-[#7B2EFF]/10 font-bold uppercase">
                          {task.category}
                        </span>
                        <span className="text-[9.5px] font-mono text-white/40 flex items-center gap-0.5 font-semibold uppercase">
                          <Calendar className="w-3 h-3 text-white/30" /> {task.dueDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      id={`edit-task-high-${task.id}`}
                      onClick={() => setEditingTask(task)}
                      className="p-1 text-white/40 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`delete-task-high-${task.id}`}
                      onClick={() => handleDeleteTask(task.id)}
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

        {/* Normal Priority Tasks */}
        <div className="space-y-2">
          <h3 className="text-xxs font-mono uppercase tracking-widest text-white/40 flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 bg-white/20 rounded-full"></span> Normal Sprints ({normalPriorityTasks.length})
          </h3>
          <div className="space-y-2">
            {normalPriorityTasks.length === 0 ? (
              <p className="text-xxs text-white/30 font-mono italic pl-2">No active normal priority tasks.</p>
            ) : (
              normalPriorityTasks.map((task) => (
                <div
                  key={task.id}
                  className="glass border border-white/5 rounded-xl p-3 flex items-center justify-between gap-3 group hover:border-[#7B2EFF]/20 transition-all shadow-sm"
                >
                  <div className="flex items-start gap-2.5">
                    <button
                      id={`complete-task-normal-${task.id}`}
                      onClick={() => toggleTaskComplete(task.id)}
                      className="mt-0.5 w-4 h-4 rounded border border-[#7B2EFF]/40 flex items-center justify-center hover:bg-[#7B2EFF]/10 transition-colors shrink-0 cursor-pointer"
                    >
                      {task.completed && <span className="w-2.5 h-2.5 bg-[#7B2EFF] rounded-sm"></span>}
                    </button>
                    <div>
                      <h4 className="text-xs font-bold text-white/90 group-hover:text-white transition-colors leading-tight font-sans">
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9.5px] font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-bold uppercase">
                          {task.category}
                        </span>
                        <span className="text-[9.5px] font-mono text-white/40 flex items-center gap-0.5 font-semibold uppercase">
                          <Calendar className="w-3 h-3 text-white/30" /> {task.dueDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      id={`edit-task-normal-${task.id}`}
                      onClick={() => setEditingTask(task)}
                      className="p-1 text-white/40 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`delete-task-normal-${task.id}`}
                      onClick={() => handleDeleteTask(task.id)}
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

        {/* Completed Tasks */}
        <div className="space-y-2">
          <h3 className="text-xxs font-mono uppercase tracking-widest text-[#7B2EFF] flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 bg-[#7B2EFF] rounded-full"></span> Completed Dojo Targets ({completedTasks.length})
          </h3>
          <div className="space-y-2">
            {completedTasks.length === 0 ? (
              <p className="text-xxs text-white/30 font-mono italic pl-2">No completed tasks yet.</p>
            ) : (
              completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-black/20 border border-white/5 rounded-xl p-3 flex items-center justify-between gap-3 opacity-60"
                >
                  <div className="flex items-start gap-2.5">
                    <button
                      id={`incomplete-task-completed-${task.id}`}
                      onClick={() => toggleTaskComplete(task.id)}
                      className="mt-0.5 w-4 h-4 rounded border-[#7B2EFF]/40 bg-[#7B2EFF]/10 flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-[#7B2EFF] fill-current" />
                    </button>
                    <div>
                      <h4 className="text-xs font-bold text-white/50 line-through leading-tight font-sans">
                        {task.title}
                      </h4>
                      <span className="text-[9.5px] font-mono text-white/30 bg-white/5 px-1.5 py-0.5 rounded mt-1.5 inline-block font-bold uppercase">
                        {task.category}
                      </span>
                    </div>
                  </div>

                  <button
                    id={`delete-task-completed-${task.id}`}
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 text-white/30 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE ADD MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-5"
          >
            <div className="glass border border-[#7B2EFF]/35 rounded-2xl p-5 w-full max-w-sm space-y-4 purple-glow relative overflow-hidden dot-grid">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#7B2EFF]/50"></div>
              <h3 className="text-sm font-black font-mono text-[#7B2EFF] purple-text-glow uppercase tracking-wider">Create New Task</h3>
              
              <div className="space-y-3 font-sans">
                <div>
                  <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-bold">Task Title</label>
                  <input
                    id="add-modal-title"
                    type="text"
                    placeholder="E.g. Study algorithms & do exercises..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 focus:border-[#7B2EFF] rounded-xl px-3 py-2 text-xs text-white outline-none font-mono font-bold placeholder-white/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-bold">Priority</label>
                    <select
                      id="add-modal-priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as "high" | "normal")}
                      className="w-full bg-black/50 border border-white/10 focus:border-[#7B2EFF] rounded-xl px-2 py-2 text-xs text-white outline-none font-mono font-bold"
                    >
                      <option className="bg-zinc-950" value="normal">Normal</option>
                      <option className="bg-zinc-950" value="high">High Priority</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-bold">Category</label>
                    <select
                      id="add-modal-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Task["category"])}
                      className="w-full bg-black/50 border border-white/10 focus:border-[#7B2EFF] rounded-xl px-2 py-2 text-xs text-white outline-none font-mono font-bold"
                    >
                      {["Study", "Coding", "Fitness", "Design", "Life"].map((cat) => (
                        <option className="bg-zinc-950" key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-bold">Target Deadline</label>
                  <input
                    id="add-modal-duedate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 focus:border-[#7B2EFF] rounded-xl px-3 py-2 text-xs text-white outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  id="add-modal-cancel"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-black/40 hover:bg-white/5 py-2 rounded-xl text-xxs font-mono text-white/60 border border-white/10 font-bold uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="add-modal-submit"
                  onClick={handleAddTask}
                  className="flex-1 bg-[#7B2EFF] hover:brightness-110 py-2 rounded-xl text-xxs font-mono text-white font-black uppercase shadow-[0_5px_15px_rgba(123,46,255,0.4)]"
                >
                  Lock Sprint
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMPREHENSIVE EDIT MODAL */}
      <AnimatePresence>
        {editingTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-5"
          >
            <div className="glass border border-[#7B2EFF]/35 rounded-2xl p-5 w-full max-w-sm space-y-4 purple-glow relative overflow-hidden dot-grid">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#7B2EFF]/50"></div>
              <h3 className="text-sm font-black font-mono text-[#7B2EFF] purple-text-glow uppercase tracking-wider">Edit Dojo Task</h3>
              
              <div className="space-y-3 font-sans">
                <div>
                  <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-bold">Task Title</label>
                  <input
                    id="edit-modal-title"
                    type="text"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 focus:border-[#7B2EFF] rounded-xl px-3 py-2 text-xs text-white outline-none font-mono font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-bold">Priority</label>
                    <select
                      id="edit-modal-priority"
                      value={editingTask.priority}
                      onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as "high" | "normal" })}
                      className="w-full bg-black/50 border border-white/10 focus:border-[#7B2EFF] rounded-xl px-2 py-2 text-xs text-white outline-none font-mono font-bold"
                    >
                      <option className="bg-zinc-950" value="normal">Normal</option>
                      <option className="bg-zinc-950" value="high">High Priority</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-bold">Category</label>
                    <select
                      id="edit-modal-category"
                      value={editingTask.category}
                      onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value as Task["category"] })}
                      className="w-full bg-black/50 border border-white/10 focus:border-[#7B2EFF] rounded-xl px-2 py-2 text-xs text-white outline-none font-mono font-bold"
                    >
                      {["Study", "Coding", "Fitness", "Design", "Life"].map((cat) => (
                        <option className="bg-zinc-950" key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-bold">Target Deadline</label>
                  <input
                    id="edit-modal-duedate"
                    type="date"
                    value={editingTask.dueDate}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 focus:border-[#7B2EFF] rounded-xl px-3 py-2 text-xs text-white outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  id="edit-modal-cancel"
                  onClick={() => setEditingTask(null)}
                  className="flex-1 bg-black/40 hover:bg-white/5 py-2 rounded-xl text-xxs font-mono text-white/60 border border-white/10 font-bold uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="edit-modal-submit"
                  onClick={handleUpdateTask}
                  className="flex-1 bg-[#7B2EFF] hover:brightness-110 py-2 rounded-xl text-xxs font-mono text-white font-black uppercase shadow-[0_5px_15px_rgba(123,46,255,0.4)]"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DISCIPLINARY PENALTY REPORT MODAL */}
      <AnimatePresence>
        {showPenaltyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 glass backdrop-blur-xl z-50 flex flex-col justify-between p-6 dot-grid"
          >
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <span className="text-[10px] font-mono text-[#7B2EFF] uppercase tracking-widest font-black">Dojo Discipline Inspector</span>
              <button
                id="close-penalty-modal"
                onClick={() => setShowPenaltyModal(false)}
                className="w-7 h-7 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="my-auto text-center space-y-6 max-w-sm mx-auto">
              <div className="relative inline-block">
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-[#7B2EFF]/35 mx-auto filter brightness-90 shadow-lg"
                />
                <div className="absolute -bottom-2 -right-2 bg-red-600 rounded-full p-1 border-2 border-black">
                  <ShieldAlert className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-black text-white uppercase font-mono tracking-wider purple-text-glow">
                  {mentor.name.split(" ")[0]}'s Assessment
                </h4>

                {/* Show missed task stats */}
                <div className="bg-black/40 border border-[#7B2EFF]/15 p-3 rounded-xl flex items-center justify-between text-left text-xxs font-mono">
                  <span className="text-white/40 font-bold uppercase">Uncompleted High Priorities:</span>
                  <span className={`font-black ${missedTasksList.length > 0 ? "text-red-400 animate-pulse text-xs" : "text-emerald-400"}`}>
                    {missedTasksList.length} Tasks
                  </span>
                </div>

                {/* Inspector Dialog Bubble */}
                <p className="bg-black/60 border border-[#7B2EFF]/25 p-4 rounded-2xl text-xs text-white/90 font-mono text-left italic shadow-lg">
                  {penaltyLog}
                </p>
              </div>

              {/* Stat updates representation */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-black/60 border border-white/10 rounded-xl font-mono text-left text-xxs purple-glow">
                <div>
                  <span className="text-white/40 uppercase tracking-widest block mb-0.5 font-bold">Kinetics</span>
                  <span className="text-[#7B2EFF] font-black flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-[#7B2EFF]" /> {userStats.kp} KP
                  </span>
                </div>
                <div>
                  <span className="text-white/40 uppercase tracking-widest block mb-0.5 font-bold">Multiplier</span>
                  <span className="text-[#7B2EFF] font-black flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-[#7B2EFF]" /> {userStats.multiplier.toFixed(2)}x
                  </span>
                </div>
              </div>
            </div>

            <button
              id="confirm-penalty-modal-btn"
              onClick={() => setShowPenaltyModal(false)}
              className="w-full bg-[#7B2EFF] hover:brightness-110 py-3 rounded-xl text-xs font-mono font-black text-white tracking-widest shadow-[0_5px_15px_rgba(123,46,255,0.4)] uppercase"
            >
              ACCEPT ASSIGNMENT & RETURN
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
