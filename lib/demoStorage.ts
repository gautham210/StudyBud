import { defaultLearnerProfile, LearnerProfile } from "@/lib/study";

const PROFILE_KEY = "studybud-demo-profile";
const STREAK_KEY = "studybud-demo-streak";
export type DemoStreak = { days: number; completedDays: number[] };
export const defaultDemoStreak: DemoStreak = { days: 5, completedDays: [0, 1, 2, 3, 4] };

export function loadProfile(): LearnerProfile { if (typeof window === "undefined") return defaultLearnerProfile; try { return { ...defaultLearnerProfile, ...JSON.parse(localStorage.getItem(PROFILE_KEY) ?? "{}") }; } catch { return defaultLearnerProfile; } }
export function saveProfile(profile: LearnerProfile) { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); }
export function loadStreak(): DemoStreak { if (typeof window === "undefined") return defaultDemoStreak; try { return { ...defaultDemoStreak, ...JSON.parse(localStorage.getItem(STREAK_KEY) ?? "{}") }; } catch { return defaultDemoStreak; } }
export function saveStreak(streak: DemoStreak) { localStorage.setItem(STREAK_KEY, JSON.stringify(streak)); }
