import Shell from "@/components/Shell";
import { requireSession } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireSession();
  return <Shell userName={user.name}>{children}</Shell>;
}
