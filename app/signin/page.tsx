import AuthScreen from "@/components/screens/AuthScreen";
import { dbNotice } from "@/lib/db-notice";

export const metadata = { title: "Sign in · Launchmate" };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const notice = (await dbNotice()) ?? (error === "unavailable" ? "We couldn't check your session just now. Please try signing in again." : undefined);
  return <AuthScreen mode="signin" notice={notice} />;
}
