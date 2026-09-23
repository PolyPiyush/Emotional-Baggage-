/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Mentor, MentorId } from "./types";

export function getNextLevelThreshold(level: number): number {
  if (level === 1) return 100;
  if (level === 2) return 250;
  if (level === 3) return 450;
  if (level === 4) return 700;
  return Infinity; // Level 5 is max
}

export const LEVEL_TITLES: Record<number, string> = {
  1: "Novice Companion",
  2: "Dedicated Supporter",
  3: "Relentless Sensei",
  4: "Ascended Guardian",
  5: "Master of Sovereignty"
};

export function enhanceMentorWithLevel(mentor: Mentor, level: number, exp: number): Mentor {
  const nextExpThreshold = getNextLevelThreshold(level);

  // Custom LEVEL_TITLES for Steven He
  let customTitleSuffix = LEVEL_TITLES[level] || "Sensei";
  if (mentor.id === MentorId.STEVEN_HE) {
    const STEVEN_TITLES: Record<number, string> = {
      1: "Average Failure",
      2: "Slightly Better Disappointment",
      3: "Almost Acceptable Cousin",
      4: "Asian Standard Achiever",
      5: "Timmy's Equal"
    };
    customTitleSuffix = STEVEN_TITLES[level] || "Master of Sarcasm";
  }

  // 1. Dynamic Level-Up Quotes
  let quote = mentor.quote;
  if (level === 2) {
    if (mentor.id === MentorId.COOL_BROTHER) quote = "Keep building momentum. Every single session brings us closer to the apex.";
    if (mentor.id === MentorId.SAVAGE_SISTER) quote = "Look at you, actually working. Keep it up, don't make me regret cheering for you.";
    if (mentor.id === MentorId.STRICT_FATHER) quote = "The true warrior seeks progress, not comfort. Do not rest on your initial victories.";
    if (mentor.id === MentorId.ENFORCER_MOM) quote = "No slacking off now! Focus harder, your potential is unlimited if you actually try!";
    if (mentor.id === MentorId.STEVEN_HE) quote = "You are only a disappointment, not a full failure yet! My flying slipper is ready if you touch TikTok!";
  } else if (level === 3) {
    if (mentor.id === MentorId.COOL_BROTHER) quote = "You're getting strong, bro! This dōjō is starting to feel like a champion's ground.";
    if (mentor.id === MentorId.SAVAGE_SISTER) quote = "Alright, I'll admit, you're not completely useless. In fact, you're doing pretty great.";
    if (mentor.id === MentorId.STRICT_FATHER) quote = "Your discipline is sharpening. A masterpiece is built one stone at a time.";
    if (mentor.id === MentorId.ENFORCER_MOM) quote = "See?! I knew you had it in you! Don't you dare slow down now, I'm watching closely!";
    if (mentor.id === MentorId.STEVEN_HE) quote = "Almost acceptable! My cousin Timmy still has more PhDs than you have completed tasks, but laa, you are trying!";
  } else if (level === 4) {
    if (mentor.id === MentorId.COOL_BROTHER) quote = "Absolutely legendary sprint, bro! Our energy is untouchable. Let's make history today!";
    if (mentor.id === MentorId.SAVAGE_SISTER) quote = "Wow, you're actually shining now. I guess my constant teasing really paid off, huh?";
    if (mentor.id === MentorId.STRICT_FATHER) quote = "You have conquered your own weakness. I am proud to guide such dedicated spirit.";
    if (mentor.id === MentorId.ENFORCER_MOM) quote = "THAT'S MY BRILLIANT WARRIOR! You make me so proud! Clean up the rest of these goals!";
    if (mentor.id === MentorId.STEVEN_HE) quote = "What? Asian Standard achieved! You are starting to look like a real doctor! No emotional damage today.";
  } else if (level === 5) {
    if (mentor.id === MentorId.COOL_BROTHER) quote = "We've reached the absolute summit, brother. Elite status secured. Nothing can block our sight.";
    if (mentor.id === MentorId.SAVAGE_SISTER) quote = "The supreme lazy has officially evolved into an ultimate conqueror. You're simply the best.";
    if (mentor.id === MentorId.STRICT_FATHER) quote = "You have achieved absolute mastery of self. There are no excuses, only flawless execution.";
    if (mentor.id === MentorId.ENFORCER_MOM) quote = "UNMATCHED DISCIPLINE! The entire neighborhood is jealous! You are truly the ultimate master!";
    if (mentor.id === MentorId.STEVEN_HE) quote = "TIMMY IS CRYING IN THE CORNER! You have achieved absolute focus sovereignty! EMOTIONAL HEALING!!!";
  }

  // 2. Visual Flair (Enhance Glowing borders, active shadow, colors, title etc.)
  let glowingBorder = mentor.glowingBorder;
  
  if (level >= 2) {
    glowingBorder = `${glowingBorder} ring-1 ring-${mentor.id === MentorId.COOL_BROTHER ? 'emerald' : mentor.id === MentorId.SAVAGE_SISTER ? 'pink' : mentor.id === MentorId.STRICT_FATHER ? 'purple' : mentor.id === MentorId.STEVEN_HE ? 'amber' : 'red'}-500/40`;
  }
  if (level >= 3) {
    glowingBorder = `${glowingBorder} ring-2 ring-offset-1 ring-offset-black ring-${mentor.id === MentorId.COOL_BROTHER ? 'emerald' : mentor.id === MentorId.SAVAGE_SISTER ? 'pink' : mentor.id === MentorId.STRICT_FATHER ? 'purple' : mentor.id === MentorId.STEVEN_HE ? 'amber' : 'red'}-400/60 shadow-[0_0_20px_rgba(123,46,255,0.4)]`;
  }
  if (level >= 4) {
    glowingBorder = `${glowingBorder} animate-pulse shadow-[0_0_25px_${mentor.accentColor}]`;
  }
  if (level === 5) {
    glowingBorder = `shadow-[0_0_35px_rgba(234,179,8,0.7)] border-yellow-500 ring-2 ring-yellow-400 ring-offset-2 ring-offset-black font-semibold`;
  }

  // 3. More complex or enhanced rules
  let rules = [...mentor.rules];
  if (level >= 2) {
    rules.push(`[Unlock Level 2]: Quick support reminders enabled.`);
  }
  if (level >= 3) {
    rules.push(`[Unlock Level 3]: Hyperfocus energy unlocked.`);
  }
  if (level === 5) {
    rules.push(`[Unlock Level 5]: Ultimate sovereignty! (+0.05 bonus multiplier).`);
  }

  return {
    ...mentor,
    level,
    exp,
    nextLevelExp: nextExpThreshold,
    levelTitle: customTitleSuffix,
    quote,
    glowingBorder,
    rules,
  };
}
