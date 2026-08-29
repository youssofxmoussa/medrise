import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  Bookmark,
  ChevronRight,
  LogOut,
  Moon,
  ShieldCheck,
  Trash2,
  Info,
  Flame,
} from "lucide-react";
import { spring } from "@/components/ios/press";
import { ConfirmSheet } from "@/components/ios/ConfirmSheet";


import { courses } from "@/lib/courses";
import { clearDemoSession } from "@/lib/demo-session";

export const Route = createFileRoute("/_tabs/me")({
  head: () => ({
    meta: [
      { title: "Profile · MedRise" },
      {
        name: "description",
        content: "Manage your MedRise profile, appearance, notifications, and privacy settings.",
      },
      { property: "og:title", content: "Profile · MedRise" },
      { property: "og:description", content: "Your account and app preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Me,
});

const GOAL_KEY = "medrise_daily_goal";
const SAVED_KEY = "medrise_saved_videos";
const GOALS = [15, 30, 45, 60] as const;

function Me() {
  const navigate = useNavigate();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [goal, setGoal] = useState<number>(30);
  const [expanded, setExpanded] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cleared, setCleared] = useState(false);

  const savedCount = savedIds.length;
  const savedCourses = savedIds
    .map((id) => courses.find((c) => c.id.toLowerCase() === id.toLowerCase()))
    .filter((c): c is (typeof courses)[number] => Boolean(c));

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]") as string[];
      setSavedIds(saved);
      const storedGoal = Number(localStorage.getItem(GOAL_KEY));
      if (storedGoal) setGoal(storedGoal);
    } catch {
      /* ignore */
    }
  }, []);

  const pickGoal = (value: number) => {
    setGoal(value);
    try {
      localStorage.setItem(GOAL_KEY, String(value));
    } catch {
      /* ignore */
    }
  };

  const clearLocalData = () => {
    try {
      localStorage.removeItem(SAVED_KEY);
    } catch {
      /* ignore */
    }
    setSavedIds([]);
    setExpanded(false);
    setConfirmOpen(false);
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  };

  const rows = [
    { label: "Notifications", icon: Bell, to: "/notifications" as const },
    { label: "Appearance", icon: Moon, to: "/appearance" as const },
    { label: "Privacy", icon: ShieldCheck, to: "/privacy" as const },
  ];

  return (
    <div className="pb-32 pt-6">
      <h1 className="text-large-title">Me</h1>

      <section className="material mt-5 flex items-center gap-4 rounded-3xl p-5 shadow-soft">
        <div className="grid size-14 shrink-0 place-items-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
          Q
        </div>
        <div className="min-w-0">
          <p className="truncate text-[1.0625rem] font-semibold">Qutayba</p>
          <p className="truncate text-[0.9375rem] text-muted-foreground">Premium · since 2025</p>
        </div>
      </section>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="Subjects" value={String(courses.length)} />
        <Stat label="Saved" value={String(savedCount)} />
        <Stat label="Daily goal" value={`${goal}m`} />
      </div>

      <h2 className="mt-6 px-2 text-[0.75rem] font-bold uppercase tracking-widest text-muted-foreground">
        Daily study goal
      </h2>
      <div className="clay mt-2 grid grid-cols-4 gap-2 rounded-3xl p-2">
        {GOALS.map((value) => (
          <button
            key={value}
            onClick={() => pickGoal(value)}
            className={`rounded-2xl py-3 text-[0.875rem] font-bold transition-all active:scale-95 ${
              goal === value
                ? "bg-primary text-primary-foreground shadow-soft"
                : "bg-secondary/50 text-foreground"
            }`}
          >
            {value}m
          </button>
        ))}
      </div>

      <h2 className="mt-6 px-2 text-[0.75rem] font-bold uppercase tracking-widest text-muted-foreground">
        Preferences
      </h2>
      <div className="clay mt-2 divide-y divide-border rounded-2xl">
        {rows.map(({ label, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            preload="intent"
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors first:rounded-t-2xl last:rounded-b-2xl active:bg-secondary/60"
          >
            <Icon className="size-5 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate text-[1.0625rem]">{label}</span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <h2 className="mt-6 px-2 text-[0.75rem] font-bold uppercase tracking-widest text-muted-foreground">
        Storage
      </h2>
      <div className="clay mt-2 divide-y divide-border rounded-2xl">
        <button
          onClick={() => savedCount > 0 && setExpanded((v) => !v)}
          className="flex w-full items-center gap-3 rounded-t-2xl px-4 py-3.5 text-left transition-colors active:bg-secondary/60"
        >
          <Bookmark className="size-5 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate text-[1.0625rem]">Saved subjects</span>
          <span className="text-[0.9375rem] font-medium text-muted-foreground">{savedCount}</span>
          {savedCount > 0 && (
            <motion.span animate={{ rotate: expanded ? 90 : 0 }} transition={spring}>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground/60" />
            </motion.span>
          )}
        </button>

        <AnimatePresence initial={false}>
          {expanded && savedCount > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
              className="overflow-hidden"
            >
              {savedCourses.map((c) => (
                <Link
                  key={c.id}
                  to="/subject/$courseId"
                  params={{ courseId: c.id }}
                  className="flex items-center gap-3 px-4 py-3 pl-6 transition-colors active:bg-secondary/60"
                >
                  {c.image ? (
                    <img src={c.image} alt="" className="size-8 shrink-0 object-contain" />
                  ) : (
                    <span className="size-8 shrink-0" />
                  )}
                  <span className="min-w-0 flex-1 truncate text-[0.9375rem]">{c.title}</span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground/50" />
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setConfirmOpen(true)}
          disabled={savedCount === 0}
          className="flex w-full items-center gap-3 rounded-b-2xl px-4 py-3.5 text-left transition-colors active:bg-secondary/60 disabled:opacity-50"
        >
          <Trash2 className="size-5 shrink-0 text-destructive" />
          <span className="min-w-0 flex-1 truncate text-[1.0625rem] text-destructive">
            {cleared ? "Cleared" : "Clear saved items"}
          </span>
        </button>
      </div>

      <ConfirmSheet
        open={confirmOpen}
        title="Clear saved items?"
        message="This removes every saved subject from this device. It can't be undone."
        confirmLabel="Delete"
        onConfirm={clearLocalData}
        onCancel={() => setConfirmOpen(false)}
      />

      <motion.div whileTap={{ scale: 0.97 }} transition={spring}>
        <Link
          to="/streak"
          preload="render"
          className="clay mt-4 flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left"
        >
          <Flame className="size-5 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate text-[1.0625rem]">About Streak</span>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </Link>
      </motion.div>


      <div className="clay mt-3 flex items-center gap-3 rounded-2xl px-4 py-3.5">
        <Info className="size-5 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate text-[1.0625rem]">Version</span>
        <span className="text-[0.9375rem] font-medium text-muted-foreground">1.0.0</span>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        transition={spring}
        onClick={() => {
          clearDemoSession();
          void navigate({ to: "/login", replace: true });
        }}
        className="clay mt-6 flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left"
      >
        <LogOut className="size-5 shrink-0 text-destructive" />
        <span className="min-w-0 flex-1 truncate text-[1.0625rem] text-destructive">Sign out</span>
      </motion.button>

    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="clay flex flex-col items-center justify-center gap-0.5 rounded-2xl py-3.5">
      <span className="text-[1.125rem] font-bold leading-none">{value}</span>
      <span className="text-[0.6875rem] font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
