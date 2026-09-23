/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RewardItem, UserStats, Mentor } from "../types";
import { Zap, ShieldCheck, Flame, Star, Award, Lock, Unlock, ShoppingCart, Sparkles, AlertCircle, CheckCircle } from "lucide-react";

interface RewardsViewProps {
  userStats: UserStats;
  setUserStats: React.Dispatch<React.SetStateAction<UserStats>>;
  mentor: Mentor;
  onAddLog: (log: string) => void;
  unlockedRewardIds: string[];
  onUnlockReward: (id: string) => void;
  equippedThemeId: string;
  onEquipTheme: (id: string) => void;
  equippedSkinId: string;
  onEquipSkin: (id: string) => void;
}

export const INITIAL_REWARDS: RewardItem[] = [
  {
    id: "r1",
    name: "Cyber-Dōjō Ambiance Theme",
    category: "Themes",
    cost: 150,
    description: "Unlocks an ultra-premium neon-cyber pink & purple glowing dashboard visual theme.",
    icon: "🎨",
    locked: true
  },
  {
    id: "r8",
    name: "Steven's Disappointment Interface",
    category: "Themes",
    cost: 250,
    description: "Transforms your dashboard into a funny amber-glow Asian household theme with flying slippers.",
    icon: "🤦‍♂️",
    locked: true
  },
  {
    id: "r3",
    name: "Summer Outing Skin (Hiro)",
    category: "Skins",
    cost: 300,
    description: "Unlocks a relaxed tropical summer beach skin for Cool Brother Hiro.",
    icon: "👕",
    locked: true
  },
  {
    id: "r7",
    name: "Golden Slipper Skin (Steven He)",
    category: "Skins",
    cost: 350,
    description: "Unlocks the ultimate golden flying slipper avatar skin for Steven He. EMOTIONAL HEALING!",
    icon: "🩴",
    locked: true
  },
  {
    id: "r2",
    name: "Interactive Productivity Heatmap",
    category: "Analytics",
    cost: 200,
    description: "Adds an advanced Github-style productivity contribution heatmap widget.",
    icon: "📊",
    locked: true
  },
  {
    id: "r4",
    name: "Elite Dragon Frame",
    category: "Frames",
    cost: 150,
    description: "An elegant golden dragon border circling your mentor's avatar.",
    icon: "🐉",
    locked: true
  },
  {
    id: "r5",
    name: "Focus Soundscapes Widget",
    category: "Widgets",
    cost: 100,
    description: "Integrates Lo-Fi & Japanese garden ambient player into focus view.",
    icon: "🎵",
    locked: true
  }
];

export default function RewardsView({
  userStats,
  setUserStats,
  mentor,
  onAddLog,
  unlockedRewardIds,
  onUnlockReward,
  equippedThemeId,
  onEquipTheme,
  equippedSkinId,
  onEquipSkin
}: RewardsViewProps) {
  const [purchaseMsg, setPurchaseMsg] = useState("");

  const handlePurchase = (id: string, cost: number, name: string) => {
    if (unlockedRewardIds.includes(id)) return;

    if (userStats.kp < cost) {
      setPurchaseMsg("Weakness! Insufficient Kinetics Points (KP) to claim reward.");
      setTimeout(() => setPurchaseMsg(""), 3000);
      return;
    }

    // Purchase successful
    setUserStats((prev) => ({
      ...prev,
      kp: prev.kp - cost
    }));

    onUnlockReward(id);
    setPurchaseMsg(`✨ Unlocked: "${name}"! Click Equip to activate!`);
    onAddLog(`Spent ${cost} KP to unlock Reward: "${name}".`);
    setTimeout(() => setPurchaseMsg(""), 3000);
  };

  const handleEquip = (item: RewardItem) => {
    if (item.category === "Themes") {
      if (equippedThemeId === item.id) {
        onEquipTheme("default");
        onAddLog(`Equipped Default Theme.`);
      } else {
        onEquipTheme(item.id);
        onAddLog(`Equipped Theme: "${item.name}".`);
      }
    } else if (item.category === "Skins") {
      if (equippedSkinId === item.id) {
        onEquipSkin("default");
        onAddLog(`Equipped Default Mentor Skin.`);
      } else {
        onEquipSkin(item.id);
        onAddLog(`Equipped Skin: "${item.name}".`);
      }
    }
  };

  return (
    <div id="rewards-container" className="flex flex-col h-full overflow-y-auto px-5 py-5 text-white space-y-4 pb-24 relative dot-grid">
      <div className="absolute top-24 left-5 w-24 h-24 bg-[#7B2EFF]/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header */}
      <div>
        <span className="text-xxs font-mono text-[#7B2EFF] uppercase tracking-widest block font-bold">Dojo Vault</span>
        <h2 className="text-lg font-black tracking-tight text-white purple-text-glow">Rewards & skins</h2>
      </div>

      {/* STATS GAMIFIED OVERVIEW */}
      <div className="glass border border-white/5 rounded-2xl p-4 shadow-xl space-y-3.5 relative overflow-hidden purple-glow">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#7B2EFF] to-transparent"></div>
        
        {/* Row 1: Level & Mentor */}
        <div className="flex justify-between items-center text-xxs font-mono uppercase font-bold">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#7B2EFF]" />
            <span>Dojo Level: <span className="text-[#7B2EFF] font-black">Lvl {userStats.level}</span></span>
          </div>
          <div className="flex items-center gap-1.5 text-white/40">
            <span>Partner: <span className="text-[#7B2EFF] font-black">{mentor.name.split(" ")[0]}</span></span>
          </div>
        </div>

        {/* Big KP Balance */}
        <div className="flex justify-between items-end border-t border-b border-white/5 py-3.5">
          <div className="space-y-0.5">
            <span className="text-xxxs font-mono text-white/40 uppercase tracking-widest block font-bold">Available Vault Balance</span>
            <div className="text-3xl font-black font-mono text-[#7B2EFF] flex items-center gap-1.5 purple-text-glow">
              <Zap className="w-7 h-7 text-[#7B2EFF] fill-[#7B2EFF]/15 animate-pulse" />
              {userStats.kp} <span className="text-xs text-[#7B2EFF]">KP</span>
            </div>
          </div>

          <div className="text-right font-mono text-xxs">
            <span className="text-white/40 uppercase tracking-widest block mb-0.5 font-bold">Focus Factor</span>
            <span className="text-[#7B2EFF] font-black flex items-center justify-end gap-0.5">
              <Star className="w-3.5 h-3.5 text-[#7B2EFF] fill-[#7B2EFF]/20 animate-spin" style={{ animationDuration: "6s" }} /> {userStats.multiplier.toFixed(2)}x
            </span>
          </div>
        </div>

        {/* Streaks Container */}
        <div className="grid grid-cols-3 gap-2 text-center font-mono">
          <div className="bg-black/50 border border-white/10 rounded-xl p-2.5 hover:bg-white/5 transition-colors cursor-pointer">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500/10 mx-auto animate-pulse" />
            <span className="text-xxs font-black text-white block mt-1">{userStats.dailyStreak} Days</span>
            <span className="text-[9px] text-white/30 uppercase tracking-widest block font-bold">Daily Streak</span>
          </div>
          <div className="bg-black/50 border border-white/10 rounded-xl p-2.5 hover:bg-white/5 transition-colors cursor-pointer">
            <Award className="w-5 h-5 text-[#7B2EFF] mx-auto" />
            <span className="text-xxs font-black text-white block mt-1">{userStats.weeklyStreak} Weeks</span>
            <span className="text-[9px] text-white/30 uppercase tracking-widest block font-bold">Weekly Streak</span>
          </div>
          <div className="bg-black/50 border border-white/10 rounded-xl p-2.5 hover:bg-white/5 transition-colors cursor-pointer">
            <ShieldCheck className="w-5 h-5 text-[#7B2EFF] mx-auto" />
            <span className="text-xxs font-black text-white block mt-1">{userStats.monthlyStreak} Months</span>
            <span className="text-[9px] text-white/30 uppercase tracking-widest block font-bold">Monthly Streak</span>
          </div>
        </div>
      </div>

      {/* PURCHASE FEEDBACK BANNERS */}
      <AnimatePresence>
        {purchaseMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-3 rounded-xl text-center text-xxs font-mono border font-bold ${
              purchaseMsg.includes("Weakness")
                ? "bg-red-950/20 border-red-500/30 text-red-400 uppercase"
                : "glass border-[#7B2EFF]/35 text-[#7B2EFF] purple-glow uppercase"
            }`}
          >
            {purchaseMsg.includes("Weakness") ? (
              <span className="flex items-center justify-center gap-1">
                <AlertCircle className="w-4 h-4 text-red-500" /> {purchaseMsg}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5 animate-pulse">
                <Sparkles className="w-4 h-4 text-[#7B2EFF]" /> {purchaseMsg}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SHOP TILES GRID */}
      <div className="space-y-2">
        <h3 className="text-xxs font-mono uppercase tracking-widest text-white/40 block mb-2 font-bold">Dojo Reward Shop & Skins</h3>
        
        <div className="grid grid-cols-1 gap-3">
          {INITIAL_REWARDS.map((item) => {
            const isUnlocked = unlockedRewardIds.includes(item.id);
            const isEquipped = item.category === "Themes"
              ? equippedThemeId === item.id
              : item.category === "Skins"
                ? equippedSkinId === item.id
                : false;

            return (
              <div
                key={item.id}
                className={`glass border transition-all duration-300 relative overflow-hidden group ${
                  isEquipped
                    ? "border-amber-500 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                    : isUnlocked
                      ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60"
                      : "border-white/5 hover:border-[#7B2EFF]/25"
                } rounded-2xl p-4 flex items-center justify-between gap-4`}
              >
                <div className="flex gap-3 items-center">
                  {/* Big emoji/icon placeholder */}
                  <span className={`text-2xl border rounded-xl w-12 h-12 flex items-center justify-center shrink-0 shadow font-sans transition-all duration-300 ${
                    isEquipped ? "bg-amber-500/20 border-amber-500" : "bg-black/60 border-white/10"
                  }`}>
                    {item.icon}
                  </span>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white font-sans">{item.name}</h4>
                      <span className={`text-[8px] font-mono uppercase border px-1.5 py-0.5 rounded font-black tracking-wider ${
                        isEquipped ? "bg-amber-500/20 border-amber-500 text-amber-300" : "bg-black/60 border-white/10 text-white/50"
                      }`}>
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xxs text-white/60 leading-tight font-medium font-sans">{item.description}</p>
                  </div>
                </div>

                {/* Purchase or Equip CTA */}
                <div className="shrink-0 text-right space-y-1.5">
                  {!isUnlocked && (
                    <div className="text-xxs font-mono font-black text-[#7B2EFF] flex items-center justify-end gap-0.5 uppercase tracking-wider purple-text-glow">
                      <Zap className="w-3 h-3 text-[#7B2EFF] fill-[#7B2EFF]/10" /> {item.cost} KP
                    </div>
                  )}

                  {isUnlocked ? (
                    <button
                      id={`equip-reward-${item.id}`}
                      onClick={() => handleEquip(item)}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xxs font-black flex items-center gap-1 transition-all uppercase tracking-wider cursor-pointer ${
                        isEquipped
                          ? "bg-amber-500 text-black font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                          : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
                      }`}
                    >
                      {isEquipped ? (
                        <>
                          <CheckCircle className="w-3 h-3" /> Active
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3 h-3" /> Equip
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      id={`buy-reward-${item.id}`}
                      onClick={() => handlePurchase(item.id, item.cost, item.name)}
                      className="px-3 py-1.5 rounded-xl font-mono text-xxs font-black flex items-center gap-1 transition-all uppercase tracking-wider cursor-pointer bg-[#7B2EFF] hover:brightness-110 text-white shadow-[0_4px_12px_rgba(123,46,255,0.3)]"
                    >
                      <ShoppingCart className="w-3 h-3" /> Claim
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
