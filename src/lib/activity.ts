import { useCallback, useEffect, useState } from "react";

export interface SubjectActivity {
  watchedSeconds: number;
  durationSeconds: number;
  pagesRead: number;
  totalPages: number;
  quizAnswered: number;
  quizCorrect: number;
  quizTotal: number;
  lastOpened: number;
}

export interface ActivityState {
  /** subjectId -> activity */
  subjects: Record<string, SubjectActivity>;
  /** YYYY-MM-DD -> minutes the app was open that day */
  days: Record<string, number>;
  /** YYYY-MM-DD -> seconds of real learning (video, PDF, quiz) that day */
  focus: Record<string, number>;
}

/** Seconds of real learning needed to earn a day of streak. */
export const STREAK_GOAL_SECONDS = 300;

export const ACTIVITY_KEY = "medrise_activity";
export const ACTIVITY_EVENT = "medrise:activity";

const emptyState: ActivityState = { subjects: {}, days: {}, focus: {} };

export const emptySubject: SubjectActivity = {
  watchedSeconds: 0,
  durationSeconds: 0,
  pagesRead: 0,
  totalPages: 0,
  quizAnswered: 0,
  quizCorrect: 0,
  quizTotal: 0,
  lastOpened: 0,
};

function dayKey(d: Date = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function readActivity(): ActivityState {
  if (typeof window === "undefined") return emptyState;
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    if (!raw) return emptyState;
    const parsed = JSON.parse(raw) as Partial<ActivityState>;
    return { subjects: parsed.subjects ?? {}, days: parsed.days ?? {}, focus: parsed.focus ?? {} };
  } catch {
    return emptyState;
  }
}

function writeActivity(state: ActivityState) {
  try {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(ACTIVITY_EVENT));
  }
}

export function getSubject(state: ActivityState, id: string): SubjectActivity {
  return { ...emptySubject, ...(state.subjects[id.toLowerCase()] ?? {}) };
}

/** Merge a patch into one subject's record. */
export function recordSubject(id: string, patch: Partial<SubjectActivity>) {
  if (typeof window === "undefined") return;
  const key = id.toLowerCase();
  const state = readActivity();
  const current = getSubject(state, key);
  const next: SubjectActivity = { ...current, ...patch, lastOpened: Date.now() };
  writeActivity({ ...state, subjects: { ...state.subjects, [key]: next } });
}

/** Add studied minutes to today's bucket (used for streak + weekly total). */
export function recordMinutes(minutes: number) {
  if (typeof window === "undefined" || minutes <= 0) return;
  const state = readActivity();
  const key = dayKey();
  const days = { ...state.days, [key]: (state.days[key] ?? 0) + minutes };
  writeActivity({ ...state, days });
}

export function clearActivity() {
  try {
    localStorage.removeItem(ACTIVITY_KEY);
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(ACTIVITY_EVENT));
}

/** Consecutive days (ending today or yesterday) with any recorded activity. */
export function earnedDay(state: ActivityState, d: Date = new Date()): boolean {
  return (state.focus[dayKey(d)] ?? 0) >= STREAK_GOAL_SECONDS;
}

/** Seconds of real learning recorded today. */
export function todayFocusSeconds(state: ActivityState): number {
  return Math.round(state.focus[dayKey()] ?? 0);
}

export function streakDays(state: ActivityState): number {
  let streak = 0;
  const cursor = new Date();
  if (!earnedDay(state, cursor)) {
    cursor.setDate(cursor.getDate() - 1);
    if (!earnedDay(state, cursor)) return 0;
  }
  while (earnedDay(state, cursor)) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Minutes studied over the last 7 days (today included). */
export function weekMinutes(state: ActivityState): number {
  let total = 0;
  const cursor = new Date();
  for (let i = 0; i < 7; i++) {
    total += state.days[dayKey(cursor)] ?? 0;
    cursor.setDate(cursor.getDate() - 1);
  }
  return Math.round(total);
}

export function formatMinutes(total: number): string {
  if (total > 0 && total < 1) return "<1m";
  const mins = Math.max(0, Math.round(total));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

/** Combined completion 0-100 across video, pdf and quiz signals. */
export function subjectProgress(a: SubjectActivity): number {
  const parts: number[] = [];
  if (a.durationSeconds > 0) parts.push(Math.min(1, a.watchedSeconds / a.durationSeconds));
  if (a.totalPages > 0) parts.push(Math.min(1, a.pagesRead / a.totalPages));
  if (a.quizTotal > 0) parts.push(Math.min(1, a.quizAnswered / a.quizTotal));
  if (parts.length === 0) return 0;
  return Math.round((parts.reduce((s, p) => s + p, 0) / parts.length) * 100);
}

/** Live view of the activity store; re-reads on write, focus and cross-tab change. */
export function useActivity(): ActivityState {
  const [state, setState] = useState<ActivityState>(emptyState);
  const sync = useCallback(() => setState(readActivity()), []);

  useEffect(() => {
    sync();
    const poll = window.setInterval(sync, 5000);
    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };
    window.addEventListener(ACTIVITY_EVENT, sync);
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(poll);
      window.removeEventListener(ACTIVITY_EVENT, sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [sync]);

  return state;
}

/** Add studied seconds to today's bucket (fractional minutes are kept). */
export function recordSeconds(seconds: number) {
  if (typeof window === "undefined" || seconds <= 0) return;
  const state = readActivity();
  const key = dayKey();
  const days = { ...state.days, [key]: (state.days[key] ?? 0) + seconds / 60 };
  writeActivity({ ...state, days });
}

/** Add seconds of real learning (video / PDF / quiz) to today's bucket. */
export function recordFocusSeconds(seconds: number) {
  if (typeof window === "undefined" || seconds <= 0) return;
  const state = readActivity();
  const key = dayKey();
  const focus = { ...state.focus, [key]: (state.focus[key] ?? 0) + seconds };
  writeActivity({ ...state, focus });
}

/**
 * Counts learning time while the user is actually on a lesson surface.
 * Only this time can earn a streak — simply opening the app does not.
 */
export function useFocusTimer(active: boolean, tickMs = 5000) {
  useEffect(() => {
    if (!active) return;
    let last = Date.now();

    const flush = () => {
      const now = Date.now();
      const elapsed = (now - last) / 1000;
      last = now;
      if (document.visibilityState === "visible" && elapsed > 0 && elapsed < 120) {
        recordFocusSeconds(elapsed);
      }
    };

    const id = window.setInterval(flush, tickMs);
    const onVisibility = () => {
      if (document.visibilityState === "visible") last = Date.now();
      else flush();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);

    return () => {
      flush();
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, [active, tickMs]);
}

/**
 * Counts time the app is actually open and visible, in real time.
 * Records every `tickMs` so streak + weekly minutes update live.
 */
export function useStudyTimer(tickMs = 5000) {
  useEffect(() => {
    let last = Date.now();

    const flush = () => {
      const now = Date.now();
      const elapsed = (now - last) / 1000;
      last = now;
      if (document.visibilityState === "visible" && elapsed > 0 && elapsed < 120) {
        recordSeconds(elapsed);
      }
    };

    const id = window.setInterval(flush, tickMs);
    const onVisibility = () => {
      if (document.visibilityState === "visible") last = Date.now();
      else flush();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);

    return () => {
      flush();
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, [tickMs]);
}
