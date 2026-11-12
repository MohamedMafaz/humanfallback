"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

const SUGGESTIONS = [
  {
    label: "Read my office meter · $10",
    prompt:
      "Photograph the electricity meter in my office and send me the reading. Budget $10.",
  },
  {
    label: "Photo a price tag at Best Buy",
    prompt:
      "Check whether the MacBook Air M3 is in stock at Best Buy and photo the price tag.",
  },
  {
    label: "Collect a signed lease today",
    prompt:
      "Collect the signed lease from my property manager and drop it at reception today.",
  },
];

export function HeroPrompt() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  function go(prompt: string) {
    const text = prompt.trim();
    if (!text) return;
    try {
      sessionStorage.setItem("hf.prompt", text);
    } catch {
      /* storage may be blocked */
    }
    router.push(`/login?next=${encodeURIComponent("/workspace")}`);
  }

  return (
    <div className="w-full max-w-[620px]">
      <div
        className="flex flex-col gap-2 rounded-[20px] border bg-white p-2 shadow-[0_20px_40px_-30px_rgba(23,19,15,0.5)] transition sm:flex-row sm:items-center sm:pl-4"
        style={{ borderColor: focused ? "#ffb694" : "var(--color-line)" }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 px-2 sm:px-0">
          <Sparkles size={16} className="shrink-0 text-brand" />
          <input
            value={value}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && go(value)}
            placeholder="Tell the agent what you need done…"
            className="min-w-0 flex-1 bg-transparent py-2 text-[14px] outline-none placeholder:text-[#a9a199]"
            aria-label="Describe a task"
          />
        </div>
        <button onClick={() => go(value)} className="btn btn-primary w-full px-4 py-2.5 sm:w-auto">
          Delegate
          <ArrowRight size={15} />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.prompt}
            onClick={() => {
              setValue(s.prompt);
              go(s.prompt);
            }}
            className="rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-left text-[11.5px] text-ink-2 backdrop-blur transition hover:border-[#ffcbb4] hover:bg-white"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
