import OnboardingScreen from "@/components/screens/OnboardingScreen";
import { requireSession } from "@/lib/session";

export const metadata = { title: "New business · Launchmate" };

export default async function Page() {
  const { user } = await requireSession();
  return <OnboardingScreen userName={user.name} />;
}
