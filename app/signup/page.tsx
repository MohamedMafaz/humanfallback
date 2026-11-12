import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import { AuthHeader, AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata = { title: "Create an account · HumanFallback" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await currentUser();
  const { next } = await searchParams;
  if (user) redirect(next && next.startsWith("/") ? next : "/dashboard");

  return (
    <AuthShell>
      <AuthHeader
        title="Create an account"
        subtitle="Start delegating real-world work to verified people — or get paid to do it."
      />
      <SignupForm next={next} />
    </AuthShell>
  );
}
