"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

export function SignupForm({ next }: { next?: string }) {
  const router = useRouter();
  const [role, setRole] = useState<"customer" | "provider">("customer");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    headline: "",
    skills: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create the account");
        setBusy(false);
        return;
      }
      router.push(next && next.startsWith("/") ? next : role === "provider" ? "/provider" : "/workspace");
      router.refresh();
    } catch {
      setError("Network error — try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-7 space-y-3.5">
      <div className="grid grid-cols-2 gap-2 rounded-[16px] bg-[#f3efe9] p-1">
        {(
          [
            { key: "customer", label: "I’m hiring humans", hint: "Run an agent" },
            { key: "provider", label: "I do the work", hint: "Earn per task" },
          ] as const
        ).map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setRole(option.key)}
            className={
              role === option.key
                ? "rounded-[13px] bg-white px-3 py-2 text-left shadow-sm"
                : "rounded-[13px] px-3 py-2 text-left text-muted transition hover:text-ink"
            }
          >
            <span className="block text-[12.5px] font-medium">{option.label}</span>
            <span className="block text-[10.5px] opacity-70">{option.hint}</span>
          </button>
        ))}
      </div>

      <label className="block">
        <span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">Full name</span>
        <input
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Alex Rivera"
          className="field"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">Email</span>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="you@company.com"
          className="field"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">Password</span>
        <input
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          placeholder="At least 8 characters"
          className="field"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">
          {role === "provider" ? "Service area" : "Default task location"}
        </span>
        <input
          value={form.location}
          onChange={(e) => set("location", e.target.value)}
          placeholder="88 Market St, San Francisco"
          className="field"
        />
      </label>

      {role === "provider" ? (
        <>
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">Headline</span>
            <input
              value={form.headline}
              onChange={(e) => set("headline", e.target.value)}
              placeholder="Meter readings & building inspections"
              className="field"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">Skills</span>
            <input
              value={form.skills}
              onChange={(e) => set("skills", e.target.value)}
              placeholder="Photography, Meter reading, Errands"
              className="field"
            />
          </label>
        </>
      ) : null}

      {error ? (
        <p className="rounded-[12px] bg-danger-soft px-3 py-2 text-[12px] text-danger">{error}</p>
      ) : null}

      <button type="submit" disabled={busy} className="btn btn-primary w-full py-3">
        {busy ? <Loader2 size={15} className="animate-spin" /> : null}
        Create account
        <ArrowRight size={15} />
      </button>

      <p className="pt-1 text-center text-[12.5px] text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
