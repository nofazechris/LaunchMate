import { useLaunchmate } from "@/components/LaunchmateProvider";

/** The four most recent agent actions, shown on Overview and in the Agent sidebar. */
export function useActivityShort() {
  const { restock } = useLaunchmate();
  return [
    restock === "pending"
      ? null
      : { t: restock === "approved" ? "Placed restock order with Itoku Textiles (₦64,000)" : "Cancelled restock request", time: "Just now" },
    { t: "Drafted dispatch label for #LM-1048", time: "10:43" },
    { t: "Sent delivery update to Kemi Bello", time: "09:20" },
    { t: "Flagged Eleko Silk Scarf as low stock", time: "Yesterday" },
  ].filter((x): x is { t: string; time: string } => !!x).slice(0, 4);
}
