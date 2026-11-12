"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ClipboardList,
  LayoutGrid,
  LogOut,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import type { Notification, PublicUser } from "@/types";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui";
import { Logo } from "@/components/brand/Logo";
import { timeAgo } from "@/lib/money";

const NAV = {
  customer: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/workspace", label: "Agent workspace", icon: Sparkles },
    { href: "/marketplace", label: "Marketplace", icon: Users },
    { href: "/tasks", label: "Tasks", icon: ClipboardList },
  ],
  provider: [
    { href: "/provider", label: "Provider desk", icon: Store },
    { href: "/marketplace", label: "Marketplace", icon: Users },
    { href: "/tasks", label: "Tasks", icon: ClipboardList },
  ],
  admin: [
    { href: "/admin", label: "Operations", icon: ShieldCheck },
    { href: "/marketplace", label: "Marketplace", icon: Users },
    { href: "/tasks", label: "Tasks", icon: ClipboardList },
  ],
};

export function TopBar({
  user,
  notifications,
}: {
  user: PublicUser;
  notifications: Notification[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState<"none" | "bell" | "user">("none");
  const [mobileMenu, setMobileMenu] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.read).length;
  const nav = NAV[user.role] ?? NAV.customer;

  useEffect(() => {
    setMenu("none");
    setMobileMenu(false);
  }, [pathname]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setMenu("none");
        setMobileMenu(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div
      ref={rootRef}
      className="relative z-30 flex flex-col gap-3 rounded-[26px] border border-line-soft bg-white/90 px-3 py-2.5 shadow-[0_1px_2px_rgba(23,19,15,0.03)] md:flex-row md:items-center md:justify-between md:px-4"
    >
      <div className="flex items-center justify-between gap-3">
        <Link href={user.role === "provider" ? "/provider" : user.role === "admin" ? "/admin" : "/dashboard"}>
          <Logo size={28} withWordmark />
        </Link>
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMenu(menu === "bell" ? "none" : "bell")}
            className="relative rounded-full border border-line bg-white p-2 text-ink-2"
            aria-label="Notifications"
          >
            <Bell size={16} />
            {unread > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-semibold text-white">
                {unread}
              </span>
            ) : null}
          </button>
          <button
            onClick={() => setMobileMenu((v) => !v)}
            aria-label="Account menu"
            className="rounded-full ring-offset-2 transition hover:ring-2 hover:ring-line"
          >
            <Avatar name={user.name} tone={user.tone} size={34} />
          </button>
        </div>
      </div>
      <nav className="scroll-slim -mx-1 flex w-full min-w-0 items-center gap-1 overflow-x-auto px-1 pb-0.5 md:mx-0 md:w-auto md:justify-center md:overflow-visible md:pb-0">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} className="nav-pill shrink-0" data-active={active}>
              <item.icon size={15} strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden items-center gap-2 md:flex">        <Link
          href="/marketplace"
          className="flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-[12.5px] text-muted transition hover:border-[#ffcbb4] hover:text-ink"
        >
          <Search size={14} />
          Find a human
        </Link>

        <div className="relative">
          <button
            onClick={() => setMenu(menu === "bell" ? "none" : "bell")}
            className={cn(
              "relative rounded-full border p-2.5 transition",
              menu === "bell"
                ? "border-[#ffcbb4] bg-brand-tint text-ink"
                : "border-line bg-white text-ink-2 hover:text-ink",
            )}
            aria-label="Notifications"
          >
            <Bell size={16} />
            {unread > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-semibold text-white">
                {unread}
              </span>
            ) : null}
          </button>

          {menu === "bell" ? (
            <div className="absolute right-0 top-12 w-[340px] overflow-hidden rounded-[22px] border border-line bg-white p-2 shadow-[0_24px_60px_-20px_rgba(23,19,15,0.35)]">
              <div className="flex items-center justify-between px-2 py-1.5">
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Notifications
                </p>
                <span className="text-[11px] text-muted">{notifications.length}</span>
              </div>
              <div className="max-h-[320px] overflow-y-auto scroll-slim">
                {notifications.length === 0 ? (
                  <p className="px-3 py-6 text-center text-[12.5px] text-muted">
                    Nothing yet. Your agent will ping you here.
                  </p>
                ) : (
                  notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.taskId ? `/tasks/${n.taskId}` : "#"}
                      className="block rounded-[16px] px-3 py-2.5 transition hover:bg-[#faf7f2]"
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className={cn(
                            "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                            n.read ? "bg-line" : "bg-brand",
                          )}
                        />
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium leading-tight">{n.title}</p>
                          <p className="mt-0.5 line-clamp-2 text-[11.5px] text-muted">{n.body}</p>
                          <p className="mt-1 text-[10.5px] text-muted/80">{timeAgo(n.createdAt)}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative">
          <button
            onClick={() => setMenu(menu === "user" ? "none" : "user")}
            className="flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-3 transition hover:border-[#ffcbb4]"
          >
            <Avatar name={user.name} tone={user.tone} size={30} />
            <span className="max-w-[110px] truncate text-[12.5px] font-medium">
              {user.name.split(" ")[0]}
            </span>
          </button>

          {menu === "user" ? (
            <div className="absolute right-0 top-12 w-[230px] overflow-hidden rounded-[20px] border border-line bg-white p-1.5 shadow-[0_24px_60px_-20px_rgba(23,19,15,0.35)]">
              <div className="px-3 py-2">
                <p className="truncate text-[13px] font-medium">{user.name}</p>
                <p className="truncate text-[11px] text-muted">{user.email}</p>
              </div>
              <div className="hairline my-1" />
              <Link
                href="/transactions"
                className="flex items-center gap-2 rounded-[14px] px-3 py-2 text-[13px] transition hover:bg-[#faf7f2]"
              >
                <ClipboardList size={14} /> Transactions
              </Link>
              {user.role === "provider" ? (
                <Link
                  href="/provider"
                  className="flex items-center gap-2 rounded-[14px] px-3 py-2 text-[13px] transition hover:bg-[#faf7f2]"
                >
                  <Store size={14} /> Provider desk
                </Link>
              ) : null}
              {user.role === "admin" ? (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 rounded-[14px] px-3 py-2 text-[13px] transition hover:bg-[#faf7f2]"
                >
                  <ShieldCheck size={14} /> Operations
                </Link>
              ) : null}
              <button
                onClick={signOut}
                className="flex w-full items-center gap-2 rounded-[14px] px-3 py-2 text-left text-[13px] text-danger transition hover:bg-danger-soft"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {mobileMenu ? (
        <div className="absolute right-3 top-[62px] z-40 w-[220px] overflow-hidden rounded-[20px] border border-line bg-white p-1.5 shadow-[0_24px_60px_-20px_rgba(23,19,15,0.35)] md:hidden">
          <div className="px-3 py-1.5">
            <p className="truncate text-[13px] font-medium">{user.name}</p>
            <p className="truncate text-[11px] text-muted">{user.email}</p>
          </div>
          <div className="hairline my-1" />
          <Link href="/transactions" className="flex items-center gap-2 rounded-[14px] px-3 py-2 text-[13px] hover:bg-[#faf7f2]">
            <ClipboardList size={14} /> Transactions
          </Link>
          {user.role === "provider" ? (
            <Link href="/provider" className="flex items-center gap-2 rounded-[14px] px-3 py-2 text-[13px] hover:bg-[#faf7f2]">
              <Store size={14} /> Provider desk
            </Link>
          ) : null}
          {user.role === "admin" ? (
            <Link href="/admin" className="flex items-center gap-2 rounded-[14px] px-3 py-2 text-[13px] hover:bg-[#faf7f2]">
              <ShieldCheck size={14} /> Operations
            </Link>
          ) : null}
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-[14px] px-3 py-2 text-left text-[13px] text-danger hover:bg-danger-soft"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
