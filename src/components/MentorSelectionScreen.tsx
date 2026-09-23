/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MentorId, Mentor } from "../types";
import { Shield, Sparkles, AlertTriangle, ArrowRight, X, Heart, Award, Flame, Star } from "lucide-react";
import { enhanceMentorWithLevel } from "../utils";

// Direct string paths for the generated image assets to bypass TypeScript JPG asset resolution limits
const hiroImg = "https://i.ibb.co/Ngzq0Lp5/bro-1-1.png";
const sayuriImg = "https://i.ibb.co/ch8Fr5w5/sis-1.png";
const kenjiImg = "https://i.ibb.co/bj73hpf7/papa-1.png";
const ryokoImg = "https://i.ibb.co/C3Rc7kQh/mom-1.png";
const stevenImg = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80";

interface MentorSelectionScreenProps {
  onSelect: (mentorId: MentorId) => void;
  currentSelectedId?: MentorId;
  isSettingsMode?: boolean;
  mentorProgress?: Record<MentorId, { level: number; exp: number }>;
}

export const MENTORS_DATA: Mentor[] = [
  {
    id: MentorId.COOL_BROTHER,
    name: "The Cool Brother",
    avatar: hiroImg,
    difficulty: "Easy",
    personality: "Supportive, Relaxed, Motivational",
    rules: [
      "Allows up to 3 distraction reminders",
      "Sends warnings before closing active apps",
      "No direct app-blocking force penalties"
    ],
    rewards: [
      "+50 Kinetics Points (KP) per task",
      "+0.1 Multiplier growth per focus hour",
      "No penalty for standard failures"
    ],
    penalties: [
      "No direct KP loss",
      "No multiplier reduction"
    ],
    multiplier: 1.0,
    maxMultiplier: 2.0,
    quote: "Small wins become great victories.",
    theme: "from-emerald-950/40 via-purple-950/40 to-black/80",
    accentColor: "#10B981",
    glowingBorder: "shadow-emerald-500/30 border-emerald-500/20",
    remindersCount: 3
  },
  {
    id: MentorId.SAVAGE_SISTER,
    name: "The Savage Sister",
    avatar: sayuriImg,
    difficulty: "Medium",
    personality: "Sassy, Strict, Teasing",
    rules: [
      "Allows only 2 distraction reminders",
      "Teases you with notifications when slacking",
      "Force-closes distraction apps after warning"
    ],
    rewards: [
      "+50 Kinetics Points (KP) per task",
      "+0.1 Multiplier growth per focus session"
    ],
    penalties: [
      "-0.1 Multiplier reduction on session exit"
    ],
    multiplier: 1.0,
    maxMultiplier: 3.0,
    quote: "Excuses won't finish your goals.",
    theme: "from-pink-950/40 via-purple-950/40 to-black/80",
    accentColor: "#EC4899",
    glowingBorder: "shadow-pink-500/30 border-pink-500/20",
    remindersCount: 2
  },
  {
    id: MentorId.STRICT_FATHER,
    name: "The Strict Father",
    avatar: kenjiImg,
    difficulty: "Hard",
    personality: "Cold, Serious, Intimidating",
    rules: [
      "Only 1 warning reminder total",
      "Strict app-blocking rules activated",
      "Force-closes social media apps instantly after 1 hit"
    ],
    rewards: [
      "+50 Kinetics Points (KP) per task",
      "+0.2 Multiplier growth on complete priority session"
    ],
    penalties: [
      "-10 KP penalty on missing high-priority milestones",
      "-0.1 Multiplier reduction for every distraction warning"
    ],
    multiplier: 1.0,
    maxMultiplier: 4.0,
    quote: "Discipline beats talent.",
    theme: "from-zinc-900/60 via-purple-950/40 to-black/80",
    accentColor: "#8B5CF6",
    glowingBorder: "shadow-purple-500/30 border-purple-500/20",
    remindersCount: 1
  },
  {
    id: MentorId.ENFORCER_MOM,
    name: "The Enforcer Mom",
    avatar: ryokoImg,
    difficulty: "Extreme",
    personality: "Angry, Uncompromising, Highly Strict",
    rules: [
      "ZERO reminders or warnings allowed",
      "Instantly closes distraction apps with no delay",
      "Locks study session until hours are complete"
    ],
    rewards: [
      "+70 Kinetics Points (KP) per task",
      "+30 Bonus KP per long focus session",
      "+0.25 Multiplier growth on flawless day"
    ],
    penalties: [
      "Resets Multiplier to 1.0x on a single failure",
      "-20 KP penalty for opening distraction apps"
    ],
    multiplier: 1.0,
    maxMultiplier: 5.0,
    quote: "You either work or watch others succeed.",
    theme: "from-red-950/40 via-purple-950/40 to-black/80",
    accentColor: "#EF4444",
    glowingBorder: "shadow-red-500/40 border-red-500/30",
    remindersCount: 0
  },
  {
    id: MentorId.STEVEN_HE,
    name: "Steven He (The Failure Enforcer)",
    avatar: stevenImg,
    difficulty: "Extreme",
    personality: "Extremely disappointed, sarcastic, meme-fueled, hilarious",
    rules: [
      "Triggers 'EMOTIONAL DAMAGE!' upon distraction",
      "Saves your pride by calling your dad 'smarter than you'",
      "ZERO reminders allowed. If you fail, you become a full-time failure laa!"
    ],
    rewards: [
      "+90 Kinetics Points (KP) per task",
      "+0.30 Multiplier growth per flawless hour",
      "Unlocked exclusive 'Emotional Healing' at level 5"
    ],
    penalties: [
      "Calls you failure instantly",
      "Resets progress to 0 if caught 2 times in a single session"
    ],
    multiplier: 1.0,
    maxMultiplier: 5.5,
    quote: "I will send you to Jesus! My cousin Timmy is 9 and already has 4 PhDs, and what are you doing? Slacking on Instagram!",
    theme: "from-amber-950/45 via-purple-950/40 to-black/90",
    accentColor: "#F59E0B",
    glowingBorder: "shadow-amber-500/40 border-amber-500/30",
    remindersCount: 0
  }
];

export default function MentorSelectionScreen({
  onSelect,
  currentSelectedId,
  isSettingsMode = false,
  mentorProgress = {
    [MentorId.COOL_BROTHER]: { level: 1, exp: 0 },
    [MentorId.SAVAGE_SISTER]: { level: 1, exp: 0 },
    [MentorId.STRICT_FATHER]: { level: 1, exp: 0 },
    [MentorId.ENFORCER_MOM]: { level: 1, exp: 0 },
    [MentorId.STEVEN_HE]: { level: 1, exp: 0 }
  }
}: MentorSelectionScreenProps) {
  const [selectedInfoMentor, setSelectedInfoMentor] = useState<Mentor | null>(null);

  const enhancedMentors = MENTORS_DATA.map((m) => {
    const prog = mentorProgress[m.id] || { level: 1, exp: 0 };
    return enhanceMentorWithLevel(m, prog.level, prog.exp);
  });

  return (
    <div id="mentor-selection-container" className="flex flex-col h-full overflow-y-auto px-5 py-6 text-white relative dot-grid">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#7B2EFF]/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header (Omit if inside settings/already set up) */}
      {!isSettingsMode && (
        <div className="mb-6">
          <div className="flex items-center gap-2 text-[#7B2EFF] font-mono text-xs uppercase tracking-widest font-bold">
            <Shield className="w-4 h-4 text-[#7B2EFF]" /> Setup Stage 3 of 3
          </div>
          <h2 className="text-xl font-black tracking-tight mt-1 text-white purple-text-glow">
            SELECT YOUR SENSEI
          </h2>
          <p className="text-xs text-white/40 mt-1">
            Choose a mentor to guide your journey. Their personality, reward rates, and app-blocking strictness will shape your path.
          </p>
        </div>
      )}

      {isSettingsMode && (
        <div className="mb-4">
          <h3 className="text-md font-mono text-white purple-text-glow uppercase tracking-wider font-bold">Change Active Sensei</h3>
          <p className="text-[10px] text-white/40 font-mono">Current level determines strictness parameters.</p>
        </div>
      )}

      {/* Vertical list of Mentor cards */}
      <div className="space-y-6 pb-8">
        {enhancedMentors.map((mentor) => {
          const isSelected = currentSelectedId === mentor.id;
          return (
            <motion.div
              key={mentor.id}
              whileHover={{ y: -3 }}
              className={`w-full rounded-2xl border ${isSelected ? 'border-[#7B2EFF] bg-[#7B2EFF]/10 purple-glow' : 'border-white/10 bg-black/40'} overflow-hidden shadow-xl flex flex-col relative`}
            >
              {/* Highlight ribbon */}
              {isSelected && (
                <div className="absolute top-3 right-3 bg-[#7B2EFF] text-white text-xxs px-2.5 py-1 rounded-full font-mono font-black tracking-wider z-10 uppercase flex items-center gap-1 shadow-md shadow-[#7B2EFF]/40">
                  <Sparkles className="w-3 h-3" /> Active Partner
                </div>
              )}

              {/* Character Header Artwork */}
              <div className="relative h-44 w-full">
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top filter contrast-[1.05] brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                
                {/* Name / Difficulty Badge on Image */}
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div>
                    <h3 className="text-md font-black tracking-wide font-sans text-white drop-shadow">
                      {mentor.name}
                    </h3>
                    <p className="text-xxs font-mono text-white/60 drop-shadow mt-0.5 font-semibold">
                      {mentor.personality}
                    </p>
                  </div>
                  <span
                    className={`text-xxs font-mono font-black px-2 py-0.5 rounded uppercase border tracking-wider drop-shadow`}
                    style={{
                      borderColor: mentor.accentColor + "40",
                      backgroundColor: mentor.accentColor + "20",
                      color: mentor.accentColor
                    }}
                  >
                    {mentor.difficulty}
                  </span>
                </div>
              </div>

              {/* Character Details Snippet */}
              <div className="p-4 bg-black/40 flex-1 flex flex-col justify-between">
                {/* Level Progress Indicator */}
                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 mb-4 flex flex-col gap-1.5 shadow-sm">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-[#7B2EFF] font-black uppercase tracking-wider flex items-center gap-1">
                      <Star className="w-3 h-3 fill-[#7B2EFF]/20" /> Level {mentor.level}
                    </span>
                    <span className="text-white/40 font-semibold uppercase text-[9px] truncate max-w-[120px]">
                      {mentor.levelTitle}
                    </span>
                    <span className="text-white/60 font-bold text-[9px]">
                      {mentor.level === 5 ? "MAX" : `${mentor.exp} / ${mentor.nextLevelExp} XP`}
                    </span>
                  </div>
                  {mentor.level !== 5 && (
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#7B2EFF] to-indigo-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, ((mentor.exp || 0) / (mentor.nextLevelExp || 100)) * 100)}%` }}
                      ></div>
                    </div>
                  )}
                  {mentor.level === 5 && (
                    <div className="w-full bg-yellow-500/10 border border-yellow-500/20 rounded-lg py-1 px-2 text-center text-[9px] font-mono font-bold text-yellow-500 uppercase tracking-widest animate-pulse">
                      🏆 Max Sovereignty Unlocked!
                    </div>
                  )}
                </div>

                {/* Character Quote */}
                <p className="text-xs italic text-white/80 font-mono mb-4 text-center border-l-2 border-[#7B2EFF]/40 pl-3">
                  "{mentor.quote}"
                </p>

                {/* Rules & Rewards Quick Stats */}
                <div className="grid grid-cols-2 gap-3 text-xxs font-mono mb-4 border-t border-white/5 pt-3">
                  <div>
                    <span className="text-white/40 uppercase tracking-widest block mb-1 font-bold">Dojo Rule</span>
                    <span className="text-white/80 block font-semibold">{mentor.rules[0]}</span>
                  </div>
                  <div>
                    <span className="text-white/40 uppercase tracking-widest block mb-1 font-bold">Max Multiplier</span>
                    <span className="text-[#7B2EFF] font-black block">{mentor.maxMultiplier}x Force</span>
                  </div>
                </div>

                {/* Button Controls */}
                <div className="flex gap-2.5 mt-2">
                  <button
                    id={`mentor-info-${mentor.id}`}
                    onClick={() => setSelectedInfoMentor(mentor)}
                    className="flex-1 bg-black/40 hover:bg-white/5 border border-white/10 text-white/80 py-2 px-3 rounded-xl text-xxs font-mono font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    Dojo Info
                  </button>
                  <button
                    id={`mentor-select-${mentor.id}`}
                    onClick={() => onSelect(mentor.id)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xxs font-mono font-black transition-all border flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? "bg-[#7B2EFF]/15 border-[#7B2EFF]/30 text-[#7B2EFF] cursor-default"
                        : "bg-[#7B2EFF] hover:brightness-110 border-white/10 active:scale-[0.98] text-white"
                    }`}
                  >
                    {isSelected ? "Active Partner" : "Select Partner"}
                    {!isSelected && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Info Details Modal Sheet */}
      <AnimatePresence>
        {selectedInfoMentor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 glass backdrop-blur-xl z-50 flex flex-col p-6 overflow-y-auto dot-grid"
          >
            {/* Header / Dismiss */}
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <span className="text-xs font-mono text-[#7B2EFF] uppercase tracking-widest font-black">
                Dojo Training Profile
              </span>
              <button
                id="close-mentor-info-modal"
                onClick={() => setSelectedInfoMentor(null)}
                className="w-8 h-8 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-6 pt-5 flex-1">
              {/* Profile card style header */}
              <div className="flex gap-4 items-center">
                <img
                  src={selectedInfoMentor.avatar}
                  alt={selectedInfoMentor.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover border border-[#7B2EFF]/25 shadow-md"
                />
                <div>
                  <h4 className="text-md font-black text-white leading-tight">
                    {selectedInfoMentor.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                    <p className="text-xxs font-mono text-white/40 uppercase tracking-widest font-bold">
                      Difficulty:{" "}
                      <span className="font-black" style={{ color: selectedInfoMentor.accentColor }}>
                        {selectedInfoMentor.difficulty}
                      </span>
                    </p>
                    <span className="text-xxxs font-mono px-1.5 py-0.5 rounded bg-[#7B2EFF]/20 text-purple-300 border border-[#7B2EFF]/30 font-black uppercase">
                      Lvl {selectedInfoMentor.level || 1} {selectedInfoMentor.levelTitle || "Sensei"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quote block */}
              <div className="bg-black/50 border border-[#7B2EFF]/20 rounded-xl p-3.5 text-center text-xs italic font-mono text-white">
                "{selectedInfoMentor.quote}"
              </div>

              {/* Behavior & Blocking Info */}
              <div className="space-y-2">
                <h5 className="text-[10px] font-mono uppercase tracking-widest text-white/50 flex items-center gap-1 font-bold">
                  <Flame className="w-3.5 h-3.5 text-[#7B2EFF]" /> App-Blocking Strictness
                </h5>
                <div className="bg-black/35 rounded-xl p-4 border border-[#7B2EFF]/15 text-xs text-white/80 font-sans space-y-2">
                  <p>
                    When Focus Mode activates, this mentor strictly monitors your device.
                  </p>
                  <div className="text-xxs font-mono p-2 rounded bg-black/60 border border-[#7B2EFF]/20 text-[#7B2EFF] font-bold">
                    Reminder Limits: {selectedInfoMentor.remindersCount === 0 ? "ZERO reminders (Instant Lock)" : `${selectedInfoMentor.remindersCount} reminders before hard close`}
                  </div>
                </div>
              </div>

              {/* Rules Bullet List */}
              <div className="space-y-2">
                <h5 className="text-[10px] font-mono uppercase tracking-widest text-white/50 flex items-center gap-1 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Discipline Rules
                </h5>
                <ul className="space-y-1.5 pl-1">
                  {selectedInfoMentor.rules.map((rule, idx) => (
                    <li key={idx} className="text-xxs text-white/80 font-mono flex items-start gap-2">
                      <span className="text-[#7B2EFF]">•</span> {rule}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rewards List */}
              <div className="space-y-2">
                <h5 className="text-[10px] font-mono uppercase tracking-widest text-white/50 flex items-center gap-1 font-bold">
                  <Award className="w-3.5 h-3.5 text-emerald-500" /> Kinetics Rewards
                </h5>
                <ul className="space-y-1.5 pl-1">
                  {selectedInfoMentor.rewards.map((rew, idx) => (
                    <li key={idx} className="text-xxs text-white/80 font-mono flex items-start gap-2">
                      <span className="text-emerald-400">+</span> {rew}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Penalties List */}
              <div className="space-y-2">
                <h5 className="text-[10px] font-mono uppercase tracking-widest text-white/50 flex items-center gap-1 font-bold">
                  <X className="w-3.5 h-3.5 text-red-500" /> Penalties & Failure Costs
                </h5>
                <ul className="space-y-1.5 pl-1">
                  {selectedInfoMentor.penalties.map((pen, idx) => (
                    <li key={idx} className="text-xxs text-white/80 font-mono flex items-start gap-2">
                      <span className="text-red-500">−</span> {pen}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Multiplier growth */}
              <div className="bg-black/60 p-4 border border-[#7B2EFF]/20 rounded-xl font-mono text-center purple-glow">
                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1 font-bold">Multiplier Progression</div>
                <div className="text-md font-bold text-white">
                  1.0x <span className="text-[#7B2EFF] purple-text-glow">→ {selectedInfoMentor.maxMultiplier}.0x Max</span>
                </div>
                <div className="text-[9px] text-white/40 mt-1">Multiplier applies directly to earned KP. Higher difficulty = higher ceilings.</div>
              </div>
            </div>

            {/* CTA Select */}
            <div className="pt-4 border-t border-white/10">
              <button
                id={`modal-select-confirm-${selectedInfoMentor.id}`}
                onClick={() => {
                  onSelect(selectedInfoMentor.id);
                  setSelectedInfoMentor(null);
                }}
                className="w-full bg-[#7B2EFF] hover:brightness-110 py-3 rounded-xl text-xs font-mono font-bold tracking-wider text-white shadow-[0_5px_15px_rgba(123,46,255,0.4)]"
              >
                Accept and Partner with {selectedInfoMentor.name.split(" ")[0]}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
