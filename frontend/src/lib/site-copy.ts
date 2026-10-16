export const siteCopy = {
  app: {
    description:
      "General-purpose full-stack app template with auth, protected flows, and production-ready defaults.",
  },
  hero: {
    badge: "Full-stack starter",
    title: "Build your next product from a solid full-stack base.",
    lead: "gives you a clean starting surface with a Next.js frontend, Go API, account flows, and adaptable product patterns that are ready to become your own experience.",
    primary: { label: "Open dashboard preview", href: "/dashboard" },
    secondary: { label: "Sign in", href: "/login" },
  },
  why: {
    facts: [
      "Next.js + Go foundation",
      "Auth and dashboard included",
      "Flexible sections ready to adapt",
      "Simple to customize",
    ],
    cards: [
      {
        key: "interface",
        title: "Reusable interface",
        description:
          "A polished frontend shell you can reshape without starting the design system from zero.",
      },
      {
        key: "backend",
        title: "Backend already wired",
        description:
          "Routes, data access, and protected flows are in place so the app feels connected from day one.",
      },
      {
        key: "private",
        title: "Safer private flows",
        description:
          "Login, owner access, and account recovery patterns are already present when your product needs them.",
      },
    ],
  },
  about: {
    eyebrow: "Why it lands well",
    title:
      "Focused on first impression, but still grounded in real product structure.",
    lead: "This home page keeps centered clarity, then adds product framing and reusable content blocks so the starter still feels useful once you begin customizing it.",
    highlights: [
      {
        step: "01",
        title: "Focused first impression",
        description: "Clear hero copy with one dominant action path.",
      },
      {
        step: "02",
        title: "Ready to expand",
        description:
          "Supporting sections hint at the system now and can grow into a fuller marketing page later.",
      },
    ],
  },
  featuredHighlights: [
    {
      title: "Next.js frontend",
      description: "App Router, TypeScript, and reusable UI primitives",
      category: "Frontend",
    },
    {
      title: "Go API",
      description: "Layered handlers, services, and repositories",
      category: "Backend",
    },
    {
      title: "Authentication",
      description: "Registration, login, verification, and password reset",
      category: "Account",
    },
    {
      title: "PostgreSQL",
      description: "Embedded migrations and local Docker setup",
      category: "Data",
    },
    {
      title: "Quality checks",
      description: "Lint, tests, builds, contracts, and browser smoke tests",
      category: "Tooling",
    },
  ],
  footer: {
    tagline:
      "A full-stack starter with a Next.js frontend, Go API, and auth-first flows you can reshape into your own product.",
    bottomNote: "Built to become your product.",
    stackNote: "Next.js UI · Go API · Auth and owner flows",
  },
} as const;
