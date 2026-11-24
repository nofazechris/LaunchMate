import { notFound } from "next/navigation";
import CartView from "@/components/store/CartView";
import { css } from "@/lib/css";
import { getVisibleStore } from "@/server/storefront";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your cart", robots: { index: false } };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const store = await getVisibleStore(slug);
  if (!store) return null;
  return (
    <div style={css("display:flex;flex-direction:column;gap:22px")}>
      <h1 style={css("margin:0;font-size:clamp(26px,3.4vw,36px);letter-spacing:-.025em;font-weight:600")}>Your cart</h1>
      <CartView slug={slug} storeName={store.name} />
    </div>
  );
}
