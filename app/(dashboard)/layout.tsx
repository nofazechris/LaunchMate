import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import { requireSession } from "@/lib/session";
import { getBusinessForUser } from "@/server/business";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireSession();
  const business = await getBusinessForUser(user.id);
  if (!business) redirect("/onboarding"); // no business yet: finish onboarding first
  return (
    <Shell userName={user.name} business={{ name: business.name, status: business.status }}>
      {children}
    </Shell>
  );
}
