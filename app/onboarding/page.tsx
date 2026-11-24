import { redirect } from "next/navigation";
import Onboarding from "@/components/onboarding/Onboarding";
import { requireSession } from "@/lib/session";
import { getBusinessForUser } from "@/server/business";

export const metadata = { title: "Set up your business · Launchmate" };

export default async function Page() {
  const { user } = await requireSession();
  if (await getBusinessForUser(user.id)) redirect("/overview"); // one business per user for now
  return <Onboarding userId={user.id} userName={user.name} />;
}
