import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import { AuthHeader, AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Sign in · HumanFallback" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await currentUser();
  const { next } = await searchParams;
  if (user) {
    if (next && next.startsWith("/")) redirect(next);
    redirect(user.role === "provider" ? "/provider" : user.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <AuthShell>
      <AuthHeader
        title="Welcome back"
        subtitle="Sign in to delegate a task to a human, or to pick up work from an AI agent."
      />
      <LoginForm next={next} />
    </AuthShell>
  );
}
