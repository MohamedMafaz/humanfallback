/** Demo personas shown on the sign-in screen. Safe to import from clients. */
export const DEMO_ACCOUNTS = [
  {
    email: "alex@humanfallback.ai",
    password: "demo1234",
    role: "customer" as const,
    label: "Alex Rivera",
    hint: "Buyer · runs the agent workspace",
  },
  {
    email: "priya@humanfallback.ai",
    password: "demo1234",
    role: "provider" as const,
    label: "Priya Raghavan",
    hint: "Human provider · earns on tasks",
  },
  {
    email: "admin@humanfallback.ai",
    password: "demo1234",
    role: "admin" as const,
    label: "Platform Admin",
    hint: "Ops · payments and disputes",
  },
];
