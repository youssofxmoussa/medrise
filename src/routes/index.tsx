import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { hasDemoSession } from "@/lib/demo-session";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MedRise" },
      {
        name: "description",
        content:
          "Open MedRise and continue your courses.",
      },
      { property: "og:title", content: "MedRise Learn" },
      {
        property: "og:description",
        content: "Continue learning with MedRise — courses designed for focus.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EntryRedirect,
});

function EntryRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    void navigate({ to: hasDemoSession() ? "/courses" : "/login", replace: true });
  }, [navigate]);

  return <main className="min-h-[100dvh] bg-background" aria-label="Loading MedRise" />;
}
