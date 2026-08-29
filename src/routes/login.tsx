import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { Field } from "@/components/ios/Field";
import { Pressable, spring } from "@/components/ios/press";
import { createDemoSession, DEMO_EMAIL, DEMO_PASSWORD, hasDemoSession } from "@/lib/demo-session";
import logo from "@/assets/brand/medrise-logo.png.asset.json";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in · MedRise" },
      { name: "description", content: "Sign in to MedRise and continue your courses." },
      { property: "og:title", content: "Sign in · MedRise" },
      { property: "og:description", content: "Continue learning with MedRise." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();
  const router = useRouter();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  useEffect(() => {
    if (hasDemoSession()) void navigate({ to: "/courses", replace: true });
    else void router.preloadRoute({ to: "/courses" });
  }, [navigate, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status !== "idle") return;
    setError(null);
    setStatus("loading");

    if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      setError("Incorrect email or password.");
      setStatus("idle");
      return;
    }

    createDemoSession();
    setStatus("success");
    await navigate({ to: "/courses", replace: true });
  };

  const loading = status === "loading";
  const success = status === "success";

  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 pt-12 pb-12 safe-top safe-bottom">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="relative z-10 flex w-full max-w-sm flex-col justify-center gap-[clamp(1rem,3.5vh,1.75rem)]"
      >
        <header className="flex flex-col items-center text-center">
          <img
  src="https://files.catbox.moe/0yyb3c.jpg"
  alt="MedRise"
  width={1024}
  height={1024}
  className="h-[clamp(4.5rem,13vh,6.5rem)] w-full object-contain"
/>          <h1 className="mt-[clamp(0.5rem,2vh,1rem)] text-[clamp(1.75rem,5.5vw,2.125rem)] leading-tight font-bold tracking-tight">Welcome Back, <br />
            MedRise Student</h1>
        </header>

        <form onSubmit={handleSubmit} className="rounded-3xl p-[clamp(0.875rem,2.5vh,1.25rem)]">
          <div className="space-y-3">
            <Field label="Email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Field label="Password" reveal autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="mt-3 text-center text-[0.875rem] font-medium text-destructive">{error}</p>}
          <Pressable type="submit" disabled={loading || success} className="mt-[clamp(0.875rem,2.5vh,1.25rem)] gap-2 disabled:opacity-100">
            {loading && <span className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent" />}
            {success && <span className="grid size-5 place-items-center rounded-full bg-mint text-primary-foreground"><Check className="size-3.5" strokeWidth={3.5} /></span>}
            {success ? "Signed in" : loading ? "Logging in…" : "Login"}
          </Pressable>
          <button type="button" className="mt-3 w-full text-center text-[0.9375rem] font-medium text-primary">Forgot password?</button>
        </form>
      </motion.div>
    </main>
  );
}
