import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import { publicUser } from "@/lib/store";
import { PageHeader } from "@/components/shell/PageHeader";
import { WorkspaceClient } from "@/components/workspace/WorkspaceClient";
import { Badge } from "@/components/ui";
import { Sparkles } from "lucide-react";

export const metadata = { title: "Agent workspace · HumanFallback" };

export default async function WorkspacePage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  return (
    <div>
      <PageHeader
        eyebrow="Delegate"
        title="Agent workspace"
        subtitle="Describe a real-world task. The agent structures it, ranks humans nearby, and prepares a payment for your approval."
        actions={
          <Badge tone="neutral" className="hidden sm:inline-flex">
            <Sparkles size={11} className="text-brand" /> two models · text + vision
          </Badge>
        }
      />
      <WorkspaceClient user={publicUser(user)} />
    </div>
  );
}
