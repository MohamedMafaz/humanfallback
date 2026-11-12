"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { DEMO_ACCOUNTS } from "@/lib/demo-accounts";
import { Avatar } from "@/components/ui";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(payload: { email: string; password: string }, key: string) {
    setBusy(key);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not sign in");
        setBusy(null);
        return;
      }
      router.push(next || (data.user.role === "provider" ? "/provider" : "/dashboard"));
      router.refresh();
    } catch {
      setError("Network error — try again.");
      setBusy(null);
    }
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit({ email, password }, "form");
        }}
        className="mt-7 space-y-3.5"
      >
        <label className="block">
          <span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="field"
            autoComplete="email"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">Password</span>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="field pr-11"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-ink"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </label>

        {error ? (
          <p className="rounded-[12px] bg-danger-soft px-3 py-2 text-[12px] text-danger">{error}</p>
        ) : null}

        <button type="submit" disabled={busy === "form"} className="btn btn-primary w-full py-3">
          {busy === "form" ? <Loader2 size={15} className="animate-spin" /> : null}
          Sign in
          <ArrowRight size={15} />
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[11px] uppercase tracking-[0.12em] text-muted">or use a demo role</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="space-y-2">
        {DEMO_ACCOUNTS.map((account) => (
          <button
            key={account.email}
            onClick={() => submit({ email: account.email, password: account.password }, account.email)}
            disabled={Boolean(busy)}
            className="flex w-full items-center gap-3 rounded-[16px] border border-line bg-white px-3 py-2.5 text-left transition hover:border-[#ffcbb4] hover:bg-brand-tint/40 disabled:opacity-60"
          >
            <Avatar
              name={account.label}
              tone={account.role === "provider" ? "sunset" : account.role === "admin" ? "clay" : "sand"}
              size={34}
            />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-medium">{account.label}</span>
              <span className="block truncate text-[11px] text-muted">{account.hint}</span>
            </span>
            {busy === account.email ? (
              <Loader2 size={14} className="animate-spin text-brand" />
            ) : (
              <ArrowRight size={14} className="text-muted" />
            )}
          </button>
        ))}
      </div>

      <p className="mt-6 text-center text-[12.5px] text-muted">
        New here?{" "}
        <Link href="/signup" className="font-medium text-brand hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
