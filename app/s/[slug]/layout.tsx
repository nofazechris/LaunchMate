import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CartLink } from "@/components/store/StoreWidgets";
import { css } from "@/lib/css";
import { getStore, isOpen, viewerOwns } from "@/server/storefront";

type Props = { children: React.ReactNode; params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const store = await getStore((await params).slug);
  if (!store || !isOpen(store)) return { title: "Store", robots: { index: false } };
  return { title: store.name, description: store.description ?? `Shop at ${store.name}` };
}

/** Frame shared by every page of a store. A closed store is invisible to the public; its owner sees a preview. */
export default async function StoreLayout({ children, params }: Props) {
  const slug = (await params).slug;
  const store = await getStore(slug);
  if (!store) notFound();

  const open = isOpen(store);
  const owner = await viewerOwns(store.id);

  if (!open && !owner) {
    return (
      <div style={css("min-height:100vh;display:grid;place-items:center;padding:24px;background:#FFFFFF;text-align:center")}>
        <div style={css("display:flex;flex-direction:column;gap:10px;max-width:420px")}>
          <h1 style={css("margin:0;font-size:26px;letter-spacing:-.02em;font-weight:600")}>{store.name}</h1>
          <p style={css("margin:0;color:#5E6862;line-height:1.5")}>This store isn&apos;t open yet. Please check back soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={css("min-height:100vh;background:#FFFFFF;color:#202723;display:flex;flex-direction:column")}>
      {!open && (
        <div role="note" style={css("background:#FBF3E6;color:#6B4A14;border-bottom:1px solid #EAD9BC;padding:8px 16px;font-size:13px;text-align:center")}>
          Preview: only you can see this. Your store isn&apos;t open to customers yet. <Link href="/store" style={css("color:#6B4A14;text-decoration:underline;font-weight:500")}>Open your store</Link>
        </div>
      )}
      <header style={css("border-bottom:1px solid #E8ECE8")}>
        <div style={css("max-width:1100px;margin:0 auto;padding:0 clamp(16px,3vw,28px);height:64px;display:flex;align-items:center;justify-content:space-between;gap:16px")}>
          <Link href={`/s/${slug}`} style={css("font-weight:600;font-size:17px;letter-spacing:.02em;color:#202723")}>{store.name}</Link>
          <CartLink slug={slug} />
        </div>
      </header>
      <main style={css("flex:1;max-width:1100px;width:100%;margin:0 auto;padding:clamp(20px,4vw,40px) clamp(16px,3vw,28px)")}>{children}</main>
      <footer style={css("border-top:1px solid #E8ECE8;padding:20px;text-align:center;font-size:12px;color:#78817B")}>
        {store.name} · Store powered by <Link href="/" style={css("color:#5E6862")}>Launchmate</Link>
      </footer>
    </div>
  );
}
