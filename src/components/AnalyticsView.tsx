/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { UserStats, Mentor } from "../types";
import { Sparkles, BarChart2, ShieldAlert, Award, Clock, Flame, Zap, CheckSquare } from "lucide-react";

interface AnalyticsViewProps {
  userStats: UserStats;
  mentor: Mentor;
}

// Sample static analytics records
const DAILY_FOCUS_DATA = [
  { day: "Mon", focus: 4.5, distraction: 0.5 },
  { day: "Tue", focus: 6.0, distraction: 1.2 },
  { day: "Wed", focus: 5.5, distraction: 0.2 },
  { day: "Thu", focus: 7.2, distraction: 0.0 },
  { day: "Fri", focus: 4.0, distraction: 1.5 },
  { day: "Sat", focus: 8.0, distraction: 0.8 },
  { day: "Sun", focus: 6.5, distraction: 0.3 }
];

const MULTIPLIER_DATA = [
  { week: "W1", mult: 1.0 },
  { week: "W2", mult: 1.2 },
  { week: "W3", mult: 1.5 },
  { week: "W4", mult: 1.8 },
  { week: "W5", mult: 2.1 },
  { week: "W6", mult: 2.5 }
];

export default function AnalyticsView({ userStats, mentor }: AnalyticsViewProps) {
  return (
    <div id="analytics-view-container" className="flex flex-col h-full overflow-y-auto px-5 py-5 text-white space-y-5 pb-24 relative dot-grid">
      <div className="absolute top-1/3 left-5 w-24 h-24 bg-[#7B2EFF]/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header */}
      <div>
        <span className="text-xxs font-mono text-[#7B2EFF] uppercase tracking-widest block font-bold">Dojo Records</span>
        <h2 className="text-lg font-black tracking-tight text-white purple-text-glow">Performance Analytics</h2>
      </div>

      {/* PRIMARY GRID HIGHLIGHTS */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass border border-white/5 rounded-2xl p-3 flex items-center gap-3">
          <Clock className="w-8 h-8 text-[#7B2EFF] shrink-0" />
          <div>
            <span className="text-[9.5px] font-mono text-white/40 uppercase tracking-widest block font-bold">Focused Minutes</span>
            <span className="text-md font-black font-mono text-white leading-none mt-1 block">{userStats.totalFocusedMinutes} Min</span>
          </div>
        </div>

        <div className="glass border border-white/5 rounded-2xl p-3 flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-red-400 shrink-0" />
          <div>
            <span className="text-[9.5px] font-mono text-white/40 uppercase tracking-widest block font-bold">Blocks Defended</span>
            <span className="text-md font-black font-mono text-white leading-none mt-1 block">{userStats.distractionsBlocked} Triggers</span>
          </div>
        </div>
      </div>

      {/* RECHARTS focus vs distraction bar chart */}
      <div className="glass border border-white/5 rounded-2xl p-4 shadow-xl space-y-3 purple-glow">
        <span className="text-xxs font-mono text-white/70 uppercase tracking-widest flex items-center gap-1 font-bold">
          <BarChart2 className="w-3.5 h-3.5 text-[#7B2EFF]" /> Focus vs Distraction (Hrs)
        </span>
        
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DAILY_FOCUS_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={9} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#000", borderColor: "#7B2EFF", borderRadius: "12px", fontSize: 10, color: "#fff", fontWeight: "bold" }}
              />
              <Bar dataKey="focus" fill="#7B2EFF" radius={[3, 3, 0, 0]} name="Focus Hours" />
              <Bar dataKey="distraction" fill="#EF4444" radius={[3, 3, 0, 0]} name="Distractions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LINE CHART: Multiplier growth curves */}
      <div className="glass border border-white/5 rounded-2xl p-4 shadow-xl space-y-3 purple-glow">
        <span className="text-xxs font-mono text-white/70 uppercase tracking-widest flex items-center gap-1 font-bold">
          <Sparkles className="w-3.5 h-3.5 text-[#7B2EFF]" /> Multiplier Growth History
        </span>

        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MULTIPLIER_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" stroke="rgba(255,255,255,0.4)" fontSize={9} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#000", borderColor: "#7B2EFF", borderRadius: "12px", fontSize: 10, color: "#fff", fontWeight: "bold" }}
              />
              <Line type="monotone" dataKey="mult" stroke="#7B2EFF" strokeWidth={2.5} name="Multiplier Factor" dot={{ r: 3, fill: "#7B2EFF" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RADIAL SPRINT SUMMARY */}
      <div className="glass border border-white/5 rounded-2xl p-4 shadow-xl space-y-4">
        <span className="text-xxs font-mono text-white/70 uppercase tracking-widest block font-bold">12-Week Year Milestones</span>
        
        <div className="space-y-3 font-mono text-xxs">
          <div className="flex justify-between items-center">
            <span className="text-white/40 flex items-center gap-1 font-bold uppercase">
              <CheckSquare className="w-3.5 h-3.5 text-[#7B2EFF]" /> Completed Sprints
            </span>
            <span className="text-white font-black">{userStats.tasksCompleted} Milestones</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/40 flex items-center gap-1 font-bold uppercase">
              <Clock className="w-3.5 h-3.5 text-[#7B2EFF]" /> Pomodoro Completed
            </span>
            <span className="text-white font-black">{userStats.pomodoroSessions} Sessions</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/40 flex items-center gap-1 font-bold uppercase">
              <Award className="w-3.5 h-3.5 text-emerald-400" /> Kinetic Level achieved
            </span>
            <span className="text-emerald-400 font-black bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
              Lvl {userStats.level}
            </span>
          </div>
        </div>
      </div>

      {/* APPS BLOCKER TRIGGERS STATISTICS */}
      <div className="glass border border-white/5 rounded-2xl p-4 shadow-xl space-y-3">
        <span className="text-xxs font-mono text-white/70 uppercase tracking-widest block font-bold">App Blocker Defense logs</span>

        <div className="space-y-2">
          {[
            { app: "Instagram", defends: 4, severity: "High" },
            { app: "TikTok", defends: 7, severity: "Critical" },
            { app: "YouTube", defends: 2, severity: "Low" },
            { app: "Reddit", defends: 1, severity: "Low" }
          ].map((item) => (
            <div key={item.app} className="flex justify-between items-center p-2.5 bg-black/40 rounded-xl border border-white/5 transition-colors hover:bg-white/5">
              <span className="text-xs font-bold text-white/90">{item.app}</span>
              <div className="flex items-center gap-2 font-mono text-xxs">
                <span className="text-white/40 font-bold uppercase">{item.defends} Blocks</span>
                <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${
                  item.severity === "Critical"
                    ? "bg-red-950/20 border-red-500/20 text-red-400"
                    : item.severity === "High"
                    ? "bg-amber-950/20 border-amber-500/20 text-amber-400"
                    : "bg-[#7B2EFF]/15 border-[#7B2EFF]/20 text-[#7B2EFF]"
                }`}>
                  {item.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CONTRIBUTION HEATMAP STYLE REPRESENTATION */}
      <div className="glass border border-white/5 rounded-2xl p-4 shadow-xl space-y-3">
        <span className="text-xxs font-mono text-white/70 uppercase tracking-widest block font-bold">Productivity Contribution Heatmap</span>
        
        {/* Mocking contribution grid */}
        <div className="grid grid-cols-7 gap-1 bg-black/40 p-2 rounded-xl border border-white/5">
          {[...Array(35)].map((_, idx) => {
            // Randomise intensities
            const level = idx % 5 === 0 ? "bg-[#7B2EFF]/80" : idx % 3 === 0 ? "bg-[#7B2EFF]/50" : idx % 7 === 0 ? "bg-[#7B2EFF]/30" : "bg-white/5";
            return (
              <div
                key={idx}
                className={`aspect-square rounded-sm ${level} border border-black/10 transition-colors hover:scale-110 cursor-pointer`}
              ></div>
            );
          })}
        </div>
        <div className="flex justify-end gap-1.5 items-center text-[8.5px] font-mono text-white/40 font-bold uppercase">
          <span>Less active</span>
          <span className="w-2 h-2 bg-white/5 rounded-sm"></span>
          <span className="w-2 h-2 bg-[#7B2EFF]/30 rounded-sm"></span>
          <span className="w-2 h-2 bg-[#7B2EFF]/50 rounded-sm"></span>
          <span className="w-2 h-2 bg-[#7B2EFF]/80 rounded-sm"></span>
          <span>More active</span>
        </div>
      </div>
    </div>
  );
}
