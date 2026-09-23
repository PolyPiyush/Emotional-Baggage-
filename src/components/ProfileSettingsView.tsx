/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserStats, Mentor } from "../types";
import { User, Shield, Sliders, Bell, Award, CheckCircle, Zap, Star, Flame, Eye, Lock, Moon, Sun } from "lucide-react";

interface ProfileSettingsViewProps {
  userStats: UserStats;
  mentor: Mentor;
  isLightMode: boolean;
  setIsLightMode: React.Dispatch<React.SetStateAction<boolean>>;
  blockedApps: string[];
  setBlockedApps: React.Dispatch<React.SetStateAction<string[]>>;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export default function ProfileSettingsView({
  userStats,
  mentor,
  isLightMode,
  setIsLightMode,
  blockedApps,
  setBlockedApps
}: ProfileSettingsViewProps) {
  // Notification States
  const [notifyMorning, setNotifyMorning] = useState(true);
  const [notifyBreak, setNotifyBreak] = useState(true);
  const [notifyMentor, setNotifyMentor] = useState(true);

  // List of achievements/badges
  const BADGES: Badge[] = [
    { id: "b1", name: "7 Day Streak", description: "Conquer focus sessions for 7 consecutive days.", icon: "🔥", unlocked: userStats.dailyStreak >= 7 },
    { id: "b2", name: "100 Hours Focused", description: "Log 6000 total minutes inside focus mode.", icon: "⏱️", unlocked: userStats.totalFocusedMinutes >= 6000 },
    { id: "b3", name: "First Goal Complete", description: "Successfully compile and complete your first 12-week goal.", icon: "🏆", unlocked: userStats.tasksCompleted >= 15 },
    { id: "b4", name: "No Distractions Week", description: "Pass 7 days without triggering any app blocker warnings.", icon: "🛡️", unlocked: userStats.distractionsBlocked === 0 },
    { id: "b5", name: "Multiplier Maxed", description: "Elevate your multiplier factor to the maximum possible.", icon: "🚀", unlocked: userStats.multiplier >= mentor.maxMultiplier },
    { id: "b6", name: "Legend Rank", description: "Achieve Level 10 inside the dōjō index.", icon: "👑", unlocked: userStats.level >= 10 }
  ];

  const toggleBlockedApp = (app: string) => {
    if (blockedApps.includes(app)) {
      setBlockedApps((prev) => prev.filter((a) => a !== app));
    } else {
      setBlockedApps((prev) => [...prev, app]);
    }
  };

  const DISTRACTION_APPS = ["Instagram", "TikTok", "Facebook", "Snapchat", "YouTube", "X (Twitter)", "Reddit"];

  return (
    <div id="profile-settings-container" className="flex flex-col h-full overflow-y-auto px-5 py-5 text-white space-y-5 pb-24 relative dot-grid">
      <div className="absolute top-1/4 right-5 w-24 h-24 bg-[#7B2EFF]/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Profile Header Card */}
      <div className="glass border border-white/5 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden shadow-xl purple-glow">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#7B2EFF] to-transparent"></div>
        
        {/* User Avatar Circle */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-black/50 border-2 border-[#7B2EFF]/50 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(123,46,255,0.3)]">
            <User className="w-8 h-8 text-[#7B2EFF]" />
          </div>
          <span className="absolute bottom-0 right-0 bg-[#7B2EFF] text-white rounded-full p-1 border-2 border-black">
            <Award className="w-3 h-3" />
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-md font-black text-white purple-text-glow uppercase tracking-tight">Legend Warrior</h3>
          <p className="text-xxs font-mono text-[#7B2EFF] uppercase tracking-widest flex items-center gap-1 font-bold">
            <Shield className="w-3.5 h-3.5 text-[#7B2EFF]" /> Active partner: {mentor.name.split(" ")[0]} (Lvl {mentor.level || 1})
          </p>
          <div className="text-[10px] font-mono text-purple-300 font-bold uppercase tracking-wide">
             {mentor.levelTitle || "Sensei"}
          </div>

          <div className="flex gap-3 text-xxs font-mono text-white/50 pt-1 font-bold">
            <span>{userStats.kp} <span className="text-[#7B2EFF]">KP</span></span>
            <span>{userStats.multiplier.toFixed(2)}x <span className="text-[#7B2EFF]">Mult</span></span>
            <span>Lvl {userStats.level}</span>
          </div>
        </div>
      </div>

      {/* DOJO THEME CHANGER (Dark vs Light) */}
      <div className="glass border border-white/5 rounded-2xl p-4 shadow-xl space-y-3">
        <span className="text-xxs font-mono text-white/40 uppercase tracking-widest block font-bold">Dojo Aesthetics</span>
        <div className="flex justify-between items-center bg-black/40 border border-white/10 rounded-xl p-3">
          <span className="text-xs font-bold flex items-center gap-1.5 uppercase text-white">
            {isLightMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-[#7B2EFF]" />}
            Active Visual Mode
          </span>
          <button
            id="toggle-light-mode"
            onClick={() => setIsLightMode(!isLightMode)}
            className="bg-[#7B2EFF] hover:brightness-110 text-white py-1.5 px-3 rounded-lg text-xxs font-mono font-black uppercase tracking-wider transition-colors cursor-pointer shadow-[0_3px_10px_rgba(123,46,255,0.3)]"
          >
            Switch to {isLightMode ? "Dark Mode" : "Light Mode"}
          </button>
        </div>
      </div>

      {/* GAMIFIED BADGES & ACHIEVEMENTS */}
      <div className="glass border border-white/5 rounded-2xl p-4 shadow-xl space-y-3">
        <span className="text-xxs font-mono text-white/40 uppercase tracking-widest flex items-center gap-1 font-bold">
          <Award className="w-3.5 h-3.5 text-[#7B2EFF]" /> Dojo Achievements
        </span>

        <div className="grid grid-cols-2 gap-2.5">
          {BADGES.map((badge) => (
            <div
              key={badge.id}
              className={`p-3 rounded-xl border transition-all ${
                badge.unlocked
                  ? "bg-[#7B2EFF]/10 border-[#7B2EFF]/40 text-white shadow-[0_0_12px_rgba(123,46,255,0.15)]"
                  : "bg-black/40 border-white/5 opacity-50 text-white/40"
              } space-y-1.5 relative overflow-hidden`}
            >
              <div className="flex justify-between items-center">
                <span className="text-lg">{badge.icon}</span>
                {badge.unlocked ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-white/20" />
                )}
              </div>
              <h4 className="text-xxs font-black uppercase tracking-wider text-white">{badge.name}</h4>
              <p className="text-[9px] leading-snug font-medium text-white/60 font-sans">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* DEVICE APP LOCKER CONFIGURATION */}
      <div className="glass border border-white/5 rounded-2xl p-4 shadow-xl space-y-3">
        <span className="text-xxs font-mono text-white/40 uppercase tracking-widest flex items-center gap-1 font-bold">
          <Sliders className="w-3.5 h-3.5 text-[#7B2EFF]" /> App Blocker Targets ({blockedApps.length})
        </span>
        <p className="text-[10px] text-white/50 leading-relaxed font-mono font-bold">
          Toggle the target apps to automatically terminate inside Focus Mode based on your mentor's warning strictness.
        </p>

        <div className="flex flex-wrap gap-1.5 pt-1.5">
          {DISTRACTION_APPS.map((app) => {
            const isBlocked = blockedApps.includes(app);
            return (
              <button
                key={app}
                id={`toggle-blocked-app-${app.replace(/\s+/g, "-")}`}
                onClick={() => toggleBlockedApp(app)}
                className={`px-3 py-1.5 rounded-xl text-xxs font-mono border transition-all cursor-pointer font-bold ${
                  isBlocked
                    ? "bg-red-500/15 border-red-500/35 text-red-400"
                    : "bg-black/40 border-white/5 text-white/40 hover:text-white"
                }`}
              >
                {isBlocked ? "Blocked" : "Block"} {app}
              </button>
            );
          })}
        </div>
      </div>

      {/* NOTIFICATIONS SETTINGS */}
      <div className="glass border border-white/5 rounded-2xl p-4 shadow-xl space-y-3">
        <span className="text-xxs font-mono text-white/40 uppercase tracking-widest flex items-center gap-1 font-bold">
          <Bell className="w-3.5 h-3.5 text-[#7B2EFF]" /> Notification Dojo Reminders
        </span>

        <div className="space-y-3 font-mono text-xxs font-bold uppercase text-white/80">
          <div className="flex justify-between items-center py-1">
            <span>Morning Motivation reminders</span>
            <input
              id="notify-morning"
              type="checkbox"
              checked={notifyMorning}
              onChange={(e) => setNotifyMorning(e.target.checked)}
              className="accent-[#7B2EFF] w-4 h-4 cursor-pointer"
            />
          </div>
          <div className="flex justify-between items-center py-1 border-t border-white/5">
            <span>Focus & Break timer alerts</span>
            <input
              id="notify-break"
              type="checkbox"
              checked={notifyBreak}
              onChange={(e) => setNotifyBreak(e.target.checked)}
              className="accent-[#7B2EFF] w-4 h-4 cursor-pointer"
            />
          </div>
          <div className="flex justify-between items-center py-1 border-t border-white/5">
            <span>Mentor messages & check-ins</span>
            <input
              id="notify-mentor"
              type="checkbox"
              checked={notifyMentor}
              onChange={(e) => setNotifyMentor(e.target.checked)}
              className="accent-[#7B2EFF] w-4 h-4 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
