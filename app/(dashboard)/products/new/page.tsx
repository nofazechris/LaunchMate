import Link from "next/link";
import ProductForm from "@/components/products/ProductForm";
import { css } from "@/lib/css";
import { requireSession } from "@/lib/session";
import { getBusinessForUser } from "@/server/business";

export const metadata = { title: "Add product · Launchmate" };

export default async function Page() {
  const { user } = await requireSession();
  const business = (await getBusinessForUser(user.id))!;
  return (
    <div style={css("padding:28px;display:flex;flex-direction:column;gap:20px;max-width:760px;width:100%;animation:lmIn .35s ease-out")}>
      <div style={css("display:flex;flex-direction:column;gap:6px")}>
        <Link href="/products" style={css("font-size:13px;color:#5E6862")}>← Products</Link>
        <h1 style={css("margin:0;font-size:26px;letter-spacing:-.02em;font-weight:600")}>Add a product</h1>
        <span style={css("font-size:14px;color:#78817B")}>Start with the basics. You can edit everything later.</span>
      </div>
      <ProductForm currency={business.currency} />
    </div>
  );
}
