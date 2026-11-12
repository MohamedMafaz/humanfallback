import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import { db, publicUser } from "@/lib/store";
import { TopBar } from "@/components/shell/TopBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/login");

  const notes = db()
    .notifications.filter((n) => n.userId === user.id)
    .slice(0, 8);

  return (
    <div className="min-h-dvh p-2.5 md:p-5">
      <div className="mx-auto max-w-[1460px]">
        <div className="shell p-2.5 md:p-3.5">
          <TopBar user={publicUser(user)} notifications={notes} />
          <main className="overflow-x-clip px-0.5 pb-3 pt-4 md:px-1.5">{children}</main>
        </div>
      </div>
    </div>
  );
}
