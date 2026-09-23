/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { Hourglass, ShieldAlert, Sparkles, Smile } from "lucide-react";

interface DailyCommitmentScreenProps {
  onComplete: (hours: number) => void;
}

export default function DailyCommitmentScreen({ onComplete }: DailyCommitmentScreenProps) {
  const [hours, setHours] = useState(4); // default 4 hours

  const handleNext = () => {
    if (hours < 3) return; // double safety
    onComplete(hours);
  };

  // Fun reaction quote based on hours
  const getReaction = (h: number) => {
    if (h < 3) return { text: "UNACCEPTABLE. A legend cannot build with so little effort.", color: "text-red-500", valid: false };
    if (h === 3) return { text: "The Dojo Minimum. Acceptable, but you can do better.", color: "text-purple-300", valid: true };
    if (h >= 4 && h <= 6) return { text: "Healthy Balance. A disciplined, steady warrior path.", color: "text-purple-400", valid: true };
    if (h >= 7 && h <= 9) return { text: "High Intensity. Your mentors will watch with high hopes!", color: "text-violet-400", valid: true };
    return { text: "DEMIGOD STATUS. Ensure you eat, sleep, and maintain hydration, legend!", color: "text-amber-400 animate-pulse", valid: true };
  };

  const reaction = getReaction(hours);

  return (
    <div id="commitment-setup-container" className="flex flex-col h-full overflow-y-auto px-6 py-6 text-white justify-between relative dot-grid">
      <div className="absolute top-1/4 left-10 w-28 h-28 bg-[#7B2EFF]/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#7B2EFF] font-mono text-xs uppercase tracking-widest font-bold">
          <Hourglass className="w-4 h-4 text-[#7B2EFF]" /> Setup Stage 2 of 3
        </div>
        <h2 className="text-xl font-black tracking-tight mt-1 text-white purple-text-glow">
          DAILY TIME COMMITMENT
        </h2>
        <p className="text-xs text-white/40 mt-1">
          Decide how many hours you will dedicate each day to your 12-week goal.
        </p>
      </div>

      {/* Main Slider Panel */}
      <div className="glass rounded-2xl p-6 purple-glow text-center space-y-6 my-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#7B2EFF]/50"></div>
        
        <p className="text-xs text-white/40 italic font-mono uppercase tracking-wider">
          "Commit to your future self."
        </p>

        {/* Dynamic Hours Dial */}
        <div className="relative inline-flex items-center justify-center">
          <motion.div
            key={hours}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-6xl font-black font-mono tracking-tighter ${hours < 3 ? 'text-red-500' : 'text-[#7B2EFF] purple-text-glow'}`}
          >
            {hours}
          </motion.div>
          <span className="text-xl font-mono text-white/30 ml-1">Hrs</span>
        </div>

        {/* Custom Slider Input */}
        <div className="space-y-2">
          <input
            id="commitment-hours-slider"
            type="range"
            min="1"
            max="12"
            value={hours}
            onChange={(e) => setHours(parseInt(e.target.value))}
            className="w-full accent-[#7B2EFF] h-1.5 bg-black/50 rounded-lg cursor-pointer border border-[#7B2EFF]/10"
          />
          <div className="flex justify-between text-[10px] font-mono text-white/40 font-bold uppercase">
            <span>1 Hr</span>
            <span>3 Hrs (Min)</span>
            <span>6 Hrs</span>
            <span>9 Hrs</span>
            <span>12 Hrs</span>
          </div>
        </div>

        {/* Custom Mentor Response Box */}
        <div className="bg-black/40 rounded-xl p-4 border border-[#7B2EFF]/20 text-xs font-mono relative min-h-[70px] flex items-center justify-center">
          {hours < 3 ? (
            <div className="flex items-center gap-2 text-red-400">
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
              <span>{reaction.text}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1 text-white/40 uppercase tracking-widest text-[9px] mb-1 font-bold">
                <Sparkles className="w-3 h-3 text-[#7B2EFF]" /> System Reaction
              </div>
              <span className={`text-center font-semibold ${reaction.color === 'text-purple-300' ? 'text-violet-300' : reaction.color === 'text-purple-400' ? 'text-violet-400' : reaction.color}`}>{reaction.text}</span>
            </div>
          )}
        </div>
      </div>

      {/* Warning Alert if Hours < 3 */}
      {hours < 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-950/20 border border-red-500/30 rounded-xl p-3 text-center mb-4"
        >
          <p className="text-xxs text-red-300 font-mono uppercase tracking-wider">
            🚨 Weakness Detected. Minimum commitment is 3 hours. Slide higher to enter the path.
          </p>
        </motion.div>
      )}

      {/* Button */}
      <div className="mt-4 pb-2">
        <button
          id="commitment-continue-btn"
          onClick={handleNext}
          disabled={hours < 3}
          className={`w-full py-3 rounded-xl font-mono text-xs font-bold tracking-wider transition-all border ${
            hours < 3
              ? "bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed"
              : "bg-[#7B2EFF] hover:brightness-110 active:scale-[0.98] border-white/10 shadow-[0_5px_15px_rgba(123,46,255,0.4)] text-white"
          }`}
        >
          {hours < 3 ? "Select 3+ Hours To Unlock Dojo" : "Lock Hours & Progress"}
        </button>
      </div>
    </div>
  );
}
