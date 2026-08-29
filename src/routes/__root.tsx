import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { applyAppearance, readAppearance } from "../lib/appearance";

const siteUrl = "https://medrisextest.vercel.app";
const siteIcon = `${siteUrl}/favicon.png`;
const socialImage = "https://files.catbox.moe/0yyb3c.jpg";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>

        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  console.error(error);

  const router = useRouter();

  useEffect(() => {
    reportLovableError(error, {
      boundary: "tanstack_root_error_component",
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back
          home.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>

          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route =
  createRootRouteWithContext<{ queryClient: QueryClient }>()({
    head: () => ({
      meta: [
        {
          charSet: "utf-8",
        },
        {
          name: "viewport",
          content:
            "width=device-width, initial-scale=1, viewport-fit=cover",
        },

        // Basic SEO
        {
          title: "MedRise Learn",
        },
        {
          name: "description",
          content:
            "A calm, Apple-inspired learning app for science and medical students.",
        },

        // Apple / mobile
        {
          name: "apple-mobile-web-app-capable",
          content: "yes",
        },
        {
          name: "mobile-web-app-capable",
          content: "yes",
        },

        // Open Graph
        {
          property: "og:title",
          content: "MedRise Learn",
        },
        {
          property: "og:description",
          content:
            "A calm, Apple-inspired learning app for science and medical students.",
        },
        {
          property: "og:type",
          content: "website",
        },
        {
          property: "og:site_name",
          content: "MedRise",
        },
        {
          property: "og:url",
          content: siteUrl,
        },
        {
          property: "og:image",
          content: socialImage,
        },
        {
          property: "og:image:type",
          content: "image/jpeg",
        },
        {
          property: "og:image:alt",
          content: "MedRise Learn",
        },

        // Twitter / X
        {
          name: "twitter:card",
          content: "summary_large_image",
        },
        {
          name: "twitter:title",
          content: "MedRise Learn",
        },
        {
          name: "twitter:description",
          content:
            "A calm, Apple-inspired learning app for science and medical students.",
        },
        {
          name: "twitter:image",
          content: socialImage,
        },
      ],

      links: [
        // Main stylesheet
        {
          rel: "stylesheet",
          href: appCss,
        },

        // Explicit favicon declarations
        {
          rel: "icon",
          href: siteIcon,
          type: "image/png",
          sizes: "512x512",
        },
        {
          rel: "shortcut icon",
          href: siteIcon,
          type: "image/png",
        },
        {
          rel: "apple-touch-icon",
          href: siteIcon,
          sizes: "512x512",
        },
      ],

      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "MedRise",
            url: siteUrl,
            logo: siteIcon,
            description:
              "A bilingual learning platform for science students in Lebanon, including Lebanese University first-year subjects and medical entrance exam preparation.",
          }),
        },

        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "MedRise",
            url: siteUrl,
            inLanguage: ["en", "ar"],
          }),
        },
      ],
    }),

    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  });

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>

      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    applyAppearance(readAppearance());

    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const onChange = () => {
      applyAppearance(readAppearance());
    };

    mq.addEventListener("change", onChange);

    return () => {
      mq.removeEventListener("change", onChange);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
