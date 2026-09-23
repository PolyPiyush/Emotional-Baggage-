/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { Flag, Calendar, Award, Compass, Sparkles } from "lucide-react";

interface GoalSetupScreenProps {
  onComplete: (data: {
    mainGoal: string;
    goalDescription: string;
    startDate: string;
    endDate: string;
    expectedOutcome: string;
  }) => void;
}

export default function GoalSetupScreen({ onComplete }: GoalSetupScreenProps) {
  const [mainGoal, setMainGoal] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [startDate, setStartDate] = useState("2026-07-01");
  const [endDate, setEndDate] = useState("2026-09-23"); // exactly 12 weeks
  const [expectedOutcome, setExpectedOutcome] = useState("");
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!mainGoal.trim()) {
      setError("You must define your Legendary 12-Week Goal to proceed.");
      return;
    }
    if (!expectedOutcome.trim()) {
      setError("Please describe the expected outcome. Visualize your victory.");
      return;
    }
    setError("");
    onComplete({
      mainGoal,
      goalDescription,
      startDate,
      endDate,
      expectedOutcome
    });
  };

  return (
    <div id="goal-setup-container" className="flex flex-col h-full overflow-y-auto px-6 py-6 text-white justify-between relative dot-grid">
      <div className="absolute top-10 right-10 w-24 h-24 bg-[#7B2EFF]/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-[#7B2EFF] font-mono text-xs uppercase tracking-widest font-bold">
          <Compass className="w-4 h-4 animate-spin-slow text-[#7B2EFF]" /> Setup Stage 1 of 3
        </div>
        <h2 className="text-xl font-black tracking-tight mt-1 text-white purple-text-glow">
          THE 12-WEEK YEAR GOAL
        </h2>
        <p className="text-xs text-white/40 mt-1">
          A standard year is too long. In 12 weeks, we execute with hyper-focus.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="space-y-4 glass rounded-2xl p-5 purple-glow relative">
        <div>
          <label className="block text-xs font-mono text-white/60 mb-1.5 uppercase tracking-wider">
            1. Your Primary Objective
          </label>
          <div className="relative">
            <span className="absolute top-3 left-3 text-white/30">
              <Flag className="w-4 h-4" />
            </span>
            <input
              id="goal-setup-main-input"
              type="text"
              placeholder="e.g. Master React Native & Launch My First App"
              value={mainGoal}
              onChange={(e) => setMainGoal(e.target.value)}
              className="w-full bg-black/40 border border-[#7B2EFF]/20 focus:border-[#7B2EFF] focus:ring-1 focus:ring-[#7B2EFF]/30 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-white/30 outline-none transition-all font-sans"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-white/60 mb-1.5 uppercase tracking-wider">
            2. Goal Description / Strategy
          </label>
          <textarea
            id="goal-setup-desc-input"
            rows={2}
            placeholder="Outline your strategic execution blueprint..."
            value={goalDescription}
            onChange={(e) => setGoalDescription(e.target.value)}
            className="w-full bg-black/40 border border-[#7B2EFF]/20 focus:border-[#7B2EFF] focus:ring-1 focus:ring-[#7B2EFF]/30 rounded-xl py-2 pl-3 pr-4 text-xs text-white placeholder-white/30 outline-none transition-all resize-none font-sans"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-mono text-white/60 mb-1 uppercase tracking-wider">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-3.5 h-3.5 text-white/30" />
              <input
                id="goal-setup-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-black/40 border border-[#7B2EFF]/20 focus:border-[#7B2EFF] focus:ring-1 focus:ring-[#7B2EFF]/30 rounded-xl py-2 pl-9 pr-2 text-xxs text-white outline-none font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono text-white/60 mb-1 uppercase tracking-wider">
              End Date (12 Weeks)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-3.5 h-3.5 text-white/30" />
              <input
                id="goal-setup-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-black/40 border border-[#7B2EFF]/20 focus:border-[#7B2EFF] focus:ring-1 focus:ring-[#7B2EFF]/30 rounded-xl py-2 pl-9 pr-2 text-xxs text-white outline-none font-mono"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-white/60 mb-1.5 uppercase tracking-wider">
            3. Target Outcome (Victory Condition)
          </label>
          <div className="relative">
            <span className="absolute top-3 left-3 text-white/30">
              <Award className="w-4 h-4" />
            </span>
            <input
              id="goal-setup-outcome-input"
              type="text"
              placeholder="e.g. 1,000 active app users & fully compiled build on GitHub"
              value={expectedOutcome}
              onChange={(e) => setExpectedOutcome(e.target.value)}
              className="w-full bg-black/40 border border-[#7B2EFF]/20 focus:border-[#7B2EFF] focus:ring-1 focus:ring-[#7B2EFF]/30 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-white/30 outline-none transition-all font-sans"
            />
          </div>
        </div>
      </div>

      {/* Progress timeline illustration */}
      <div className="mt-4 p-4 rounded-xl glass-light border border-[#7B2EFF]/15 relative">
        <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#7B2EFF] mb-3 flex items-center gap-1 font-bold">
          <Sparkles className="w-3 h-3 text-[#7B2EFF]" /> Visualising the 12-Week Sprint
        </h4>
        
        {/* Timeline dots line */}
        <div className="relative h-12 flex justify-between items-center px-4 mt-1">
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-gradient-to-r from-[#7B2EFF] via-[#7B2EFF]/60 to-[#7B2EFF]/10"></div>
          
          <div className="flex flex-col items-center relative z-10">
            <div className="w-4 h-4 bg-[#7B2EFF] rounded-full border-2 border-white flex items-center justify-center purple-glow"></div>
            <span className="text-xxs font-mono mt-1.5 text-[#7B2EFF]">Week 1</span>
            <span className="text-[8px] text-white/30 uppercase tracking-tighter">Initiate</span>
          </div>

          <div className="flex flex-col items-center relative z-10">
            <div className="w-3 h-3 bg-[#7B2EFF]/80 rounded-full border border-white/20"></div>
            <span className="text-xxs font-mono mt-2 text-white/60">Week 6</span>
            <span className="text-[8px] text-white/30 uppercase tracking-tighter">Midpoint</span>
          </div>

          <div className="flex flex-col items-center relative z-10">
            <div className="w-4 h-4 bg-[#111] rounded-full border-2 border-[#7B2EFF] flex items-center justify-center">
              <Award className="w-2.5 h-2.5 text-[#7B2EFF]" />
            </div>
            <span className="text-xxs font-mono mt-1.5 text-white/60">Week 12</span>
            <span className="text-[8px] text-[#7B2EFF] uppercase tracking-tighter">Legend Status</span>
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xxs p-2 bg-red-950/40 border border-red-500/40 text-red-200 rounded-lg font-mono mt-2 text-center"
        >
          {error}
        </motion.div>
      )}

      {/* Action button */}
      <div className="mt-4 pb-2">
        <button
          id="goal-setup-continue-btn"
          onClick={handleNext}
          className="w-full bg-[#7B2EFF] hover:brightness-110 active:scale-[0.98] transition-all text-white font-bold py-3 rounded-xl border border-white/10 shadow-[0_5px_15px_rgba(123,46,255,0.4)] font-mono text-xs tracking-wider"
        >
          Lock Objective & Continue
        </button>
      </div>
    </div>
  );
}
