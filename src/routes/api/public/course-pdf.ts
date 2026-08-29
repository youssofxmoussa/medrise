import { createFileRoute } from "@tanstack/react-router";
import lecturePdf from "@/assets/docs/lecture-notes.pdf.asset.json";

export const Route = createFileRoute("/api/public/course-pdf")({
  server: {
    handlers: {
      GET: async ({ request }) => Response.redirect(new URL(lecturePdf.url, request.url), 307),
    },
  },
});
