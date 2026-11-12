import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import { db, publicUser } from "@/lib/store";
import { PageHeader } from "@/components/shell/PageHeader";
import { MarketplaceClient } from "@/components/marketplace/MarketplaceClient";

export const metadata = { title: "Marketplace · HumanFallback" };

export default async function MarketplacePage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const providers = db()
    .users.filter((u) => u.role === "provider")
    .map((p) => publicUser(p))
    .sort((a, b) => b.rating - a.rating);

  return (
    <div>
      <PageHeader
        eyebrow="Marketplace"
        title="Humans who can do what agents can’t"
        subtitle="Every provider here can be hired by an agent. Prices are listed per service; the platform fee is added at checkout."
      />
      <MarketplaceClient providers={providers} />
    </div>
  );
}
