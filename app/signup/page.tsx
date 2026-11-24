import AuthScreen from "@/components/screens/AuthScreen";
import { dbNotice } from "@/lib/db-notice";

export const metadata = { title: "Create your account · Launchmate" };
export const dynamic = "force-dynamic";

export default async function Page() {
  return <AuthScreen mode="signup" notice={await dbNotice()} />;
}
