import { redirect } from "next/navigation";
import OnboardingScreen from "@/components/screens/OnboardingScreen";
import { requireSession } from "@/lib/session";
import { getBusinessForUser } from "@/server/business";

export const metadata = { title: "New business · Launchmate" };

export default async function Page() {
  const { user } = await requireSession();
  if (await getBusinessForUser(user.id)) redirect("/overview"); // one business per user for now
  return <OnboardingScreen userName={user.name} />;
}
