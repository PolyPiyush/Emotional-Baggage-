/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum MentorId {
  COOL_BROTHER = "cool_brother",
  SAVAGE_SISTER = "savage_sister",
  STRICT_FATHER = "strict_father",
  ENFORCER_MOM = "enforcer_mom",
  STEVEN_HE = "steven_he"
}

export interface Mentor {
  id: MentorId;
  name: string;
  avatar: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Extreme";
  personality: string;
  rules: string[];
  rewards: string[];
  penalties: string[];
  multiplier: number;
  maxMultiplier: number;
  quote: string;
  theme: string; // Tailwind class name or custom color
  accentColor: string; // hex
  glowingBorder: string;
  remindersCount: number;
  level?: number;
  exp?: number;
  nextLevelExp?: number;
  levelTitle?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "high" | "normal";
  category: "Study" | "Coding" | "Fitness" | "Design" | "Life" | "Uncategorized";
  dueDate: string;
  completed: boolean;
  createdAt: string;
}

export interface MicroGoal {
  id: string;
  title: string;
  timeframe: "monthly" | "weekly" | "daily" | "micro";
  completed: boolean;
}

export interface RewardItem {
  id: string;
  name: string;
  category: "Upgrades" | "Analytics" | "Themes" | "Widgets" | "Skins" | "Decorations" | "Avatars" | "Animations" | "Frames";
  cost: number;
  description: string;
  icon: string;
  locked: boolean;
  progress?: number; // e.g. 50% unlocked via task count
  unlockedAt?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "mentor" | "system";
  text: string;
  timestamp: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  checklist?: { text: string; checked: boolean }[];
  isVoiceMock?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppBlockerSettings {
  enabled: boolean;
  blockedApps: string[]; // e.g. ["Instagram", "TikTok"]
  remindersRemaining: number;
  distractionActive: boolean;
  activeDistractionApp: string | null;
}

export interface UserStats {
  kp: number;
  multiplier: number;
  level: number;
  dailyStreak: number;
  weeklyStreak: number;
  monthlyStreak: number;
  totalFocusedMinutes: number;
  pomodoroSessions: number;
  tasksCompleted: number;
  distractionsBlocked: number;
}

export interface OnboardingState {
  currentStep: "auth" | "goal_setup" | "commitment_setup" | "mentor_selection" | "app";
  userEmail: string;
  mainGoal: string;
  goalDescription: string;
  startDate: string;
  endDate: string;
  expectedOutcome: string;
  dailyCommitmentHours: number;
  selectedMentorId: MentorId;
}
